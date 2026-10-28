"use client";

import Link from "next/link";
import { Clock, BookmarkSimple, CheckCircle, Check } from "@phosphor-icons/react";

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
  lessonTitle: string;
  durationMinutes: number;
  questionsCount: number;
  isBookmarked: boolean;
  isCompleted: boolean;
  isTogglingBookmark: boolean;
  isTogglingComplete: boolean;
  bookmarkNotice: string | null;
  onToggleBookmark: () => void;
  onToggleComplete: () => void;
}

export function LessonHeader({
  subject,
  unit,
  lessonTitle,
  durationMinutes,
  questionsCount,
  isBookmarked,
  isCompleted,
  isTogglingBookmark,
  isTogglingComplete,
  bookmarkNotice,
  onToggleBookmark,
  onToggleComplete,
}: LessonHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155] pb-5">
      <div>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] mb-2 flex-wrap">
          <Link href="/subjects" className="hover:text-[#800020] transition-colors">
            المواد
          </Link>
          <span>/</span>
          <Link href={`/subjects/${subject.id}`} className="hover:text-[#800020] transition-colors">
            {subject.name}
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] dark:text-white">{unit.title}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white leading-tight flex items-center gap-3">
          <span>{lessonTitle}</span>
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-2">
          <span className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#800020]" weight="bold" />
            <span>مدة الدرس: {durationMinutes} دقيقة</span>
          </span>
          <span>•</span>
          <span className="text-[#059669]">{questionsCount} أسئلة تدريبية</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 relative">
        {/* Bookmark Button */}
        <button
          onClick={onToggleBookmark}
          disabled={isTogglingBookmark}
          className={`h-11 px-3.5 rounded-lg border text-[13px] font-bold flex items-center gap-2 transition-colors ${
            isBookmarked
              ? "bg-[#800020]/10 border-[#800020]/30 text-[#800020]"
              : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#F8FAFC] hover:border-[#800020]/50"
          }`}
          title={isBookmarked ? "إزالة من المحفوظات" : "حفظ في المفضلة"}
        >
          <BookmarkSimple
            className="w-4 h-4"
            weight={isBookmarked ? "fill" : "bold"}
          />
          <span className="hidden sm:inline">
            {isBookmarked ? "محفوظ" : "حفظ"}
          </span>
        </button>

        {/* Complete Toggle Button */}
        <button
          onClick={onToggleComplete}
          disabled={isTogglingComplete}
          className={`h-11 px-4 rounded-lg font-bold text-[13px] flex items-center gap-2 transition-colors ${
            isCompleted
              ? "bg-[#059669] text-white hover:bg-[#047857]"
              : "bg-[#800020] text-white hover:bg-[#66001A]"
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-4 h-4" weight="bold" />
              <span>مكتمل</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" weight="bold" />
              <span>تحديد كمكتمل</span>
            </>
          )}
        </button>

        {/* Bookmark Feedback Toast */}
        {bookmarkNotice && (
          <div className="absolute top-12 left-0 sm:left-auto sm:right-0 z-30 bg-[#0F172A] text-white text-[12px] font-medium py-2 px-3 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in duration-200">
            {bookmarkNotice}
          </div>
        )}
      </div>
    </div>
  );
}
