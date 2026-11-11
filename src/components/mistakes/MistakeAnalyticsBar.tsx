"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Trophy } from "lucide-react";
import { AnimatedCount } from "@/components/ui/AnimatedCount";

interface MistakeAnalyticsBarProps {
  unresolvedCount: number;
  resolvedCount: number;
  masteryPercentage: number | null;
}

const MINI_RADIUS = 18;
const MINI_CIRCUMFERENCE = 2 * Math.PI * MINI_RADIUS;

export function MistakeAnalyticsBar({
  unresolvedCount,
  resolvedCount,
  masteryPercentage,
}: MistakeAnalyticsBarProps) {
  const safeMastery = masteryPercentage ?? 0;
  const ringOffset = MINI_CIRCUMFERENCE - (MINI_CIRCUMFERENCE * safeMastery) / 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -3 }}
        className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F1E36] border flex items-center justify-between shadow-xs transition-colors ${
          unresolvedCount > 0
            ? "border-[#FECACA] dark:border-[#9E1043]/50"
            : "border-[#E2E8F0] dark:border-[#1E3352]"
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#DC2626] block">
              <AnimatedCount value={unresolvedCount} startFromZero />
            </span>
            {unresolvedCount > 0 && (
              <span className="inline-flex rounded-full h-2.5 w-2.5 bg-[#DC2626] shrink-0" />
            )}
          </div>
          <span className="text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            أسئلة محتاجة مراجعة
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -3 }}
        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#E2E8F0] dark:border-[#1E3352] flex items-center justify-between shadow-xs"
      >
        <div>
          <span className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#059669] block">
            <AnimatedCount value={resolvedCount} startFromZero />
          </span>
          <span className="text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            أسئلة راجعتها وخلصتها
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -3 }}
        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#E2E8F0] dark:border-[#1E3352] flex flex-col justify-between gap-2 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#800B34] dark:text-[#FDA4AF] block">
              {masteryPercentage !== null ? (
                <AnimatedCount value={masteryPercentage} suffix="%" startFromZero />
              ) : (
                "—"
              )}
            </span>
            <span className="text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              نسبة اللي خلصته
            </span>
          </div>
          <div className="relative w-11 h-11 rounded-xl bg-[#800B34]/10 dark:bg-[#142747] text-[#800B34] dark:text-[#FDA4AF] flex items-center justify-center shrink-0">
            <svg
              aria-hidden="true"
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 44 44"
            >
              <circle
                cx="22"
                cy="22"
                r={MINI_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.15"
                strokeWidth="3"
              />
              <motion.circle
                cx="22"
                cy="22"
                r={MINI_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={MINI_CIRCUMFERENCE}
                initial={{ strokeDashoffset: MINI_CIRCUMFERENCE }}
                animate={{ strokeDashoffset: ringOffset }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <Trophy className="w-4.5 h-4.5 relative z-10" />
          </div>
        </div>
        {masteryPercentage !== null && (
          <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${safeMastery}%` }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-linear-to-r from-[#800B34] to-[#E9AD32]"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
