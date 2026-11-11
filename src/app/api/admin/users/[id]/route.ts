import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canActorManageTargetUser, canDeleteUsersRole, canManageUsersRole } from "@/lib/roles";
import { UserService } from "@/services/user.service";
import { emitRealtimeEvent, revalidatePlatformPaths } from "@/lib/realtime";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsersRole(currentUser.role)) {
      return NextResponse.json({ error: "??? ???? ?? ???????" }, { status: 403 });
    }

    const { id } = await params;
    const user = await UserService.getUserDetailedProfile(id);

    if (!user) {
      return NextResponse.json({ error: "???????? ??? ?????" }, { status: 404 });
    }

    if (user.id !== currentUser.id && !canActorManageTargetUser(currentUser.role, user.role)) {
      return NextResponse.json(
        { error: "??? ???? ?? ???? ?????? ??? ?????? ???????" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, user }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    return NextResponse.json({ error: "تعذر جلب تفاصيل المستخدم" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsersRole(currentUser.role)) {
      return NextResponse.json({ error: "??? ???? ?? ???????" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const updated = await UserService.updateUser(
      id,
      body,
      currentUser.role,
      currentUser.id
    );
    revalidatePlatformPaths(["/admin/users", "/admin/reports", "/subscription", "/dashboard", "/subjects", "/lessons"]);
    emitRealtimeEvent({ topic: "users", action: "user_updated", audience: "staff", entityId: id });
    emitRealtimeEvent({ topic: "users", action: "user_updated", audience: "user", targetUserId: id, entityId: id });
    emitRealtimeEvent({ topic: "notifications", action: "user_subscription_changed", audience: "staff", entityId: id });
    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Failed to update user:", error);
    const msg = error instanceof Error ? error.message : "";
    const isConflict = msg.includes("مسجل بالفعل");
    const isForbidden = msg.includes("غير مصرح") || msg.includes("المشرف العام") || msg.includes("لا يمكن تعديل") || msg.includes("للمساعد");
    const isNotFound = msg.includes("غير موجود");
    return NextResponse.json(
      { error: msg || "تعذر تحديث بيانات المستخدم" },
      { status: isForbidden ? 403 : isConflict ? 409 : isNotFound ? 404 : 400 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canDeleteUsersRole(currentUser.role)) {
      return NextResponse.json(
        {
          error:
            currentUser?.role === "ASSISTANT"
              ? "غير مصرح للمساعد بحذف الطلاب أو المستخدمين — هذه الصلاحية للإدارة فقط"
              : "غير مصرح لك بالوصول",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    await UserService.deleteUser(id, currentUser.role, currentUser.id);
    revalidatePlatformPaths(["/admin/users", "/admin/reports", "/dashboard"]);
    emitRealtimeEvent({ topic: "users", action: "user_deleted", audience: "staff", entityId: id });
    emitRealtimeEvent({ topic: "users", action: "user_deleted", audience: "user", targetUserId: id, entityId: id });

    return NextResponse.json({ success: true, message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    const msg = error instanceof Error ? error.message : "";
    const isForbidden = msg.includes("غير مصرح") || msg.includes("المشرف العام") || msg.includes("للمساعد");
    const isBadRequest = msg.includes("حسابك الشخصي") || msg.includes("غير موجود");
    return NextResponse.json(
      { error: msg || "تعذر حذف المستخدم" },
      { status: isForbidden ? 403 : isBadRequest ? 400 : 500 }
    );
  }
}
