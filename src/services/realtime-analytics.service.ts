import { prisma } from "@/lib/prisma";
import { SchoolCategory, Role, ExamMode } from "@prisma/client";

export interface RealtimeFilterParams {
  category?: "ALL" | "ARABIC" | "LANGUAGES";
  status?: "ALL" | "ONLINE" | "TODAY" | "ACTIVE_EXAMS" | "ACTIVE_LESSONS";
  search?: string;
  sortBy?: "lastActive" | "exams" | "time" | "name" | "score";
}

export interface RealtimeStudentItem {
  id: string;
  name: string;
  phone: string;
  loginCode: string;
  schoolCategory: "ARABIC" | "LANGUAGES";
  gradeName: string;
  systemName: string;
  isOnline: boolean;
  lastActiveAt: string | null;
  lastActiveHuman: string;
  examsSolvedCount: number;
  avgScore: number;
  latestExam: {
    id: string;
    title: string;
    percentage: number;
    completedAt: string | null;
    timeSpentSeconds: number;
  } | null;
  lessonsReviewedCount: number;
  lessonsCompletedCount: number;
  recentLessons: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
    progressPercent: number;
    lastAccessedAt: string;
  }>;
  actualTimeSpentSeconds: number;
  actualTimeSpentFormatted: string;
  boundDevicesCount: number;
  isActive: boolean;
  studyMode?: "ONLINE" | "OFFLINE" | null;
  centerName?: string | null;
  subscriptionStatus?: "TRIAL" | "ACTIVE" | "PENDING_VERIFICATION" | "EXPIRED" | null;
  createdAt: string;
}

export interface RealtimeActivityEvent {
  id: string;
  type: "EXAM" | "LESSON" | "LOGIN";
  studentId: string;
  studentName: string;
  loginCode: string;
  schoolCategory: "ARABIC" | "LANGUAGES";
  title: string;
  detail: string;
  timestamp: string;
  timeAgo: string;
}

export interface RealtimeMetrics {
  serverTime: string;
  onlineTotal: number;
  onlineArabic: number;
  onlineLanguages: number;
  todayTotal: number;
  todayArabic: number;
  todayLanguages: number;
  registeredTotal: number;
  registeredArabic: number;
  registeredLanguages: number;
  totalExamsSolved: number;
  totalLessonsCompleted: number;
  totalActualTimeSeconds: number;
  totalActualTimeFormatted: string;
}

/**
 * Format duration in seconds to Egyptian Arabic friendly text
 */
export function formatArabicDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "أقل من دقيقة";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    if (hours === 1) {
      return minutes > 0 ? `ساعة و ${minutes} دقيقة` : "ساعة واحدة";
    }
    if (hours === 2) {
      return minutes > 0 ? `ساعتان و ${minutes} دقيقة` : "ساعتان";
    }
    if (hours >= 3 && hours <= 10) {
      return minutes > 0 ? `${hours} ساعات و ${minutes} دقيقة` : `${hours} ساعات`;
    }
    return minutes > 0 ? `${hours} ساعة و ${minutes} دقيقة` : `${hours} ساعة`;
  }

  if (minutes > 0) {
    if (minutes === 1) return "دقيقة واحدة";
    if (minutes === 2) return "دقيقتان";
    if (minutes >= 3 && minutes <= 10) return `${minutes} دقائق`;
    return `${minutes} دقيقة`;
  }

  return "أقل من دقيقة";
}

/**
 * Format relative time in Egyptian Arabic
 */
export function formatRelativeTimeArabic(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffMin < 2) return "متصل الآن";
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffHour < 24) {
    if (diffHour === 1) return "منذ ساعة";
    if (diffHour === 2) return "منذ ساعتين";
    if (diffHour <= 10) return `منذ ${diffHour} ساعات`;
    return `منذ ${diffHour} ساعة`;
  }

  const isYesterday =
    now.getDate() - date.getDate() === 1 &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  const timeStr = date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isYesterday) return `أمس في ${timeStr}`;
  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
  });
}

