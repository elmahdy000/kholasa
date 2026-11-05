"use client";

import { useState } from "react";
import {
  X,
  BookOpen,
  Cards,
  Graph,
  Clock,
  Trash,
  CheckCircle,
  Lightbulb,
  WarningCircle,
  BookmarkSimple,
} from "@phosphor-icons/react";
import type { OfflineLessonData } from "@/lib/offline-db";
import { FormattedDefinitionView } from "@/components/ui/FormattedDefinitionView";

interface OfflineLessonViewerModalProps {
  lesson: OfflineLessonData | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (lessonId: string) => void;
}

export function OfflineLessonViewerModal({
  lesson,
  isOpen,
  onClose,
  onDelete,
}: OfflineLessonViewerModalProps) {
  const [activeTab, setActiveTab] = useState<"content" | "summary" | "mindmap">("content");

  if (!isOpen || !lesson) return null;

  const summary = lesson.summary as any;
  const definitions = (summary?.definitions as any[]) || [];
  const keyConcepts = (summary?.keyConcepts as any[]) || [];
  const formulas = (summary?.formulas as any[]) || [];
  const commonMistakes = (summary?.commonMistakes as any[]) || [];
  const examTips = (summary?.examTips as any[]) || [];
  const mindMap = lesson.mindMap as any;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 text-right animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-4 shrink-0 bg-[#F8FAFC] dark:bg-[#1E293B]/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-bold text-[#800020] dark:text-[#FB7185]">
                {lesson.subjectName}
              </span>
              <span className="text-[12px] text-[#64748B]">•</span>
              <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                {lesson.unitTitle}
              </span>
              <span className="text-[12px] text-[#64748B]">•</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] dark:text-[#34D399] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" weight="bold" />
                <span>مذاكرة أوفلاين بدون نت</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
              {lesson.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDelete(lesson.id)}
              className="h-9 px-3 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="حذف من ذاكرة الجهاز"
            >
              <Trash className="w-4 h-4" />
              <span className="hidden sm:inline">حذف</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="p-2 border-b border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] flex items-center gap-2 shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`h-10 px-4 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "content"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
            }`}
          >
            <BookOpen className="w-4 h-4" weight="bold" />
            <span>شرح الدرس</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`h-10 px-4 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "summary"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
            }`}
          >
            <Cards className="w-4 h-4" weight="bold" />
            <span>الزتونة والمصطلحات ({definitions.length + keyConcepts.length})</span>
          </button>

          {mindMap?.images && mindMap.images.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("mindmap")}
              className={`h-10 px-4 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "mindmap"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
              }`}
            >
              <Graph className="w-4 h-4" weight="bold" />
              <span>الخريطة الذهنية</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: Content */}
          {activeTab === "content" && (
            <div className="space-y-6">
              {/* Objectives */}
              {lesson.objectives && lesson.objectives.length > 0 && (
                <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-2.5">
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#059669]" weight="bold" />
                    <span>أهداف الدرس ونواتج التعلم:</span>
                  </h3>
                  <ul className="space-y-1.5 pr-4 list-disc text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed">
                    {lesson.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Body */}
              <div className="prose dark:prose-invert max-w-none text-[#0F172A] dark:text-[#F8FAFC] text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                {lesson.body || "لا يوجد نص شرح إضافي لهذا الدرس."}
              </div>
            </div>
          )}

          {/* TAB 2: Golden Summary & Definitions */}
          {activeTab === "summary" && (
            <div className="space-y-6">
              {/* Definitions */}
              {definitions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                    <BookmarkSimple className="w-4 h-4 text-[#4F46E5]" weight="bold" />
                    <span>المصطلحات والمفاهيم الرئيسية:</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {definitions.map((def: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-2"
                      >
                        <h4 className="text-sm font-bold text-[#4F46E5] dark:text-[#6366F1]">
                          {def.term || def.title || `مفهوم ${idx + 1}`}
                        </h4>
                        <FormattedDefinitionView
                          text={def.definition || def.text || ""}
                          className="text-[13px] text-[#64748B] dark:text-[#94A3B8]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulas */}
              {formulas.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    القوانين والعلاقات الرياضية:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formulas.map((form: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-1"
                      >
                        <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">
                          {form.name || form.title}
                        </h4>
                        <p className="font-mono text-sm font-bold text-[#059669] dark:text-[#34D399]" dir="ltr">
                          {form.formula}
                        </p>
                        {form.description && (
                          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                            {form.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Tips & Common Mistakes */}
              {(examTips.length > 0 || commonMistakes.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examTips.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 space-y-2">
                      <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" weight="bold" />
                        <span>تكات وتوصيات الامتحان:</span>
                      </h4>
                      <ul className="space-y-1.5 pr-4 list-disc text-[12px] text-amber-900/90 dark:text-amber-200/90 font-medium">
                        {examTips.map((tip: any, i: number) => (
                          <li key={i}>{typeof tip === "string" ? tip : tip.tip || tip.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {commonMistakes.length > 0 && (
                    <div className="p-4 rounded-xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 space-y-2">
                      <h4 className="text-sm font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                        <WarningCircle className="w-4 h-4 text-red-600 dark:text-red-400" weight="bold" />
                        <span>أخطاء شائعة احذر منها:</span>
                      </h4>
                      <ul className="space-y-1.5 pr-4 list-disc text-[12px] text-red-900/90 dark:text-red-200/90 font-medium">
                        {commonMistakes.map((mis: any, i: number) => (
                          <li key={i}>{typeof mis === "string" ? mis : mis.mistake || mis.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Mind Map */}
          {activeTab === "mindmap" && mindMap?.images && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {mindMap.title || "الخريطة الذهنية التفاعلية للدرس"}
              </h3>
              <div className="space-y-4">
                {mindMap.images.map((imgUrl: string, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]"
                  >
                    <img
                      src={imgUrl}
                      alt={`خريطة ذهنية ${idx + 1}`}
                      className="w-full h-auto object-contain max-h-[70vh] mx-auto pointer-events-none select-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
