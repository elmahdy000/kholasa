import { prisma } from "@/lib/prisma";

export class StudentService {
  /**
   * Get student dashboard metrics, current grade, and study status
   */
  static async getStudentDashboard(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        grade: { select: { id: true, name: true, systemId: true } },
        system: { select: { id: true, name: true } },
      },
    });

    if (!user) throw new Error("المستخدم غير موجود");

    // Fetch student subjects based on grade
    const subjects = user.gradeId
      ? await prisma.subject.findMany({
          where: { gradeId: user.gradeId },
          include: {
            _count: { select: { units: true } },
          },
        })
      : [];

    // Fetch progress and completions
    const [progressRecords, attempts, unresolvedMistakes, bookmarksCount] = await Promise.all([
      prisma.studentProgress.findMany({
        where: { userId },
        include: { lesson: { select: { id: true, title: true, unitId: true } } },
      }),
      prisma.examAttempt.findMany({
        where: { userId, isCompleted: true },
        orderBy: { completedAt: "desc" },
        take: 5,
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              subject: { select: { name: true, color: true } },
            },
          },
        },
      }),
      prisma.mistakeReview.count({
        where: { userId, isResolved: false },
      }),
      prisma.bookmark.count({
        where: { userId },
      }),
    ]);

    const completedLessonsCount = progressRecords.filter((p) => p.isCompleted).length;

    // Check if daily entrance gatekeeper exam was taken today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayAttempt = await prisma.examAttempt.findFirst({
      where: {
        userId,
        startedAt: { gte: startOfToday },
        isCompleted: true,
      },
    });

    const isDailyExamCompletedToday = !!todayAttempt;

    // Calculate overall average score
    const avgScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        grade: user.grade,
        system: user.system,
      },
      stats: {
        completedLessonsCount,
        totalAttempts: attempts.length,
        averageScore: avgScore,
        unresolvedMistakesCount: unresolvedMistakes,
        bookmarksCount,
        isDailyExamCompletedToday,
      },
      subjects,
      recentAttempts: attempts,
    };
  }

  /**
   * Update or record lesson learning progress
   */
  static async updateLessonProgress(userId: string, lessonId: string, progressPercent: number) {
    const isCompleted = progressPercent >= 90;

    return prisma.studentProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        progressPercent,
        isCompleted,
        lastAccessedAt: new Date(),
      },
      update: {
        progressPercent: Math.max(progressPercent, 0),
        isCompleted: isCompleted ? true : undefined,
        lastAccessedAt: new Date(),
      },
    });
  }

  /**
   * Toggle bookmark for a lesson or a question
   */
  static async toggleBookmark(userId: string, target: { lessonId?: string; questionId?: string }) {
    const existing = await prisma.bookmark.findFirst({
      where: {
        userId,
        lessonId: target.lessonId || null,
        questionId: target.questionId || null,
      },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }

    await prisma.bookmark.create({
      data: {
        userId,
        lessonId: target.lessonId || null,
        questionId: target.questionId || null,
      },
    });

    return { bookmarked: true };
  }

  /**
   * Fetch all student bookmarks
   */
  static async getBookmarks(userId: string) {
    return prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
