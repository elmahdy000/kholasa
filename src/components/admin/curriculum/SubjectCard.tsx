"use client";

import Link from "next/link";
import { Eye, EyeOff, Plus, UploadCloud, Edit3, Trash2, HelpCircle } from "lucide-react";
import type { Subject, Unit } from "./types";
import { UnitAccordion } from "./UnitAccordion";

interface SubjectCardProps {
  subject: Subject;
  trackName?: string;
  expandedUnits: Record<string, boolean>;
  togglingId: string | null;
  onToggleExpand: (unitId: string) => void;
  onOpenCreateUnit: (subjectId: string, subjectName: string) => void;
  onOpenBulkImport?: (subjectId: string) => void;
  onEditSubject?: (subject: Subject) => void;
  onDeleteSubject?: (subjectId: string, subjectName: string) => void;
  onEditUnit: (unit: Unit) => void;
  onDeleteUnit?: (id: string, title: string) => void;
  onCreateLesson: (context: { unitId: string; unitTitle: string; subjectName: string }) => void;
  onTogglePublished: (entity: "subject" | "unit" | "lesson", id: string, currentStatus: boolean) => void;
  onEditLesson: (id: string) => void;
  onDeleteLesson?: (id: string, title: string) => void;
}

export function SubjectCard({
  subject,
  trackName,
  expandedUnits,
  togglingId,
  onToggleExpand,
  onOpenCreateUnit,
  onOpenBulkImport,
  onEditSubject,
  onDeleteSubject,
  onEditUnit,
  onDeleteUnit,
  onCreateLesson,
  onTogglePublished,
  onEditLesson,
  onDeleteLesson,
}: SubjectCardProps) {
  const totalLessons = subject.units.reduce((acc, u) => acc + u.lessons.length, 0);
  const questionsCount = subject._count?.questions ?? 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs overflow-hidden transition-all">
      {/* Subject Header */}
      <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className="w-4 h-4 rounded-full shrink-0 mt-1 sm:mt-0"
            style={{ backgroundColor: subject.color || "#800020" }}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
                {subject.name}
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#E2E8F0] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
                #{subject.code}
              </span>

              {/* Classification Badges */}
              {subject.trackId ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] border border-[#800020]/20">
                  تخصصي: {trackName || "مسار محدد"}
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  مادة عامة مشتركة
                </span>
              )}

              {subject.isElective && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  اختياري {subject.electiveGroup ? `(${subject.electiveGroup})` : ""}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8] font-bold mt-1.5 flex-wrap">
              <span>{subject.units.length} وحدات</span>
              <span>•</span>
              <span>{totalLessons} درساً</span>
              <span>•</span>
              <span className="text-[#800020] dark:text-[#FB7185]">{questionsCount} سؤالاً</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
          {/* Question Bank Direct Link */}
          <Link
            href={`/admin/questions?subjectId=${subject.id}`}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="فتح بنك الأسئلة والمفاهيم لهذه المادة"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
            <span>بنك الأسئلة</span>
          </Link>

          {/* Bulk Import */}
          {onOpenBulkImport && (
            <button
              type="button"
              onClick={() => onOpenBulkImport(subject.id)}
              className="h-10 px-3 rounded-xl border border-[#800020]/30 hover:bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="استيراد هيكل الوحدات والدروس دفعة واحدة لهذه المادة"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>استيراد هيكل</span>
            </button>
          )}

          {/* Add Unit Button */}
          <button
            type="button"
            onClick={() => onOpenCreateUnit(subject.id, subject.name)}
            className="h-10 px-3.5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center gap-1.5 transition-transform active:opacity-80 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة وحدة</span>
          </button>

          {/* Toggle Publish */}
          <button
            type="button"
            onClick={() => onTogglePublished("subject", subject.id, subject.isPublished)}
            disabled={togglingId === subject.id}
            className={`h-10 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subject.isPublished
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-[#E2E8F0] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]"
            }`}
          >
            {subject.isPublished ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>منشور</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>مسودة</span>
              </>
            )}
          </button>

          {/* Edit Subject */}
          {onEditSubject && (
            <button
              type="button"
              onClick={() => onEditSubject(subject)}
              className="h-10 w-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="تعديل المادة"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Subject */}
          {onDeleteSubject && (
            <button
              type="button"
              onClick={() => onDeleteSubject(subject.id, subject.name)}
              className="h-10 w-10 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
              title="حذف المادة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Units List */}
      <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
        {subject.units.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-[#94A3B8]">
            لا توجد وحدات في هذه المادة بعد. اضغط "إضافة وحدة" أو "استيراد هيكل" لإضافة الوحدات والدروس.
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
              onDeleteUnit={onDeleteUnit}
              onCreateLesson={onCreateLesson}
              onTogglePublished={onTogglePublished}
              onEditLesson={onEditLesson}
              onDeleteLesson={onDeleteLesson}
            />
          ))
        )}
      </div>
    </div>
  );
}
