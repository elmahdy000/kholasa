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
        {/* Compact & Refined Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 lg:p-7 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Text & Actions */}
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                <Sparkles className="w-3.5 h-3.5" />
                <span>منصة الاختبارات والتقييم الذكي</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white leading-snug">
                اختبر تحصيلك، وحدد نقاط قوتك وضعفك بدقة
              </h1>

              <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-300 leading-relaxed font-medium">
                اختر بين التدريب المفتوح مع التفسير الفوري لكل خطوة، أو خوض امتحانات واقعية بمؤقت زمني لتدريب نفسك على أجواء الامتحان النهائي.
              </p>

              {/* Compact Value Points */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>مؤقت زمني دقيق</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>تفسير فوري للإجابات</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>تحليل نقاط الضعف</span>
                </span>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <Link
                  href="/exams/builder"
                  className="h-10 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-2xs transition-all active:scale-95 group"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>صمم اختبارك المخصص الآن</span>
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Compact 3D Illustration */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md shrink-0 self-center">
              <Image
                src="/images/exams-hero.jpg"
                alt="منصة الاختبارات والتقييم الذكي"
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
