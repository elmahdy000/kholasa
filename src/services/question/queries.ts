import { prisma } from "@/lib/prisma";
import { QuestionType, Difficulty, SchoolCategory, Prisma } from "@prisma/client";
import type { QuestionFilterParams } from "./types";

export class QuestionQueriesService {
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
}
