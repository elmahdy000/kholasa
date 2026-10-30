"use client";

import { Search, Plus, FileText, X } from "lucide-react";
import { Subject } from "./types";

interface QuestionFilterBarProps {
  selectedGradeCode: string;
  setSelectedGradeCode: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (v: string) => void;
  selectedType: string;
  setSelectedType: (v: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  availableSubjects: Subject[];
  totalQuestions: number;
  filteredCount: number;
  onOpenCreate: () => void;
  onOpenImport?: () => void;
}

export function QuestionFilterBar({
  selectedGradeCode,
  setSelectedGradeCode,
  selectedCategory,
  setSelectedCategory,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedType,
  setSelectedType,
  selectedDifficulty,
  setSelectedDifficulty,
  searchQuery,
  setSearchQuery,
  availableSubjects,
  totalQuestions,
  filteredCount,
  onOpenCreate,
  onOpenImport,
}: QuestionFilterBarProps) {
  const hasActiveFilters =
    selectedGradeCode !== "all" ||
    selectedCategory !== "all" ||
    selectedSubjectId !== "all" ||
    selectedType !== "all" ||
    selectedDifficulty !== "all" ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedGradeCode("all");
    setSelectedCategory("all");
    setSelectedSubjectId("all");
    setSelectedType("all");
    setSelectedDifficulty("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-3 font-sans text-right">
      {/* Top Filter Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
        {/* Row 1: Primary Academic Hierarchy (Grade & Category) & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          {/* Grade & School Category Tabs */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Grade Segmented Control */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] shrink-0">
                الصف:
              </span>
              <div className="inline-flex items-center bg-[#F1F5F9] dark:bg-[#1E293B] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCode("all");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                    selectedGradeCode === "all"
                      ? "bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCode("bacc_g10");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                    selectedGradeCode === "bacc_g10"
                      ? "bg-[#800020] text-white shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  أولى بكالوريا (G10)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCode("bacc_g11");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                    selectedGradeCode === "bacc_g11"
                      ? "bg-[#800020] text-white shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  تانية بكالوريا (G11)
                </button>
              </div>
            </div>

            {/* School Category Segmented Control */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] shrink-0">
                الفئة:
              </span>
              <div className="inline-flex items-center bg-[#F1F5F9] dark:bg-[#1E293B] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("ARABIC");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                    selectedCategory === "ARABIC"
                      ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  مدارس عربي
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("LANGUAGES");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                    selectedCategory === "LANGUAGES"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  مدارس لغات
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons: Import & Add Question */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenImport && (
              <button
                type="button"
                onClick={onOpenImport}
                className="h-10 px-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#475569] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-white dark:hover:bg-[#334155] text-[#0F172A] dark:text-white text-[12px] font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <FileText className="w-4 h-4 text-[#800020]" />
                <span>استيراد ملف (Word / PDF)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCreate}
              className="h-10 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[12px] font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سؤال جديد</span>
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Dropdowns and Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input with Clear Button */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث في نص السؤال، المفهوم، أو التفسير..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-9 pl-8 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800020] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Subject Dropdown */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[12px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          >
            <option value="all">كل المواد ({availableSubjects.length})</option>
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"})
              </option>
            ))}
          </select>

          {/* Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[12px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          >
            <option value="all">كل أنواع الأسئلة</option>
            <option value="MCQ">اختيار من متعدد (MCQ)</option>
            <option value="TRUE_FALSE">صح أو خطأ</option>
            <option value="ESSAY">سؤال مقالي</option>
          </select>

          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[12px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          >
            <option value="all">كل الصعوبات</option>
            <option value="EASY">سهل</option>
            <option value="MEDIUM">متوسط</option>
            <option value="HARD">متقدم</option>
          </select>

          {/* Reset Filters if Active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-10 px-3 rounded-xl text-[12px] font-bold text-[#800020] hover:bg-[#800020]/10 cursor-pointer transition-colors"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Counter & Status Header */}
      <div className="flex flex-wrap items-center justify-between text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] px-1">
        <div>
          <span>عرض <strong className="text-[#0F172A] dark:text-white">{filteredCount}</strong> سؤال من إجمالي <strong className="text-[#0F172A] dark:text-white">{totalQuestions}</strong> في البنك</span>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-[11px] text-[#800020]">
            <span>
              الفلاتر النشطة:{" "}
              {selectedGradeCode !== "all" && (selectedGradeCode === "bacc_g10" ? "أولى بكالوريا • " : "تانية بكالوريا • ")}
              {selectedCategory !== "all" && (selectedCategory === "ARABIC" ? "مدارس عربي • " : "مدارس لغات • ")}
              {selectedSubjectId !== "all" && "مادة محددة • "}
              {selectedType !== "all" && "نوع محدد • "}
              {selectedDifficulty !== "all" && "صعوبة محددة • "}
              {searchQuery && `بحث: "${searchQuery}"`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
