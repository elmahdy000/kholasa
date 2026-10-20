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
    const body = await req.json();
    const { progressPercent = 100 } = body;

    const progress = await StudentService.updateLessonProgress(
      user.id,
      lessonId,
      Number(progressPercent ?? 100)
    );

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Failed to update lesson progress:", error);
    return NextResponse.json(
      { error: "تعذر تحديث تقدم الدرس" },
      { status: 500 }
    );
  }
}
