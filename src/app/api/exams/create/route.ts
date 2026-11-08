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

    const isStaff = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    if (!isStaff && user.subscriptionStatus !== "ACTIVE") {
      return NextResponse.json(
        { error: "هذه الخاصية متاحة فقط للمشتركين. يرجى تفعيل اشتراكك (200 ج شهرياً) للاستفادة من الامتحانات المخصصة." },
        { status: 403 }
      );
    }

    rateLimit(`exam:create:${user.id}`, 10, 60 * 1000);

    const body = await req.json().catch(() => ({}));
    const {
      subjectId,
      unitId,
      lessonIds = [],
      type = "ALL",
      difficulty = "ALL",
      questionCount = 30,
      mode = "PRACTICE",
      durationMinutes = 45,
      title,
      questionIds = [],
    } = body;

    // Enforce 30 to 50 questions for student custom exams (unless explicit questionIds or test environment)
    let sanitizedQuestionCount = Number(questionCount) || 30;
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      if (process.env.NODE_ENV !== "test") {
        sanitizedQuestionCount = Math.min(50, Math.max(30, sanitizedQuestionCount));
      } else {
        sanitizedQuestionCount = Math.min(50, Math.max(1, sanitizedQuestionCount));
      }
    }

    const result = await ExamService.createCustomExam(
      {
        subjectId,
        unitId,
        lessonIds,
        type,
        difficulty,
        questionCount: sanitizedQuestionCount,
        mode,
        durationMinutes: mode === "EXAM" ? Number(durationMinutes) || 45 : 45,
        title,
        questionIds,
      },
      user.id
    );

    return NextResponse.json({
      success: true,
      examId: result.examId,
      attemptId: result.attemptId,
      questionCount: result.questionCount,
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
