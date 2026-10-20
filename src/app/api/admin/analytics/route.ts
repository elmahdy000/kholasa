import { NextResponse } from "next/server";
import { getCurrentUser, canViewAnalytics } from "@/lib/auth";
import { AnalyticsService } from "@/services/analytics.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !canViewAnalytics(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const metrics = await AnalyticsService.getAdminPlatformMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Failed to fetch admin analytics:", error);
    return NextResponse.json(
      { error: "تعذر تحميل إحصائيات النظام" },
      { status: 500 }
    );
  }
}
