import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
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
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
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
