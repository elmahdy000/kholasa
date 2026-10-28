import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { badRequest, notFound } from "@/lib/http";

export class CurriculumHierarchyService {
  /**
   * Fetch all educational systems with their active status
   */
  static async getSystems(activeOnly = false) {
    return prisma.educationalSystem.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { order: "asc" },
      include: {
        grades: {
          orderBy: { order: "asc" },
          include: {
            _count: { select: { subjects: true } },
          },
        },
        _count: { select: { subjects: true, users: true } },
      },
    });
  }

  /**
   * Fetch active educational systems for public display (registration / setup)
   */
  static async getPublicSystems() {
    return prisma.educationalSystem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        grades: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            name: true,
            code: true,
            tracks: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get single educational system by ID
   */
  static async getSystemById(id: string) {
    return prisma.educationalSystem.findUnique({
      where: { id },
      include: {
        grades: {
          orderBy: { order: "asc" },
          include: { tracks: true, subjects: true },
        },
      },
    });
  }

  /**
   * Fetch grades filtered by system
   */
  static async getGrades(systemId?: string) {
    return prisma.grade.findMany({
      where: systemId ? { systemId } : {},
      orderBy: { order: "asc" },
      include: {
        system: { select: { id: true, name: true, code: true } },
        tracks: true,
        _count: { select: { subjects: true, users: true } },
      },
    });
  }

  /**
   * Fetch subjects filtered by system and/or grade
   */
  static async getSubjects(filter: { systemId?: string; gradeId?: string }) {
    const where: Prisma.SubjectWhereInput = {};
    if (filter.systemId) where.systemId = filter.systemId;
    if (filter.gradeId) where.gradeId = filter.gradeId;

    return prisma.subject.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        grade: { select: { id: true, name: true } },
        system: { select: { id: true, name: true } },
        units: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            _count: { select: { lessons: true } },
          },
        },
        _count: { select: { units: true, questions: true, exams: true } },
      },
    });
  }

  /**
   * Get full details of a subject with its units and lessons
   */
  static async getSubjectDetails(subjectId: string, publishedOnly = false) {
    return prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        grade: true,
        system: true,
        units: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              where: publishedOnly ? { isPublished: true } : {},
              orderBy: { order: "asc" },
              include: {
                content: { select: { videoUrl: true, audioUrl: true } },
                mindMap: { select: { images: true } },
                _count: { select: { questions: true } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get complete structure tree (systems, grades, subjects)
   */
  static async getStructureTree() {
    return prisma.educationalSystem.findMany({
      orderBy: { order: "asc" },
      include: {
        grades: {
          orderBy: { order: "asc" },
          include: {
            tracks: true,
            subjects: {
              orderBy: { order: "asc" },
              include: {
                _count: {
                  select: {
                    units: true,
                    questions: true,
                    exams: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Educational Systems Management
   */
  static async createSystem(data: {
    name: string;
    code: string;
    description?: string | null;
    isActive?: boolean;
    order?: number;
  }) {
    const existing = await prisma.educationalSystem.findUnique({ where: { code: data.code } });
    if (existing) {
      throw badRequest("هذا الرمز مستخدم بالفعل لنظام آخر");
    }

    return prisma.educationalSystem.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim(),
        description: data.description?.trim() || null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        order: data.order !== undefined ? Number(data.order) : 0,
      },
    });
  }

  static async updateSystem(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string | null;
      isActive?: boolean;
      order?: number;
    }
  ) {
    return prisma.educationalSystem.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.code !== undefined ? { code: data.code.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
        ...(data.order !== undefined ? { order: Number(data.order) } : {}),
      },
    });
  }

  static async deleteSystem(id: string) {
    return prisma.educationalSystem.delete({ where: { id } });
  }

  /**
   * Academic Grades Management
   */
  static async createGrade(data: {
    name: string;
    code: string;
    systemId: string;
    order?: number;
  }) {
    const system = await prisma.educationalSystem.findUnique({
      where: { id: data.systemId },
      select: { id: true },
    });
    if (!system) {
      throw notFound("النظام التعليمي المحدد غير موجود");
    }

    return prisma.grade.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim(),
        systemId: data.systemId,
        order: data.order !== undefined ? Number(data.order) : 0,
      },
    });
  }

  static async updateGrade(
    id: string,
    data: {
      name?: string;
      code?: string;
      order?: number;
    }
  ) {
    return prisma.grade.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.code !== undefined ? { code: data.code.trim() } : {}),
        ...(data.order !== undefined ? { order: Number(data.order) } : {}),
      },
    });
  }

  static async deleteGrade(id: string) {
    return prisma.grade.delete({ where: { id } });
  }

  /**
   * Subjects Management
   */
  static async createSubject(data: {
    name: string;
    code: string;
    icon?: string | null;
    color?: string;
    description?: string | null;
    systemId: string;
    gradeId: string;
    trackId?: string | null;
    isPublished?: boolean;
    order?: number;
  }) {
    const [system, grade] = await Promise.all([
      prisma.educationalSystem.findUnique({ where: { id: data.systemId }, select: { id: true } }),
      prisma.grade.findUnique({ where: { id: data.gradeId }, select: { id: true } }),
    ]);
    if (!system) throw notFound("النظام التعليمي المحدد غير موجود");
    if (!grade) throw notFound("الصف الدراسي المحدد غير موجود");

    return prisma.subject.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim(),
        icon: data.icon || null,
        color: data.color || "#800020",
        description: data.description?.trim() || null,
        systemId: data.systemId,
        gradeId: data.gradeId,
        trackId: data.trackId || null,
        isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
        order: data.order !== undefined ? Number(data.order) : 0,
      },
    });
  }

  static async updateSubject(
    id: string,
    data: {
      name?: string;
      code?: string;
      icon?: string | null;
      color?: string;
      description?: string | null;
      order?: number;
      isPublished?: boolean;
    }
  ) {
    return prisma.subject.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.code !== undefined ? { code: data.code.trim() } : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.order !== undefined ? { order: Number(data.order) } : {}),
        ...(data.isPublished !== undefined ? { isPublished: Boolean(data.isPublished) } : {}),
      },
    });
  }

  static async deleteSubject(id: string) {
    return prisma.subject.delete({ where: { id } });
  }
}
