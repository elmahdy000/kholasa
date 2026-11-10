"use client";

import Link from "next/link";
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  CloudCheck,
  CloudDownload,
  RotateCcw,
  Target,
} from "lucide-react";

interface ArabicLessonHeaderProps {
  subject: {
    id: string;
    name: string;
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
  onOpenMistakesCapsule?: () => void;
}

export function ArabicLessonHeader({
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
  onOpenMistakesCapsule,
}: ArabicLessonHeaderProps) {
  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-l from-[#FBF8F1] to-white dark:from-[#081A2E] dark:to-[#0D214D] border border-emerald-200/80 dark:border-emerald-900/50 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2 min-w-0 flex-1">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] flex-wrap">
          <Link href="/subjects" className="hover:text-[#0F5132] dark:hover:text-emerald-300 transition-colors">
            المواد
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <Link
            href={`/subjects/${subject.id}`}
            className="hover:text-[#0F5132] dark:hover:text-emerald-300 transition-colors"
          >
            {subject.name}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-[#0F2744] dark:text-white truncate">{unit.title}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-[#0F2744] dark:text-white tracking-tight leading-snug">
          {lessonTitle}
        </h1>

        {/* Arabic Scholarly Badges */}
        <div className="flex items-center gap-2 text-xs font-bold flex-wrap pt-0.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F5132]/10 dark:bg-emerald-950/60 border border-[#0F5132]/25 dark:border-emerald-800/70 text-[#0F5132] dark:text-emerald-300">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>مسار اللغة العربية التفاعلي</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#10233A] border border-slate-200 dark:border-slate-700 text-[#0F2744] dark:text-slate-200">
            <Clock className="w-3.5 h-3.5 text-[#B45309]" />
            <span>{durationMinutes} دقيقة</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[#B45309] dark:text-amber-300">
            <Target className="w-3.5 h-3.5" />
            <span>{questionsCount} سؤالاً وتدريباً</span>
          </span>
        </div>
      </div>

      {/* Action Toolbar (No Programming "تسميع الدرس" Flashcards!) */}
      <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap relative">
        {unresolvedMistakesCount !== undefined && unresolvedMistakesCount > 0 && onOpenMistakesCapsule && (
          <button
            type="button"
            onClick={onOpenMistakesCapsule}
            className="min-h-[44px] px-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70 hover:bg-amber-100 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#B45309]" />
            <span>أخطاء ({unresolvedMistakesCount})</span>
          </button>
        )}

        {lessonId && (
          <Link
            href={`/exams/builder?subjectId=${subject.id}&unitId=${unit.id}&lessonId=${lessonId}`}
            className="min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#10233A] border border-emerald-200 dark:border-[#22364F] hover:border-[#0F5132] text-[#0F2744] dark:text-slate-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors"
          >
            <Target className="w-4 h-4 text-[#0F5132] dark:text-emerald-300" />
            <span>امتحان الدرس</span>
          </Link>
        )}

        <button
          type="button"
          onClick={onToggleComplete}
          disabled={isTogglingComplete}
          className={`min-h-[44px] px-4 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
            isCompleted
              ? "bg-emerald-100 dark:bg-emerald-950/60 text-[#0F5132] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
              : "bg-[#0F5132] hover:bg-[#0B3D26] text-white"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isCompleted ? "تم إكمال الدرس ✓" : "تحديد كمكتمل"}</span>
        </button>

        <div className="flex items-center border border-emerald-200 dark:border-[#22364F] rounded-xl overflow-hidden bg-white dark:bg-[#10233A]">
          {onToggleOffline && (
            <button
              type="button"
              onClick={onToggleOffline}
              disabled={isSavingOffline}
              className="h-11 w-11 flex items-center justify-center text-slate-500 hover:text-[#0F5132] dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isSavedOffline ? "محفوظ بدون نت (اضغط للحذف)" : "حفظ الدرس أوفلاين"}
              aria-label={isSavedOffline ? "محفوظ بدون نت" : "حفظ الدرس أوفلاين"}
            >
              {isSavedOffline ? (
                <CloudCheck className="w-4 h-4 text-[#0F5132]" />
              ) : (
                <CloudDownload className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleBookmark}
            disabled={isTogglingBookmark}
            className={`h-11 w-11 flex items-center justify-center transition-colors cursor-pointer border-r border-emerald-200 dark:border-[#22364F] ${
              isBookmarked
                ? "bg-amber-50 text-[#B45309] dark:text-amber-300"
                : "text-slate-500 hover:text-[#0F5132] dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-slate-800"
            }`}
            title={isBookmarked ? "إزالة من المحفوظات" : "حفظ في المفضلة"}
            aria-label={isBookmarked ? "إزالة من المحفوظات" : "حفظ في المفضلة"}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>

        {bookmarkNotice && (
          <div className="absolute top-12 left-0 sm:left-auto sm:right-0 z-30 bg-[#0F2744] text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap">
            {bookmarkNotice}
          </div>
        )}
      </div>
    </div>
  );
}

