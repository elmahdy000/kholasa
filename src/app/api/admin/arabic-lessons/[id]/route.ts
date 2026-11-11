import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, canManageCurriculum } from "@/lib/auth";
import { forbidden, jsonError, parseJson } from "@/lib/http";
import { ArabicCurriculumService } from "@/services/arabic-curriculum.service";
import { emitRealtimeEvent, revalidatePlatformPaths } from "@/lib/realtime";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const editorSaveSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  order: z.coerce.number().int().min(0).max(100000).optional(),
  durationMinutes: z.coerce.number().int().min(1).max(1000).optional(),
  isPublished: z.boolean().optional(),
  isTrial: z.boolean().optional(),
  videoUrl: z.string().max(2000).nullable().optional(),
  audioUrl: z.string().max(2000).nullable().optional(),
  pdfUrl: z.string().max(2000).nullable().optional(),
  sections: z.array(z.any()).optional(),
  visualAssets: z.array(z.any()).optional(),
  vocabularyItems: z.array(z.any()).optional(),
  writingModels: z.array(z.any()).optional(),
  studentQuickReference: z.any().optional(),
  practiceStage: z.any().optional(),
  finalAssessment: z.any().optional(),
  publishMode: z.enum(["draft", "publish"]).optional().default("publish"),
  notes: z.string().max(1000).optional(),
});

const questionUpsertSchema = z.object({
  questionId: z.string().trim().min(1).optional(),
  externalKey: z.string().trim().max(100).optional(),
  statement: z.string().trim().min(1).max(5000),
  type: z.enum(["MCQ", "TRUE_FALSE", "ESSAY"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  sectionAnchorId: z.string().trim().min(1),
  skillCategory: z.string().optional(),
  origin: z.string().optional(),
  concept: z.string().max(500).optional(),
  correctReason: z.string().max(5000).optional(),
  examTrick: z.string().max(2000).nullable().optional(),
  modelAnswer: z.string().max(10000).nullable().optional(),
  points: z.coerce.number().int().min(1).max(100).optional(),
  sourceReferences: z
    .array(
      z.object({
        sourceId: z.string().trim().min(1),
        pages: z.array(z.coerce.number().int().min(1)),
      })
    )
    .optional(),
  options: z
    .array(
      z.object({
        text: z.string().trim().min(1),
        isCorrect: z.boolean(),
      })
    )
    .optional(),
});

async function requireCurriculumEditor() {
  const user = await getCurrentUser();
  if (!user || !canManageCurriculum(user.role)) {
    throw forbidden("صلاحيات إدارة المنهج مطلوبة");
  }
  return user;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await requireCurriculumEditor();
    const { id } = await params;
    const data = await ArabicCurriculumService.getArabicLessonEditorData(id);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const user = await requireCurriculumEditor();
    const { id } = await params;
    const body = await parseJson(req, editorSaveSchema);
    const result = await ArabicCurriculumService.saveArabicLessonEditorData(
      user.id,
      id,
      body
    );
    revalidatePlatformPaths([`/lessons/${id}`, "/admin/curriculum/arabic", `/admin/curriculum/lessons/${id}`]);
    emitRealtimeEvent({
      topic: "curriculum",
      action: "arabic_lesson_saved",
      audience: "all",
      entityId: id,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await requireCurriculumEditor();
    const { id } = await params;
    const body = await parseJson(req, questionUpsertSchema);
    const saved = await ArabicCurriculumService.upsertArabicLessonQuestion(
      user.id,
      id,
      body as any
    );
    revalidatePlatformPaths([`/lessons/${id}`, "/admin/curriculum/arabic", `/admin/curriculum/lessons/${id}`]);
    emitRealtimeEvent({
      topic: "curriculum",
      action: "arabic_question_saved",
      audience: "all",
      entityId: id,
    });
    return NextResponse.json({ success: true, question: saved });
  } catch (error) {
    return jsonError(error);
  }
}

