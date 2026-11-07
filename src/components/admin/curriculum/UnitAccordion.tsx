"use client";

import Link from "next/link";
import { ChevronDown, Edit, Plus, FileText, Trash2, FileDown, Eye, EyeOff } from "lucide-react";
import type { Unit } from "./types";
import { LessonRow } from "./LessonRow";

interface UnitAccordionProps {
  unit: Unit;
  subjectId: string;
  subjectName: string;
  isExpanded: boolean;
  togglingId: string | null;
  onToggleExpand: (unitId: string) => void;
  onEditUnit: (unit: Unit) => void;
  onDeleteUnit?: (id: string, title: string) => void;
  onExportUnit?: (unit: Unit, subjectName: string) => void;
  onCreateLesson: (context: { unitId: string; unitTitle: string; subjectName: string }) => void;
  onTogglePublished: (entity: "subject" | "unit" | "lesson", id: string, currentStatus: boolean) => void;
  onEditLesson: (id: string) => void;
  onDeleteLesson?: (id: string, title: string) => void;
}

export function UnitAccordion({
  unit,
  subjectId,
  subjectName,
  isExpanded,
  togglingId,
  onToggleExpand,
  onEditUnit,
  onDeleteUnit,
  onExportUnit,
  onCreateLesson,
  onTogglePublished,
  onEditLesson,
  onDeleteLesson,
}: UnitAccordionProps) {
  return (
    <div className="space-y-3 pb-3">
      {/* Unit Header Bar */}
      <div className="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-[#0D1B2E]/60 border-b border-[#E8E9ED] dark:border-[#22364F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title and Expansion Toggle */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onToggleExpand(unit.id)}
            className="flex items-center gap-2 text-right font-black text-xs sm:text-sm text-[#12263F] dark:text-white hover:text-[#800020] transition-colors cursor-pointer truncate"
          >
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                !isExpanded ? "-rotate-90" : ""
              }`}
            />
            <span className="truncate">{unit.title}</span>
          </button>

          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
            {unit.lessons.length} دروس
          </span>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 flex-wrap">
          {/* Add Lesson CTA */}
          <button
            type="button"
            onClick={() =>
              onCreateLesson({
                unitId: unit.id,
                unitTitle: unit.title,
                subjectName,
              })
            }
            className="h-8 px-3 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة درس</span>
          </button>

          {/* Unit Questions Link */}
          <Link
            href={`/admin/questions/import?subjectId=${subjectId}&unitId=${unit.id}`}
            className="h-8 px-2.5 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="استيراد أو إضافة أسئلة وورد لهذه الوحدة"
          >
            <FileText className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
            <span className="hidden md:inline">أسئلة الوحدة</span>
          </Link>

          {/* JSON Export */}
          {onExportUnit && (
            <button
              type="button"
              onClick={() => onExportUnit(unit, subjectName)}
              className="h-8 px-2.5 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تصدير أسئلة الوحدة كملف JSON للمقارنة والمراجعة"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">JSON</span>
            </button>
          )}

          {/* Published Toggle */}
          <button
            type="button"
            onClick={() => onTogglePublished("unit", unit.id, unit.isPublished)}
            disabled={togglingId === unit.id}
            className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
              unit.isPublished
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            {unit.isPublished ? (
              <>
                <Eye className="w-3 h-3" />
                <span>منشورة</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                <span>مخفية</span>
              </>
            )}
          </button>

          {/* Edit & Delete Mini Group */}
          <div className="flex items-center border border-[#E8E9ED] dark:border-[#22364F] rounded-lg overflow-hidden bg-white dark:bg-[#10233A]">
            <button
              type="button"
              onClick={() => onEditUnit(unit)}
              className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="تعديل اسم وبيانات الوحدة"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            {onDeleteUnit && (
              <button
                type="button"
                onClick={() => onDeleteUnit(unit.id, unit.title)}
                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors border-r border-[#E8E9ED] dark:border-[#22364F] cursor-pointer"
                title="حذف الوحدة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lessons Accordion Content */}
      {isExpanded && (
        <div className="px-3.5 sm:px-5 space-y-2 pt-1">
          {unit.lessons.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50/50 dark:bg-[#0D1B2E]/40 border border-dashed border-[#E8E9ED] dark:border-[#22364F] text-center space-y-2.5">
              <span className="text-xs font-bold text-slate-400 block">
                لا توجد دروس في هذه الوحدة بعد
              </span>
              <button
                type="button"
                onClick={() =>
                  onCreateLesson({
                    unitId: unit.id,
                    unitTitle: unit.title,
                    subjectName,
                  })
                }
                className="h-8 px-3.5 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة أول درس بالوحدة</span>
              </button>
            </div>
          ) : (
            unit.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                subjectId={subjectId}
                unitId={unit.id}
                togglingId={togglingId}
                onEditLesson={onEditLesson}
                onDeleteLesson={onDeleteLesson || (() => {})}
                onTogglePublished={(id, status) => onTogglePublished("lesson", id, status)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
