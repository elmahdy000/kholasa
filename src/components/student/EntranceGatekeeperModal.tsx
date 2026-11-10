"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  X,
  Flame,
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
  const pathname = usePathname();
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

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem("kholasa_daily_dismissed", "true");
    } catch {
      // Ignore sessionStorage errors
    }
  };

  const fetchQuestions = async (manual = false) => {
    // If auto-opening, only suggest on the main dashboard and only if not dismissed in this session
    if (!manual) {
      const isDashboard = pathname === "/dashboard" || pathname === "/";
      if (!isDashboard) {
        setIsLoading(false);
        return;
      }
      try {
        if (sessionStorage.getItem("kholasa_daily_dismissed") === "true") {
          setIsLoading(false);
          return;
        }
      } catch {
        // Continue if sessionStorage is restricted
      }
    }

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
    }, 150);
    return () => clearTimeout(timer);
  }, [userRole, userId, pathname]);

  // Listen to custom manual trigger (e.g. clicking Daily Challenge or Streak extra challenge on dashboard)
  useEffect(() => {
    const handleOpen = () => {
      fetchQuestions(true);
    };
    window.addEventListener("kholasa:open-daily-gate", handleOpen);
    window.addEventListener("kholasa_open_entrance_exam", handleOpen);
    return () => {
      window.removeEventListener("kholasa:open-daily-gate", handleOpen);
      window.removeEventListener("kholasa_open_entrance_exam", handleOpen);
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
      if (e.key === "Escape") {
        handleDismiss();
        return;
      }

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
      window.dispatchEvent(
        new CustomEvent("kholasa_streak_updated", {
          detail: {
            streakDays: typeof data.streakDays === "number" ? data.streakDays : undefined,
            isTodayCompleted: true,
          },
        })
      );
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
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-200"
        onClick={handleDismiss}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="daily-gate-completed-title"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E2E8F0]/90 dark:border-[#334155] shadow-2xl p-6 text-right space-y-4 focus:outline-none animate-in zoom-in-95 duration-200 relative"
        >
          <button
            type="button"
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white flex items-center justify-center absolute left-4 top-4 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="text-center space-y-1.5">
            <h2
              id="daily-gate-completed-title"
              className="text-lg font-black text-[#0F172A] dark:text-white"
            >
              أتممت تحدي اليوم بنجاح! 🔥
            </h2>
            <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              سجلت حضورك اليوم بالفعل وحافظت على سلسلة التحدي الخاصة بك. استمر في المذاكرة وتفوق دائماً!
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full h-11 rounded-2xl bg-[#800B34] hover:bg-[#680829] text-white text-[13px] font-bold transition-colors cursor-pointer shadow-sm"
          >
            متابعة للمذاكرة 🚀
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-gate-title"
        aria-describedby="daily-gate-desc"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E2E8F0]/90 dark:border-[#334155] shadow-2xl overflow-hidden flex flex-col text-right focus:outline-none animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header - Encouraging & Friendly Companion Style */}
        <div className="p-5 sm:p-6 bg-[#0F172A] text-white space-y-3 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <span>الزتونة اليومية السريعة ⚡</span>
                </span>
                <h2
                  id="daily-gate-title"
                  className="text-base sm:text-lg font-black text-[#F8FAFC] flex items-center gap-2"
                >
                  <span>تحدي تنشيط الذاكرة اليومي</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white/10 text-[11px] sm:text-xs font-bold text-amber-300 flex items-center gap-1.5 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>دقيقة واحدة · أسئلة خفيفة</span>
              </div>
              {/* Close Button: Freedom to skip anytime */}
              <button
                type="button"
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="إغلاق التحدي والحل لاحقاً"
                title="تخطي والحل لاحقاً"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p id="daily-gate-desc" className="text-xs sm:text-[13px] text-[#94A3B8] leading-relaxed">
            3 أسئلة خفيفة وسريعة لتثبيت أهم الأفكار وتنشيط ذاكرتك، وحفظ الـ Streak اليومي بتاعك 🔥 (تقدر تحلهم في دقيقة أو تأجلهم براحتك).
          </p>

          {/* Stepper Progress Bar (Only during exam phase) */}
          {!examResult && (
            <div className="pt-2 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#F8FAFC]">
                <span>
                  السؤال {currentStep + 1} من {questions.length}
                </span>
                <span className="text-[#94A3B8]">
                  تمت إجابة {answeredCount} من {questions.length}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#334155] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#800B34] rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 flex-1 overflow-y-auto max-h-[60vh]">
          {submitError && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] dark:text-[#F87171] text-xs font-bold flex items-start gap-2"
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
        <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#1E293B] border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-2.5">
          {!examResult ? (
            <>
              {/* Skip for now / Dismiss button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="h-10 px-3.5 rounded-xl text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#334155] transition-all flex items-center gap-1.5 cursor-pointer"
                title="تخطي الآن والمتابعة للمذاكرة"
              >
                <span>سأحل لاحقاً</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#64748B] dark:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#334155] disabled:opacity-30 transition-all flex items-center gap-1.5 cursor-pointer"
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
                    className="h-10 px-5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>السؤال التالي</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitExam}
                    disabled={isSubmitting}
                    className="h-10 px-5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تسليم ومعرفة النتيجة</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                عاش يا بطل! تم تسجيل حضورك اليوم بنجاح 🔥
              </span>
              <button
                type="button"
                onClick={handleUnlockAndEnter}
                className="w-full sm:w-auto h-10 px-6 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs sm:text-[13px] font-bold flex items-center justify-center gap-2 transition-colors active:opacity-80 shadow-sm cursor-pointer"
              >
                <span>متابعة للمذاكرة 🚀</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
