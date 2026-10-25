import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isStaff, canManageCurriculum } from "@/lib/auth";
import { forbidden, jsonError, parseJson } from "@/lib/http";
import { CurriculumService } from "@/services/curriculum.service";
import { AnalyticsService } from "@/services/analytics.service";

const createSchema = z.object({
  unitId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  durationMinutes: z.coerce.number().int().min(1).max(1000).optional(),
  order: z.coerce.number().int().min(0).max(100000).optional(),
  isPublished: z.boolean().optional(),
  videoUrl: z.string().max(2000).nullable().optional(),
  audioUrl: z.string().max(2000).nullable().optional(),
  bodyText: z.string().max(500000).optional(),
  objectives: z.array(z.string().max(1000)).max(100).optional(),
  images: z.array(z.string().max(2000)).max(100).optional(),
});

// GET: List lessons for a unit or search (paginated, default 50, max 100)
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) throw forbidden("غير مصرح لك بالوصول");

    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId") || undefined;
    const search = searchParams.get("search")?.slice(0, 100) || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 50;

    const lessons = await CurriculumService.getLessonsList({ unitId, search, page, limit });
    return NextResponse.json({ lessons });
  } catch (error) {
    return jsonError(error);
  }
}

// POST: Create a new lesson
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) throw forbidden("غير مصرح لك بالوصول");

    const body = await parseJson(req, createSchema);
    const lesson = await CurriculumService.createLesson(body);
    await AnalyticsService.logAuditAction(user.id, "CREATE", "lesson", lesson.id, {
      title: lesson.title,
    });
    return NextResponse.json({ success: true, lesson });
  } catch (error) {
    return jsonError(error);
  }
}
