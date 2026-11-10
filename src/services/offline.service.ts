import { prisma } from "@/lib/prisma";
import { forbidden, notFound } from "@/lib/http";
import { canUserAccessLesson, type LessonAccessUser } from "@/lib/lesson-access";

export class OfflineService {
  /**
   * Package full lesson contents, golden summary, and mindmap assets into an offline-ready payload
   */
  static async generateLessonOfflinePackage(
    lessonId: string,
    user?: LessonAccessUser | null
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
        isPublished: true,
        unit: { isPublished: true, subject: { isPublished: true } },
      },
      include: {
        unit: {
          select: {
            id: true,
            title: true,
            order: true,
            isPublished: true,
            subject: {
              select: {
                id: true,
                name: true,
                color: true,
                isPublished: true,
                gradeId: true,
                trackId: true,
                schoolCategory: true,
              },
            },
          },
        },
        content: true,
        summary: true,
        mindMap: true,
      },
    });

    if (!lesson) {
      throw notFound("الدرس غير موجود لتحميله أوفلاين");
    }

    if (user) {
      const access = canUserAccessLesson(user, lesson);
      if (!access.allowed) {
        if (access.reason === "OUT_OF_SCOPE") {
          throw notFound("الدرس غير متاح في مسارك الدراسي");
        }
        throw forbidden("يلزم تفعيل الاشتراك للوصول إلى هذا الدرس وتحميله أوفلاين");
      }
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
      pdfUrl: lesson.content?.pdfUrl || null,
      objectives: lesson.content?.objectives || [],
      summary: lesson.summary
        ? {
            pdfUrl: lesson.summary.pdfUrl,
            images: lesson.summary.images,
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
