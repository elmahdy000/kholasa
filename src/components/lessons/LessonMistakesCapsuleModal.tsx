"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  CheckCircle,
  WarningCircle,
  ArrowClockwise,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Check,
  Translate,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { QuestionExplanationBox } from "@/components/ui/QuestionExplanationBox";
import { FormattedAnswerView } from "@/components/ui/FormattedAnswerView";
import { QuestionImageAttachment } from "@/components/ui/QuestionImageAttachment";
import { TranslationToggle } from "@/components/ui/TranslationToggle";
import type { LessonMistakeItem } from "./types";

interface LessonMistakesCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  unitTitle?: string;
  mistakes: LessonMistakeItem[];
  onMistakeResolved: (questionId: string) => void;
}

export function LessonMistakesCapsuleModal({
  isOpen,
  onClose,
  lessonTitle,
  unitTitle,
  mistakes: initialMistakes,
  onMistakeResolved,
}: LessonMistakesCapsuleModalProps) {
  const [activeMistakes, setActiveMistakes] = useState<LessonMistakeItem[]>(initialMistakes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);
  const [serverExplanation, setServerExplanation] = useState<{ concept?: string; correctReason?: string } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showEssayModel, setShowEssayModel] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Synchronize when modal opens or initialMistakes change
  useEffect(() => {
    if (isOpen) {
      setActiveMistakes(initialMistakes);
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setCorrectOptionId(null);
      setServerExplanation(null);
      setRevealed(false);
      setIsCorrect(false);
      setShowExplanation(false);
      setShowEssayModel(false);
      setShowTranslation(false);
      setResolvedIds(new Set());
      setFeedbackNotice(null);
    }
  }, [isOpen, initialMistakes]);

  // Current active question
  const currentItem = useMemo(() => {
    if (currentIndex >= 0 && currentIndex < activeMistakes.length) {
      return activeMistakes[currentIndex];
    }
    return null;
  }, [activeMistakes, currentIndex]);

  const currentQ = currentItem?.question;
  const totalCount = activeMistakes.length;
  const isCapsuleCompleted = totalCount > 0 && resolvedIds.size === totalCount;

  // Reset local question state when moving to another question
  const goToQuestion = (idx: number) => {
    setCurrentIndex(idx);
    setSelectedOptionId(null);
    setCorrectOptionId(null);
    setServerExplanation(null);
    setRevealed(false);
    setIsCorrect(false);
    setShowExplanation(false);
    setShowEssayModel(false);
    setShowTranslation(false);
    setFeedbackNotice(null);
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle MCQ or True/False Option Selection & Evaluation
  const handleSelectOption = async (optionId: string) => {
    if (!currentQ || revealed || isSubmitting) return;

    setSelectedOptionId(optionId);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/questions/${currentQ.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId: optionId }),
      });

      const data = await res.json();
      const answerCorrect = Boolean(data.isCorrect);

      setRevealed(true);
      setIsCorrect(answerCorrect);
      setCorrectOptionId(data.reveal?.correctOptionId || data.correctOptionId || null);
      if (data.reveal?.explanation || data.explanation) {
        setServerExplanation(data.reveal?.explanation || data.explanation);
      }

      if (answerCorrect) {
        setFeedbackNotice("إجابة صحيحة، تم حذف السؤال من قائمة الأخطاء");
        setResolvedIds((prev) => new Set([...prev, currentQ.id]));
        onMistakeResolved(currentQ.id);

        // If there are more unresolved questions, automatically advance after short delay
        if (currentIndex < totalCount - 1) {
          setTimeout(() => {
            goToQuestion(currentIndex + 1);
          }, 1400);
        }
      } else {
        setFeedbackNotice("إجابة غير دقيقة، راجع التفسير التعليمي المرفق أدناه");
        setShowExplanation(true);
      }
    } catch {
      // Fallback local check
      const opt = currentQ.options.find((o) => o.id === optionId);
      const isRight = Boolean(opt?.isCorrect);
      setRevealed(true);
      setIsCorrect(isRight);
      if (isRight) {
        setResolvedIds((prev) => new Set([...prev, currentQ.id]));
        onMistakeResolved(currentQ.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Essay Resolution
  const handleResolveEssay = async () => {
    if (!currentQ || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await fetch(`/api/questions/${currentQ.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolve: true }),
      });

      setFeedbackNotice("تم تأكيد استيعاب السؤال وحذفه من قائمة الأخطاء بنجاح");
      setResolvedIds((prev) => new Set([...prev, currentQ.id]));
      onMistakeResolved(currentQ.id);

      if (currentIndex < totalCount - 1) {
        setTimeout(() => {
          goToQuestion(currentIndex + 1);
        }, 1200);
      }
    } catch {
      setResolvedIds((prev) => new Set([...prev, currentQ.id]));
      onMistakeResolved(currentQ.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans text-right animate-fadeIn"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0F172A] border border-amber-200/80 dark:border-amber-900/40 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* ─────────────────────────────────────────────────────────────
            1. MODAL TOP BAR (PROFESSIONAL ELEGANT TONE)
        ───────────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25 flex items-center justify-center font-bold shadow-2xs">
              <ArrowClockwise className="w-5 h-5" weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  معالجة أخطاء الدرس
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono">
                  {resolvedIds.size} من {totalCount} تم تصحيحه
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lessonTitle} {unitTitle ? `• ${unitTitle}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="إغلاق (Esc)"
          >
            <X className="w-4 h-4" weight="bold" />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. PROGRESS STRIP
        ───────────────────────────────────────────────────────────── */}
        {totalCount > 0 && !isCapsuleCompleted && (
          <div className="px-5 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
            <span>
              السؤال <span className="font-mono text-slate-900 dark:text-white font-black">{currentIndex + 1}</span> من{" "}
              <span className="font-mono text-slate-900 dark:text-white font-black">{totalCount}</span>
            </span>

            {/* Question Quick Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {activeMistakes.map((m, idx) => {
                const isCurrent = idx === currentIndex;
                const isDone = resolvedIds.has(m.questionId);
                return (
                  <button
                    key={m.questionId}
                    type="button"
                    onClick={() => goToQuestion(idx)}
                    className={`w-6 h-6 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center justify-center ${
                      isDone
                        ? "bg-emerald-500 text-white shadow-2xs"
                        : isCurrent
                        ? "bg-amber-500 text-white shadow-2xs ring-2 ring-amber-500/30"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" weight="bold" /> : idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. MAIN CONTENT BODY
        ───────────────────────────────────────────────────────────── */}
        <div className="p-5 sm:p-7 flex-1 overflow-y-auto space-y-5">
          {/* CASE A: No mistakes at all */}
          {totalCount === 0 ? (
            <div className="text-center py-12 px-4 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle className="w-8 h-8" weight="bold" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                لا توجد أخطاء مسجلة لهذا الدرس حالياً
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                جميع أسئلة الدرس متقنة بنجاح. يمكنك استكمال دراستك أو تثبيت المفاهيم بكروت الاسترجاع الذكي.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                العودة إلى الدرس
              </button>
            </div>
          ) : isCapsuleCompleted ? (
            /* CASE B: Completed All Mistakes in the Capsule! */
            <div className="text-center py-8 px-4 max-w-md mx-auto space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-8 h-8" weight="bold" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full">
                  اكتملت المراجعة بنجاح
                </span>
                <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  تم تصحيح ومعالجة جميع أخطاء الدرس
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  تمت مراجعة جميع الأسئلة وتأكيد استيعابها وحذفها من قائمة الأخطاء.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" weight="bold" />
                <span>تم إتقان {totalCount} أسئلة بنسبة 100%</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                العودة إلى الدرس
              </button>
            </div>
          ) : (
            /* CASE C: Active Question Display */
            currentQ && (() => {
              const isEnglishQ = !/[\u0600-\u06FF]/.test(currentQ.statement || "");
              return (
              <div className="space-y-4">
                {/* Question Header & Controls */}
                <div
                  dir={isEnglishQ ? "ltr" : "rtl"}
                  className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                      {currentQ.type === "MCQ"
                        ? isEnglishQ ? "Multiple Choice" : "اختيار من متعدد"
                        : currentQ.type === "TRUE_FALSE"
                        ? isEnglishQ ? "True / False" : "صح وغلط"
                        : isEnglishQ ? "Essay Question" : "سؤال مقالي"}
                    </span>
                    {resolvedIds.has(currentQ.id) && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" weight="bold" />
                        <span>{isEnglishQ ? "Mastered" : "تم التصحيح"}</span>
                      </span>
                    )}
                  </div>

                  {currentQ.translation && (
                    <TranslationToggle
                      size="xs"
                      isTranslated={showTranslation}
                      onToggle={() => setShowTranslation((prev) => !prev)}
                    />
                  )}
                </div>

                {/* Question Statement */}
                <div
                  dir={!/[\u0600-\u06FF]/.test(currentQ.statement || "") ? "ltr" : "rtl"}
                  className={!/[\u0600-\u06FF]/.test(currentQ.statement || "") ? "text-left" : "text-right"}
                >
                  <BidiStatement
                    as="h4"
                    text={currentQ.statement}
                    className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed font-content"
                  />
                </div>

                {/* Collapsible Arabic Translation for Statement */}
                {showTranslation && currentQ.translation && (
                  <div
                    dir="rtl"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-right animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      <Translate className="w-3.5 h-3.5 text-blue-600" />
                      <span>الترجمة العربية للسؤال:</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 font-content leading-relaxed">
                      {currentQ.translation}
                    </p>
                  </div>
                )}

                <QuestionImageAttachment imageUrl={currentQ.imageUrl} />

                {/* Question Options for MCQ & True/False */}
                {(currentQ.type === "MCQ" || currentQ.type === "TRUE_FALSE") && (
                  <div className="space-y-2.5 pt-1">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = selectedOptionId === opt.id;
                      const isOptionCorrect = correctOptionId ? correctOptionId === opt.id : Boolean(opt.isCorrect);

                      let btnStyle =
                        "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-amber-500/50";

                      if (revealed) {
                        if (isOptionCorrect) {
                          btnStyle =
                            "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20";
                        } else if (isSelected && !isOptionCorrect) {
                          btnStyle =
                            "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300 font-bold ring-2 ring-red-500/20";
                        }
                      }

                      const isEnglishOpt =
                        !/[\u0600-\u06FF]/.test(opt.text || "") ||
                        !/[\u0600-\u06FF]/.test(currentQ.statement || "");
                      const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];
                      const englishLetters = ["A", "B", "C", "D", "E"];
                      const letter = isEnglishOpt ? englishLetters[optIdx] || opt.order : arabicLetters[optIdx] || opt.order;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          dir={isEnglishOpt ? "ltr" : "rtl"}
                          disabled={revealed || isSubmitting}
                          onClick={() => handleSelectOption(opt.id)}
                          className={`w-full p-3.5 sm:p-4 rounded-2xl border ${isEnglishOpt ? "text-left font-sans" : "text-right font-content"} text-xs sm:text-sm font-medium flex items-center justify-between gap-3 transition-all cursor-pointer ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-mono font-bold shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                              {letter}
                            </span>
                            <div className={`min-w-0 flex-1 ${isEnglishOpt ? "text-left" : "text-right"}`}>
                              <BidiStatement as="span" text={opt.text} />
                            </div>
                          </div>

                          {revealed && (
                            <div className="shrink-0 text-xs font-bold">
                              {isOptionCorrect ? (
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Check className="w-4 h-4" weight="bold" />
                                  <span>{isEnglishOpt ? "Correct" : "صحيحة"}</span>
                                </span>
                              ) : isSelected ? (
                                <span className="text-red-600 dark:text-red-400">
                                  {isEnglishOpt ? "Incorrect" : "غير صحيحة"}
                                </span>
                              ) : null}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Essay Question Handling */}
                {currentQ.type === "ESSAY" && (
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEssayModel((prev) => !prev)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <BookOpen className="w-4 h-4" weight="bold" />
                      <span>{showEssayModel ? (isEnglishQ ? "Hide Model Answer" : "إخفاء نموذج الإجابة") : (isEnglishQ ? "View Model Answer" : "عرض نموذج الإجابة للمقارنة")}</span>
                    </button>

                    {showEssayModel && (
                      <div
                        dir={isEnglishQ ? "ltr" : "rtl"}
                        className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 ${isEnglishQ ? "text-left font-sans" : "text-right font-content"} animate-in fade-in duration-200`}
                      >
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                          {isEnglishQ ? "Approved Model Answer:" : "النموذج المعتمد للإجابة:"}
                        </span>
                        <FormattedAnswerView
                          text={
                            currentQ.rubric?.modelAnswer ||
                            currentQ.explanation?.correctReason ||
                            (isEnglishQ
                              ? "The approved model answer focuses on step-by-step methodology and curriculum concepts."
                              : "راجع عناصر ومفاهيم الدرس الأساسية لتأكيد الحل.")
                          }
                          colorScheme="emerald"
                        />
                      </div>
                    )}

                    {!resolvedIds.has(currentQ.id) && (
                      <button
                        type="button"
                        onClick={handleResolveEssay}
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" weight="bold" />
                        <span>{isEnglishQ ? "Confirm Understanding & Remove" : "تأكيد الاستيعاب وحذف السؤال من الأخطاء"}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Status Feedback Toast */}
                {feedbackNotice && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
                      isCorrect || resolvedIds.has(currentQ.id)
                        ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300"
                        : "bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-300"
                    }`}
                  >
                    <span>{feedbackNotice}</span>
                  </div>
                )}

                {/* Explanation Box on demand or after wrong answer */}
                {showExplanation && (
                  <QuestionExplanationBox
                    concept={serverExplanation?.concept || currentQ.explanation?.concept}
                    correctReason={
                      serverExplanation?.correctReason ||
                      currentQ.explanation?.correctReason ||
                      currentQ.options?.find((o) => o.id === correctOptionId || o.isCorrect)?.explanation
                    }
                    forceEnglish={isEnglishQ}
                  />
                )}
              </div>
              );
            })()
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. BOTTOM NAVIGATION BAR
        ───────────────────────────────────────────────────────────── */}
        {totalCount > 0 && !isCapsuleCompleted && (
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => goToQuestion(currentIndex - 1)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>السؤال السابق</span>
            </button>

            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              تمت معالجة <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{resolvedIds.size}</span> من{" "}
              <span className="font-mono">{totalCount}</span> أسئلة
            </span>

            <button
              type="button"
              disabled={currentIndex === totalCount - 1}
              onClick={() => goToQuestion(currentIndex + 1)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-2xs"
            >
              <span>السؤال التالي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
