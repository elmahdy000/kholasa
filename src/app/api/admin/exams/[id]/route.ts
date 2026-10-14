import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isPractice, title, durationMinutes, description } = body;

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        ...(isPractice !== undefined ? { isPractice: Boolean(isPractice) } : {}),
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(durationMinutes !== undefined ? { durationMinutes: Number(durationMinutes) } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ success: true, exam: updated });
  } catch (error) {
    console.error("Failed to update exam:", error);
    return NextResponse.json({ error: "تعذر تحديث بيانات الامتحان" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete exam:", error);
    return NextResponse.json({ error: "تعذر حذف الامتحان" }, { status: 500 });
  }
}
