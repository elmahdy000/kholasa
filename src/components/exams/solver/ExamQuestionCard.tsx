"use client";

import { useState, useEffect } from "react";
import {
  Flag,
  CaretRight,
  CaretLeft,
  Sparkle,
  Lightbulb,
  Check,
  X,
  PaperPlaneTilt,
  Translate,
  ChartBar,
  Target,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { FormattedAnswerView } from "@/components/ui/FormattedAnswerView";
import { QuestionImageAttachment } from "@/components/ui/QuestionImageAttachment";
import { Question, UserAnswerState, RevealedAnswer } from "./types";

interface ExamQuestionCardProps {
  currentQ: Question;
  currentIndex: number;
  totalQuestions: number;
  initialMode: "PRACTICE" | "EXAM";
  currentAnswer: UserAnswerState;
  revealedAnswer?: RevealedAnswer;
  isFlagged: boolean;
  isLanguages: boolean;
  isRevealing: boolean;
  onToggleFlag: () => void;
  onSelectOption: (optionId: string) => void;
  onEssayChange: (text: string) => void;
  onRevealPractice: () => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onOpenSubmitModal: () => void;
  onSelectIndex?: (index: number) => void;
}

export function ExamQuestionCard({
  currentQ,
  currentIndex,
  totalQuestions,
  initialMode,
  currentAnswer,
  revealedAnswer,
  isFlagged,
  isLanguages,
  isRevealing,
  onToggleFlag,
  onSelectOption,
  onEssayChange,
  onRevealPractice,
  onPrevQuestion,
  onNextQuestion,
  onOpenSubmitModal,
  onSelectIndex,
}: ExamQuestionCardProps) {
  const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];
  const englishLetters = ["A", "B", "C", "D", "E"];

  const [isQuestionTranslated, setIsQuestionTranslated] = useState(false);
  const [isModelAnswerTranslated, setIsModelAnswerTranslated] = useState(false);

  useEffect(() => {
    setIsQuestionTranslated(false);
    setIsModelAnswerTranslated(false);
  }, [currentQ.id]);

  const rawExplanationReason =
    revealedAnswer?.explanation?.correctReason ||
    (currentQ as any)?.explanation?.correctReason ||
    "";

  // Parse explanation into main explanation and Arabic translation if embedded
  const splitRegex = /\n+\s*(?:الترجمة العربية للتفسير|الترجمة العربية|ترجمة التفسير|<!--\s*translation\s*-->|\[TRANSLATION\]):?\s*/i;
  const match = rawExplanationReason.match(splitRegex);
  const mainExplanation = match && match.index !== undefined ? rawExplanationReason.slice(0, match.index).trim() : rawExplanationReason.trim();
  const arabicExplanation = match && match.index !== undefined ? rawExplanationReason.slice(match.index + match[0].length).trim() : "";

  const isEnglishStatement = !/[\u0600-\u06FF]/.test(currentQ.statement || "");
  const isEnglish = isLanguages && isEnglishStatement;
  const hasTranslation = Boolean(
    isLanguages &&
    ((currentQ.translation && currentQ.translation.trim().length > 0) ||
      currentQ.options?.some((o) => o.translation && o.translation.trim().length > 0) ||
      arabicExplanation.length > 0)
  );

  // Pagination sliding dots (5 dots centered around currentIndex)
  const paginationRange = (() => {
    const total = totalQuestions;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i);
    let start = Math.max(0, currentIndex - 2);
    let end = start + 5;
    if (end > total) {
      end = total;
      start = Math.max(0, end - 5);
    }
    return Array.from({ length: end - start }, (_, i) => start + i);
  })();

  const difficultyText =
    currentQ.difficulty === "EASY"
      ? isEnglish ? "Easy" : "سهل"
      : currentQ.difficulty === "MEDIUM"
      ? isEnglish ? "Medium" : "متوسط"
      : isEnglish ? "Hard" : "صعب";

  return (
    <div className="rounded-3xl sm:rounded-[32px] bg-white dark:bg-[#0D1B2E] border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-8 space-y-6 transition-colors">
      {/* 1. Header Row: Difficulty Pill on Left, Question Pill on Right */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className="flex items-center justify-between gap-3 pb-2"
      >
        {/* Left: Difficulty Pill & Toggles */}
        <div className="flex items-center gap-2">
          {/* Difficulty Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-amber-100/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 text-xs font-black shadow-xs">
            <ChartBar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" weight="fill" />
            <span>{difficultyText}</span>
          </div>

          {/* Translation Toggle Pill */}
          {hasTranslation && (
            <button
              type="button"
              onClick={() => setIsQuestionTranslated((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer select-none ${
                isQuestionTranslated
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600"
              }`}
              title={isQuestionTranslated ? "إخفاء الترجمة" : "عرض الترجمة العربية"}
            >
              <Translate className="w-3.5 h-3.5" weight="bold" />
              <span className="hidden sm:inline">{isQuestionTranslated ? "إخفاء الترجمة" : "ترجمة"}</span>
            </button>
          )}

          {/* Flag Toggle Pill */}
          <button
            type="button"
            onClick={onToggleFlag}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer select-none ${
              isFlagged
                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 hover:border-amber-300"
            }`}
            title={isFlagged ? "إلغاء التعليم للمراجعة" : "تعليم السؤال للمراجعة"}
          >
            <Flag
              className={`w-3.5 h-3.5 ${isFlagged ? "fill-current" : ""}`}
              weight={isFlagged ? "fill" : "bold"}
            />
            <span className="hidden sm:inline">
              {isFlagged ? (isEnglish ? "Flagged" : "متعلّم") : (isEnglish ? "Flag" : "مراجعة")}
            </span>
          </button>
        </div>

        {/* Right: Question Number Badge (Navy Pill + Golden Circle) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B2545] dark:bg-[#1E3A8A] text-white shadow-xs">
          <span className="text-xs font-black">{isEnglish ? "Question" : "سؤال"}</span>
          <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
            {currentIndex + 1}
          </span>
        </div>
      </div>

      {/* 2. Question Statement */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className={`space-y-3 pt-1 ${isEnglish ? "text-left" : "text-right"}`}
      >
        <div className={`text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed ${
          isEnglish ? "font-sans" : "font-content"
        }`}>
          <BidiStatement as="h2" text={currentQ.statement} />
        </div>

        <QuestionImageAttachment imageUrl={currentQ.imageUrl} />

        {isQuestionTranslated && currentQ.translation && (
          <div
            className="p-3.5 rounded-2xl bg-blue-50/40 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 text-right animate-in fade-in duration-200 space-y-1"
            dir="rtl"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
              <Translate className="w-3.5 h-3.5" weight="bold" />
              <span>الترجمة العربية للسؤال:</span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-content">
              {currentQ.translation}
            </p>
          </div>
        )}
      </div>

      {/* 3. Decorative Divider: ———— (?) ———— */}
      <div className="relative flex items-center justify-center my-4 py-1">
        <div className="w-full border-t border-amber-200/70 dark:border-slate-800" />
        <div className="absolute px-3 bg-white dark:bg-[#0D1B2E]">
          <span className="w-6 h-6 rounded-full border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-black flex items-center justify-center shadow-xs">
            ?
          </span>
        </div>
      </div>

      {/* 4. Options List (True/False or MCQ) */}
      {(currentQ.type === "MCQ" || currentQ.type === "TRUE_FALSE") && (
        <div className="space-y-3">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = currentAnswer.selectedOptionId === opt.id;
            const isRevealed =
              initialMode === "PRACTICE" && currentAnswer.practiceRevealed;
            const isOptionCorrect =
              revealedAnswer?.options?.find((o) => o.id === opt.id)?.isCorrect === true;

            const isEnglishOpt = isEnglish || !/[\u0600-\u06FF]/.test(opt.text || "");
            const letter = isEnglishOpt
              ? englishLetters[optIdx] || opt.order
              : arabicLetters[optIdx] || opt.order;

            // Option states matching mock-up
            let cardContainerClass =
              "border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 hover:border-slate-300";
            let leftIndicator = (
              <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0" />
            );
            let rightBadgeClass =
              "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700";

            if (isSelected) {
              cardContainerClass =
                "border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-xs";
              leftIndicator = (
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Check className="w-3.5 h-3.5" weight="bold" />
                </div>
              );
              rightBadgeClass = "bg-emerald-500 text-white shadow-xs font-bold";
            }

            if (isRevealed) {
              if (isOptionCorrect) {
                cardContainerClass =
                  "border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs";
                leftIndicator = (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Check className="w-3.5 h-3.5" weight="bold" />
                  </div>
                );
                rightBadgeClass = "bg-emerald-500 text-white shadow-xs font-bold";
              } else if (isSelected && !isOptionCorrect) {
                cardContainerClass =
                  "border-2 border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 shadow-xs";
                leftIndicator = (
                  <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <X className="w-3.5 h-3.5" weight="bold" />
                  </div>
                );
                rightBadgeClass = "bg-rose-500 text-white shadow-xs font-bold";
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                dir={isEnglishOpt ? "ltr" : "rtl"}
                onClick={() => onSelectOption(opt.id)}
                className={`w-full p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 text-left sm:text-right ${cardContainerClass}`}
              >
                {/* Left: Radio / Checkmark Icon */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {leftIndicator}

                  {/* Middle: Option Text */}
                  <div className={`min-w-0 flex-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed ${
                    isEnglishOpt ? "text-left font-sans" : "text-right font-content"
                  }`}>
                    <BidiStatement as="span" text={opt.text} />

                    {isQuestionTranslated && opt.translation && (
                      <div
                        className="mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-right text-xs text-slate-600 dark:text-slate-300 font-medium font-content animate-in fade-in duration-150"
                        dir="rtl"
                      >
                        <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">الترجمة:</span>
                        <span>{opt.translation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Letter Badge (A, B, C, D) */}
                <div
                  className={`w-8 h-8 rounded-xl font-mono font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 transition-transform ${rightBadgeClass}`}
                >
                  {letter}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Essay Question Area (if applicable) */}
      {currentQ.type === "ESSAY" && (
        <div className="space-y-4">
          <label
            className={`block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 ${
              isEnglish ? "text-left font-sans" : "text-right font-content"
            }`}
          >
            {isEnglish ? "Write your detailed answer here:" : "اكتب إجابتك هنا بالتفصيل:"}
          </label>
          <textarea
            value={currentAnswer.essayText || ""}
            onChange={(e) => onEssayChange(e.target.value)}
            dir={isEnglish ? "ltr" : "rtl"}
            placeholder={
              isEnglish
                ? "Write your solution steps and explanation here..."
                : "اكتب خطوات الحل وشرحك هنا بالتفصيل..."
            }
            rows={5}
            className={`w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2545] text-slate-900 dark:text-white leading-relaxed ${
              isEnglish ? "text-left font-sans" : "text-right font-content"
            }`}
          />
        </div>
      )}

      {/* 5. Practice Mode: Reveal Button or Explanation Box */}
      {initialMode === "PRACTICE" && (
        <div className="pt-1">
          {!currentAnswer.practiceRevealed ? (
            <button
              type="button"
              onClick={onRevealPractice}
              disabled={
                isRevealing ||
                (!currentAnswer.selectedOptionId && !currentAnswer.essayText)
              }
              className="h-12 px-6 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs hover:shadow transition-all active:scale-98 disabled:opacity-40 cursor-pointer select-none"
            >
              <Lightbulb className="w-4 h-4 text-slate-950" weight="fill" />
              <span>
                {isRevealing
                  ? "بنراجع إجابتك..."
                  : "تحقق من إجابتك وشاهد التفسير الفوري"}
              </span>
            </button>
          ) : (
            mainExplanation && (
              <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/20 dark:bg-slate-900/60 p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
                {/* Header Dual Pill: Bulb Icon + Explanation + التفسير */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs shrink-0">
                    <Lightbulb className="w-4 h-4" weight="fill" />
                  </div>
                  <div className="inline-flex items-center rounded-full overflow-hidden shadow-xs border border-[#0B2545]/20">
                    <span className="px-3.5 py-1 bg-[#0B2545] dark:bg-[#1E3A8A] text-white text-xs font-black">
                      Explanation
                    </span>
                    <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black">
                      التفسير
                    </span>
                  </div>
                </div>

                {/* Main Explanation Text */}
                <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed font-sans text-left" dir="ltr">
                  {mainExplanation}
                </p>

                {/* Arabic Translation Box */}
                {arabicExplanation && (
                  <div
                    className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right space-y-1.5"
                    dir="rtl"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                      <Translate className="w-4 h-4" weight="bold" />
                      <span>الترجمة العربية:</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-content">
                      {arabicExplanation}
                    </p>
                  </div>
                )}

                {/* Concept Pill at Bottom */}
                {revealedAnswer?.explanation?.concept && (
                  <div className="pt-1">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80 text-xs font-bold shadow-xs">
                      <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" weight="bold" />
                      <span dir="auto">Concept: {revealedAnswer.explanation.concept}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* 6. Navigation Bottom Row (Previous, Pagination Dots, Next / Submit) */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {/* Left: Previous Button */}
        <button
          type="button"
          onClick={onPrevQuestion}
          disabled={currentIndex === 0}
          className="h-11 sm:h-12 px-4 sm:px-6 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer select-none"
        >
          <CaretLeft className="w-4 h-4" weight="bold" />
          <span>السؤال السابق</span>
        </button>

        {/* Center: Pagination Dots */}
        <div className="hidden sm:flex items-center gap-2">
          {paginationRange.map((dotIdx) => {
            const isActive = dotIdx === currentIndex;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={() => onSelectIndex?.(dotIdx)}
                className={`transition-all rounded-full ${
                  isActive
                    ? "w-3 h-3 bg-amber-400 scale-125 shadow-xs"
                    : "w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                }`}
                title={`انتقال للسؤال ${dotIdx + 1}`}
              />
            );
          })}
        </div>

        {/* Right: Next Question or Submit Exam */}
        {currentIndex < totalQuestions - 1 ? (
          <button
            type="button"
            onClick={onNextQuestion}
            className="h-11 sm:h-12 px-5 sm:px-7 rounded-full bg-[#0B2545] hover:bg-[#07192F] dark:bg-[#1E3A8A] dark:hover:bg-[#1E40AF] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95"
          >
            <span>السؤال التالي</span>
            <CaretRight className="w-4 h-4" weight="bold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="h-11 sm:h-12 px-5 sm:px-7 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95"
          >
            <span>تسليم الامتحان</span>
            <PaperPlaneTilt className="w-4 h-4" weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}
