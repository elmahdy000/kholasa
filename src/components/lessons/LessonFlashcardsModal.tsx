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
  Brain,
  Cards,
  Check,
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
  isLanguages?: boolean;
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
 * Client-side Web Speech Synthesis for clear pronunciation of terms
 */
function speakText(text: string, forceEnglish?: boolean) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const isEnglish = forceEnglish ?? !/[\u0600-\u06FF]/.test(text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isEnglish ? "en-US" : "ar-SA";
    utterance.rate = isEnglish ? 0.9 : 0.95;
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

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("kholasa_flashcards_sound", String(next));
      } catch {}
      return next;
    });
  }, []);

  // Sync definitions whenever modal opens or definitions prop changes
  useEffect(() => {
    if (isOpen) {
      setDeck(definitions);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowTranslation(false);
      setShowHint(false);
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

  const totalCards = deck.length;
  const isCompleted = currentIndex >= totalCards && totalCards > 0;

  // Toggle Flip
  const handleFlip = useCallback(() => {
    if (slideState !== "idle") return;
    playTone("flip", soundEnabled);
    setIsFlipped((prev) => !prev);
  }, [slideState, soundEnabled]);

  // Toggle Study Mode (Term -> Definition VS Definition -> Term / اكتب المصطلح العلمي)
  const handleToggleMode = useCallback(() => {
    setStudyMode((prev) =>
      prev === "TERM_TO_DEF" ? "DEF_TO_TERM" : "TERM_TO_DEF"
    );
    setIsFlipped(false);
    setShowHint(false);
  }, []);

  // Action: أتقنته تماماً (Mastered)
  const handleMastered = useCallback(() => {
    if (!currentCard || slideState !== "idle") return;

    playTone("master", soundEnabled);
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
      setShowHint(false);
      setSlideState("enter-right");

      setTimeout(() => {
        setSlideState("idle");
      }, 200);
    }, 220);
  }, [currentCard, slideState, lessonId, soundEnabled]);

  // Action: محتاج تثبيت (Save to Mistakes & Advance)
  const handleNeedsReview = useCallback(() => {
    if (!currentCard || slideState !== "idle") return;

    playTone("review", soundEnabled);
    const cardToSave = currentCard;
    setSlideState("exit-right");
    setSavingNotice(`تم حفظ "${cardToSave.term}" في غلطاتي للمراجعة`);

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
      setShowHint(false);
      setSlideState("enter-left");

      setTimeout(() => {
        setSlideState("idle");
        setTimeout(() => setSavingNotice(null), 2000);
      }, 200);
    }, 220);
  }, [currentCard, slideState, lessonId, soundEnabled]);

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
    setShowHint(false);
    setSlideState("idle");
  }, [deck, definitions, isShuffled]);

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
  const effectiveTrans = (
    currentCard?.translation ||
    cardSplit.translation ||
    ""
  ).trim();
  const hasTrans = effectiveTrans.length > 0;
  const isEnglishTerm = currentCard ? !/[\u0600-\u06FF]/.test(currentCard.term) : false;

  // Smart Hints Generator
  const getHintText = () => {
    if (!currentCard) return "";
    if (studyMode === "TERM_TO_DEF") {
      const cleanWords = cleanMeaning.replace(/^[\s#*-]+/, "").split(/\s+/);
      if (cleanWords.length <= 4) {
        return "فكر في الفكرة الجوهرية والخصائص العلمية لهذا المفهوم.";
      }
      return `يبدأ الشرح بـ: "${cleanWords.slice(0, 4).join(" ")}..."`;
    } else {
      const cleanTerm = currentCard.term.trim();
      const wordsCount = cleanTerm.split(/\s+/).length;
      const firstChar = cleanTerm.charAt(0);
      return `يبدأ بحرف (${firstChar}) ومكون من ${wordsCount} ${
        wordsCount === 1 ? "كلمة واحدة" : "كلمات"
      }.`;
    }
  };

  const getCelebrationMessage = () => {
    if (masteryPercent === 100) {
      return {
        title: "أداء استثنائي! أتقنت جميع مصطلحات الدرس 🏆",
        desc: "ذاكرتك في قمة الجاهزية، المفاهيم مثبتة تماماً وجاهزة للامتحان.",
      };
    }
    if (masteryPercent >= 70) {
      return {
        title: "مستوى رائع! استرجاع سريع ومتقن ✨",
        desc: `أتقنت ${masteredTerms.length} من ${totalCards} مصطلحاً. راجع المتبقي لتصل إلى 100% إتقان.`,
      };
    }
    return {
      title: "بداية ممتازة! خطوة قوية لتثبيت الدرس 🎯",
      desc: `استرجعت ${masteredTerms.length} مصطلحات. بالتكرار المتباعد ستثبت باقي المصطلحات في الذاكرة الدائمة بسهولة.`,
    };
  };

  const celebration = getCelebrationMessage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F172A]/80 backdrop-blur-md transition-all select-none font-sans">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* 1. Modal Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#1E293B]/70">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185] flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4" weight="bold" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#800020] text-white">
                  {isLanguages ? "Smart Recall • كروت التثبيت" : "كروت التثبيت الذكي"}
                </span>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
                  {lessonTitle}
                </h3>
              </div>
              {unitTitle && (
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                  {unitTitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mode Switch Button (Term -> Def VS Scientific Term Def -> Term) */}
            {totalCards > 0 && !isCompleted && (
              <button
                type="button"
                onClick={handleToggleMode}
                className="px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:border-[#800020]"
                title="تبديل نمط التثبيت (من المصطلح للتعريف أو العكس للمصطلح العلمي)"
              >
                <ArrowsLeftRight className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" weight="bold" />
                <span className="hidden md:inline">
                  {studyMode === "TERM_TO_DEF"
                    ? "نمط: مصطلح ➔ تعريف"
                    : "نمط: اكتب المصطلح العلمي"}
                </span>
              </button>
            )}

            {/* Shuffle Button */}
            {totalCards > 1 && !isCompleted && (
              <button
                type="button"
                onClick={handleToggleShuffle}
                className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isShuffled
                    ? "bg-[#800020]/10 border-[#800020]/40 text-[#800020] dark:text-[#FB7185]"
                    : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                }`}
                title="خلط ترتيب الكروت عشوائياً (S)"
              >
                <Shuffle className="w-3.5 h-3.5" weight="bold" />
              </button>
            )}

            {/* Sound Effects Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                soundEnabled
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#94A3B8]"
              }`}
              title={soundEnabled ? "كتم المؤثرات الصوتية" : "تشغيل المؤثرات الصوتية"}
            >
              {soundEnabled ? (
                <SpeakerSimpleHigh className="w-3.5 h-3.5" weight="bold" />
              ) : (
                <SpeakerSimpleSlash className="w-3.5 h-3.5" weight="bold" />
              )}
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#F87171] hover:bg-[#DC2626]/10 flex items-center justify-center transition-colors cursor-pointer"
              title="إغلاق كروت التثبيت (Esc)"
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
                المفهوم{" "}
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
                <span>{masteredTerms.length} أتقنتها</span>
              </span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-mono">
                <WarningCircle className="w-3.5 h-3.5" weight="fill" />
                <span>{mistakeTerms.length} محتاجة تثبيت</span>
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
            <Check className="w-4 h-4 text-emerald-400" weight="bold" />
            <span>{savingNotice}</span>
          </div>
        )}

        {/* 4. Main Body */}
        <div className="p-4 sm:p-7 flex-1 flex flex-col justify-center items-center overflow-y-auto">
          {/* CASE A: No definitions added to this lesson */}
          {totalCards === 0 ? (
            <div className="text-center py-12 px-4 max-w-md space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185] flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" weight="bold" />
              </div>
              <h4 className="text-lg font-bold text-[#0F172A] dark:text-white">
                لا توجد مفاهيم مسجلة لهذا الدرس بعد
              </h4>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                لم يتم إدراج تعريفات أو مصطلحات لهذا الدرس حتى الآن. يمكنك مذاكرة
                شرح الدرس وحل أسئلة وتدريبات البنك مباشرة.
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
            /* CASE B: Completed All Cards in Deck */
            <div className="text-center py-5 px-4 max-w-lg w-full space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-10 h-10" weight="fill" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full">
                  اكتمل تحدي التثبيت الذكي
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white mt-2">
                  {celebration.title}
                </h4>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
                  {celebration.desc}
                </p>
              </div>

              {/* Outcome summary boxes */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-right">
                <div className="p-4 rounded-xl bg-[#059669]/10 border border-[#059669]/25 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#059669]">
                      أتقنتها بنجاح
                    </p>
                    <p className="text-2xl font-black text-[#059669] font-mono mt-1">
                      {masteredTerms.length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-[#059669]" weight="fill" />
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      محتاجة مراجعة وتثبيت
                    </p>
                    <p className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono mt-1">
                      {mistakeTerms.length}
                    </p>
                  </div>
                  <WarningCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" weight="fill" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                {mistakeTerms.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryMistakesOnly}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <ArrowClockwise className="w-4 h-4" weight="bold" />
                    <span>تثبيت غير المتقن فقط ({mistakeTerms.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRestartFullDeck}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <ArrowClockwise className="w-4 h-4" weight="bold" />
                  <span>إعادة الجولة كاملة</span>
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
                  className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
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
                    className={`relative w-full min-h-[430px] sm:min-h-[470px] transform-style-preserve-3d transition-transform duration-500 cursor-pointer ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* ===== FRONT FACE ===== */}
                    <div className="absolute inset-0 backface-hidden rounded-3xl bg-white dark:bg-[#1E293B] border-2 border-slate-200 dark:border-slate-700 shadow-xl p-5 sm:p-7 flex flex-col justify-between items-center text-center hover:border-[#800020]/50 transition-all">
                      {/* Top Header of Front Face */}
                      <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span className="px-3 py-1 rounded-full bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185] border border-[#800020]/25 flex items-center gap-1.5 shadow-2xs">
                          <Sparkle className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" weight="fill" />
                          <span>
                            {studyMode === "TERM_TO_DEF"
                              ? "استرجاع المفهوم"
                              : "تحدي اكتب المصطلح العلمي"}
                          </span>
                        </span>
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                          {currentIndex + 1} / {totalCards}
                        </span>
                      </div>

                      {/* Main Front Content */}
                      <div className="my-auto px-3 max-w-md w-full space-y-3">
                        {studyMode === "TERM_TO_DEF" ? (
                          <>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                              ما هو تعريف وشرح:
                            </span>
                            <div className="flex items-center justify-center gap-2">
                              <h2
                                className={`text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white leading-relaxed tracking-tight ${
                                  isEnglishTerm ? "font-sans dir-ltr text-left" : ""
                                }`}
                              >
                                {currentCard.term}
                              </h2>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakText(currentCard.term, isEnglishTerm);
                                }}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#800020]/10 hover:text-[#800020] flex items-center justify-center transition-colors shrink-0"
                                title="استمع لنطق المصطلح"
                              >
                                <SpeakerHigh className="w-4 h-4" weight="bold" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block uppercase tracking-wider">
                              اكتب المصطلح العلمي الدال على:
                            </span>
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-right max-h-[220px] overflow-y-auto scrollbar-thin">
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
                          className="pt-1 flex flex-col items-center"
                        >
                          {!showHint ? (
                            <button
                              type="button"
                              onClick={() => setShowHint(true)}
                              className="text-xs font-bold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            >
                              <Lightbulb className="w-3.5 h-3.5" weight="bold" />
                              <span>تلميح للمساعدة (H)</span>
                            </button>
                          ) : (
                            <div className="w-full p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 text-center animate-in fade-in duration-200 shadow-2xs">
                              <span className="font-bold">💡 تلميح: </span>
                              <span>{getHintText()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Hint */}
                      <div className="w-full pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-[#800020] dark:text-[#FB7185]">
                        <span>اضغط على الكارت لكشف الإجابة والنموذج</span>
                        <kbd className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-300 dark:border-slate-700 shadow-2xs">
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
                      className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-white dark:bg-[#1E293B] border-2 border-[#059669]/40 dark:border-[#059669]/50 shadow-2xl p-5 sm:p-7 flex flex-col justify-between text-right"
                    >
                      {/* Top Header of Back Face */}
                      <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/20 dark:text-[#34D399] border border-[#059669]/30 flex items-center gap-1.5 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-[#059669] dark:bg-[#34D399]" />
                            <span>النموذج المعتمد والدقة</span>
                          </span>
                          {hasTrans && (
                            <TranslationToggle
                              size="xs"
                              isTranslated={showTranslation}
                              onToggle={() => setShowTranslation((prev) => !prev)}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => speakText(currentCard.term, isEnglishTerm)}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-[#059669] transition-colors"
                            title="استمع لنطق المصطلح"
                          >
                            <SpeakerHigh className="w-3.5 h-3.5" weight="bold" />
                          </button>
                          <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185] max-w-[140px] truncate">
                            {currentCard.term}
                          </span>
                        </div>
                      </div>

                      {/* Main Back Content */}
                      <div className="my-auto py-2.5 space-y-2.5">
                        {studyMode === "DEF_TO_TERM" && (
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center animate-in fade-in duration-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                              المصطلح العلمي الصحيح هو:
                            </span>
                            <span className="text-lg sm:text-xl font-black text-emerald-900 dark:text-emerald-200 mt-0.5 inline-block">
                              {currentCard.term}
                            </span>
                          </div>
                        )}

                        <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 max-h-[220px] sm:max-h-[240px] overflow-y-auto scrollbar-thin space-y-3">
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

                      {/* Bottom Evaluation Action Bar */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <p className="text-center text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                          ما مدى دقة استرجاعك للإجابة؟
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {/* BUTTON 1: أتقنته تماماً */}
                          <button
                            type="button"
                            onClick={handleMastered}
                            className="py-3 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                          >
                            <CheckCircle className="w-5 h-5" weight="bold" />
                            <span>أتقنته تماماً</span>
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px]">
                              1
                            </kbd>
                          </button>

                          {/* BUTTON 2: محتاج تثبيت (غلطاتي) */}
                          <button
                            type="button"
                            onClick={handleNeedsReview}
                            className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                          >
                            <WarningCircle className="w-5 h-5" weight="bold" />
                            <span>محتاج تثبيت</span>
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
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-white font-mono text-[10px]">
                      Space
                    </kbd>{" "}
                    قلب الكارت
                  </span>
                  {isFlipped ? (
                    <>
                      <span>•</span>
                      <span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-white font-mono text-[10px]">
                          1
                        </kbd>{" "}
                        أتقنته تماماً
                      </span>
                      <span>•</span>
                      <span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-white font-mono text-[10px]">
                          2
                        </kbd>{" "}
                        محتاج تثبيت
                      </span>
                    </>
                  ) : (
                    <>
                      <span>•</span>
                      <span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-white font-mono text-[10px]">
                          M
                        </kbd>{" "}
                        تبديل النمط
                      </span>
                      <span>•</span>
                      <span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-white font-mono text-[10px]">
                          H
                        </kbd>{" "}
                        تلميح
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
