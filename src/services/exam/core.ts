import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
  }) {
    const {
      title,
      description,
      subjectId,
      durationMinutes = 30,
      isPractice = false,
      questionIds = [],
      randomQuestionsCount = 0,
    } = input;

    let selectedQuestionIds: string[] = Array.isArray(questionIds) ? questionIds : [];

    if (selectedQuestionIds.length === 0 && Number(randomQuestionsCount) > 0) {
      const availableQuestions = await prisma.question.findMany({
        where: { subjectId, status: "PUBLISHED" },
        select: { id: true },
        take: Number(randomQuestionsCount),
      });
      selectedQuestionIds = availableQuestions.map((q) => q.id);
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
        questions: { select: { id: true } },
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
