import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Clock,
  Play,
  Zap,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";

interface SubjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [subject, userProgress] = await Promise.all([
    prisma.subject.findUnique({
      where: { id },
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
  ]);

  if (!subject) {
    notFound();
  }

  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));

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
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/subjects" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            المواد
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">{subject.name}</span>
        </div>

        {/* Subject Header Banner (Vercel Style) */}
        <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <Layers className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>منهج معتمد • {subject.units.length} وحدات • {totalLessons} درس</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {subject.name}
              </h1>
              {subject.description && (
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
                  {subject.description}
                </p>
              )}

              {/* Progress Summary */}
              <div className="pt-2 flex items-center gap-3">
                <div className="w-36 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4F46E5] dark:bg-indigo-500 transition-all duration-500"
                    style={{ width: `${subjectProgress}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
                  {completedCount} من {totalLessons} مكتمل ({subjectProgress}%)
                </span>
              </div>
            </div>

            <Link
              href={`/exams/builder?subjectId=${subject.id}`}
              className="h-11 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all shrink-0 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>اختبار شامل على المادة</span>
            </Link>
          </div>
        </section>

        {/* Units and Lessons List */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              الوحدات والدروس التفصيلية
            </h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              مرتبة حسب خطة المنهج
            </span>
          </div>

          <div className="space-y-4">
            {subject.units.map((unit, index) => {
              const unitCompleted = unit.lessons.filter((l) => completedLessonIds.has(l.id)).length;
              const unitTotal = unit.lessons.length;
              const unitProgress = unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0;

              return (
                <div
                  key={unit.id}
                  className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden"
                >
                  {/* Unit Header */}
                  <div className="p-4 sm:p-5 bg-zinc-50/80 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-[#4F46E5] dark:text-indigo-400">
                          الوحدة {index + 1}
                        </span>
                        <span className="text-xs text-zinc-400">•</span>
                        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                          {unitCompleted} من {unitTotal} منجز ({unitProgress}%)
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {unit.title}
                      </h3>
                      {unit.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {unit.description}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/exams/builder?subjectId=${subject.id}&unitId=${unit.id}`}
                      className="h-8.5 px-3.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 self-start sm:self-center border border-zinc-200 dark:border-zinc-700"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>امتحان الوحدة</span>
                    </Link>
                  </div>

                  {/* Lessons in this Unit */}
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {unit.lessons.map((lesson) => {
                      const isLessonCompleted = completedLessonIds.has(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          className="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                          <div className="flex items-start gap-3.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isLessonCompleted
                                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                                  : "bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400"
                              }`}
                            >
                              {isLessonCompleted ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                                  {lesson.title}
                                </h4>
                                {isLessonCompleted && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                    مكتمل
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                                <span className="flex items-center gap-1 font-mono text-[11px]">
                                  <Clock className="w-3 h-3 text-zinc-400" />
                                  <span>{lesson.durationMinutes} دقيقة</span>
                                </span>
                                {lesson.summary && (
                                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                                    <Sparkles className="w-3 h-3" />
                                    <span>الزتونة جاهزة</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/lessons/${lesson.id}`}
                            className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                              isLessonCompleted
                                ? "bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800"
                                : "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-2xs"
                            }`}
                          >
                            <span>{isLessonCompleted ? "مراجعة الدرس" : "ابدأ المذاكرة"}</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </Link>
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
