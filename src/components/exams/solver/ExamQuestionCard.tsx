"use client";

import { useState, useEffect } from "react";
import {
  Flag,
  CaretRight,
  CaretLeft,
  PaperPlaneTilt,
  Translate,
  ChartBar,
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
          {/* Difficulty Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 text-[11px] sm:text-xs font-black shadow-xs">
            <ChartBar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D97706]" weight="fill" />
            <span>{difficultyText}</span>
          </div>

          {/* Translation Toggle Pill (for Languages questions) */}
          {hasTranslation && (
            <button
              type="button"
              onClick={() => setIsQuestionTranslated((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none ${
                isQuestionTranslated
                  ? "bg-[#800020]/10 text-[#800020] dark:bg-[#A30D36]/20 dark:text-[#FB7185] border-[#800020]/30 shadow-xs"
                  : "bg-white dark:bg-[#10233A] text-[#64748B] dark:text-[#94A3B8] border-[#E8E9ED] dark:border-[#22364F] hover:border-[#800020]/30 hover:text-[#800020]"
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
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border text-[11px] sm:text-xs font-bold transition-all cursor-pointer select-none ${
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

        {/* Question Number Badge (Navy Pill + Golden Circle) */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12263F] dark:bg-[#10233A] text-white shadow-xs border border-slate-700/40">
          <span className="text-[11px] sm:text-xs font-black">{isEnglish ? "Question" : "سؤال"}</span>
          <span className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#D97706] text-white font-black text-[11px] sm:text-xs flex items-center justify-center shadow-xs">
            {currentIndex + 1}
          </span>
        </div>
      </div>

      {/* 2. Question Statement */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className={`space-y-2 pt-0.5 ${isEnglish ? "text-left" : "text-right"}`}
      >
        <div className={`text-sm sm:text-base md:text-lg font-black text-[#12263F] dark:text-white leading-relaxed ${
          isEnglish ? "font-sans" : "font-content"
        }`}>
          <BidiStatement as="h2" text={currentQ.statement} />
        </div>

        <QuestionImageAttachment imageUrl={currentQ.imageUrl} />

        {isQuestionTranslated && currentQ.translation && (
          <div
            className="p-3 rounded-xl bg-amber-50/40 dark:bg-slate-800/60 border border-amber-200/70 dark:border-slate-700 text-right animate-in fade-in duration-200 space-y-1"
            dir="rtl"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706]">
              <Translate className="w-3.5 h-3.5" weight="bold" />
              <span>الترجمة العربية للسؤال:</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-content">
              {currentQ.translation}
            </p>
          </div>
        )}
      </div>

      {/* 3. Decorative Divider: ———— (?) ———— */}
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

            const isEnglishOpt = isEnglish || !/[\u0600-\u06FF]/.test(opt.text || "");
            const letter = isEnglishOpt
              ? englishLetters[optIdx] || opt.order
              : arabicLetters[optIdx] || opt.order;

            // Brand states: Emerald Green for selected (matching Mockup Image 3), neutral for unselected
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
                className={`w-full p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 text-left sm:text-right ${cardContainerClass}`}
              >
                {/* Left: Radio Indicator */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {leftIndicator}

                  {/* Middle: Option Text */}
                  <div className={`min-w-0 flex-1 text-xs sm:text-sm md:text-base font-bold text-[#12263F] dark:text-white leading-relaxed ${
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
                  className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg sm:rounded-xl font-mono font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 transition-transform ${rightBadgeClass}`}
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
            className={`block text-xs sm:text-sm font-bold text-[#12263F] dark:text-slate-300 ${
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
            className={`w-full p-3 sm:p-3.5 rounded-xl border border-[#E8E9ED] dark:border-[#22364F] bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#800020] text-[#12263F] dark:text-white leading-relaxed ${
              isEnglish ? "text-left font-sans" : "text-right font-content"
            }`}
          />
        </div>
      )}

      {/* 5. Navigation Bottom Row with CORRECT Arrow Directions */}
      <div className="flex items-center justify-between gap-3 pt-3.5 sm:pt-4 border-t border-[#E8E9ED] dark:border-[#22364F]">
        {/* Previous Button: White pill button with border & left chevron (Image 3) */}
        <button
          type="button"
          onClick={onPrevQuestion}
          disabled={currentIndex === 0}
          className="h-10 sm:h-11 px-5 sm:px-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10233A] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#12263F] dark:text-white disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95"
        >
          <CaretLeft className="w-4 h-4 text-[#12263F] dark:text-white" weight="bold" />
          <span>{isEnglish ? "Previous Question" : "السؤال السابق"}</span>
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

        {/* Next Question: Solid Navy Pill Button with right chevron (Image 3) */}
        {currentIndex < totalQuestions - 1 ? (
          <button
            type="button"
            onClick={onNextQuestion}
            className="h-10 sm:h-11 px-6 sm:px-7 rounded-full bg-[#12263F] hover:bg-[#0D1B2E] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95"
          >
            <span>{isEnglish ? "Next Question" : "السؤال التالي"}</span>
            <CaretRight className="w-4 h-4 text-white" weight="bold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="h-10 sm:h-11 px-6 sm:px-7 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95"
          >
            <span>{isEnglish ? "Submit Exam" : "تسليم الامتحان"}</span>
            <PaperPlaneTilt className="w-4 h-4 text-white" weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}
