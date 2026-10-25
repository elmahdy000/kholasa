import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";
import { forbidden, jsonError, notFound, parseJson } from "@/lib/http";
import { CurriculumService } from "@/services/curriculum.service";
import { AnalyticsService } from "@/services/analytics.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const strList = z.array(z.string().max(5000)).max(200);
const url = z.string().max(2000).nullable().optional();

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  durationMinutes: z.coerce.number().int().min(1).max(1000).optional(),
  order: z.coerce.number().int().min(0).max(100000).optional(),
  isPublished: z.boolean().optional(),
  videoUrl: url,
  audioUrl: url,
  bodyText: z.string().max(500000).optional(),
  objectives: strList.optional(),
  images: z.array(z.string().max(2000)).max(100).optional(),
  content: z
    .object({
      body: z.string().max(500000).optional(),
      videoUrl: url,
      audioUrl: url,
      objectives: strList.optional(),
    })
    .optional(),
  mindMap: z
    .object({
      title: z.string().max(200).optional(),
      description: z.string().max(2000).nullable().optional(),
      images: z.array(z.string().max(2000)).max(100).optional(),
      nodes: z.unknown().optional(),
      edges: z.unknown().optional(),
    })
    .optional(),
  summary: z
    .object({
      keyConcepts: strList.optional(),
      definitions: strList.optional(),
      formulas: strList.optional(),
      comparisons: strList.optional(),
      examTips: strList.optional(),
      commonMistakes: strList.optional(),
      checklist: strList.optional(),
    })
    .optional(),
});

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) throw forbidden("غير مصرح لك بالوصول");

    const { id } = await params;
    const lesson = await CurriculumService.getLesson(id);
    if (!lesson) throw notFound("الدرس غير موجود");
    return NextResponse.json(lesson);
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
    const fullLesson = await CurriculumService.updateLesson(id, body);
    await AnalyticsService.logAuditAction(user.id, "UPDATE", "lesson", id, {
      fields: Object.keys(body),
    });
    return NextResponse.json({ success: true, lesson: fullLesson });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) throw forbidden("غير مصرح لك بالوصول");

    const { id } = await params;
    await CurriculumService.deleteLesson(id);
    await AnalyticsService.logAuditAction(user.id, "DELETE", "lesson", id);
    return NextResponse.json({ success: true, message: "تم حذف الدرس بنجاح" });
  } catch (error) {
    return jsonError(error);
  }
}
