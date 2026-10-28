"use client";

import type { Subject, Grade } from "./types";

interface QuestionCurriculumSelectorProps {
  grades?: Grade[];
  gradeId: string;
  setGradeId: (id: string) => void;
  schoolCategory: "ARABIC" | "LANGUAGES";
  setSchoolCategory: (cat: "ARABIC" | "LANGUAGES") => void;
  subjects: Subject[];
  subjectId: string;
  setSubjectId: (id: string) => void;
  unitId: string;
  setUnitId: (id: string) => void;
  lessonId: string;
  setLessonId: (id: string) => void;
}

export function QuestionCurriculumSelector({
  grades,
  gradeId,
  setGradeId,
  schoolCategory,
  setSchoolCategory,
  subjects,
  subjectId,
  setSubjectId,
  unitId,
  setUnitId,
  lessonId,
  setLessonId,
}: QuestionCurriculumSelectorProps) {
  const activeSubject = subjects.find((s) => s.id === subjectId);

  return (
    <div className="space-y-4">
      {/* Grade and School Category Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
        {grades && grades.length > 0 && (
          <div>
            <label className="block text-[12px] font-bold text-[#64748B] mb-1">
              الصف الدراسي
            </label>
            <select
              value={gradeId}
              onChange={(e) => setGradeId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white"
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.code})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[12px] font-bold text-[#64748B] mb-1">
            نوع المدرسة
          </label>
          <select
            value={schoolCategory}
            onChange={(e) => setSchoolCategory(e.target.value as "ARABIC" | "LANGUAGES")}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="ARABIC">مدارس عربي (Arabic)</option>
            <option value="LANGUAGES">مدارس لغات (Languages)</option>
          </select>
        </div>
      </div>

      {/* Curriculum Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[13px] font-bold text-[#64748B] mb-1">
            المادة الدراسية *
          </label>
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setUnitId("");
              setLessonId("");
            }}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#64748B] mb-1">
            الوحدة الدراسية
          </label>
          <select
            value={unitId}
            onChange={(e) => {
              setUnitId(e.target.value);
              setLessonId("");
            }}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="">بدون وحدة محددة</option>
            {activeSubject?.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#64748B] mb-1">
            الدرس المرتبط
          </label>
          <select
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            disabled={!unitId}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white disabled:opacity-50"
          >
            <option value="">بدون درس محدد</option>
            {activeSubject?.units
              .find((u) => u.id === unitId)
              ?.lessons?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
}
