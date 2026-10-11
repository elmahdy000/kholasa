import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { DailyChallengeCard } from "@/components/dashboard/DailyChallengeCard";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Redirect to setup if user hasn't completed onboarding
  if (user && (!user.systemId || !user.gradeId)) {
    redirect("/setup");
  }

  // Fetch all published subjects with units and lessons count
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

  // Calculate real progress & counts
  const userId = user?.id;

  const [completedLessonsCount, unresolvedMistakesCount, recentAttempts] =
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
          })
        : [],
    ]);

  // First available lesson to offer as "Continue learning"
  const [firstLesson, dailyQuestion] = await Promise.all([
    prisma.lesson.findFirst({
      where: { isPublished: true },
      include: {
        unit: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { order: "asc" },
    }),
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

  // Map subjects for client component
  const subjectsForClient = subjects.map((subj) => ({
    id: subj.id,
    name: subj.name,
    description: subj.description,
    color: subj.color,
    unitsCount: subj.units.length,
    totalLessons: subj.units.reduce((sum, u) => sum + u.lessons.length, 0),
  }));

  return (
    <StudentShell user={user}>
      <DashboardClient
        userName={user?.name}
        completedLessonsCount={completedLessonsCount}
        recentAttemptsCount={recentAttempts.length}
        unresolvedMistakesCount={unresolvedMistakesCount}
        subjects={subjectsForClient}
      />

      {/* Continue Learning Featured Card */}
      {firstLesson && (
        <section className="mt-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 to-blue-50/50 dark:from-indigo-950/20 dark:to-slate-900/40 border border-indigo-200/60 dark:border-indigo-900/40 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#6858EA] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#6858EA]/20 mt-1">
                <span className="text-lg font-black">▶</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#6858EA] block">
                  متابعة الدرس الحالي • {firstLesson.unit.subject.name}
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#14243D] dark:text-white">
                  {firstLesson.title}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  الوحدة: {firstLesson.unit.title} • المدة: {firstLesson.durationMinutes} دقيقة
                </p>
              </div>
            </div>

            <a
              href={`/lessons/${firstLesson.id}`}
              className="h-11 px-6 rounded-xl bg-[#6858EA] hover:bg-[#5444D8] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-[#6858EA]/25 transition-all shrink-0"
            >
              <span>افتح الدرس والزتونة</span>
              <span className="text-sm">←</span>
            </a>
          </div>
        </section>
      )}

      {/* Daily Challenge Card */}
      {dailyQuestion && (
        <div className="mt-8">
          <DailyChallengeCard question={dailyQuestion as any} />
        </div>
      )}
    </StudentShell>
  );
}