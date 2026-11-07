"use client";

import { Clock, PaperPlaneTilt, Sparkle, HourglassMedium } from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface ExamSolverHeaderProps {
  subjectName: string;
  examTitle: string;
  initialMode: "PRACTICE" | "EXAM";
  minutes: number;
  seconds: number;
  isUrgent: boolean;
  onOpenSubmitModal: () => void;
}

export function ExamSolverHeader({
  subjectName,
  examTitle,
  initialMode,
  minutes,
  seconds,
  isUrgent,
  onOpenSubmitModal,
}: ExamSolverHeaderProps) {
  // Extract trailing question count parenthetical (e.g. "(30 سؤال)" or "(30 Questions)")
  // to prevent Arabic/English BiDi mixing that flips parentheses
  const countMatch = examTitle.match(/\s*\(([^)]+)\)\s*$/);
  const coreTitle = countMatch ? examTitle.replace(/\s*\(([^)]+)\)\s*$/, "").trim() : examTitle;
  const countLabel = countMatch ? countMatch[1].trim() : null;

  const isPractice = initialMode === "PRACTICE";

  return (
    <header className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-xs p-4 sm:p-5 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Metadata badges & Exam Title */}
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Pill */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/25 dark:text-[#FB7185] border border-[#800020]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#800020] dark:bg-[#FB7185]" />
              <bdi>{subjectName}</bdi>
            </span>

            {/* Mode Pill */}
            {isPractice ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" weight="fill" />
                <span>وضع التدريب (شرح فوري وتصحيح)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <HourglassMedium className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" weight="bold" />
                <span>وضع الامتحان (وقت حقيقي)</span>
              </span>
            )}

            {/* Question count pill if extracted from title */}
            {countLabel && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <bdi>{countLabel}</bdi>
              </span>
            )}
          </div>

          {/* Clean Isolated Title */}
          <div className="pt-0.5">
            <BidiStatement
              as="h1"
              text={coreTitle}
              className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white leading-snug break-words"
            />
          </div>
        </div>

        {/* Right: Timer & Submit Action */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          {/* Digital Timer */}
          <div
            className={`px-3.5 py-2 rounded-xl border flex items-center gap-2.5 transition-all ${
              isUrgent
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-pulse shadow-xs"
                : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            }`}
            title="الوقت المتبقي"
          >
            <Clock
              className={`w-4 h-4 ${isUrgent ? "text-rose-600 dark:text-rose-400" : "text-[#800020] dark:text-[#FB7185]"}`}
              weight="bold"
            />
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-none">
                الوقت المتبقي
              </span>
              <span className="text-sm sm:text-base font-mono font-extrabold tracking-wider leading-tight" dir="ltr">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="h-11 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer select-none"
          >
            <PaperPlaneTilt className="w-4 h-4" weight="bold" />
            <span>تسليم الامتحان</span>
          </button>
        </div>
      </div>
    </header>
  );
}
