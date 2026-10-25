import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";
import { forbidden, jsonError, notFound, parseJson } from "@/lib/http";
import { CurriculumService } from "@/services/curriculum.service";
import { AnalyticsService } from "@/services/analytics.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  order: z.coerce.number().int().min(0).max(100000).optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) throw forbidden("غير مصرح لك بالوصول");

    const { id } = await params;
    const unit = await CurriculumService.getUnitDetails(id);
    if (!unit) throw notFound("الوحدة غير موجودة");
    return NextResponse.json(unit);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) throw forbidden("غير مصرح لك بالوصول");

    const { id } = await params;
    const body = await parseJson(req, updateSchema);
    const unit = await CurriculumService.updateUnit(id, body);
    await AnalyticsService.logAuditAction(user.id, "UPDATE", "unit", id, {
      fields: Object.keys(body),
    });
    return NextResponse.json({ success: true, unit });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) throw forbidden("غير مصرح لك بالوصول");

    const { id } = await params;
    await CurriculumService.deleteUnit(id);
    await AnalyticsService.logAuditAction(user.id, "DELETE", "unit", id);
    return NextResponse.json({ success: true, message: "تم حذف الوحدة بنجاح" });
  } catch (error) {
    return jsonError(error);
  }
}
