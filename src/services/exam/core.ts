import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { randomInt } from "crypto";
import { z } from "zod";
import { badRequest } from "@/lib/http";

const officialExamSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  subjectId: z.string().min(1),
  durationMinutes: z.number().int().min(1).max(1440).default(30),
  isPractice: z.boolean().default(false),
  questionIds: z.array(z.string().min(1)).max(500).default([]),
  randomQuestionsCount: z.number().int().min(0).max(500).default(0),
  unitId: z.string().min(1).nullable().optional(),
  lessonId: z.string().min(1).nullable().optional(),
});

export class ExamCoreService {
  /**
   * Fetch official and past exams
   */
  static async getExams(subjectId?: string) {
    const where: Prisma.ExamWhereInput = { isCustom: false };
    if (subjectId) where.subjectId = subjectId;

    return prisma.exam.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        _count: { select: { questions: true, attempts: true } },
      },
    });
  }

  /**
   * Get single exam by ID with questions
   */
  static async getExamById(id: string) {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              include: {
                options: {
                  select: { id: true, text: true, order: true },
                },
                explanation: true,
                rubric: {
                  select: { modelAnswer: true, criteria: true, maxScore: true },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create official pre-built exam (Admin)
   */
  static async createOfficialExam(input: {
    title: string;
    description?: string | null;
    subjectId: string;
    durationMinutes?: number;
    isPractice?: boolean;
    questionIds?: string[];
    randomQuestionsCount?: number;
    unitId?: string | null;
    lessonId?: string | null;
  }) {
    const {
      title,
      description,
      subjectId,
      durationMinutes = 30,
      isPractice = false,
      questionIds = [],
      randomQuestionsCount = 0,
      unitId,
      lessonId,
    } = officialExamSchema.parse(input);

    let selectedQuestionIds = [...new Set(questionIds)];
    if (selectedQuestionIds.length === 0 && randomQuestionsCount === 0) {
      throw badRequest("يجب اختيار سؤال واحد على الأقل أو تحديد عدد الأسئلة العشوائية");
    }
    if (unitId && !await prisma.unit.findFirst({ where: { id: unitId, subjectId }, select: { id: true } })) {
      throw badRequest("الوحدة المختارة لا تتبع المادة المحددة");
    }
    if (lessonId && !await prisma.lesson.findFirst({
      where: { id: lessonId, unit: { subjectId }, ...(unitId ? { unitId } : {}) }, select: { id: true },
    })) {
      throw badRequest("الدرس المختار لا يتبع المادة أو الوحدة المحددة");
    }
    const questionWhere: Prisma.QuestionWhereInput = {
      subjectId, status: "PUBLISHED",
      ...(unitId ? { unitId } : {}),
      ...(lessonId ? { lessons: { some: { lessonId } } } : {}),
    };

    if (selectedQuestionIds.length > 0) {
      const matchingCount = await prisma.question.count({ where: { ...questionWhere, id: { in: selectedQuestionIds } } });
      if (matchingCount !== selectedQuestionIds.length) {
        throw badRequest("بعض الأسئلة غير منشورة أو لا تنتمي إلى نطاق الامتحان المحدد");
      }
    }

    if (selectedQuestionIds.length === 0 && Number(randomQuestionsCount) > 0) {
      const questionWhere: Prisma.QuestionWhereInput = {
        subjectId,
        status: "PUBLISHED",
      };
      if (unitId) {
        questionWhere.unitId = unitId;
      }
      if (lessonId) {
        questionWhere.lessons = {
          some: { lessonId },
        };
      }

      const availableQuestions = await prisma.question.findMany({
        where: questionWhere,
        select: { id: true },
      });
      if (availableQuestions.length < randomQuestionsCount) {
        throw badRequest(`عدد الأسئلة المتاحة (${availableQuestions.length}) أقل من العدد المطلوب (${randomQuestionsCount})`);
      }
      for (let i = availableQuestions.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [availableQuestions[i], availableQuestions[j]] = [availableQuestions[j], availableQuestions[i]];
      }
      selectedQuestionIds = availableQuestions.slice(0, randomQuestionsCount).map((q) => q.id);
    }

    return prisma.exam.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        subjectId,
        durationMinutes: Number(durationMinutes),
        isPractice: Boolean(isPractice),
        questions: {
          create: selectedQuestionIds.map((qId, idx) => ({
            questionId: qId,
            order: idx + 1,
          })),
        },
      },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        questions: { select: { id: true, questionId: true, order: true } },
      },
    });
  }

  /**
   * Update an existing exam (Admin)
   */
  static async updateExam(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      durationMinutes?: number;
      isPractice?: boolean;
    }
  ) {
    return prisma.exam.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.durationMinutes !== undefined ? { durationMinutes: Number(data.durationMinutes) } : {}),
        ...(data.isPractice !== undefined ? { isPractice: Boolean(data.isPractice) } : {}),
      },
    });
  }

  /**
   * Delete an exam
   */
  static async deleteExam(id: string) {
    return prisma.exam.delete({
      where: { id },
    });
  }

  /**
   * List exams with analytics summary for Admin dashboard
   */
  static async getAdminExamsList(subjectId?: string) {
    const where: Prisma.ExamWhereInput = {};
    if (subjectId && subjectId !== "all") {
      where.subjectId = subjectId;
    }

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        questions: {
          select: { id: true, questionId: true },
        },
        attempts: {
          select: { id: true, score: true, percentage: true, isCompleted: true },
        },
      },
    });

    return exams.map((exam) => {
      const completedAttempts = exam.attempts.filter((a) => a.isCompleted);
      const attemptsCount = completedAttempts.length;
      const avgPercentage =
        attemptsCount > 0
          ? Math.round(
              completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
                attemptsCount
            )
          : 0;

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        isPractice: exam.isPractice,
        subject: exam.subject,
        questionsCount: exam.questions.length,
        attemptsCount,
        avgPercentage,
        createdAt: exam.createdAt,
      };
    });
  }
}
