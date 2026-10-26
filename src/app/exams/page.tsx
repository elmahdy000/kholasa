import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { examScopeWhere, getCurriculumScope } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { BidiStatement } from "@/components/ui/BidiStatement";
import {
  Target,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  ArrowLeft,
  BookmarkCheck,
  History,
} from "lucide-react";

export default async function ExamsHubPage() {
  const user = await getCurrentUser();
  const scope = getCurriculumScope(user);

  // Fetch available ready-made exams for the student's curriculum
  const exams = await prisma.exam.findMany({
    where: examScopeWhere(scope),
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
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-5 sm:p-6 lg:p-7 ">
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-6">
            {/* Text & Actions */}
            <div className="space-y-3 max-w-3xl md:mx-auto md:text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold border border-[#E2E8F0]/60 dark:border-[#E11D48]/60">
                <Target className="w-3.5 h-3.5" />
                <span>امتحانات وتدريبات متفصلة ليك</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white leading-snug">
                قيس مستواك وظبّط نقط ضعفك عشان تقفّل المادة
              </h1>

              <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#F8FAFC] leading-relaxed font-medium">
                اتدرب براحتك مع شرح وتفسير لكل خطوة، أو جرب امتحان بوقت حقيقي يعيشك جو الامتحان النهائي بالظبط.
              </p>

              {/* Compact Value Points */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[13px] sm:text-[13px] font-semibold text-[#64748B] dark:text-[#94A3B8] md:justify-center">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#800020] shrink-0" />
                  <span>مؤقت زي الامتحان بالظبط</span>
                </span>
                <span className="flex items-center gap-2">
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                  <span>شرح فوري لكل سؤال</span>
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>بيعرفك نقط ضعفك فين</span>
                </span>
              </div>

              {/* CTA Button */}
              <div className="pt-2 md:flex md:justify-center">
                <Link
                  href="/exams/builder"
                  className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] sm:text-sm font-bold inline-flex items-center gap-2  transition-all active:opacity-80 group"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>فصّل امتحان على مزاجك دلوقتي</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Ready-made Exams Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#800020]" />
              <span>امتحانات شاملة وجاهزة تحلها فوراً</span>
            </h2>
            <Link
              href="/exams/builder"
              className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline"
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
                  className="p-5 rounded-xl bg-white dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#334155]  hover:shadow-sm transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#E11D48]/50">
                        <BidiStatement as="span" text={exam.subject.name} />
                      </span>
                      <span className="flex items-center gap-1 text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                        <Clock className="w-3.5 h-3.5 text-[#800020]" />
                        <span>{exam.durationMinutes} دقيقة</span>
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-snug">
                      <BidiStatement as="span" text={exam.title} />
                    </h3>

                    {exam.description && (
                      <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-2 leading-relaxed break-words">
                        <BidiStatement as="span" text={exam.description} />
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                      {qText}
                    </span>
                    <Link
                      href={`/exams/${exam.id}`}
                      className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-colors  active:opacity-80"
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
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-[#800020]" />
              <span>امتحاناتك اللي حلتها قبل كدة</span>
            </h2>

            <div className="rounded-xl bg-white dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#334155] divide-y divide-[#E2E8F0] dark:divide-[#334155] overflow-hidden ">
              {recentAttempts.map((attempt) => {
                const isGood = attempt.percentage >= 70;
                const isPass = attempt.percentage >= 50;

                const scoreColor = isGood
                  ? "bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] border-[#E2E8F0] dark:border-[#34D399]/50"
                  : isPass
                  ? "bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] border-[#E2E8F0] dark:border-[#FBBF24]/50"
                  : "bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171] border-[#E2E8F0] dark:border-[#F87171]/50";

                const dateStr = new Date(attempt.startedAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={attempt.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] dark:hover:bg-[#334155]/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-[13px] sm:text-sm shrink-0 border ${scoreColor}`}
                      >
                        {Math.round(attempt.percentage)}%
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white leading-normal">
                          <BidiStatement as="span" text={attempt.title} />
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[13px] sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-bold mt-1">
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
                      className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020] hover:text-[#800020] dark:hover:border-[#E11D48] dark:hover:text-[#FB7185] text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center justify-center gap-2 transition-colors shrink-0 self-stretch sm:self-center"
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
