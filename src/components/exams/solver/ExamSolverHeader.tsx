"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { Timer, ListBullets, Code, PaperPlaneTilt } from "@phosphor-icons/react";
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
    <div className="space-y-2.5 sm:space-y-3.5">
      {/* 1. Official Platform Brand Logo */}
      <div className="flex flex-col items-center justify-center select-none pt-0.5">
        <BrandLogo
          variant="combined"
          size="sm"
          showSubtitle
          subtitleText="- El-Kholasa -"
          glow={false}
        />
      </div>

      {/* 2. Exam Banner: Golden Code Icon + Deep Navy Curved Pill */}
      <div className="flex items-center justify-center gap-2 px-2">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#D97706] text-white flex items-center justify-center shadow-xs shrink-0 font-bold">
          <Code className="w-4 h-4 sm:w-5 sm:h-5" weight="bold" />
        </div>

        <div className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#091B40] dark:bg-[#10233A] text-white font-black text-xs sm:text-sm md:text-base shadow-sm border border-slate-700/50 flex items-center gap-2 max-w-full truncate">
          <BidiStatement as="h1" text={coreTitle} className="truncate font-sans sm:font-sans" />
        </div>
      </div>

      {/* 3. Status Bar: Responsive 2-tier on mobile (<640px), 1-tier on desktop */}
      <div className="bg-white dark:bg-[#10233A] p-2.5 sm:p-3 rounded-2xl border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-2.5 sm:space-y-0">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Timer Pill */}
          <div
            className={`min-h-[40px] px-3 sm:px-3.5 rounded-xl sm:rounded-full border shadow-2xs flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-all shrink-0 ${
              isUrgent
                ? "border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse bg-rose-50/50"
                : "border-[#E8E9ED] dark:border-[#22364F] bg-[#F8FAFC] dark:bg-[#071737] text-[#091B40] dark:text-white"
            }`}
            title="الوقت المتبقي"
          >
            <Timer className={`w-4 h-4 ${isUrgent ? "text-rose-600" : "text-[#800B34] dark:text-[#E9AD32]"}`} weight="bold" />
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider" dir="ltr">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] hidden lg:inline font-medium">
              متبقي
            </span>
          </div>

          {/* Desktop Center Progress (hidden on mobile, shown in Tier 2) */}
          <div className="hidden sm:flex flex-col items-center gap-1 flex-1 max-w-xs px-2">
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap">
                {answeredCount} من {totalQuestions} مُجاب
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-[#D97706] text-white shadow-2xs">
                {progressPct}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/60">
              <div
                className="h-full bg-[#D97706] rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Action Group: Submit Button + Question Palette Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Direct Submit Exam Button */}
            <button
              type="button"
              onClick={onOpenSubmitModal}
              className="min-h-[40px] px-2.5 sm:px-3.5 rounded-xl sm:rounded-full border border-emerald-300 dark:border-emerald-700/80 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
              title="تسليم الامتحان وإنهاؤه في أي وقت"
            >
              <PaperPlaneTilt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" weight="bold" />
              <span className="hidden sm:inline">تسليم الامتحان</span>
              <span className="sm:hidden">تسليم</span>
            </button>

            {/* Question Counter Pill (Opens Question Palette Modal) */}
            <button
              type="button"
              onClick={onTogglePalette}
              className={`min-h-[40px] px-2.5 sm:px-3.5 rounded-xl sm:rounded-full border shadow-2xs flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
                isPaletteOpen
                  ? "bg-[#091B40] dark:bg-[#1E3A5F] text-white border-[#091B40]"
                  : "bg-[#F8FAFC] dark:bg-[#071737] border-[#E8E9ED] dark:border-[#22364F] text-[#091B40] dark:text-white hover:bg-slate-100 dark:hover:bg-[#132945]"
              }`}
              title="عرض خريطة الأسئلة"
            >
              <span className="font-bold text-xs sm:text-[13px] font-mono">
                {currentIndex + 1} من {totalQuestions}
              </span>
              <ListBullets className="w-4 h-4 text-[#D97706]" weight="bold" />
            </button>
          </div>
        </div>

        {/* Mobile Tier 2: Full-width live progress bar */}
        <div className="sm:hidden pt-1 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 px-0.5">
            <span>{answeredCount} من {totalQuestions} مُجاب</span>
            <span className="text-[#D97706] font-black">{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D97706] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
