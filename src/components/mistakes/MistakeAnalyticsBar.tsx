"use client";

import { AlertTriangle, CheckCircle2, Trophy } from "lucide-react";

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
        <div>
          <span className="text-2xl sm:text-3xl font-bold text-[#DC2626] block tracking-tight">
            {unresolvedCount}
          </span>
          <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            أسئلة محتاجة تتظبّط
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
        <div>
          <span className="text-2xl sm:text-3xl font-bold text-[#059669] block tracking-tight">
            {resolvedCount}
          </span>
          <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            أسئلة قفلتها وظبّطتها
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
        <div>
          <span className="text-2xl sm:text-3xl font-bold text-[#800020] dark:text-[#FB7185] block tracking-tight">
            {masteryPercentage !== null ? `${masteryPercentage}%` : "—"}
          </span>
          <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            نسبة التمكّن والتثبيت
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
          <Trophy className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
