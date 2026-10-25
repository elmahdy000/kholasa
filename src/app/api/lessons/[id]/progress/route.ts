import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, parseJson, unauthorized } from "@/lib/http";
import { StudentService } from "@/services/student.service";

const updateProgressSchema = z.object({
  progressPercent: z.number().min(0).max(100).optional(),
  isCompleted: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized("غير مصرح");

    const { id: lessonId } = await params;
    const progress = await StudentService.getLessonProgress(user.id, lessonId);
    return NextResponse.json({ success: true, progress });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized("غير مصرح");

    const { id: lessonId } = await params;
    const body = await parseJson(req, updateProgressSchema);

    const progress = await StudentService.updateLessonProgress(
      user.id,
      lessonId,
      body
    );

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    return jsonError(error);
  }
}
