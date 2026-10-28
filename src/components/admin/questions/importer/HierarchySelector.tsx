"use client";

import { BookOpen, Layers } from "lucide-react";
import { GradeItem, TrackItem, SubjectItem, UnitItem } from "./types";
import { QuestionType, QuestionDifficulty } from "@/lib/question-parser";

interface HierarchySelectorProps {
  grades?: GradeItem[];
  activeGrade?: GradeItem;
  selectedGradeId: string;
  onGradeChange: (gradeId: string) => void;
  selectedSchoolCategory: "ARABIC" | "LANGUAGES";
  onCategoryChange: (category: "ARABIC" | "LANGUAGES") => void;
  requiresTrack: boolean;
  availableTracks: TrackItem[];
  selectedTrackId: string;
  onTrackChange: (trackId: string) => void;
  eligibleSubjects: SubjectItem[];
  selectedSubjectId: string;
  onSubjectChange: (subjectId: string) => void;
  activeSubject?: SubjectItem;
  selectedUnitId: string;
  onUnitChange: (unitId: string) => void;
  activeUnit?: UnitItem;
  selectedScope: "LESSON" | "UNIT";
  onScopeChange: (scope: "LESSON" | "UNIT") => void;
  selectedLessonId: string;
  onLessonChange: (lessonId: string) => void;
  selectedQuestionType: QuestionType;
  onQuestionTypeChange: (type: QuestionType) => void;
  selectedDifficulty: QuestionDifficulty | "MIXED";
  onDifficultyChange: (difficulty: QuestionDifficulty | "MIXED") => void;
}

