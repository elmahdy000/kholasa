import { NextResponse } from "next/server";
import { getCurrentUser, canViewAnalytics } from "@/lib/auth";
import { forbidden, jsonError } from "@/lib/http";
import { RealtimeAnalyticsService } from "@/services/realtime-analytics.service";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canViewAnalytics(user.role)) {
      throw forbidden("غير مصرح لك بمشاهدة المرصد المباشر");
    }

    const { searchParams } = new URL(req.url);
    const category = (searchParams.get("category") || "ALL") as "ALL" | "ARABIC" | "LANGUAGES";
    const status = (searchParams.get("status") || "ALL") as
      | "ALL"
      | "ONLINE"
      | "TODAY"
      | "ACTIVE_EXAMS"
      | "ACTIVE_LESSONS";
    const search = searchParams.get("search") || undefined;
    const sortBy = (searchParams.get("sortBy") || "lastActive") as
      | "lastActive"
      | "exams"
      | "time"
      | "name"
      | "score";

    const data = await RealtimeAnalyticsService.getRealtimeObservatory({
      category,
      status,
      search,
      sortBy,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    return jsonError(error);
  }
}

