import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;
    const body = await req.json();
    const { selectedOptionId, essayText } = body;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: true,
        explanation: true,
        rubric: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "السؤال غير موجود" },
        { status: 404 }
      );
    }

    const user = await getCurrentUser();

    // Check MCQ or TRUE_FALSE
    if (question.type === "MCQ" || question.type === "TRUE_FALSE") {
      const selectedOption = question.options.find(
        (o) => o.id === selectedOptionId
      );
      const isCorrect = selectedOption?.isCorrect ?? false;
      const correctOption = question.options.find((o) => o.isCorrect);

      // If user is authenticated, update MistakeReview
      if (user) {
        if (!isCorrect) {
          // Upsert mistake
          await prisma.mistakeReview.upsert({
            where: {
              userId_questionId: {
                userId: user.id,
                questionId,
              },
            },
            update: {
              wrongCount: { increment: 1 },
              isResolved: false,
              lastAttemptAt: new Date(),
            },
            create: {
              userId: user.id,
              questionId,
              wrongCount: 1,
              isResolved: false,
              lastAttemptAt: new Date(),
            },
          });
        } else {
          // If was a mistake before, mark resolved
          await prisma.mistakeReview.updateMany({
            where: {
              userId: user.id,
              questionId,
            },
            data: {
              isResolved: true,
              lastAttemptAt: new Date(),
            },
          });
        }
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
      });
    }

    // Essay question
    return NextResponse.json({
      isEssay: true,
      modelAnswer: question.rubric?.modelAnswer,
      criteria: question.rubric?.criteria,
      maxScore: question.rubric?.maxScore,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error("Failed to check answer:", error);
    return NextResponse.json(
      { error: "تعذر فحص الإجابة" },
      { status: 500 }
    );
  }
}
