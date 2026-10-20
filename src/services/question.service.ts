import { prisma } from "@/lib/prisma";
import { QuestionType, Difficulty, PublishStatus } from "@prisma/client";

export interface QuestionFilterParams {
  subjectId?: string;
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
    criteria?: any[];
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
    criteria?: any[];
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
      unitId,
      lessonId,
      type,
      difficulty,
      status,
      search,
      page = 1,
      limit = 20,
    } = params;

    const where: any = {};

    if (subjectId) where.subjectId = subjectId;
    if (unitId) where.unitId = unitId;
    if (type && type !== "ALL") where.type = type;
    if (difficulty && difficulty !== "ALL") where.difficulty = difficulty;
    if (status && status !== "ALL") where.status = status;

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
   * Fetch statistical breakdown of question bank
   */
  static async getQuestionStats(subjectId?: string) {
    const where: any = {};
    if (subjectId) where.subjectId = subjectId;

    const [total, mcqCount, essayCount, trueFalseCount, easyCount, mediumCount, hardCount] =
      await Promise.all([
        prisma.question.count({ where }),
        prisma.question.count({ where: { ...where, type: QuestionType.MCQ } }),
        prisma.question.count({ where: { ...where, type: QuestionType.ESSAY } }),
        prisma.question.count({ where: { ...where, type: QuestionType.TRUE_FALSE } }),
        prisma.question.count({ where: { ...where, difficulty: Difficulty.EASY } }),
        prisma.question.count({ where: { ...where, difficulty: Difficulty.MEDIUM } }),
        prisma.question.count({ where: { ...where, difficulty: Difficulty.HARD } }),
      ]);

    return {
      total,
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
   * Bulk import questions in an atomic database transaction
   */
  static async bulkCreateQuestions(questions: any[]) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("لم يتم تقديم أي أسئلة صالحة للاستيراد");
    }

    return prisma.$transaction(async (tx) => {
      let count = 0;
      for (const q of questions) {
        if (!q.statement || !q.subjectId) continue;

        await tx.question.create({
          data: {
            statement: q.statement.trim(),
            type: q.type || "MCQ",
            difficulty: q.difficulty || "MEDIUM",
            status: "PUBLISHED",
            subjectId: q.subjectId,
            unitId: q.unitId || null,
            options: {
              create: (q.options || []).map((opt: any, idx: number) => ({
                text: opt.text.trim(),
                isCorrect: Boolean(opt.isCorrect),
                order: idx + 1,
                explanation: opt.explanation?.trim() || null,
              })),
            },
            ...(q.lessonId
              ? {
                  lessons: {
                    create: {
                      lessonId: q.lessonId,
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
      return count;
    });
  }
}

