import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id: examId } = await params;
    const body = await req.json();
    const { attemptId, answers = {}, totalTimeSpentSeconds = 0 } = body;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                options: true,
                explanation: true,
                rubric: true,
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "الامتحان غير موجود" }, { status: 404 });
    }

    let correctCount = 0;
    const totalQuestions = exam.questions.length;
    const studentAnswersToCreate: any[] = [];
    const mistakesToUpsert: string[] = [];

    for (const eq of exam.questions) {
      const q = eq.question;
      const ans = answers[q.id];
      const selectedOptionId = ans?.selectedOptionId || null;
      const essayText = ans?.essayText || null;
      const timeSpentSeconds = ans?.timeSpentSeconds || 0;

      let isCorrect: boolean | null = null;
      let score = 0;

      if (q.type === "MCQ" || q.type === "TRUE_FALSE") {
        const selectedOpt = q.options.find((o) => o.id === selectedOptionId);
        if (selectedOpt && selectedOpt.isCorrect) {
          isCorrect = true;
          score = 1;
          correctCount++;
        } else {
          isCorrect = false;
          score = 0;
          mistakesToUpsert.push(q.id);
        }
      } else if (q.type === "ESSAY") {
        // Simple heuristic essay check (in production or with rubric comparison)
        if (essayText && essayText.trim().length > 10) {
          isCorrect = true;
          score = q.rubric?.maxScore || 10;
          correctCount++;
        } else {
          isCorrect = false;
          mistakesToUpsert.push(q.id);
        }
      }

      studentAnswersToCreate.push({
        questionId: q.id,
        selectedOptionId,
        essayText,
        isCorrect,
        score,
        timeSpentSeconds,
      });
    }

    const percentage =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Transaction to update attempt, save answers, and record mistakes
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update attempt
      const updatedAttempt = await tx.examAttempt.update({
        where: { id: attemptId },
        data: {
          score: correctCount,
          percentage: Math.round(percentage * 10) / 10,
          timeSpentSeconds: totalTimeSpentSeconds,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // 2. Create student answers
      for (const sa of studentAnswersToCreate) {
        await tx.studentAnswer.create({
          data: {
            attemptId,
            ...sa,
          },
        });
      }

      // 3. Upsert mistakes in MistakeReview
      for (const qId of mistakesToUpsert) {
        await tx.mistakeReview.upsert({
          where: {
            userId_questionId: {
              userId: user.id,
              questionId: qId,
            },
          },
          update: {
            wrongCount: { increment: 1 },
            isResolved: false,
            lastAttemptAt: new Date(),
          },
          create: {
            userId: user.id,
            questionId: qId,
            wrongCount: 1,
            isResolved: false,
            lastAttemptAt: new Date(),
          },
        });
      }

      return updatedAttempt;
    });

    return NextResponse.json({
      success: true,
      score: correctCount,
      percentage: Math.round(percentage * 10) / 10,
      totalQuestions,
      attemptId,
    });
  } catch (error) {
    console.error("Failed to submit exam:", error);
    return NextResponse.json({ error: "تعذر تسليم الامتحان" }, { status: 500 });
  }
}
