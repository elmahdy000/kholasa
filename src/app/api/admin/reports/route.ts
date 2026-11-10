import { NextResponse } from "next/server";
import { getCurrentUser, canViewAnalytics } from "@/lib/auth";
import { forbidden, jsonError } from "@/lib/http";
import {
  DailyReportsService,
  type ReportCategoryFilter,
  type ReportStudyModeFilter,
} from "@/services/daily-reports.service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canViewAnalytics(user.role)) {
      throw forbidden("غير مصرح بالوصول إلى التقارير اليومية");
    }

    const { searchParams } = new URL(req.url);
    const dateKey = searchParams.get("date") || undefined;
    const rawCat = searchParams.get("category");
    const category: ReportCategoryFilter =
      rawCat === "ARABIC" || rawCat === "LANGUAGES" ? rawCat : "ALL";
    const rawMode = searchParams.get("studyMode");
    const studyMode: ReportStudyModeFilter =
      rawMode === "ONLINE" || rawMode === "OFFLINE" ? rawMode : "ALL";
    const centerName = searchParams.get("center") || undefined;

    const report = await DailyReportsService.getDailyReport({
      dateKey,
      category,
      studyMode,
      centerName,
    });

    return NextResponse.json(report);
  } catch (err) {
    return jsonError(err);
  }
}

