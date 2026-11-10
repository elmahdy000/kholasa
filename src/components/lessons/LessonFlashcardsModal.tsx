"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle,
  WarningCircle,
  ArrowClockwise,
  Shuffle,
  BookOpen,
  ArrowSquareOut,
  Trophy,
  Translate,
  SpeakerHigh,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
  Lightbulb,
  ArrowsLeftRight,
  Sparkle,
  Cards,
  Check,
} from "@phosphor-icons/react";
import { TranslationToggle } from "@/components/ui/TranslationToggle";
import { FormattedDefinitionView } from "@/components/ui/FormattedDefinitionView";
import { splitExplanation } from "@/components/ui/QuestionExplanationBox";
import { BidiStatement } from "@/components/ui/BidiStatement";
import type { Definition } from "./types";

interface LessonFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  unitTitle?: string;
  definitions: Definition[];
  isLanguages?: boolean;
  onCompleted?: () => void;
}

type StudyMode = "TERM_TO_DEF" | "DEF_TO_TERM";

/**
 * Synthetic Web Audio API tones (Zero external sound assets, 100% offline & fast)
 */
function playTone(type: "flip" | "master" | "review", enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "flip") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === "master") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.07); // E5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "review") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    }
  } catch {
    // Graceful fallback if audio is blocked by user policy
  }
}

/**
 * Client-side Web Speech Synthesis for clear pronunciation of English terms only.
 * Disabled completely for Arabic text/curricula.
 */
function speakText(text: string, forceEnglish?: boolean) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (/[\u0600-\u06FF]/.test(text)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech errors
  }
}

