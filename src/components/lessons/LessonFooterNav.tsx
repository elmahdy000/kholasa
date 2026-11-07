"use client";

import Link from "next/link";
import {
  CaretRight,
  CaretLeft,
  ArrowLeft,
  ArrowRight,
  Sparkle,
  Trophy,
  Lightning,
} from "@phosphor-icons/react";

interface SiblingLesson {
  id: string;
  title: string;
  order: number;
}

interface LessonFooterNavProps {
  prevLesson: SiblingLesson | null;
  nextLesson: SiblingLesson | null;
  subjectId: string;
  isAllAnswered?: boolean;
  unresolvedMistakesCount?: number;
  onOpenMistakesCapsule?: () => void;
  isLanguages?: boolean;
}

export function LessonFooterNav({
  prevLesson,
  nextLesson,
  subjectId,
  isAllAnswered = false,
  unresolvedMistakesCount = 0,
  onOpenMistakesCapsule,
  isLanguages = false,
}: LessonFooterNavProps) {
  const dir = isLanguages ? "ltr" : "rtl";
  const ArrowForward = isLanguages ? ArrowRight : ArrowLeft;

  return (
    <div dir={dir} className="space-y-4 mt-10">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO NEXT LESSON CALL-TO-ACTION (زر الانتقال التالي التلقائي)
      ───────────────────────────────────────────────────────────── */}
      {nextLesson ? (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#800020]/10 via-[#800020]/5 to-transparent dark:from-[#800020]/25 dark:via-[#1E293B] dark:to-[#0F172A] border-2 border-[#800020]/30 dark:border-[#FB7185]/40 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm transition-all">
          <div className={`flex items-center gap-4 ${isLanguages ? "text-left" : "text-right"} w-full md:w-auto`}>
            <div className="w-14 h-14 rounded-2xl bg-[#800020] text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkle className="w-7 h-7" weight="fill" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185] block mb-0.5">
                {isAllAnswered
                  ? isLanguages ? "🎉 Great job! You finished the challenges for this lesson" : "🎉 عاش يا بطل! خلصت أسئلة وتدريبات الدرس ده"
                  : isLanguages ? "Ready for the next challenge?" : "جاهز للخطوة القادمة؟"}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {isLanguages ? `Next Lesson: ${nextLesson.title}` : `الدرس التالي: ${nextLesson.title}`}
              </h3>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
            {unresolvedMistakesCount > 0 && onOpenMistakesCapsule && (
              <button
                type="button"
                onClick={onOpenMistakesCapsule}
                className="h-12 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs sm:text-[13px] font-bold border border-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Lightning className="w-4 h-4" weight="fill" />
                <span>
                  {isLanguages
                    ? `Drill ${unresolvedMistakesCount} mistakes first`
                    : `صفّي ${unresolvedMistakesCount} أخطاء أولاً`}
                </span>
              </button>
            )}

            <Link
              href={`/lessons/${nextLesson.id}`}
              className="h-12 px-6 sm:px-8 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <span>{isLanguages ? "Proceed to Next Lesson" : `انتقل إلى: ${nextLesson.title}`}</span>
              <ArrowForward className="w-4 h-4 shrink-0" weight="bold" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-[#1E293B] dark:to-[#0F172A] border-2 border-emerald-500/30 dark:border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm transition-all">
          <div className={`flex items-center gap-4 ${isLanguages ? "text-left" : "text-right"} w-full md:w-auto`}>
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Trophy className="w-7 h-7" weight="fill" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                {isLanguages ? "🏆 Unit Mastery Completed!" : "🏆 مبروك الإنجاز والتفوق!"}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {isLanguages ? "You completed all lessons in this unit" : "أتممت جميع دروس هذه الوحدة بالكامل بنجاح"}
              </h3>
            </div>
          </div>

          <Link
            href={`/subjects/${subjectId}`}
            className="h-12 px-6 sm:px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer shrink-0"
          >
            <span>{isLanguages ? "Return to Subject Index" : "العودة لفهرس المادة"}</span>
            <ArrowForward className="w-4 h-4 shrink-0" weight="bold" />
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SECONDARY PREV / NEXT BREADCRUMB NAVIGATION
      ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-4">
        {prevLesson ? (
          <Link
            href={`/lessons/${prevLesson.id}`}
            className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#800020] transition-colors min-w-0"
          >
            <CaretRight className="w-4 h-4 shrink-0" weight="bold" />
            <div className={`min-w-0 ${isLanguages ? "text-left" : "text-right"}`}>
              <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {isLanguages ? "Previous Lesson" : "الدرس السابق"}
              </span>
              <span className="block break-words max-w-[140px] sm:max-w-xs leading-snug">
                <bdi>{prevLesson.title}</bdi>
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson && (
          <Link
            href={`/lessons/${nextLesson.id}`}
            className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline transition-colors min-w-0"
          >
            <div className={`min-w-0 ${isLanguages ? "text-right" : "text-left"}`}>
              <span className="block text-[11px] opacity-75">
                {isLanguages ? "Next Lesson" : "الدرس التالي"}
              </span>
              <span className="block break-words max-w-[140px] sm:max-w-xs leading-snug">
                <bdi>{nextLesson.title}</bdi>
              </span>
            </div>
            <CaretLeft className="w-4 h-4 shrink-0" weight="bold" />
          </Link>
        )}
      </div>
    </div>
  );
}
