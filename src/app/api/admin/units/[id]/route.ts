import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";

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

    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        lessons: { orderBy: { order: "asc" } },
      },
    });

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
    const body = await req.json();
    const { title, description, order, isPublished } = body;

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, unit });
  } catch (error) {
    console.error("Failed to update unit:", error);
    return NextResponse.json({ error: "تعذر تحديث بيانات الوحدة" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.unit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "تم حذف الوحدة بنجاح" });
  } catch (error) {
    console.error("Failed to delete unit:", error);
    return NextResponse.json({ error: "تعذر حذف الوحدة" }, { status: 500 });
  }
}