export class RealtimeAnalyticsService {
  /**
   * Get full realtime observatory data with strict category filtering and student 360 breakdown
   */
  static async getRealtimeObservatory(params: RealtimeFilterParams = {}) {
    const { category = "ALL", status = "ALL", search, sortBy = "lastActive" } = params;

    const now = new Date();
    // 15 minutes threshold for online indicator
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Midnight today in server time
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // 1. Fetch all registered students with relevant relational data
    const categoryFilter =
      category === "ARABIC"
        ? { schoolCategory: SchoolCategory.ARABIC }
        : category === "LANGUAGES"
        ? { schoolCategory: SchoolCategory.LANGUAGES }
        : {};

    const [
      allRegisteredStudents,
      recentSessions,
      recentAttempts,
      recentProgress,
      liveActivityLogs,
    ] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: Role.STUDENT,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          loginCode: true,
          schoolCategory: true,
          isActive: true,
          maxDevices: true,
          boundDevices: true,
          studyMode: true,
          centerName: true,
          subscriptionStatus: true,
          createdAt: true,
          grade: { select: { id: true, name: true } },
          system: { select: { id: true, name: true } },
          attempts: {
            where: { isCompleted: true },
            orderBy: { completedAt: "desc" },
            select: {
              id: true,
              title: true,
              percentage: true,
              timeSpentSeconds: true,
              startedAt: true,
              completedAt: true,
              exam: { select: { id: true, title: true } },
            },
          },
          progress: {
            orderBy: { lastAccessedAt: "desc" },
            select: {
              id: true,
              isCompleted: true,
              progressPercent: true,
              lastAccessedAt: true,
              lesson: { select: { id: true, title: true } },
            },
          },
          sessions: {
            orderBy: { createdAt: "desc" },
            take: 3,
            select: {
              id: true,
              createdAt: true,
              deviceId: true,
            },
          },
        },
      }),

      // Active sessions today
      prisma.session.findMany({
        where: {
          createdAt: { gte: todayStart },
          user: { role: Role.STUDENT },
        },
        select: {
          id: true,
          userId: true,
          createdAt: true,
          user: { select: { schoolCategory: true } },
        },
      }),

      // Attempts today
      prisma.examAttempt.findMany({
        where: {
          startedAt: { gte: todayStart },
          user: { role: Role.STUDENT },
        },
        select: {
          id: true,
          userId: true,
          startedAt: true,
          completedAt: true,
          user: { select: { schoolCategory: true } },
        },
      }),

      // Progress touched today
      prisma.studentProgress.findMany({
        where: {
          lastAccessedAt: { gte: todayStart },
          user: { role: Role.STUDENT },
        },
        select: {
          id: true,
          userId: true,
          lastAccessedAt: true,
          user: { select: { schoolCategory: true } },
        },
      }),

      // Live activity feed (last 20 actions across exams, progress, sessions)
      prisma.examAttempt.findMany({
        where: { user: { role: Role.STUDENT } },
        take: 10,
        orderBy: { startedAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, loginCode: true, schoolCategory: true },
          },
          exam: { select: { title: true } },
        },
      }),
    ]);

    // 2. Aggregate Today and Live Unique Students
    const todayActiveUsersMap = new Map<string, { schoolCategory: SchoolCategory }>();
    const onlineUsersMap = new Map<string, { schoolCategory: SchoolCategory }>();

    for (const s of recentSessions) {
      if (s.userId && s.user) {
        todayActiveUsersMap.set(s.userId, { schoolCategory: s.user.schoolCategory });
        if (s.createdAt >= fifteenMinutesAgo) {
          onlineUsersMap.set(s.userId, { schoolCategory: s.user.schoolCategory });
        }
      }
    }

    for (const a of recentAttempts) {
      if (a.userId && a.user) {
        todayActiveUsersMap.set(a.userId, { schoolCategory: a.user.schoolCategory });
        if (a.startedAt >= fifteenMinutesAgo || (a.completedAt && a.completedAt >= fifteenMinutesAgo)) {
          onlineUsersMap.set(a.userId, { schoolCategory: a.user.schoolCategory });
        }
      }
    }

    for (const p of recentProgress) {
      if (p.userId && p.user) {
        todayActiveUsersMap.set(p.userId, { schoolCategory: p.user.schoolCategory });
        if (p.lastAccessedAt >= fifteenMinutesAgo) {
          onlineUsersMap.set(p.userId, { schoolCategory: p.user.schoolCategory });
        }
      }
    }

    // 3. Transform all students into detailed items
    let studentItems: RealtimeStudentItem[] = allRegisteredStudents.map((u) => {
      // Find latest activity date
      const latestSession = u.sessions[0]?.createdAt || null;
      const latestAttempt = u.attempts[0]?.completedAt || u.attempts[0]?.startedAt || null;
      const latestProg = u.progress[0]?.lastAccessedAt || null;

      const timestamps = [latestSession, latestAttempt, latestProg]
        .filter((d): d is Date => d !== null)
        .map((d) => d.getTime());

      const latestTime = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

      const isOnline = latestTime !== null && latestTime >= fifteenMinutesAgo;
      const lastActiveHuman = latestTime
        ? formatRelativeTimeArabic(latestTime, now)
        : "لم يدخل بعد";

      // Exams stats
      const examsSolvedCount = u.attempts.length;
      const avgScore =
        examsSolvedCount > 0
          ? Math.round(u.attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / examsSolvedCount)
          : 0;

      const latestExamAttempt = u.attempts[0] || null;
      const latestExam = latestExamAttempt
        ? {
            id: latestExamAttempt.id,
            title: latestExamAttempt.exam?.title || latestExamAttempt.title || "امتحان",
            percentage: latestExamAttempt.percentage || 0,
            completedAt: latestExamAttempt.completedAt?.toISOString() || null,
            timeSpentSeconds: latestExamAttempt.timeSpentSeconds || 0,
          }
        : null;

      // Lessons stats
      const lessonsReviewedCount = u.progress.length;
      const lessonsCompletedCount = u.progress.filter((p) => p.isCompleted).length;
      const recentLessons = u.progress.slice(0, 4).map((p) => ({
        id: p.id,
        title: p.lesson?.title || "درس",
        isCompleted: p.isCompleted,
        progressPercent: p.progressPercent,
        lastAccessedAt: p.lastAccessedAt.toISOString(),
      }));

      // Actual time calculation:
      // Exact seconds in completed/ongoing exams
      const examTimeSeconds = u.attempts.reduce((sum, a) => sum + (a.timeSpentSeconds || 0), 0);
      // Realistic lesson study time: 12 minutes (720s) per completed lesson, proportional for in-progress
      const lessonTimeSeconds = u.progress.reduce((sum, p) => {
        if (p.isCompleted) return sum + 720;
        return sum + Math.round((p.progressPercent / 100) * 480);
      }, 0);

      const actualTimeSpentSeconds = examTimeSeconds + lessonTimeSeconds;
      const actualTimeSpentFormatted = formatArabicDuration(actualTimeSpentSeconds);

      return {
        id: u.id,
        name: u.name || "طالب بدون اسم",
        phone: u.phone || "—",
        loginCode: u.loginCode || "—",
        schoolCategory: (u.schoolCategory as any) || "ARABIC",
        gradeName: u.grade?.name || "الصف الأول الثانوي",
        systemName: u.system?.name || "التعليم المصري العام",
        isOnline,
        lastActiveAt: latestTime ? latestTime.toISOString() : null,
        lastActiveHuman,
        examsSolvedCount,
        avgScore,
        latestExam,
        lessonsReviewedCount,
        lessonsCompletedCount,
        recentLessons,
        actualTimeSpentSeconds,
        actualTimeSpentFormatted,
        boundDevicesCount: u.boundDevices.length,
        isActive: u.isActive !== false,
        studyMode: u.studyMode,
        centerName: u.centerName,
        subscriptionStatus: u.subscriptionStatus,
        createdAt: u.createdAt.toISOString(),
      };
    });

    // 4. Calculate System Metrics before client filters
    let registeredArabic = 0;
    let registeredLanguages = 0;
    let onlineArabic = 0;
    let onlineLanguages = 0;
    let todayArabic = 0;
    let todayLanguages = 0;
    let totalExamsSolved = 0;
    let totalLessonsCompleted = 0;
    let totalActualTimeSeconds = 0;

    for (const s of studentItems) {
      if (s.schoolCategory === "LANGUAGES") {
        registeredLanguages++;
        if (s.isOnline) onlineLanguages++;
      } else {
        registeredArabic++;
        if (s.isOnline) onlineArabic++;
      }
      totalExamsSolved += s.examsSolvedCount;
      totalLessonsCompleted += s.lessonsCompletedCount;
      totalActualTimeSeconds += s.actualTimeSpentSeconds;
    }

    for (const [, val] of todayActiveUsersMap) {
      if (val.schoolCategory === SchoolCategory.LANGUAGES) {
        todayLanguages++;
      } else {
        todayArabic++;
      }
    }

    const metrics: RealtimeMetrics = {
      serverTime: now.toISOString(),
      onlineTotal: onlineArabic + onlineLanguages,
      onlineArabic,
      onlineLanguages,
      todayTotal: todayArabic + todayLanguages,
      todayArabic,
      todayLanguages,
      registeredTotal: registeredArabic + registeredLanguages,
      registeredArabic,
      registeredLanguages,
      totalExamsSolved,
      totalLessonsCompleted,
      totalActualTimeSeconds,
      totalActualTimeFormatted: formatArabicDuration(totalActualTimeSeconds),
    };

    // 5. Apply Category Filter strictly
    if (category === "ARABIC") {
      studentItems = studentItems.filter((s) => s.schoolCategory === "ARABIC");
    } else if (category === "LANGUAGES") {
      studentItems = studentItems.filter((s) => s.schoolCategory === "LANGUAGES");
    }

    // 6. Apply Status Filter
    if (status === "ONLINE") {
      studentItems = studentItems.filter((s) => s.isOnline);
    } else if (status === "TODAY") {
      studentItems = studentItems.filter((s) => {
        if (!s.lastActiveAt) return false;
        return new Date(s.lastActiveAt) >= todayStart;
      });
    } else if (status === "ACTIVE_EXAMS") {
      studentItems = studentItems.filter((s) => s.examsSolvedCount > 0);
    } else if (status === "ACTIVE_LESSONS") {
      studentItems = studentItems.filter((s) => s.lessonsReviewedCount > 0);
    }

    // 7. Apply Search Query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      studentItems = studentItems.filter((s) => {
        return (
          s.name.toLowerCase().includes(q) ||
          s.loginCode.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          s.gradeName.toLowerCase().includes(q)
        );
      });
    }

    // 8. Apply Sorting
    studentItems.sort((a, b) => {
      if (sortBy === "exams") {
        return b.examsSolvedCount - a.examsSolvedCount;
      }
      if (sortBy === "time") {
        return b.actualTimeSpentSeconds - a.actualTimeSpentSeconds;
      }
      if (sortBy === "score") {
        return b.avgScore - a.avgScore;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "ar");
      }
      // default: lastActive
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      const timeA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
      const timeB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
      return timeB - timeA;
    });

    // 9. Build Live Activity Feed
    const liveFeed: RealtimeActivityEvent[] = liveActivityLogs.map((att) => {
      const isCompleted = att.isCompleted;
      const timeAgo = formatRelativeTimeArabic(att.startedAt, now);
      return {
        id: `att_${att.id}`,
        type: "EXAM",
        studentId: att.user.id,
        studentName: att.user.name || "طالب",
        loginCode: att.user.loginCode || "—",
        schoolCategory: (att.user.schoolCategory as any) || "ARABIC",
        title: isCompleted
          ? `أتم حل اختبار: ${att.exam?.title || att.title}`
          : `بدأ حل اختبار: ${att.exam?.title || att.title}`,
        detail: isCompleted
          ? `النتيجة: ${att.percentage}% · استغرق ${Math.round((att.timeSpentSeconds || 0) / 60)} دقيقة`
          : "جاري الإجابة على الأسئلة...",
        timestamp: att.startedAt.toISOString(),
        timeAgo,
      };
    });

    return {
      metrics,
      students: studentItems,
      liveFeed,
    };
  }
}

