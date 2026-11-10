import { Prisma, Role, SchoolCategory, StudyMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EXCLUDE_DEMO_SANDBOX_CONDITION } from "@/lib/demo";
import {
  getCairoDayKey,
  getCairoDayRange,
  getCairoStartOfDayFromKey,
  shiftDayKey,
} from "@/lib/date";
import { AUTHORIZED_CENTERS } from "@/lib/centers";

export type ReportCategoryFilter = "ALL" | "ARABIC" | "LANGUAGES";
export type ReportStudyModeFilter = "ALL" | "ONLINE" | "OFFLINE";

export interface DailyReportParams {
  dateKey?: string;
  category?: ReportCategoryFilter;
  studyMode?: ReportStudyModeFilter;
  centerName?: string;
}

export interface DailyReportTrendItem {
  dateKey: string;
  label: string;
  activeStudents: number;
  arabicActive: number;
  languagesActive: number;
  examsCompleted: number;
  lessonsAccessed: number;
  dailyChallengesCompleted: number;
}

export interface DailyCenterBreakdownItem {
  centerName: string;
  category: "ARABIC" | "LANGUAGES" | "OTHER";
  totalStudents: number;
  activeToday: number;
}

export interface DailyStudentActivityRow {
  id: string;
  name: string;
  loginCode: string | null;
  phone: string | null;
  schoolCategory: "ARABIC" | "LANGUAGES";
  studyMode: "ONLINE" | "OFFLINE";
  centerName: string | null;
  gradeName: string | null;
  subscriptionStatus: string;
  isActive: boolean;
  isNewToday: boolean;
  sessionsToday: number;
  examsCompletedToday: number;
  bestExamScoreToday: number | null;
  lessonsAccessedToday: number;
  lessonsCompletedToday: number;
  mistakesToday: number;
  resolvedMistakesToday: number;
  dailyChallengeStatus: "COMPLETED" | "STARTED" | "NONE";
  lastActivityAt: string;
  highlights: string[];
}

export interface DailyReportRadarPendingPayment {
  id: string;
  name: string;
  loginCode: string | null;
  phone: string | null;
  schoolCategory: "ARABIC" | "LANGUAGES";
  paymentSenderPhone: string | null;
  paymentReference: string | null;
  paymentReceiptUrl: string | null;
  paymentUploadedAt: string | null;
}

export interface DailyReportRadarDeviceLimit {
  id: string;
  name: string;
  loginCode: string | null;
  phone: string | null;
  schoolCategory: "ARABIC" | "LANGUAGES";
  boundCount: number;
  maxDevices: number;
  centerName: string | null;
}

export interface DailyReportRadarStruggling {
  id: string;
  name: string;
  loginCode: string | null;
  phone: string | null;
  schoolCategory: "ARABIC" | "LANGUAGES";
  gradeName: string | null;
  lowestExamPercent: number | null;
  mistakesToday: number;
  unresolvedMistakesTotal: number;
  reason: string;
}

export interface DailyReportRadarSuspended {
  id: string;
  name: string;
  loginCode: string | null;
  phone: string | null;
  schoolCategory: "ARABIC" | "LANGUAGES";
  subscriptionStatus: string;
  createdAt: string;
}

export interface DailyReportRadarInactiveActive {
  id: string;
  name: string;
  loginCode: string | null;
  phone: string | null;
  schoolCategory: "ARABIC" | "LANGUAGES";
  gradeName: string | null;
  centerName: string | null;
  studyMode: "ONLINE" | "OFFLINE";
}

