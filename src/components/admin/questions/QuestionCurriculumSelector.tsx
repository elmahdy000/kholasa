"use client";

import { useMemo, useEffect } from "react";
import { BookOpen, Layers, GraduationCap, CheckCircle2, RotateCcw } from "lucide-react";
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
  // 1. Filter subjects strictly by Grade and School Category
  const eligibleSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (gradeId && s.gradeId && s.gradeId !== gradeId) return false;
      if (schoolCategory && s.schoolCategory && s.schoolCategory !== schoolCategory) return false;
      return true;
    });
  }, [subjects, gradeId, schoolCategory]);

  // Auto-align subject if current subjectId does not belong to eligible list
  useEffect(() => {
    if (eligibleSubjects.length > 0 && !eligibleSubjects.some((s) => s.id === subjectId)) {
      setSubjectId(eligibleSubjects[0].id);
      setUnitId("");
      setLessonId("");
    }
  }, [eligibleSubjects, subjectId, setSubjectId, setUnitId, setLessonId]);

  const activeSubject = subjects.find((s) => s.id === subjectId);
  const activeGrade = grades?.find((g) => g.id === gradeId);
  const activeUnit = activeSubject?.units?.find((u) => u.id === unitId);

  // Clear/Reset both unit and lesson
  const handleClearUnitAndLesson = () => {
    setUnitId("");
    setLessonId("");
  };

  // When a lesson is chosen directly from the grouped list, auto-detect and set its unit!
  const handleLessonChange = (selectedLId: string) => {
    if (selectedLId === "__CLEAR_ALL__") {
      handleClearUnitAndLesson();
      return;
    }

    setLessonId(selectedLId);
    if (!selectedLId) return;

    // Find which unit owns this lesson
    if (activeSubject?.units) {
      for (const u of activeSubject.units) {
        if (u.lessons?.some((l) => l.id === selectedLId)) {
          if (unitId !== u.id) {
            setUnitId(u.id);
          }
          break;
        }
      }
    }
  };

  const activeLesson = activeSubject?.units
    ?.flatMap((u) => u.lessons || [])
    ?.find((l) => l.id === lessonId);

  return (
    <div className="space-y-3.5 text-right font-sans">
      {/* 1. Grade and School Category Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
        {grades && grades.length > 0 && (
          <div>
            <label className="block text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
              الصف الدراسي
            </label>
            <select
              value={gradeId}
              onChange={(e) => {
                setGradeId(e.target.value);
                setUnitId("");
                setLessonId("");
              }}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white cursor-pointer"
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
            نوع المدرسة
          </label>
          <select
            value={schoolCategory}
            onChange={(e) => {
              setSchoolCategory(e.target.value as "ARABIC" | "LANGUAGES");
              setUnitId("");
              setLessonId("");
            }}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white cursor-pointer"
          >
            <option value="ARABIC">مدارس عربي (Arabic)</option>
            <option value="LANGUAGES">مدارس لغات (Languages)</option>
          </select>
        </div>
      </div>

      {/* 2. Subject, Unit, and Lesson Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Quick Reset Notification Banner if a unit or lesson is chosen */}
        {(unitId || lessonId) && (
          <div className="sm:col-span-3 flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-amber-900 dark:text-amber-200">
            <span>
              {unitId && lessonId
                ? `محدد حالياً: ${activeUnit?.title || "الوحدة"} › ${activeLesson?.title || "الدرس"}`
                : unitId
                ? `محدد حالياً: كامل ${activeUnit?.title || "الوحدة"}`
                : `محدد حالياً: درس ${activeLesson?.title || ""}`}
            </span>
            <button
              type="button"
              onClick={handleClearUnitAndLesson}
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 underline cursor-pointer hover:opacity-80 flex items-center gap-1 font-bold"
              title="إلغاء التحديد والرجوع للوضع العام بدون إعادة تحميل الصفحة"
            >
              <RotateCcw className="w-3 h-3" />
              <span>تفريغ الوحدة والدرس والتراجع ✕</span>
            </button>
          </div>
        )}

        {/* Subject Select */}
        <div>
          <label className="block text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
            المادة الدراسية *
          </label>
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setUnitId("");
              setLessonId("");
            }}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white cursor-pointer"
          >
            {eligibleSubjects.length === 0 ? (
              <option value="">لا توجد مواد لهذا الصف والفئة</option>
            ) : (
              eligibleSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.units?.length || 0} وحدات)
                </option>
              ))
            )}
          </select>
        </div>

        {/* Unit Select */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              الوحدة الدراسية (اختياري)
            </label>
            {unitId && (
              <button
                type="button"
                onClick={() => {
                  setUnitId("");
                  setLessonId("");
                }}
                className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                title="إلغاء تحديد الوحدة"
              >
                تفريغ ✕
              </button>
            )}
          </div>
          <select
            value={unitId}
            onChange={(e) => {
              const newUnitId = e.target.value;
              setUnitId(newUnitId);
              if (!newUnitId) {
                // Clearing unit MUST clear lesson
                setLessonId("");
              } else if (lessonId) {
                const targetUnit = activeSubject?.units?.find((u) => u.id === newUnitId);
                if (!targetUnit?.lessons?.some((l) => l.id === lessonId)) {
                  setLessonId("");
                }
              }
            }}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white cursor-pointer"
          >
            <option value="">بدون وحدة محددة (عام بالمادة)</option>
            {activeSubject?.units?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.title} ({u.lessons?.length || 0} دروس)
              </option>
            ))}
          </select>
        </div>

        {/* Lesson Select (Smart Direct Picker) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              الدرس المرتبط (اختياري)
            </label>
            {lessonId && (
              <button
                type="button"
                onClick={() => setLessonId("")}
                className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                title="إلغاء تحديد الدرس"
              >
                تفريغ ✕
              </button>
            )}
          </div>
          <select
            value={lessonId}
            onChange={(e) => handleLessonChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white cursor-pointer"
          >
            {unitId ? (
              // When unit is selected, show unit's lessons + option to clear back to all
              <>
                <option value="">📌 كامل الوحدة (أو اختر درساً)</option>
                {activeUnit?.lessons?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
                <option value="__CLEAR_ALL__">↺ إظهار كافة وحدات ودروس المادة...</option>
              </>
            ) : (
              // When NO unit is selected, show all lessons grouped by unit and auto-select unit on change!
              <>
                <option value="">اختر درساً لتحديد وحدته تلقائياً...</option>
                {activeSubject?.units?.map((u) => (
                  <optgroup key={u.id} label={`📁 ${u.title}`}>
                    {u.lessons?.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      {/* 3. Realtime Academic Confirmation Breadcrumb */}
      {activeSubject && (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-white">مسار التعيين:</span>
            <span>{activeGrade?.name || "الصف"}</span>
            <span className="opacity-40">•</span>
            <span>{schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}</span>
            <span className="opacity-40">•</span>
            <span className="font-bold text-[#800020] dark:text-[#FB7185]">{activeSubject.name}</span>
            {activeUnit && (
              <>
                <span className="opacity-40">›</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeUnit.title}</span>
              </>
            )}
            {activeLesson && (
              <>
                <span className="opacity-40">›</span>
                <span className="font-bold text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                  {activeLesson.title}
                </span>
              </>
            )}
            {!activeUnit && !activeLesson && (
              <span className="text-slate-400 dark:text-slate-500 font-normal">(مستوى المادة العام)</span>
            )}
            {activeUnit && !activeLesson && (
              <span className="text-slate-400 dark:text-slate-500 font-normal">(مراجعة كامل الوحدة)</span>
            )}
          </div>

          {(unitId || lessonId) && (
            <button
              type="button"
              onClick={handleClearUnitAndLesson}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50 cursor-pointer transition-colors shrink-0 mr-auto flex items-center gap-1"
              title="إلغاء التحديد والتراجع عن اختيار الوحدة والدرس"
            >
              <RotateCcw className="w-3 h-3" />
              <span>تفريغ التحديد ✕</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
