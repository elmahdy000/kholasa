import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, isSubjectInScope } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { SubjectUnitsList } from "@/components/subjects/SubjectUnitsList";
import {
  Layers,
  Target,
} from "lucide-react";

interface SubjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?callbackUrl=/subjects/${id}`);
  }

  const isStaff = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const isSubscriptionActive = isStaff || user.subscriptionStatus === "ACTIVE";

  const [subject, userProgress, masteredAttempts] = await Promise.all([
    prisma.subject.findUnique({
      where: { id, isPublished: true },
      include: {
        units: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { order: "asc" },
              include: {
                summary: { select: { id: true } },
                questions: {
                  select: { questionId: true },
                },
              },
            },
          },
        },
      },
    }),
    user?.id
      ? prisma.studentProgress.findMany({
          where: {
            userId: user.id,
            isCompleted: true,
          },
          select: { lessonId: true },
        })
      : [],
    user?.id
      ? prisma.questionAttempt.findMany({
          where: {
            userId: user.id,
            isCorrect: true,
          },
          select: { questionId: true },
        })
      : [],
  ]);

  if (!subject) {
    notFound();
  }

  // Students may only open subjects from their own curriculum.
  if (!isSubjectInScope(getCurriculumScope(user), subject)) {
    notFound();
  }

  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));
  const masteredSet = new Set(masteredAttempts.map((a) => a.questionId));

  const totalLessons = subject.units.reduce(
    (sum, u) => sum + u.lessons.length,
    0
  );

  const completedCount = subject.units.reduce(
    (sum, u) => sum + u.lessons.filter((l) => completedLessonIds.has(l.id)).length,
    0
  );

  const subjectProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <StudentShell user={user}>
      <div className="space-y-7 text-right pb-16">
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
          <Link href="/dashboard" className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/subjects" className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">
            المواد
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">{subject.name}</span>
        </div>

        {/* Subject Header Banner */}
        <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0]/80 dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                <Layers className="w-3.5 h-3.5 text-[#800020]" />
                <span>منهج معتمد • {subject.units.length} وحدات • {totalLessons} درس</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                {subject.name}
              </h1>
              {subject.description && (
                <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-medium max-w-2xl leading-relaxed">
                  {subject.description}
                </p>
              )}

              {/* Progress Summary */}
              <div className="pt-2 flex items-center gap-3">
                <div className="w-36 h-2 rounded-full bg-[#F8FAFC] dark:bg-[#334155] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#800020] dark:bg-[#E11D48] transition-all duration-500"
                    style={{ width: `${subjectProgress}%` }}
                  />
                </div>
                <span className="text-[13px] font-mono font-bold text-[#64748B] dark:text-[#94A3B8]">
                  {completedCount} من {totalLessons} مكتمل ({subjectProgress}%)
                </span>
              </div>
            </div>

            <Link
              href={`/exams/builder?subjectId=${subject.id}`}
              className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all shrink-0 active:opacity-80"
            >
              <Target className="w-4 h-4 text-[#FDE047]" />
              <span>اختبار شامل على المادة</span>
            </Link>
          </div>
        </section>

        {/* Units and Lessons List */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              الوحدات والدروس التفصيلية
            </h2>
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium">
              مرتبة حسب خطة المنهج
            </span>
          </div>

          <SubjectUnitsList
            subjectId={subject.id}
            units={subject.units}
            completedLessonIds={Array.from(completedLessonIds)}
            masteredQuestionIds={Array.from(masteredSet)}
            isSubscriptionActive={isSubscriptionActive}
            user={user}
          />
        </div>
      </div>
    </StudentShell>
  );
}
