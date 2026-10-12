import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Share2,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface ExamResultsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function ExamResultsPage({
  params,
  searchParams,
}: ExamResultsPageProps) {
  const { id: examId } = await params;
  const { attemptId } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?callbackUrl=/exams/${examId}`);
  }

  // Find the attempt
  const attempt = attemptId
    ? await prisma.examAttempt.findUnique({
        where: { id: attemptId },
        include: {
          answers: {
            include: {
              question: {
                include: {
                  options: { orderBy: { order: "asc" } },
                  explanation: true,
                  rubric: true,
                  lessons: {
                    include: {
                      lesson: {
                        select: { id: true, title: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })
    : await prisma.examAttempt.findFirst({
        where: { examId, userId: user.id, isCompleted: true },
        orderBy: { completedAt: "desc" },
        include: {
          answers: {
            include: {
              question: {
                include: {
                  options: { orderBy: { order: "asc" } },
                  explanation: true,
                  rubric: true,
                  lessons: {
                    include: {
                      lesson: {
                        select: { id: true, title: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

  if (!attempt) {
    notFound();
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { subject: true },
  });

  const correctAnswers = attempt.answers.filter((a) => a.isCorrect === true);
  const wrongAnswers = attempt.answers.filter((a) => a.isCorrect === false);
  const unansweredCount =
    attempt.totalQuestions - (correctAnswers.length + wrongAnswers.length);

  const percentage = attempt.percentage;
  const minutesSpent = Math.floor(attempt.timeSpentSeconds / 60);
  const secondsSpent = attempt.timeSpentSeconds % 60;

  // Grade badge & label
  let gradeBadge = {
    label: "ممتاز! مستوى استثنائي",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-600 dark:text-emerald-400",
  };
  if (percentage < 50) {
    gradeBadge = {
      label: "بحاجة إلى مراجعة وتدريب",
      bgClass: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      textColor: "text-red-600 dark:text-red-400",
    };
  } else if (percentage < 75) {
    gradeBadge = {
      label: "جيد، يمكنك تحقيق الأفضل",
      bgClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      textColor: "text-amber-600 dark:text-amber-400",
    };
  } else if (percentage < 90) {
    gradeBadge = {
      label: "جيد جداً، أداء رائع",
      bgClass: "bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      textColor: "text-[#4F46E5] dark:text-indigo-400",
    };
  }

  return (
    <StudentShell user={user}>
      <div className="max-w-4xl mx-auto space-y-6 text-right font-sans pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
          <Link href="/exams" className="hover:text-[#4F46E5] transition-colors">
            الامتحانات
          </Link>
          <span>/</span>
          <span>نتائج الاختبار</span>
          <span>/</span>
          <span className="text-[#0F172A] dark:text-white font-bold">{attempt.title}</span>
        </div>

        {/* Hero Performance Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${gradeBadge.bgClass}`}
            >
              {gradeBadge.label}
            </span>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
              تقرير نتيجة: {attempt.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-lg leading-relaxed">
              تم رصد إجاباتك بنجاح وتسجيل الأخطاء في مركز "غلطاتي" لتتمكن من مراجعتها وتصحيحها في أي وقت.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href="/mistakes"
                className="h-9 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors interactive-tap"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                <span>راجع أخطاءك في "غلطاتي"</span>
              </Link>

              <Link
                href={`/exams/${examId}`}
                className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 transition-colors interactive-tap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة الاختبار</span>
              </Link>
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shrink-0 self-center md:self-auto relative z-10 min-w-[140px]">
            <div className="relative flex items-center justify-center">
              <div
                className={`text-4xl font-bold font-mono tracking-tight ${gradeBadge.textColor}`}
              >
                {Math.round(percentage)}%
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs font-bold font-mono text-[#0F172A] dark:text-white block">
                {attempt.score} / {attempt.totalQuestions}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                الدرجة المستحقة
              </span>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs text-right">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
              {correctAnswers.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              إجابات صحيحة
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs text-right">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-2">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-red-600 dark:text-red-400 block">
              {wrongAnswers.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              إجابات خاطئة
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs text-right">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 block">
              {unansweredCount}
            </span>
            <span className="text-xs font-medium text-slate-500">
              أسئلة متروكة
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs text-right">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-[#0F172A] dark:text-white block" dir="ltr">
              {minutesSpent}m {secondsSpent}s
            </span>
            <span className="text-xs font-medium text-slate-500">
              الوقت المستغرق
            </span>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
            <span>مراجعة تفصيلية لجميع الأسئلة والتفسيرات</span>
          </h2>

          <div className="space-y-4">
            {attempt.answers.map((ans, idx) => {
              const q = ans.question;
              const isCorrect = ans.isCorrect;
              const selectedOption = q.options.find(
                (o) => o.id === ans.selectedOptionId
              );
              const correctOption = q.options.find((o) => o.isCorrect);
              const relatedLesson = q.lessons[0]?.lesson;

              return (
                <div
                  key={ans.id}
                  className={`p-5 sm:p-6 rounded-2xl border shadow-2xs space-y-4 ${
                    isCorrect
                      ? "bg-white dark:bg-[#131B2E] border-slate-200 dark:border-slate-800"
                      : "bg-white dark:bg-[#131B2E] border-red-200 dark:border-red-900/40"
                  }`}
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#4F46E5] dark:text-indigo-400">
                        السؤال {idx + 1}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isCorrect
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>إجابة صحيحة</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>إجابة غير صحيحة</span>
                          </>
                        )}
                      </span>
                    </div>

                    {relatedLesson && (
                      <Link
                        href={`/lessons/${relatedLesson.id}`}
                        className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>مراجعة الدرس: <BidiStatement as="span" text={relatedLesson.title} /></span>
                        <ArrowLeft className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {/* Statement */}
                  <BidiStatement
                    as="h3"
                    text={q.statement}
                    className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed"
                  />

                  {/* MCQ Options comparison */}
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isUserChoice = opt.id === ans.selectedOptionId;
                      let rowStyle =
                        "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-slate-200";

                      if (opt.isCorrect) {
                        rowStyle =
                          "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-bold";
                      } else if (isUserChoice && !opt.isCorrect) {
                        rowStyle =
                          "bg-red-50 dark:bg-red-950/40 border-red-500/50 text-red-800 dark:text-red-300 font-bold";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 ${rowStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                              {opt.order}
                            </span>
                            <BidiStatement as="span" text={opt.text} />
                          </div>

                          <div>
                            {opt.isCorrect && (
                              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>الإجابة الصحيحة</span>
                              </span>
                            )}
                            {isUserChoice && !opt.isCorrect && (
                              <span className="text-rose-600 dark:text-rose-400 text-xs font-bold inline-flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>اختيارك</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation card */}
                  {q.explanation && (
                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-[#4F46E5]/20 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] dark:text-indigo-400">
                        <Lightbulb className="w-4 h-4" />
                        <span>
                          المفهوم المرتبط: {q.explanation.concept}
                        </span>
                      </div>
                      <p className="text-xs text-[#0F172A] dark:text-slate-200 leading-relaxed font-medium">
                        {q.explanation.correctReason}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
