"use client";

import Link from "next/link";
import { Clock, BookmarkSimple, CheckCircle, Check, Cards, ArrowClockwise, Target, CloudArrowDown, CloudCheck } from "@phosphor-icons/react";

interface LessonHeaderProps {
  subject: {
    id: string;
    name: string;
    color?: string | null;
  };
  unit: {
    id: string;
    title: string;
  };
  lessonId: string;
  lessonTitle: string;
  durationMinutes: number;
  questionsCount: number;
  isBookmarked: boolean;
  isCompleted: boolean;
  isTogglingBookmark: boolean;
  isTogglingComplete: boolean;
  bookmarkNotice: string | null;
  unresolvedMistakesCount?: number;
  isSavedOffline?: boolean;
  isSavingOffline?: boolean;
  onToggleBookmark: () => void;
  onToggleComplete: () => void;
  onToggleOffline?: () => void;
  onStartFlashcards?: () => void;
  onOpenMistakesCapsule?: () => void;
}

export function LessonHeader({
  subject,
  unit,
  lessonId,
  lessonTitle,
  durationMinutes,
  questionsCount,
  isBookmarked,
  isCompleted,
  isTogglingBookmark,
  isTogglingComplete,
  bookmarkNotice,
  unresolvedMistakesCount,
  isSavedOffline = false,
  isSavingOffline = false,
  onToggleBookmark,
  onToggleComplete,
  onToggleOffline,
  onStartFlashcards,
  onOpenMistakesCapsule,
}: LessonHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E9ED] dark:border-[#22364F] pb-5">
      {/* Lesson Breadcrumbs, Title and Meta */}
      <div className="space-y-1.5 min-w-0 flex-1">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
          <Link href="/subjects" className="hover:text-[#800B34] transition-colors">
            المواد
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <Link href={`/subjects/${subject.id}`} className="hover:text-[#800B34] transition-colors">
            {subject.name}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-[#12263F] dark:text-white truncate">{unit.title}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-[#12263F] dark:text-white tracking-tight leading-snug">
          {lessonTitle}
        </h1>

        {/* Meta badges */}
        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#10233A] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#800B34]" weight="bold" />
            <span>{durationMinutes} دقيقة</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-300 font-semibold">
            <Target className="w-3.5 h-3.5" weight="bold" />
            <span>{questionsCount} أسئلة تدريبية</span>
          </span>
        </div>
      </div>

      {/* Action Toolbar: Unified, balanced row with touch-friendly targets */}
      <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap relative">
        {/* Quick Mistakes Drill Button */}
        {unresolvedMistakesCount !== undefined && unresolvedMistakesCount > 0 && onOpenMistakesCapsule && (
          <button
            type="button"
            onClick={onOpenMistakesCapsule}
            className="min-h-[44px] px-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="مراجعة وتصحيح الأسئلة غير المتقنة في هذا الدرس"
          >
            <ArrowClockwise className="w-3.5 h-3.5 text-[#D97706]" weight="bold" />
            <span>أخطاء ({unresolvedMistakesCount})</span>
          </button>
        )}

        {/* Lesson Flashcards Recitation Button */}
        {onStartFlashcards && (
          <button
            type="button"
            onClick={onStartFlashcards}
            className="min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] hover:border-[#800B34]/40 text-[#12263F] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
            title="سمّع لنفسك مفاهيم ومصطلحات الدرس"
          >
            <Cards className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" weight="bold" />
            <span>تسميع الدرس</span>
          </button>
        )}

        {/* Lesson Exam Button */}
        {lessonId && (
          <Link
            href={`/exams/builder?subjectId=${subject.id}&unitId=${unit.id}&lessonId=${lessonId}`}
            className="min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] hover:border-[#800B34]/40 text-[#12263F] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
            title="بدء امتحان مخصص على هذا الدرس"
          >
            <Target className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" weight="bold" />
            <span>امتحان الدرس</span>
          </Link>
        )}

        {/* Complete Toggle Button (Primary CTA) */}
        <button
          type="button"
          onClick={onToggleComplete}
          disabled={isTogglingComplete}
          className={`min-h-[44px] px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 ${isCompleted
              ? "bg-[#D1FAE5] dark:bg-emerald-950/60 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-[#A7F3D0]"
              : "bg-[#800B34] hover:bg-[#680829] text-white"
            }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-300" weight="bold" />
              <span>اتقنتها خلاص</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5" weight="bold" />
              <span>تحديد كمكتمل</span>
            </>
          )}
        </button>

        {/* Utility Icon Group: Offline & Bookmark */}
        <div className="flex items-center border border-[#E8E9ED] dark:border-[#22364F] rounded-xl overflow-hidden bg-white dark:bg-[#10233A] shadow-2xs">
          {onToggleOffline && (
            <button
              type="button"
              onClick={onToggleOffline}
              disabled={isSavingOffline}
              className="h-11 w-11 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isSavedOffline ? "محفوظ بدون نت (اضغط للحذف)" : "حفظ الدرس أوفلاين"}
              aria-label={isSavedOffline ? "محفوظ بدون نت" : "حفظ الدرس أوفلاين"}
            >
              {isSavedOffline ? (
                <CloudCheck className="w-4 h-4 text-emerald-600" weight="bold" />
              ) : (
                <CloudArrowDown className="w-4 h-4" weight="bold" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleBookmark}
            disabled={isTogglingBookmark}
            className={`h-11 w-11 flex items-center justify-center transition-colors cursor-pointer border-r border-[#E8E9ED] dark:border-[#22364F] ${isBookmarked
                ? "bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185]"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            title={isBookmarked ? "إزالة من المحفوظات" : "حفظ في المفضلة"}
            aria-label={isBookmarked ? "إزالة من المحفوظات" : "حفظ في المفضلة"}
          >
            <BookmarkSimple className="w-4 h-4" weight={isBookmarked ? "fill" : "bold"} />
          </button>
        </div>

        {/* Bookmark Feedback Toast */}
        {bookmarkNotice && (
          <div className="absolute top-12 left-0 sm:left-auto sm:right-0 z-30 bg-[#0F172A] text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in duration-200">
            {bookmarkNotice}
          </div>
        )}
      </div>
    </div>
  );
}
