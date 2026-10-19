import { prisma } from "@/lib/prisma";

export class OfflineService {
  /**
   * Package full lesson contents, golden summary, and mindmap assets into an offline-ready payload
   */
  static async generateLessonOfflinePackage(lessonId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        unit: {
          select: {
            id: true,
            title: true,
            subject: { select: { id: true, name: true, color: true } },
          },
        },
        content: true,
        summary: true,
        mindMap: true,
      },
    });

    if (!lesson) {
      throw new Error("الدرس غير موجود لتحميله أوفلاين");
    }

    return {
      id: lesson.id,
      title: lesson.title,
      unitTitle: lesson.unit.title,
      subjectName: lesson.unit.subject.name,
      subjectColor: lesson.unit.subject.color,
      durationMinutes: lesson.durationMinutes,
      body: lesson.content?.body || "",
      videoUrl: lesson.content?.videoUrl || null,
      audioUrl: lesson.content?.audioUrl || null,
      objectives: lesson.content?.objectives || [],
      summary: lesson.summary
        ? {
            keyConcepts: lesson.summary.keyConcepts,
            definitions: lesson.summary.definitions,
            formulas: lesson.summary.formulas,
            comparisons: lesson.summary.comparisons,
            examTips: lesson.summary.examTips,
            commonMistakes: lesson.summary.commonMistakes,
            checklist: lesson.summary.checklist,
          }
        : null,
      mindMap: lesson.mindMap
        ? {
            title: lesson.mindMap.title,
            images: lesson.mindMap.images,
          }
        : null,
      downloadedAt: new Date().toISOString(),
    };
  }
}
