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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E9ED] dark:border-[#22364F] pb-5">
      <div className="space-y-2 min-w-0 flex-1">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
          <Link href="/subjects" className="hover:text-[#800B34] dark:hover:text-[#FB7185] transition-colors">
            المواد
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <Link
            href={`/subjects/${subject.id}`}
            className="hover:text-[#800B34] dark:hover:text-[#FB7185] transition-colors"
          >
            {subject.name}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-[#091B40] dark:text-white truncate">{unit.title}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-[#091B40] dark:text-white tracking-tight leading-snug">
          {lessonTitle}
        </h1>

        {/* Meta Badges */}
        <div className="flex items-center gap-2 text-xs font-bold flex-wrap pt-0.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#800B34]/10 dark:bg-[#800B34]/20 border border-[#800B34]/20 dark:border-[#FB7185]/30 text-[#800B34] dark:text-[#FB7185]">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>منهج اللغة العربية التفاعلي</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#10233A] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-[#800B34] dark:text-[#E9AD32]" />
            <span>{durationMinutes} دقيقة</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-300">
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
            className="min-h-[44px] px-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D97706]" />
            <span>أخطاء ({unresolvedMistakesCount})</span>
          </button>
        )}

        {lessonId && (
          <Link
            href={`/exams/builder?subjectId=${subject.id}&unitId=${unit.id}&lessonId=${lessonId}`}
            className="min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] hover:border-[#800B34]/40 text-[#091B40] dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Target className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" />
            <span>امتحان الدرس</span>
          </Link>
        )}

        <button
          type="button"
          onClick={onToggleComplete}
          disabled={isTogglingComplete}
          className={`min-h-[44px] px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
            isCompleted
              ? "bg-[#D1FAE5] dark:bg-emerald-950/60 text-[#065F46] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
              : "bg-[#800B34] hover:bg-[#680829] text-white"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isCompleted ? "تم إكمال الدرس ✓" : "تحديد كمكتمل"}</span>
        </button>

        <div className="flex items-center border border-[#E8E9ED] dark:border-[#22364F] rounded-xl overflow-hidden bg-white dark:bg-[#10233A]">
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
                <CloudCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <CloudDownload className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleBookmark}
            disabled={isTogglingBookmark}
            className={`h-11 w-11 flex items-center justify-center transition-colors cursor-pointer border-r border-[#E8E9ED] dark:border-[#22364F] ${
              isBookmarked
                ? "bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185]"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={isBookmarked ? "إزالة من المحفوظات" : "حفظ في المفضلة"}
            aria-label={isBookmarked ? "إزالة من المحفوظات" : "حفظ في المفضلة"}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>

        {bookmarkNotice && (
          <div className="absolute top-12 left-0 sm:left-auto sm:right-0 z-30 bg-[#091B40] text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap">
            {bookmarkNotice}
          </div>
        )}
      </div>
    </div>
  );
}
