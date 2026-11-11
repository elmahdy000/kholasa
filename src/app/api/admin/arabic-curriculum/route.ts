import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { forbidden, jsonError, parseJson } from "@/lib/http";
import { ArabicCurriculumService } from "@/services/arabic-curriculum.service";
import { emitRealtimeEvent, revalidatePlatformPaths } from "@/lib/realtime";

export const dynamic = "force-dynamic";

async function requireArabicAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    throw forbidden("صلاحيات الإدارة مطلوبة لإدارة منهج اللغة العربية");
  }
  return user;
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("preview"),
    lessonId: z.string().trim().min(1).optional(),
    rawJson: z.unknown(),
  }),
  z.object({
    action: z.literal("save_draft"),
    lessonId: z.string().trim().min(1),
    notes: z.string().max(1000).optional(),
    rawJson: z.unknown(),
  }),
  z.object({
    action: z.literal("publish"),
    lessonId: z.string().trim().min(1),
    versionId: z.string().trim().min(1),
  }),
  z.object({
    action: z.literal("rollback"),
    lessonId: z.string().trim().min(1),
    versionId: z.string().trim().min(1),
  }),
]);

export async function GET() {
  try {
    await requireArabicAdmin();
    const workspace = await ArabicCurriculumService.getAdminArabicWorkspace();
    return NextResponse.json(workspace, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireArabicAdmin();
    const body = await parseJson(req, actionSchema);

    if (body.action === "preview") {
      const preview = await ArabicCurriculumService.previewJsonImport(body.rawJson, body.lessonId);
      return NextResponse.json({ success: true, ...preview });
    }

    if (body.action === "save_draft") {
      const saved = await ArabicCurriculumService.saveDraftVersion(
        admin.id,
        body.lessonId,
        body.rawJson,
        body.notes
      );
      revalidatePlatformPaths([`/lessons/${body.lessonId}`, "/admin/curriculum/arabic", `/admin/curriculum/lessons/${body.lessonId}`]);
      emitRealtimeEvent({
        topic: "curriculum",
        action: "arabic_saved_draft",
        audience: "all",
        entityId: body.lessonId,
      });
      return NextResponse.json({ success: true, ...saved });
    }

    if (body.action === "publish") {
      const published = await ArabicCurriculumService.publishLessonVersion(
        admin.id,
        body.lessonId,
        body.versionId
      );
      revalidatePlatformPaths([`/lessons/${body.lessonId}`, "/admin/curriculum/arabic", `/admin/curriculum/lessons/${body.lessonId}`]);
      emitRealtimeEvent({
        topic: "curriculum",
        action: "arabic_published",
        audience: "all",
        entityId: body.lessonId,
      });
      return NextResponse.json({ success: true, ...published });
    }

    const restored = await ArabicCurriculumService.rollbackLessonVersion(
      admin.id,
      body.lessonId,
      body.versionId
    );
    revalidatePlatformPaths([`/lessons/${body.lessonId}`, "/admin/curriculum/arabic", `/admin/curriculum/lessons/${body.lessonId}`]);
    emitRealtimeEvent({
      topic: "curriculum",
      action: "arabic_rolled_back",
      audience: "all",
      entityId: body.lessonId,
    });
    return NextResponse.json({ success: true, ...restored });
  } catch (error) {
    return jsonError(error);
  }
}
