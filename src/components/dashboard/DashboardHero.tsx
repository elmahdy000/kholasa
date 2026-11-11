"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Play, Target } from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { Sparkles } from "lucide-react";
import type { ContinueLessonItem, StudentMeta } from "./types";

interface DashboardHeroProps {
  userName?: string | null;
  studentMeta?: StudentMeta;
  continueLesson?: ContinueLessonItem | null;
  onStartTour?: () => void;
}

export function DashboardHero({ userName, studentMeta, continueLesson, onStartTour }: DashboardHeroProps) {
  // Clean student name without parenthesized metadata
  const displayName = userName?.replace(/\s*\([^)]*\)/g, "").trim();

  // Clean academic scope without redundant English or parenthesized text
  const cleanGrade = studentMeta?.gradeName?.replace(/\s*\([^)]*\)/g, "").trim();
  const cleanTrack = studentMeta?.trackName?.replace(/\s*\([^)]*\)/g, "").trim();
  const cleanSystem = studentMeta?.systemName?.replace(/\s*\([^)]*\)/g, "").trim();
  const academicScope = [cleanGrade || cleanSystem, cleanTrack].filter(Boolean).join(" • ");

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#E8E9ED] dark:border-[#1E3352] p-4 sm:p-6 lg:p-7 relative overflow-hidden shadow-xs"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 lg:gap-6">
        {/* Welcome Text & Clean Metadata */}
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
          {academicScope ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F8FAFC] dark:bg-[#142747] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#1E3352]">
              <GraduationCap className="w-3.5 h-3.5 text-[#800B34] dark:text-[#F0B843] shrink-0" weight="fill" />
              <BidiStatement as="span" text={academicScope} />
            </div>
          ) : null}

          {/* Welcome Heading */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#091B40] dark:text-[#F8FAFC] tracking-tight">
            {displayName ? `أهلًا بيك، ${displayName}` : "أهلًا بيك"}
          </h1>

          {/* Supporting Subtext */}
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            جاهز تكمل مذاكرتك النهاردة؟ كل خطوة صغيرة بتفرق في مستواك.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap w-full sm:w-auto">
          {onStartTour && (
            <button
              onClick={onStartTour}
              type="button"
              className="flex-1 sm:flex-initial min-h-[44px] h-11 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/70 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-200/80 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 hover:border-amber-300 dark:hover:border-amber-600 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
              title="جولة في مميزات الخلاصة"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>جولة المنصة</span>
            </button>
          )}

          <Link
            href={continueLesson ? `/lessons/${continueLesson.id}` : "/subjects"}
            className="flex-1 sm:flex-initial min-h-[44px] h-11 px-5 sm:px-6 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>كمّل مذاكرتك</span>
          </Link>

          <Link
            href="/exams/builder"
            className="flex-1 sm:flex-initial min-h-[44px] h-11 px-4 sm:px-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#091B40] dark:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/80 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Target className="w-4 h-4 text-[#D97706]" weight="fill" />
            <span>اختبار سريع</span>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
