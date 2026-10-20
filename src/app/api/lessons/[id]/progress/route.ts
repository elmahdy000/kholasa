import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { StudentService } from "@/services/student.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const body = await req.json().catch(() => ({}));
    const { progressPercent = 100 } = body;

    const progress = await StudentService.updateLessonProgress(
      user.id,
      lessonId,
      Number(progressPercent ?? 100)
    );

    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    console.error("Failed to update lesson progress:", error);
    const isNotFound = error?.message?.includes("غير موجود");
    return NextResponse.json(
      { error: error?.message || "تعذر تحديث تقدم الدرس" },
      { status: isNotFound ? 404 : 500 }
    );
  }
}

