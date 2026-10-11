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
    alert("انتهى وقت الامتحان! سيتم تسليم إجاباتك الآن تلقائياً.");
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
        alert(data.error || "تعذر تسليم الامتحان");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ في الاتصال بالخادم أثناء التسليم");
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
    <div className="max-w-4xl mx-auto space-y-6 text-right font-sans pb-12">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#6858EA] block">
            {exam.subject.name} •{" "}
            {initialMode === "PRACTICE" ? "وضع التدريب الفوري" : "وضع الامتحان الرسمي"}
          </span>
          <h1 className="text-base sm:text-lg font-black text-[#14243D] dark:text-white">
            {exam.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Timer Display */}
          <div
            className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-black ${
              isUrgent
                ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse"
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#14243D] dark:text-white"
            }`}
          >
            <Clock className="w-4 h-4" weight="bold" />
            <span dir="ltr">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#12A87E] to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <PaperPlaneTilt className="w-3.5 h-3.5" weight="bold" />
            <span>تسليم الامتحان</span>
          </button>
        </div>
      </div>

      {/* Question Navigator Carousel / Dots */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {questions.map((q, idx) => {
            const hasAnswer =
              answers[q.id]?.selectedOptionId || answers[q.id]?.essayText;
            const flagged = flaggedQuestions[q.id];
            const isActive = idx === currentIndex;

            let dotStyle =
              "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500";
            if (isActive) {
              dotStyle =
                "bg-[#6858EA] text-white border-[#6858EA] shadow-md shadow-[#6858EA]/25 scale-110 font-black";
            } else if (flagged) {
              dotStyle =
                "bg-amber-500/20 border-amber-500 text-amber-500 font-black";
            } else if (hasAnswer) {
              dotStyle =
                "bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold";
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl border text-xs flex items-center justify-center transition-all ${dotStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Question Header & Badges */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#6858EA]/10 text-[#6858EA] text-xs font-black">
                السؤال {currentIndex + 1} من {totalQuestions}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                {currentQ.difficulty === "EASY"
                  ? "سهل"
                  : currentQ.difficulty === "MEDIUM"
                  ? "متوسط"
                  : "صعب"}
              </span>
            </div>

            <button
              onClick={toggleFlag}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isFlagged
                  ? "bg-amber-500/10 border-amber-500 text-amber-500 font-black"
                  : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600"
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-current" : ""}`} weight={isFlagged ? "fill" : "bold"} />
              <span>{isFlagged ? "مميز للمراجعة" : "تمييز السؤال"}</span>
            </button>
          </div>

          {/* Statement */}
          <h2 className="text-base sm:text-lg font-black text-[#14243D] dark:text-white leading-relaxed">
            {currentQ.statement}
          </h2>

          {/* MCQ / TRUE_FALSE Options */}
          {(currentQ.type === "MCQ" || currentQ.type === "TRUE_FALSE") && (
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = currentAnswer.selectedOptionId === opt.id;
                const isRevealed =
                  initialMode === "PRACTICE" && currentAnswer.practiceRevealed;

                let cardStyle =
                  "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#14243D] dark:text-slate-200 hover:border-[#6858EA]/50";

                if (isSelected) {
                  cardStyle =
                    "bg-[#6858EA]/10 border-[#6858EA] text-[#6858EA] font-black shadow-xs";
                }

                if (isRevealed) {
                  if (opt.isCorrect) {
                    cardStyle =
                      "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-black";
                  } else if (isSelected && !opt.isCorrect) {
                    cardStyle =
                      "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-300 font-black";
                  }
                }

                const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-right text-xs sm:text-sm font-bold flex items-center justify-between gap-3 transition-all ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected
                            ? "bg-[#6858EA] text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {arabicLetters[optIdx] || opt.order}
                      </div>
                      <span>{opt.text}</span>
                    </div>

                    {isRevealed && (
                      <div>
                        {opt.isCorrect ? (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1">
                            <Check className="w-4 h-4" weight="bold" />
                            <span>الإجابة الصحيحة</span>
                          </span>
                        ) : isSelected ? (
                          <span className="text-red-600 dark:text-red-400 text-xs font-black">
                            إجابتك (غير صحيحة)
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
              <label className="block text-xs font-bold text-slate-500">
                اكتب إجابتك المقالية بالتفصيل:
              </label>
              <textarea
                value={currentAnswer.essayText || ""}
                onChange={(e) => handleEssayChange(e.target.value)}
                placeholder="ابدأ بكتابة خطوات الشرح والتعليل هنا..."
                rows={5}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6858EA] text-[#14243D] dark:text-white"
              />

              {initialMode === "PRACTICE" && currentAnswer.practiceRevealed && currentQ.rubric && (
                <div className="p-5 rounded-2xl bg-[#6858EA]/5 border border-[#6858EA]/20 space-y-3">
                  <h4 className="text-xs font-black text-[#6858EA] flex items-center gap-1.5">
                    <Sparkle className="w-4 h-4" weight="fill" />
                    <span>الإجابة النموذجية ومعايير التصحيح</span>
                  </h4>
                  <p className="text-xs text-[#14243D] dark:text-slate-200 leading-relaxed font-bold">
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
                  className="h-10 px-5 rounded-xl bg-[#6858EA] hover:bg-[#5444D8] text-white font-black text-xs flex items-center gap-2 transition-all disabled:opacity-40"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>تحقق من الإجابة وشاهد التفسير</span>
                </button>
              ) : (
                currentQ.explanation && (
                  <div className="p-5 rounded-2xl bg-[#6858EA]/10 border border-[#6858EA]/25 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 text-xs font-black text-[#6858EA]">
                      <Lightbulb className="w-4 h-4" weight="fill" />
                      <span>المفهوم الأساسي: {currentQ.explanation.concept}</span>
                    </div>
                    <p className="text-xs text-[#14243D] dark:text-slate-200 leading-relaxed font-bold">
                      {currentQ.explanation.correctReason}
                    </p>

                    {/* Per-option breakdown */}
                    <div className="pt-2 border-t border-[#6858EA]/20 space-y-1.5">
                      <span className="text-[11px] font-black text-slate-500 block">
                        تفسير خيارات السؤال:
                      </span>
                      {currentQ.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-start gap-1.5"
                        >
                          <span className="font-bold shrink-0">• {opt.text}:</span>
                          <span>
                            {opt.explanation ||
                              (opt.isCorrect
                                ? "هو الخيار الدقيق علمياً"
                                : "لا ينطبق على الحالة المطلوبة")}
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
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              disabled={currentIndex === 0}
              className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#14243D] dark:text-white flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <CaretRight className="w-4 h-4" weight="bold" />
              <span>السابق</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((idx) => idx + 1)}
                className="h-10 px-6 rounded-xl bg-[#6858EA] hover:bg-[#5444D8] text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-[#6858EA]/25"
              >
                <span>التالي</span>
                <CaretLeft className="w-4 h-4" weight="bold" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="h-10 px-6 rounded-xl bg-[#12A87E] hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-emerald-600/25"
              >
                <span>مراجعة وتسليم</span>
                <PaperPlaneTilt className="w-3.5 h-3.5" weight="bold" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#14243D] rounded-3xl p-6 sm:p-8 space-y-5 text-right shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-[#6858EA]/10 text-[#6858EA] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-[#14243D] dark:text-white">
                هل أنت مستعد لتسليم الامتحان؟
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                بمجرد التسليم، سيتم رصد الدرجة وتقديم تقرير تحليلي كامل بإجاباتك.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-around text-center">
              <div>
                <span className="block text-base font-black text-emerald-600">
                  {answeredCount}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  تمت الإجابة
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div>
                <span
                  className={`block text-base font-black ${
                    unansweredCount > 0 ? "text-amber-500" : "text-slate-400"
                  }`}
                >
                  {unansweredCount}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  متبقٍ بدون حل
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>لديك أسئلة لم تقم بالإجابة عليها بعد!</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={executeSubmit}
                className="flex-1 h-11 rounded-xl bg-[#12A87E] hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ رصد الدرجات...</span>
                  </>
                ) : (
                  <span>نعم، سلّم الآن</span>
                )}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-[#14243D] dark:text-white font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                العودة للأسئلة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
