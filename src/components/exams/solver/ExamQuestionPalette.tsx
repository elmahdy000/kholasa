"use client";

import { useRef, useEffect } from "react";
import { Flag, X } from "@phosphor-icons/react";
import { Question, UserAnswerState } from "./types";

interface ExamQuestionPaletteProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, UserAnswerState>;
  flaggedQuestions: Record<string, boolean>;
  onSelectIndex: (index: number) => void;
  onClose: () => void;
}

export function ExamQuestionPalette({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectIndex,
  onClose,
}: ExamQuestionPaletteProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current[currentIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentIndex]);

  const answeredTotal = questions.filter((q) => {
    const ans = answers[q.id];
    return Boolean(ans?.selectedOptionId) || Boolean(ans?.essayText && ans.essayText.trim().length > 0);
  }).length;

  const flaggedTotal = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredTotal = questions.length - answeredTotal;

  const firstUnansweredIndex = questions.findIndex((q) => {
    const ans = answers[q.id];
    return !Boolean(ans?.selectedOptionId) && !Boolean(ans?.essayText && ans.essayText.trim().length > 0);
  });

  const firstFlaggedIndex = questions.findIndex((q) => flaggedQuestions[q.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card (Matches Image 4) */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-2xl p-5 sm:p-6 space-y-4 z-10 animate-in zoom-in-95 duration-200">
        {/* Header Row: Title on right, Close 'X' on left (in RTL) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E9ED] dark:border-[#22364F]">
          <h3 className="text-sm sm:text-base font-black text-[#12263F] dark:text-white">
            خريطة الأسئلة ({answeredTotal} مُجاب • {questions.length} سؤال)
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="إغلاق خريطة الأسئلة"
          >
            <X className="w-4 h-4" weight="bold" />
          </button>
        </div>

        {/* Quick jump actions for fast navigation */}
        {(firstUnansweredIndex !== -1 || firstFlaggedIndex !== -1) && (
          <div className="flex items-center gap-2 flex-wrap">
            {firstUnansweredIndex !== -1 && (
              <button
                type="button"
                onClick={() => {
                  onSelectIndex(firstUnansweredIndex);
                  onClose();
                }}
                className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>الانتقال لأول سؤال غير مُجاب (#{firstUnansweredIndex + 1})</span>
              </button>
            )}

            {firstFlaggedIndex !== -1 && (
              <button
                type="button"
                onClick={() => {
                  onSelectIndex(firstFlaggedIndex);
                  onClose();
                }}
                className="h-8 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5 text-[#D97706]" weight="fill" />
                <span>مراجعة الأسئلة المؤجلة (#{firstFlaggedIndex + 1})</span>
              </button>
            )}
          </div>
        )}

        {/* 6-Column Grid of Question Numbers (Matches Image 4 Exactly) */}
        <div className="grid grid-cols-6 gap-2 sm:gap-2.5 max-h-[55vh] overflow-y-auto p-1 scrollbar-thin">
          {questions.map((q, idx) => {
            const ans = answers[q.id];
            const hasAnswer =
              Boolean(ans?.selectedOptionId) || Boolean(ans?.essayText && ans.essayText.trim().length > 0);
            const flagged = flaggedQuestions[q.id];
            const isActive = idx === currentIndex;

            // Default: Light grayish-white button (Unanswered)
            let btnStyle =
              "bg-[#F7F8FA] dark:bg-[#0D1B2E] border border-[#E8E9ED] dark:border-[#22364F] text-[#12263F] dark:text-slate-300 hover:bg-slate-100";

            if (isActive) {
              // Current Active Question: Deep burgundy with golden amber border & ring (Image 4 button 2)
              btnStyle =
                "bg-[#800020] text-white border-2 border-[#D97706] font-black shadow-md ring-2 ring-[#D97706]/50 scale-105 z-10";
            } else if (flagged) {
              // Flagged: Light warm cream with orange flag pin (Image 4 button 1)
              btnStyle =
                "bg-[#FEF9C3] dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold hover:bg-amber-100";
            } else if (hasAnswer) {
              // Answered: Soft emerald / slate tint
              btnStyle =
                "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-100";
            }

            return (
              <button
                key={q.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => {
                  onSelectIndex(idx);
                  onClose();
                }}
                className={`relative h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${btnStyle}`}
              >
                <span>{idx + 1}</span>
                {!isActive && flagged && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D97706] text-white flex items-center justify-center shadow-xs">
                    <Flag className="w-2 h-2" weight="fill" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend Row */}
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-[#E8E9ED] dark:border-[#22364F] text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>مُجاب ({answeredTotal})</span>
          </span>
          {flaggedTotal > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[#D97706] dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
              <span>للمراجعة ({flaggedTotal})</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>لم يُجب ({unansweredTotal})</span>
          </span>
        </div>
      </div>
    </div>
  );
}
