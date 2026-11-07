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
  onClose?: () => void;
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

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-sm p-3.5 sm:p-4 space-y-2.5 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E8E9ED] dark:border-[#22364F] text-xs font-bold text-[#12263F] dark:text-white">
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-black text-[#12263F] dark:text-white">
            خريطة الأسئلة ({answeredTotal} مُجاب • {questions.length} سؤال)
          </span>
          <div className="hidden sm:flex items-center gap-2.5 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>مُجاب ({answeredTotal})</span>
            </span>
            {flaggedTotal > 0 && (
              <span className="inline-flex items-center gap-1 text-[#D97706] dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                <span>للمراجعة ({flaggedTotal})</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>لم يُجب ({unansweredTotal})</span>
            </span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 dark:bg-[#0D1B2E] text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="إغلاق اللوحة"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" weight="bold" />
          </button>
        )}
      </div>

      {/* Grid of Question Numbers: Compact, responsive sizing to fit comfortably within viewport */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 sm:gap-2 pt-0.5 max-h-[65vh] overflow-y-auto scrollbar-thin">
        {questions.map((q, idx) => {
          const ans = answers[q.id];
          const hasAnswer =
            Boolean(ans?.selectedOptionId) || Boolean(ans?.essayText && ans.essayText.trim().length > 0);
          const flagged = flaggedQuestions[q.id];
          const isActive = idx === currentIndex;

          let btnStyle =
            "bg-[#F7F8FA] dark:bg-[#0D1B2E] border border-[#E8E9ED] dark:border-[#22364F] text-[#12263F] dark:text-slate-300 hover:bg-slate-100";

          if (isActive) {
            btnStyle =
              "bg-[#800020] text-white border-[#800020] font-black shadow-xs ring-2 ring-[#D97706] scale-105 z-10";
          } else if (flagged) {
            btnStyle =
              "bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-100";
          } else if (hasAnswer) {
            btnStyle =
              "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100";
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
                onClose?.();
              }}
              className={`relative h-8 sm:h-8.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${btnStyle}`}
            >
              <span>{idx + 1}</span>
              {!isActive && flagged && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#D97706] text-white flex items-center justify-center">
                  <Flag className="w-1.5 h-1.5" weight="fill" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
