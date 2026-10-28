"use client";

import Link from "next/link";
import { Play, Settings2, Maximize2, FileText, ExternalLink } from "lucide-react";
import type { Lesson } from "./types";

interface LessonRowProps {
  lesson: Lesson;
  subjectId: string;
  unitId: string;
  togglingId: string | null;
  onEditLesson: (id: string) => void;
  onTogglePublished: (id: string, currentStatus: boolean) => void;
}

export function LessonRow({
  lesson,
  subjectId,
  unitId,
  togglingId,
  onEditLesson,
  onTogglePublished,
}: LessonRowProps) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0]/80 dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#800020]/10 text-[#800020] flex items-center justify-center shrink-0">
          <Play className="w-3.5 h-3.5 fill-current ml-1" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-[#0F172A] dark:text-white">
              {lesson.title}
            </span>
            <span className="text-[13px] font-mono px-2 py-0.2 rounded bg-[#E2E8F0] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
              #{lesson.order}
            </span>
          </div>
          <span className="text-[13px] text-[#94A3B8] flex items-center gap-2 mt-1">
            <span>{lesson.durationMinutes} دقيقة</span>
            <span>•</span>
            <span>{lesson.viewsCount} مشاهدة</span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
        <button
          onClick={() => onEditLesson(lesson.id)}
          className="h-7 px-3 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-1 transition-transform active:opacity-80 cursor-pointer"
        >
          <Settings2 className="w-3 h-3" />
          <span>إدارة المحتوى والوسائط</span>
        </button>

        <Link
          href={`/admin/curriculum/lessons/${lesson.id}`}
          className="h-7 px-2 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white text-[13px] font-bold flex items-center justify-center transition-colors border border-[#E2E8F0] dark:border-[#334155]"
          title="فتح في صفحة مستقلة برابط مباشر"
        >
          <Maximize2 className="w-3 h-3" />
        </Link>

        <Link
          href={`/admin/questions/import?subjectId=${subjectId}&unitId=${unitId}&lessonId=${lesson.id}`}
          className="h-7 px-3 rounded-lg bg-[#800020]/10 hover:bg-[#800020]/10 dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold flex items-center gap-1 transition-colors border border-[#E2E8F0]/50 dark:border-[#E11D48]/50"
          title="استيراد أو ربط أسئلة وورد بهذا الدرس"
        >
          <FileText className="w-3 h-3 text-[#800020] dark:text-[#FB7185]" />
          <span>أسئلة الدرس</span>
        </Link>

        <Link
          href={`/lessons/${lesson.id}`}
          className="h-7 px-3 rounded-lg bg-[#E2E8F0] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-bold flex items-center gap-1 transition-colors"
          target="_blank"
        >
          <ExternalLink className="w-3 h-3" />
          <span>معاينة</span>
        </Link>

        <button
          onClick={() => onTogglePublished(lesson.id, lesson.isPublished)}
          disabled={togglingId === lesson.id}
          className={`h-7 px-3 rounded-lg text-[13px] font-bold transition-colors ${
            lesson.isPublished
              ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399]"
              : "bg-[#E2E8F0] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]"
          }`}
        >
          {lesson.isPublished ? "منشور" : "مخفي"}
        </button>
      </div>
    </div>
  );
}
