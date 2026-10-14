import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { BidiStatement } from "@/components/ui/BidiStatement";
import {
  Zap,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  History,
} from "lucide-react";

export default async function ExamsHubPage() {
  const user = await getCurrentUser();

  // Fetch available ready-made exams
  const exams = await prisma.exam.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      subject: true,
      questions: { select: { id: true } },
    },
  });

  // Fetch student recent attempts if logged in
  const recentAttempts = user
    ? await prisma.examAttempt.findMany({
        where: { userId: user.id },
        take: 5,
        orderBy: { startedAt: "desc" },
      })
    : [];

  return (
    <StudentShell user={user}>
      <div className="space-y-7 text-right font-sans">
        {/* Compact & Refined Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 lg:p-7 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Text & Actions */}
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                <Sparkles className="w-3.5 h-3.5" />
                <span>امتحانات وتدريبات متفصلة ليك</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white leading-snug">
                قيس مستواك وظبّط نقط ضعفك عشان تقفّل المادة
              </h1>

              <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 leading-relaxed font-medium">
                اتدرب براحتك مع شرح وتفسير لكل خطوة، أو جرب امتحان بوقت حقيقي يعيشك جو الامتحان النهائي بالظبط.
              </p>

              {/* Compact Value Points */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>مؤقت زي الامتحان بالظبط</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>شرح فوري لكل سؤال</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>بيعرفك نقط ضعفك فين</span>
                </span>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <Link
                  href="/exams/builder"
                  className="h-10 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-2xs transition-all active:scale-95 group"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>فصّل امتحان على مزاجك دلوقتي</span>
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Compact 3D Illustration */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md shrink-0 self-center">
              <Image
                src="/images/exams-hero.jpg"
                alt="امتحانات وتدريبات متفصلة ليك"
                fill
                priority
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 768px) 176px, 192px"
              />
            </div>
          </div>
        </div>

        {/* Ready-made Exams Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-black text-[#14243D] dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#4F46E5]" />
              <span>امتحانات شاملة وجاهزة تحلها فوراً</span>
            </h2>
            <Link
              href="/exams/builder"
              className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline"
            >
              عاوز تختار أسئلة معينة؟ فصّل من هنا ←
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => {
              const qCount = exam.questions.length;
              const qText =
                qCount === 1
                  ? "سؤال واحد"
                  : qCount === 2
                  ? "سؤالين"
                  : qCount <= 10
                  ? `${qCount} أسئلة`
                  : `${qCount} سؤال`;

              return (
                <div
                  key={exam.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-950/50 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-300 text-[11px] font-black border border-indigo-200/50 dark:border-indigo-800/50">
                        <BidiStatement as="span" text={exam.subject.name} />
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{exam.durationMinutes} دقيقة</span>
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-[#14243D] dark:text-white leading-snug">
                      <BidiStatement as="span" text={exam.title} />
                    </h3>

                    {exam.description && (
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1.5 line-clamp-2 leading-relaxed">
                        <BidiStatement as="span" text={exam.description} />
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {qText}
                    </span>
                    <Link
                      href={`/exams/${exam.id}`}
                      className="h-9 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
                    >
                      <span>يلا نحل</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Attempts History */}
        {recentAttempts.length > 0 && (
          <div className="space-y-4 pt-2">
            <h2 className="text-base sm:text-lg font-black text-[#14243D] dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" />
              <span>امتحاناتك اللي حلتها قبل كدة</span>
            </h2>

            <div className="rounded-2xl bg-white dark:bg-zinc-950/50 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
              {recentAttempts.map((attempt) => {
                const isGood = attempt.percentage >= 70;
                const isPass = attempt.percentage >= 50;

                const scoreColor = isGood
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                  : isPass
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50";

                const dateStr = new Date(attempt.startedAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={attempt.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 border ${scoreColor}`}
                      >
                        {Math.round(attempt.percentage)}%
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-black text-[#14243D] dark:text-white leading-normal">
                          <BidiStatement as="span" text={attempt.title} />
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] font-bold mt-1">
                          <span>
                            {attempt.score === attempt.totalQuestions && attempt.totalQuestions > 0
                              ? `قفلته! جبت ${attempt.score} من ${attempt.totalQuestions}`
                              : `جبت ${attempt.score} من ${attempt.totalQuestions} أسئلة`}
                          </span>
                          <span>•</span>
                          <span>{dateStr}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/exams/${attempt.examId}/results?attemptId=${attempt.id}`}
                      className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 text-xs font-bold text-[#14243D] dark:text-white flex items-center justify-center gap-1.5 transition-colors shrink-0 self-stretch sm:self-center"
                    >
                      <span>راجع إجاباتك</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </StudentShell>
  );
}
