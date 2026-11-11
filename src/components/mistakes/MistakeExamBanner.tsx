"use client";

import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#800B34] animate-ping" />
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
            عاوز تتدرب عليهم في امتحان عملي مجمع؟
          </h3>
        </div>
        <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
          هنعملك امتحان فوري بـ {actionableUnresolvedCount} أسئلة اللي لسه ما قفلتهمش عشان تثبتهم فوراً.
        </p>
      </div>

      <button
        type="button"
        onClick={onGenerateExam}
        disabled={isGeneratingExam}
        className="w-full sm:w-auto min-h-[44px] h-11 px-5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs sm:text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shrink-0 cursor-pointer shadow-xs"
      >
        {isGeneratingExam ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>بنجهّز الامتحان...</span>
          </>
        ) : (
          <>
            <SlidersHorizontal className="w-4 h-4" />
            <span>ابدأ امتحان مراجعة لأخطائي ({actionableUnresolvedCount})</span>
          </>
        )}
      </button>
    </motion.div>
  );
}
