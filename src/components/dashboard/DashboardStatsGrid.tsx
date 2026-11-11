"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Target, ArrowCounterClockwise, Trophy } from "@phosphor-icons/react";
import { AnimatedCount } from "@/components/ui/AnimatedCount";
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
      color: "#800B34",
      bgColor: "bg-[#800B34]/10 dark:bg-[#800B34]/20",
      textColor: "text-[#800B34] dark:text-[#FB7185]",
      value: completedLessonsCount,
      label: "دروس ذاكرتها",
      subtext: "فهمتها ومستعد ليها",
      href: undefined as string | undefined,
      isMistakes: false,
    },
    {
      icon: Target,
      color: "#059669",
      bgColor: "bg-[#059669]/10 dark:bg-[#059669]/20",
      textColor: "text-[#059669] dark:text-[#34D399]",
      value: recentAttemptsCount,
      label: "اختبارات حليتها",
      subtext: "تدريب وتطبيق عملي",
      href: undefined as string | undefined,
      isMistakes: false,
    },
    {
      icon: ArrowCounterClockwise,
      color: "#DC2626",
      bgColor:
        unresolvedMistakesCount > 0
          ? "bg-[#DC2626]/10 dark:bg-[#DC2626]/20"
          : "bg-[#059669]/10 dark:bg-[#059669]/20",
      textColor:
        unresolvedMistakesCount > 0
          ? "text-[#DC2626] dark:text-[#F87171]"
          : "text-[#059669] dark:text-[#34D399]",
      value: unresolvedMistakesCount,
      label: "مراجعة لأخطائي",
      subtext:
        unresolvedMistakesCount > 0
          ? "اضغط هنا عشان تراجع وتصلح أخطاءك"
          : "مفيش أخطاء مستنياك دلوقتي ✓",
      href: "/mistakes",
      isMistakes: true,
    },
    {
      icon: Trophy,
      color: "#D97706",
      bgColor: "bg-[#D97706]/10 dark:bg-[#D97706]/20",
      textColor: "text-[#D97706] dark:text-[#FBBF24]",
      value: averageScore !== null ? `${averageScore}%` : "—",
      label: "مستوى درجاتك",
      subtext: "متوسط حلك في الاختبارات",
      href: undefined as string | undefined,
      isMistakes: false,
    },
  ];

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {stats.map((stat, i) => {
        const cardInner = (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-bold">
                {stat.isMistakes && unresolvedMistakesCount > 0 && (
                  <span className="inline-flex rounded-full h-2 w-2 bg-[#DC2626] shrink-0" />
                )}
                <span>{stat.label}</span>
              </span>
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bgColor} ${stat.textColor}`}
              >
                <stat.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" weight="bold" />
              </div>
            </div>

            <div className="pt-2">
              <span
                className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight block tabular-nums ${stat.textColor}`}
              >
                {typeof stat.value === "number" ? (
                  <AnimatedCount value={stat.value} />
                ) : (
                  stat.value
                )}
              </span>
              <span className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 block">
                {stat.subtext}
              </span>
            </div>
          </>
        );

        const cardClasses = `p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border ${
          stat.isMistakes && unresolvedMistakesCount > 0
            ? "border-[#FECACA] dark:border-[#7F1D1D]/70 hover:border-[#DC2626] dark:hover:border-[#EF4444]"
            : "border-[#E5E7EB] dark:border-[#334155] hover:border-[#800B34]/40 dark:hover:border-[#E11D48]/60"
        } transition-colors flex flex-col justify-between min-h-[118px] sm:min-h-[126px]`;

        return (
          <motion.div key={i} variants={fadeInUp} whileHover={{ y: -2 }}>
            {stat.href ? (
              <Link href={stat.href} className={`${cardClasses} group h-full`}>
                {cardInner}
              </Link>
            ) : (
              <div className={`${cardClasses} h-full`}>{cardInner}</div>
            )}
          </motion.div>
        );
      })}
    </motion.section>
  );
}
