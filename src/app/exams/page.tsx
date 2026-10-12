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
      <div className="space-y-8 text-right font-sans">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#1E1B4B]/60 border border-slate-800/80 p-6 sm:p-8 lg:p-10 text-white shadow-xl shadow-indigo-950/20">
          {/* Ambient decorative glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
            {/* Text & Actions */}
            <div className="flex-1 space-y-4 sm:space-y-5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold border border-indigo-500/25 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>منصة الاختبارات والتقييم الذكي</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-white tracking-tight">
                اختبر مستواك، اكتشف نقاط قوتك، واضمن تفوقك الدراسي
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                اختر بين التدريب المفتوح مع التفسير الفوري لكل خطوة، أو خوض امتحانات واقعية بمؤقت زمني لتدريب نفسك على بيئة الامتحان الحقيقي.
              </p>

              {/* Value features */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-slate-300 text-[11px] sm:text-xs font-medium">
                <div className="flex items-center gap-1.5 bg-slate-800/60 dark:bg-slate-900/60 border border-slate-700/60 px-2.5 py-1.5 rounded-lg backdrop-blur-xs">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>مؤقت زمني دقيق</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/60 dark:bg-slate-900/60 border border-slate-700/60 px-2.5 py-1.5 rounded-lg backdrop-blur-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>تفسير فوري للإجابات</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/60 dark:bg-slate-900/60 border border-slate-700/60 px-2.5 py-1.5 rounded-lg backdrop-blur-xs col-span-2 sm:col-span-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>تحليل نقاط الضعف</span>
                </div>
              </div>

              {/* Primary CTA */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/exams/builder"
                  className="h-11 sm:h-12 px-6 sm:px-7 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-indigo-600/25 transition-all active:scale-95 group"
                >
                  <SlidersHorizontal className="w-4 h-4 text-indigo-200" />
                  <span>صمم اختبارك المخصص الآن</span>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            </div>

            {/* 3D Hero Illustration */}
            <div className="relative w-full lg:w-[380px] xl:w-[440px] aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-indigo-950/60 group shrink-0 self-center">
              <Image
                src="/images/exams-hero.jpg"
                alt="منصة الاختبارات والتقييم الذكي"
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 440px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Ready-made Exams Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-[#14243D] dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#6858EA]" />
              <span>امتحانات شاملة وجاهزة</span>
            </h2>
            <Link
              href="/exams/builder"
              className="text-xs font-bold text-[#6858EA] hover:underline"
            >
              تخصيص أسئلة محددة ←
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#6858EA]/10 text-[#6858EA] text-[11px] font-black">
                      <BidiStatement as="span" text={exam.subject.name} />
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{exam.durationMinutes} دقيقة</span>
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-[#14243D] dark:text-white leading-snug">
                    <BidiStatement as="span" text={exam.title} />
                  </h3>

                  {exam.description && (
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 line-clamp-2">
                      <BidiStatement as="span" text={exam.description} />
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    {exam.questions.length} سؤال
                  </span>
                  <Link
                    href={`/exams/${exam.id}`}
                    className="h-9 px-4 rounded-xl bg-[#6858EA] hover:bg-[#5444D8] text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>ابدأ الاختبار</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attempts History */}
        {recentAttempts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-black text-[#14243D] dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-[#11B7B4]" />
              <span>سجل اختباراتك السابقة</span>
            </h2>

            <div className="rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                        attempt.percentage >= 80
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : attempt.percentage >= 50
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {Math.round(attempt.percentage)}%
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#14243D] dark:text-white">
                        <BidiStatement as="span" text={attempt.title} />
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8] font-bold mt-1">
                        <span>
                          الدرجة: {attempt.score} من {attempt.totalQuestions}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(attempt.startedAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/exams/${attempt.examId}/results?attemptId=${attempt.id}`}
                    className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-[#14243D] dark:text-white flex items-center justify-center gap-1.5 transition-colors self-start sm:self-center"
                  >
                    <span>عرض تقرير الإجابات</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StudentShell>
  );
}
