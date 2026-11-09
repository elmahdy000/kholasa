"use client";

import Link from "next/link";
import { Play, Settings2, Maximize2, FileText, ExternalLink, Trash2, Eye, EyeOff, Clock, Users } from "lucide-react";
import type { Lesson } from "./types";

interface LessonRowProps {
  lesson: Lesson;
  subjectId: string;
  unitId: string;
  togglingId: string | null;
  onEditLesson: (id: string) => void;
  onDeleteLesson: (id: string, title: string) => void;
  onTogglePublished: (id: string, currentStatus: boolean) => void;
}

export function LessonRow({
  lesson,
  subjectId,
  unitId,
  togglingId,
  onEditLesson,
  onDeleteLesson,
  onTogglePublished,
}: LessonRowProps) {
  return (
    <div className="group p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] hover:border-[#800020]/40 dark:hover:border-slate-600 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Lesson Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Order Number Badge */}
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0D1B2E] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
          #{lesson.order}
        </div>

        {/* Video / Play Icon */}
        <div className="w-8 h-8 rounded-lg bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] flex items-center justify-center shrink-0">
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        </div>

        {/* Title and Stats */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-[#12263F] dark:text-white truncate">
              {lesson.title}
            </span>
            {lesson.isTrial && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                ⭐️ تجريبي للزوار
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{lesson.durationMinutes} دقيقة</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span>{lesson.viewsCount} مشاهدة</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar: Unified, sleek heights (h-8) and consistent styling */}
      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 flex-wrap">
        {/* Primary CTA: Edit Content & Media */}
        <button
          type="button"
          onClick={() => onEditLesson(lesson.id)}
          className="h-8 px-3 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>إدارة المحتوى</span>
        </button>

        {/* Lesson Questions CTA */}
        <Link
          href={`/admin/questions/import?subjectId=${subjectId}&unitId=${unitId}&lessonId=${lesson.id}`}
          className="h-8 px-2.5 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] bg-[#F8FAFA] dark:bg-[#0D1B2E] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          title="استيراد أو ربط أسئلة وورد بهذا الدرس"
        >
          <FileText className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
          <span className="hidden md:inline">أسئلة الدرس</span>
        </Link>

        {/* Publish Status Toggle */}
        <button
          type="button"
          onClick={() => onTogglePublished(lesson.id, lesson.isPublished)}
          disabled={togglingId === lesson.id}
          className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
            lesson.isPublished
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
          }`}
          title={lesson.isPublished ? "الدرس معروض للطلاب - انقر للإخفاء" : "الدرس مسودة - انقر للنشر"}
        >
          {lesson.isPublished ? (
            <>
              <Eye className="w-3 h-3" />
              <span>منشور</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" />
              <span>مخفي</span>
            </>
          )}
        </button>

        {/* Quick Utility Icon Group */}
        <div className="flex items-center border border-[#E8E9ED] dark:border-[#22364F] rounded-lg overflow-hidden bg-[#F8FAFA] dark:bg-[#0D1B2E]">
          {/* Preview in student view */}
          <Link
            href={`/lessons/${lesson.id}`}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            target="_blank"
            title="معاينة الدرس كطالب"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Standalone Lesson Page Link */}
          <Link
            href={`/admin/curriculum/lessons/${lesson.id}`}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors border-r border-[#E8E9ED] dark:border-[#22364F]"
            title="فتح في صفحة مستقلة برابط مباشر"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Link>

          {/* Delete Lesson Button */}
          <button
            type="button"
            onClick={() => onDeleteLesson(lesson.id, lesson.title)}
            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors border-r border-[#E8E9ED] dark:border-[#22364F] cursor-pointer"
            title="حذف الدرس"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
