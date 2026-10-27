"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Flag,
  CaretRight,
  CaretLeft,
  CheckCircle,
  Question,
  Sparkle,
  Lightbulb,
  Check,
  PaperPlaneTilt,
  SpinnerGap,
  Warning,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface QuestionOption {
  id: string;
  text: string;
  order: number;
  explanation?: string | null;
}

interface QuestionExplanation {
  id: string;
  concept: string;
  correctReason: string;
  sectionId?: string | null;
}

interface RevealedOption {
  id: string;
  text?: string;
  isCorrect?: boolean;
  explanation?: string | null;
}

interface RevealedAnswer {
  isCorrect?: boolean;
  correctOptionId?: string;
  isEssay?: boolean;
  explanation?: QuestionExplanation | null;
  options?: RevealedOption[];
  modelAnswer?: string | null;
  criteria?: unknown;
  maxScore?: number;
}

interface Question {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  options: QuestionOption[];
}

interface ExamSolverProps {
  exam: {
    id: string;
    title: string;
    durationMinutes: number;
    isPractice: boolean;
    subject: {
      id: string;
      name: string;
    };
    questions: {
      order: number;
      question: Question;
    }[];
  };
  attemptId: string;
  initialMode: "PRACTICE" | "EXAM";
}

export function ExamSolver({
  exam,
  attemptId,
  initialMode,
}: ExamSolverProps) {
  const router = useRouter();
  const questions = exam.questions.map((q) => q.question);
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<
      string,
      {
        selectedOptionId?: string;
        essayText?: string;
        timeSpentSeconds?: number;
        practiceRevealed?: boolean;
      }
    >
  >({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    exam.durationMinutes * 60
  );
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, RevealedAnswer>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const executeSubmitRef = useRef<() => void>(() => {});

  const handleAutoSubmit = () => {
    executeSubmitRef.current();
  };

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTotalTimeSpent((prev) => prev + 1);
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ?.id] || {};
  const revealedAnswer = currentQ ? revealed[currentQ.id] : undefined;
  const isFlagged = flaggedQuestions[currentQ?.id] || false;

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedOptionId: optionId,
      },
    }));
  };

  const handleEssayChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        essayText: text,
      },
    }));
  };

  const handleRevealPractice = async () => {
    if (!currentQ) return;
    setIsRevealing(true);
    try {
      const res = await fetch(`/api/questions/${currentQ.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedOptionId: currentAnswer.selectedOptionId,
          essayText: currentAnswer.essayText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر عرض الإجابة");
      }

      setRevealed((prev) => ({ ...prev, [currentQ.id]: data }));
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          practiceRevealed: true,
        },
      }));
    } catch (err) {
      console.error(err);
      setPracticeError(
        err instanceof Error
          ? err.message
          : "تعذر عرض الإجابة، تأكد من الاتصال وجرب مرة أخرى."
      );
    } finally {
      setIsRevealing(false);
    }
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const executeSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/exams/${exam.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
          totalTimeSpentSeconds: totalTimeSpent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/exams/${exam.id}/results?attemptId=${attemptId}`);
      } else {
        setSubmitError(data.error || "حصلت مشكلة أثناء تسليم الامتحان، جرب تاني.");
        setShowConfirmModal(true);
      }
    } catch (err) {
      console.error(err);
      setSubmitError("مشكلة في الاتصال بالإنترنت أثناء التسليم، اتأكد من النت وجرب تاني.");
      setShowConfirmModal(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [exam.id, attemptId, answers, totalTimeSpent, router]);

  useEffect(() => {
    executeSubmitRef.current = executeSubmit;
  }, [executeSubmit]);

  // Stats for modal
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOptionId || (a.essayText && a.essayText.trim().length > 0)
  ).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Format timer MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgent = minutes < 2;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-right font-ui pb-12">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[13px] font-bold text-[#800020] block">
            {exam.subject.name} •{" "}
            {initialMode === "PRACTICE" ? "وضع التدريب (شرح فوري)" : "وضع الامتحان (وقت حقيقي)"}
          </span>
          <BidiStatement
            as="h1"
            text={exam.title}
            className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Timer Display */}
          <div
            className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-[13px] font-mono font-bold ${
              isUrgent
                ? "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#F87171] text-[#DC2626] animate-pulse"
                : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white"
            }`}
          >
            <Clock className="w-4 h-4 text-[#800020]" weight="bold" />
            <span dir="ltr">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="h-11 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-[13px] flex items-center gap-2 transition-all active:opacity-80 "
          >
            <PaperPlaneTilt className="w-3.5 h-3.5" weight="bold" />
            <span>تسليم الامتحان</span>
          </button>
        </div>
      </div>

      {/* Question Navigator Carousel / Dots */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {questions.map((q, idx) => {
            const hasAnswer =
              answers[q.id]?.selectedOptionId || answers[q.id]?.essayText;
            const flagged = flaggedQuestions[q.id];
            const isActive = idx === currentIndex;

            let dotStyle =
              "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:border-[#E2E8F0]";
            if (isActive) {
              dotStyle =
                "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] text-[#800020] dark:text-[#FB7185] font-bold ";
            } else if (flagged) {
              dotStyle =
                "bg-[#D97706]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#FBBF24] text-[#D97706] font-bold";
            } else if (hasAnswer) {
              dotStyle =
                "bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399] text-[#059669] font-bold";
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-11 h-11 rounded-xl border text-[13px] font-mono flex items-center justify-center transition-all ${dotStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-6">
          {/* Question Header & Badges */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#E11D48]/50">
                السؤال {currentIndex + 1} من {totalQuestions}
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#334155]/50">
                {currentQ.difficulty === "EASY"
                  ? "سهل"
                  : currentQ.difficulty === "MEDIUM"
                  ? "متوسط"
                  : "صعب"}
              </span>
            </div>

            <button
              onClick={toggleFlag}
              className={`px-3 py-2 rounded-lg border text-[13px] font-bold flex items-center gap-2 transition-colors ${
                isFlagged
                  ? "bg-[#D97706]/10 dark:bg-[#1E293B] border-[#E2E8F0] text-[#D97706]"
                  : "border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-current" : ""}`} weight={isFlagged ? "fill" : "bold"} />
              <span>{isFlagged ? "متعلّم للمراجعة" : "علّم عليه للمراجعة"}</span>
            </button>
          </div>

          {/* Statement */}
          <BidiStatement
            as="h2"
            text={currentQ.statement}
            className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white leading-relaxed font-content"
          />

          {/* MCQ / TRUE_FALSE Options */}
          {(currentQ.type === "MCQ" || currentQ.type === "TRUE_FALSE") && (
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = currentAnswer.selectedOptionId === opt.id;
                const isRevealed =
                  initialMode === "PRACTICE" && currentAnswer.practiceRevealed;
                const isOptionCorrect =
                  revealedAnswer?.options?.find((o) => o.id === opt.id)?.isCorrect === true;

                let cardStyle =
                  "bg-white dark:bg-[#1E293B]/80 border-[#E2E8F0] dark:border-[#334155]/80 text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#800020] dark:hover:border-[#64748B]";

                if (isSelected) {
                  cardStyle =
                    "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] dark:border-[#E11D48] text-[#0F172A] dark:text-white  font-bold";
                }

                if (isRevealed) {
                  if (isOptionCorrect) {
                    cardStyle =
                      "bg-[#059669]/10 dark:bg-[#1E293B] border-2 border-[#059669] text-[#059669] dark:text-[#34D399] font-bold";
                  } else if (isSelected && !isOptionCorrect) {
                    cardStyle =
                      "bg-[#DC2626]/10 dark:bg-[#1E293B] border-2 border-[#DC2626] text-[#DC2626] dark:text-[#F87171] font-bold";
                  }
                }

                const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-4 sm:p-4 rounded-xl border text-right text-[13px] sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 transition-colors ${cardStyle}`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-mono font-bold shrink-0 mt-1 sm:mt-0 ${
                          isSelected
                            ? "bg-[#800020] dark:bg-[#E11D48] text-white"
                            : "bg-[#F8FAFC] dark:bg-[#334155] text-[#64748B] dark:text-[#F8FAFC] border border-[#E2E8F0]/60 dark:border-[#334155]"
                        }`}
                      >
                        {arabicLetters[optIdx] || opt.order}
                      </div>
                      <div className="min-w-0 flex-1 leading-relaxed">
                        <BidiStatement as="span" text={opt.text} />
                      </div>
                    </div>

                    {isRevealed && (
                      <div className="shrink-0">
                        {isOptionCorrect ? (
                          <span className="text-[#059669] dark:text-[#34D399] text-[13px] font-bold flex items-center gap-1">
                            <Check className="w-4 h-4" weight="bold" />
                            <span>صح! برافو</span>
                          </span>
                        ) : isSelected ? (
                          <span className="text-[#DC2626] dark:text-[#F87171] text-[13px] font-bold">
                            مش صحيحة
                          </span>
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Essay Question Area */}
          {currentQ.type === "ESSAY" && (
            <div className="space-y-4">
              <label className="block text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                اكتب إجابتك هنا بالتفصيل:
              </label>
              <textarea
                value={currentAnswer.essayText || ""}
                onChange={(e) => handleEssayChange(e.target.value)}
                placeholder="اكتب خطوات الحل وشرحك هنا بالتفصيل..."
                rows={5}
                className="w-full p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#800020] text-[#0F172A] dark:text-white font-content "
              />

              {initialMode === "PRACTICE" && currentAnswer.practiceRevealed && revealedAnswer?.modelAnswer && (
                <div className="p-5 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/60 dark:border-[#E11D48]/60 space-y-3">
                  <h4 className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-2">
                    <Sparkle className="w-4 h-4" weight="fill" />
                    <span>نموذج الإجابة ومعايير التقييم</span>
                  </h4>
                  <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-bold font-content">
                    {revealedAnswer.modelAnswer}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Practice Mode: Reveal Button & In-depth Explanation */}
          {initialMode === "PRACTICE" && (
            <div>
              {!currentAnswer.practiceRevealed ? (
                <button
                  onClick={handleRevealPractice}
                  disabled={
                    isRevealing ||
                    (!currentAnswer.selectedOptionId && !currentAnswer.essayText)
                  }
                  className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white font-bold text-[13px] flex items-center gap-2 transition-all  active:opacity-80 disabled:opacity-40"
                >
                  <Lightbulb className="w-4 h-4" weight="fill" />
                  <span>
                    {isRevealing
                      ? "بنراجع إجابتك..."
                      : "شوف إجابتك صح ولا غلط واعرف التفسير"}
                  </span>
                </button>
              ) : (
                revealedAnswer?.explanation && (
                  <div className="p-5 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/60 dark:border-[#E11D48]/60 space-y-3">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#800020] dark:text-[#FB7185]">
                      <Lightbulb className="w-4 h-4" weight="fill" />
                      <span>الفكرة الأساسية: {revealedAnswer.explanation.concept}</span>
                    </div>
                    <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-bold font-content">
                      {revealedAnswer.explanation.correctReason}
                    </p>

                    {/* Per-option breakdown */}
                    <div className="pt-2 border-t border-[#E2E8F0]/40 dark:border-[#E11D48]/40 space-y-2">
                      <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                        ليه ده صح وده غلط؟
                      </span>
                      {currentQ.options.map((opt) => {
                        const revealedOpt = revealedAnswer.options?.find(
                          (o) => o.id === opt.id
                        );
                        return (
                          <div
                            key={opt.id}
                            className="text-[13px] text-[#64748B] dark:text-[#94A3B8] flex items-start gap-2 font-content"
                          >
                            <span className="font-bold shrink-0">
                              • <BidiStatement as="span" text={opt.text} />:
                            </span>
                            <span>
                              {revealedOpt?.explanation ||
                                (revealedOpt?.isCorrect
                                  ? "ده الخيار الدقيق والمظبوط"
                                  : "مش مظبوط في الحالة دي")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Question Navigation Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
            <button
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              disabled={currentIndex === 0}
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2 hover:bg-[#F8FAFC] dark:hover:bg-[#334155] disabled:opacity-40 transition-colors "
            >
              <CaretRight className="w-4 h-4" weight="bold" />
              <span>السؤال اللي قبله</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((idx) => idx + 1)}
                className="h-11 px-5 sm:px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-colors  active:opacity-80"
              >
                <span>السؤال اللي بعده</span>
                <CaretLeft className="w-4 h-4" weight="bold" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="h-11 px-5 sm:px-6 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-[13px] font-bold flex items-center gap-2 transition-colors  active:opacity-80"
              >
                <span>خلصت؟ سلّم الامتحان</span>
                <PaperPlaneTilt className="w-3.5 h-3.5" weight="bold" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-xl p-6 sm:p-8 space-y-5 text-right border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" weight="fill" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                متأكد إنك خلصت وعاوز تسلّم؟
              </h3>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-content">
                أول ما تسلّم هنحسب درجتك ونوريك تقرير مفصل بكل إجاباتك ونقط ضعفك.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-around text-center">
              <div>
                <span className="block text-base font-bold text-[#059669] dark:text-[#34D399]">
                  {answeredCount}
                </span>
                <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                  حليتهم خلاص
                </span>
              </div>
              <div className="w-px h-11 bg-[#E2E8F0] dark:bg-[#334155]" />
              <div>
                <span
                  className={`block text-base font-bold ${
                    unansweredCount > 0 ? "text-[#D97706] dark:text-[#FBBF24]" : "text-[#64748B] dark:text-[#94A3B8]"
                  }`}
                >
                  {unansweredCount}
                </span>
                <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                  لسه ما حلتهمش
                </span>
              </div>
            </div>

            {unansweredCount > 0 && !submitError && (
              <div className="p-3 rounded-lg bg-[#D97706]/10 border border-[#D97706]/20 text-[13px] font-bold text-[#D97706] flex items-center gap-2">
                <Warning className="w-4 h-4 shrink-0" weight="fill" />
                <span>خلّي بالك! لسه في أسئلة ما جاوبتهاش.</span>
              </div>
            )}

            {submitError && (
              <div className="p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/30 text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
                <Warning className="w-4 h-4 shrink-0" weight="fill" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={executeSubmit}
                className="flex-1 h-11 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <SpinnerGap className="w-4 h-4 animate-spin" weight="bold" />
                    <span>بنحسب درجاتك ثواني...</span>
                  </>
                ) : (
                  <span>أيوه، سلّم دلوقتي</span>
                )}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 h-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white font-bold text-[13px] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
              >
                لا، هرجع أكمل حل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}