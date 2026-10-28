"use client";

import { motion } from "framer-motion";
import { BookOpen, Target, ArrowCounterClockwise, Trophy } from "@phosphor-icons/react";
import { fadeInUp, staggerContainer } from "./types";

interface DashboardStatsGridProps {
  completedLessonsCount: number;
  recentAttemptsCount: number;
  unresolvedMistakesCount: number;
  averageScore?: number | null;
}

export function DashboardStatsGrid({
  completedLessonsCount,
  recentAttemptsCount,
  unresolvedMistakesCount,
  averageScore = null,
}: DashboardStatsGridProps) {
  const stats = [
    {
      icon: BookOpen,
      color: "#800020",
      bgColor: "bg-[#800020]/10 dark:bg-[#800020]/20",
      textColor: "text-[#800020] dark:text-[#FB7185]",
      value: completedLessonsCount,
      label: "دروس ذاكرتها",
      subtext: "فهمتها ومستعد ليها",
    },
    {
      icon: Target,
      color: "#059669",
      bgColor: "bg-[#059669]/10 dark:bg-[#059669]/20",
      textColor: "text-[#059669] dark:text-[#34D399]",
      value: recentAttemptsCount,
      label: "اختبارات حليتها",
      subtext: "تدريب وتطبيق عملي",
    },
    {
      icon: ArrowCounterClockwise,
      color: "#DC2626",
      bgColor: "bg-[#DC2626]/10 dark:bg-[#DC2626]/20",
      textColor: "text-[#DC2626] dark:text-[#F87171]",
      value: unresolvedMistakesCount,
      label: "أخطاء للمراجعة",
      subtext: "عشان متكررهاش تاني",
    },
    {
      icon: Trophy,
      color: "#D97706",
      bgColor: "bg-[#D97706]/10 dark:bg-[#D97706]/20",
      textColor: "text-[#D97706] dark:text-[#FBBF24]",
      value: averageScore !== null ? `${averageScore}%` : "—",
      label: "مستوى درجاتك",
      subtext: "متوسط حلك في الاختبارات",
    },
  ];

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          variants={fadeInUp}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-colors flex flex-col justify-between min-h-[118px] sm:min-h-[126px]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-bold">
              {stat.label}
            </span>
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bgColor} ${stat.textColor}`}
            >
              <stat.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" weight="bold" />
            </div>
          </div>

          <div className="pt-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight block ${stat.textColor}`}>
              {stat.value}
            </span>
            <span className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 block">
              {stat.subtext}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
}
