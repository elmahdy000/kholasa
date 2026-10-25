import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import {
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

  // Find the attempt — must belong to the current user and to this exam
  const attempt = attemptId
    ? await prisma.examAttempt.findFirst({
        where: {
          id: attemptId,
          userId: user.id,
          examId,
          isCompleted: true,
        },
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
    label: "عاش يا بطل! مستوى فوق الممتاز",
    bgClass: "bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] border-[#E2E8F0] dark:border-[#34D399]",
    textColor: "text-[#059669] dark:text-[#34D399]",
  };
  if (percentage < 50) {
    gradeBadge = {
      label: "ولا يهمك، المهم نتعلم من الغلطات ونشد حيلنا",
      bgClass: "bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171] border-[#E2E8F0] dark:border-[#F87171]",
      textColor: "text-[#DC2626] dark:text-[#F87171]",
    };
  } else if (percentage < 75) {
    gradeBadge = {
      label: "شغل كويس، بس محتاجين نراجع كام نقطة",
      bgClass: "bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] border-[#E2E8F0] dark:border-[#FBBF24]",
      textColor: "text-[#D97706] dark:text-[#FBBF24]",
    };
  } else if (percentage < 90) {
    gradeBadge = {
      label: "أداء عالي جداً وفاضل تكة وتقفّل",
      bgClass: "bg-[#4F46E5]/10 dark:bg-[#1E293B] text-[#4F46E5] dark:text-[#6366F1] border-[#E2E8F0] dark:border-[#6366F1]",
      textColor: "text-[#4F46E5] dark:text-[#6366F1]",
    };
  }

  return (
    <StudentShell user={user}>
      <div className="max-w-4xl mx-auto space-y-6 text-right font-sans pb-28">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
          <Link href="/exams" className="hover:text-[#4F46E5] transition-colors">
            الامتحانات
          </Link>
          <span>/</span>
          <span>نتائج الاختبار</span>
          <span>/</span>
          <span className="text-[#0F172A] dark:text-white font-bold">{attempt.title}</span>
        </div>

        {/* Hero Performance Card */}
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-6 sm:p-8  flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <span
              className={`inline-block px-3 py-1 rounded-full text-[13px] font-bold border ${gradeBadge.bgClass}`}
            >
              {gradeBadge.label}
            </span>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
              تقرير نتيجة: <BidiStatement as="span" text={attempt.title} />
            </h1>

            <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-lg leading-relaxed">
              سجلنا إجاباتك كلها، والأسئلة اللي وقعت فيها اتحفظت في ركن "غلطاتي" عشان تراجعها وتثبتها وقت ما تحب.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/mistakes"
                className="h-11 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center gap-2  transition-colors interactive-tap"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                <span>راجع أخطاءك في "غلطاتي"</span>
              </Link>

              <Link
                href={`/exams/${examId}`}
                className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2 transition-colors interactive-tap"
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
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] shrink-0 self-center md:self-auto relative z-10 min-w-[140px]">
            <div className="relative flex items-center justify-center">
              <div
                className={`text-[28px] sm:text-4xl font-bold font-mono tracking-tight ${gradeBadge.textColor}`}
              >
                {Math.round(percentage)}%
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-[13px] font-bold font-mono text-[#0F172A] dark:text-white block">
                {attempt.score} / {attempt.totalQuestions}
              </span>
              <span className="text-[13px] text-[#94A3B8] font-medium">
                الدرجة المستحقة
              </span>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  text-right">
            <div className="w-11 h-11 rounded-lg bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-[#059669] dark:text-[#34D399] block">
              {correctAnswers.length}
            </span>
            <span className="text-[13px] font-medium text-[#64748B]">
              إجابات صح
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  text-right">
            <div className="w-11 h-11 rounded-lg bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171] flex items-center justify-center mb-2">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-[#DC2626] dark:text-[#F87171] block">
              {wrongAnswers.length}
            </span>
            <span className="text-[13px] font-medium text-[#64748B]">
              إجابات غلط
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  text-right">
            <div className="w-11 h-11 rounded-lg bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center mb-2">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-[#D97706] dark:text-[#FBBF24] block">
              {unansweredCount}
            </span>
            <span className="text-[13px] font-medium text-[#64748B]">
              سبتهم بدون حل
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  text-right">
            <div className="w-11 h-11 rounded-lg bg-[#4F46E5]/10 dark:bg-[#1E293B] text-[#4F46E5] dark:text-[#6366F1] flex items-center justify-center mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-[#0F172A] dark:text-white block" dir="ltr">
              {minutesSpent}m {secondsSpent}s
            </span>
            <span className="text-[13px] font-medium text-[#64748B]">
              الوقت اللي أخدته
            </span>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1]" />
            <span>مراجعة تفصيلية لجميع الأسئلة والتفسيرات</span>
          </h2>

          <div className="space-y-4">
            {attempt.answers.map((ans, idx) => {
              const q = ans.question;
              const isCorrect = ans.isCorrect;
              const relatedLesson = q.lessons[0]?.lesson;

              return (
                <div
                  key={ans.id}
                  className={`p-5 sm:p-6 rounded-xl border  space-y-4 bg-white dark:bg-[#0F172A] ${
                    q.type === "ESSAY"
                      ? "border-[#E2E8F0] dark:border-[#6366F1]/50"
                      : isCorrect
                      ? "border-[#E2E8F0] dark:border-[#334155]"
                      : "border-[#E2E8F0] dark:border-[#F87171]/40"
                  }`}
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-mono font-bold text-[#4F46E5] dark:text-[#6366F1]">
                        سؤال {idx + 1}
                      </span>
                      {q.type === "ESSAY" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-bold bg-[#4F46E5]/10 dark:bg-[#1E293B] text-[#4F46E5] dark:text-[#6366F1] border border-[#E2E8F0] dark:border-[#6366F1]">
                          <BookOpen className="w-3 h-3" />
                          <span>سؤال مقالي • قارن إجابتك بالنموذج المثالي</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-bold ${
                            isCorrect
                              ? "bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399]"
                              : "bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171]"
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
                        className="text-[13px] font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline flex items-center gap-1"
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
                      <div className="p-3 rounded-xl bg-[#4F46E5]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/60 dark:border-[#6366F1]/40 text-[13px] text-[#4F46E5] dark:text-[#6366F1] flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-[#4F46E5] dark:text-[#6366F1] shrink-0 mt-1" />
                        <span>الأسئلة المقالية لا يتم تقييمها آلياً؛ قارن إجابتك المكتوبة بنموذج الإجابة الرسمي من بنك الأسئلة أدناه لتحديد مدى تغطيتك للنقاط المطلوبة.</span>
                      </div>

                      <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/60 space-y-2">
                        <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                          إجابتك المسجلة:
                        </span>
                        <p className="text-[13px] sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-medium">
                          {ans.essayText?.trim() || <span className="text-[#94A3B8] italic">لم يتم إدخال إجابة مكتوبة لهذا السؤال</span>}
                        </p>
                      </div>

                      {q.rubric && (
                        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#34D399]/40 bg-[#059669]/10 dark:bg-[#1E293B] space-y-2">
                          <span className="text-[13px] font-bold text-[#059669] dark:text-[#34D399] block flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>نموذج الإجابة المثالي من بنك الأسئلة:</span>
                          </span>
                          <p className="text-[13px] sm:text-sm text-[#059669] dark:text-[#34D399] leading-relaxed font-medium whitespace-pre-line">
                            {q.rubric.modelAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {q.options.map((opt, oIdx) => {
                        const isUserChoice = opt.id === ans.selectedOptionId;
                        let rowStyle =
                          "bg-[#F8FAFC] dark:bg-[#1E293B]/50 border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]";

                        if (opt.isCorrect) {
                          rowStyle =
                            "bg-[#059669]/10 dark:bg-[#1E293B] border-[#059669]/50 text-[#059669] dark:text-[#34D399] font-bold";
                        } else if (isUserChoice && !opt.isCorrect) {
                          rowStyle =
                            "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#DC2626]/50 text-[#DC2626] dark:text-[#F87171] font-bold";
                        }

                        const letterLabel = ARABIC_LETTERS[oIdx] || opt.order;

                        return (
                          <div
                            key={opt.id}
                            className={`p-4 sm:p-4 rounded-xl border text-[13px] sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 ${rowStyle}`}
                          >
                            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                              <span className="w-6 h-6 rounded-lg bg-[#E2E8F0] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center text-[13px] font-bold shrink-0 mt-1 sm:mt-0 ">
                                {letterLabel}
                              </span>
                              <BidiStatement as="span" text={opt.text} className="min-w-0 flex-1 leading-relaxed" />
                            </div>

                            <div className="shrink-0">
                              {opt.isCorrect && (
                                <span className="text-[#059669] dark:text-[#34D399] text-[13px] font-bold inline-flex items-center gap-2 bg-[#059669]/10 dark:bg-[#1E293B] px-2 py-1 rounded-md">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>الإجابة الصح</span>
                                </span>
                              )}
                              {isUserChoice && !opt.isCorrect && (
                                <span className="text-[#DC2626] dark:text-[#F87171] text-[13px] font-bold inline-flex items-center gap-2 bg-[#DC2626]/10 dark:bg-[#1E293B] px-2 py-1 rounded-md">
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
                    <div className="p-4 rounded-xl bg-[#4F46E5]/10 dark:bg-[#1E293B] border border-[#4F46E5]/20 space-y-2">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#4F46E5] dark:text-[#6366F1]">
                        <Lightbulb className="w-4 h-4" />
                        <span>
                          الفكرة الأساسية: {q.explanation.concept}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-medium">
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
