import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, parseJson, unauthorized } from "@/lib/http";
import { ArabicCurriculumService } from "@/services/arabic-curriculum.service";

const upsertSchema = z.object({
  sectionAnchorId: z.string().trim().min(1).max(120),
  stageId: z.string().trim().min(1).max(60),
  isCompleted: z.boolean().optional(),
  state: z.record(z.string(), z.unknown()).nullable().optional(),
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized("يجب تسجيل الدخول أولاً");

    const { id: lessonId } = await context.params;
    const items = await ArabicCurriculumService.getStudentSectionProgress(user.id, lessonId);
    return NextResponse.json({ sectionProgress: items });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized("يجب تسجيل الدخول أولاً");

    const { id: lessonId } = await context.params;
    const body = await parseJson(req, upsertSchema);

    const result = await ArabicCurriculumService.upsertStudentSectionProgress(user, lessonId, body);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return jsonError(error);
  }
}
