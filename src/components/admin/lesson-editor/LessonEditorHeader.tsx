"use client";

import { useRouter } from "next/navigation";
import { BookOpen, ExternalLink, Save, X, ArrowRight } from "lucide-react";
import type { UnitInfo } from "./types";

interface LessonEditorHeaderProps {
  lessonId: string;
  title: string;
  unitInfo: UnitInfo;
  isStandaloneRoute: boolean;
  isSaving: boolean;
  isLoading: boolean;
  onSave: () => void;
  onClose?: () => void;
}

export function LessonEditorHeader({
  lessonId,
  title,
  unitInfo,
  isStandaloneRoute,
  isSaving,
  isLoading,
  onSave,
  onClose,
}: LessonEditorHeaderProps) {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 bg-[#F8FAFC]/80 dark:bg-[#1E293B]/80 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3">
        {isStandaloneRoute && (
          <button
            type="button"
            onClick={() => router.push("/admin/curriculum")}
            className="p-2 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
            title="رجوع لإدارة المناهج"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
          style={{ backgroundColor: unitInfo.subjectColor || "#800020" }}
        >
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap text-[13px] text-[#64748B] font-bold mb-1">
            <span>{unitInfo.subjectName}</span>
            <span>/</span>
            <span>{unitInfo.unitTitle}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white leading-tight">
            {title ? `تعديل: ${title}` : "تعديل محتوى الدرس"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`/lessons/${lessonId}`}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex h-11 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-bold items-center gap-2 transition-colors"
        >
          <span>معاينة الطالب</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || isLoading}
          className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>جارٍ الحفظ...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </>
          )}
        </button>

        {!isStandaloneRoute && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
