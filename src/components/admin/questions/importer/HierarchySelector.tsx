"use client";

import React from "react";
import { BookOpen, Layers, GraduationCap, School, Compass, HelpCircle, ChevronDown } from "lucide-react";
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
  const g10 = grades?.find((g) => g.code === "bacc_g10") || grades?.[0];
  const g11 = grades?.find((g) => g.code === "bacc_g11") || grades?.[1];

  const isG10 =
    activeGrade?.code === "bacc_g10" ||
    (!activeGrade && (selectedGradeId.includes("g10") || !selectedGradeId));
  const isG11 = activeGrade?.code === "bacc_g11" || selectedGradeId.includes("g11");

  return (
    <div className="space-y-4">
      {/* 1. Academic Destination Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#800020]/10 dark:bg-[#800020]/25 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                تحديد مكان الأسئلة في المنهج
              </h2>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                اختر الصف وفئة المدرسة والمادة لإلحاق الأسئلة بمكانها المعتمد بدقة
              </p>
            </div>
          </div>
        </div>

        {/* Row 1: Grade and School Category Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Grade Selector */}
          <div>
            <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              الصف الدراسي
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (g10) onGradeChange(g10.id);
                  else onGradeChange("bacc_g10");
                }}
                className={`h-9 px-2 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isG10
                    ? "bg-[#800020] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>أولى بكالوريا</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (g11) onGradeChange(g11.id);
                  else onGradeChange("bacc_g11");
                }}
                className={`h-9 px-2 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isG11
                    ? "bg-[#800020] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>تانية بكالوريا</span>
              </button>
            </div>
          </div>

          {/* School Category Selector */}
          <div>
            <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              نوع المدرسة
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onCategoryChange("ARABIC")}
                className={`h-9 px-2 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedSchoolCategory === "ARABIC"
                    ? "bg-[#800020] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60"
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>عربي</span>
              </button>

              <button
                type="button"
                onClick={() => onCategoryChange("LANGUAGES")}
                className={`h-9 px-2 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedSchoolCategory === "LANGUAGES"
                    ? "bg-[#800020] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60"
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>لغات</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Track (if G11) & Subject */}
        <div className={`grid grid-cols-1 ${requiresTrack ? "sm:grid-cols-2" : ""} gap-3`}>
          {/* Academic Track (shown if G11 has tracks) */}
          {requiresTrack && (
            <div>
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                المسار التخصصي
              </label>
              <div className="relative">
                <select
                  value={selectedTrackId}
                  onChange={(e) => onTrackChange(e.target.value)}
                  className="w-full h-10 pr-9 pl-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[13px] font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] dark:[&>option]:bg-slate-900 dark:[&>option]:text-white"
                >
                  <option value="">كافة المسارات / عام ومشترك</option>
                  {availableTracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.nameEn ? `(${t.nameEn})` : ""}
                    </option>
                  ))}
                </select>
                <Compass className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Subject Selector */}
          <div>
            <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              المادة الدراسية
            </label>
            <div className="relative">
              <select
                value={selectedSubjectId}
                onChange={(e) => onSubjectChange(e.target.value)}
                className="w-full h-10 pr-9 pl-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[13px] font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] dark:[&>option]:bg-slate-900 dark:[&>option]:text-white"
              >
                {eligibleSubjects.length === 0 ? (
                  <option value="">لا توجد مواد مسجلة لهذه الفئة</option>
                ) : (
                  eligibleSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.schoolCategory === "ARABIC" ? "عربي" : "لغات"})
                    </option>
                  ))
                )}
              </select>
              <BookOpen className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {eligibleSubjects.length === 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                تنبيه: يمكنك إضافة المادة أولاً من صفحة المناهج ثم العودة للاستيراد إليها.
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Unit and Target Lesson */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Unit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
                الوحدة الدراسية
              </label>
            </div>
            <div className="relative">
              <select
                value={selectedUnitId}
                onChange={(e) => onUnitChange(e.target.value)}
                disabled={!activeSubject || !activeSubject.units?.length}
                className="w-full h-10 pr-9 pl-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[13px] font-bold text-slate-900 dark:text-white disabled:opacity-50 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] dark:[&>option]:bg-slate-900 dark:[&>option]:text-white"
              >
                <option value="">-- اختر الوحدة الدراسية --</option>
                {activeSubject?.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.title}
                  </option>
                ))}
              </select>
              <Layers className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Lesson */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
                الدرس المستهدف
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onScopeChange(selectedScope === "LESSON" ? "UNIT" : "LESSON")}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    selectedScope === "UNIT"
                      ? "bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] border border-[#800020]/20"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                  title="التبديل بين إلحاق الأسئلة بدرس محدد أو إلحاقها بكامل الوحدة"
                >
                  {selectedScope === "UNIT" ? "إلحاق بالوحدة كاملة ✓" : "تحديد للوحدة كاملة؟"}
                </button>
              </div>
            </div>

            {selectedScope === "LESSON" ? (
              <div className="relative">
                <select
                  value={selectedLessonId}
                  onChange={(e) => onLessonChange(e.target.value)}
                  disabled={!selectedUnitId || !activeUnit?.lessons?.length}
                  className="w-full h-10 pr-9 pl-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[13px] font-bold text-slate-900 dark:text-white disabled:opacity-50 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] dark:[&>option]:bg-slate-900 dark:[&>option]:text-white"
                >
                  <option value="">-- اختر الدرس المستهدف --</option>
                  {activeUnit?.lessons?.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
                <GraduationCap className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <div className="h-10 px-3.5 rounded-xl border border-dashed border-[#800020]/30 bg-[#800020]/5 dark:bg-[#800020]/10 flex items-center justify-between text-xs font-bold text-[#800020] dark:text-[#FB7185]">
                <span>سيتم إلحاق الأسئلة بجميع دروس الوحدة</span>
                <button
                  type="button"
                  onClick={() => onScopeChange("LESSON")}
                  className="text-[11px] underline hover:opacity-80 cursor-pointer"
                >
                  تحديد درس
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Compact Question Type & Difficulty Section */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#800020]/10 dark:bg-[#800020]/25 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                نوع الأسئلة ومستوى الصعوبة للملف
              </h2>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                يحتوي كل ملف مستورد على نوع موحد من الأسئلة مع تحديد الصعوبة
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Question Type */}
          <div>
            <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              نوع السؤال في الملف
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onQuestionTypeChange("MCQ")}
                className={`h-9 px-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center ${
                  selectedQuestionType === "MCQ"
                    ? "bg-[#800020] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>اختيار من متعدد</span>
              </button>

              <button
                type="button"
                onClick={() => onQuestionTypeChange("TRUE_FALSE")}
                className={`h-9 px-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center ${
                  selectedQuestionType === "TRUE_FALSE"
                    ? "bg-[#800020] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>صح أو خطأ</span>
              </button>

              <button
                type="button"
                onClick={() => onQuestionTypeChange("ESSAY")}
                className={`h-9 px-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center ${
                  selectedQuestionType === "ESSAY"
                    ? "bg-[#800020] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>أسئلة مقالية</span>
              </button>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              مستوى الصعوبة
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
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
                  className={`h-9 px-1 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center ${
                    selectedDifficulty === diff.id
                      ? "bg-[#800020] text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
