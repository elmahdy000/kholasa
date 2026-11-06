"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle,
  WarningCircle,
  ArrowClockwise,
  Shuffle,
  BookmarkSimple,
  BookOpen,
  CaretRight,
  CaretLeft,
  ArrowSquareOut,
  Trophy,
  Translate,
} from "@phosphor-icons/react";
import { TranslationToggle } from "@/components/ui/TranslationToggle";
import { FormattedDefinitionView } from "@/components/ui/FormattedDefinitionView";
import { splitExplanation } from "@/components/ui/QuestionExplanationBox";
import type { Definition } from "./types";

interface LessonFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  unitTitle?: string;
  definitions: Definition[];
}

export function LessonFlashcardsModal({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  unitTitle,
  definitions,
}: LessonFlashcardsModalProps) {
  // Deck items state (supports original list, shuffled, or unmastered retry)
  const [deck, setDeck] = useState<Definition[]>(definitions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // Tracking outcomes
  const [masteredTerms, setMasteredTerms] = useState<string[]>([]);
  const [mistakeTerms, setMistakeTerms] = useState<Definition[]>([]);

  // Animation & UI feedback
  const [slideState, setSlideState] = useState<
    "idle" | "exit-left" | "exit-right" | "enter-right" | "enter-left"
  >("idle");
  const [savingNotice, setSavingNotice] = useState<string | null>(null);

  // Sync definitions whenever modal opens or definitions prop changes
  useEffect(() => {
    if (isOpen) {
      setDeck(definitions);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowTranslation(false);
      setMasteredTerms([]);
      setMistakeTerms([]);
      setSlideState("idle");
      setSavingNotice(null);
    }
  }, [isOpen, definitions]);

  // Current active card
  const currentCard = useMemo(() => {
    if (currentIndex >= 0 && currentIndex < deck.length) {
      return deck[currentIndex];
    }
    return null;
  }, [deck, currentIndex]);

  const isCompleted = currentIndex >= deck.length && deck.length > 0;

  // Toggle Flip
  const handleFlip = useCallback(() => {
    if (slideState !== "idle") return;
    setIsFlipped((prev) => !prev);
  }, [slideState]);

  // Action: تمام (Mastered)
  const handleMastered = useCallback(() => {
    if (!currentCard || slideState !== "idle") return;

    const termName = currentCard.term;
    setSlideState("exit-left");

    // Optional background resolve if previously recorded
    fetch(`/api/lessons/${lessonId}/flashcards/mistake`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        term: currentCard.term,
        meaning: currentCard.meaning,
        action: "RESOLVE_MISTAKE",
      }),
    }).catch(() => {});

    setTimeout(() => {
      setMasteredTerms((prev) =>
        prev.includes(termName) ? prev : [...prev, termName]
      );
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowTranslation(false);
      setSlideState("enter-right");

      setTimeout(() => {
        setSlideState("idle");
      }, 200);
    }, 220);
  }, [currentCard, slideState, lessonId]);

  // Action: مش تمام (Save to Mistakes & Advance)
  const handleNeedsReview = useCallback(() => {
    if (!currentCard || slideState !== "idle") return;

    const cardToSave = currentCard;
    setSlideState("exit-right");
    setSavingNotice(`تم حفظ "${cardToSave.term}" في دفتر الأخطاء`);

    // Async record to Mistake Bank
    fetch(`/api/lessons/${lessonId}/flashcards/mistake`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        term: cardToSave.term,
        meaning: cardToSave.meaning,
        action: "RECORD_MISTAKE",
      }),
    }).catch(() => {});

    setTimeout(() => {
      setMistakeTerms((prev) =>
        prev.some((m) => m.term === cardToSave.term)
          ? prev
          : [...prev, cardToSave]
      );
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowTranslation(false);
      setSlideState("enter-left");

      setTimeout(() => {
        setSlideState("idle");
        setTimeout(() => setSavingNotice(null), 1800);
      }, 200);
    }, 220);
  }, [currentCard, slideState, lessonId]);

  // Toggle Shuffle
  const handleToggleShuffle = useCallback(() => {
    if (deck.length <= 1) return;
    if (!isShuffled) {
      const shuffled = [...deck].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setIsShuffled(true);
    } else {
      setDeck(definitions);
      setIsShuffled(false);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
    setSlideState("idle");
  }, [deck, definitions, isShuffled]);

  // Retry only unmastered mistakes
  const handleRetryMistakesOnly = useCallback(() => {
    if (mistakeTerms.length === 0) return;
    setDeck(mistakeTerms);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredTerms([]);
    setMistakeTerms([]);
    setSlideState("idle");
  }, [mistakeTerms]);

  // Restart full deck
  const handleRestartFullDeck = useCallback(() => {
    setDeck(definitions);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredTerms([]);
    setMistakeTerms([]);
    setSlideState("idle");
  }, [definitions]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === "1" || e.key === "ArrowRight") {
          e.preventDefault();
          handleMastered();
        } else if (e.key === "2" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleNeedsReview();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFlipped, handleFlip, handleMastered, handleNeedsReview, onClose]);

  if (!isOpen) return null;

  const totalCards = deck.length;
  const progressPercent =
    totalCards > 0 ? Math.round((currentIndex / totalCards) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F172A]/80 backdrop-blur-md transition-all select-none font-sans">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* 1. Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#1E293B]/70">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" weight="bold" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#800020] text-white">
                  كروت الفلاش
                </span>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
                  تسميع: {lessonTitle}
                </h3>
              </div>
              {unitTitle && (
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                  {unitTitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {totalCards > 1 && !isCompleted && (
              <button
                type="button"
                onClick={handleToggleShuffle}
                className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isShuffled
                    ? "bg-[#800020]/10 border-[#800020]/40 text-[#800020] dark:text-[#FB7185]"
                    : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                }`}
                title="خلط ترتيب الكروت"
              >
                <Shuffle className="w-3.5 h-3.5" weight="bold" />
                <span className="hidden sm:inline">خلط</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#F87171] hover:bg-[#DC2626]/10 flex items-center justify-center transition-colors cursor-pointer"
              title="إغلاق التسميع (Esc)"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>
          </div>
        </div>

        {/* 2. Progress Strip */}
        {totalCards > 0 && !isCompleted && (
          <div className="bg-[#F1F5F9] dark:bg-[#1E293B] px-5 py-2.5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
              <span>
                المصطلح{" "}
                <span className="text-[#0F172A] dark:text-white font-mono font-black">
                  {currentIndex + 1}
                </span>{" "}
                من{" "}
                <span className="text-[#0F172A] dark:text-white font-mono font-black">
                  {totalCards}
                </span>
              </span>
              <span>•</span>
              <span className="text-[#059669] flex items-center gap-1 font-mono">
                <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                <span>{masteredTerms.length} تمام</span>
              </span>
              <span>•</span>
              <span className="text-[#DC2626] flex items-center gap-1 font-mono">
                <WarningCircle className="w-3.5 h-3.5" weight="fill" />
                <span>{mistakeTerms.length} غلطاتي</span>
              </span>
            </div>

            <div className="w-24 sm:w-36 h-2 bg-[#E2E8F0] dark:bg-[#334155] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#800020] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 3. Notification Toast */}
        {savingNotice && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold shadow-lg border border-white/20 animate-bounce flex items-center gap-2">
            <span>{savingNotice}</span>
          </div>
        )}

        {/* 4. Main Body */}
        <div className="p-5 sm:p-8 flex-1 flex flex-col justify-center items-center overflow-y-auto">
          {/* CASE A: No definitions added to this lesson */}
          {totalCards === 0 ? (
            <div className="text-center py-12 px-4 max-w-md space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185] flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" weight="bold" />
              </div>
              <h4 className="text-lg font-bold text-[#0F172A] dark:text-white">
                لا توجد مصطلحات مسجلة لهذا الدرس بعد
              </h4>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                لم يتم إدراج تعريفات أو مصطلحات لهذا الدرس حتى الآن. يمكنك مذاكرة
                شرح الدرس وحل أسئلة وتدريبات البنك.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#800020] text-white text-sm font-bold shadow-sm hover:bg-[#600018] transition-colors cursor-pointer"
              >
                العودة إلى الدرس
              </button>
            </div>
          ) : isCompleted ? (
            /* CASE B: Completed All Flashcards in Deck */
            <div className="text-center py-6 px-4 max-w-lg w-full space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-[#059669]/10 text-[#059669] flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-10 h-10" weight="fill" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#059669] bg-[#059669]/15 px-3 py-1 rounded-full">
                  اكتمل التسميع الذاتي
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white mt-2">
                  أحسنت! أتممت مراجعة مصطلحات الدرس
                </h4>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
                  راجعت {totalCards} مصطلح علمي في هذه الجلسة
                </p>
              </div>

              {/* Outcome summary boxes */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-right">
                <div className="p-4 rounded-xl bg-[#059669]/10 border border-[#059669]/25 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#059669]">
                      متقن بنجاح (تمام)
                    </p>
                    <p className="text-2xl font-black text-[#059669] font-mono mt-1">
                      {masteredTerms.length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-[#059669]" weight="fill" />
                </div>

                <div className="p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/25 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#DC2626]">
                      محفوظ في غلطاتي
                    </p>
                    <p className="text-2xl font-black text-[#DC2626] font-mono mt-1">
                      {mistakeTerms.length}
                    </p>
                  </div>
                  <WarningCircle className="w-8 h-8 text-[#DC2626]" weight="fill" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                {mistakeTerms.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryMistakesOnly}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <ArrowClockwise className="w-4 h-4" weight="bold" />
                    <span>تسميع غير المتقن فقط ({mistakeTerms.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRestartFullDeck}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <ArrowClockwise className="w-4 h-4" weight="bold" />
                  <span>إعادة تسميع كل الكروت</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs font-bold pt-2">
                {mistakeTerms.length > 0 && (
                  <Link
                    href="/mistakes"
                    className="text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1"
                  >
                    <span>فتح دفتر غلطاتي للمراجعة</span>
                    <ArrowSquareOut className="w-3.5 h-3.5" weight="bold" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                >
                  العودة للدرس
                </button>
              </div>
            </div>
          ) : (
            /* CASE C: Interactive 3D Flip Card Active */
            currentCard && (
              <div className="w-full max-w-lg flex flex-col items-center">
                {/* 3D Perspective Card Container */}
                <div
                  className={`w-full perspective-1000 transition-all duration-300 ${
                    slideState === "exit-left"
                      ? "-translate-x-32 opacity-0 rotate-[-4deg]"
                      : slideState === "exit-right"
                      ? "translate-x-32 opacity-0 rotate-[4deg]"
                      : slideState === "enter-right"
                      ? "translate-x-16 opacity-0"
                      : slideState === "enter-left"
                      ? "-translate-x-16 opacity-0"
                      : "translate-x-0 opacity-100 rotate-0"
                  }`}
                >
                  <div
                    onClick={handleFlip}
                    className={`relative w-full min-h-[430px] sm:min-h-[460px] transform-style-preserve-3d transition-transform duration-500 cursor-pointer ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* ===== FRONT FACE (المصطلح / المفهوم) ===== */}
                    <div className="absolute inset-0 backface-hidden rounded-3xl bg-white dark:bg-[#1E293B] border-2 border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8 flex flex-col justify-between items-center text-center hover:border-[#800020]/50 transition-all">
                      {/* Top Header of Front Face */}
                      <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span className="px-3.5 py-1 rounded-full bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185] border border-[#800020]/25 flex items-center gap-1.5 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-[#800020] dark:bg-[#FB7185] animate-ping" />
                          <span>المصطلح المطلوب تسميعه</span>
                        </span>
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                          {currentIndex + 1} / {totalCards}
                        </span>
                      </div>

                      {/* Term Large Centered Title */}
                      <div className="my-auto px-4 max-w-md space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                          ما هو تعريف ومفهوم:
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white leading-relaxed tracking-tight">
                          {currentCard.term}
                        </h2>
                      </div>

                      {/* Bottom Hint */}
                      <div className="w-full pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-[#800020] dark:text-[#FB7185]">
                        <span>اضغط على الكارت لكشف الإجابة والتعريف النموذجي</span>
                        <kbd className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-300 dark:border-slate-700 shadow-2xs">
                          Space
                        </kbd>
                      </div>
                    </div>

                    {/* ===== BACK FACE (التعريف والإجابة النموذجية) ===== */}
                    <div
                      onClick={(e) => {
                        // Prevent flipping back when clicking action buttons
                        if (
                          (e.target as HTMLElement).closest("button")
                        ) {
                          e.stopPropagation();
                        }
                      }}
                      className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-white dark:bg-[#1E293B] border-2 border-[#059669]/40 dark:border-[#059669]/50 shadow-2xl p-5 sm:p-7 flex flex-col justify-between text-right"
                    >
                      {/* Top Header of Back Face */}
                      {(() => {
                        const cardSplit = splitExplanation(currentCard.meaning);
                        const cleanMeaning = currentCard.translation
                          ? currentCard.meaning
                          : cardSplit.translation
                          ? cardSplit.primary
                          : currentCard.meaning;
                        const effectiveTrans = (currentCard.translation || cardSplit.translation || "").trim();
                        const hasTrans = effectiveTrans.length > 0;

                        return (
                          <>
                            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/20 dark:text-[#34D399] border border-[#059669]/30 flex items-center gap-1.5 shadow-2xs">
                                  <span className="w-2 h-2 rounded-full bg-[#059669] dark:bg-[#34D399]" />
                                  <span>التعريف والإجابة النموذجية</span>
                                </span>
                                {hasTrans && (
                                  <TranslationToggle
                                    size="xs"
                                    isTranslated={showTranslation}
                                    onToggle={() => setShowTranslation((prev) => !prev)}
                                  />
                                )}
                              </div>
                              <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185] max-w-[150px] truncate">
                                {currentCard.term}
                              </span>
                            </div>

                            {/* Definition Box with Formatted Multi-paragraph / Point View */}
                            <div className="my-auto py-2.5">
                              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 max-h-[250px] sm:max-h-[270px] overflow-y-auto scrollbar-thin space-y-3.5">
                                <FormattedDefinitionView
                                  text={cleanMeaning}
                                  variant="flashcard"
                                  colorScheme="emerald"
                                />

                                {showTranslation && hasTrans && (
                                  <div
                                    className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/50 text-right animate-in fade-in duration-200 shadow-2xs space-y-1.5"
                                    dir="rtl"
                                  >
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                                      <Translate className="w-3.5 h-3.5" />
                                      <span>الترجمة العربية للتعريف</span>
                                    </div>
                                    <FormattedDefinitionView
                                      text={effectiveTrans}
                                      variant="translation"
                                      colorScheme="emerald"
                                      forceDir="rtl"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                      </div>

                      {/* Bottom Evaluation Action Bar ("وبيظهر اختيارين تمام او مش تمام") */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <p className="text-center text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                          كيف كان حفظك وتسميعك للتعريف؟
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {/* BUTTON 1: تمام (Mastered) */}
                          <button
                            type="button"
                            onClick={handleMastered}
                            className="py-3 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                          >
                            <CheckCircle className="w-5 h-5" weight="bold" />
                            <span>تمام</span>
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px]">
                              1
                            </kbd>
                          </button>

                          {/* BUTTON 2: مش تمام (Save to Mistakes) */}
                          <button
                            type="button"
                            onClick={handleNeedsReview}
                            className="py-3 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                          >
                            <WarningCircle className="w-5 h-5" weight="bold" />
                            <span>مش تمام (غلطاتي)</span>
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px]">
                              2
                            </kbd>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keyboard Shortcuts Helper */}
                <div className="mt-4 flex items-center justify-center gap-3 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-white font-mono text-[10px]">
                      Space
                    </kbd>{" "}
                    قلب الكارت
                  </span>
                  {isFlipped && (
                    <>
                      <span>•</span>
                      <span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-white font-mono text-[10px]">
                          1
                        </kbd>{" "}
                        تمام
                      </span>
                      <span>•</span>
                      <span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-white font-mono text-[10px]">
                          2
                        </kbd>{" "}
                        مش تمام
                      </span>
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

