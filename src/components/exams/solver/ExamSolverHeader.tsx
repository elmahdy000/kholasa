"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { Timer, ListBullets, Code } from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface ExamSolverHeaderProps {
  subjectName: string;
  examTitle: string;
  minutes: number;
  seconds: number;
  isUrgent: boolean;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  unansweredCount: number;
  isPaletteOpen: boolean;
  onTogglePalette: () => void;
  onOpenSubmitModal: () => void;
}

export function ExamSolverHeader({
  subjectName,
  examTitle,
  minutes,
  seconds,
  isUrgent,
  currentIndex,
  totalQuestions,
  answeredCount,
  flaggedCount,
  unansweredCount,
  isPaletteOpen,
  onTogglePalette,
  onOpenSubmitModal,
}: ExamSolverHeaderProps) {
  // Extract trailing question count parenthetical (e.g. "(30 سؤال)" or "(30 Questions)")
  const countMatch = examTitle.match(/\s*\(([^)]+)\)\s*$/);
  const coreTitle = countMatch ? examTitle.replace(/\s*\(([^)]+)\)\s*$/, "").trim() : examTitle;

  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* 1. Official Platform Brand Logo (Matches Mockup) */}
      <div className="flex flex-col items-center justify-center select-none pt-0.5">
        <BrandLogo
          variant="combined"
          size="sm"
          showSubtitle
          subtitleText="- El-Kholasa -"
          glow={false}
        />
      </div>

      {/* 2. Exam Banner: Golden Code Icon + Deep Navy Curved Pill (Matches Mockup) */}
      <div className="flex items-center justify-center gap-2 px-2">
        {/* Golden-Yellow Square Icon Badge */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#D97706] text-white flex items-center justify-center shadow-xs shrink-0 font-bold">
          <Code className="w-4 h-4 sm:w-5 sm:h-5" weight="bold" />
        </div>

        {/* Navy Curved Pill Banner */}
        <div className="px-5 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#12263F] dark:bg-[#10233A] text-white font-black text-xs sm:text-sm md:text-base shadow-sm border border-slate-700/50 flex items-center gap-2 max-w-full truncate">
          <BidiStatement as="h1" text={coreTitle} className="truncate font-sans sm:font-sans" />
        </div>
      </div>

      {/* 3. Status Bar: Timer, Floating Progress, and Question Counter (Matches Mockup Exactly) */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 px-1 pt-0.5">
        {/* Left: Timer Pill */}
        <div
          className={`h-9.5 sm:h-10 px-3.5 sm:px-4 rounded-full border bg-white dark:bg-[#10233A] shadow-xs flex items-center gap-2 text-xs font-bold transition-all shrink-0 ${
            isUrgent
              ? "border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse bg-rose-50/50"
              : "border-[#E8E9ED] dark:border-[#22364F] text-[#12263F] dark:text-white"
          }`}
          title="الوقت المتبقي"
        >
          <Timer className={`w-4 h-4 ${isUrgent ? "text-rose-600" : "text-[#800020] dark:text-[#A30D36]"}`} weight="bold" />
          <span className="font-mono text-xs sm:text-sm font-black tracking-wider" dir="ltr">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] hidden sm:inline font-medium">
            الوقت المتبقي
          </span>
        </div>

        {/* Center: Floating Percentage & Progress Bar (Academic Gold) */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-[170px] sm:max-w-xs px-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-[#D97706] text-white shadow-xs">
            {progressPct}%
          </span>
          <div className="w-full h-1.5 sm:h-2 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/60">
            <div
              className="h-full bg-[#D97706] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Right: Question Counter Pill (Opens Question Palette Modal) */}
        <button
          type="button"
          onClick={onTogglePalette}
          className={`h-9.5 sm:h-10 px-3.5 sm:px-4 rounded-full border shadow-xs flex items-center gap-2 text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${
            isPaletteOpen
              ? "bg-[#12263F] dark:bg-[#1E3A5F] text-white border-[#12263F]"
              : "bg-white dark:bg-[#10233A] border-[#E8E9ED] dark:border-[#22364F] text-[#12263F] dark:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
          }`}
          title="عرض خريطة الأسئلة"
        >
          <span className="font-bold text-xs sm:text-[13px]">
            {currentIndex + 1} من {totalQuestions} سؤال
          </span>
          <ListBullets className="w-4 h-4 text-[#D97706]" weight="bold" />
        </button>
      </div>
    </div>
  );
}
