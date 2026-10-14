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

  const subject = await prisma.subject.findUnique({
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
  });

  if (!subject) {
    notFound();
  }

  const totalLessons = subject.units.reduce(
    (sum, u) => sum + u.lessons.length,
    0
  );

  return (
    <StudentShell user={user}>
      <div className="space-y-8 text-right pb-28">
        {/* Back navigation */}
        <div>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#475569] dark:text-slate-400 hover:text-[#4F46E5] transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لكل المواد</span>
          </Link>
        </div>

        {/* Subject Header Banner (Vercel Style) */}
        <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Layers className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>منهج معتمد • {subject.units.length} وحدات • {totalLessons} درس</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-white tracking-tight">
                {subject.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                {subject.description}
              </p>
            </div>

            <Link
              href={`/exams/builder?subjectId=${subject.id}`}
              className="h-11 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all shrink-0 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>اختبار شامل على المادة</span>
            </Link>
          </div>
        </section>

        {/* Units and Lessons List */}
        <div className="space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
            الوحدات والدروس التفصيلية
          </h2>

          <div className="space-y-5">
            {subject.units.map((unit, index) => (
              <div
                key={unit.id}
                className="rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden"
              >
                {/* Unit Header */}
                <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-[#4F46E5] block">
                      الوحدة {index + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
                      {unit.title}
                    </h3>
                    {unit.description && (
                      <p className="text-xs text-[#475569] dark:text-slate-400">
                        {unit.description}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/exams/builder?subjectId=${subject.id}&unitId=${unit.id}`}
                    className="h-9 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 self-start sm:self-center border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>امتحان الوحدة</span>
                  </Link>
                </div>

                {/* Lessons in this Unit */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {unit.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#0F172A] dark:text-white leading-snug">
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-[#475569] dark:text-slate-400 font-medium mt-1">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{lesson.durationMinutes} دقيقة</span>
                            </span>
                            {lesson.summary && (
                              <span className="inline-flex items-center gap-1 text-[#D97706] font-bold">
                                <Sparkles className="w-3 h-3" />
                                <span>الزتونة متاحة</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/lessons/${lesson.id}`}
                        className="h-9 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all shrink-0 active:scale-95"
                      >
                        <span>ابدأ المذاكرة</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
