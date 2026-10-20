import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { StudentService } from "@/services/student.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const progress = await StudentService.getLessonProgress(user.id, lessonId);
    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    console.error("Failed to fetch lesson progress:", error);
    return NextResponse.json(
      { error: "تعذر جلب تقدم الدرس" },
      { status: 500 }
    );
  }
}

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
    const { progressPercent, isCompleted } = body;

    const progress = await StudentService.updateLessonProgress(
      user.id,
      lessonId,
      { progressPercent, isCompleted }
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

