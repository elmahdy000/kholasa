import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { badRequest, conflict, notFound } from "@/lib/http";

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

    if (!user) throw notFound("المستخدم غير موجود");

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
  static async updateLessonProgress(
    userId: string,
    lessonId: string,
    payload: number | { progressPercent?: number; isCompleted?: boolean }
  ) {
    let progressPercent: number | undefined;
    let isCompleted: boolean | undefined;

    if (typeof payload === "number") {
      progressPercent = payload;
      isCompleted = progressPercent >= 90;
    } else {
      progressPercent = payload.progressPercent;
      isCompleted = payload.isCompleted;
      if (isCompleted === true && progressPercent === undefined) {
        progressPercent = 100;
      } else if (isCompleted === false && progressPercent === undefined) {
        progressPercent = 0;
      } else if (isCompleted === undefined && progressPercent !== undefined) {
        isCompleted = progressPercent >= 90;
      }
    }

    let clampedProgress =
      progressPercent !== undefined
        ? Math.min(100, Math.max(0, Math.round(Number(progressPercent) || 0)))
        : isCompleted
        ? 100
        : 0;

    if (isCompleted === false && clampedProgress >= 90) {
      clampedProgress = 0;
    }

    const finalIsCompleted = typeof isCompleted === "boolean" ? isCompleted : clampedProgress >= 90;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });

    if (!lesson) {
      throw notFound("الدرس المطلوب غير موجود");
    }

    return prisma.studentProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        progressPercent: clampedProgress,
        isCompleted: finalIsCompleted,
        lastAccessedAt: new Date(),
      },
      update: {
        progressPercent: clampedProgress,
        isCompleted: finalIsCompleted,
        lastAccessedAt: new Date(),
      },
    });
  }

  /**
   * Get single lesson learning progress for a student
   */
  static async getLessonProgress(userId: string, lessonId: string) {
    return prisma.studentProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });
  }

  /**
   * Toggle bookmark for exactly one of lessonId / questionId.
   * Target must exist and be published; uses the (userId, lessonId) and
   * (userId, questionId) unique keys so duplicates are impossible.
   */
  static async toggleBookmark(userId: string, target: { lessonId?: string; questionId?: string }) {
    const { lessonId, questionId } = target;
    if ((lessonId ? 1 : 0) + (questionId ? 1 : 0) !== 1) {
      throw badRequest("يجب تحديد درس واحد أو سؤال واحد فقط");
    }

    if (lessonId) {
      const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, isPublished: true, unit: { isPublished: true, subject: { isPublished: true } } },
        select: { id: true },
      });
      if (!lesson) throw notFound("الدرس المطلوب غير موجود");

      const existing = await prisma.bookmark.findFirst({
        where: { userId, lessonId },
        select: { id: true },
      });
      if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        return { bookmarked: false };
      }
      try {
        await prisma.bookmark.create({
          data: { userId, lessonId },
        });
        return { bookmarked: true };
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          return { bookmarked: true };
        }
        throw err;
      }
    }

    const question = await prisma.question.findFirst({
      where: { id: questionId!, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!question) throw notFound("السؤال المطلوب غير موجود");

    const existing = await prisma.bookmark.findFirst({
      where: { userId, questionId: questionId! },
      select: { id: true },
    });
    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }
    try {
      await prisma.bookmark.create({
        data: { userId, questionId: questionId! },
      });
      return { bookmarked: true };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return { bookmarked: true };
      }
      throw err;
    }
  }

  /**
   * Fetch student bookmarks (paginated: default 50, max 100) with details
   */
  static async getBookmarks(userId: string, page = 1, limit = 50) {
    const take = Math.min(Math.max(limit, 1), 100);
    return prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (Math.max(page, 1) - 1) * take,
      take,
      include: {
        lesson: {
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
        },
        question: {
          select: { id: true, statement: true, type: true, difficulty: true },
        },
      },
    });
  }

  /**
   * Update the student's own profile. systemId / gradeId / trackId must exist
   * and belong together (grade in system, track in grade).
   */
  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string | null;
      systemId?: string | null;
      gradeId?: string | null;
      schoolCategory?: "ARABIC" | "LANGUAGES";
      trackId?: string | null;
    }
  ) {
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { systemId: true, gradeId: true, trackId: true, schoolCategory: true },
    });
    if (!current) throw notFound("المستخدم غير موجود");

    const gradeChanged = data.gradeId !== undefined || data.systemId !== undefined;
    let systemId = data.systemId !== undefined ? data.systemId : current.systemId;
    const gradeId = data.gradeId !== undefined ? data.gradeId : current.gradeId;
    // Changing grade invalidates a previously stored track unless one is sent.
    const trackId =
      data.trackId !== undefined ? data.trackId : gradeChanged ? null : current.trackId;

    if (gradeId) {
      const grade = await prisma.grade.findUnique({
        where: { id: gradeId },
        select: { systemId: true, system: { select: { isActive: true } } },
      });
      if (!grade) throw badRequest("الصف الدراسي غير موجود");
      if (data.systemId && grade.systemId !== data.systemId) {
        throw badRequest("الصف لا ينتمي إلى النظام التعليمي المحدد");
      }
      // Derive the system from the grade so the two can never disagree.
      systemId = grade.systemId;
    } else if (systemId) {
      const system = await prisma.educationalSystem.findUnique({
        where: { id: systemId },
        select: { id: true },
      });
      if (!system) throw badRequest("النظام التعليمي غير موجود");
    }

    if (trackId) {
      if (!gradeId) throw badRequest("يجب تحديد الصف قبل المسار");
      const track = await prisma.academicTrack.findUnique({
        where: { id: trackId },
        select: { gradeId: true },
      });
      if (!track || track.gradeId !== gradeId) {
        throw badRequest("المسار لا ينتمي إلى الصف المحدد");
      }
    }

    const phone = data.phone === undefined ? undefined : data.phone?.trim() || null;
    if (phone) {
      const taken = await prisma.user.findFirst({
        where: { phone, NOT: { id: userId } },
        select: { id: true },
      });
      if (taken) throw conflict("رقم الهاتف مسجل بالفعل لمستخدم آخر");
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name?.trim(),
        phone,
        systemId: data.systemId !== undefined || gradeId ? (systemId ?? null) : undefined,
        gradeId: data.gradeId !== undefined ? data.gradeId : undefined,
        schoolCategory: data.schoolCategory !== undefined ? data.schoolCategory : undefined,
        trackId: trackId ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gradeId: true,
        systemId: true,
        schoolCategory: true,
        trackId: true,
        avatar: true,
      },
    });
  }
}
