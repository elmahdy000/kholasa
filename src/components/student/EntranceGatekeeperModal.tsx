"use client";

import { useState, useEffect, useRef } from "react";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
} from "lucide-react";
import {
  QuestionItem,
  ExamResult,
  EntranceGatekeeperModalProps,
} from "./gatekeeper/types";
import { GatekeeperExamPhase } from "./gatekeeper/GatekeeperExamPhase";
import { GatekeeperResultPhase } from "./gatekeeper/GatekeeperResultPhase";

export type {
  Option,
  QuestionItem,
  ReviewedQuestion,
  ExamResult,
  EntranceGatekeeperModalProps,
} from "./gatekeeper/types";

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
          setQuestions(Array.isArray(data.questions) ? data.questions : []);
          setAlreadyCompleted(manual);
          setIsOpen(manual);
        } else if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setAlreadyCompleted(false);
          setIsOpen(true);
        } else {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userRole === "STUDENT") {
        fetchQuestions(false);
      } else {
        setIsLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [userRole, userId]);

  useEffect(() => {
    const handleOpen = () => {
      fetchQuestions(true);
    };
    window.addEventListener("kholasa:open-daily-gate", handleOpen);
    return () => {
      window.removeEventListener("kholasa:open-daily-gate", handleOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen && !examResult) {
      const timer = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, examResult]);

  useEffect(() => {
    if (!isOpen) return;

    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, ans]) => ({
          questionId,
          selectedOptionId: ans.selectedOptionId || null,
          essayText: ans.essayText || null,
        })
      );

      const res = await fetch("/api/student/daily-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: formattedAnswers,
          timeSpentSeconds: timeSpent,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "تعذر إرسال الإجابات، يرجى المحاولة ثانية");
      }

      const data = await res.json();
      setExamResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "تعذر إرسال الإجابات، يرجى المحاولة ثانية";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlockAndEnter = () => {
    setIsOpen(false);
    window.location.reload();
  };

  if (!isOpen || isLoading) {
    return null;
  }

  if (alreadyCompleted) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-300">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="daily-gate-completed-title"
          tabIndex={-1}
          className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0]/90 dark:border-[#334155] shadow-sm p-6 text-right space-y-4 focus:outline-none"
        >
          <div className="w-12 h-12 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1">
            <h2
              id="daily-gate-completed-title"
              className="text-lg font-bold text-[#0F172A] dark:text-white"
            >
              أتممت تحدي اليوم بنجاح!
            </h2>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              سجلت حضورك اليوم بالفعل. يمكنك الاستمرار في تصفح دروسك،
              أو زيارة بنك الأسئلة والامتحانات متى شئت.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold transition-colors"
          >
            إغلاق ومتابعة المذاكرة
          </button>
        </div>
      </div>
    );
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-300">
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
              <div className="w-11 h-11 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center">
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

          {!examResult ? (
            <GatekeeperExamPhase
              currentQ={currentQ}
              answers={answers}
              onSelectOption={handleSelectOption}
              onEssayChange={handleEssayChange}
            />
          ) : (
            <GatekeeperResultPhase
              examResult={examResult}
              objectiveLabel={objectiveLabel}
              objectiveTotal={objectiveTotal}
            />
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
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                تم فتح المنصة لك لهذا اليوم
              </span>
              <button
                type="button"
                onClick={handleUnlockAndEnter}
                className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors active:opacity-80 shadow-sm"
              >
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
