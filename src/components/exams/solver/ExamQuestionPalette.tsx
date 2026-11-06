"use client";

import { useRef, useEffect } from "react";
import { Question, UserAnswerState } from "./types";

interface ExamQuestionPaletteProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, UserAnswerState>;
  flaggedQuestions: Record<string, boolean>;
  onSelectIndex: (index: number) => void;
}

export function ExamQuestionPalette({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectIndex,
}: ExamQuestionPaletteProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Smoothly center the active question bubble into view whenever student navigates
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

  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-3">
      {/* Micro-Header & Legend */}
      <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] pb-2 border-b border-[#E2E8F0] dark:border-[#334155]/60">
        <span className="font-bold text-[#0F172A] dark:text-white">
          لوحة الأسئلة ({answeredTotal} من {questions.length} مُجاب)
        </span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#059669] dark:text-[#34D399]">
            <span className="w-2 h-2 rounded-full bg-[#059669] dark:bg-[#34D399]" />
            <span>مُجاب</span>
          </span>
          {flaggedTotal > 0 && (
            <span className="flex items-center gap-1.5 text-[#D97706] dark:text-[#FBBF24]">
              <span className="w-2 h-2 rounded-full bg-[#D97706] dark:bg-[#FBBF24]" />
              <span>للمراجعة ({flaggedTotal})</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[#64748B] dark:text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#E2E8F0] dark:bg-[#334155]" />
            <span>لم يُجب</span>
          </span>
        </div>
      </div>

      {/* Horizontally scrolling question numbers */}
      <div className="overflow-x-auto scrollbar-none py-0.5">
        <div className="flex items-center gap-2 min-w-max">
          {questions.map((q, idx) => {
            const ans = answers[q.id];
            const hasAnswer =
              Boolean(ans?.selectedOptionId) || Boolean(ans?.essayText && ans.essayText.trim().length > 0);
            const flagged = flaggedQuestions[q.id];
            const isActive = idx === currentIndex;

            let dotStyle =
              "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:border-[#800020]/40";
            if (isActive) {
              dotStyle =
                "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] dark:border-[#FB7185] text-[#800020] dark:text-[#FB7185] font-bold shadow-xs scale-105";
            } else if (flagged) {
              dotStyle =
                "bg-[#D97706]/10 dark:bg-[#1E293B] border border-[#D97706] dark:border-[#FBBF24] text-[#D97706] dark:text-[#FBBF24] font-bold";
            } else if (hasAnswer) {
              dotStyle =
                "bg-[#059669]/10 dark:bg-[#1E293B] border border-[#059669] dark:border-[#34D399] text-[#059669] dark:text-[#34D399] font-bold";
            }

            return (
              <button
                key={q.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-[13px] font-mono flex items-center justify-center transition-all cursor-pointer active:scale-95 ${dotStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
