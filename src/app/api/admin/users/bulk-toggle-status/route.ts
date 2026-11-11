import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canManageUsersRole, isFullAdmin } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { emitRealtimeEvent, revalidatePlatformPaths } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsersRole(currentUser.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { userIds, isActive, gradeId, systemId, role = "STUDENT", activateSubscription } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "يجب تحديد حالة التفعيل (مفعّل / معلق)" }, { status: 400 });
    }

    const where: Prisma.UserWhereInput = {};
    const actorIsFullAdmin = isFullAdmin(currentUser.role);

    // Specific IDs provided
    if (Array.isArray(userIds) && userIds.length > 0) {
      where.id = { in: userIds };
      where.role = actorIsFullAdmin
        ? { not: "SUPER_ADMIN" }
        : { notIn: ["SUPER_ADMIN", "ADMIN", "ASSISTANT"] };
    } else {
      // Filter by role (default only students for safety; Assistants can only bulk-toggle students)
      const requestedRole = !actorIsFullAdmin
        ? "STUDENT"
        : role === "STUDENT"
        ? "STUDENT"
        : role;
      where.role =
        requestedRole && requestedRole !== "SUPER_ADMIN"
          ? requestedRole
          : { not: "SUPER_ADMIN" };
      if (gradeId && gradeId !== "all") where.gradeId = gradeId;
      if (systemId && systemId !== "all") where.systemId = systemId;
    }

    // Safety: never modify self in bulk operations
    where.id = {
      ...(where.id && typeof where.id === "object" ? where.id : {}),
      not: currentUser.id,
    };

    const countTarget = await prisma.user.count({ where });
    if (countTarget === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "لم يتم العثور على أي حسابات مطابقة للتعديل",
      });
    }

    const shouldActivateStudentSubscriptions =
      isActive === true &&
      role === "STUDENT" &&
      activateSubscription !== false;

    const result = await prisma.user.updateMany({
      where,
      data: {
        isActive,
        ...(shouldActivateStudentSubscriptions ? { subscriptionStatus: "ACTIVE" } : {}),
      },
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

    revalidatePlatformPaths([
      "/admin/users",
      "/admin/reports",
      "/dashboard",
      "/subjects",
      "/lessons",
      "/subscription",
    ]);
    emitRealtimeEvent({ topic: "users", action: "users_bulk_toggled", audience: isActive ? "staff" : "all" });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: isActive
        ? shouldActivateStudentSubscriptions
          ? `تم تفعيل ${result.count} حساب واشتراك كامل بنجاح`
          : `تم تفعيل ${result.count} حساب بنجاح`
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

