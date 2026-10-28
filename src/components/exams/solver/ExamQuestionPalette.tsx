"use client";

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
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {questions.map((q, idx) => {
          const ans = answers[q.id];
          const hasAnswer =
            Boolean(ans?.selectedOptionId) || Boolean(ans?.essayText && ans.essayText.trim().length > 0);
          const flagged = flaggedQuestions[q.id];
          const isActive = idx === currentIndex;

          let dotStyle =
            "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:border-[#E2E8F0]";
          if (isActive) {
            dotStyle =
              "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] text-[#800020] dark:text-[#FB7185] font-bold";
          } else if (flagged) {
            dotStyle =
              "bg-[#D97706]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#FBBF24] text-[#D97706] font-bold";
          } else if (hasAnswer) {
            dotStyle =
              "bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399] text-[#059669] font-bold";
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`w-11 h-11 rounded-xl border text-[13px] font-mono flex items-center justify-center transition-all cursor-pointer ${dotStyle}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
