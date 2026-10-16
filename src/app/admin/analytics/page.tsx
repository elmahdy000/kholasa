import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canViewAnalytics } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { AnalyticsManagerClient } from "@/components/admin/AnalyticsManagerClient";

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();

  if (!user || !canViewAnalytics(user.role)) {
    redirect("/login?callbackUrl=/admin/analytics");
  }

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
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({
      where: { role: { in: ["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"] } },
    }),
    prisma.subject.count(),
    prisma.lesson.count(),
    prisma.question.count(),
    prisma.exam.count(),
    prisma.examAttempt.count(),
    prisma.examAttempt.findMany({
      where: { isCompleted: true },
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
      <AnalyticsManagerClient data={analyticsData} />
    </AdminShell>
  );
}
