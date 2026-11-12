"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Clock, BookmarkSimple, CheckCircle, Compass, ArrowLeft } from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import type { ContinueLessonItem, StarterLessonRef } from "./types";

interface ContinueLearningCardProps {
  continueLesson?: ContinueLessonItem | null;
  starterLesson?: StarterLessonRef | null;
}

export function ContinueLearningCard({ continueLesson, starterLesson }: ContinueLearningCardProps) {
  if (!continueLesson) {
    return (
      <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0F1E36] border border-[#E5E7EB] dark:border-[#1E3352] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#800B34]/10 text-[#800B34] dark:bg-[#142747] dark:text-[#FDA4AF] flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" weight="bold" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#12263F] dark:text-[#F8FAFC]">
              يلا نبدأ مذاكرة!
            </h2>
            <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              {starterLesson
                ? `حسابك جديد وجاهز — ابدأ بالدرس الأول «${starterLesson.title}» أو تصفح المواد.`
                : "اختر المادة اللي تحب تبدأ بيها النهاردة، وابدأ خطوة بخطوة وثبت استمرارك."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {starterLesson && (
            <Link
              href={`/lessons/${starterLesson.id}`}
              className="h-11 px-5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ابدأ الدرس الأول</span>
            </Link>
          )}
          <Link
            href="/subjects"
            className={`h-11 px-5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all shrink-0 active:scale-[0.98] ${
              starterLesson
                ? "bg-[#F7F9FC] dark:bg-[#142747] border border-[#E2E8F0] dark:border-[#1E3352] text-[#091B40] dark:text-white hover:border-[#800B34]/40"
                : "bg-[#800B34] hover:bg-[#680829] text-white shadow-sm"
            }`}
          >
            <span>تصفح المواد</span>
            <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
          </Link>
        </div>
      </div>
    );
  }

  const cleanSubjectName = continueLesson.unit.subject.name.replace(/\s*\([^)]*\)/g, "").trim();
  const cleanUnitTitle = continueLesson.unit.title.replace(/\s*\([^)]*\)/g, "").trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.04 }}
      className="group relative rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0F1E36] border border-[#E8E9ED] dark:border-[#1E3352] hover:border-[#800B34]/30 dark:hover:border-[#9E1043]/60 shadow-xs transition-all overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#800B34]/5 dark:from-[#FB7185]/10 to-transparent rounded-bl-full pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-[#800B34] to-[#550015] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform mt-0.5">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>

          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-[#800B34] dark:text-[#FDA4AF] bg-[#800B34]/10 dark:bg-[#9E1043]/25 border border-[#800B34]/20 dark:border-[#9E1043]/40">
                <Play className="w-3 h-3 fill-current" />
                <span>كمّل من مكان ما وقفت</span>
              </span>
              <span className="text-xs sm:text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                {cleanSubjectName} • {cleanUnitTitle}
              </span>
            </div>

            <div className="pt-0.5">
              <BidiStatement
                as="h2"
                text={continueLesson.title}
                className="text-base sm:text-lg lg:text-xl font-extrabold text-[#12263F] dark:text-white leading-snug tracking-tight"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 text-xs flex-wrap pt-1">
              <span className="inline-flex items-center gap-1.5 font-medium text-xs text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#1E293B] px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#334155] font-mono">
                <Clock className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
                <span>{continueLesson.durationMinutes} دقيقة مذاكرة</span>
              </span>

              <span className="inline-flex items-center gap-1.5 font-bold text-xs text-[#92400E] dark:text-[#F0B843] bg-[#FFFBEB] dark:bg-[#F0B843]/15 px-2.5 py-1 rounded-lg border border-[#FDE68A]/80 dark:border-[#F0B843]/30">
                <BookmarkSimple className="w-3.5 h-3.5" weight="fill" />
                <span>ملخص الزتونة جاهز</span>
              </span>

              {typeof continueLesson.progressPercent === "number" &&
                continueLesson.progressPercent > 0 && (
                  <span className="inline-flex items-center gap-1.5 font-bold text-xs text-[#059669] dark:text-[#34D399] bg-[#059669]/10 px-2.5 py-1 rounded-lg border border-[#059669]/20 font-mono">
                    <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                    <span>خلصت منه {continueLesson.progressPercent}%</span>
                  </span>
                )}
            </div>
          </div>
        </div>

        <div className="shrink-0 pt-1 md:pt-0">
          <Link
            href={`/lessons/${continueLesson.id}`}
            className="h-11 px-6 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all shrink-0 active:scale-[0.98] w-full sm:w-auto"
          >
            <span>كمّل الدرس دلوقتي</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" weight="bold" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
