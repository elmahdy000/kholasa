import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { notFound } from "@/lib/http";

export class CurriculumUnitsService {
  /**
   * Get single unit details
   */
  static async getUnitDetails(unitId: string) {
    return prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        subject: { select: { id: true, name: true, gradeId: true, systemId: true } },
        lessons: {
          orderBy: { order: "asc" },
          include: {
            content: { select: { videoUrl: true, audioUrl: true } },
            _count: { select: { questions: true } },
          },
        },
      },
    });
  }

  /**
   * Fetch units list for a subject
   */
  static async getUnits(subjectId?: string, page = 1, limit = 50) {
    const take = Math.min(Math.max(limit, 1), 100);
    const where: Prisma.UnitWhereInput = {};
    if (subjectId) where.subjectId = subjectId;

    return prisma.unit.findMany({
      where,
      orderBy: { order: "asc" },
      skip: (Math.max(page, 1) - 1) * take,
      take,
      include: {
        lessons: { orderBy: { order: "asc" } },
        _count: { select: { questions: true } },
      },
    });
  }

  /**
   * Create a new unit
   */
  static async createUnit(data: {
    subjectId: string;
    title: string;
    description?: string | null;
    order?: number;
    isPublished?: boolean;
  }) {
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: { id: true },
    });
    if (!subject) {
      throw notFound("المادة المحددة غير موجودة");
    }

    let unitOrder = data.order;
    if (unitOrder === undefined || unitOrder === null) {
      const highest = await prisma.unit.findFirst({
        where: { subjectId: data.subjectId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      unitOrder = (highest?.order ?? -1) + 1;
    }

    return prisma.unit.create({
      data: {
        subjectId: data.subjectId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        order: Number(unitOrder),
        isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      },
      include: {
        lessons: true,
      },
    });
  }

  /**
   * Update an existing unit
   */
  static async updateUnit(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      order?: number;
      isPublished?: boolean;
    }
  ) {
    return prisma.unit.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.order !== undefined ? { order: Number(data.order) } : {}),
        ...(data.isPublished !== undefined ? { isPublished: Boolean(data.isPublished) } : {}),
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  /**
   * Delete a unit and purge all questions, batches, and lessons completely from database
   */
  static async deleteUnit(id: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Find all lessons belonging to this unit
      const lessons = await tx.lesson.findMany({
        where: { unitId: id },
        select: { id: true },
      });
      const lessonIds = lessons.map((l) => l.id);

      // 2. Find all questions linked to these lessons, or directly to this unit
      const [qlRecords, batchQuestions, unitQuestions] = await Promise.all([
        lessonIds.length > 0
          ? tx.questionLesson.findMany({
              where: { lessonId: { in: lessonIds } },
              select: { questionId: true },
            })
          : Promise.resolve([]),
        tx.question.findMany({
          where: {
            OR: [
              ...(lessonIds.length > 0 ? [{ batch: { lessonId: { in: lessonIds } } }] : []),
              { batch: { unitId: id } },
            ],
          },
          select: { id: true },
        }),
        tx.question.findMany({
          where: { unitId: id },
          select: { id: true },
        }),
      ]);

      const questionIds = Array.from(
        new Set([
          ...qlRecords.map((r) => r.questionId),
          ...batchQuestions.map((q) => q.id),
          ...unitQuestions.map((q) => q.id),
        ])
      );

      // 3. Delete all those questions completely from the database
      if (questionIds.length > 0) {
        await tx.question.deleteMany({
          where: { id: { in: questionIds } },
        });
      }

      // 4. Delete any ImportBatch records for this unit or its lessons
      await tx.importBatch.deleteMany({
        where: {
          OR: [
            ...(lessonIds.length > 0 ? [{ lessonId: { in: lessonIds } }] : []),
            { unitId: id },
          ],
        },
      });

      // 5. Delete the unit (cascades to lessons)
      return tx.unit.delete({
        where: { id },
      });
    });
  }

  /**
   * Reorder units within a subject
   */
  static async reorderUnits(subjectId: string, orderedUnitIds: string[]) {
    return prisma.$transaction(
      orderedUnitIds.map((id, index) =>
        prisma.unit.update({
          where: { id, subjectId },
          data: { order: index },
        })
      )
    );
  }

  /**
   * Bulk import units and their lessons into a subject atomically
   */
  static async bulkImportCurriculum(
    subjectId: string,
    units: {
      title: string;
      description?: string | null;
      order?: number;
      lessons: {
        title: string;
        order?: number;
        durationMinutes?: number;
      }[];
    }[]
  ) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, name: true },
    });
    if (!subject) {
      throw notFound("المادة المحددة غير موجودة");
    }

    if (!Array.isArray(units) || units.length === 0) {
      return [];
    }

    const highestUnit = await prisma.unit.findFirst({
      where: { subjectId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const baseUnitOrder = (highestUnit?.order ?? -1) + 1;

    return prisma.$transaction(async (tx) => {
      const createdUnits = [];
      for (let i = 0; i < units.length; i++) {
        const u = units[i];
        const unit = await tx.unit.create({
          data: {
            subjectId,
            title: u.title.trim(),
            description: u.description?.trim() || null,
            order: baseUnitOrder + (u.order !== undefined ? u.order : i),
            isPublished: true,
            lessons: {
              create: (u.lessons || []).map((l, lIdx) => ({
                title: l.title.trim(),
                order: l.order !== undefined ? l.order : lIdx + 1,
                durationMinutes: l.durationMinutes || 15,
                isPublished: true,
              })),
            },
          },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        });
        createdUnits.push(unit);
      }
      return createdUnits;
    });
  }
}
