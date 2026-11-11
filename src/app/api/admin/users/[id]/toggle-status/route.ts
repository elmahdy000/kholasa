import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitRealtimeEvent, revalidatePlatformPaths } from "@/lib/realtime";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    // Find target user
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true, subscriptionStatus: true, name: true },
    });

    if (!target) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Safety check: Cannot deactivate oneself
    if (target.id === currentUser.id) {
      return NextResponse.json({ error: "لا يمكنك تعطيل حسابك الشخصي" }, { status: 400 });
    }

    // Admins cannot deactivate Super Admins
    if (currentUser.role !== "SUPER_ADMIN" && target.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "لا تملك صلاحية لتعديل حساب المشرف العام" }, { status: 403 });
    }

    // Determine new status: explicit isActive or invert current
    const nextStatus = typeof body.isActive === "boolean" ? body.isActive : !target.isActive;
    const shouldActivateSubscription =
      target.role === "STUDENT" &&
      nextStatus === true &&
      body.activateSubscription !== false &&
      target.subscriptionStatus !== "ACTIVE";

    const updated = await prisma.user.update({
      where: { id },
      data: {
        isActive: nextStatus,
        ...(shouldActivateSubscription ? { subscriptionStatus: "ACTIVE" } : {}),
      },
      select: {
        id: true,
        name: true,
        role: true,
        isActive: true,
        subscriptionStatus: true,
      },
    });

    // If deactivated, immediately revoke all active sessions
    if (!nextStatus) {
      await prisma.session.deleteMany({ where: { userId: id } });
    }

    revalidatePlatformPaths([
      "/admin/users",
      "/admin/reports",
      "/dashboard",
      "/subjects",
      "/lessons",
      "/subscription",
    ]);
    emitRealtimeEvent({ topic: "users", action: "user_toggled", audience: "staff", entityId: id });
    emitRealtimeEvent({ topic: "users", action: "user_toggled", audience: "user", targetUserId: id, entityId: id });
    if (shouldActivateSubscription) {
      emitRealtimeEvent({
        topic: "notifications",
        action: "user_subscription_changed",
        audience: "staff",
        entityId: id,
      });
    }

    // Audit log if audit table exists
    try {
      await prisma.auditLog.create({
        data: {
          action: nextStatus ? "USER_ACTIVATED" : "USER_DEACTIVATED",
          resource: "USER",
          resourceId: id,
          userId: currentUser.id,
          details: {
            targetName: target.name,
            targetRole: target.role,
            newStatus: nextStatus,
            previousSubscriptionStatus: target.subscriptionStatus,
            newSubscriptionStatus: updated.subscriptionStatus,
          },
        },
      });
    } catch {
      // audit log optional failure shouldn't break the operation
    }

    return NextResponse.json({
      success: true,
      user: updated,
      message: nextStatus
        ? shouldActivateSubscription
          ? `تم تفعيل حساب واشتراك الطالب "${target.name || ""}" بنجاح (كافة الدروس متاحة الآن)`
          : `تم تفعيل حساب الطالب/المستخدم "${target.name || ""}" بنجاح`
        : `تم إيقاف حساب الطالب/المستخدم "${target.name || ""}" بنجاح`,
    });
  } catch (error) {
    console.error("Failed to toggle user status:", error);
    return NextResponse.json(
      { error: "تعذر تحديث حالة الحساب. يرجى المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}
