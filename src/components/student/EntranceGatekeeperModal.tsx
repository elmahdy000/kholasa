"use client";

import { useState, useEffect, useRef } from "react";
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Trophy,
  Loader2,
  Lock,
  Unlock,
  Lightbulb,
  Check,
  X,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface Option {
  id: string;
  text: string;
  order: number;
}

interface QuestionItem {
  id: string;
  statement: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: string;
  subjectName: string;
  unitTitle?: string | null;
  options: Option[];
}

interface ReviewedQuestion {
  id: string;
  statement: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: string;
  subjectName: string;
  unitTitle?: string | null;
  isCorrect: boolean | null;
  selectedAnswer: string;
  correctAnswer: string;
  concept?: string | null;
  correctReason?: string | null;
  modelAnswer?: string | null;
}

interface ExamResult {
  score: number;
  totalQuestions: number;
  totalObjective?: number;
  percentage: number;
  wrongCount: number;
  reviewedQuestions: ReviewedQuestion[];
}

interface EntranceGatekeeperModalProps {
  userRole?: string;
  userId?: string;
}

export function EntranceGatekeeperModal({
  userRole = "STUDENT",
  userId,
}: EntranceGatekeeperModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Student Answers Map: questionId -> { selectedOptionId, essayText }
  const [answers, setAnswers] = useState<
    Record<string, { selectedOptionId?: string; essayText?: string }>
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const fetchQuestions = async (manual = false) => {
    if (manual) setIsLoading(true);
    try {
      const res = await fetch("/api/student/daily-checkin");
      if (res.ok) {
        const data = await res.json();
        if (data.completed) {
          // Already submitted today (server-verified). The initial mount stays
          // silent; the dashboard button can still open a completion notice.
          setQuestions(Array.isArray(data.questions) ? data.questions : []);
          setAlreadyCompleted(manual);
          setIsOpen(manual);
        } else if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setAlreadyCompleted(false);
          setIsOpen(true);
        } else {
          // No questions available, do not block student
          setIsOpen(false);
        }
      } else {
        setIsOpen(false);
      }
    } catch {
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Ask the server whether today's challenge is still pending.
  useEffect(() => {
    // If user is admin or teacher, do not force gatekeeper exam
    if (userRole && userRole !== "STUDENT") {
      return;
    }

    const timer = setTimeout(() => {
      fetchQuestions();
    }, 0);
    return () => clearTimeout(timer);
  }, [userRole, userId]);

  // Support voluntarily opening the exam from dashboard
  useEffect(() => {
    const handleReopen = () => {
      setExamResult(null);
      setCurrentStep(0);
      setAnswers({});
      setTimeSpent(0);
      setSubmitError(null);
      setAlreadyCompleted(false);
      fetchQuestions(true);
    };
    window.addEventListener("kholasa_open_entrance_exam", handleReopen);
    return () => window.removeEventListener("kholasa_open_entrance_exam", handleReopen);
  }, []);

  // Keep the gated dialog focused and prevent the page behind it from scrolling.
  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, alreadyCompleted, examResult]);

  // Timer for time spent
  useEffect(() => {
    if (!isOpen || examResult) return;
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, examResult]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: optionId,
      },
    }));
  };

  const handleEssayChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        essayText: text,
      },
    }));
  };

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payloadAnswers = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id]?.selectedOptionId,
        essayText: answers[q.id]?.essayText,
      }));

      const res = await fetch("/api/student/daily-checkin/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: payloadAnswers,
          timeSpentSeconds: timeSpent,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "فشل تسليم الاختبار");
      }

      setExamResult(data as ExamResult);
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : "حدث خطأ أثناء تصحيح الاختبار، يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlockAndEnter = () => {
    setIsOpen(false);
    setAlreadyCompleted(false);
    setSubmitError(null);
  };

  if (!isOpen || isLoading) {
    return null;
  }

  if (alreadyCompleted) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-300">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="daily-gate-complete-title"
          tabIndex={-1}
          className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-sm overflow-hidden flex flex-col text-right focus:outline-none"
        >
          <div className="p-5 sm:p-6 bg-[#0F172A] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#059669]/10 text-[#34D399] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#34D399]">
                  بوابة الدخول اليومية
                </span>
                <h2
                  id="daily-gate-complete-title"
                  className="text-lg font-bold text-[#F8FAFC]"
                >
                  أنجزت تحدي اليوم
                </h2>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
              لقد أكملت تحدي الدخول اليومي بنجاح، وتم فتح المنصة لك لهذا اليوم.
            </p>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              يمكنك الآن متابعة المذاكرة والدروس من حيث توقفت، وسيتجدد التحدي غداً.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#1E293B] border-t border-[#E2E8F0] dark:border-[#334155]">
            <button
              type="button"
              onClick={handleUnlockAndEnter}
              className="w-full h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors active:opacity-80"
            >
              <Unlock className="w-4 h-4" />
              <span>العودة للمنصة</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentStep];
  if (!currentQ) {
    return null;
  }
  const isLastQuestion = currentStep === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const objectiveTotal = examResult
    ? examResult.totalObjective ?? examResult.totalQuestions
    : 0;
  const objectiveLabel =
    objectiveTotal === 1 ? "سؤال موضوعي واحد" : `${objectiveTotal} أسئلة موضوعية`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-300">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-gate-title"
        aria-describedby="daily-gate-desc"
        tabIndex={-1}
        className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0]/90 dark:border-[#334155] shadow-sm overflow-hidden flex flex-col text-right focus:outline-none"
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-[#0F172A] text-white space-y-3 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center ">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[13px] font-bold uppercase tracking-wider text-[#FBBF24]">
                  بوابة الدخول اليومية
                </span>
                <h2
                  id="daily-gate-title"
                  className="text-base sm:text-lg font-bold text-[#F8FAFC] flex items-center gap-2"
                >
                  <span>تحدي الدخول اليومي للمنصة</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-[#1E293B] text-[13px] font-bold text-[#F8FAFC] flex items-center gap-2 border border-[#334155]">
                <Lock className="w-3.5 h-3.5 text-[#D97706]" />
                <span>أجب لتفتح المنصة</span>
              </div>
            </div>
          </div>

          <p id="daily-gate-desc" className="text-[13px] text-[#94A3B8] leading-relaxed">
            اختبار قصير ينشط ذاكرتك بأهم الأفكار المتنوعة، ويتيح لك المنصة
            فور الانتهاء مع تحليل كامل لأخطائك.
          </p>

          {/* Stepper Progress Bar (Only during exam phase) */}
          {!examResult && (
            <div className="pt-2 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] font-bold text-[#F8FAFC]">
                <span>
                  السؤال {currentStep + 1} من {questions.length}
                </span>
                <span className="text-[#94A3B8]">
                  تمت إجابة {answeredCount} من {questions.length}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#334155] overflow-hidden">
                <div
                  className="h-full bg-[#800020] rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 flex-1 overflow-y-auto max-h-[65vh]">
          {submitError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] dark:text-[#F87171] text-[13px] font-bold flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}
          {/* Phase 1: Taking Exam */}
          {!examResult ? (
            <div className="space-y-5">
              {/* Question Category & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] text-[13px] font-bold">
                    {currentQ.subjectName}
                  </span>
                  {currentQ.unitTitle && (
                    <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] text-[13px] font-bold">
                      {currentQ.unitTitle}
                    </span>
                  )}
                </div>

                <span className="text-[13px] font-bold px-2 py-1 rounded-md bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706]">
                  {currentQ.type === "MCQ"
                    ? "اختيار من متعدد"
                    : currentQ.type === "TRUE_FALSE"
                    ? "صح أو خطأ"
                    : "سؤال مقالي"}
                </span>
              </div>

              {/* Statement */}
              <div className="py-1">
                <BidiStatement
                  as="h3"
                  text={currentQ.statement}
                  className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed"
                />
              </div>

              {/* Options Section */}
              {/* MCQ Options */}
              {currentQ.type === "MCQ" && (
                <div className="space-y-3 pt-1">
                  {currentQ.options.map((opt, oIdx) => {
                    const isSelected =
                      answers[currentQ.id]?.selectedOptionId === opt.id;
                    const letters = ["أ", "ب", "ج", "د", "هـ"];

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                        className={`w-full p-3 sm:p-4 rounded-xl border text-right transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-[#800020]/10 dark:bg-[#1E293B] border-[#800020] text-[#0F172A] dark:text-white "
                            : "bg-[#F8FAFC] dark:bg-[#1E293B]/60 hover:bg-[#F8FAFC] dark:hover:bg-[#334155] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg text-[13px] font-bold flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-[#800020] text-white"
                                : "bg-[#E2E8F0] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8]"
                            }`}
                          >
                            {letters[oIdx] || oIdx + 1}
                          </span>
                          <BidiStatement
                            as="span"
                            text={opt.text}
                            className="text-[13px] sm:text-sm font-bold"
                          />
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-[#800020] bg-[#800020] text-white"
                              : "border-[#E2E8F0] dark:border-[#334155] text-transparent"
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TRUE_FALSE Options */}
              {currentQ.type === "TRUE_FALSE" && (
                <div className="space-y-3 pt-2">
                  <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block font-bold">
                    حدد صحة العبارة:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {currentQ.options.map((opt) => {
                      const isSelected =
                        answers[currentQ.id]?.selectedOptionId === opt.id;
                      const isTrue =
                        opt.text.includes("صح") || opt.text.includes("صواب");

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleSelectOption(currentQ.id, opt.id)}
                          className={`p-4 rounded-xl border text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                            isSelected
                              ? isTrue
                                ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                                : "bg-[#DC2626] text-white border-[#DC2626] shadow-sm"
                              : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0]"
                          }`}
                        >
                          {isTrue ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ESSAY Input */}
              {currentQ.type === "ESSAY" && (
                <div className="space-y-2 pt-1">
                  <label className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block font-bold">
                    اكتب إجابتك أو الفكرة الرئيسية باختصار:
                  </label>
                  <textarea
                    rows={4}
                    value={answers[currentQ.id]?.essayText || ""}
                    onChange={(e) =>
                      handleEssayChange(currentQ.id, e.target.value)
                    }
                    placeholder="اكتب هنا ما تتذكره من مفاهيم أو تعليلات... وسنعرض لك نموذج الإجابة والمفهوم لمقارنته فور التسليم."
                    className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020] leading-relaxed"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Phase 2: Detailed Results & Mistakes Breakdown ("وكمان عاوز الطالب يعرف غلطاته") */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Score Header Card */}
              <div
                className={`p-6 rounded-xl text-center space-y-3 border ${
                  examResult.percentage >= 70
                    ? "bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399]/60"
                    : "bg-[#D97706]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#FBBF24]/60"
                }`}
              >
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-[#1E293B] shadow-sm flex items-center justify-center mx-auto text-[#059669]">
                  {examResult.percentage === 100 ? (
                    <Trophy className="w-11 h-11 text-[#D97706]" />
                  ) : examResult.percentage >= 70 ? (
                    <CheckCircle2 className="w-11 h-11 text-[#059669]" />
                  ) : (
                    <AlertCircle className="w-11 h-11 text-[#D97706]" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
                    {examResult.percentage === 100
                      ? "أداء ممتاز! أجبت على كل الأسئلة الموضوعية بشكل صحيح"
                      : examResult.percentage >= 70
                      ? "أداء متميز! أحسنت الاستذكار"
                      : "محاولة جيدة! راجع أخطاءك الآن لترسخ في ذهنك"}
                  </h3>
                  <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                    {objectiveTotal > 0
                      ? `نتيجتك: ${examResult.score} من أصل ${objectiveLabel} (${examResult.percentage}%)`
                      : "تم تسليم إجاباتك المقالية، راجع النموذج أدناه."}
                  </p>
                </div>

                {examResult.wrongCount > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171] text-[13px] font-bold">
                    <span>
                      عدد الأسئلة التي تحتاج مراجعة: {examResult.wrongCount} — تم حفظها
                      في ركن «غلطاتي»
                    </span>
                  </div>
                )}
              </div>

              {/* Questions Breakdown List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-2">
                  <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#800020]" />
                    <span>تفاصيل إجاباتك وتحليل كل سؤال:</span>
                  </h4>
                  <span className="text-[13px] text-[#94A3B8] font-bold">
                    {examResult.reviewedQuestions.length} أسئلة
                  </span>
                </div>

                {examResult.reviewedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      q.isCorrect === true
                        ? "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155]"
                        : q.isCorrect === false
                        ? "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#F87171]/60"
                        : "bg-[#D97706]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#FBBF24]/60"
                    }`}
                  >
                    {/* Question Header & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#94A3B8]">
                          #{idx + 1}
                        </span>
                        <span className="text-[13px] font-bold text-[#64748B]">
                          {q.subjectName}
                        </span>
                      </div>

                      {q.isCorrect === true ? (
                        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#34D399]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>إجابة صحيحة</span>
                        </span>
                      ) : q.isCorrect === false ? (
                        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] bg-[#DC2626]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#F87171]">
                          <XCircle className="w-3 h-3" />
                          <span>إجابة خاطئة</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#D97706] dark:text-[#FBBF24] bg-[#D97706]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#FBBF24]">
                          <AlertCircle className="w-3 h-3" />
                          <span>سؤال مقالي — راجع النموذج</span>
                        </span>
                      )}
                    </div>

                    {/* Statement */}
                    <BidiStatement
                      as="p"
                      text={q.statement}
                      className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white leading-relaxed"
                    />

                    {/* Answers Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] pt-1">
                      {/* What Student Answered */}
                      <div
                        className={`p-3 rounded-xl border ${
                          q.isCorrect === true
                            ? "bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399] text-[#059669] dark:text-[#34D399]"
                            : q.isCorrect === false
                            ? "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#F87171] text-[#DC2626] dark:text-[#F87171]"
                            : "bg-[#D97706]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#FBBF24] text-[#D97706] dark:text-[#FBBF24]"
                        }`}
                      >
                        <span className="text-[13px] font-bold block text-[#94A3B8] mb-1">
                          إجابتك:
                        </span>
                        <span className="font-bold">{q.selectedAnswer}</span>
                      </div>

                      {/* Correct Answer */}
                      <div className="p-3 rounded-xl border bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399] text-[#059669] dark:text-[#34D399]">
                        <span className="text-[13px] font-bold block text-[#059669] dark:text-[#34D399] mb-1">
                          الإجابة النموذجية الصحيحة:
                        </span>
                        <span className="font-bold">{q.correctAnswer}</span>
                      </div>
                    </div>

                    {/* Concept & Educational Explanation */}
                    {(q.concept || q.correctReason) && (
                      <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/80 border border-[#E2E8F0]/80 dark:border-[#334155] space-y-1 text-[13px]">
                        <div className="flex items-center gap-2 text-[#800020] font-bold text-[13px]">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>التفسير التعليمي والمفهوم:</span>
                        </div>
                        {q.concept && (
                          <div className="text-[#64748B] dark:text-[#F8FAFC]">
                            <span className="font-bold">المفهوم: </span>
                            {q.concept}
                          </div>
                        )}
                        {q.correctReason && (
                          <p className="text-[#64748B] dark:text-[#94A3B8] leading-relaxed text-[13px]">
                            {q.correctReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#1E293B] border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3">
          {!examResult ? (
            <>
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#334155] disabled:opacity-30 transition-all flex items-center gap-2"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>

              {/* Next or Submit Button */}
              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep((prev) =>
                      Math.min(questions.length - 1, prev + 1)
                    )
                  }
                  className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold shadow-sm flex items-center gap-2 transition-all"
                >
                  <span>السؤال التالي</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-[13px] font-bold flex items-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التصحيح والتحليل...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تسليم الاختبار ومعرفة النتيجة</span>
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            /* Button after viewing mistakes: Unlocks platform and enters */
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                تم فتح المنصة لك لهذا اليوم
              </span>
              <button
                type="button"
                onClick={handleUnlockAndEnter}
                className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors active:opacity-80"
              >
                <Unlock className="w-4 h-4" />
                <span>دخول المنصة الآن والمتابعة للمذاكرة</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
