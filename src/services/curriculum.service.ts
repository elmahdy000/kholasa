import { prisma } from "@/lib/prisma";

export interface LessonCreateInput {
  unitId: string;
  title: string;
  durationMinutes?: number;
  order?: number;
  isPublished?: boolean;
  videoUrl?: string | null;
  audioUrl?: string | null;
  bodyText?: string;
  objectives?: string[];
  images?: string[];
}

export interface LessonUpdateInput {
  title?: string;
  durationMinutes?: number;
  order?: number;
  isPublished?: boolean;
  videoUrl?: string | null;
  audioUrl?: string | null;
  bodyText?: string;
  objectives?: string[];
  images?: string[];
  summary?: {
    keyConcepts?: string[];
    definitions?: string[];
    formulas?: string[];
    comparisons?: string[];
    examTips?: string[];
    commonMistakes?: string[];
    checklist?: string[];
  };
}

export class CurriculumService {
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
    const where: any = {};
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
    if (data.bodyText !== undefined || data.videoUrl !== undefined || data.audioUrl !== undefined || data.objectives !== undefined) {
      await prisma.lessonContent.upsert({
        where: { lessonId },
        create: {
          lessonId,
          body: data.bodyText?.trim() || "",
          videoUrl: data.videoUrl?.trim() || null,
          audioUrl: data.audioUrl?.trim() || null,
          objectives: Array.isArray(data.objectives) ? data.objectives : [],
        },
        update: {
          body: data.bodyText !== undefined ? data.bodyText.trim() : undefined,
          videoUrl: data.videoUrl !== undefined ? data.videoUrl?.trim() || null : undefined,
          audioUrl: data.audioUrl !== undefined ? data.audioUrl?.trim() || null : undefined,
          objectives: Array.isArray(data.objectives) ? data.objectives : undefined,
        },
      });
    }

    // 3. Update mindmap images if provided
    if (data.images !== undefined) {
      await prisma.mindMap.upsert({
        where: { lessonId },
        create: {
          lessonId,
          title: `خريطة: ${data.title || updatedLesson.title}`,
          images: Array.isArray(data.images) ? data.images : [],
          nodes: [],
          edges: [],
        },
        update: {
          images: Array.isArray(data.images) ? data.images : [],
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
   * Get full educational structure tree (Systems -> Grades -> Tracks -> Subjects)
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
      throw new Error("هذا الرمز مستخدم بالفعل لنظام آخر");
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
    return prisma.subject.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim(),
        icon: data.icon || null,
        color: data.color || "#4F46E5",
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

  /**
   * Units Management
   */
  static async getUnits(subjectId?: string) {
    const where: any = {};
    if (subjectId) where.subjectId = subjectId;

    return prisma.unit.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        lessons: { orderBy: { order: "asc" } },
        _count: { select: { questions: true } },
      },
    });
  }

  static async createUnit(data: {
    subjectId: string;
    title: string;
    description?: string | null;
    order?: number;
    isPublished?: boolean;
  }) {
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

  static async deleteUnit(id: string) {
    return prisma.unit.delete({
      where: { id },
    });
  }

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

