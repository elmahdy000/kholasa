import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";
import { forbidden, jsonError, parseJson } from "@/lib/http";
import { CurriculumService } from "@/services/curriculum.service";
import { AnalyticsService } from "@/services/analytics.service";

const createSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  order: z.coerce.number().int().min(0).max(100000).optional(),
  isPublished: z.boolean().optional(),
});

// GET: List units by subjectId (paginated, default 50, max 100)
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) throw forbidden("غير مصرح لك بالوصول");

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId") || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 50;

    const units = await CurriculumService.getUnits(subjectId, page, limit);
    return NextResponse.json({ units });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) throw forbidden("غير مصرح لك بالوصول");

    const body = await parseJson(req, createSchema);
    const unit = await CurriculumService.createUnit(body);
    await AnalyticsService.logAuditAction(user.id, "CREATE", "unit", unit.id, {
      title: unit.title,
    });
    return NextResponse.json({ success: true, unit });
  } catch (error) {
    return jsonError(error);
  }
}
