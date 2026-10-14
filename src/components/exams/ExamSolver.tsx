"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Flag,
  BookmarkSimple,
  CaretRight,
  CaretLeft,
  CheckCircle,
  WarningCircle,
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
  isCorrect: boolean;
  order: number;
  explanation?: string | null;
}

interface QuestionExplanation {
  id: string;
  concept: string;
  correctReason: string;
  sectionId?: string | null;
}

interface EssayRubric {
  modelAnswer: string;
  criteria: any;
  maxScore: number;
}

interface Question {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  options: QuestionOption[];
  explanation?: QuestionExplanation | null;
  rubric?: EssayRubric | null;
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleAutoSubmit = () => {
    alert("الوقت خلص! هنسلّم إجاباتك دلوقتي تلقائياً.");
    executeSubmit();
  };

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ?.id] || {};
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

  const handleRevealPractice = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        practiceRevealed: true,
      },
    }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
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
        alert(data.error || "حصلت مشكلة أثناء تسليم الامتحان، جرب تاني.");
      }
    } catch (err) {
      console.error(err);
      alert("مشكلة في الاتصال بالإنترنت أثناء التسليم، اتأكد من النت وجرب تاني.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#4F46E5] block">
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
            className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
              isUrgent
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 animate-pulse"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-white"
            }`}
          >
            <Clock className="w-4 h-4 text-[#4F46E5]" weight="bold" />
            <span dir="ltr">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="h-9.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
          >
            <PaperPlaneTilt className="w-3.5 h-3.5" weight="bold" />
            <span>تسليم الامتحان</span>
          </button>
        </div>
      </div>

      {/* Question Navigator Carousel / Dots */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {questions.map((q, idx) => {
            const hasAnswer =
              answers[q.id]?.selectedOptionId || answers[q.id]?.essayText;
            const flagged = flaggedQuestions[q.id];
            const isActive = idx === currentIndex;

            let dotStyle =
              "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300";
            if (isActive) {
              dotStyle =
                "bg-indigo-50/70 dark:bg-indigo-950/40 border-2 border-[#4F46E5] text-[#4F46E5] dark:text-indigo-300 font-bold shadow-2xs";
            } else if (flagged) {
              dotStyle =
                "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600 font-bold";
            } else if (hasAnswer) {
              dotStyle =
                "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-600 font-bold";
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl border text-xs font-mono flex items-center justify-center transition-all ${dotStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
          {/* Question Header & Badges */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-300 text-xs font-bold border border-indigo-200/50 dark:border-indigo-800/50">
                السؤال {currentIndex + 1} من {totalQuestions}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold border border-slate-200/50 dark:border-slate-700/50">
                {currentQ.difficulty === "EASY"
                  ? "سهل"
                  : currentQ.difficulty === "MEDIUM"
                  ? "متوسط"
                  : "صعب"}
              </span>
            </div>

            <button
              onClick={toggleFlag}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isFlagged
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-600"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#0F172A] dark:hover:text-white"
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

                let cardStyle =
                  "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-[#0F172A] dark:text-slate-100 hover:border-indigo-400 dark:hover:border-slate-500";

                if (isSelected) {
                  cardStyle =
                    "bg-indigo-50/70 dark:bg-indigo-950/50 border-2 border-[#4F46E5] dark:border-indigo-400 text-[#0F172A] dark:text-white shadow-2xs font-bold";
                }

                if (isRevealed) {
                  if (opt.isCorrect) {
                    cardStyle =
                      "bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold";
                  } else if (isSelected && !opt.isCorrect) {
                    cardStyle =
                      "bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-600 text-rose-900 dark:text-rose-200 font-bold";
                  }
                }

                const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-3.5 sm:p-4 rounded-xl border text-right text-xs sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 transition-colors ${cardStyle}`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 sm:mt-0 ${
                          isSelected
                            ? "bg-[#4F46E5] dark:bg-indigo-500 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/60"
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
                        {opt.isCorrect ? (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                            <Check className="w-4 h-4" weight="bold" />
                            <span>صح! برافو</span>
                          </span>
                        ) : isSelected ? (
                          <span className="text-rose-600 dark:text-rose-400 text-xs font-bold">
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
              <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400">
                اكتب إجابتك هنا بالتفصيل:
              </label>
              <textarea
                value={currentAnswer.essayText || ""}
                onChange={(e) => handleEssayChange(e.target.value)}
                placeholder="اكتب خطوات الحل وشرحك هنا بالتفصيل..."
                rows={5}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-[#0F172A] dark:text-white font-content shadow-2xs"
              />

              {initialMode === "PRACTICE" && currentAnswer.practiceRevealed && currentQ.rubric && (
                <div className="p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-3">
                  <h4 className="text-xs font-bold text-[#4F46E5] dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkle className="w-4 h-4" weight="fill" />
                    <span>نموذج الإجابة ومعايير التقييم</span>
                  </h4>
                  <p className="text-xs text-[#0F172A] dark:text-slate-200 leading-relaxed font-bold font-content">
                    {currentQ.rubric.modelAnswer}
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
                  disabled={!currentAnswer.selectedOptionId && !currentAnswer.essayText}
                  className="h-10 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-2xs active:scale-95 disabled:opacity-40"
                >
                  <Lightbulb className="w-4 h-4" weight="fill" />
                  <span>شوف إجابتك صح ولا غلط واعرف التفسير</span>
                </button>
              ) : (
                currentQ.explanation && (
                  <div className="p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#4F46E5] dark:text-indigo-300">
                      <Lightbulb className="w-4 h-4" weight="fill" />
                      <span>الفكرة الأساسية: {currentQ.explanation.concept}</span>
                    </div>
                    <p className="text-xs text-[#0F172A] dark:text-slate-200 leading-relaxed font-bold font-content">
                      {currentQ.explanation.correctReason}
                    </p>

                    {/* Per-option breakdown */}
                    <div className="pt-2 border-t border-indigo-200/40 dark:border-indigo-800/40 space-y-1.5">
                      <span className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 block">
                        ليه ده صح وده غلط؟
                      </span>
                      {currentQ.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-start gap-1.5 font-content"
                        >
                          <span className="font-bold shrink-0">
                            • <BidiStatement as="span" text={opt.text} />:
                          </span>
                          <span>
                            {opt.explanation ||
                              (opt.isCorrect
                                ? "ده الخيار الدقيق والمظبوط"
                                : "مش مظبوط في الحالة دي")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Question Navigation Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              disabled={currentIndex === 0}
              className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-2xs"
            >
              <CaretRight className="w-4 h-4" weight="bold" />
              <span>السؤال اللي قبله</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((idx) => idx + 1)}
                className="h-10 px-5 sm:px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
              >
                <span>السؤال اللي بعده</span>
                <CaretLeft className="w-4 h-4" weight="bold" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="h-10 px-5 sm:px-6 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
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
          <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-xl p-6 sm:p-8 space-y-5 text-right border border-[#E2E8F0] dark:border-slate-700">
            <div className="w-12 h-12 rounded-lg bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" weight="fill" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                متأكد إنك خلصت وعاوز تسلّم؟
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-content">
                أول ما تسلّم هنحسب درجتك ونوريك تقرير مفصل بكل إجاباتك ونقط ضعفك.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-around text-center">
              <div>
                <span className="block text-base font-bold text-[#059669]">
                  {answeredCount}
                </span>
                <span className="text-[11px] font-bold text-[#64748B]">
                  حليتهم خلاص
                </span>
              </div>
              <div className="w-px h-8 bg-[#E2E8F0] dark:bg-slate-700" />
              <div>
                <span
                  className={`block text-base font-bold ${
                    unansweredCount > 0 ? "text-[#D97706]" : "text-[#64748B]"
                  }`}
                >
                  {unansweredCount}
                </span>
                <span className="text-[11px] font-bold text-[#64748B]">
                  لسه ما حلتهمش
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-lg bg-[#D97706]/10 border border-[#D97706]/20 text-xs font-bold text-[#D97706] flex items-center gap-2">
                <Warning className="w-4 h-4 shrink-0" weight="fill" />
                <span>خلّي بالك! لسه في أسئلة ما جاوبتهاش.</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={executeSubmit}
                className="flex-1 h-11 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
                className="flex-1 h-11 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white font-bold text-xs hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
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