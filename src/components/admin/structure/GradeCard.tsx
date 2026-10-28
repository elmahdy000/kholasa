"use client";

import { Plus, Edit2, Trash2 } from "lucide-react";
import { Grade, Subject } from "./types";

interface GradeCardProps {
  grade: Grade;
  onAddSubject: (gradeId: string) => void;
  onEditGrade: (grade: Grade) => void;
  onDeleteGrade: (gradeId: string) => void;
  onEditSubject: (gradeId: string, subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export function GradeCard({
  grade,
  onAddSubject,
  onEditGrade,
  onDeleteGrade,
  onEditSubject,
  onDeleteSubject,
}: GradeCardProps) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] dark:border-[#334155]/80 bg-[#F8FAFC]/50 dark:bg-[#1E293B]/20 p-4 space-y-3">
      {/* Grade Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0]/60 dark:border-[#334155]/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
            {grade.name}
          </span>
          <span className="text-[13px] font-mono text-[#64748B] px-2 py-1 rounded bg-[#E2E8F0] dark:bg-[#334155]">
            {grade.code}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddSubject(grade.id)}
            className="h-7 px-3 rounded text-[13px] font-semibold bg-[#334155] dark:bg-[#F8FAFC] text-white dark:text-[#1E293B] hover:opacity-90 flex items-center gap-1 transition-opacity cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>إضافة مادة</span>
          </button>
          <button
            onClick={() => onEditGrade(grade)}
            className="p-1 rounded text-[#64748B] hover:text-[#64748B] dark:hover:text-[#F8FAFC]"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteGrade(grade.id)}
            className="p-1 rounded text-[#64748B] hover:text-[#DC2626]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subjects Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
        {grade.subjects.map((sub) => (
          <div
            key={sub.id}
            className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]/80 hover:border-[#E2E8F0] dark:hover:border-[#E11D48]/60 transition-colors flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: sub.color || "#800020" }}
                />
                <span className="font-bold text-[13px] text-[#0F172A] dark:text-[#F8FAFC]">
                  {sub.name}
                </span>
              </div>
              <span className="text-[13px] font-mono text-[#64748B]">
                {sub.code}
              </span>
            </div>

            <div className="flex items-center justify-between text-[13px] text-[#64748B] pt-1 border-t border-[#E2E8F0] dark:border-[#334155]">
              <span className="font-mono">
                {sub._count?.units || 0} وحدات · {sub._count?.exams || 0} امتحانات
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditSubject(grade.id, sub)}
                  className="p-1 rounded text-[#64748B] hover:text-[#64748B]"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDeleteSubject(sub.id)}
                  className="p-1 rounded text-[#64748B] hover:text-[#DC2626]"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {grade.subjects.length === 0 && (
          <div className="col-span-full py-4 text-center text-[13px] text-[#64748B] border border-dashed border-[#E2E8F0] dark:border-[#334155] rounded">
            لا توجد مواد دراسية مضافة لهذا الصف بعد.
          </div>
        )}
      </div>
    </div>
  );
}
