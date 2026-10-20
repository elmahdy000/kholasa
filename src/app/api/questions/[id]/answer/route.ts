import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { QuestionService } from "@/services/question.service";
import { MistakeService } from "@/services/mistake.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;
    const body = await req.json();
    const { selectedOptionId, essayText } = body;

    const question = await QuestionService.getQuestionById(questionId);

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

      // If user is authenticated, update MistakeReview via MistakeService
      if (user) {
        if (!isCorrect) {
          await MistakeService.recordMistake(user.id, questionId);
        } else {
          await MistakeService.resolveMistake(user.id, questionId);
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
