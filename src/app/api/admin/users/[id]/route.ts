import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { role, systemId, gradeId, name, phone, email } = body;

    // Prevent non-super-admins from modifying other admins
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    if (
      targetUser.role === "SUPER_ADMIN" &&
      currentUser.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { error: "لا يمكن تعديل صلاحيات المشرف العام الأعلى" },
        { status: 403 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role ? { role } : {}),
        ...(systemId !== undefined ? { systemId: systemId || null } : {}),
        ...(gradeId !== undefined ? { gradeId: gradeId || null } : {}),
        ...(name ? { name: name.trim() } : {}),
        ...(phone ? { phone: phone.trim() } : {}),
        ...(email ? { email: email.trim() } : {}),
      },
      include: {
        system: { select: { id: true, name: true } },
        grade: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "تعذر تحديث بيانات المستخدم" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;

    if (currentUser.id === id) {
      return NextResponse.json(
        { error: "لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول به" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    if (targetUser.role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "لا يمكن حذف المشرف العام الأعلى" },
        { status: 403 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "تعذر حذف المستخدم" }, { status: 500 });
  }
}
