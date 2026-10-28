"use client";

import { GraduationCap, Edit2, Loader2 } from "lucide-react";
import type { EducationalSystem } from "./types";

interface AcademicSetupCardProps {
  userSystemName?: string | null;
  userGradeName?: string | null;
  isEditingAcademic: boolean;
  selectedSystemId: string;
  selectedGradeId: string;
  isSaving: boolean;
  systems: EducationalSystem[];
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSystemChange: (id: string) => void;
  onGradeChange: (id: string) => void;
  onSaveAcademic: () => void;
}

export function AcademicSetupCard({
  userSystemName,
  userGradeName,
  isEditingAcademic,
  selectedSystemId,
  selectedGradeId,
  isSaving,
  systems,
  onStartEditing,
  onCancelEditing,
  onSystemChange,
  onGradeChange,
  onSaveAcademic,
}: AcademicSetupCardProps) {
  const currentGrades = systems.find((s) => s.id === selectedSystemId)?.grades || [];

  return (
    <div className="p-6 sm:p-7 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
        <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
          <span>المسار التعليمي والصف الدراسي</span>
        </h2>
        {!isEditingAcademic && (
          <button
            onClick={onStartEditing}
            className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>تعديل</span>
          </button>
        )}
      </div>

      {!isEditingAcademic ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155]">
            <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">
              النظام التعليمي
            </span>
            <span className="text-sm font-bold text-[#0F172A] dark:text-white">
              {userSystemName || "غير محدد"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155]">
            <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">
              الصف الدراسي
            </span>
            <span className="text-sm font-bold text-[#0F172A] dark:text-white">
              {userGradeName || "غير محدد"}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2">
                النظام التعليمي
              </label>
              <select
                value={selectedSystemId}
                onChange={(e) => onSystemChange(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
              >
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2">
                الصف الدراسي
              </label>
              <select
                value={selectedGradeId}
                onChange={(e) => onGradeChange(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
              >
                {currentGrades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSaveAcademic}
              disabled={isSaving}
              className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 interactive-tap"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>حفظ التعديلات</span>
            </button>
            <button
              onClick={onCancelEditing}
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
