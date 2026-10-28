import { prisma } from "@/lib/prisma";
import { QuestionType, Difficulty, PublishStatus, SchoolCategory, Prisma } from "@prisma/client";

export interface ParsedQuestionImportItem {
  statement: string;
  subjectId: string;
  unitId?: string | null;
  lessonId?: string | null;
  questionLesson?: string | null;
  type?: QuestionType;
  difficulty?: Difficulty;
  schoolCategory?: SchoolCategory;
  options?: {
    text: string;
    isCorrect: boolean;
    explanation?: string | null;
    order?: number;
  }[];
  concept?: string | null;
  correctReason?: string | null;
  modelAnswer?: string | null;
  points?: number;
}

export interface BulkImportMeta {
  fileName?: string;
  fileType?: string; // "DOCX" | "PDF" | "MANUAL"
  questionType?: QuestionType;
  difficulty?: Difficulty;
  schoolCategory?: SchoolCategory;
  gradeId?: string;
  subjectId: string;
  unitId?: string | null;
  lessonId?: string | null;
  lessonScope?: "UNIT" | "LESSON";
  trackId?: string | null;
}

export interface QuestionFilterParams {
  subjectId?: string;
  gradeId?: string;
  schoolCategory?: SchoolCategory | "ALL";
  unitId?: string;
  lessonId?: string;
  type?: QuestionType | "ALL";
  difficulty?: Difficulty | "ALL";
  status?: PublishStatus | "ALL";
  search?: string;
  page?: number;
  limit?: number;
}

export interface QuestionCreateInput {
  statement: string;
  subjectId: string;
  unitId?: string | null;
  lessonIds?: string[];
  type?: QuestionType;
  difficulty?: Difficulty;
  status?: PublishStatus;
  options?: {
    text: string;
    isCorrect: boolean;
    order?: number;
    explanation?: string | null;
  }[];
  explanation?: {
    concept: string;
    correctReason: string;
    sectionId?: string | null;
  };
  rubric?: {
    modelAnswer: string;
    criteria?: Prisma.InputJsonValue;
    maxScore?: number;
  };
}

export interface QuestionUpdateInput {
  statement?: string;
  unitId?: string | null;
  lessonIds?: string[];
  type?: QuestionType;
  difficulty?: Difficulty;
  status?: PublishStatus;
  options?: {
    id?: string;
    text: string;
    isCorrect: boolean;
    order?: number;
    explanation?: string | null;
  }[];
  explanation?: {
    concept: string;
    correctReason: string;
    sectionId?: string | null;
  };
  rubric?: {
    modelAnswer: string;
    criteria?: Prisma.InputJsonValue;
    maxScore?: number;
  };
}

