import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canManageUsersRole } from "@/lib/roles";
import { UserService } from "@/services/user.service";
import { emitRealtimeEvent, revalidatePlatformPaths } from "@/lib/realtime";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsersRole(currentUser.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const result = await UserService.resetUserDevices(id, currentUser.role);
    revalidatePlatformPaths(["/admin/users", "/admin/reports", "/dashboard"]);
    emitRealtimeEvent({ topic: "users", action: "devices_reset", audience: "staff", entityId: id });
    emitRealtimeEvent({ topic: "users", action: "devices_reset", audience: "user", targetUserId: id, entityId: id });

    return NextResponse.json({
      success: true,
      message: "تم فك ربط أجهزة الطالب بنجاح وإلغاء الجلسات النشطة",
      user: result,
    });
  } catch (error) {
    console.error("Failed to reset student devices:", error);
    const msg = error instanceof Error ? error.message : "";
    const isForbidden = msg.includes("غير مصرح");
    const isNotFound = msg.includes("غير موجود");
    return NextResponse.json(
      { error: msg || "تعذر إعادة ضبط أجهزة المستخدم" },
      { status: isForbidden ? 403 : isNotFound ? 404 : 400 }
    );
  }
}