export function LessonFlashcardsModal({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  unitTitle,
  definitions,
  isLanguages = false,
  onCompleted,
}: LessonFlashcardsModalProps) {
  // Deck items state (supports original list, shuffled, or unmastered retry)
  const [deck, setDeck] = useState<Definition[]>(definitions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>("TERM_TO_DEF");
  const [showHint, setShowHint] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tracking outcomes
  const [masteredTerms, setMasteredTerms] = useState<string[]>([]);
  const [mistakeTerms, setMistakeTerms] = useState<Definition[]>([]);
  const [persistedMistakeTerms, setPersistedMistakeTerms] = useState<string[]>([]);

  // Animation & UI feedback
  const [slideState, setSlideState] = useState<
    "idle" | "exit-left" | "exit-right" | "enter-right" | "enter-left"
  >("idle");
  const [savingNotice, setSavingNotice] = useState<string | null>(null);

  // Load sound setting from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kholasa_flashcards_sound");
      if (saved !== null) {
        setSoundEnabled(saved === "true");
      }
    } catch {
      // LocalStorage not available
    }
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("kholasa_flashcards_sound", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Reset or update deck when modal opens or definitions change
  useEffect(() => {
    if (isOpen) {
      setDeck(definitions);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsShuffled(false);
      setShowHint(false);
      setMasteredTerms([]);
      setMistakeTerms([]);
      setPersistedMistakeTerms([]);
      setSlideState("idle");
      setSavingNotice(null);
    }
  }, [isOpen, definitions]);

  const totalCards = deck.length;
  const isCompleted = totalCards > 0 && currentIndex >= totalCards;
  const currentCard = totalCards > 0 && !isCompleted ? deck[currentIndex] : null;

  // Auto-trigger completion callback when all cards are finished
  useEffect(() => {
    if (isCompleted && onCompleted) {
      onCompleted();
    }
  }, [isCompleted, onCompleted]);

  // Flip active card
  const handleFlip = useCallback(() => {
    playTone("flip", soundEnabled);
    setIsFlipped((prev) => !prev);
  }, [soundEnabled]);

  // Advance to next card with clean animation
  const advanceCard = useCallback(() => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => prev + 1);
    setSlideState("enter-right");
    setTimeout(() => {
      setSlideState("idle");
    }, 200);
  }, []);

  const persistFlashcardAction = useCallback(
    async (card: Definition, action: "RECORD_MISTAKE" | "RESOLVE_MISTAKE") => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}/flashcards/mistake`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            term: card.term,
            meaning: card.meaning,
            action,
          }),
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (action === "RECORD_MISTAKE") {
          setPersistedMistakeTerms((prev) =>
            prev.includes(card.term) ? prev : [...prev, card.term]
          );
          setSavingNotice("تم حفظ المصطلح في كشكول غلطاتي");
          setTimeout(() => setSavingNotice(null), 2000);
        } else if (action === "RESOLVE_MISTAKE" && data?.questionId) {
          setPersistedMistakeTerms((prev) => prev.filter((t) => t !== card.term));
        }
      } catch {
        // Non-blocking background sync for flashcard review
      }
    },
    [lessonId]
  );

  // Mark as Mastered
  const handleMastered = useCallback(() => {
    if (!currentCard) return;
    playTone("master", soundEnabled);

    const cardToResolve = currentCard;
    setMasteredTerms((prev) => [...prev, cardToResolve.term]);
    setSlideState("exit-left");

    if (persistedMistakeTerms.includes(cardToResolve.term)) {
      void persistFlashcardAction(cardToResolve, "RESOLVE_MISTAKE");
    }

    setTimeout(() => {
      advanceCard();
    }, 180);
  }, [currentCard, soundEnabled, advanceCard, persistedMistakeTerms, persistFlashcardAction]);

  // Mark as Needs Review (Mistake)
  const handleNeedsReview = useCallback(async () => {
    if (!currentCard) return;
    playTone("review", soundEnabled);

    const cardToSave = currentCard;
    setMistakeTerms((prev) => [...prev, cardToSave]);
    setSlideState("exit-right");
    void persistFlashcardAction(cardToSave, "RECORD_MISTAKE");

    setTimeout(() => {
      advanceCard();
    }, 180);
  }, [currentCard, soundEnabled, advanceCard, persistFlashcardAction]);

  // Toggle Mode (Term -> Def VS Scientific Term Def -> Term)
  const handleToggleMode = useCallback(() => {
    setStudyMode((prev) => (prev === "TERM_TO_DEF" ? "DEF_TO_TERM" : "TERM_TO_DEF"));
    setIsFlipped(false);
    setShowHint(false);
  }, []);

  // Toggle Shuffle
  const handleToggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const next = !prev;
      if (next) {
        setDeck((d) => [...d].sort(() => Math.random() - 0.5));
      } else {
        setDeck(definitions);
      }
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowHint(false);
      return next;
    });
  }, [definitions]);

  // Retry only unmastered mistakes
  const handleRetryMistakesOnly = useCallback(() => {
    if (mistakeTerms.length === 0) return;
    setDeck(mistakeTerms);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setMasteredTerms([]);
    setMistakeTerms([]);
    setSlideState("idle");
  }, [mistakeTerms]);

  // Restart full deck
  const handleRestartFullDeck = useCallback(() => {
    setDeck(definitions);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setMasteredTerms([]);
    setMistakeTerms([]);
    setSlideState("idle");
  }, [definitions]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
      } else {
        if (e.key === "m" || e.key === "M") {
          e.preventDefault();
          handleToggleMode();
        } else if (e.key === "h" || e.key === "H") {
          e.preventDefault();
          setShowHint((prev) => !prev);
        } else if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          handleToggleShuffle();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    isFlipped,
    handleFlip,
    handleMastered,
    handleNeedsReview,
    handleToggleMode,
    handleToggleShuffle,
    onClose,
  ]);

  if (!isOpen) return null;

  const progressPercent =
    totalCards > 0 ? Math.round((currentIndex / totalCards) * 100) : 0;
  const masteryPercent =
    totalCards > 0 ? Math.round((masteredTerms.length / totalCards) * 100) : 0;

  // Clean parsed texts for active card
  const cardSplit = currentCard ? splitExplanation(currentCard.meaning) : { primary: "", translation: null };
  const cleanMeaning = currentCard?.translation
    ? currentCard.meaning
    : cardSplit.translation
    ? cardSplit.primary
    : currentCard?.meaning || "";
  const effectiveTrans = isLanguages
    ? (currentCard?.translation || cardSplit.translation || "").trim()
    : "";
  const hasTrans = isLanguages && effectiveTrans.length > 0;
  const isEnglishTerm = currentCard ? !/[\u0600-\u06FF]/.test(currentCard.term) : false;

  // Smart Hints Generator
  const getHintText = () => {
    if (!currentCard) return "";
    if (studyMode === "TERM_TO_DEF") {
      const cleanWords = cleanMeaning.replace(/^[\s#*-]+/, "").split(/\s+/);
      if (cleanWords.length <= 4) {
        return "فكر في المعنى الأساسي للشرح والكلمات المميزة له.";
      }
      return `الشرح بيبدأ بـ: "${cleanWords.slice(0, 4).join(" ")}..."`;
    } else {
      const cleanTerm = currentCard.term.trim();
      const wordsCount = cleanTerm.split(/\s+/).length;
      const firstChar = cleanTerm.charAt(0);
      return `المصطلح بيبدأ بحرف (${firstChar}) ومكون من ${wordsCount} ${
        wordsCount === 1 ? "كلمة واحدة" : "كلمات"
      }.`;
    }
  };

  const getCelebrationMessage = () => {
    if (masteryPercent === 100) {
      return {
        title: "الله ينور عليك! حافظ كل مصطلحات الدرس صم 🏆",
        desc: "ذاكرتك 100% وجاهز للامتحان في أي وقت.",
      };
    }
    if (masteryPercent >= 70) {
      return {
        title: "شغل عالي جداً! أغلب المفاهيم في جيبك ✨",
        desc: `أتقنت ${masteredTerms.length} من ${totalCards} مصطلحات، فاضلك شوية تركيز ع الباقي وتقفلها.`,
      };
    }
    return {
      title: "بداية كويسة! المهم عرفت اللي فلت منك وهنظبطه 🎯",
      desc: `راجعت ${masteredTerms.length} مصطلحات تمام، سمّع اللي ناقصين تاني وهيثبتوا في دماغك علطول.`,
    };
  };

  const celebration = getCelebrationMessage();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تسميع مصطلحات الدرس"
      className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-[#091B40] sm:bg-[#091B40]/85 sm:backdrop-blur-md sm:items-center sm:justify-center sm:p-4 select-none font-sans"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-white dark:bg-[#0F172A] sm:rounded-2xl border-0 sm:border sm:border-[#E2E8F0] dark:sm:border-[#334155] shadow-2xl flex flex-col overflow-hidden relative">
        {/* ─────────────────────────────────────────────────────────────
            1. MODAL TOP BAR (Compact 52px Header on Mobile & Desktop)
        ───────────────────────────────────────────────────────────── */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-2.5 bg-[#FAF8F5]/80 dark:bg-[#1E293B]/70 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#536681] dark:text-[#94A3B8] hover:text-[#C43D49] hover:bg-[#C43D49]/10 flex items-center justify-center transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              title="إغلاق التسميع (Esc)"
              aria-label="إغلاق التسميع"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#800B34] text-white shrink-0">
                  {isLanguages ? "Flashcards" : "تسميع الدرس"}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#091B40] dark:text-white truncate">
                  {lessonTitle}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Mode Switch Button */}
            {totalCards > 0 && !isCompleted && (
              <button
                type="button"
                onClick={handleToggleMode}
                className="h-9 px-2 sm:px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white hover:border-[#800B34] min-h-[44px] sm:min-h-0"
                title="تبديل طريقة التسميع (سمّع التعريف أو اكتب المصطلح)"
                aria-label="تبديل طريقة التسميع"
              >
                <ArrowsLeftRight className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32]" weight="bold" />
                <span className="hidden md:inline text-[11px]">
                  {studyMode === "TERM_TO_DEF" ? "سمّع التعريف" : "اكتب المصطلح"}
                </span>
              </button>
            )}

            {/* Shuffle Button */}
            {totalCards > 1 && !isCompleted && (
              <button
                type="button"
                onClick={handleToggleShuffle}
                className={`w-9 h-9 rounded-xl border text-xs font-bold flex items-center justify-center transition-colors cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 ${
                  isShuffled
                    ? "bg-[#800B34]/10 border-[#800B34]/40 text-[#800B34] dark:text-[#E9AD32]"
                    : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                }`}
                title="لخبطة ترتيب الكروت (S)"
                aria-label="لخبطة ترتيب الكروت"
              >
                <Shuffle className="w-4 h-4" weight="bold" />
              </button>
            )}

            {/* Sound Effects Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`w-9 h-9 rounded-xl border text-xs font-bold flex items-center justify-center transition-colors cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 ${
                soundEnabled
                  ? "bg-[#17834B]/10 border-[#17834B]/30 text-[#17834B]"
                  : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#94A3B8]"
              }`}
              title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
              aria-label={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
            >
              {soundEnabled ? (
                <SpeakerSimpleHigh className="w-4 h-4" weight="bold" />
              ) : (
                <SpeakerSimpleSlash className="w-4 h-4" weight="bold" />
              )}
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. SLIM PROGRESS BAR & STATS STRIP
        ───────────────────────────────────────────────────────────── */}
        {totalCards > 0 && !isCompleted && (
          <div className="bg-[#FAF8F5]/60 dark:bg-[#1E293B]/50 border-b border-[#E2E8F0] dark:border-[#334155] shrink-0">
            {/* Top 2.5px Progress line */}
            <div className="w-full h-1 bg-[#E2E8F0] dark:bg-[#334155] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#800B34] to-[#E9AD32] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Stats row */}
            <div className="px-3.5 sm:px-5 py-2 flex items-center justify-between text-[11.5px] sm:text-xs font-bold text-[#536681] dark:text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <span>
                  المصطلح{" "}
                  <span className="text-[#091B40] dark:text-white font-mono font-black">
                    {currentIndex + 1}
                  </span>{" "}
                  من{" "}
                  <span className="text-[#091B40] dark:text-white font-mono font-black">
                    {totalCards}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[#17834B] flex items-center gap-1 font-mono">
                  <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                  <span>{masteredTerms.length} تمام</span>
                </span>
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-mono">
                  <WarningCircle className="w-3.5 h-3.5" weight="fill" />
                  <span>{mistakeTerms.length} مراجعة</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {savingNotice && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-xl bg-[#091B40] text-white text-xs font-bold shadow-lg border border-white/20 flex items-center gap-2 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" weight="bold" />
            <span>{savingNotice}</span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. MAIN BODY & FLASHCARD CONTAINER (Flex-1 Adaptive Height)
        ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 p-3 sm:p-5 flex flex-col items-center justify-center overflow-y-auto">
          {/* CASE A: No definitions added */}
          {totalCards === 0 ? (
            <div className="text-center py-8 px-4 max-w-sm space-y-3.5 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#800B34]/10 text-[#800B34] flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" weight="bold" />
              </div>
              <h4 className="text-base font-bold text-[#091B40] dark:text-white">
                لسه مفيش مصطلحات مسجلة للدرس ده
              </h4>
              <p className="text-xs text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                أول ما تتضاف هتقدر تسمّعها لنفسك هنا بكل سهولة، دلوقتي تقدر تذاكر الشرح وتحل أسئلة وتدريبات البنك.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#800B34] text-white text-xs font-bold shadow-xs hover:bg-[#680829] transition-colors cursor-pointer min-h-[44px]"
              >
                العودة إلى الدرس
              </button>
            </div>
          ) : isCompleted ? (
            /* CASE B: Completed All Cards in Deck */
            <div className="text-center py-4 px-3 max-w-md w-full space-y-4 my-auto animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-[#17834B]/10 text-[#17834B] flex items-center justify-center mx-auto shadow-2xs">
                <Trophy className="w-8 h-8" weight="fill" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#17834B] bg-[#17834B]/15 px-3 py-1 rounded-full">
                  عاش يا بطل! خلصت التسميع 🎉
                </span>
                <h4 className="text-lg sm:text-xl font-black text-[#091B40] dark:text-white mt-2 leading-snug">
                  {celebration.title}
                </h4>
                <p className="text-xs text-[#536681] dark:text-[#94A3B8] mt-1">
                  {celebration.desc}
                </p>
              </div>

              {/* Outcome summary boxes */}
              <div className="grid grid-cols-2 gap-2.5 text-right">
                <div className="p-3.5 rounded-xl bg-[#17834B]/10 border border-[#17834B]/25 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-[#17834B]">تمام وحافظه</p>
                    <p className="text-2xl font-black text-[#17834B] font-mono mt-0.5">
                      {masteredTerms.length}
                    </p>
                  </div>
                  <CheckCircle className="w-7 h-7 text-[#17834B]" weight="fill" />
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">محتاج أراجعه</p>
                    <p className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5">
                      {mistakeTerms.length}
                    </p>
                  </div>
                  <WarningCircle className="w-7 h-7 text-amber-600 dark:text-amber-400" weight="fill" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                {mistakeTerms.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryMistakesOnly}
                    className="w-full sm:flex-1 min-h-[46px] py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <ArrowClockwise className="w-4 h-4" weight="bold" />
                    <span>سمّع اللي ناقص بس ({mistakeTerms.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRestartFullDeck}
                  className="w-full sm:flex-1 min-h-[46px] py-2.5 px-4 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <ArrowClockwise className="w-4 h-4" weight="bold" />
                  <span>إعادة تسميع كل الكروت</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs font-bold pt-1">
                {mistakeTerms.length > 0 && (
                  <Link
                    href="/mistakes"
                    className="text-[#800B34] dark:text-[#E9AD32] hover:underline flex items-center gap-1"
                  >
                    <span>افتح كشكول غلطاتي للمراجعة</span>
                    <ArrowSquareOut className="w-3.5 h-3.5" weight="bold" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white cursor-pointer"
                >
                  العودة للدرس
                </button>
              </div>
            </div>
          ) : (
            /* CASE C: Interactive 3D Flip Card Active */
            currentCard && (
              <div className="w-full max-w-lg h-full flex flex-col items-center justify-center">
                {/* 3D Perspective Card Container with Content-driven / Flex-1 height */}
                <div
                  className={`w-full flex-1 flex flex-col justify-center perspective-1000 transition-all duration-300 ${
                    slideState === "exit-left"
                      ? "-translate-x-28 opacity-0 rotate-[-3deg]"
                      : slideState === "exit-right"
                      ? "translate-x-28 opacity-0 rotate-[3deg]"
                      : slideState === "enter-right"
                      ? "translate-x-12 opacity-0"
                      : slideState === "enter-left"
                      ? "-translate-x-12 opacity-0"
                      : "translate-x-0 opacity-100 rotate-0"
                  }`}
                >
                  <div
                    onClick={handleFlip}
                    className={`relative w-full h-[280px] sm:h-[360px] max-h-[55vh] transform-style-preserve-3d transition-transform duration-500 cursor-pointer ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* ===== FRONT FACE ===== */}
                    <div className="absolute inset-0 backface-hidden rounded-2xl bg-white dark:bg-[#1E293B] border-2 border-slate-200 dark:border-slate-700 shadow-md p-4 sm:p-6 flex flex-col justify-between items-center text-center hover:border-[#800B34]/40 transition-all overflow-hidden">
                      {/* Top Header of Front Face */}
                      <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#800B34]/10 text-[#800B34] dark:text-[#E9AD32] border border-[#800B34]/20 flex items-center gap-1 shadow-2xs text-[11px]">
                          <Sparkle className="w-3.5 h-3.5 text-[#800B34] dark:text-[#E9AD32]" weight="fill" />
                          <span>
                            {studyMode === "TERM_TO_DEF"
                              ? "سمّع التعريف"
                              : "اكتب المصطلح العلمي"}
                          </span>
                        </span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                          {currentIndex + 1} / {totalCards}
                        </span>
                      </div>

                      {/* Main Front Content */}
                      <div className="my-auto px-2 max-w-md w-full space-y-2.5">
                        {studyMode === "TERM_TO_DEF" ? (
                          <>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                              يا ترى إيه هو تعريف وشرح:
                            </span>
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <h2
                                className={`text-xl sm:text-2xl font-black text-[#091B40] dark:text-white leading-relaxed tracking-tight break-words ${
                                  isEnglishTerm ? "font-sans dir-ltr text-center" : ""
                                }`}
                              >
                                <BidiStatement as="span" text={currentCard.term} />
                              </h2>
                              {isEnglishTerm && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakText(currentCard.term, true);
                                  }}
                                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#800B34]/10 hover:text-[#800B34] flex items-center justify-center transition-colors shrink-0"
                                  title="اسمع نطق المصطلح بالإنجليزي"
                                  aria-label="اسمع نطق المصطلح"
                                >
                                  <SpeakerHigh className="w-3.5 h-3.5" weight="bold" />
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block uppercase tracking-wider">
                              اكتب المصطلح العلمي الدال على:
                            </span>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-right max-h-[160px] overflow-y-auto scrollbar-thin">
                              <FormattedDefinitionView
                                text={cleanMeaning}
                                variant="flashcard"
                                colorScheme="burgundy"
                              />
                            </div>
                          </>
                        )}

                        {/* Interactive Hint */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="pt-0.5 flex flex-col items-center"
                        >
                          {!showHint ? (
                            <button
                              type="button"
                              onClick={() => setShowHint(true)}
                              className="text-[11px] font-bold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            >
                              <Lightbulb className="w-3.5 h-3.5" weight="bold" />
                              <span>تلميح ع الماشي 💡 (H)</span>
                            </button>
                          ) : (
                            <div className="w-full p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 text-center animate-in fade-in duration-200 shadow-2xs">
                              <span className="font-bold">💡 تلميح: </span>
                              <span>{getHintText()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Prompt on Front Card */}
                      <div className="w-full pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#800B34] dark:text-[#E9AD32] shrink-0">
                        <span>انقر على الكارت لتكشف الإجابة</span>
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-300 dark:border-slate-700">
                          Space
                        </kbd>
                      </div>
                    </div>

                    {/* ===== BACK FACE ===== */}
                    <div
                      onClick={(e) => {
                        // Prevent flipping back when clicking action buttons
                        if ((e.target as HTMLElement).closest("button")) {
                          e.stopPropagation();
                        }
                      }}
                      className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-white dark:bg-[#1E293B] border-2 border-[#17834B]/40 dark:border-[#17834B]/50 shadow-md p-3.5 sm:p-5 flex flex-col justify-between text-right overflow-hidden"
                    >
                      {/* Top Header of Back Face */}
                      <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#17834B]/10 text-[#17834B] border border-[#17834B]/30 flex items-center gap-1 text-[11px] shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#17834B]" />
                            <span>الإجابة النموذجية المعتمدة</span>
                          </span>
                          {hasTrans && (
                            <TranslationToggle
                              size="xs"
                              isTranslated={showTranslation}
                              onToggle={() => setShowTranslation((prev) => !prev)}
                            />
                          )}
                        </div>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                          {currentIndex + 1} / {totalCards}
                        </span>
                      </div>

                      {/* Main Back Content */}
                      <div className="my-auto py-2 space-y-2 overflow-y-auto max-h-[170px] sm:max-h-[220px] scrollbar-thin">
                        {studyMode === "TERM_TO_DEF" ? (
                          <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1 text-right">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                                المصطلح:
                              </span>
                              <BidiStatement
                                as="span"
                                text={currentCard.term}
                                className="text-xs sm:text-sm font-bold text-[#800B34] dark:text-[#E9AD32] break-words"
                              />
                            </div>
                            {isEnglishTerm && (
                              <button
                                type="button"
                                onClick={() => speakText(currentCard.term, true)}
                                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-[#800B34] transition-colors shrink-0 cursor-pointer"
                                title="اسمع نطق المصطلح بالإنجليزي"
                                aria-label="اسمع نطق المصطلح"
                              >
                                <SpeakerHigh className="w-3.5 h-3.5" weight="bold" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center shadow-2xs">
                            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">
                              المصطلح العلمي الصح هو:
                            </span>
                            <div className="flex items-center justify-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-sm sm:text-base font-black text-emerald-900 dark:text-emerald-200 inline-block break-words">
                                <BidiStatement as="span" text={currentCard.term} />
                              </span>
                              {isEnglishTerm && (
                                <button
                                  type="button"
                                  onClick={() => speakText(currentCard.term, true)}
                                  className="p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors shrink-0 cursor-pointer"
                                  title="اسمع نطق المصطلح بالإنجليزي"
                                  aria-label="اسمع نطق المصطلح"
                                >
                                  <SpeakerHigh className="w-3.5 h-3.5" weight="bold" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-[#FAF8F5]/80 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 space-y-2">
                          <FormattedDefinitionView
                            text={cleanMeaning}
                            variant="flashcard"
                            colorScheme="emerald"
                          />

                          {showTranslation && hasTrans && (
                            <div
                              className="p-2.5 rounded-lg bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/50 text-right animate-in fade-in duration-200 shadow-2xs space-y-1"
                              dir="rtl"
                            >
                              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                                <Translate className="w-3 h-3" />
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

                      {/* Small Prompt in Card Back */}
                      <p className="text-center text-[11px] font-bold text-[#536681] dark:text-[#94A3B8] shrink-0 pt-1">
                        قيّم حفظك بالكروت بالأسفل 👇
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. PINNED DOCKED ACTION FOOTER (ALWAYS VISIBLE ABOVE THE FOLD)
        ───────────────────────────────────────────────────────────── */}
        {totalCards > 0 && !isCompleted && (
          <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-t border-[#E2E8F0] dark:border-[#334155] bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md shrink-0 pb-[max(0.65rem,calc(env(safe-area-inset-bottom)+0.25rem))]">
            {!isFlipped ? (
              /* When card is NOT flipped -> Full-width Flip button */
              <button
                type="button"
                onClick={handleFlip}
                className="w-full h-12 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all min-h-[48px]"
              >
                <span>اقلب الكارت للتحقق من إجابتك</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px]">
                  Space
                </kbd>
              </button>
            ) : (
              /* When card IS flipped -> 2 Equal tactile evaluation buttons */
              <div className="space-y-1.5">
                <p className="text-center text-[11px] font-bold text-[#536681] dark:text-[#94A3B8]">
                  ها، طمنّي.. كنت حافظ الإجابة صح؟
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {/* Button 1: تمام وحافظه (Green) */}
                  <button
                    type="button"
                    onClick={handleMastered}
                    className="h-12 rounded-xl bg-[#17834B] hover:bg-[#136D3E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all min-h-[48px]"
                  >
                    <CheckCircle className="w-5 h-5 shrink-0" weight="bold" />
                    <span>تمام وحافظه</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px]">
                      1
                    </kbd>
                  </button>

                  {/* Button 2: محتاج أراجعه (Amber) */}
                  <button
                    type="button"
                    onClick={handleNeedsReview}
                    className="h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all min-h-[48px]"
                  >
                    <WarningCircle className="w-5 h-5 shrink-0" weight="bold" />
                    <span>محتاج أراجعه</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px]">
                      2
                    </kbd>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
