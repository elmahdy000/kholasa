import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AppError, jsonError } from "@/lib/http";
import { rateLimit, withRetryAfter } from "@/lib/rate-limit";
import { ExamService } from "@/services";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول لبدء الامتحان" }, { status: 401 });
    }

    rateLimit(`exam:create:${user.id}`, 10, 60 * 1000);

    const body = await req.json().catch(() => ({}));
    const {
      subjectId,
      unitId,
      lessonIds = [],
      type = "ALL",
      difficulty = "ALL",
      questionCount = 10,
      mode = "PRACTICE",
      durationMinutes = 20,
      title,
      questionIds = [],
    } = body;

    const result = await ExamService.createCustomExam(
      {
        subjectId,
        unitId,
        lessonIds,
        type,
        difficulty,
        questionCount,
        mode,
        durationMinutes,
        title,
        questionIds,
      },
      user.id
    );

    return NextResponse.json({
      success: true,
      examId: result.examId,
      attemptId: result.attemptId,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return withRetryAfter(jsonError(error), error);
    }
    console.error("Failed to create exam:", error);
    const msg = error instanceof Error ? error.message : "";
    return NextResponse.json(
      { error: msg || "تعذر إنشاء الامتحان، حاول مرة أخرى" },
      { status: 400 }
    );
  }
}

