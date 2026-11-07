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
  isPaletteOpen,
  onTogglePalette,
  onOpenSubmitModal,
}: ExamSolverHeaderProps) {
  // Extract trailing question count parenthetical (e.g. "(30 سؤال)" or "(30 Questions)")
  const countMatch = examTitle.match(/\s*\(([^)]+)\)\s*$/);
  const coreTitle = countMatch ? examTitle.replace(/\s*\(([^)]+)\)\s*$/, "").trim() : examTitle;

  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 1. Official Platform Brand Logo */}
      <div className="flex flex-col items-center justify-center select-none pt-1">
        <BrandLogo
          variant="combined"
          size="sm"
          showSubtitle
          subtitleText="منصة البكالوريا الذكية"
          glow={false}
        />
      </div>

      {/* 2. Exam Banner: Golden Code Icon + Deep Navy Curved Pill */}
      <div className="flex items-center justify-center gap-2.5 px-2">
        {/* Golden-Yellow Square Icon Badge */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shadow-xs shrink-0 font-bold">
          <Code className="w-5 h-5 sm:w-6 sm:h-6" weight="bold" />
        </div>

        {/* Navy Curved Pill Banner */}
        <div className="px-5 sm:px-7 py-2.5 rounded-full bg-[#12263F] dark:bg-[#10233A] text-white font-black text-sm sm:text-base md:text-lg shadow-sm border border-[#800020]/30 flex items-center gap-2 max-w-full truncate">
          <BidiStatement as="h1" text={coreTitle} className="truncate font-sans sm:font-sans" />
        </div>
      </div>

      {/* 3. Status Bar: Timer, Floating Progress, and Question Counter */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-1 pt-1">
        {/* Left: Timer Pill */}
        <div
          className={`h-11 px-3.5 sm:px-4 rounded-full border bg-white dark:bg-[#10233A] shadow-xs flex items-center gap-2 text-xs font-bold transition-all shrink-0 ${
            isUrgent
              ? "border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse bg-rose-50/50"
              : "border-[#E8E9ED] dark:border-[#22364F] text-[#12263F] dark:text-white"
          }`}
          title="الوقت المتبقي"
        >
          <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${isUrgent ? "text-rose-600" : "text-[#800020] dark:text-[#A30D36]"}`} weight="bold" />
          <span className="font-mono text-sm sm:text-base font-black tracking-wider" dir="ltr">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] hidden sm:inline font-medium">
            الوقت المتبقي
          </span>
        </div>

        {/* Center: Floating Percentage & Progress Bar (Academic Gold) */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-[180px] sm:max-w-xs px-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#D97706] text-white shadow-xs">
            {progressPct}%
          </span>
          <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/60">
            <div
              className="h-full bg-[#D97706] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Right: Question Counter Pill (Toggles Question Palette) */}
        <button
          type="button"
          onClick={onTogglePalette}
          className={`h-11 px-3.5 sm:px-4 rounded-full border shadow-xs flex items-center gap-2 text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${
            isPaletteOpen
              ? "bg-[#12263F] dark:bg-[#1E3A5F] text-white border-[#12263F]"
              : "bg-white dark:bg-[#10233A] border-[#E8E9ED] dark:border-[#22364F] text-[#12263F] dark:text-white hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
          }`}
          title="عرض أو إخفاء خريطة الأسئلة"
        >
          <span className="font-bold">
            {currentIndex + 1} من {totalQuestions} سؤال
          </span>
          <ListBullets className={`w-4 h-4 ${isPaletteOpen ? "text-[#D97706]" : "text-[#800020] dark:text-[#A30D36]"}`} weight="bold" />
        </button>
      </div>
    </div>
  );
}
