import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, canManageCurriculum } from "@/lib/auth";
import { forbidden, jsonError, parseJson } from "@/lib/http";
import { CurriculumService } from "@/services/curriculum.service";
import { AnalyticsService } from "@/services/analytics.service";

const bulkImportSchema = z.object({
  subjectId: z.string().min(1, "يرجى تحديد المادة الدراسية"),
  units: z
    .array(
      z.object({
        title: z.string().trim().min(1, "عنوان الوحدة مطلوب").max(200),
        description: z.string().max(2000).nullable().optional(),
        order: z.number().int().min(0).optional(),
        lessons: z
          .array(
            z.object({
              title: z.string().trim().min(1, "عنوان الدرس مطلوب").max(200),
              order: z.number().int().min(0).optional(),
              durationMinutes: z.number().int().min(1).max(600).optional(),
            })
          )
          .default([]),
      })
    )
    .min(1, "يجب تحديد وحدة واحدة على الأقل للاستيراد"),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
      throw forbidden("غير مصرح لك باستيراد المناهج");
    }

    const body = await parseJson(req, bulkImportSchema);
    const createdUnits = await CurriculumService.bulkImportCurriculum(
      body.subjectId,
      body.units
    );

    const totalLessons = createdUnits.reduce((acc, u) => acc + (u.lessons?.length || 0), 0);

    await AnalyticsService.logAuditAction(
      user.id,
      "CREATE",
      "curriculum_bulk_import",
      body.subjectId,
      {
        unitsCount: createdUnits.length,
        lessonsCount: totalLessons,
      }
    );

    return NextResponse.json({
      success: true,
      unitsCount: createdUnits.length,
      lessonsCount: totalLessons,
      units: createdUnits,
    });
  } catch (error) {
    return jsonError(error);
  }
}
