"use client";

import { Eye, EyeOff, Plus } from "lucide-react";
import type { Subject, Unit } from "./types";
import { UnitAccordion } from "./UnitAccordion";

interface SubjectCardProps {
  subject: Subject;
  expandedUnits: Record<string, boolean>;
  togglingId: string | null;
  onToggleExpand: (unitId: string) => void;
  onOpenCreateUnit: (subjectId: string, subjectName: string) => void;
  onEditUnit: (unit: Unit) => void;
  onCreateLesson: (context: { unitId: string; unitTitle: string; subjectName: string }) => void;
  onTogglePublished: (entity: "subject" | "unit" | "lesson", id: string, currentStatus: boolean) => void;
  onEditLesson: (id: string) => void;
}

export function SubjectCard({
  subject,
  expandedUnits,
  togglingId,
  onToggleExpand,
  onOpenCreateUnit,
  onEditUnit,
  onCreateLesson,
  onTogglePublished,
  onEditLesson,
}: SubjectCardProps) {
  const totalLessons = subject.units.reduce((acc, u) => acc + u.lessons.length, 0);

  return (
    <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
      {/* Subject Header */}
      <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: subject.color || "#800020" }}
          />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
              {subject.name}
            </h3>
            <span className="text-[13px] text-[#64748B] font-bold">
              {subject.units.length} وحدات • {totalLessons} درساً
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => onOpenCreateUnit(subject.id, subject.name)}
            className="h-11 px-3 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-transform active:opacity-80"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة وحدة</span>
          </button>

          <button
            onClick={() => onTogglePublished("subject", subject.id, subject.isPublished)}
            disabled={togglingId === subject.id}
            className={`h-11 px-3 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-colors ${
              subject.isPublished
                ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399] border border-[#059669]/20"
                : "bg-[#E2E8F0] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]"
            }`}
          >
            {subject.isPublished ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>منشور للطلاب</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>مسودة (مخفي)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Units List */}
      <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
        {subject.units.length === 0 ? (
          <div className="p-8 text-center text-[13px] font-bold text-[#94A3B8]">
            لا توجد وحدات في هذه المادة بعد. اضغط "إضافة وحدة" للبدء.
          </div>
        ) : (
          subject.units.map((unit) => (
            <UnitAccordion
              key={unit.id}
              unit={unit}
              subjectId={subject.id}
              subjectName={subject.name}
              isExpanded={expandedUnits[unit.id] ?? true}
              togglingId={togglingId}
              onToggleExpand={onToggleExpand}
              onEditUnit={onEditUnit}
              onCreateLesson={onCreateLesson}
              onTogglePublished={onTogglePublished}
              onEditLesson={onEditLesson}
            />
          ))
        )}
      </div>
    </div>
  );
}
