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
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { ExamResultActions } from "@/components/exams/ExamResultActions";

const ARABIC_LETTERS = ["أ", "ب", "ج", "د", "هـ", "و"];

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

  const essayAnswers = attempt.answers.filter((a) => a.question.type === "ESSAY");
  const objectiveAnswers = attempt.answers.filter((a) => a.question.type !== "ESSAY");
  const correctAnswers = objectiveAnswers.filter((a) => a.isCorrect === true);
  const wrongAnswers = objectiveAnswers.filter((a) => a.isCorrect === false);
  const unansweredCount =
    attempt.totalQuestions - (correctAnswers.length + wrongAnswers.length + essayAnswers.length);

  const percentage = attempt.percentage;
  const minutesSpent = Math.floor(attempt.timeSpentSeconds / 60);
  const secondsSpent = attempt.timeSpentSeconds % 60;

  // Grade badge & label (Egyptian Friendly Tone)
  let gradeBadge = {
    label: "عاش يا بطل! مستوى فوق الممتاز 🚀",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-600 dark:text-emerald-400",
  };
  if (percentage < 50) {
    gradeBadge = {
      label: "ولا يهمك، المهم نتعلم من الغلطات ونشد حيلنا ✨",
      bgClass: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      textColor: "text-rose-600 dark:text-rose-400",
    };
  } else if (percentage < 75) {
    gradeBadge = {
      label: "شغل كويس، بس محتاجين نراجع كام نقطة 👍",
      bgClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      textColor: "text-amber-600 dark:text-amber-400",
    };
  } else if (percentage < 90) {
    gradeBadge = {
      label: "أداء عالي جداً وفاضل تكة وتقفّل 💪",
      bgClass: "bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      textColor: "text-[#4F46E5] dark:text-indigo-400",
    };
  }

  return (
    <StudentShell user={user}>
      <div className="max-w-4xl mx-auto space-y-6 text-right font-sans pb-28">
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
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${gradeBadge.bgClass}`}
            >
              {gradeBadge.label}
            </span>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
              تقرير نتيجة: <BidiStatement as="span" text={attempt.title} />
            </h1>

            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-lg leading-relaxed">
              سجلنا إجاباتك كلها، والأسئلة اللي وقعت فيها اتحفظت في ركن "غلطاتي" عشان تراجعها وتثبتها وقت ما تحب.
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
                className="h-9 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 transition-colors interactive-tap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>حل الامتحان ده تاني</span>
              </Link>

              <ExamResultActions
                examTitle={attempt.title}
                percentage={percentage}
                score={attempt.score}
                totalQuestions={attempt.totalQuestions}
              />
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 shrink-0 self-center md:self-auto relative z-10 min-w-[140px]">
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
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xs text-right">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
              {correctAnswers.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              إجابات صح
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xs text-right">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-2">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-red-600 dark:text-red-400 block">
              {wrongAnswers.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              إجابات غلط
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xs text-right">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 block">
              {unansweredCount}
            </span>
            <span className="text-xs font-medium text-slate-500">
              سبتهم بدون حل
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xs text-right">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-[#0F172A] dark:text-white block" dir="ltr">
              {minutesSpent}m {secondsSpent}s
            </span>
            <span className="text-xs font-medium text-slate-500">
              الوقت اللي أخدته
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
                  className={`p-5 sm:p-6 rounded-2xl border shadow-2xs space-y-4 bg-white dark:bg-zinc-950 ${
                    q.type === "ESSAY"
                      ? "border-indigo-200 dark:border-indigo-900/50"
                      : isCorrect
                      ? "border-slate-200 dark:border-zinc-800"
                      : "border-red-200 dark:border-red-900/40"
                  }`}
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#4F46E5] dark:text-indigo-400">
                        سؤال {idx + 1}
                      </span>
                      {q.type === "ESSAY" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          <BookOpen className="w-3 h-3" />
                          <span>سؤال مقالي • قارن إجابتك بالنموذج المثالي</span>
                        </span>
                      ) : (
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
                              <span>صح عليك! برافو</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>مش صحيحة</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {relatedLesson && (
                      <Link
                        href={`/lessons/${relatedLesson.id}`}
                        className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>شرح الدرس: <BidiStatement as="span" text={relatedLesson.title} /></span>
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

                  {/* Essay or MCQ Options comparison */}
                  {q.type === "ESSAY" ? (
                    <div className="space-y-3 pt-1">
                      {/* Notice banner */}
                      <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <span>الأسئلة المقالية لا يتم تقييمها آلياً؛ قارن إجابتك المكتوبة بنموذج الإجابة الرسمي من بنك الأسئلة أدناه لتحديد مدى تغطيتك للنقاط المطلوبة.</span>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 space-y-1.5">
                        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 block">
                          إجابتك المسجلة:
                        </span>
                        <p className="text-xs sm:text-sm text-[#0F172A] dark:text-zinc-100 leading-relaxed font-medium">
                          {ans.essayText?.trim() || <span className="text-slate-400 italic">لم يتم إدخال إجابة مكتوبة لهذا السؤال</span>}
                        </p>
                      </div>

                      {q.rubric && (
                        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>نموذج الإجابة المثالي من بنك الأسئلة:</span>
                          </span>
                          <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium whitespace-pre-line">
                            {q.rubric.modelAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {q.options.map((opt, oIdx) => {
                        const isUserChoice = opt.id === ans.selectedOptionId;
                        let rowStyle =
                          "bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 text-[#0F172A] dark:text-zinc-200";

                        if (opt.isCorrect) {
                          rowStyle =
                            "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-bold";
                        } else if (isUserChoice && !opt.isCorrect) {
                          rowStyle =
                            "bg-red-50 dark:bg-red-950/40 border-red-500/50 text-red-800 dark:text-red-300 font-bold";
                        }

                        const letterLabel = ARABIC_LETTERS[oIdx] || opt.order;

                        return (
                          <div
                            key={opt.id}
                            className={`p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 ${rowStyle}`}
                          >
                            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                              <span className="w-6 h-6 rounded-lg bg-slate-200/80 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                                {letterLabel}
                              </span>
                              <BidiStatement as="span" text={opt.text} className="min-w-0 flex-1 leading-relaxed" />
                            </div>

                            <div className="shrink-0">
                              {opt.isCorrect && (
                                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold inline-flex items-center gap-1.5 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>الإجابة الصح</span>
                                </span>
                              )}
                              {isUserChoice && !opt.isCorrect && (
                                <span className="text-rose-600 dark:text-rose-400 text-xs font-bold inline-flex items-center gap-1.5 bg-rose-100/60 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>إنت اخترت ده</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation card */}
                  {q.explanation && (
                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-[#4F46E5]/20 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] dark:text-indigo-400">
                        <Lightbulb className="w-4 h-4" />
                        <span>
                          الفكرة الأساسية: {q.explanation.concept}
                        </span>
                      </div>
                      <p className="text-xs text-[#0F172A] dark:text-zinc-200 leading-relaxed font-medium">
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
