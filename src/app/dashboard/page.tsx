import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, isSubjectInScope, subjectScopeWhere } from "@/lib/curriculum";
import { calculateStreak, getCairoDayKey, shiftDayKey } from "@/lib/date";
import { StudentShell } from "@/components/layout/StudentShell";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Redirect to setup if user hasn't completed onboarding
  if (!user.systemId || !user.gradeId) {
    redirect("/setup");
  }

  const userId = user.id;
  const scope = getCurriculumScope(user);

  // 1. Fetch published subjects that belong to the student's curriculum
  const subjects = await prisma.subject.findMany({
    where: { isPublished: true, ...subjectScopeWhere(scope) },
    orderBy: { order: "asc" },
    include: {
      units: {
        where: { isPublished: true },
        include: {
          lessons: {
            where: { isPublished: true },
            select: { id: true },
          },
        },
      },
    },
  });

  // 2. Calculate real progress & counts
  const [
    completedLessonsCount,
    unresolvedMistakesCount,
    recentAttempts,
    userProgress,
    examStats,
    challengeDays,
  ] = await Promise.all([
    userId
      ? prisma.studentProgress.count({
          where: { userId, isCompleted: true },
        })
      : 0,
    userId
      ? prisma.mistakeReview.count({
          where: { userId, isResolved: false },
        })
      : 0,
    userId
      ? prisma.examAttempt.findMany({
          where: { userId, isCompleted: true },
          take: 3,
          orderBy: { completedAt: "desc" },
          select: {
            id: true,
            title: true,
            percentage: true,
            totalQuestions: true,
            completedAt: true,
          },
        })
      : [],
    userId
      ? prisma.studentProgress.findMany({
          where: { userId, isCompleted: true },
          select: { lessonId: true },
        })
      : [],
    userId
      ? prisma.examAttempt.aggregate({
          where: { userId, isCompleted: true },
          _count: { _all: true },
          _avg: { percentage: true },
        })
      : { _count: { _all: 0 }, _avg: { percentage: null } },
    userId
      ? prisma.dailyChallenge.findMany({
          where: { userId, completedAt: { not: null } },
          select: { day: true },
          orderBy: { day: "desc" },
          take: 90,
        })
      : [],
  ]);

  const completedAttemptsCount = examStats._count._all;
  const averageScore =
    examStats._avg.percentage !== null
      ? Math.round(examStats._avg.percentage)
      : null;
  const todayKey = getCairoDayKey();
  const isTodayCompleted = challengeDays.some((c) => c.day === todayKey);
  const streakDays = calculateStreak(challengeDays.map((c) => c.day));

  const weekDayNames = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayKey = shiftDayKey(todayKey, i - 6);
    const dateObj = new Date(dayKey + "T00:00:00Z");
    const dayIndex = (dateObj.getUTCDay() + 1) % 7;
    const isCompleted = challengeDays.some((c) => c.day === dayKey);
    return {
      dayKey,
      dayName: weekDayNames[dayIndex] || dayKey.slice(5),
      isCompleted,
      isToday: dayKey === todayKey,
    };
  });

  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));

  // 3. Find the most relevant lesson for "Continue Learning"
  // Priority: Most recently accessed lesson by student, or first available lesson
  const lastActiveProgress = userId
    ? await prisma.studentProgress.findFirst({
        where: { userId },
        orderBy: { lastAccessedAt: "desc" },
        include: {
          lesson: {
            include: {
              unit: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      })
    : null;

  const [firstLesson, dailyQuestion] = await Promise.all([
    !lastActiveProgress
      ? prisma.lesson.findFirst({
          where: {
            isPublished: true,
            unit: { isPublished: true, subject: { is: subjectScopeWhere(scope) } },
          },
          include: {
            unit: {
              include: {
                subject: true,
              },
            },
          },
          orderBy: { order: "asc" },
        })
      : null,
    prisma.question.findFirst({
      where: {
        status: "PUBLISHED",
        type: "MCQ",
        ...(scope?.gradeId ? { subject: { is: subjectScopeWhere(scope) } } : {}),
      },
      select: {
        id: true,
        statement: true,
        type: true,
        difficulty: true,
        subject: { select: { id: true, name: true } },
        unit: { select: { id: true, title: true } },
        options: {
          select: { id: true, text: true, order: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const resolvedDailyQuestion =
    dailyQuestion ||
    (await prisma.question.findFirst({
      where: {
        status: "PUBLISHED",
        type: "MCQ",
      },
      select: {
        id: true,
        statement: true,
        type: true,
        difficulty: true,
        subject: { select: { id: true, name: true } },
        unit: { select: { id: true, title: true } },
        options: {
          select: { id: true, text: true, order: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }));

  const activeLesson =
    (lastActiveProgress?.lesson &&
    isSubjectInScope(scope, lastActiveProgress.lesson.unit.subject)
      ? lastActiveProgress.lesson
      : null) || firstLesson;

  const continueLessonData = activeLesson
    ? {
        id: activeLesson.id,
        title: activeLesson.title,
        durationMinutes: activeLesson.durationMinutes,
        unit: {
          id: activeLesson.unit.id,
          title: activeLesson.unit.title,
          subject: {
            id: activeLesson.unit.subject.id,
            name: activeLesson.unit.subject.name,
            color: activeLesson.unit.subject.color,
          },
        },
        progressPercent: lastActiveProgress?.progressPercent ?? 0,
      }
    : null;

  // 4. Map subjects with accurate completion metrics
  const subjectsForClient = subjects.map((subj) => {
    const allLessonIds = subj.units.flatMap((u) => u.lessons.map((l) => l.id));
    const completedCount = allLessonIds.filter((id) => completedLessonIds.has(id)).length;
    const totalLessons = allLessonIds.length;
    const progressPercent =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      id: subj.id,
      name: subj.name,
      description: subj.description,
      color: subj.color,
      unitsCount: subj.units.length,
      totalLessons,
      completedLessons: completedCount,
      progressPercent,
    };
  });

  return (
    <StudentShell user={user}>
      <DashboardClient
        userName={user?.name}
        studentMeta={{
          systemName: user?.system?.name || null,
          gradeName: user?.grade?.name || null,
          trackName: user?.track?.name || null,
        }}
        completedLessonsCount={completedLessonsCount}
        recentAttemptsCount={completedAttemptsCount}
        averageScore={averageScore}
        streakDays={streakDays}
        isTodayCompleted={isTodayCompleted}
        weekDays={weekDays}
        unresolvedMistakesCount={unresolvedMistakesCount}
        subjects={subjectsForClient}
        continueLesson={continueLessonData}
        dailyQuestion={resolvedDailyQuestion as any}
        recentExams={recentAttempts.map((a) => ({
          id: a.id,
          title: a.title,
          percentage: Math.round(a.percentage),
          totalQuestions: a.totalQuestions,
          completedAt: a.completedAt ? a.completedAt.toISOString() : null,
        }))}
      />
    </StudentShell>
  );
}