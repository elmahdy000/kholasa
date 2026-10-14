import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Redirect to setup if user hasn't completed onboarding
  if (user && (!user.systemId || !user.gradeId)) {
    redirect("/setup");
  }

  const userId = user?.id;

  // 1. Fetch all published subjects with units and lessons
  const subjects = await prisma.subject.findMany({
    where: { isPublished: true },
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
  const [completedLessonsCount, unresolvedMistakesCount, recentAttempts, userProgress] =
    await Promise.all([
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
    ]);

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
          where: { isPublished: true },
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
      where: { status: "PUBLISHED", type: "MCQ" },
      include: {
        subject: { select: { id: true, name: true } },
        unit: { select: { id: true, title: true } },
        options: { orderBy: { order: "asc" } },
        explanation: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeLesson = lastActiveProgress?.lesson || firstLesson;

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
        completedLessonsCount={completedLessonsCount}
        recentAttemptsCount={recentAttempts.length}
        unresolvedMistakesCount={unresolvedMistakesCount}
        subjects={subjectsForClient}
        continueLesson={continueLessonData}
        dailyQuestion={dailyQuestion as any}
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