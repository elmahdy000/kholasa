import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { UserFilterParams } from "./types";

export class UserQueriesService {
  /**
   * List users with role filtering, search, and pagination
   */
  static async getUsers(params: UserFilterParams = {}) {
    const { role, search, systemId, gradeId, page = 1, limit = 20 } = params;

    const where: Prisma.UserWhereInput = {};
    if (role && role !== "ALL") where.role = role;
    if (systemId && systemId !== "all") where.systemId = systemId;
    if (gradeId && gradeId !== "all") where.gradeId = gradeId;

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim() } },
        { loginCode: { contains: search.trim().toUpperCase(), mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          loginCode: true,
          role: true,
          avatar: true,
          schoolCategory: true,
          isActive: true,
          createdAt: true,
          maxDevices: true,
          boundDevices: true,
          grade: { select: { id: true, name: true } },
          system: { select: { id: true, name: true } },
          _count: { select: { attempts: true, progress: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single user by ID
   */
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        grade: true,
        system: true,
        _count: { select: { attempts: true, progress: true, mistakes: true } },
      },
    });
  }

  /**
   * Get exhaustive user/student profile with progress, attempts, mistakes, and devices
   */
  static async getUserDetailedProfile(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        loginCode: true,
        role: true,
        avatar: true,
        schoolCategory: true,
        studyMode: true,
        centerName: true,
        subscriptionStatus: true,
        paymentReceiptUrl: true,
        paymentSenderPhone: true,
        paymentReference: true,
        paymentUploadedAt: true,
        subscriptionExpiresAt: true,
        isActive: true,
        maxDevices: true,
        boundDevices: true,
        createdAt: true,
        updatedAt: true,
        system: { select: { id: true, name: true, code: true } },
        grade: { select: { id: true, name: true, code: true } },
        track: { select: { id: true, name: true, code: true } },
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, deviceId: true, expires: true, createdAt: true },
        },
        attempts: {
          orderBy: { startedAt: "desc" },
          take: 50,
          select: {
            id: true,
            title: true,
            score: true,
            percentage: true,
            timeSpentSeconds: true,
            isCompleted: true,
            startedAt: true,
            completedAt: true,
            mode: true,
            exam: {
              select: {
                id: true,
                title: true,
                isPractice: true,
                subject: { select: { name: true } },
              },
            },
          },
        },
        progress: {
          orderBy: { lastAccessedAt: "desc" },
          take: 50,
          select: {
            id: true,
            isCompleted: true,
            progressPercent: true,
            lastAccessedAt: true,
            lesson: {
              select: {
                id: true,
                title: true,
                unit: {
                  select: {
                    title: true,
                    subject: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        mistakes: {
          orderBy: { lastAttemptAt: "desc" },
          take: 50,
          select: {
            id: true,
            wrongCount: true,
            isResolved: true,
            lastAttemptAt: true,
            question: {
              select: {
                id: true,
                statement: true,
                type: true,
                difficulty: true,
                subject: { select: { name: true } },
              },
            },
          },
        },
        _count: {
          select: {
            attempts: true,
            progress: true,
            mistakes: true,
            sessions: true,
          },
        },
      },
    });

    if (!user) return null;

    const completedLessons = user.progress.filter((p) => p.isCompleted).length;
    const completedAttempts = user.attempts.filter((a) => a.isCompleted);
    const averageScore =
      completedAttempts.length > 0
        ? Math.round(
            completedAttempts.reduce((sum, a) => sum + a.percentage, 0) /
              completedAttempts.length
          )
        : 0;

    // Compute subject-by-subject statistics for this student
    const subjectMap = new Map<string, {
      subjectName: string;
      attemptsCount: number;
      totalPercentage: number;
      completedLessons: number;
      totalMistakes: number;
    }>();

    for (const att of user.attempts) {
      const subName = att.exam?.subject?.name || "عام";
      const existing = subjectMap.get(subName) || {
        subjectName: subName,
        attemptsCount: 0,
        totalPercentage: 0,
        completedLessons: 0,
        totalMistakes: 0,
      };
      if (att.isCompleted) {
        existing.attemptsCount++;
        existing.totalPercentage += att.percentage;
      }
      subjectMap.set(subName, existing);
    }

    for (const prog of user.progress) {
      const subName = prog.lesson?.unit?.subject?.name || "عام";
      const existing = subjectMap.get(subName) || {
        subjectName: subName,
        attemptsCount: 0,
        totalPercentage: 0,
        completedLessons: 0,
        totalMistakes: 0,
      };
      if (prog.isCompleted) {
        existing.completedLessons++;
      }
      subjectMap.set(subName, existing);
    }

    for (const mist of user.mistakes) {
      const subName = mist.question?.subject?.name || "عام";
      const existing = subjectMap.get(subName) || {
        subjectName: subName,
        attemptsCount: 0,
        totalPercentage: 0,
        completedLessons: 0,
        totalMistakes: 0,
      };
      existing.totalMistakes += mist.wrongCount;
      subjectMap.set(subName, existing);
    }

    const subjectStats = Array.from(subjectMap.values()).map((s) => ({
      subjectName: s.subjectName,
      attemptsCount: s.attemptsCount,
      averageScore: s.attemptsCount > 0 ? Math.round(s.totalPercentage / s.attemptsCount) : 0,
      completedLessons: s.completedLessons,
      totalMistakes: s.totalMistakes,
    }));

    const totalTimeSpentMinutes = Math.round(
      user.attempts.reduce((sum, a) => sum + (a.timeSpentSeconds || 0), 0) / 60
    );

    const lastActiveAt =
      user.sessions[0]?.createdAt || user.attempts[0]?.startedAt || user.progress[0]?.lastAccessedAt || null;

    // Calculate total lessons strictly scoped to this student's exact school category (Arabic vs Languages)
    let totalGradeLessons = 0;
    if (user.grade?.id) {
      const units = await prisma.unit.findMany({
        where: {
          isPublished: true,
          subject: {
            gradeId: user.grade.id,
            isPublished: true,
            schoolCategory: user.schoolCategory || "ARABIC",
          },
        },
        select: {
          _count: { select: { lessons: true } },
        },
      });
      totalGradeLessons = units.reduce((acc, u) => acc + u._count.lessons, 0);
    }
    if (totalGradeLessons === 0) {
      totalGradeLessons = user.schoolCategory === "LANGUAGES" ? 14 : 18;
    }

    const progressPercent =
      totalGradeLessons > 0
        ? Math.min(100, Math.round((completedLessons / totalGradeLessons) * 100))
        : 0;

    // Build unified chronological activity timeline (what the student studied and did)
    const activityTimeline: Array<{
      id: string;
      type: "SESSION" | "LESSON" | "EXAM";
      title: string;
      description?: string;
      timestamp: string;
      meta?: Record<string, any>;
    }> = [];

    for (const s of user.sessions) {
      activityTimeline.push({
        id: `sess_${s.id}`,
        type: "SESSION",
        title: "تسجيل دخول إلى المنصة",
        description: s.deviceId
          ? `تم الدخول بنجاح من الجهاز المعتمد (${s.deviceId.slice(0, 16)})`
          : "جلسة تصفح معتمدة",
        timestamp: s.createdAt.toISOString(),
      });
    }

    for (const a of user.attempts) {
      activityTimeline.push({
        id: `att_${a.id}`,
        type: "EXAM",
        title: `حل امتحان: ${a.title || a.exam?.title || "اختبار مادة"}`,
        description: `المادة: ${a.exam?.subject?.name || "عام"} • النسبة: ${a.percentage}% (${a.isCompleted ? "مكتمل" : "غير مكتمل"})`,
        timestamp: a.startedAt.toISOString(),
        meta: {
          percentage: a.percentage,
          score: a.score,
          isCompleted: a.isCompleted,
          subjectName: a.exam?.subject?.name,
        },
      });
    }

    for (const p of user.progress) {
      activityTimeline.push({
        id: `prog_${p.id}`,
        type: "LESSON",
        title: `${p.isCompleted ? "إتمام مذاكرة درس" : "متابعة مذاكرة درس"}: ${p.lesson?.title || "درس"}`,
        description: `${p.lesson?.unit?.subject?.name || "المادة"} • ${p.lesson?.unit?.title || "الوحدة"} (نسبة الإنجاز: ${p.isCompleted ? "100%" : p.progressPercent + "%"})`,
        timestamp: p.lastAccessedAt.toISOString(),
        meta: {
          progressPercent: p.progressPercent,
          isCompleted: p.isCompleted,
          unitTitle: p.lesson?.unit?.title,
          subjectName: p.lesson?.unit?.subject?.name,
        },
      });
    }

    activityTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      ...user,
      stats: {
        completedLessons,
        totalGradeLessons,
        progressPercent,
        totalAttempts: user._count.attempts,
        averageScore,
        totalMistakes: user._count.mistakes,
        resolvedMistakes: user.mistakes.filter((m) => m.isResolved).length,
        activeDevicesCount: user.boundDevices.length,
        totalTimeSpentMinutes,
        lastActiveAt,
        subjectStats,
        activityTimeline: activityTimeline.slice(0, 40),
      },
    };
  }

  /**
   * Find user by student login code
   */
  static async findByLoginCode(code: string) {
    const clean = code.trim().toUpperCase();
    if (!clean) return null;
    return prisma.user.findFirst({
      where: {
        loginCode: { equals: clean, mode: "insensitive" },
      },
    });
  }

  /**
   * Find user by email, phone, or login code (case-insensitive for email and code)
   */
  static async findByIdentifier(identifier: string) {
    const clean = identifier.trim();
    return prisma.user.findFirst({
      where: {
        OR: [
          { phone: clean },
          { email: { equals: clean.toLowerCase(), mode: "insensitive" } },
          { loginCode: { equals: clean.toUpperCase(), mode: "insensitive" } },
        ],
      },
    });
  }
}
