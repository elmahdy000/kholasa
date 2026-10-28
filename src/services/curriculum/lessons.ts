import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { badRequest, notFound } from "@/lib/http";
import { LessonCreateInput, LessonUpdateInput } from "./types";

export class CurriculumLessonsService {
  /**
   * Fetch complete lesson with content, summary, and mindmap
   */
  static async getLesson(lessonId: string) {
    return prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        unit: {
          include: {
            subject: {
              select: { id: true, name: true, color: true, icon: true },
            },
          },
        },
        content: true,
        summary: true,
        mindMap: true,
        questions: {
          include: {
            question: {
              include: {
                options: { orderBy: { order: "asc" } },
                explanation: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create a new lesson with attached content, summary, and mindmap
   */
  static async createLesson(data: LessonCreateInput) {
    const unitExists = await prisma.unit.findUnique({
      where: { id: data.unitId },
      select: { id: true },
    });
    if (!unitExists) {
      throw notFound("الوحدة المحددة غير موجودة");
    }

    let lessonOrder = data.order;
    if (lessonOrder === undefined || lessonOrder === null) {
      const highest = await prisma.lesson.findFirst({
        where: { unitId: data.unitId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      lessonOrder = (highest?.order ?? -1) + 1;
    }

    return prisma.lesson.create({
      data: {
        title: data.title.trim(),
        unitId: data.unitId,
        order: Number(lessonOrder),
        durationMinutes: Number(data.durationMinutes || 15),
        isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
        content: {
          create: {
            body: data.bodyText?.trim() || "محتوى وشرح تفصيلي للدرس...",
            videoUrl: data.videoUrl?.trim() || null,
            audioUrl: data.audioUrl?.trim() || null,
            objectives: Array.isArray(data.objectives) ? data.objectives : [],
          },
        },
        mindMap: {
          create: {
            title: `خريطة: ${data.title.trim()}`,
            images: Array.isArray(data.images) ? data.images : [],
            nodes: [],
            edges: [],
          },
        },
        summary: {
          create: {
            keyConcepts: [],
            definitions: [],
            formulas: [],
            comparisons: [],
            examTips: [],
            commonMistakes: [],
            checklist: [],
          },
        },
      },
      include: {
        content: true,
        summary: true,
        mindMap: true,
      },
    });
  }

  /**
   * List lessons for a unit or search
   */
  static async getLessonsList(
    params: { unitId?: string; search?: string; page?: number; limit?: number } = {}
  ) {
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);
    const page = Math.max(params.page ?? 1, 1);
    const where: Prisma.LessonWhereInput = {};
    if (params.unitId && params.unitId !== "all") where.unitId = params.unitId;
    if (params.search?.trim()) {
      where.title = { contains: params.search.trim(), mode: "insensitive" };
    }

    return prisma.lesson.findMany({
      where,
      orderBy: { order: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        unit: {
          include: {
            subject: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        content: { select: { videoUrl: true, audioUrl: true } },
        mindMap: { select: { images: true } },
        summary: true,
        _count: { select: { questions: true } },
      },
    });
  }

  /**
   * Update an existing lesson
   */
  static async updateLesson(lessonId: string, data: LessonUpdateInput) {
    // 1. Update basic lesson record
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        durationMinutes: data.durationMinutes !== undefined ? Number(data.durationMinutes) : undefined,
        order: data.order !== undefined ? Number(data.order) : undefined,
        isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : undefined,
      },
    });

    // 2. Update content if provided
    const bodyText = data.bodyText ?? data.content?.body;
    const videoUrl = data.videoUrl !== undefined ? data.videoUrl : data.content?.videoUrl;
    const audioUrl = data.audioUrl !== undefined ? data.audioUrl : data.content?.audioUrl;
    const objectives = data.objectives ?? data.content?.objectives;

    if (bodyText !== undefined || videoUrl !== undefined || audioUrl !== undefined || objectives !== undefined) {
      await prisma.lessonContent.upsert({
        where: { lessonId },
        create: {
          lessonId,
          body: bodyText?.trim() || "",
          videoUrl: videoUrl?.trim() || null,
          audioUrl: audioUrl?.trim() || null,
          objectives: Array.isArray(objectives) ? objectives : [],
        },
        update: {
          body: bodyText !== undefined ? bodyText.trim() : undefined,
          videoUrl: videoUrl !== undefined ? (videoUrl?.trim() || null) : undefined,
          audioUrl: audioUrl !== undefined ? (audioUrl?.trim() || null) : undefined,
          objectives: Array.isArray(objectives) ? objectives : undefined,
        },
      });
    }

    // 3. Update mindmap if provided
    const mm = data.mindMap;
    const mmImages = mm?.images ?? data.images;
    if (mm || mmImages !== undefined) {
      await prisma.mindMap.upsert({
        where: { lessonId },
        create: {
          lessonId,
          title: mm?.title?.trim() || `خريطة: ${data.title || updatedLesson.title}`,
          description: mm?.description?.trim() || null,
          images: Array.isArray(mmImages) ? mmImages : [],
          nodes: (mm?.nodes !== undefined ? mm.nodes : []) as Prisma.InputJsonValue,
          edges: (mm?.edges !== undefined ? mm.edges : []) as Prisma.InputJsonValue,
        },
        update: {
          title: mm?.title !== undefined ? mm.title.trim() : undefined,
          description: mm?.description !== undefined ? (mm.description?.trim() || null) : undefined,
          images: mmImages !== undefined ? (Array.isArray(mmImages) ? mmImages : []) : undefined,
          nodes: mm?.nodes !== undefined ? (mm.nodes as Prisma.InputJsonValue) : undefined,
          edges: mm?.edges !== undefined ? (mm.edges as Prisma.InputJsonValue) : undefined,
        },
      });
    }

    // 4. Update golden summary if provided
    if (data.summary) {
      await prisma.lessonSummary.upsert({
        where: { lessonId },
        create: {
          lessonId,
          keyConcepts: data.summary.keyConcepts || [],
          definitions: data.summary.definitions || [],
          formulas: data.summary.formulas || [],
          comparisons: data.summary.comparisons || [],
          examTips: data.summary.examTips || [],
          commonMistakes: data.summary.commonMistakes || [],
          checklist: data.summary.checklist || [],
        },
        update: {
          keyConcepts: data.summary.keyConcepts !== undefined ? data.summary.keyConcepts : undefined,
          definitions: data.summary.definitions !== undefined ? data.summary.definitions : undefined,
          formulas: data.summary.formulas !== undefined ? data.summary.formulas : undefined,
          comparisons: data.summary.comparisons !== undefined ? data.summary.comparisons : undefined,
          examTips: data.summary.examTips !== undefined ? data.summary.examTips : undefined,
          commonMistakes: data.summary.commonMistakes !== undefined ? data.summary.commonMistakes : undefined,
          checklist: data.summary.checklist !== undefined ? data.summary.checklist : undefined,
        },
      });
    }

    return this.getLesson(lessonId);
  }

  /**
   * Delete lesson and cascade related data
   */
  static async deleteLesson(lessonId: string) {
    return prisma.lesson.delete({
      where: { id: lessonId },
    });
  }

  /**
   * Reorder lessons within a unit
   */
  static async reorderLessons(unitId: string, orderedLessonIds: string[]) {
    return prisma.$transaction(
      orderedLessonIds.map((id, index) =>
        prisma.lesson.update({
          where: { id, unitId },
          data: { order: index },
        })
      )
    );
  }

  /**
   * Toggle published state for a lesson
   */
  static async toggleLessonPublish(lessonId: string, isPublished: boolean) {
    return prisma.lesson.update({
      where: { id: lessonId },
      data: { isPublished },
    });
  }

  /**
   * Toggle publish status for Subject, Unit, or Lesson
   */
  static async toggleEntityPublish(entity: "subject" | "unit" | "lesson", id: string, isPublished: boolean) {
    if (entity === "subject") {
      const exists = await prisma.subject.findUnique({ where: { id }, select: { id: true } });
      if (!exists) throw notFound("المادة غير موجودة");
      return prisma.subject.update({ where: { id }, data: { isPublished: Boolean(isPublished) } });
    }
    if (entity === "unit") {
      const exists = await prisma.unit.findUnique({ where: { id }, select: { id: true } });
      if (!exists) throw notFound("الوحدة غير موجودة");
      return prisma.unit.update({ where: { id }, data: { isPublished: Boolean(isPublished) } });
    }
    if (entity === "lesson") {
      const exists = await prisma.lesson.findUnique({ where: { id }, select: { id: true } });
      if (!exists) throw notFound("الدرس غير موجود");
      return prisma.lesson.update({ where: { id }, data: { isPublished: Boolean(isPublished) } });
    }
    throw badRequest("نوع الكيان غير صالح للتعديل");
  }
}
