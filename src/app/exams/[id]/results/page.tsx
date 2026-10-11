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
    color: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-500",
  };
  if (percentage < 50) {
    gradeBadge = {
      label: "بحاجة إلى مراجعة وتدريب",
      color: "from-red-500 to-rose-600",
      textColor: "text-red-500",
    };
  } else if (percentage < 75) {
    gradeBadge = {
      label: "جيد، يمكنك تحقيق الأفضل",
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-500",
    };
  } else if (percentage < 90) {
    gradeBadge = {
      label: "جيد جداً، أداء رائع",
      color: "from-indigo-500 to-blue-600",
      textColor: "text-indigo-500",
    };
  }

  return (
    <StudentShell user={user}>
      <div className="max-w-4xl mx-auto space-y-8 text-right font-sans pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
          <Link href="/exams" className="hover:text-[#6858EA] transition-colors">
            الامتحانات
          </Link>
          <span>/</span>
          <span>نتائج الاختبار</span>
          <span>/</span>
          <span className="text-[#14243D] dark:text-white">{attempt.title}</span>
        </div>

        {/* Hero Performance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${gradeBadge.color} text-white shadow-sm`}
            >
              {gradeBadge.label}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-[#14243D] dark:text-white">
              تقرير نتيجة: {attempt.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-lg">
              تم رصد إجاباتك بنجاح وتسجيل الأخطاء في مركز "غلطاتي" لتتمكن من مراجعتها وتصحيحها في أي وقت.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/mistakes"
                className="h-10 px-5 rounded-xl bg-[#6858EA] hover:bg-[#5444D8] text-white text-xs font-black flex items-center gap-2 shadow-md shadow-[#6858EA]/25 transition-transform active:scale-95"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>راجع أخطاءك في "غلطاتي"</span>
              </Link>

              <Link
                href={`/exams/${examId}`}
                className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-[#14243D] dark:text-white flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة الاختبار كاملاً</span>
              </Link>
            </div>
          </div>

          {/* Score Circular Badge */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 self-center md:self-auto">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div
                className={`text-4xl font-black ${gradeBadge.textColor}`}
              >
                {Math.round(percentage)}%
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs font-black text-[#14243D] dark:text-white block">
                {attempt.score} من {attempt.totalQuestions} درجات
              </span>
              <span className="text-[11px] text-slate-400 font-bold">
                الدرجة المستحقة
              </span>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 text-right">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-emerald-600 block">
              {correctAnswers.length}
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              إجابات صحيحة
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 text-right">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-red-600 block">
              {wrongAnswers.length}
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              إجابات خاطئة
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 text-right">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-amber-600 block">
              {unansweredCount}
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              أسئلة متروكة
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 text-right">
            <div className="w-8 h-8 rounded-xl bg-[#6858EA]/10 text-[#6858EA] flex items-center justify-center mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-[#14243D] dark:text-white block" dir="ltr">
              {minutesSpent}m {secondsSpent}s
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              الوقت المستغرق
            </span>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-[#14243D] dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#6858EA]" />
            <span>مراجعة تفصيلية لجميع الأسئلة والتفسيرات</span>
          </h2>

          <div className="space-y-5">
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
                  className={`p-6 sm:p-7 rounded-3xl border shadow-sm space-y-4 ${
                    isCorrect
                      ? "bg-white dark:bg-[#14243D]/50 border-emerald-200 dark:border-emerald-900/40"
                      : "bg-white dark:bg-[#14243D]/50 border-red-200 dark:border-red-900/40"
                  }`}
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#6858EA]">
                        السؤال {idx + 1}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
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
                        className="text-xs font-bold text-[#6858EA] hover:underline flex items-center gap-1"
                      >
                        <span>مراجعة الدرس: {relatedLesson.title}</span>
                        <ArrowLeft className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {/* Statement */}
                  <h3 className="text-sm sm:text-base font-black text-[#14243D] dark:text-white leading-relaxed">
                    {q.statement}
                  </h3>

                  {/* MCQ Options comparison */}
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isUserChoice = opt.id === ans.selectedOptionId;
                      let rowStyle =
                        "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#14243D] dark:text-slate-200";

                      if (opt.isCorrect) {
                        rowStyle =
                          "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-black";
                      } else if (isUserChoice && !opt.isCorrect) {
                        rowStyle =
                          "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-300 font-black";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-3 ${rowStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-black shrink-0">
                              {opt.order}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          <div>
                            {opt.isCorrect && (
                              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black">
                                ✅ الإجابة الصحيحة
                              </span>
                            )}
                            {isUserChoice && !opt.isCorrect && (
                              <span className="text-red-600 dark:text-red-400 text-xs font-black">
                                ❌ اختيارك
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation card */}
                  {q.explanation && (
                    <div className="p-4 rounded-2xl bg-[#6858EA]/5 border border-[#6858EA]/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#6858EA]">
                        <Lightbulb className="w-4 h-4" />
                        <span>
                          المفهوم المرتبط: {q.explanation.concept}
                        </span>
                      </div>
                      <p className="text-xs text-[#14243D] dark:text-slate-200 leading-relaxed font-bold">
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
