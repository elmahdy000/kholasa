import { NextResponse } from "next/server";
import { getCurrentUser, canViewAnalytics } from "@/lib/auth";
import { forbidden, jsonError } from "@/lib/http";
import { AnalyticsService } from "@/services/analytics.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !canViewAnalytics(user.role)) throw forbidden("غير مصرح");

    const metrics = await AnalyticsService.getAdminPlatformMetrics();
    return NextResponse.json(metrics, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
