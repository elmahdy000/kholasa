import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, canManageCurriculum } from "@/lib/auth";
import { forbidden, jsonError, parseJson } from "@/lib/http";
import { CurriculumService } from "@/services/curriculum.service";
import { AnalyticsService } from "@/services/analytics.service";

const schema = z.object({
  entity: z.enum(["subject", "unit", "lesson"]),
  id: z.string().min(1),
  isPublished: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) throw forbidden("غير مصرح");

    const { entity, id, isPublished } = await parseJson(req, schema);
    await CurriculumService.toggleEntityPublish(entity, id, isPublished);
    await AnalyticsService.logAuditAction(user.id, "TOGGLE_PUBLISH", entity, id, { isPublished });
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
