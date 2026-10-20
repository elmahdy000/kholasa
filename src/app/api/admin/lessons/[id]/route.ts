import { NextResponse } from "next/server";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";
import { CurriculumService } from "@/services/curriculum.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const lesson = await CurriculumService.getLesson(id);

    if (!lesson) {
      return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Failed to fetch lesson for admin:", error);
    return NextResponse.json({ error: "تعذر تحميل بيانات الدرس" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const fullLesson = await CurriculumService.updateLesson(id, body);

    return NextResponse.json({
      success: true,
      lesson: fullLesson,
    });
  } catch (error: any) {
    console.error("Failed to update lesson:", error);
    return NextResponse.json(
      { error: error?.message || "تعذر حفظ تعديلات الدرس" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    await CurriculumService.deleteLesson(id);

    return NextResponse.json({ success: true, message: "تم حذف الدرس بنجاح" });
  } catch (error: any) {
    console.error("Failed to delete lesson:", error);
    return NextResponse.json(
      { error: error?.message || "تعذر حذف الدرس" },
      { status: 500 }
    );
  }
}
