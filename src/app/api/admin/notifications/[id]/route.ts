import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, canManageAnnouncements } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageAnnouncements(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { id } = await params;
    await NotificationService.deleteAnnouncement(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin delete announcement error:", err);
    return NextResponse.json({ error: "فشل حذف الإشعار" }, { status: 500 });
  }
}