export interface DailyReportData {
  dateKey: string;
  todayKey: string;
  isToday: boolean;
  filters: {
    category: ReportCategoryFilter;
    studyMode: ReportStudyModeFilter;
    centerName: string;
  };
  availableCenters: string[];
  summary: {
    totalMatchingStudents: number;
    activeStudentsToday: number;
    activeArabicCount: number;
    activeLanguagesCount: number;
    activeOnlineCount: number;
    activeOfflineCount: number;
    newRegistrationsToday: number;
    examsStarted: number;
    examsCompleted: number;
    averageExamScore: number | null;
    lessonsAccessed: number;
    lessonsCompleted: number;
    questionAttemptsCount: number;
    questionCorrectCount: number;
    newMistakesToday: number;
    resolvedMistakesToday: number;
    dailyChallengesStarted: number;
    dailyChallengesCompleted: number;
  };
  trend14Days: DailyReportTrendItem[];
  centerBreakdown: DailyCenterBreakdownItem[];
  studentActivities: DailyStudentActivityRow[];
  radar: {
    pendingPaymentsCount: number;
    pendingPayments: DailyReportRadarPendingPayment[];
    deviceLimitCount: number;
    deviceLimitStudents: DailyReportRadarDeviceLimit[];
    strugglingCount: number;
    strugglingStudents: DailyReportRadarStruggling[];
    suspendedCount: number;
    suspendedStudents: DailyReportRadarSuspended[];
    inactiveActiveCount: number;
    inactiveActiveStudents: DailyReportRadarInactiveActive[];
  };
}

