import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";
import { emitRealtimeEvent } from "@/lib/realtime";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, must-revalidate" };

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { notifications: [], unreadCount: 0 },
        { headers: NO_STORE_HEADERS }
      );
    }

    const raw = await NotificationService.getInAppNotifications(user.id);
    const notifications = Array.isArray(raw) ? [...raw] : [];
    const unreadCount =
      typeof raw?.unreadCount === "number"
        ? raw.unreadCount
        : notifications.filter((n) => !n.isRead).length;

    return NextResponse.json(
      { notifications, unreadCount },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("Notifications fetch error:", err);
    return NextResponse.json(
      { notifications: [], unreadCount: 0 },
      { headers: NO_STORE_HEADERS }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const body = await req.json().catch(() => ({}));
    const markAll = Boolean(body?.markAll ?? body?.all);
    const notificationId =
      typeof body?.notificationId === "string" && body.notificationId.trim()
        ? body.notificationId.trim()
        : typeof body?.id === "string" && body.id.trim()
        ? body.id.trim()
        : "";

    if (markAll) {
      const count = await NotificationService.markAllAsRead(user.id);
      emitRealtimeEvent({
        topic: "notifications",
        action: "mark_all_read",
        audience: "user",
        targetUserId: user.id,
      });
      if (count > 0) {
        emitRealtimeEvent({
          topic: "notifications",
          action: "read_receipt",
          audience: "staff",
        });
      }
      return NextResponse.json(
        { success: true, count },
        { headers: NO_STORE_HEADERS }
      );
    }

    if (notificationId) {
      const ok = await NotificationService.markAsRead(user.id, notificationId);
      if (ok) {
        emitRealtimeEvent({
          topic: "notifications",
          action: "mark_read",
          audience: "user",
          targetUserId: user.id,
          entityId: notificationId,
        });
        emitRealtimeEvent({
          topic: "notifications",
          action: "read_receipt",
          audience: "staff",
          entityId: notificationId,
        });
      }
      return NextResponse.json({ success: ok }, { headers: NO_STORE_HEADERS });
    }

    return NextResponse.json(
      { error: "بيانات غير صالحة" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("Notification mark-read error:", err);
    return NextResponse.json(
      { error: "فشل تحديث حالة الإشعار" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
