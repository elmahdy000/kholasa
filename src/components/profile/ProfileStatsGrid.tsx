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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right">
        <div className="w-11 h-11 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center mb-3">
          <BookOpen className="w-4 h-4" />
        </div>
        <span className="text-xl sm:text-2xl font-bold font-mono text-[#0F172A] dark:text-white block">
          {stats.completedLessonsCount}
        </span>
        <span className="text-[13px] font-medium text-[#64748B]">
          دروس مكتملة
        </span>
      </div>

      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right">
        <div className="w-11 h-11 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center mb-3">
          <Trophy className="w-4 h-4" />
        </div>
        <span className="text-xl sm:text-2xl font-bold font-mono text-[#0F172A] dark:text-white block">
          {stats.completedExamsCount}
        </span>
        <span className="text-[13px] font-medium text-[#64748B]">
          اختبارات منجزة
        </span>
      </div>

      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right">
        <div className="w-11 h-11 rounded-lg bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center mb-3">
          <Target className="w-4 h-4" />
        </div>
        <span className="text-xl sm:text-2xl font-bold font-mono text-[#D97706] dark:text-[#FBBF24] block">
          {stats.averageScore}%
        </span>
        <span className="text-[13px] font-medium text-[#64748B]">
          متوسط الدرجات
        </span>
      </div>

      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right">
        <div className="w-11 h-11 rounded-lg bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] flex items-center justify-center mb-3">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <span className="text-xl sm:text-2xl font-bold font-mono text-[#059669] dark:text-[#34D399] block">
          {stats.resolvedMistakesCount}
        </span>
        <span className="text-[13px] font-medium text-[#64748B]">
          أخطاء تم تصحيحها
        </span>
      </div>
    </div>
  );
}
