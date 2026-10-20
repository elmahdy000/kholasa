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
    const [progressRecords, recentAttempts, totalAttemptsCount, unresolvedMistakes, bookmarksCount] =
      await Promise.all([
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
        prisma.examAttempt.count({
          where: { userId, isCompleted: true },
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

    // Calculate recent average score
    const avgScore =
      recentAttempts.length > 0
        ? Math.round(recentAttempts.reduce((sum, a) => sum + a.percentage, 0) / recentAttempts.length)
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
        totalAttempts: totalAttemptsCount,
        averageScore: avgScore,
        unresolvedMistakesCount: unresolvedMistakes,
        bookmarksCount,
        isDailyExamCompletedToday,
      },
      subjects,
      recentAttempts,
    };
  }

  /**
   * Update or record lesson learning progress
   */
  static async updateLessonProgress(userId: string, lessonId: string, progressPercent: number) {
    const clampedProgress = Math.min(100, Math.max(0, Math.round(Number(progressPercent) || 0)));
    const isCompleted = clampedProgress >= 90;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });

    if (!lesson) {
      throw new Error("الدرس المطلوب غير موجود");
    }

    return prisma.studentProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        progressPercent: clampedProgress,
        isCompleted,
        lastAccessedAt: new Date(),
      },
      update: {
        progressPercent: clampedProgress,
        isCompleted: isCompleted ? true : undefined,
        lastAccessedAt: new Date(),
      },
    });
  }

  /**
   * Toggle bookmark for a lesson or a question
   */
  static async toggleBookmark(userId: string, target: { lessonId?: string; questionId?: string }) {
    if (!target.lessonId && !target.questionId) {
      throw new Error("يجب تحديد درس أو سؤال لحفظه");
    }

    if (target.lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: target.lessonId },
        select: { id: true },
      });
      if (!lesson) {
        throw new Error("الدرس المطلوب غير موجود");
      }
    }

    if (target.questionId) {
      const question = await prisma.question.findUnique({
        where: { id: target.questionId },
        select: { id: true },
      });
      if (!question) {
        throw new Error("السؤال المطلوب غير موجود");
      }
    }

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
   * Fetch all student bookmarks with lesson/question details
   */
  static async getBookmarks(userId: string) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const lessonIds = bookmarks.map((b) => b.lessonId).filter(Boolean) as string[];
    const questionIds = bookmarks.map((b) => b.questionId).filter(Boolean) as string[];

    const [lessons, questions] = await Promise.all([
      lessonIds.length > 0
        ? prisma.lesson.findMany({
            where: { id: { in: lessonIds } },
            select: {
              id: true,
              title: true,
              unit: {
                select: {
                  title: true,
                  subject: { select: { name: true, color: true } },
                },
              },
            },
          })
        : [],
      questionIds.length > 0
        ? prisma.question.findMany({
            where: { id: { in: questionIds } },
            select: { id: true, statement: true, type: true, difficulty: true },
          })
        : [],
    ]);

    const lessonMap = new Map(lessons.map((l) => [l.id, l]));
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    return bookmarks.map((b) => ({
      ...b,
      lesson: b.lessonId ? lessonMap.get(b.lessonId) || null : null,
      question: b.questionId ? questionMap.get(b.questionId) || null : null,
    }));
  }
}
