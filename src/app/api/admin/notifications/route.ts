import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, canManageAnnouncements } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";
import { NotificationType, SchoolCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageAnnouncements(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await NotificationService.listAdminAnnouncements({ page, limit });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Admin list announcements error:", err);
    return NextResponse.json({ error: "فشل استرجاع الإعلانات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageAnnouncements(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { title, message, type, targetGradeId, targetSchoolCategory, link, isUrgent, expiresAt, sendPush } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "عنوان الإشعار مطلوب" }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "نص الإشعار مطلوب" }, { status: 400 });
    }

    const announcement = await NotificationService.createAnnouncement({
      title,
      message,
      type: type as NotificationType,
      targetGradeId: targetGradeId || null,
      targetSchoolCategory: targetSchoolCategory as SchoolCategory | null,
      link: link || null,
      isUrgent: Boolean(isUrgent),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdById: user.id,
      sendPush: Boolean(sendPush),
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (err) {
    console.error("Admin create announcement error:", err);
    return NextResponse.json({ error: "فشل إنشاء الإشعار" }, { status: 500 });
  }
}
