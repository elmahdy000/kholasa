"use client";

import { SlidersHorizontal, Loader2 } from "lucide-react";

interface MistakeExamBannerProps {
  actionableUnresolvedCount: number;
  isGeneratingExam: boolean;
  onGenerateExam: () => void;
}

export function MistakeExamBanner({
  actionableUnresolvedCount,
  isGeneratingExam,
  onGenerateExam,
}: MistakeExamBannerProps) {
  if (actionableUnresolvedCount === 0) return null;

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#800020] animate-ping" />
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
            عاوز تتدرب عليهم في امتحان عملي مجمع؟
          </h3>
        </div>
        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
          هنعملك امتحان فوري بـ {actionableUnresolvedCount} أسئلة اللي لسه ما قفلتهمش عشان تثبتهم فوراً.
        </p>
      </div>

      <button
        type="button"
        onClick={onGenerateExam}
        disabled={isGeneratingExam}
        className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:opacity-80 disabled:opacity-50 shrink-0"
      >
        {isGeneratingExam ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>بنجهّز الامتحان...</span>
          </>
        ) : (
          <>
            <SlidersHorizontal className="w-4 h-4" />
            <span>ابدأ امتحان من غلطاتي ({actionableUnresolvedCount})</span>
          </>
        )}
      </button>
    </div>
  );
}
