import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AppError, jsonError } from "@/lib/http";
import { rateLimit, withRetryAfter } from "@/lib/rate-limit";
import { ExamService } from "@/services";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    rateLimit(`exam:submit:${user.id}`, 20, 60 * 1000);

    await params; // consume params
    const body = await req.json().catch(() => ({}));
    const { attemptId, answers = {}, totalTimeSpentSeconds = 0 } = body;

    if (!attemptId) {
      return NextResponse.json({ error: "معرف المحاولة مطلوب" }, { status: 400 });
    }

    const result = await ExamService.submitExamAttempt(attemptId, user.id, {
      answers,
      totalTimeSpentSeconds,
    });

    return NextResponse.json({
      success: true,
      score: result.score,
      percentage: result.percentage,
      totalQuestions: result.totalQuestions,
      attemptId,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return withRetryAfter(jsonError(error), error);
    }
    console.error("Failed to submit exam:", error);
    const msg = error instanceof Error ? error.message : "";
    const isAlreadySubmitted = msg.includes("مسبقاً");
    const isClientError =
      isAlreadySubmitted || msg.includes("غير موجودة") || msg.includes("غير مصرح");

    return NextResponse.json(
      {
        error: isClientError
          ? msg
          : "تعذر تسليم الامتحان، حاول مرة أخرى",
      },
      { status: isAlreadySubmitted ? 409 : isClientError ? 400 : 500 }
    );
  }
}

