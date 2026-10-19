import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { NotificationService } from "@/services/notification.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await NotificationService.getInAppNotifications(user.id);
    return NextResponse.json({ notifications });
  } catch (err: any) {
    console.error("Notifications fetch error:", err);
    return NextResponse.json({ notifications: [] });
  }
}
