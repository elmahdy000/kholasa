"use client";

import Link from "next/link";
import { Eye, EyeOff, Plus, UploadCloud, Edit3, Trash2, HelpCircle, BookOpen, Layers } from "lucide-react";
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
  onExportUnit?: (unit: Unit, subjectName: string) => void;
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
  onExportUnit,
  onCreateLesson,
  onTogglePublished,
  onEditLesson,
  onDeleteLesson,
}: SubjectCardProps) {
  const totalLessons = subject.units.reduce((acc, u) => acc + u.lessons.length, 0);
  const questionsCount = subject._count?.questions ?? 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs overflow-hidden transition-all">
      {/* Subject Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-l from-slate-50 via-white to-white dark:from-[#0D1B2E] dark:via-[#10233A] dark:to-[#10233A] border-b border-[#E8E9ED] dark:border-[#22364F] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Subject Info */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          {/* Subject Color Pill / Accent */}
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 sm:mt-0 ring-4 ring-black/5 dark:ring-white/10"
            style={{ backgroundColor: subject.color || "#800020" }}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-[#12263F] dark:text-white">
                {subject.name}
              </h3>

              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0D1B2E] border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                #{subject.code}
              </span>

              {/* Classification Badges */}
              {subject.trackId ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] border border-[#800020]/20 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>تخصصي: {trackName || "مسار محدد"}</span>
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>مادة عامة مشتركة</span>
                </span>
              )}

              {subject.isElective && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  اختياري {subject.electiveGroup ? `(${subject.electiveGroup})` : ""}
                </span>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-bold mt-1.5 flex-wrap">
              <span>{subject.units.length} وحدات</span>
              <span>•</span>
              <span>{totalLessons} درساً</span>
              <span>•</span>
              <span className="text-[#800020] dark:text-[#FB7185] font-black">{questionsCount} سؤالاً</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 self-start lg:self-center shrink-0 flex-wrap">
          {/* Question Bank Link */}
          <Link
            href={`/admin/questions?subjectId=${subject.id}`}
            className="h-9 px-3 rounded-xl border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#12263F] dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
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
              className="h-9 px-3 rounded-xl border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#12263F] dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="استيراد هيكل الوحدات والدروس دفعة واحدة لهذه المادة"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>استيراد هيكل</span>
            </button>
          )}

          {/* Add Unit Button (Primary CTA) */}
          <button
            type="button"
            onClick={() => onOpenCreateUnit(subject.id, subject.name)}
            className="h-9 px-3.5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة وحدة</span>
          </button>

          {/* Publish Toggle Button */}
          <button
            type="button"
            onClick={() => onTogglePublished("subject", subject.id, subject.isPublished)}
            disabled={togglingId === subject.id}
            className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              subject.isPublished
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
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

          {/* Edit & Delete Mini Group */}
          <div className="flex items-center border border-[#E8E9ED] dark:border-[#22364F] rounded-xl overflow-hidden bg-white dark:bg-[#0D1B2E]">
            {onEditSubject && (
              <button
                type="button"
                onClick={() => onEditSubject(subject)}
                className="h-9 w-9 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="تعديل المادة"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDeleteSubject && (
              <button
                type="button"
                onClick={() => onDeleteSubject(subject.id, subject.name)}
                className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors border-r border-[#E8E9ED] dark:border-[#22364F] cursor-pointer"
                title="حذف المادة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Units List */}
      <div className="divide-y divide-[#E8E9ED] dark:divide-[#22364F]">
        {subject.units.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400">
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
              onExportUnit={onExportUnit}
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
