import { NextResponse } from "next/server";
import { getCurrentUser, canGradeAttempts } from "@/lib/auth";
import { ExamService } from "@/services";
import { z } from "zod";
import { parseJson, jsonError } from "@/lib/http";

const gradeSchema = z.object({
  answerId: z.string().min(1),
  isCorrect: z.boolean().optional(),
  score: z.number().finite().min(0).optional(),
  attemptId: z.string().min(1).optional(),
}).refine((value) => value.isCorrect !== undefined || value.score !== undefined);

// GET: Return student exam attempts with optional filters (examId, userId, search)
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canGradeAttempts(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const search = searchParams.get("search") || undefined;
    const id = searchParams.get("id") || undefined;

    if (id) {
      const singleAttempt = await ExamService.getAdminAttemptsList({ id });
      if (!singleAttempt || Array.isArray(singleAttempt)) {
        return NextResponse.json({ error: "المحاولة غير موجودة" }, { status: 404 });
      }
      return NextResponse.json({ attempt: singleAttempt });
    }

    const attempts = await ExamService.getAdminAttemptsList({
      examId,
      userId,
      search,
    });

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("Failed to fetch student attempts:", error);
    return NextResponse.json(
      { error: "تعذر تحميل سجل محاولات الطلاب" },
      { status: 500 }
    );
  }
}

// PATCH: Grade an essay question or recalculate attempt score
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canGradeAttempts(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await parseJson(req, gradeSchema);
    const { answerId, isCorrect, score, attemptId } = body;

    if (!answerId) {
      return NextResponse.json({ error: "معرف الإجابة مطلوب" }, { status: 400 });
    }

    const updatedAttempt = await ExamService.gradeStudentAnswer(
      answerId,
      isCorrect,
      score,
      attemptId
    );

    return NextResponse.json({ success: true, updatedAttempt });
  } catch (error) {
    return jsonError(error);
  }
}
