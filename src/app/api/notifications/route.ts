import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const data = await NotificationService.getInAppNotifications(user.id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Notifications fetch error:", err);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      const count = await NotificationService.markAllAsRead(user.id);
      return NextResponse.json({ success: true, count });
    }

    if (notificationId) {
      const ok = await NotificationService.markAsRead(user.id, notificationId);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  } catch (err) {
    console.error("Notification mark-read error:", err);
    return NextResponse.json({ error: "فشل تحديث حالة الإشعار" }, { status: 500 });
  }
}
