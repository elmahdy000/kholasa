import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
  } catch (error: any) {
    console.error("Failed to submit exam:", error);
    const msg = error?.message || "";
    const isClientError = msg.includes("غير موجودة") || msg.includes("مسبقاً") || msg.includes("غير مصرح");
    return NextResponse.json(
      { error: msg || "تعذر تسليم الامتحان" },
      { status: isClientError ? 400 : 500 }
    );
  }
}

