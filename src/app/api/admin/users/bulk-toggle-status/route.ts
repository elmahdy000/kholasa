import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { userIds, isActive, gradeId, systemId, role = "STUDENT" } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "يجب تحديد حالة التفعيل (مفعّل / معلق)" }, { status: 400 });
    }

    const where: Prisma.UserWhereInput = {};

    // Specific IDs provided
    if (Array.isArray(userIds) && userIds.length > 0) {
      where.id = { in: userIds };
    } else {
      // Filter by role (default only students for safety)
      where.role = role === "STUDENT" ? "STUDENT" : role;
      if (gradeId && gradeId !== "all") where.gradeId = gradeId;
      if (systemId && systemId !== "all") where.systemId = systemId;
    }

    // Safety: never modify self or Super Admins in bulk operations
    where.id = {
      ...(where.id && typeof where.id === "object" ? where.id : {}),
      not: currentUser.id,
    };
    where.role = { not: "SUPER_ADMIN" };

    const countTarget = await prisma.user.count({ where });
    if (countTarget === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "لم يتم العثور على أي حسابات مطابقة للتعديل",
      });
    }

    const result = await prisma.user.updateMany({
      where,
      data: { isActive },
    });

    // If deactivating, purge sessions for affected users
    if (!isActive) {
      const affectedUsers = await prisma.user.findMany({
        where,
        select: { id: true },
      });
      const ids = affectedUsers.map((u) => u.id);
      if (ids.length > 0) {
        await prisma.session.deleteMany({
          where: { userId: { in: ids } },
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      message: isActive
        ? `تم تفعيل ${result.count} حساب بنجاح`
        : `تم إيقاف ${result.count} حساب بنجاح`,
    });
  } catch (error) {
    console.error("Failed to bulk toggle user status:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث حالة الحسابات" },
      { status: 500 }
    );
  }
}

