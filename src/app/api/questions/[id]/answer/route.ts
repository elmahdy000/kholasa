import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { rateLimit, withRetryAfter } from "@/lib/rate-limit";
import { QuestionService } from "@/services/question.service";
import { MistakeService } from "@/services/mistake.service";

import { prisma } from "@/lib/prisma";
import { getCairoDayKey, calculateStreak } from "@/lib/date";

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
    const { selectedOptionId, isDailyChallenge, resolve, essayText } = body;

    const question = await QuestionService.getQuestionById(questionId);

    if (!question) {
      return NextResponse.json(
        { error: "السؤال غير موجود" },
        { status: 404 }
      );
    }

    // Student self-resolved mistake or confirmed understanding
    if (resolve) {
      await Promise.all([
        MistakeService.resolveMistake(user.id, questionId),
        prisma.questionAttempt.upsert({
          where: { userId_questionId: { userId: user.id, questionId } },
          update: { isCorrect: true, updatedAt: new Date() },
          create: { userId: user.id, questionId, isCorrect: true },
        }),
      ]);
      return NextResponse.json({
        success: true,
        isResolved: true,
        explanation: question.explanation,
        modelAnswer: question.rubric?.modelAnswer,
        modelAnswerTranslation: question.rubric?.modelAnswerTranslation,
      });
    }

    // Check MCQ or TRUE_FALSE
    if (question.type === "MCQ" || question.type === "TRUE_FALSE") {
      const selectedOption = question.options.find(
        (o) => o.id === selectedOptionId
      );
      const isCorrect = selectedOption?.isCorrect ?? false;
      const correctOption = question.options.find((o) => o.isCorrect);

      // Persist the student's answer in QuestionAttempt
      await Promise.all([
        prisma.questionAttempt.upsert({
          where: { userId_questionId: { userId: user.id, questionId } },
          update: {
            selectedOptionId: selectedOptionId || null,
            isCorrect,
            updatedAt: new Date(),
          },
          create: {
            userId: user.id,
            questionId,
            selectedOptionId: selectedOptionId || null,
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

    // Essay question
    if (essayText !== undefined && essayText !== null) {
      await prisma.questionAttempt.upsert({
        where: { userId_questionId: { userId: user.id, questionId } },
        update: {
          essayText: String(essayText),
          isCorrect: true,
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
