"use client";

import Link from "next/link";
import { ChevronDown, Edit, Plus, FileText } from "lucide-react";
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
  onCreateLesson: (context: { unitId: string; unitTitle: string; subjectName: string }) => void;
  onTogglePublished: (entity: "subject" | "unit" | "lesson", id: string, currentStatus: boolean) => void;
  onEditLesson: (id: string) => void;
}

export function UnitAccordion({
  unit,
  subjectId,
  subjectName,
  isExpanded,
  togglingId,
  onToggleExpand,
  onEditUnit,
  onCreateLesson,
  onTogglePublished,
  onEditLesson,
}: UnitAccordionProps) {
  return (
    <div className="p-4 sm:p-5 space-y-3">
      {/* Unit Title and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleExpand(unit.id)}
            className="flex items-center gap-2 text-right font-bold text-[13px] sm:text-sm text-[#0F172A] dark:text-white hover:text-[#800020] transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 text-[#94A3B8] transition-transform ${
                !isExpanded ? "-rotate-90" : ""
              }`}
            />
            <span>{unit.title}</span>
            <span className="text-[13px] font-bold text-[#94A3B8]">
              ({unit.lessons.length} دروس)
            </span>
          </button>

          <button
            onClick={() => onEditUnit(unit)}
            className="p-1 rounded-md text-[#94A3B8] hover:text-[#800020] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
            title="تعديل بيانات الوحدة"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() =>
              onCreateLesson({
                unitId: unit.id,
                unitTitle: unit.title,
                subjectName,
              })
            }
            className="h-7 px-3 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] hover:bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] text-[13px] font-bold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>إضافة درس</span>
          </button>

          <Link
            href={`/admin/questions/import?subjectId=${subjectId}&unitId=${unit.id}`}
            className="h-7 px-3 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] hover:bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] text-[13px] font-bold flex items-center gap-1 transition-colors border border-[#E2E8F0]/50 dark:border-[#E11D48]/50"
            title="استيراد أو إضافة أسئلة وورد لهذه الوحدة"
          >
            <FileText className="w-3 h-3 text-[#800020] dark:text-[#FB7185]" />
            <span>أسئلة الوحدة</span>
          </Link>

          <button
            onClick={() => onTogglePublished("unit", unit.id, unit.isPublished)}
            disabled={togglingId === unit.id}
            className={`h-7 px-3 rounded-lg text-[13px] font-bold flex items-center gap-1 transition-colors ${
              unit.isPublished
                ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399]"
                : "bg-[#F8FAFC] text-[#94A3B8]"
            }`}
          >
            {unit.isPublished ? "الوحدة منشورة" : "الوحدة مخفية"}
          </button>
        </div>
      </div>

      {/* Lessons Accordion Content */}
      {isExpanded && (
        <div className="pr-4 sm:pr-6 space-y-2 pt-1">
          {unit.lessons.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-dashed border-[#E2E8F0] dark:border-[#334155] text-center">
              <span className="text-[13px] font-bold text-[#94A3B8] block mb-2">
                لا توجد دروس في هذه الوحدة بعد
              </span>
              <button
                onClick={() =>
                  onCreateLesson({
                    unitId: unit.id,
                    unitTitle: unit.title,
                    subjectName,
                  })
                }
                className="h-11 px-3 rounded-lg bg-[#800020] text-white text-[13px] font-bold inline-flex items-center gap-2"
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
                onTogglePublished={(id, status) => onTogglePublished("lesson", id, status)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
