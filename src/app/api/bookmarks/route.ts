import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { StudentService } from "@/services/student.service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, questionId } = body;

    if (!lessonId && !questionId) {
      return NextResponse.json(
        { error: "يجب تحديد درس أو سؤال لحفظه" },
        { status: 400 }
      );
    }

    const result = await StudentService.toggleBookmark(user.id, { lessonId, questionId });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
    return NextResponse.json(
      { error: "تعذر تحديث الإشارات المرجعية" },
      { status: 500 }
    );
  }
}
