"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Play, Target } from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import type { ContinueLessonItem, StudentMeta } from "./types";

interface DashboardHeroProps {
  userName?: string | null;
  studentMeta?: StudentMeta;
  continueLesson?: ContinueLessonItem | null;
}

export function DashboardHero({ userName, studentMeta, continueLesson }: DashboardHeroProps) {
  // Clean student name without parenthesized metadata
  const displayName = userName?.replace(/\s*\([^)]*\)/g, "").trim() || "طالبنا العزيز";

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
      className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#22364F] p-5 sm:p-6 lg:p-7 relative overflow-hidden shadow-xs"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-6">
        {/* Welcome Text & Clean Metadata */}
        <div className="space-y-2 max-w-2xl">
          {academicScope ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]">
              <GraduationCap className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185] shrink-0" weight="fill" />
              <BidiStatement as="span" text={academicScope} />
            </div>
          ) : null}

          {/* Welcome Heading */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#12263F] dark:text-[#F8FAFC] tracking-tight">
            أهلًا بيك، {displayName}
          </h1>

          {/* Supporting Subtext */}
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            جاهز تكمّل مذاكرتك النهاردة؟ خطوة بخطوة هتوصل للي بتتمناه.
          </p>
        </div>

        {/* Action Buttons: 2 Unified, Balanced Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link
            href={continueLesson ? `/lessons/${continueLesson.id}` : "/subjects"}
            className="h-10 px-5 sm:px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>كمّل مذاكرتك</span>
          </Link>

          <Link
            href="/exams/builder"
            className="h-10 px-4 sm:px-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#12263F] dark:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/80 text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Target className="w-4 h-4 text-[#D97706]" weight="fill" />
            <span>اختبار سريع</span>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