export function HierarchySelector({
  grades,
  activeGrade,
  selectedGradeId,
  onGradeChange,
  selectedSchoolCategory,
  onCategoryChange,
  requiresTrack,
  availableTracks,
  selectedTrackId,
  onTrackChange,
  eligibleSubjects,
  selectedSubjectId,
  onSubjectChange,
  activeSubject,
  selectedUnitId,
  onUnitChange,
  activeUnit,
  selectedScope,
  onScopeChange,
  selectedLessonId,
  onLessonChange,
  selectedQuestionType,
  onQuestionTypeChange,
  selectedDifficulty,
  onDifficultyChange,
}: HierarchySelectorProps) {
  return (
    <div className="space-y-5">
      {/* STEP 1: Strict Curriculum Hierarchy Destination */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0]/90 dark:border-[#334155]/90 space-y-5">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#800020] text-white flex items-center justify-center text-[13px] font-bold shadow-sm">
              1
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#0F172A] dark:text-white">
                تحديد المسار الهرمي للمنهج الدراسي
              </h3>
              <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                الصف الدراسي ← فئة المدرسة ← المسار التخصصي ← المادة المقررة ← الوحدة ← الدرس
              </span>
            </div>
          </div>
        </div>

        {/* Sub-steps 1, 2: Grade and School Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Grade Selector */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-white block">
              1. الصف الدراسي *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const g10 = grades?.find((g) => g.code === "bacc_g10");
                  if (g10) onGradeChange(g10.id);
                }}
                className={`h-11 px-3 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                  activeGrade?.code === "bacc_g10" || (!activeGrade && selectedGradeId.includes("g10"))
                    ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020]"
                }`}
              >
                <span>أولى بكالوريا</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const g11 = grades?.find((g) => g.code === "bacc_g11");
                  if (g11) onGradeChange(g11.id);
                }}
                className={`h-11 px-3 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                  activeGrade?.code === "bacc_g11" || selectedGradeId.includes("g11")
                    ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020]"
                }`}
              >
                <span>تانية بكالوريا</span>
              </button>
            </div>
          </div>

          {/* 2. School Category Selector */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-white block">
              2. فئة المدرسة التعليمية *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onCategoryChange("ARABIC")}
                className={`h-11 px-3 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedSchoolCategory === "ARABIC"
                    ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155] hover:border-[#059669]"
                }`}
              >
                <span>مدارس عربي</span>
              </button>

              <button
                type="button"
                onClick={() => onCategoryChange("LANGUAGES")}
                className={`h-11 px-3 rounded-xl border text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedSchoolCategory === "LANGUAGES"
                    ? "bg-[#0284C7] text-white border-[#0284C7] shadow-sm"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155] hover:border-[#0284C7]"
                }`}
              >
                <span>مدارس لغات (Language)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-steps 3, 4: Track (if applicable) and Eligible Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {requiresTrack && (
            <div>
              <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-2">
                3. المسار التخصصي (اختياري / حسب الشعبة)
              </label>
              <select
                value={selectedTrackId}
                onChange={(e) => onTrackChange(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
              >
                <option value="">كافة المسارات / المسار المشترك</option>
                {availableTracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={!requiresTrack ? "md:col-span-2" : ""}>
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-2">
              4. المادة المقررة للفئة المحددة *
            </label>
            <div className="relative">
              <select
                value={selectedSubjectId}
                onChange={(e) => onSubjectChange(e.target.value)}
                className="w-full h-11 px-3 pr-8 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
              >
                {eligibleSubjects.length === 0 ? (
                  <option value="">لا توجد مواد مهيأة لهذه الفئة حالياً</option>
                ) : (
                  eligibleSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.schoolCategory === "ARABIC" ? "عربي" : "لغات / English"})
                    </option>
                  ))
                )}
              </select>
              <BookOpen className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sub-steps 5, 6: Unit and Scope */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-2">
              5. الوحدة الدراسية *
            </label>
            <div className="relative">
              <select
                value={selectedUnitId}
                onChange={(e) => onUnitChange(e.target.value)}
                className="w-full h-11 px-3 pr-8 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
              >
                <option value="">-- اختر الوحدة الدراسية --</option>
                {activeSubject?.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.title}
                  </option>
                ))}
              </select>
              <Layers className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block">
              6. نطاق ربط الأسئلة *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onScopeChange("LESSON")}
                className={`h-11 px-3 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedScope === "LESSON"
                    ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] border-[#E2E8F0] dark:border-[#334155]"
                }`}
              >
                <span>درس محدد</span>
              </button>

              <button
                type="button"
                onClick={() => onScopeChange("UNIT")}
                className={`h-11 px-3 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedScope === "UNIT"
                    ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] border-[#E2E8F0] dark:border-[#334155]"
                }`}
              >
                <span>نطاق الوحدة ككل</span>
              </button>
            </div>

            {selectedScope === "LESSON" && (
              <div className="pt-1">
                <select
                  value={selectedLessonId}
                  onChange={(e) => onLessonChange(e.target.value)}
                  disabled={!selectedUnitId || !activeUnit?.lessons?.length}
                  className="w-full h-10 px-3 pr-8 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white disabled:opacity-50 focus:outline-none focus:border-[#800020]"
                >
                  <option value="">-- اختر الدرس المستهدف للتراكم --</option>
                  {activeUnit?.lessons?.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STEP 2: Strict Question Type & Difficulty Configuration */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0]/90 dark:border-[#334155]/90 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#800020] text-white flex items-center justify-center text-[13px] font-bold shadow-sm">
              2
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#0F172A] dark:text-white">
                نوع الأسئلة ومستوى الصعوبة للمستند
              </h3>
              <span className="text-[12px] font-bold text-[#D97706] dark:text-[#FBBF24]">
                ⚠ قاعدة المنصة: كل مستند يحتوي على نوع واحد فقط من الأسئلة
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-white block mb-2">
              7. نوع الأسئلة في هذا الملف *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onQuestionTypeChange("MCQ")}
                className={`h-11 px-2 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center ${
                  selectedQuestionType === "MCQ"
                    ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155]"
                }`}
              >
                <span>اختيار من متعدد (MCQ)</span>
              </button>

              <button
                type="button"
                onClick={() => onQuestionTypeChange("TRUE_FALSE")}
                className={`h-11 px-2 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center ${
                  selectedQuestionType === "TRUE_FALSE"
                    ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155]"
                }`}
              >
                <span>صواب أو خطأ</span>
              </button>

              <button
                type="button"
                onClick={() => onQuestionTypeChange("ESSAY")}
                className={`h-11 px-2 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center ${
                  selectedQuestionType === "ESSAY"
                    ? "bg-[#800020] text-white border-[#800020] shadow-sm"
                    : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155]"
                }`}
              >
                <span>أسئلة مقالية (Essay)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-white block mb-2">
              8. مستوى الصعوبة *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "EASY", label: "سهل" },
                { id: "MEDIUM", label: "متوسط" },
                { id: "HARD", label: "متقدم" },
                { id: "MIXED", label: "متنوع" },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => onDifficultyChange(diff.id as any)}
                  className={`h-11 px-1 rounded-xl border text-[12px] font-bold transition-all flex items-center justify-center ${
                    selectedDifficulty === diff.id
                      ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] border-[#0F172A] dark:border-white shadow-sm"
                      : "bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] border-[#E2E8F0] dark:border-[#334155]"
                  }`}
                >
                  <span>{diff.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
