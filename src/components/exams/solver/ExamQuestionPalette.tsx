"use client";

import { useRef, useEffect } from "react";
import { Check, Flag } from "@phosphor-icons/react";
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

  // Smoothly center active question button into view
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
  const progressPct = questions.length > 0 ? Math.round((answeredTotal / questions.length) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3.5 transition-colors">
      {/* Micro-Header, Progress & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>لوحة الأسئلة</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ({answeredTotal} من {questions.length} مُجاب • {progressPct}%)
            </span>
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>مُجاب ({answeredTotal})</span>
          </span>

          {flaggedTotal > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>للمراجعة ({flaggedTotal})</span>
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>لم يُجب ({unansweredTotal})</span>
          </span>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Horizontally scrolling question numbers */}
      <div className="overflow-x-auto scrollbar-none py-1 -my-1">
        <div className="flex items-center gap-2 min-w-max px-0.5">
          {questions.map((q, idx) => {
            const ans = answers[q.id];
            const hasAnswer =
              Boolean(ans?.selectedOptionId) || Boolean(ans?.essayText && ans.essayText.trim().length > 0);
            const flagged = flaggedQuestions[q.id];
            const isActive = idx === currentIndex;

            let buttonClass = "";
            if (isActive) {
              // Current active question: bold solid brand color with ring
              buttonClass =
                "bg-[#800020] text-white font-extrabold shadow-sm ring-2 ring-offset-2 ring-[#800020] dark:ring-offset-[#0F172A] scale-105 z-10";
            } else if (flagged) {
              // Flagged for review
              buttonClass =
                "bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-100";
            } else if (hasAnswer) {
              // Answered
              buttonClass =
                "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100";
            } else {
              // Unanswered
              buttonClass =
                "bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900";
            }

            return (
              <button
                key={q.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-xs sm:text-sm font-mono flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none ${buttonClass}`}
                aria-label={`الانتقال للسؤال رقم ${idx + 1}`}
              >
                <span>{idx + 1}</span>

                {/* Micro indicators */}
                {!isActive && flagged && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Flag className="w-2 h-2" weight="fill" />
                  </span>
                )}
                {!isActive && !flagged && hasAnswer && (
                  <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
