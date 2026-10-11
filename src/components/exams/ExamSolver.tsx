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
    <div className="max-w-4xl mx-auto space-y-6 text-right font-ui pb-12">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#4F46E5] block">
            {exam.subject.name} •{" "}
            {initialMode === "PRACTICE" ? "وضع التدريب الفوري" : "وضع الامتحان الرسمي"}
          </span>
          <h1 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
            {exam.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Timer Display */}
          <div
            className={`px-3.5 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-bold ${
              isUrgent
                ? "bg-[#DC2626]/10 border-[#DC2626]/30 text-[#DC2626] animate-pulse"
                : "bg-[#F8FAFC] dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white"
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
            className="h-10 px-4 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <PaperPlaneTilt className="w-3.5 h-3.5" weight="bold" />
            <span>تسليم الامتحان</span>
          </button>
        </div>
      </div>

      {/* Question Navigator Carousel / Dots */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {questions.map((q, idx) => {
            const hasAnswer =
              answers[q.id]?.selectedOptionId || answers[q.id]?.essayText;
            const flagged = flaggedQuestions[q.id];
            const isActive = idx === currentIndex;

            let dotStyle =
              "bg-[#F8FAFC] dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 text-[#64748B]";
            if (isActive) {
              dotStyle =
                "bg-[#4F46E5] text-white border-[#4F46E5] font-bold";
            } else if (flagged) {
              dotStyle =
                "bg-[#D97706]/10 border-[#D97706] text-[#D97706] font-bold";
            } else if (hasAnswer) {
              dotStyle =
                "bg-[#059669]/10 border-[#059669]/40 text-[#059669] font-bold";
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-lg border text-xs flex items-center justify-center transition-colors ${dotStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 space-y-6">
          {/* Question Header & Badges */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-700 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-bold">
                السؤال {currentIndex + 1} من {totalQuestions}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#F8FAFC] dark:bg-slate-900 text-[#64748B] dark:text-slate-300 text-[11px] font-bold">
                {currentQ.difficulty === "EASY"
                  ? "سهل"
                  : currentQ.difficulty === "MEDIUM"
                  ? "متوسط"
                  : "صعب"}
              </span>
            </div>

            <button
              onClick={toggleFlag}
              className={`px-3 py-1.5 rounded-md border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isFlagged
                  ? "bg-[#D97706]/10 border-[#D97706] text-[#D97706]"
                  : "border-[#E2E8F0] dark:border-slate-700 text-[#64748B] hover:text-[#0F172A] dark:hover:text-slate-300"
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-current" : ""}`} weight={isFlagged ? "fill" : "bold"} />
              <span>{isFlagged ? "مميز للمراجعة" : "تمييز السؤال"}</span>
            </button>
          </div>

          {/* Statement */}
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white leading-relaxed font-content">
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
                  "bg-[#F8FAFC] dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-slate-200 hover:border-[#4F46E5]/50";

                if (isSelected) {
                  cardStyle =
                    "bg-[#4F46E5]/5 border-[#4F46E5] text-[#4F46E5] font-bold";
                }

                if (isRevealed) {
                  if (opt.isCorrect) {
                    cardStyle =
                      "bg-[#059669]/10 border-[#059669]/30 text-[#059669] font-bold";
                  } else if (isSelected && !opt.isCorrect) {
                    cardStyle =
                      "bg-[#DC2626]/10 border-[#DC2626]/30 text-[#DC2626] font-bold";
                  }
                }

                const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-4 rounded-lg border text-right text-xs sm:text-sm font-medium flex items-center justify-between gap-3 transition-colors font-content ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? "bg-[#4F46E5] text-white"
                            : "bg-[#E2E8F0] dark:bg-slate-800 text-[#64748B] dark:text-slate-300"
                        }`}
                      >
                        {arabicLetters[optIdx] || opt.order}
                      </div>
                      <span>{opt.text}</span>
                    </div>

                    {isRevealed && (
                      <div>
                        {opt.isCorrect ? (
                          <span className="text-[#059669] text-xs font-bold flex items-center gap-1">
                            <Check className="w-4 h-4" weight="bold" />
                            <span>الإجابة الصحيحة</span>
                          </span>
                        ) : isSelected ? (
                          <span className="text-[#DC2626] text-xs font-bold">
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
              <label className="block text-xs font-bold text-[#64748B]">
                اكتب إجابتك المقالية بالتفصيل:
              </label>
              <textarea
                value={currentAnswer.essayText || ""}
                onChange={(e) => handleEssayChange(e.target.value)}
                placeholder="ابدأ بكتابة خطوات الشرح والتعليل هنا..."
                rows={5}
                className="w-full p-4 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-[#0F172A] dark:text-white font-content"
              />

              {initialMode === "PRACTICE" && currentAnswer.practiceRevealed && currentQ.rubric && (
                <div className="p-5 rounded-lg bg-[#4F46E5]/5 border border-[#4F46E5]/20 space-y-3">
                  <h4 className="text-xs font-bold text-[#4F46E5] flex items-center gap-1.5">
                    <Sparkle className="w-4 h-4" weight="fill" />
                    <span>الإجابة النموذجية ومعايير التصحيح</span>
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
                  className="h-10 px-5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-40"
                >
                  <Lightbulb className="w-4 h-4" weight="fill" />
                  <span>تحقق من الإجابة وشاهد التفسير</span>
                </button>
              ) : (
                currentQ.explanation && (
                  <div className="p-5 rounded-lg bg-[#4F46E5]/5 border border-[#4F46E5]/20 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#4F46E5]">
                      <Lightbulb className="w-4 h-4" weight="fill" />
                      <span>المفهوم الأساسي: {currentQ.explanation.concept}</span>
                    </div>
                    <p className="text-xs text-[#0F172A] dark:text-slate-200 leading-relaxed font-bold font-content">
                      {currentQ.explanation.correctReason}
                    </p>

                    {/* Per-option breakdown */}
                    <div className="pt-2 border-t border-[#4F46E5]/15 space-y-1.5">
                      <span className="text-[11px] font-bold text-[#64748B] block">
                        تفسير خيارات السؤال:
                      </span>
                      {currentQ.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-start gap-1.5 font-content"
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
          <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] dark:border-slate-700">
            <button
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              disabled={currentIndex === 0}
              className="h-10 px-4 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <CaretRight className="w-4 h-4" weight="bold" />
              <span>السابق</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((idx) => idx + 1)}
                className="h-10 px-6 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>التالي</span>
                <CaretLeft className="w-4 h-4" weight="bold" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="h-10 px-6 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-xl p-6 sm:p-8 space-y-5 text-right border border-[#E2E8F0] dark:border-slate-700">
            <div className="w-12 h-12 rounded-lg bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" weight="fill" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                هل أنت مستعد لتسليم الامتحان؟
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-content">
                بمجرد التسليم، سيتم رصد الدرجة وتقديم تقرير تحليلي كامل بإجاباتك.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-around text-center">
              <div>
                <span className="block text-base font-bold text-[#059669]">
                  {answeredCount}
                </span>
                <span className="text-[11px] font-bold text-[#64748B]">
                  تمت الإجابة
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
                  متبقٍ بدون حل
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-lg bg-[#D97706]/10 border border-[#D97706]/20 text-xs font-bold text-[#D97706] flex items-center gap-2">
                <Warning className="w-4 h-4 shrink-0" weight="fill" />
                <span>لديك أسئلة لم تقم بالإجابة عليها بعد!</span>
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
                className="flex-1 h-11 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white font-bold text-xs hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
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