"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Trophy } from "lucide-react";
import { AnimatedCount } from "@/components/ui/AnimatedCount";

interface MistakeAnalyticsBarProps {
  unresolvedCount: number;
  resolvedCount: number;
  masteryPercentage: number | null;
}

export function MistakeAnalyticsBar({
  unresolvedCount,
  resolvedCount,
  masteryPercentage,
}: MistakeAnalyticsBarProps) {
  const safeMastery = masteryPercentage ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        whileHover={{ y: -2 }}
        className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border flex items-center justify-between shadow-xs transition-colors ${
          unresolvedCount > 0
            ? "border-[#FECACA] dark:border-[#7F1D1D]/60"
            : "border-[#E2E8F0] dark:border-[#334155]"
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#DC2626] block">
              <AnimatedCount value={unresolvedCount} />
            </span>
            {unresolvedCount > 0 && (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DC2626]" />
              </span>
            )}
          </div>
          <span className="text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            أسئلة في مراجعة لأخطائي
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.06 }}
        whileHover={{ y: -2 }}
        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between shadow-xs"
      >
        <div>
          <span className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#059669] block">
            <AnimatedCount value={resolvedCount} />
          </span>
          <span className="text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            أسئلة قفلتها وأتقنتها
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.12 }}
        whileHover={{ y: -2 }}
        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-2 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#800B34] dark:text-[#FB7185] block">
              {masteryPercentage !== null ? (
                <AnimatedCount value={masteryPercentage} suffix="%" />
              ) : (
                "—"
              )}
            </span>
            <span className="text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              نسبة التمكّن والتثبيت
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#800B34]/10 dark:bg-[#1E293B] text-[#800B34] dark:text-[#FB7185] flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
        {masteryPercentage !== null && (
          <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${safeMastery}%` }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-[#800B34] dark:bg-[#E9AD32]"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