export class QuestionService {
  /**
   * Fetch questions with filtering, pagination, and relation includes
   */
  static async getQuestions(params: QuestionFilterParams = {}) {
    const {
      subjectId,
      gradeId,
      schoolCategory,
      unitId,
      lessonId,
      type,
      difficulty,
      status,
      search,
      page = 1,
      limit = 20,
    } = params;

    const where: Prisma.QuestionWhereInput = {};

    if (subjectId) where.subjectId = subjectId;
    if (unitId) where.unitId = unitId;
    if (type && type !== "ALL") where.type = type;
    if (difficulty && difficulty !== "ALL") where.difficulty = difficulty;
    if (status && status !== "ALL") where.status = status;
    if (schoolCategory && schoolCategory !== "ALL") where.schoolCategory = schoolCategory;
    if (gradeId) where.subject = { gradeId };

    if (lessonId) {
      where.lessons = {
        some: { lessonId },
      };
    }

    if (search?.trim()) {
      where.statement = { contains: search.trim(), mode: "insensitive" };
    }

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          subject: { select: { id: true, name: true, color: true, schoolCategory: true, gradeId: true } },
          unit: { select: { id: true, title: true } },
          options: { orderBy: { order: "asc" } },
          explanation: true,
          rubric: true,
          batch: { select: { id: true, fileName: true, fileType: true } },
          lessons: {
            include: {
              lesson: { select: { id: true, title: true } },
            },
          },
        },
      }),
      prisma.question.count({ where }),
    ]);

    return {
      questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single question by ID with options, explanation, and ideal rubric model answer
   */
  static async getQuestionById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        unit: { select: { id: true, title: true } },
        options: { orderBy: { order: "asc" } },
        explanation: true,
        rubric: true,
        lessons: {
          include: {
            lesson: { select: { id: true, title: true } },
          },
        },
      },
    });
  }

  /**
   * Create a new question with attached options, explanation, or ideal essay model answer
   */
  static async createQuestion(data: QuestionCreateInput) {
    const question = await prisma.question.create({
      data: {
        statement: data.statement.trim(),
        subjectId: data.subjectId,
        unitId: data.unitId || null,
        type: data.type || QuestionType.MCQ,
        difficulty: data.difficulty || Difficulty.MEDIUM,
        status: data.status || PublishStatus.PUBLISHED,
        options: data.options?.length
          ? {
              create: data.options.map((opt, idx) => ({
                text: opt.text.trim(),
                isCorrect: Boolean(opt.isCorrect),
                order: opt.order ?? idx,
                explanation: opt.explanation?.trim() || null,
              })),
            }
          : undefined,
        explanation: data.explanation
          ? {
              create: {
                concept: data.explanation.concept.trim(),
                correctReason: data.explanation.correctReason.trim(),
                sectionId: data.explanation.sectionId || null,
              },
            }
          : undefined,
        rubric: data.rubric
          ? {
              create: {
                modelAnswer: data.rubric.modelAnswer.trim(),
                criteria: data.rubric.criteria || [],
                maxScore: Number(data.rubric.maxScore || 10),
              },
            }
          : undefined,
        lessons: data.lessonIds?.length
          ? {
              create: data.lessonIds.map((lessonId) => ({ lessonId })),
            }
          : undefined,
      },
      include: {
        options: { orderBy: { order: "asc" } },
        explanation: true,
        rubric: true,
        lessons: true,
      },
    });

    return question;
  }

  /**
   * Update an existing question
   */
  static async updateQuestion(id: string, data: QuestionUpdateInput) {
    // 1. Update basic question data
    await prisma.question.update({
      where: { id },
      data: {
        statement: data.statement !== undefined ? data.statement.trim() : undefined,
        unitId: data.unitId !== undefined ? data.unitId : undefined,
        type: data.type,
        difficulty: data.difficulty,
        status: data.status,
      },
    });

    // 1.5 Clean mismatched options or rubric when changing question type
    if (data.type === QuestionType.ESSAY) {
      await prisma.questionOption.deleteMany({ where: { questionId: id } });
    } else if (data.type === QuestionType.MCQ || data.type === QuestionType.TRUE_FALSE) {
      await prisma.essayRubric.deleteMany({ where: { questionId: id } });
    }

    // 2. Replace options if provided
    if (data.options) {
      await prisma.questionOption.deleteMany({ where: { questionId: id } });
      await prisma.questionOption.createMany({
        data: data.options.map((opt, idx) => ({
          questionId: id,
          text: opt.text.trim(),
          isCorrect: Boolean(opt.isCorrect),
          order: opt.order ?? idx,
          explanation: opt.explanation?.trim() || null,
        })),
      });
    }

    // 3. Update explanation if provided
    if (data.explanation) {
      await prisma.questionExplanation.upsert({
        where: { questionId: id },
        create: {
          questionId: id,
          concept: data.explanation.concept.trim(),
          correctReason: data.explanation.correctReason.trim(),
          sectionId: data.explanation.sectionId || null,
        },
        update: {
          concept: data.explanation.concept.trim(),
          correctReason: data.explanation.correctReason.trim(),
          sectionId: data.explanation.sectionId || null,
        },
      });
    }

    // 4. Update rubric / ideal model answer if provided
    if (data.rubric) {
      await prisma.essayRubric.upsert({
        where: { questionId: id },
        create: {
          questionId: id,
          modelAnswer: data.rubric.modelAnswer.trim(),
          criteria: data.rubric.criteria || [],
          maxScore: Number(data.rubric.maxScore || 10),
        },
        update: {
          modelAnswer: data.rubric.modelAnswer.trim(),
          criteria: data.rubric.criteria || undefined,
          maxScore: data.rubric.maxScore ? Number(data.rubric.maxScore) : undefined,
        },
      });
    }

    // 5. Update associated lessons if provided
    if (data.lessonIds) {
      await prisma.questionLesson.deleteMany({ where: { questionId: id } });
      if (data.lessonIds.length > 0) {
        await prisma.questionLesson.createMany({
          data: data.lessonIds.map((lessonId) => ({ questionId: id, lessonId })),
        });
      }
    }

    return this.getQuestionById(id);
  }

  /**
   * Delete question and all related options, rubric, and explanation
   */
  static async deleteQuestion(id: string) {
    return prisma.question.delete({
      where: { id },
    });
  }

  /**
   * Fetch statistical breakdown of question bank, optionally by subject, grade, or school category
   */
  static async getQuestionStats(
    params?:
      | {
          subjectId?: string;
          gradeId?: string;
          schoolCategory?: SchoolCategory;
        }
      | string
  ) {
    const filter = typeof params === "string" ? { subjectId: params } : params || {};
    const where: Prisma.QuestionWhereInput = {};
    if (filter.subjectId) where.subjectId = filter.subjectId;
    if (filter.schoolCategory) where.schoolCategory = filter.schoolCategory;
    if (filter.gradeId) where.subject = { gradeId: filter.gradeId };

    const [
      total,
      arabicTotal,
      languagesTotal,
      mcqCount,
      essayCount,
      trueFalseCount,
      easyCount,
      mediumCount,
      hardCount,
    ] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.count({ where: { ...where, schoolCategory: "ARABIC" } }),
      prisma.question.count({ where: { ...where, schoolCategory: "LANGUAGES" } }),
      prisma.question.count({ where: { ...where, type: QuestionType.MCQ } }),
      prisma.question.count({ where: { ...where, type: QuestionType.ESSAY } }),
      prisma.question.count({ where: { ...where, type: QuestionType.TRUE_FALSE } }),
      prisma.question.count({ where: { ...where, difficulty: Difficulty.EASY } }),
      prisma.question.count({ where: { ...where, difficulty: Difficulty.MEDIUM } }),
      prisma.question.count({ where: { ...where, difficulty: Difficulty.HARD } }),
    ]);

    return {
      total,
      byCategory: {
        ARABIC: arabicTotal,
        LANGUAGES: languagesTotal,
      },
      byType: {
        MCQ: mcqCount,
        ESSAY: essayCount,
        TRUE_FALSE: trueFalseCount,
      },
      byDifficulty: {
        EASY: easyCount,
        MEDIUM: mediumCount,
        HARD: hardCount,
      },
    };
  }

  /**
   * Bulk import questions in an atomic database transaction with ImportBatch audit
   */
  static async bulkCreateQuestions(
    questions: ParsedQuestionImportItem[],
    batchMeta?: BulkImportMeta
  ) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("لم يتم تقديم أي أسئلة صالحة للاستيراد");
    }

    const targetSubjectId = batchMeta?.subjectId || questions[0]?.subjectId;
    if (!targetSubjectId) {
      throw new Error("يجب تحديد المادة الدراسية للاستيراد");
    }

    const subject = await prisma.subject.findUnique({
      where: { id: targetSubjectId },
      include: { grade: true, track: true },
    });

    if (!subject) {
      throw new Error("المادة الدراسية المحددة غير موجودة في قاعدة البيانات");
    }

    // Strict validation: prevent cross-category or cross-grade imports!
    if (batchMeta?.schoolCategory && subject.schoolCategory !== batchMeta.schoolCategory) {
      throw new Error(
        `تعارض في الفئة التعليمية: المادة "${subject.name}" تتبع (${subject.schoolCategory}) بينما الفئة المحددة هي (${batchMeta.schoolCategory})`
      );
    }

    if (batchMeta?.gradeId && subject.gradeId !== batchMeta.gradeId) {
      throw new Error(
        `تعارض في الصف الدراسي: المادة المختارة لا تتبع الصف الدراسي المحدد`
      );
    }

    const effectiveSchoolCategory: SchoolCategory = subject.schoolCategory;
    const effectiveGradeId = subject.gradeId;
    const effectiveTrackId = subject.trackId;
    const effectiveUnitId = batchMeta?.unitId || null;
    const effectiveLessonId = batchMeta?.lessonId || null;

    // Validate unit belongs to subject if provided
    if (effectiveUnitId) {
      const unit = await prisma.unit.findFirst({
        where: { id: effectiveUnitId, subjectId: subject.id },
      });
      if (!unit) {
        throw new Error("الوحدة المختارة لا تتبع هذه المادة الدراسية");
      }
    }

    // Validate lesson belongs to unit if provided
    if (effectiveLessonId) {
      const lesson = await prisma.lesson.findFirst({
        where: { id: effectiveLessonId, ...(effectiveUnitId ? { unitId: effectiveUnitId } : {}) },
      });
      if (!lesson) {
        throw new Error("الدرس المختار غير موجود أو لا ينتمي للوحدة المحددة");
      }
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create ImportBatch audit record
      const batch = await tx.importBatch.create({
        data: {
          fileName: batchMeta?.fileName || "استيراد مباشر",
          fileType: batchMeta?.fileType || "DOCX",
          questionType: batchMeta?.questionType || (questions[0]?.type as QuestionType) || "MCQ",
          difficulty: batchMeta?.difficulty || (questions[0]?.difficulty as Difficulty) || null,
          schoolCategory: effectiveSchoolCategory,
          gradeId: effectiveGradeId,
          subjectId: subject.id,
          unitId: effectiveUnitId,
          lessonId: effectiveLessonId,
          trackId: effectiveTrackId,
          importedCount: 0,
        },
      });

      let count = 0;
      for (const q of questions) {
        if (!q.statement) continue;

        let lessonIdToAttach = effectiveLessonId || q.lessonId || null;
        if (!lessonIdToAttach && q.questionLesson && (effectiveUnitId || q.unitId)) {
          const targetUId = (effectiveUnitId || q.unitId)!;
          let matchedLesson = await tx.lesson.findFirst({
            where: { unitId: targetUId, title: q.questionLesson.trim() },
          });
          if (!matchedLesson) {
            matchedLesson = await tx.lesson.create({
              data: {
                unitId: targetUId,
                title: q.questionLesson.trim(),
                order: 99,
              },
            });
          }
          lessonIdToAttach = matchedLesson.id;
        }

        await tx.question.create({
          data: {
            statement: q.statement.trim(),
            type: q.type || batchMeta?.questionType || "MCQ",
            difficulty: q.difficulty || batchMeta?.difficulty || "MEDIUM",
            status: "PUBLISHED",
            schoolCategory: effectiveSchoolCategory,
            subjectId: subject.id,
            unitId: effectiveUnitId || q.unitId || null,
            batchId: batch.id,
            options: {
              create: (q.options || []).map((opt, idx: number) => ({
                text: opt.text.trim(),
                isCorrect: Boolean(opt.isCorrect),
                order: idx + 1,
                explanation: opt.explanation?.trim() || null,
              })),
            },
            ...(lessonIdToAttach
              ? {
                  lessons: {
                    create: {
                      lessonId: lessonIdToAttach,
                    },
                  },
                }
              : {}),
            ...(q.concept && q.correctReason
              ? {
                  explanation: {
                    create: {
                      concept: q.concept.trim(),
                      correctReason: q.correctReason.trim(),
                    },
                  },
                }
              : {}),
            ...(q.type === "ESSAY" && q.modelAnswer
              ? {
                  rubric: {
                    create: {
                      modelAnswer: q.modelAnswer.trim(),
                      maxScore: Number(q.points || 10),
                    },
                  },
                }
              : {}),
          },
        });
        count++;
      }

      await tx.importBatch.update({
        where: { id: batch.id },
        data: { importedCount: count },
      });

      return { count, batchId: batch.id };
    });
  }
}

