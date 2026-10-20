import { NextResponse } from "next/server";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";
import { CurriculumService } from "@/services/curriculum.service";

// GET: List lessons for a unit or search
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId") || undefined;
    const search = searchParams.get("search") || undefined;

    const lessons = await CurriculumService.getLessonsList({ unitId, search });
    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("Failed to fetch admin lessons:", error);
    return NextResponse.json({ error: "تعذر تحميل قائمة الدروس" }, { status: 500 });
  }
}

// POST: Create a new lesson
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json();
    const { unitId, title } = body;

    if (!unitId || !title?.trim()) {
      return NextResponse.json({ error: "يرجى تحديد الوحدة وعنوان الدرس" }, { status: 400 });
    }

    const lesson = await CurriculumService.createLesson(body);
    return NextResponse.json({ success: true, lesson });
  } catch (error) {
    console.error("Failed to create lesson:", error);
    return NextResponse.json({ error: "تعذر إنشاء الدرس" }, { status: 500 });
  }
}
