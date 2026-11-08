import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, isSubjectInScope } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import {
  ArrowLeft,
  Clock,
  Play,
  Target,
  CheckCircle2,
  Layers,
  BookmarkCheck,
  Lock,
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

        {/* Subject Header Banner (Vercel Style) */}
        <section className="relative overflow-hidden rounded-xl p-6 sm:p-8 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] ">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
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
              className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center justify-center gap-2  transition-all shrink-0 active:opacity-80"
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

          <div className="space-y-4">
            {subject.units.map((unit, index) => {
              const unitCompleted = unit.lessons.filter((l) => completedLessonIds.has(l.id)).length;
              const unitTotal = unit.lessons.length;
              const unitProgress = unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0;

              const unitQuestions = unit.lessons.flatMap((l) => l.questions.map((q) => q.questionId));
              const unitMasteredCount = unitQuestions.filter((qid) => masteredSet.has(qid)).length;
              const unitMasteryPct = unitQuestions.length > 0 ? Math.round((unitMasteredCount / unitQuestions.length) * 100) : 0;

              return (
                <div
                  key={unit.id}
                  className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  overflow-hidden"
                >
                  {/* Unit Header */}
                  <div className="p-4 sm:p-5 bg-[#F8FAFC]/80 dark:bg-[#1E293B]/40 border-b border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-mono font-bold text-[#800020] dark:text-[#FB7185]">
                          الوحدة {index + 1}
                        </span>
                        <span className="text-[13px] text-[#64748B]">•</span>
                        <span className="text-[13px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                          {unitCompleted} من {unitTotal} منجز ({unitProgress}%)
                        </span>
                        {unitQuestions.length > 0 && (
                          <>
                            <span className="text-[13px] text-[#64748B]">•</span>
                            <span
                              className={`text-[12px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                unitMasteryPct >= 80
                                  ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399]"
                                  : unitMasteryPct >= 50
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                  : "bg-[#64748B]/10 text-[#64748B] dark:text-[#94A3B8]"
                              }`}
                            >
                              إتقان الأسئلة: {unitMasteryPct}% ({unitMasteredCount}/{unitQuestions.length})
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {unit.title}
                      </h3>
                      {unit.description && (
                        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                          {unit.description}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/exams/builder?subjectId=${subject.id}&unitId=${unit.id}`}
                      className="h-11 px-4 rounded-lg bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-bold flex items-center justify-center gap-2 transition-all shrink-0 self-start sm:self-center border border-[#E2E8F0] dark:border-[#334155]"
                    >
                      <Target className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
                      <span>امتحان الوحدة</span>
                    </Link>
                  </div>

                  {/* Lessons in this Unit */}
                  <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/80">
                    {unit.lessons.map((lesson) => {
                      const isLessonCompleted = completedLessonIds.has(lesson.id);
                      const lessonQuestions = lesson.questions.map((q) => q.questionId);
                      const lessonMasteredCount = lessonQuestions.filter((qid) => masteredSet.has(qid)).length;
                      const lessonMasteryPct = lessonQuestions.length > 0 ? Math.round((lessonMasteredCount / lessonQuestions.length) * 100) : 0;
                      const isFreeTrialLesson = Boolean((lesson as any).isTrial) || (unit.order === 1 && lesson.order === 1);
                      const isLessonLocked = !isSubscriptionActive && !isFreeTrialLesson;

                      return (
                        <div
                          key={lesson.id}
                          className={`p-4 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                            isLessonLocked
                              ? "bg-slate-50/50 dark:bg-[#121A28]/40 hover:bg-slate-100/50 dark:hover:bg-[#152033]"
                              : "hover:bg-[#F8FAFC]/60 dark:hover:bg-[#1E293B]/40"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
                                isLessonLocked
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : isLessonCompleted
                                  ? "bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399]"
                                  : "bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185]"
                              }`}
                            >
                              {isLessonLocked ? (
                                <Lock className="w-4 h-4" />
                              ) : isLessonCompleted ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-1" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug">
                                  {lesson.title}
                                </h4>
                                {isLessonLocked ? (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" />
                                    مقفول للمشتركين
                                  </span>
                                ) : isLessonCompleted ? (
                                  <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399]">
                                    مكتمل
                                  </span>
                                ) : null}
                                {lessonQuestions.length > 0 && !isLessonLocked && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                      lessonMasteryPct >= 80
                                        ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399]"
                                        : lessonMasteryPct >= 40
                                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                        : "bg-[#64748B]/10 text-[#64748B] dark:text-[#94A3B8]"
                                    }`}
                                  >
                                    إتقان {lessonMasteryPct}%
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1 flex-wrap">
                                <span className="flex items-center gap-1 font-mono text-[13px]">
                                  <Clock className="w-3 h-3 text-[#64748B]" />
                                  <span>{lesson.durationMinutes} دقيقة</span>
                                </span>
                                {lesson.summary && (
                                  <span className="inline-flex items-center gap-1 text-[#D97706] dark:text-[#FBBF24] font-bold">
                                    <BookmarkCheck className="w-3.5 h-3.5" />
                                    <span>الزتونة جاهزة</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-center">
                            {!isLessonLocked && (
                              <Link
                                href={`/exams/builder?subjectId=${subject.id}&unitId=${unit.id}&lessonId=${lesson.id}`}
                                className="h-11 px-3.5 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#800020] dark:text-[#FB7185] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                                title="امتحان على هذا الدرس"
                              >
                                <Target className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">امتحان الدرس</span>
                              </Link>
                            )}

                            <Link
                              href={`/lessons/${lesson.id}`}
                              className={`h-11 px-4 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all shrink-0 active:opacity-80 flex-1 sm:flex-initial ${
                                isLessonLocked
                                  ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                                  : isLessonCompleted
                                  ? "bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155]"
                                  : "bg-[#800020] hover:bg-[#66001A] text-white "
                              }`}
                            >
                              {isLessonLocked ? (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>تفعيل الاشتراك (200 ج)</span>
                                </>
                              ) : (
                                <>
                                  <span>{isLessonCompleted ? "مراجعة الدرس" : "ابدأ المذاكرة"}</span>
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </>
                              )}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
