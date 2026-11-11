import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, canManageAnnouncements } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";
import { emitRealtimeEvent, revalidatePlatformPaths } from "@/lib/realtime";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, must-revalidate" };

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageAnnouncements(user.role)) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 403, headers: NO_STORE_HEADERS }
      );
    }

    const { id } = await params;
    if (!id || !id.trim()) {
      return NextResponse.json(
        { error: "معرف الإشعار مطلوب" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await NotificationService.deleteAnnouncement(id);
    revalidatePlatformPaths(["/admin/notifications", "/dashboard"]);
    emitRealtimeEvent({
      topic: "notifications",
      action: "deleted",
      audience: "all",
      entityId: id,
    });

    return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("Admin delete announcement error:", err);
    return NextResponse.json(
      { error: "فشل حذف الإشعار" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
