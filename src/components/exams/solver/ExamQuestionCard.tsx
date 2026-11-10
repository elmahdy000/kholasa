"use client";

import { useState, useEffect } from "react";
import {
  Flag,
  CaretRight,
  CaretLeft,
  PaperPlaneTilt,
  Translate,
  Check,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { QuestionImageAttachment } from "@/components/ui/QuestionImageAttachment";
import { Question, UserAnswerState } from "./types";

interface ExamQuestionCardProps {
  currentQ: Question;
  currentIndex: number;
  totalQuestions: number;
  currentAnswer: UserAnswerState;
  isFlagged: boolean;
  isLanguages: boolean;
  onToggleFlag: () => void;
  onSelectOption: (optionId: string) => void;
  onEssayChange: (text: string) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onOpenSubmitModal: () => void;
  onSelectIndex?: (index: number) => void;
}

export function ExamQuestionCard({
  currentQ,
  currentIndex,
  totalQuestions,
  currentAnswer,
  isFlagged,
  isLanguages,
  onToggleFlag,
  onSelectOption,
  onEssayChange,
  onPrevQuestion,
  onNextQuestion,
  onOpenSubmitModal,
  onSelectIndex,
}: ExamQuestionCardProps) {
  const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];
  const englishLetters = ["A", "B", "C", "D", "E"];

  const [isQuestionTranslated, setIsQuestionTranslated] = useState(false);

  useEffect(() => {
    setIsQuestionTranslated(false);
  }, [currentQ.id]);

  const isEnglishStatement = !/[\u0600-\u06FF]/.test(currentQ.statement || "");
  const isEnglish = isLanguages && isEnglishStatement;
  const hasTranslation = Boolean(
    isLanguages &&
    ((currentQ.translation && currentQ.translation.trim().length > 0) ||
      currentQ.options?.some((o) => o.translation && o.translation.trim().length > 0))
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
    <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-sm p-3.5 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4 transition-colors">
      {/* 1. Header Row: Difficulty & Toggles on one side, Question Pill on the other */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className="flex items-center justify-between gap-2.5 pb-1"
      >
        {/* Difficulty Pill & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Translation Toggle Pill (for Languages questions) */}
          {hasTranslation && (
            <button
              type="button"
              onClick={() => setIsQuestionTranslated((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
                isQuestionTranslated
                  ? "bg-[#800B34]/10 text-[#800B34] dark:bg-[#800B34]/20 dark:text-[#FB7185] border-[#800B34]/30 shadow-xs"
                  : "bg-white dark:bg-[#10233A] text-[#64748B] dark:text-[#94A3B8] border-[#E8E9ED] dark:border-[#22364F] hover:border-[#800B34]/30 hover:text-[#800B34]"
              }`}
              title={isQuestionTranslated ? "إخفاء الترجمة" : "عرض الترجمة العربية"}
            >
              <Translate className="w-3 h-3 sm:w-3.5 sm:h-3.5" weight="bold" />
              <span className="hidden sm:inline">{isQuestionTranslated ? "إخفاء الترجمة" : "ترجمة"}</span>
            </button>
          )}

          {/* Flag Toggle Pill */}
          <button
            type="button"
            onClick={onToggleFlag}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
              isFlagged
                ? "bg-[#D97706] hover:bg-[#B45309] text-white border-[#D97706] shadow-xs"
                : "bg-white dark:bg-[#10233A] border-[#E8E9ED] dark:border-[#22364F] text-[#64748B] dark:text-[#94A3B8] hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-[#D97706] hover:border-amber-300"
            }`}
            title={isFlagged ? "إلغاء التعليم للمراجعة" : "تعليم السؤال للمراجعة"}
          >
            <Flag
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFlagged ? "fill-current" : ""}`}
              weight={isFlagged ? "fill" : "bold"}
            />
            <span className="hidden sm:inline">
              {isFlagged ? (isEnglish ? "Flagged" : "متعلّم") : (isEnglish ? "Flag" : "مراجعة")}
            </span>
          </button>
        </div>

        {/* Question Type & Difficulty Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#091B40] dark:text-slate-300 text-[11px] sm:text-xs font-bold border border-slate-200/80 dark:border-slate-700/80">
            {difficultyText}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80 text-[11px] sm:text-xs font-mono font-bold">
            #{currentIndex + 1}
          </span>
        </div>
      </div>

      {/* 2. Main Question Statement */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className={`pt-1 space-y-2.5 ${isEnglish ? "text-left font-sans" : "text-right font-content"}`}
      >
        <BidiStatement
          as="h2"
          text={currentQ.statement}
          className="text-sm sm:text-base md:text-lg font-bold text-[#091B40] dark:text-white leading-relaxed select-text"
        />

        {/* Translation if enabled */}
        {isQuestionTranslated && currentQ.translation && (
          <div
            dir="rtl"
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-right animate-in fade-in duration-200 font-content"
          >
            <span className="text-[11px] font-bold text-slate-400 block mb-1">
              الترجمة إلى العربية:
            </span>
            <BidiStatement as="p" text={currentQ.translation} />
          </div>
        )}

        <QuestionImageAttachment imageUrl={currentQ.imageUrl} />
      </div>

      {/* 3. Divider with Question Mark Badge */}
      <div className="relative flex items-center justify-center my-2 sm:my-2.5 py-0.5">
        <div className="w-full border-t border-[#E8E9ED] dark:border-[#22364F]" />
        <div className="absolute px-2.5 bg-white dark:bg-[#10233A]">
          <span className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border border-[#D97706]/40 bg-[#D97706]/10 text-[#D97706] text-[11px] sm:text-xs font-black flex items-center justify-center shadow-xs">
            ?
          </span>
        </div>
      </div>

      {/* 4. Options List (True/False or MCQ) */}
      {(currentQ.type === "MCQ" || currentQ.type === "TRUE_FALSE") && (
        <div className="space-y-2 sm:space-y-2.5">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = currentAnswer.selectedOptionId === opt.id;

            const isEnglishOpt = isEnglish;
            const letter = isEnglishOpt
              ? englishLetters[optIdx] || opt.order
              : arabicLetters[optIdx] || opt.order;

            let cardContainerClass =
              "border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10233A] hover:bg-slate-50 dark:hover:bg-[#132945] hover:border-slate-300";
            let leftIndicator = (
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0" />
            );
            let rightBadgeClass =
              "bg-slate-100 dark:bg-[#0D1B2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800";

            if (isSelected) {
              cardContainerClass =
                "border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-xs";
              leftIndicator = (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-3.5 h-3.5" weight="bold" />
                </div>
              );
              rightBadgeClass = "bg-emerald-600 text-white shadow-xs font-bold";
            }

            return (
              <button
                key={opt.id}
                type="button"
                dir={isEnglishOpt ? "ltr" : "rtl"}
                onClick={() => onSelectOption(opt.id)}
                className={`w-full min-h-[48px] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 text-left sm:text-right active:scale-[0.99] ${cardContainerClass}`}
              >
                {/* Left: Radio Indicator */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {leftIndicator}

                  {/* Middle: Option Text */}
                  <div className={`min-w-0 flex-1 text-xs sm:text-sm md:text-base font-bold text-[#091B40] dark:text-white leading-relaxed ${
                    isEnglishOpt ? "text-left font-sans" : "text-right font-content"
                  }`}>
                    <BidiStatement as="span" text={opt.text} />

                    {isQuestionTranslated && opt.translation && (
                      <div
                        className="mt-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-right text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium font-content animate-in fade-in duration-150"
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
                  className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg sm:rounded-xl ${
                    isEnglishOpt ? "font-mono" : "font-sans"
                  } font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 transition-transform ${rightBadgeClass}`}
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
        <div className="space-y-3">
          <label
            className={`block text-xs sm:text-sm font-bold text-[#091B40] dark:text-slate-300 ${
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
            rows={4}
            className={`w-full p-3 sm:p-3.5 rounded-xl border border-[#E8E9ED] dark:border-[#22364F] bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#800B34] text-[#091B40] dark:text-white leading-relaxed ${
              isEnglish ? "text-left font-sans" : "text-right font-content"
            }`}
          />
        </div>
      )}

      {/* 5. Navigation Bottom Row with Responsive Buttons */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className="flex items-center justify-between gap-2.5 sm:gap-3 pt-3.5 sm:pt-4 border-t border-[#E8E9ED] dark:border-[#22364F]"
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={onPrevQuestion}
          disabled={currentIndex === 0}
          className="flex-1 sm:flex-initial min-h-[44px] h-11 px-4 sm:px-6 rounded-xl sm:rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10233A] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#091B40] dark:text-white disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer select-none active:scale-95"
        >
          {isEnglish ? (
            <CaretLeft className="w-4 h-4 text-[#091B40] dark:text-white" weight="bold" />
          ) : (
            <CaretRight className="w-4 h-4 text-[#091B40] dark:text-white" weight="bold" />
          )}
          <span>{isEnglish ? "Previous" : "السابق"}</span>
        </button>

        {/* Center: Pagination Dots (Amber Active Dot) */}
        <div className="hidden sm:flex items-center gap-1.5">
          {paginationRange.map((dotIdx) => {
            const isActive = dotIdx === currentIndex;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={() => onSelectIndex?.(dotIdx)}
                className={`transition-all rounded-full ${
                  isActive
                    ? "w-2.5 h-2.5 bg-[#D97706] scale-125 shadow-xs"
                    : "w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                }`}
                title={`انتقال للسؤال ${dotIdx + 1}`}
              />
            );
          })}
        </div>

        {/* Next Question / Early Submit Option */}
        {currentIndex < totalQuestions - 1 ? (
          <div className="flex-1 sm:flex-initial flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSubmitModal}
              className="hidden sm:flex min-h-[44px] h-11 px-3 sm:px-4 rounded-xl sm:rounded-full border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-2xs items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
              title="تسليم الامتحان وإنهاء المحاولة"
            >
              <PaperPlaneTilt className="w-3.5 h-3.5 text-[#D97706]" weight="bold" />
              <span>{isEnglish ? "Submit" : "تسليم الامتحان"}</span>
            </button>
            <button
              type="button"
              onClick={onNextQuestion}
              className="flex-1 sm:flex-initial min-h-[44px] h-11 px-4 sm:px-6 rounded-xl sm:rounded-full bg-[#091B40] hover:bg-[#071737] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer select-none active:scale-95"
            >
              <span>{isEnglish ? "Next" : "التالي"}</span>
              {isEnglish ? (
                <CaretRight className="w-4 h-4 text-white" weight="bold" />
              ) : (
                <CaretLeft className="w-4 h-4 text-white" weight="bold" />
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="flex-1 sm:flex-initial min-h-[44px] h-11 px-5 sm:px-7 rounded-xl sm:rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-95"
          >
            <span>{isEnglish ? "Submit Exam" : "تسليم الامتحان"}</span>
            <PaperPlaneTilt className="w-4 h-4 text-white" weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}
