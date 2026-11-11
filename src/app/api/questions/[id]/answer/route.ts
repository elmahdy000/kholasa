import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { rateLimit, withRetryAfter } from "@/lib/rate-limit";
import { QuestionService } from "@/services/question.service";
import { MistakeService } from "@/services/mistake.service";
import { getCurriculumScope, isSubjectInScope } from "@/lib/curriculum";
import { prisma } from "@/lib/prisma";
import { getCairoDayKey, calculateStreak } from "@/lib/date";
import { emitRealtimeEvent } from "@/lib/realtime";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    rateLimit(`answer:user:${user.id}`, 120, 60 * 1000);

    const { id: questionId } = await params;
    const body = await req.json().catch(() => ({}));
    const {
      selectedOptionId,
      isDailyChallenge,
      resolve,
      markForReview,
      essayText,
    } = body as {
      selectedOptionId?: string;
      isDailyChallenge?: boolean;
      resolve?: boolean;
      markForReview?: boolean;
      essayText?: string | null;
    };

    const question = await QuestionService.getQuestionForAnswer(questionId);

    if (!question || (question.status && question.status !== "PUBLISHED")) {
      return NextResponse.json(
        { error: "السؤال غير موجود" },
        { status: 404 }
      );
    }

    if (
      "subject" in question &&
      question.subject &&
      (!question.subject.isPublished ||
        ("isUnderConstruction" in question.subject &&
          question.subject.isUnderConstruction &&
          user.role !== "ADMIN" &&
          user.role !== "SUPER_ADMIN") ||
        !isSubjectInScope(getCurriculumScope(user), question.subject))
    ) {
      return NextResponse.json(
        { error: "هذا السؤال لا ينتمي لمسارك الدراسي المصرح به" },
        { status: 403 }
      );
    }

    const hasEssayDraft = essayText !== undefined && essayText !== null;

    // Student explicitly marks an essay question (or reopens a resolved question) for review in "مراجعة لأخطائي"
    if (markForReview) {
      await Promise.all([
        MistakeService.markForReview(user.id, questionId),
        prisma.questionAttempt.upsert({
          where: { userId_questionId: { userId: user.id, questionId } },
          update: {
            ...(hasEssayDraft ? { essayText: String(essayText) } : {}),
            isCorrect: false,
            updatedAt: new Date(),
          },
          create: {
            userId: user.id,
            questionId,
            ...(hasEssayDraft ? { essayText: String(essayText) } : {}),
            isCorrect: false,
          },
        }),
      ]);

      emitRealtimeEvent({
        topic: "analytics",
        action: "mistake_updated",
        audience: "user",
        targetUserId: user.id,
        entityId: questionId,
      });

      return NextResponse.json({
        success: true,
        markedForReview: true,
        isResolved: false,
        explanation: question.explanation,
        modelAnswer: question.rubric?.modelAnswer,
        modelAnswerTranslation: question.rubric?.modelAnswerTranslation,
      });
    }

    // Student explicitly confirms mastery / removes from active mistakes
    if (resolve) {
      await Promise.all([
        MistakeService.resolveMistake(user.id, questionId),
        prisma.questionAttempt.upsert({
          where: { userId_questionId: { userId: user.id, questionId } },
          update: {
            ...(hasEssayDraft ? { essayText: String(essayText) } : {}),
            isCorrect: true,
            updatedAt: new Date(),
          },
          create: {
            userId: user.id,
            questionId,
            ...(hasEssayDraft ? { essayText: String(essayText) } : {}),
            isCorrect: true,
          },
        }),
      ]);

      emitRealtimeEvent({
        topic: "analytics",
        action: "mistake_updated",
        audience: "user",
        targetUserId: user.id,
        entityId: questionId,
      });

      return NextResponse.json({
        success: true,
        markedForReview: false,
        isResolved: true,
        explanation: question.explanation,
        modelAnswer: question.rubric?.modelAnswer,
        modelAnswerTranslation: question.rubric?.modelAnswerTranslation,
      });
    }

    // Check MCQ or TRUE_FALSE
    if (question.type === "MCQ" || question.type === "TRUE_FALSE") {
      const selectedOption = selectedOptionId
        ? question.options.find((o) => o.id === selectedOptionId)
        : undefined;

      if (!selectedOption) {
        return NextResponse.json(
          { error: "الاختيار المحدد غير تابع لهذا السؤال" },
          { status: 400 }
        );
      }

      const isCorrect = selectedOption.isCorrect;
      const correctOption = question.options.find((o) => o.isCorrect);

      // Persist the student's answer in QuestionAttempt & sync MistakeReview
      await Promise.all([
        prisma.questionAttempt.upsert({
          where: { userId_questionId: { userId: user.id, questionId } },
          update: {
            selectedOptionId: selectedOption.id,
            isCorrect,
            updatedAt: new Date(),
          },
          create: {
            userId: user.id,
            questionId,
            selectedOptionId: selectedOption.id,
            isCorrect,
          },
        }),
        !isCorrect
          ? MistakeService.recordMistake(user.id, questionId)
          : MistakeService.resolveMistake(user.id, questionId),
      ]);

      let streakDays: number | undefined;
      let isTodayCompleted: boolean | undefined;

      // If answered as part of daily challenge, complete today's streak
      if (isDailyChallenge) {
        const todayKey = getCairoDayKey();
        await prisma.dailyChallenge.upsert({
          where: { userId_day: { userId: user.id, day: todayKey } },
          update: { completedAt: new Date() },
          create: {
            userId: user.id,
            day: todayKey,
            completedAt: new Date(),
            questionIds: [questionId],
          },
        });

        const userChallenges = await prisma.dailyChallenge.findMany({
          where: { userId: user.id, completedAt: { not: null } },
          select: { day: true },
        });
        streakDays = calculateStreak(userChallenges.map((c) => c.day));
        isTodayCompleted = true;
      }

      emitRealtimeEvent({
        topic: "analytics",
        action: "mistake_updated",
        audience: "user",
        targetUserId: user.id,
        entityId: questionId,
      });

      return NextResponse.json({
        isCorrect,
        correctOptionId: correctOption?.id,
        explanation: question.explanation,
        options: question.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
          explanation: o.explanation,
        })),
        streakDays,
        isTodayCompleted,
      });
    }

    // Essay question: simply save student's draft & return model answer without forcing resolution
    if (hasEssayDraft) {
      await prisma.questionAttempt.upsert({
        where: { userId_questionId: { userId: user.id, questionId } },
        update: {
          essayText: String(essayText),
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          questionId,
          essayText: String(essayText),
          isCorrect: true,
        },
      });
    }

    return NextResponse.json({
      isEssay: true,
      modelAnswer: question.rubric?.modelAnswer,
      modelAnswerTranslation: question.rubric?.modelAnswerTranslation,
      criteria: question.rubric?.criteria,
      maxScore: question.rubric?.maxScore,
      explanation: question.explanation,
    });
  } catch (error) {
    return withRetryAfter(jsonError(error), error);
  }
}
