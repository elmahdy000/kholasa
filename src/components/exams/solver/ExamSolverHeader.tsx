"use client";

import { Clock, PaperPlaneTilt } from "@phosphor-icons/react";
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
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span className="text-[13px] font-bold text-[#800020] block">
          {subjectName} •{" "}
          {initialMode === "PRACTICE" ? "وضع التدريب (شرح فوري)" : "وضع الامتحان (وقت حقيقي)"}
        </span>
        <BidiStatement
          as="h1"
          text={examTitle}
          className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white"
        />
      </div>

      <div className="flex items-center gap-3 self-start sm:self-center">
        {/* Timer Display */}
        <div
          className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-[13px] font-mono font-bold ${
            isUrgent
              ? "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#F87171] text-[#DC2626] animate-pulse"
              : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white"
          }`}
        >
          <Clock className="w-4 h-4 text-[#800020]" weight="bold" />
          <span dir="ltr">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={onOpenSubmitModal}
          className="h-11 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-[13px] flex items-center gap-2 transition-all active:opacity-80 cursor-pointer"
        >
          <PaperPlaneTilt className="w-3.5 h-3.5" weight="bold" />
          <span>تسليم الامتحان</span>
        </button>
      </div>
    </div>
  );
}
