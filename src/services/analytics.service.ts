import { prisma } from "@/lib/prisma";
import { Role, QuestionType, Difficulty } from "@prisma/client";

export class AnalyticsService {
  /**
   * Fetch system-wide platform analytics for the admin overview
   */
  static async getAdminPlatformMetrics() {
    const [
      studentsCount,
      teachersCount,
      subjectsCount,
      unitsCount,
      lessonsCount,
      questionsCount,
      examsCount,
      attemptsCount,
      attempts,
      mcqQuestions,
      essayQuestions,
      trueFalseQuestions,
      easyQuestions,
      mediumQuestions,
      hardQuestions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: { in: [Role.TEACHER, Role.EDITOR, Role.ADMIN] } } }),
      prisma.subject.count(),
      prisma.unit.count(),
      prisma.lesson.count(),
      prisma.question.count(),
      prisma.exam.count(),
      prisma.examAttempt.count({ where: { isCompleted: true } }),
      prisma.examAttempt.findMany({
        where: { isCompleted: true },
        select: { percentage: true },
        take: 200,
        orderBy: { completedAt: "desc" },
      }),
      prisma.question.count({ where: { type: QuestionType.MCQ } }),
      prisma.question.count({ where: { type: QuestionType.ESSAY } }),
      prisma.question.count({ where: { type: QuestionType.TRUE_FALSE } }),
      prisma.question.count({ where: { difficulty: Difficulty.EASY } }),
      prisma.question.count({ where: { difficulty: Difficulty.MEDIUM } }),
      prisma.question.count({ where: { difficulty: Difficulty.HARD } }),
    ]);

    const avgScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0;

    return {
      overview: {
        studentsCount,
        teachersCount,
        subjectsCount,
        unitsCount,
        lessonsCount,
        questionsCount,
        examsCount,
        attemptsCount,
        avgScore,
      },
      questionBankDistribution: {
        byType: {
          MCQ: mcqQuestions,
          ESSAY: essayQuestions,
          TRUE_FALSE: trueFalseQuestions,
        },
        byDifficulty: {
          EASY: easyQuestions,
          MEDIUM: mediumQuestions,
          HARD: hardQuestions,
        },
      },
    };
  }

  /**
   * Record an action in the system AuditLog
   */
  static async logAuditAction(
    userId: string | null,
    action: string,
    resource: string,
    resourceId?: string | null,
    details?: any
  ) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId: resourceId || null,
          details: details || null,
        },
      });
    } catch (err) {
      console.error("Audit log recording failed:", err);
      return null;
    }
  }

  /**
   * Retrieve recent system audit logs
   */
  static async getAuditLogs(limit = 50) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }
}
