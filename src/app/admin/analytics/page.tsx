import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canViewAnalytics } from "@/lib/auth";
import { EXCLUDE_DEMO_SANDBOX_CONDITION } from "@/lib/demo";
import { AdminShell } from "@/components/layout/AdminShell";
import { AnalyticsManagerClient } from "@/components/admin/AnalyticsManagerClient";
import { RealtimeAnalyticsService } from "@/services/realtime-analytics.service";

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();

  if (!user || !canViewAnalytics(user.role)) {
    redirect("/login?callbackUrl=/admin/analytics");
  }

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [
    usersCount,
    studentsCount,
    teachersCount,
    subjectsCount,
    lessonsCount,
    questionsCount,
    examsCount,
    attemptsCount,
    completedAttempts,
    easyQuestions,
    mediumQuestions,
    hardQuestions,
    essayQuestions,
    mcqQuestions,
    auditLogs,
    recentAttempts,
    activeStudentsCount,
    inactiveStudentsCount,
    arabicStudentsCount,
    languagesStudentsCount,
    oneDeviceCount,
    twoDevicesCount,
    completedLessonsCount,
    totalMistakesCount,
    resolvedMistakesCount,
    topStudentsData,
    pendingStudentsData,
    dailySessions,
    dailyAttempts,
    dailyProgress,
    systems,
    grades,
    realtimeData,
  ] = await Promise.all([
    prisma.user.count({ where: EXCLUDE_DEMO_SANDBOX_CONDITION }),
    prisma.user.count({ where: { role: "STUDENT", ...EXCLUDE_DEMO_SANDBOX_CONDITION } }),
    prisma.user.count({
      where: { role: { in: ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"] } },
    }),
    prisma.subject.count(),
    prisma.lesson.count(),
    prisma.question.count(),
    prisma.exam.count(),
    prisma.examAttempt.count({ where: { user: EXCLUDE_DEMO_SANDBOX_CONDITION } }),
    prisma.examAttempt.findMany({
      where: { isCompleted: true, user: EXCLUDE_DEMO_SANDBOX_CONDITION },
      select: { percentage: true, timeSpentSeconds: true, mode: true },
    }),
    prisma.question.count({ where: { difficulty: "EASY" } }),
    prisma.question.count({ where: { difficulty: "MEDIUM" } }),
    prisma.question.count({ where: { difficulty: "HARD" } }),
    prisma.question.count({ where: { type: "ESSAY" } }),
    prisma.question.count({ where: { type: "MCQ" } }),
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
    prisma.user.count({ where: { role: "STUDENT", boundDevices: { isEmpty: false }, ...EXCLUDE_DEMO_SANDBOX_CONDITION } }),
    prisma.user.count({ where: { role: "STUDENT", boundDevices: { isEmpty: true }, ...EXCLUDE_DEMO_SANDBOX_CONDITION } }),
    prisma.user.count({ where: { role: "STUDENT", schoolCategory: "ARABIC", ...EXCLUDE_DEMO_SANDBOX_CONDITION } }),
    prisma.user.count({ where: { role: "STUDENT", schoolCategory: "LANGUAGES", ...EXCLUDE_DEMO_SANDBOX_CONDITION } }),
    prisma.user.count({ where: { role: "STUDENT", maxDevices: 1, ...EXCLUDE_DEMO_SANDBOX_CONDITION } }),
    prisma.user.count({ where: { role: "STUDENT", maxDevices: { gte: 2 }, ...EXCLUDE_DEMO_SANDBOX_CONDITION } }),
    prisma.studentProgress.count({ where: { isCompleted: true, user: EXCLUDE_DEMO_SANDBOX_CONDITION } }),
    prisma.mistakeReview.count({ where: { user: EXCLUDE_DEMO_SANDBOX_CONDITION } }),
    prisma.mistakeReview.count({ where: { isResolved: true, user: EXCLUDE_DEMO_SANDBOX_CONDITION } }),
    prisma.user.findMany({
      where: { role: "STUDENT", attempts: { some: {} }, ...EXCLUDE_DEMO_SANDBOX_CONDITION },
      take: 6,
      orderBy: { attempts: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        phone: true,
        loginCode: true,
        schoolCategory: true,
        boundDevices: true,
        _count: { select: { attempts: true, progress: true } },
        attempts: {
          where: { isCompleted: true },
          select: { percentage: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", boundDevices: { isEmpty: true }, ...EXCLUDE_DEMO_SANDBOX_CONDITION },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        loginCode: true,
        schoolCategory: true,
        createdAt: true,
      },
    }),
    prisma.session.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
        user: { role: "STUDENT", ...EXCLUDE_DEMO_SANDBOX_CONDITION },
      },
      select: {
        id: true,
        createdAt: true,
        deviceId: true,
        user: {
          select: {
            id: true,
            name: true,
            loginCode: true,
            schoolCategory: true,
            grade: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.examAttempt.findMany({
      where: {
        startedAt: { gte: fourteenDaysAgo },
        user: { role: "STUDENT", ...EXCLUDE_DEMO_SANDBOX_CONDITION },
      },
      select: {
        id: true,
        startedAt: true,
        percentage: true,
        exam: { select: { title: true } },
        user: {
          select: {
            id: true,
            name: true,
            loginCode: true,
            schoolCategory: true,
            grade: { select: { name: true } },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.studentProgress.findMany({
      where: {
        lastAccessedAt: { gte: fourteenDaysAgo },
        user: { role: "STUDENT", ...EXCLUDE_DEMO_SANDBOX_CONDITION },
      },
      select: {
        id: true,
        lastAccessedAt: true,
        progressPercent: true,
        isCompleted: true,
        lesson: { select: { title: true } },
        user: {
          select: {
            id: true,
            name: true,
            loginCode: true,
            schoolCategory: true,
            grade: { select: { name: true } },
          },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
    }),
    prisma.educationalSystem.findMany({ select: { id: true, name: true } }),
    prisma.grade.findMany({ select: { id: true, name: true, systemId: true } }),
    RealtimeAnalyticsService.getRealtimeObservatory(),
  ]);

  let scoreHigh = 0;
  let scoreMid = 0;
  let scoreLow = 0;
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

  const topStudents = topStudentsData.map((s) => {
    const avg =
      s.attempts.length > 0
        ? Math.round(
            s.attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) /
              s.attempts.length
          )
        : 0;
    return {
      id: s.id,
      name: s.name || "طالب بدون اسم",
      phone: s.phone || "—",
      loginCode: s.loginCode || "—",
      schoolCategory: s.schoolCategory || ("ARABIC" as const),
      attemptsCount: s._count.attempts,
      completedLessons: s._count.progress,
      averageScore: avg,
      boundDevicesCount: s.boundDevices.length,
    };
  });

  const pendingStudents = pendingStudentsData.map((s) => ({
    id: s.id,
    name: s.name || "طالب",
    phone: s.phone || "—",
    loginCode: s.loginCode || "—",
    schoolCategory: s.schoolCategory || ("ARABIC" as const),
    createdAt: s.createdAt.toISOString(),
  }));

  // Generate 14 days breakdown (DAU - Daily Active Students)
  const days: Array<{
    dateStr: string;
    dayName: string;
    isToday: boolean;
    isYesterday: boolean;
    uniqueStudentsCount: number;
    students: Array<{
      id: string;
      name: string;
      loginCode: string;
      gradeName: string;
      schoolCategory: "ARABIC" | "LANGUAGES";
      lastActiveTime: string;
      actions: string[];
    }>;
  }> = [];

  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const dayName =
      i === 0
        ? "اليوم"
        : i === 1
        ? "أمس"
        : d.toLocaleDateString("ar-EG", { weekday: "short", day: "numeric", month: "short" });

    const daySessions = dailySessions.filter(
      (s) => s.createdAt.toISOString().slice(0, 10) === dateStr
    );
    const dayAttempts = dailyAttempts.filter(
      (a) => a.startedAt.toISOString().slice(0, 10) === dateStr
    );
    const dayProgress = dailyProgress.filter(
      (p) => p.lastAccessedAt.toISOString().slice(0, 10) === dateStr
    );

    type DayStudent = {
      id: string;
      name: string;
      loginCode: string;
      gradeName: string;
      schoolCategory: "ARABIC" | "LANGUAGES";
      lastActiveTime: string;
      actions: string[];
    };
    const studentMap = new Map<string, DayStudent>();

    for (const s of daySessions) {
      if (!s.user) continue;
      const existing: DayStudent = studentMap.get(s.user.id) || {
        id: s.user.id,
        name: s.user.name || "طالب بدون اسم",
        loginCode: s.user.loginCode || "—",
        gradeName: s.user.grade?.name || "—",
        schoolCategory: (s.user.schoolCategory as any) || "ARABIC",
        lastActiveTime: s.createdAt.toISOString(),
        actions: [],
      };
      existing.actions.push(
        `تسجيل دخول (${new Date(s.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })})`
      );
      studentMap.set(s.user.id, existing);
    }

    for (const a of dayAttempts) {
      if (!a.user) continue;
      const existing: DayStudent = studentMap.get(a.user.id) || {
        id: a.user.id,
        name: a.user.name || "طالب بدون اسم",
        loginCode: a.user.loginCode || "—",
        gradeName: a.user.grade?.name || "—",
        schoolCategory: (a.user.schoolCategory as any) || "ARABIC",
        lastActiveTime: a.startedAt.toISOString(),
        actions: [],
      };
      existing.actions.push(
        `حل اختبار ${a.exam?.title || "تدريبي"} (${a.percentage}%)`
      );
      studentMap.set(a.user.id, existing);
    }

    for (const p of dayProgress) {
      if (!p.user) continue;
      const existing: DayStudent = studentMap.get(p.user.id) || {
        id: p.user.id,
        name: p.user.name || "طالب بدون اسم",
        loginCode: p.user.loginCode || "—",
        gradeName: p.user.grade?.name || "—",
        schoolCategory: (p.user.schoolCategory as any) || "ARABIC",
        lastActiveTime: p.lastAccessedAt.toISOString(),
        actions: [],
      };
      existing.actions.push(
        p.isCompleted
          ? `إتمام درس: ${p.lesson?.title || ""}`
          : `مذاكرة درس: ${p.lesson?.title || ""}`
      );
      studentMap.set(p.user.id, existing);
    }

    days.push({
      dateStr,
      dayName,
      isToday: i === 0,
      isYesterday: i === 1,
      uniqueStudentsCount: studentMap.size,
      students: Array.from(studentMap.values()),
    });
  }

  const past7DaysSum = days.slice(0, 7).reduce((acc, d) => acc + d.uniqueStudentsCount, 0);
  const past7DaysAverage = Math.round((past7DaysSum / 7) * 10) / 10;

  const analyticsData = {
    overview: {
      usersCount,
      studentsCount,
      teachersCount,
      subjectsCount,
      lessonsCount,
      questionsCount,
      examsCount,
      attemptsCount,
      completedAttemptsCount: completedAttempts.length,
      avgScore,
      avgDurationMinutes,
    },
    dailyActivity: {
      todayCount: days[0]?.uniqueStudentsCount || 0,
      yesterdayCount: days[1]?.uniqueStudentsCount || 0,
      past7DaysAverage,
      days,
    },
    studentCohort: {
      totalStudents: studentsCount,
      activeStudents: activeStudentsCount,
      inactiveStudents: inactiveStudentsCount,
      arabicStudents: arabicStudentsCount,
      languagesStudents: languagesStudentsCount,
      oneDeviceStudents: oneDeviceCount,
      twoDevicesStudents: twoDevicesCount,
      completedLessons: completedLessonsCount,
      totalMistakes: totalMistakesCount,
      resolvedMistakes: resolvedMistakesCount,
      topStudents,
      pendingStudents,
    },
    difficultyDistribution: {
      easy: easyQuestions,
      medium: mediumQuestions,
      hard: hardQuestions,
    },
    questionTypes: {
      mcq: mcqQuestions,
      essay: essayQuestions,
    },
    scoreBrackets: {
      high: scoreHigh,
      mid: scoreMid,
      low: scoreLow,
    },
    auditLogs: auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      createdAt: log.createdAt.toISOString(),
      user: log.user,
    })),
    recentAttempts: recentAttempts.map((att) => ({
      id: att.id,
      title: att.title,
      startedAt: att.startedAt.toISOString(),
      score: att.score,
      percentage: att.percentage,
      user: att.user,
      exam: att.exam,
    })),
  };

  return (
    <AdminShell user={user}>
      <AnalyticsManagerClient
        data={analyticsData}
        realtimeInitialData={realtimeData}
        systems={systems}
        grades={grades}
      />
    </AdminShell>
  );
}
