import { NextResponse } from "next/server";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";
import { CurriculumService } from "@/services";

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
    const unit = await CurriculumService.getUnitDetails(id);

    if (!unit) {
      return NextResponse.json({ error: "الوحدة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Failed to fetch unit:", error);
    return NextResponse.json({ error: "تعذر تحميل بيانات الوحدة" }, { status: 500 });
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
    const { title, description, order, isPublished } = body;

    const unit = await CurriculumService.updateUnit(id, {
      title,
      description,
      order,
      isPublished,
    });

    return NextResponse.json({ success: true, unit });
  } catch (error: any) {
    console.error("Failed to update unit:", error);
    return NextResponse.json(
      { error: error?.message || "تعذر تحديث بيانات الوحدة" },
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
    await CurriculumService.deleteUnit(id);

    return NextResponse.json({ success: true, message: "تم حذف الوحدة بنجاح" });
  } catch (error: any) {
    console.error("Failed to delete unit:", error);
    return NextResponse.json(
      { error: error?.message || "تعذر حذف الوحدة" },
      { status: 500 }
    );
  }
}
