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
   * Delete a unit
   */
  static async deleteUnit(id: string) {
    return prisma.unit.delete({
      where: { id },
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
}
