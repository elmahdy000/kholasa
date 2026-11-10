import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { badRequest, conflict, forbidden, notFound } from "@/lib/http";
import { getCurriculumScope, subjectScopeWhere, type SchoolCategory } from "@/lib/curriculum";
import { getCairoDayKey, getCairoStartOfDay } from "@/lib/date";
import {
  canUserAccessLesson,
  hasActiveSubscription,
  isTrialLesson,
  type LessonAccessUser,
} from "@/lib/lesson-access";

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

    const scope = getCurriculumScope(user);

    // Fetch student subjects based on grade and curriculum scope (Arabic/Language schools & Track)
    const subjects = user.gradeId
      ? await prisma.subject.findMany({
          where: { isPublished: true, ...subjectScopeWhere(scope) },
          orderBy: { order: "asc" },
          include: {
            _count: { select: { units: true } },
          },
        })
      : [];

    // Fetch progress and completions
    const [progressRecords, recentAttempts, totalAttemptsCount, unresolvedMistakes, bookmarksCount] =
      await Promise.all([
        prisma.studentProgress.findMany({
          where: {
            userId,
            lesson: {
              isPublished: true,
              unit: {
                isPublished: true,
                subject: {
                  isPublished: true,
                  ...subjectScopeWhere(scope),
                },
              },
            },
          },
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
          where: {
            userId,
            isResolved: false,
            question: {
              status: "PUBLISHED",
              subject: {
                isPublished: true,
                ...subjectScopeWhere(scope),
              },
            },
          },
        }),
        prisma.bookmark.count({
          where: { userId },
        }),
      ]);

    const completedLessonsCount = progressRecords.filter((p) => p.isCompleted).length;

    // Check if daily entrance gatekeeper exam was taken today (Cairo calendar day)
    const startOfToday = getCairoStartOfDay();
    const todayKey = getCairoDayKey();

    const [todayAttempt, todayChallenge] = await Promise.all([
      prisma.examAttempt.findFirst({
        where: {
          userId,
          completedAt: { gte: startOfToday },
          isCompleted: true,
        },
      }),
      prisma.dailyChallenge.findUnique({
        where: { userId_day: { userId, day: todayKey } },
        select: { completedAt: true },
      }),
    ]);

    const isDailyExamCompletedToday = Boolean(todayAttempt || todayChallenge?.completedAt);

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
        loginCode: user.loginCode,
        role: user.role,
        schoolCategory: user.schoolCategory,
        trackId: user.trackId,
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
    payload: number | { progressPercent?: number; isCompleted?: boolean },
    userAccess?: LessonAccessUser | null
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
      where: {
        id: lessonId,
        isPublished: true,
        unit: { isPublished: true, subject: { isPublished: true } },
      },
      select: {
        id: true,
        isPublished: true,
        isTrial: true,
        order: true,
        unit: {
          select: {
            isPublished: true,
            order: true,
            subject: {
              select: {
                id: true,
                isPublished: true,
                gradeId: true,
                trackId: true,
                schoolCategory: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw notFound("الدرس المطلوب غير موجود");
    }

    if (userAccess) {
      const access = canUserAccessLesson(userAccess, lesson);
      if (!access.allowed) {
        if (access.reason === "OUT_OF_SCOPE") {
          throw notFound("الدرس غير متاح في مسارك الدراسي");
        }
        throw forbidden("يلزم تفعيل الاشتراك لتسجيل التقدم في هذا الدرس");
      }
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
      schoolCategory?: SchoolCategory;
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

  /**
   * Get detailed mastery analytics across curriculum subjects, units, and lessons,
   * with score progression over time and actionable focus recommendations.
   */
  static async getStudentMasteryMap(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        subscriptionStatus: true,
        systemId: true,
        gradeId: true,
        schoolCategory: true,
        trackId: true,
      },
    });

    if (!user) {
      throw notFound("المستخدم غير موجود");
    }

    const scope = getCurriculumScope(user);

    // 1. Fetch ready curriculum subjects, units, and lessons (exclude under-construction subjects from global mastery denominator)
    const subjects = await prisma.subject.findMany({
      where: { isPublished: true, isUnderConstruction: false, ...subjectScopeWhere(scope) },
      orderBy: { order: "asc" },
      include: {
        units: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { order: "asc" },
              include: {
                questions: {
                  where: {
                    question: {
                      status: "PUBLISHED",
                      ...(scope?.schoolCategory ? { schoolCategory: scope.schoolCategory } : {}),
                    },
                  },
                  select: {
                    questionId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. Fetch all mastered questions for this student (isCorrect: true)
    const masteredAttempts = await prisma.questionAttempt.findMany({
      where: { userId, isCorrect: true },
      select: { questionId: true },
    });
    const masteredSet = new Set(masteredAttempts.map((a) => a.questionId));

    // 3. Fetch unresolved mistakes for this student (scoped to active published curriculum)
    const unresolvedMistakes = await prisma.mistakeReview.findMany({
      where: {
        userId,
        isResolved: false,
        question: {
          status: "PUBLISHED",
          subject: {
            isPublished: true,
            isUnderConstruction: false,
            ...subjectScopeWhere(scope),
          },
        },
      },
      select: { questionId: true, wrongCount: true },
    });
    const mistakeMap = new Map(unresolvedMistakes.map((m) => [m.questionId, m.wrongCount]));

    // 4. Fetch recent completed exam attempts for score progression
    const recentAttempts = await prisma.examAttempt.findMany({
      where: { userId, isCompleted: true },
      orderBy: { completedAt: "asc" },
      take: 10,
      select: {
        id: true,
        title: true,
        percentage: true,
        completedAt: true,
      },
    });

    const scoreProgression = recentAttempts.map((att) => {
      const d = att.completedAt || new Date();
      const dateFormatted = new Intl.DateTimeFormat("ar-EG", {
        month: "short",
        day: "numeric",
      }).format(d);
      return {
        id: att.id,
        title: att.title,
        percentage: Math.round(att.percentage),
        dateFormatted,
        completedAt: d.toISOString(),
      };
    });

    // 5. Compute mastery breakdown
    let totalCurriculumQuestions = 0;
    let totalMasteredQuestions = 0;

    interface LessonCandidate {
      lessonId: string;
      lessonTitle: string;
      unitTitle: string;
      subjectId: string;
      subjectName: string;
      subjectColor: string | null;
      masteryPercentage: number;
      unresolvedMistakesCount: number;
      totalQuestions: number;
      isAccessible: boolean;
    }

    const lessonCandidates: LessonCandidate[] = [];
    const userHasActiveSub = hasActiveSubscription(user);

    const subjectAnalytics = subjects.map((subj) => {
      let subjQuestions = 0;
      let subjMastered = 0;

      const unitAnalytics = subj.units.map((u) => {
        let unitQuestions = 0;
        let unitMastered = 0;

        const lessonAnalytics = u.lessons.map((l) => {
          const qIds = l.questions.map((q) => q.questionId);
          const totalQ = qIds.length;
          const masteredQ = qIds.filter((qid) => masteredSet.has(qid)).length;
          const mistakesCount = qIds.reduce((sum, qid) => sum + (mistakeMap.has(qid) ? 1 : 0), 0);
          const masteryPct = totalQ > 0 ? Math.round((masteredQ / totalQ) * 100) : 0;

          unitQuestions += totalQ;
          unitMastered += masteredQ;

          if (totalQ > 0) {
            lessonCandidates.push({
              lessonId: l.id,
              lessonTitle: l.title,
              unitTitle: u.title,
              subjectId: subj.id,
              subjectName: subj.name,
              subjectColor: subj.color,
              masteryPercentage: masteryPct,
              unresolvedMistakesCount: mistakesCount,
              totalQuestions: totalQ,
              isAccessible: userHasActiveSub || isTrialLesson({ isTrial: l.isTrial, order: l.order, unit: { order: u.order } }),
            });
          }

          return {
            id: l.id,
            title: l.title,
            durationMinutes: l.durationMinutes,
            totalQuestions: totalQ,
            masteredCount: masteredQ,
            masteryPercentage: masteryPct,
            unresolvedMistakesCount: mistakesCount,
          };
        });

        const unitMasteryPct = unitQuestions > 0 ? Math.round((unitMastered / unitQuestions) * 100) : 0;
        subjQuestions += unitQuestions;
        subjMastered += unitMastered;

        return {
          id: u.id,
          title: u.title,
          order: u.order,
          totalQuestions: unitQuestions,
          masteredCount: unitMastered,
          masteryPercentage: unitMasteryPct,
          lessons: lessonAnalytics,
        };
      });

      const subjMasteryPct = subjQuestions > 0 ? Math.round((subjMastered / subjQuestions) * 100) : 0;
      totalCurriculumQuestions += subjQuestions;
      totalMasteredQuestions += subjMastered;

      return {
        id: subj.id,
        name: subj.name,
        color: subj.color,
        icon: subj.icon,
        totalQuestions: subjQuestions,
        masteredCount: subjMastered,
        masteryPercentage: subjMasteryPct,
        units: unitAnalytics,
      };
    });

    const overallMasteryPercentage =
      totalCurriculumQuestions > 0
        ? Math.round((totalMasteredQuestions / totalCurriculumQuestions) * 100)
        : 0;

    // 6. Determine Focus Recommendation:
    // Priority A: Lesson with the most unresolved mistakes
    // Priority B: Lesson with the lowest mastery percentage (< 80%)
    // Fallback: First lesson in candidates
    let focusRecommendation: {
      lessonId: string;
      lessonTitle: string;
      unitTitle: string;
      subjectId: string;
      subjectName: string;
      subjectColor: string | null;
      masteryPercentage: number;
      unresolvedMistakesCount: number;
      reason: string;
    } | null = null;

    if (lessonCandidates.length > 0) {
      const accessibleCandidates = lessonCandidates.filter((c) => c.isAccessible);
      const focusPool = accessibleCandidates.length > 0 ? accessibleCandidates : lessonCandidates;

      // Check highest mistakes first
      const withMistakes = [...focusPool].filter((c) => c.unresolvedMistakesCount > 0);
      if (withMistakes.length > 0) {
        withMistakes.sort((a, b) => b.unresolvedMistakesCount - a.unresolvedMistakesCount);
        const top = withMistakes[0];
        focusRecommendation = {
          ...top,
          reason: `يحتوي على ${top.unresolvedMistakesCount} أخطاء تحتاج معالجة سريعة`,
        };
      } else {
        // Sort by lowest mastery
        const byMastery = [...focusPool].sort((a, b) => a.masteryPercentage - b.masteryPercentage);
        const lowest = byMastery[0];
        if (lowest.masteryPercentage < 100) {
          focusRecommendation = {
            ...lowest,
            reason: `نسبة إتقانك للدرس ${lowest.masteryPercentage}% — راجعه لتصل لـ 100%`,
          };
        } else {
          // All 100% mastered!
          focusRecommendation = {
            ...lowest,
            reason: "ما شاء الله، إتقانك ممتاز! استمر في المراجعة الدورية",
          };
        }
      }
    }

    return {
      overallMasteryPercentage,
      totalCurriculumQuestions,
      totalMasteredQuestions,
      subjects: subjectAnalytics,
      focusRecommendation,
      scoreProgression,
    };
  }
}
