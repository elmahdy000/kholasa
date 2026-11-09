"use client";

import { BookOpen, Trophy, Target, CheckCircle2 } from "lucide-react";

interface ProfileStatsGridProps {
  stats: {
    completedLessonsCount: number;
    completedExamsCount: number;
    averageScore: number;
    resolvedMistakesCount: number;
  };
}

export function ProfileStatsGrid({ stats }: ProfileStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right shadow-xs">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#800B34]/10 dark:bg-[#1E293B] text-[#800B34] dark:text-[#FB7185] flex items-center justify-center mb-2.5">
          <BookOpen className="w-4 h-4" />
        </div>
        <span className="text-xl sm:text-2xl font-bold font-mono text-[#091B40] dark:text-white block">
          {stats.completedLessonsCount}
        </span>
        <span className="text-xs sm:text-[13px] font-medium text-[#64748B]">
          دروس مكتملة
        </span>
      </div>

      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right shadow-xs">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#800B34]/10 dark:bg-[#1E293B] text-[#800B34] dark:text-[#FB7185] flex items-center justify-center mb-2.5">
          <Trophy className="w-4 h-4" />
        </div>
        <span className="text-xl sm:text-2xl font-bold font-mono text-[#091B40] dark:text-white block">
          {stats.completedExamsCount}
        </span>
        <span className="text-xs sm:text-[13px] font-medium text-[#64748B]">
          اختبارات منجزة
        </span>
      </div>

      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right shadow-xs">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center mb-2.5">
          <Target className="w-4 h-4" />
        </div>
        <span className="text-xl sm:text-2xl font-bold font-mono text-[#D97706] dark:text-[#FBBF24] block">
          {stats.averageScore}%
        </span>
        <span className="text-xs sm:text-[13px] font-medium text-[#64748B]">
          متوسط الدرجات
        </span>
      </div>

      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right shadow-xs">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] flex items-center justify-center mb-2.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <span className="text-xl sm:text-2xl font-bold font-mono text-[#059669] dark:text-[#34D399] block">
          {stats.resolvedMistakesCount}
        </span>
        <span className="text-xs sm:text-[13px] font-medium text-[#64748B]">
          أخطاء تم تثبيتها
        </span>
      </div>
    </div>
  );
}
