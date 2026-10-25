import { prisma } from "@/lib/prisma";
import { Role, QuestionType, Difficulty, Prisma } from "@prisma/client";

export class AnalyticsService {
  /**
   * Fetch system-wide platform analytics for the admin overview
   */
  static async getAdminPlatformMetrics() {
    const [
      usersCount,
      studentsCount,
      teachersCount,
      subjectsCount,
      unitsCount,
      lessonsCount,
      questionsCount,
      examsCount,
      attemptsCount,
      completedAttempts,
      mcqQuestions,
      essayQuestions,
      trueFalseQuestions,
      easyQuestions,
      mediumQuestions,
      hardQuestions,
      auditLogs,
      recentAttempts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: { in: [Role.TEACHER, Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN] } } }),
      prisma.subject.count(),
      prisma.unit.count(),
      prisma.lesson.count(),
      prisma.question.count(),
      prisma.exam.count(),
      prisma.examAttempt.count(),
      prisma.examAttempt.findMany({
        where: { isCompleted: true },
        select: { percentage: true, timeSpentSeconds: true, mode: true },
      }),
      prisma.question.count({ where: { type: QuestionType.MCQ } }),
      prisma.question.count({ where: { type: QuestionType.ESSAY } }),
      prisma.question.count({ where: { type: QuestionType.TRUE_FALSE } }),
      prisma.question.count({ where: { difficulty: Difficulty.EASY } }),
      prisma.question.count({ where: { difficulty: Difficulty.MEDIUM } }),
      prisma.question.count({ where: { difficulty: Difficulty.HARD } }),
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, role: true, email: true } },
        },
      }),
      prisma.examAttempt.findMany({
        take: 8,
        orderBy: { startedAt: "desc" },
        include: {
          user: { select: { name: true } },
          exam: { select: { title: true } },
        },
      }),
    ]);

    // Calculate score brackets & durations
    let scoreHigh = 0; // >= 85%
    let scoreMid = 0;  // 50-84%
    let scoreLow = 0;  // < 50%
    let totalTime = 0;

    completedAttempts.forEach((a) => {
      const p = a.percentage || 0;
      if (p >= 85) scoreHigh++;
      else if (p >= 50) scoreMid++;
      else scoreLow++;
      totalTime += a.timeSpentSeconds || 0;
    });

    const avgScore =
      completedAttempts.length > 0
        ? Math.round(
            completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
              completedAttempts.length
          )
        : 0;

    const avgDurationMinutes =
      completedAttempts.length > 0
        ? Math.round(totalTime / completedAttempts.length / 60)
        : 0;

    return {
      overview: {
        usersCount,
        studentsCount,
        teachersCount,
        subjectsCount,
        unitsCount,
        lessonsCount,
        questionsCount,
        examsCount,
        attemptsCount,
        completedAttemptsCount: completedAttempts.length,
        avgScore,
        avgDurationMinutes,
      },
      difficultyDistribution: {
        easy: easyQuestions,
        medium: mediumQuestions,
        hard: hardQuestions,
      },
      questionTypes: {
        mcq: mcqQuestions,
        essay: essayQuestions,
        trueFalse: trueFalseQuestions,
      },
      scoreBrackets: {
        high: scoreHigh,
        mid: scoreMid,
        low: scoreLow,
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
      auditLogs,
      recentAttempts,
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
    details?: Prisma.InputJsonValue | Record<string, unknown> | null
  ) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId: resourceId || null,
          details: details ? (details as Prisma.InputJsonValue) : Prisma.DbNull,
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
