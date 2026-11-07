"use client";

import Image from "next/image";
import { Timer, ListBullets, Code, Desktop, BookOpen, Clock } from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface ExamSolverHeaderProps {
  subjectName: string;
  examTitle: string;
  initialMode: "PRACTICE" | "EXAM";
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
  initialMode,
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

  const isLanguages =
    /[\u0041-\u005A\u0061-\u007A]/.test(examTitle) &&
    !/[\u0600-\u06FF]/.test(examTitle.replace(/^(?:امتحان\s*(?:وحدة|درس|شامل)?:\s*)/, ""));

  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 1. Top Centered Platform Branding */}
      <div className="flex flex-col items-center justify-center select-none pt-1">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9">
            <Image
              src="/images/logo-icon.png"
              alt="شعار الخلاصة"
              width={72}
              height={72}
              priority
              className="w-full h-full object-contain filter drop-shadow-xs"
            />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-xl sm:text-2xl font-black text-[#0B2545] dark:text-blue-400 font-brand tracking-tight leading-none">
              الخلاصة
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider font-sans mt-0.5">
              — El-Kholasa —
            </span>
          </div>
        </div>
      </div>

      {/* 2. Exam Banner: Golden Code Icon + Royal Blue Pill */}
      <div className="flex items-center justify-center gap-2 px-2">
        {/* Golden-Yellow Square Icon Badge */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center shadow-xs shrink-0">
          <Code className="w-5 h-5 sm:w-6 sm:h-6" weight="bold" />
        </div>

        {/* Navy Curved Pill Banner */}
        <div className="px-5 sm:px-7 py-2.5 rounded-full bg-[#0B2545] dark:bg-[#1E3A8A] text-white font-extrabold text-sm sm:text-base md:text-lg shadow-sm flex items-center gap-2 max-w-full truncate">
          <BidiStatement as="h1" text={coreTitle} className="truncate" />
        </div>
      </div>

      {/* 3. Status Bar: Timer, Floating Progress, and Question Counter */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-1 pt-1">
        {/* Left: Timer Pill */}
        <div
          className={`h-11 px-3.5 sm:px-4 rounded-full border bg-white dark:bg-[#0D1B2E] shadow-xs flex items-center gap-2 text-xs font-bold transition-all shrink-0 ${
            isUrgent
              ? "border-rose-400 text-rose-600 dark:text-rose-400 animate-pulse bg-rose-50/50"
              : "border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
          }`}
          title="الوقت المتبقي"
        >
          <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${isUrgent ? "text-rose-600" : "text-amber-600"}`} weight="bold" />
          <span className="font-mono text-sm sm:text-base font-black tracking-wider" dir="ltr">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline font-medium">
            الوقت المتبقي
          </span>
        </div>

        {/* Center: Floating Percentage & Progress Bar */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-[200px] sm:max-w-xs px-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 shadow-xs">
            {progressPct}%
          </span>
          <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/60">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-300"
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
              ? "bg-[#0B2545] dark:bg-[#1E3A8A] text-white border-[#0B2545]"
              : "bg-white dark:bg-[#0D1B2E] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
          title="عرض أو إخفاء خريطة الأسئلة"
        >
          <span className="font-bold">
            {currentIndex + 1} من {totalQuestions} سؤال
          </span>
          <ListBullets className={`w-4 h-4 ${isPaletteOpen ? "text-amber-400" : "text-amber-500"}`} weight="bold" />
        </button>
      </div>
    </div>
  );
}