export function formatCairoDayLabel(dayKey: string): string {
  const start = getCairoStartOfDayFromKey(dayKey);
  const noon = new Date(start.getTime() + 12 * 3600_000);
  return noon.toLocaleDateString("ar-EG", {
    timeZone: "Africa/Cairo",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function normalizeReportDateKey(input?: string | null): string {
  const todayKey = getCairoDayKey();
  if (!input || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return todayKey;
  const [y, m, d] = input.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(probe.getTime()) || probe.toISOString().slice(0, 10) !== input) {
    return todayKey;
  }
  return input;
}

export function buildStudentReportWhere(
  params: DailyReportParams
): Prisma.UserWhereInput {
  const andConditions: Prisma.UserWhereInput[] = [
    { role: Role.STUDENT },
    EXCLUDE_DEMO_SANDBOX_CONDITION,
  ];

  if (params.category === "ARABIC") {
    andConditions.push({ schoolCategory: SchoolCategory.ARABIC });
  } else if (params.category === "LANGUAGES") {
    andConditions.push({ schoolCategory: SchoolCategory.LANGUAGES });
  }

  if (params.studyMode === "ONLINE") {
    andConditions.push({ studyMode: StudyMode.ONLINE });
  } else if (params.studyMode === "OFFLINE") {
    andConditions.push({ studyMode: StudyMode.OFFLINE });
  }

  const trimmedCenter = params.centerName?.trim();
  if (trimmedCenter) {
    andConditions.push({ centerName: trimmedCenter });
  }

  return { AND: andConditions };
}

export class DailyReportsService {
  static async getDailyReport(
    params: DailyReportParams = {}
  ): Promise<DailyReportData> {
    const todayKey = getCairoDayKey();
    const dateKey = normalizeReportDateKey(params.dateKey);
    const category: ReportCategoryFilter =
      params.category === "ARABIC" || params.category === "LANGUAGES"
        ? params.category
        : "ALL";
    const studyMode: ReportStudyModeFilter =
      params.studyMode === "ONLINE" || params.studyMode === "OFFLINE"
        ? params.studyMode
        : "ALL";
    const centerName = params.centerName?.trim() || "";

    const { start, end } = getCairoDayRange(dateKey);
    const trendStartKey = shiftDayKey(dateKey, -13);
    const trendStart = getCairoStartOfDayFromKey(trendStartKey);
    const inactiveWindowStart = getCairoStartOfDayFromKey(shiftDayKey(todayKey, -6));
    const dayKeys14 = Array.from({ length: 14 }, (_, idx) =>
      shiftDayKey(trendStartKey, idx)
    );

    const studentWhere = buildStudentReportWhere({ category, studyMode, centerName });

    const [
      matchingStudents,
      sessions14,
      attempts14,
      progress14,
      dailyChallenges14,
      mistakesTodayRows,
      questionAttemptsToday,
      unresolvedMistakeCounts,
      recent7DaySessions,
      recent7DayAttempts,
      recent7DayProgress,
    ] = await Promise.all([
      prisma.user.findMany({
        where: studentWhere,
        select: {
          id: true,
          name: true,
          loginCode: true,
          phone: true,
          schoolCategory: true,
          studyMode: true,
          centerName: true,
          subscriptionStatus: true,
          isActive: true,
          maxDevices: true,
          boundDevices: true,
          paymentReceiptUrl: true,
          paymentSenderPhone: true,
          paymentReference: true,
          paymentUploadedAt: true,
          createdAt: true,
          grade: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.session.findMany({
        where: {
          createdAt: { gte: trendStart, lt: end },
          user: studentWhere,
        },
        select: { userId: true, createdAt: true },
      }),
      prisma.examAttempt.findMany({
        where: {
          startedAt: { gte: trendStart, lt: end },
          user: studentWhere,
        },
        select: {
          userId: true,
          title: true,
          percentage: true,
          isCompleted: true,
          startedAt: true,
          completedAt: true,
        },
      }),
      prisma.studentProgress.findMany({
        where: {
          lastAccessedAt: { gte: trendStart, lt: end },
          user: studentWhere,
        },
        select: {
          userId: true,
          lessonId: true,
          isCompleted: true,
          lastAccessedAt: true,
        },
      }),
      prisma.dailyChallenge.findMany({
        where: {
          day: { in: dayKeys14 },
          user: studentWhere,
        },
        select: {
          userId: true,
          day: true,
          completedAt: true,
          createdAt: true,
        },
      }),
      prisma.mistakeReview.findMany({
        where: {
          lastAttemptAt: { gte: start, lt: end },
          user: studentWhere,
        },
        select: {
          userId: true,
          isResolved: true,
          wrongCount: true,
          lastAttemptAt: true,
        },
      }),
      prisma.questionAttempt.findMany({
        where: {
          updatedAt: { gte: start, lt: end },
          user: studentWhere,
        },
        select: {
          userId: true,
          isCorrect: true,
          updatedAt: true,
        },
      }),
      prisma.mistakeReview.groupBy({
        by: ["userId"],
        where: {
          isResolved: false,
          user: studentWhere,
        },
        _count: { id: true },
      }),
      prisma.session.findMany({
        where: {
          createdAt: { gte: inactiveWindowStart },
          user: { ...studentWhere, subscriptionStatus: "ACTIVE", isActive: true },
        },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.examAttempt.findMany({
        where: {
          startedAt: { gte: inactiveWindowStart },
          user: { ...studentWhere, subscriptionStatus: "ACTIVE", isActive: true },
        },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.studentProgress.findMany({
        where: {
          lastAccessedAt: { gte: inactiveWindowStart },
          user: { ...studentWhere, subscriptionStatus: "ACTIVE", isActive: true },
        },
        select: { userId: true },
        distinct: ["userId"],
      }),
    ]);

    const studentMap = new Map(matchingStudents.map((s) => [s.id, s]));
    const unresolvedMap = new Map(
      unresolvedMistakeCounts.map((r) => [r.userId, r._count.id])
    );

    // 14-day Cairo trend
    const trendBuckets = new Map<
      string,
      {
        users: Set<string>;
        arabicUsers: Set<string>;
        languagesUsers: Set<string>;
        examsCompleted: number;
        lessonsAccessed: number;
        dailyChallengesCompleted: number;
      }
    >();

    for (const dk of dayKeys14) {
      trendBuckets.set(dk, {
        users: new Set(),
        arabicUsers: new Set(),
        languagesUsers: new Set(),
        examsCompleted: 0,
        lessonsAccessed: 0,
        dailyChallengesCompleted: 0,
      });
    }

    const markUserOnDay = (dk: string, userId: string) => {
      const bucket = trendBuckets.get(dk);
      if (!bucket) return;
      const student = studentMap.get(userId);
      if (!student) return;
      bucket.users.add(userId);
      if (student.schoolCategory === "LANGUAGES") {
        bucket.languagesUsers.add(userId);
      } else {
        bucket.arabicUsers.add(userId);
      }
    };

    for (const s of sessions14) {
      markUserOnDay(getCairoDayKey(s.createdAt), s.userId);
    }
    for (const a of attempts14) {
      const dk = getCairoDayKey(a.startedAt);
      markUserOnDay(dk, a.userId);
      if (a.isCompleted) {
        const b = trendBuckets.get(dk);
        if (b) b.examsCompleted += 1;
      }
    }
    for (const p of progress14) {
      const dk = getCairoDayKey(p.lastAccessedAt);
      markUserOnDay(dk, p.userId);
      const b = trendBuckets.get(dk);
      if (b) b.lessonsAccessed += 1;
    }
    for (const dc of dailyChallenges14) {
      markUserOnDay(dc.day, dc.userId);
      if (dc.completedAt) {
        const b = trendBuckets.get(dc.day);
        if (b) b.dailyChallengesCompleted += 1;
      }
    }

    const trend14Days: DailyReportTrendItem[] = dayKeys14.map((dk) => {
      const b = trendBuckets.get(dk)!;
      return {
        dateKey: dk,
        label: formatCairoDayLabel(dk),
        activeStudents: b.users.size,
        arabicActive: b.arabicUsers.size,
        languagesActive: b.languagesUsers.size,
        examsCompleted: b.examsCompleted,
        lessonsAccessed: b.lessonsAccessed,
        dailyChallengesCompleted: b.dailyChallengesCompleted,
      };
    });

    // Selected Cairo day aggregation per student
    interface StudentDayAcc {
      sessionsToday: number;
      examsStartedToday: number;
      examsCompletedToday: number;
      bestExamScoreToday: number | null;
      lowestExamPercentToday: number | null;
      lessonsAccessedToday: number;
      lessonsCompletedToday: number;
      mistakesToday: number;
      resolvedMistakesToday: number;
      dailyChallengeStatus: "COMPLETED" | "STARTED" | "NONE";
      lastActivityAt: Date;
    }

    const dayAccMap = new Map<string, StudentDayAcc>();
    const ensureAcc = (userId: string, ts: Date): StudentDayAcc => {
      const existing = dayAccMap.get(userId);
      if (existing) {
        if (ts > existing.lastActivityAt) existing.lastActivityAt = ts;
        return existing;
      }
      const created: StudentDayAcc = {
        sessionsToday: 0,
        examsStartedToday: 0,
        examsCompletedToday: 0,
        bestExamScoreToday: null,
        lowestExamPercentToday: null,
        lessonsAccessedToday: 0,
        lessonsCompletedToday: 0,
        mistakesToday: 0,
        resolvedMistakesToday: 0,
        dailyChallengeStatus: "NONE",
        lastActivityAt: ts,
      };
      dayAccMap.set(userId, created);
      return created;
    };

    for (const s of sessions14) {
      if (s.createdAt >= start && s.createdAt < end) {
        ensureAcc(s.userId, s.createdAt).sessionsToday += 1;
      }
    }

    let examsStarted = 0;
    let examsCompleted = 0;
    let examPercentageSum = 0;

    for (const a of attempts14) {
      if (a.startedAt >= start && a.startedAt < end) {
        const acc = ensureAcc(a.userId, a.completedAt || a.startedAt);
        acc.examsStartedToday += 1;
        examsStarted += 1;
        if (a.isCompleted) {
          acc.examsCompletedToday += 1;
          examsCompleted += 1;
          examPercentageSum += a.percentage;
          acc.bestExamScoreToday =
            acc.bestExamScoreToday === null
              ? Math.round(a.percentage)
              : Math.max(acc.bestExamScoreToday, Math.round(a.percentage));
          acc.lowestExamPercentToday =
            acc.lowestExamPercentToday === null
              ? Math.round(a.percentage)
              : Math.min(acc.lowestExamPercentToday, Math.round(a.percentage));
        }
      }
    }

    let lessonsAccessed = 0;
    let lessonsCompleted = 0;
    for (const p of progress14) {
      if (p.lastAccessedAt >= start && p.lastAccessedAt < end) {
        const acc = ensureAcc(p.userId, p.lastAccessedAt);
        acc.lessonsAccessedToday += 1;
        lessonsAccessed += 1;
        if (p.isCompleted) {
          acc.lessonsCompletedToday += 1;
          lessonsCompleted += 1;
        }
      }
    }

    let dailyChallengesStarted = 0;
    let dailyChallengesCompleted = 0;
    for (const dc of dailyChallenges14) {
      if (dc.day === dateKey) {
        const acc = ensureAcc(dc.userId, dc.completedAt || dc.createdAt);
        dailyChallengesStarted += 1;
        if (dc.completedAt) {
          acc.dailyChallengeStatus = "COMPLETED";
          dailyChallengesCompleted += 1;
        } else if (acc.dailyChallengeStatus !== "COMPLETED") {
          acc.dailyChallengeStatus = "STARTED";
        }
      }
    }

    let newMistakesToday = 0;
    let resolvedMistakesToday = 0;
    for (const m of mistakesTodayRows) {
      const acc = ensureAcc(m.userId, m.lastAttemptAt);
      if (m.isResolved) {
        acc.resolvedMistakesToday += 1;
        resolvedMistakesToday += 1;
      } else {
        acc.mistakesToday += 1;
        newMistakesToday += 1;
      }
    }

    let questionCorrectCount = 0;
    for (const qa of questionAttemptsToday) {
      ensureAcc(qa.userId, qa.updatedAt);
      if (qa.isCorrect) questionCorrectCount += 1;
    }

    // Active students breakdown today
    let activeArabicCount = 0;
    let activeLanguagesCount = 0;
    let activeOnlineCount = 0;
    let activeOfflineCount = 0;

    for (const userId of dayAccMap.keys()) {
      const s = studentMap.get(userId);
      if (!s) continue;
      if (s.schoolCategory === "LANGUAGES") activeLanguagesCount += 1;
      else activeArabicCount += 1;

      if (s.studyMode === "OFFLINE") activeOfflineCount += 1;
      else activeOnlineCount += 1;
    }

    let newRegistrationsToday = 0;
    const centerTotals = new Map<string, { total: number; activeToday: number }>();
    const availableCenterSet = new Set<string>(
      AUTHORIZED_CENTERS.map((c) => c.name)
    );

    for (const s of matchingStudents) {
      if (getCairoDayKey(s.createdAt) === dateKey) {
        newRegistrationsToday += 1;
      }
      if (s.studyMode === "OFFLINE") {
        const cname = s.centerName?.trim() || "سنتر غير محدد";
        availableCenterSet.add(cname);
        const entry = centerTotals.get(cname) || { total: 0, activeToday: 0 };
        entry.total += 1;
        if (dayAccMap.has(s.id)) entry.activeToday += 1;
        centerTotals.set(cname, entry);
      }
    }

    const centerBreakdown: DailyCenterBreakdownItem[] = Array.from(
      centerTotals.entries()
    )
      .map(([cName, counts]) => {
        const matched = AUTHORIZED_CENTERS.find((c) => c.name === cName);
        const category: DailyCenterBreakdownItem["category"] =
          matched?.category === "LANGUAGES"
            ? "LANGUAGES"
            : matched?.category === "ARABIC"
            ? "ARABIC"
            : "OTHER";
        return {
          centerName: cName,
          category,
          totalStudents: counts.total,
          activeToday: counts.activeToday,
        };
      })
      .sort((a, b) => b.activeToday - a.activeToday || b.totalStudents - a.totalStudents);

    // Daily student activity rows (includes both active today + newly created today)
    const relevantIds = new Set<string>(dayAccMap.keys());
    for (const s of matchingStudents) {
      if (getCairoDayKey(s.createdAt) === dateKey) {
        relevantIds.add(s.id);
      }
    }

    const mappedActivities: DailyStudentActivityRow[] = [];
    for (const id of relevantIds) {
      const s = studentMap.get(id);
      if (!s) continue;
      const acc = dayAccMap.get(id);
      const isNewToday = getCairoDayKey(s.createdAt) === dateKey;
      const highlights: string[] = [];
      if (isNewToday) highlights.push("تسجيل جديد");
      if (acc?.examsCompletedToday) {
        highlights.push(`${acc.examsCompletedToday} اختبار`);
      }
      if (acc?.lessonsCompletedToday) {
        highlights.push(`أتم ${acc.lessonsCompletedToday} درس`);
      } else if (acc?.lessonsAccessedToday) {
        highlights.push(`تصفح ${acc.lessonsAccessedToday} درس`);
      }
      if (acc?.dailyChallengeStatus === "COMPLETED") {
        highlights.push("تحدي يومي ✓");
      }
      if (acc?.mistakesToday) {
        highlights.push(`${acc.mistakesToday} أخطاء`);
      }

      mappedActivities.push({
        id: s.id,
        name: s.name || "طالب بدون اسم",
        loginCode: s.loginCode,
        phone: s.phone,
        schoolCategory: s.schoolCategory,
        studyMode: s.studyMode,
        centerName: s.centerName,
        gradeName: s.grade?.name || null,
        subscriptionStatus: s.subscriptionStatus,
        isActive: s.isActive,
        isNewToday,
        sessionsToday: acc?.sessionsToday ?? 0,
        examsCompletedToday: acc?.examsCompletedToday ?? 0,
        bestExamScoreToday: acc?.bestExamScoreToday ?? null,
        lessonsAccessedToday: acc?.lessonsAccessedToday ?? 0,
        lessonsCompletedToday: acc?.lessonsCompletedToday ?? 0,
        mistakesToday: acc?.mistakesToday ?? 0,
        resolvedMistakesToday: acc?.resolvedMistakesToday ?? 0,
        dailyChallengeStatus: acc?.dailyChallengeStatus ?? "NONE",
        lastActivityAt: (acc?.lastActivityAt || s.createdAt).toISOString(),
        highlights,
      });
    }

    const studentActivities = mappedActivities.sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );

    // Operational Radar Alerts
    const pendingPaymentsAll = matchingStudents
      .filter((s) => s.subscriptionStatus === "PENDING_VERIFICATION")
      .sort((a, b) => {
        const at = a.paymentUploadedAt?.getTime() ?? a.createdAt.getTime();
        const bt = b.paymentUploadedAt?.getTime() ?? b.createdAt.getTime();
        return at - bt;
      });

    const deviceLimitAll = matchingStudents.filter(
      (s) => s.isActive && (s.boundDevices?.length ?? 0) >= (s.maxDevices || 1)
    );

    const suspendedAll = matchingStudents.filter((s) => s.isActive === false);

    const strugglingAll: DailyReportRadarStruggling[] = [];
    for (const [userId, acc] of dayAccMap.entries()) {
      const s = studentMap.get(userId);
      if (!s) continue;
      const unresolvedTotal = unresolvedMap.get(userId) ?? 0;
      const lowScore =
        acc.lowestExamPercentToday !== null && acc.lowestExamPercentToday < 50;
      const manyMistakesToday = acc.mistakesToday >= 3;
      if (lowScore || manyMistakesToday) {
        const reasons: string[] = [];
        if (lowScore) reasons.push(`نتيجة اختبار منخفضة (${acc.lowestExamPercentToday}%)`);
        if (manyMistakesToday) reasons.push(`${acc.mistakesToday} أخطاء جديدة اليوم`);
        strugglingAll.push({
          id: s.id,
          name: s.name || "طالب",
          loginCode: s.loginCode,
          phone: s.phone,
          schoolCategory: s.schoolCategory,
          gradeName: s.grade?.name || null,
          lowestExamPercent: acc.lowestExamPercentToday,
          mistakesToday: acc.mistakesToday,
          unresolvedMistakesTotal: unresolvedTotal,
          reason: reasons.join(" • "),
        });
      }
    }
    strugglingAll.sort(
      (a, b) =>
        (a.lowestExamPercent ?? 100) - (b.lowestExamPercent ?? 100) ||
        b.mistakesToday - a.mistakesToday
    );

    const recentActiveIds7d = new Set<string>([
      ...recent7DaySessions.map((r) => r.userId),
      ...recent7DayAttempts.map((r) => r.userId),
      ...recent7DayProgress.map((r) => r.userId),
    ]);

    const inactiveActiveAll = matchingStudents.filter(
      (s) =>
        s.isActive &&
        s.subscriptionStatus === "ACTIVE" &&
        !recentActiveIds7d.has(s.id)
    );

    return {
      dateKey,
      todayKey,
      isToday: dateKey === todayKey,
      filters: {
        category,
        studyMode,
        centerName,
      },
      availableCenters: Array.from(availableCenterSet).sort((a, b) =>
        a.localeCompare(b, "ar")
      ),
      summary: {
        totalMatchingStudents: matchingStudents.length,
        activeStudentsToday: dayAccMap.size,
        activeArabicCount,
        activeLanguagesCount,
        activeOnlineCount,
        activeOfflineCount,
        newRegistrationsToday,
        examsStarted,
        examsCompleted,
        averageExamScore:
          examsCompleted > 0 ? Math.round(examPercentageSum / examsCompleted) : null,
        lessonsAccessed,
        lessonsCompleted,
        questionAttemptsCount: questionAttemptsToday.length,
        questionCorrectCount,
        newMistakesToday,
        resolvedMistakesToday,
        dailyChallengesStarted,
        dailyChallengesCompleted,
      },
      trend14Days,
      centerBreakdown,
      studentActivities,
      radar: {
        pendingPaymentsCount: pendingPaymentsAll.length,
        pendingPayments: pendingPaymentsAll.slice(0, 40).map((s) => ({
          id: s.id,
          name: s.name || "طالب",
          loginCode: s.loginCode,
          phone: s.phone,
          schoolCategory: s.schoolCategory,
          paymentSenderPhone: s.paymentSenderPhone,
          paymentReference: s.paymentReference,
          paymentReceiptUrl: s.paymentReceiptUrl,
          paymentUploadedAt: s.paymentUploadedAt?.toISOString() ?? null,
        })),
        deviceLimitCount: deviceLimitAll.length,
        deviceLimitStudents: deviceLimitAll.slice(0, 40).map((s) => ({
          id: s.id,
          name: s.name || "طالب",
          loginCode: s.loginCode,
          phone: s.phone,
          schoolCategory: s.schoolCategory,
          boundCount: s.boundDevices?.length ?? 0,
          maxDevices: s.maxDevices || 1,
          centerName: s.centerName,
        })),
        strugglingCount: strugglingAll.length,
        strugglingStudents: strugglingAll.slice(0, 40),
        suspendedCount: suspendedAll.length,
        suspendedStudents: suspendedAll.slice(0, 40).map((s) => ({
          id: s.id,
          name: s.name || "طالب",
          loginCode: s.loginCode,
          phone: s.phone,
          schoolCategory: s.schoolCategory,
          subscriptionStatus: s.subscriptionStatus,
          createdAt: s.createdAt.toISOString(),
        })),
        inactiveActiveCount: inactiveActiveAll.length,
        inactiveActiveStudents: inactiveActiveAll.slice(0, 30).map((s) => ({
          id: s.id,
          name: s.name || "طالب",
          loginCode: s.loginCode,
          phone: s.phone,
          schoolCategory: s.schoolCategory,
          gradeName: s.grade?.name || null,
          centerName: s.centerName,
          studyMode: s.studyMode,
        })),
      },
    };
  }
}
