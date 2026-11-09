"use client";

import { useState } from "react";
import { Search, Plus, FileText, Download, X, Layers, Sparkles, Check, ChevronDown, Upload } from "lucide-react";
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
  onOpenImport?: (type?: "ALL" | "MCQ" | "TRUE_FALSE" | "ESSAY") => void;
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
  const [importMenuOpen, setImportMenuOpen] = useState(false);

  const hasActiveFilters =
    selectedGradeCode !== "all" ||
    selectedCategory !== "all" ||
    selectedSubjectId !== "all" ||
    selectedType !== "all" ||
    selectedDifficulty !== "all" ||
    searchQuery.trim().length > 0;

  const handleExportQuestionsJson = () => {
    const params = new URLSearchParams();
    params.set("download", "true");
    if (selectedGradeCode !== "all") params.set("gradeId", selectedGradeCode);
    if (selectedCategory !== "all") params.set("schoolCategory", selectedCategory);
    if (selectedSubjectId !== "all") params.set("subjectId", selectedSubjectId);
    if (selectedType !== "all") params.set("type", selectedType);
    if (selectedDifficulty !== "all") params.set("difficulty", selectedDifficulty);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());

    window.location.href = `/api/admin/questions/export?${params.toString()}`;
  };

  const handleResetFilters = () => {
    setSelectedGradeCode("all");
    setSelectedCategory("all");
    setSelectedSubjectId("all");
    setSelectedType("all");
    setSelectedDifficulty("all");
    setSearchQuery("");
  };

  const handleSelectImport = (type: "ALL" | "MCQ" | "TRUE_FALSE" | "ESSAY") => {
    setImportMenuOpen(false);
    onOpenImport?.(type);
  };

  return (
    <div className="space-y-3 font-sans text-right">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4">
        {/* Tier 1: Academic Hierarchy Controls & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          {/* Right: Grade & Category Segmented Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
            {/* Grade Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#536681] dark:text-[#94A3B8] shrink-0">
                الصف:
              </span>
              <div className="grid grid-cols-3 p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCode("all");
                    setSelectedSubjectId("all");
                  }}
                  className={`py-1.5 text-center rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    selectedGradeCode === "all"
                      ? "bg-white dark:bg-[#0F172A] text-[#091B40] dark:text-white shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#091B40]"
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
                  className={`py-1.5 text-center rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    selectedGradeCode === "bacc_g10"
                      ? "bg-[#800B34] text-white shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#091B40]"
                  }`}
                >
                  أولى بكالوريا
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCode("bacc_g11");
                    setSelectedSubjectId("all");
                  }}
                  className={`py-1.5 text-center rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    selectedGradeCode === "bacc_g11"
                      ? "bg-[#800B34] text-white shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#091B40]"
                  }`}
                >
                  تانية بكالوريا
                </button>
              </div>
            </div>

            {/* School Category Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#536681] dark:text-[#94A3B8] shrink-0">
                الفئة:
              </span>
              <div className="grid grid-cols-3 p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedSubjectId("all");
                  }}
                  className={`py-1.5 text-center rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-white dark:bg-[#0F172A] text-[#091B40] dark:text-white shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#091B40]"
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
                  className={`py-1.5 text-center rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    selectedCategory === "ARABIC"
                      ? "bg-[#091B40] text-white shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#091B40]"
                  }`}
                >
                  عربي
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("LANGUAGES");
                    setSelectedSubjectId("all");
                  }}
                  className={`py-1.5 text-center rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    selectedCategory === "LANGUAGES"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#091B40]"
                  }`}
                >
                  لغات
                </button>
              </div>
            </div>
          </div>

          {/* Left: Action Buttons (Unified Import Dropdown + Export + Create Question) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto shrink-0">
            {onOpenImport && (
              <div className="relative flex-1 sm:flex-initial">
                <button
                  type="button"
                  onClick={() => setImportMenuOpen(!importMenuOpen)}
                  className="w-full sm:w-auto h-10 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] text-xs font-bold text-[#091B40] dark:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
                  title="استيراد الأسئلة من ملفات Word"
                >
                  <Upload className="w-4 h-4 text-[#800B34] dark:text-[#FB7185] shrink-0" />
                  <span className="whitespace-nowrap">استيراد أسئلة Word</span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${importMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {importMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setImportMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-lg py-1 z-30 divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
                      <div className="px-3 py-2 text-[11px] font-bold text-[#94A3B8]">
                        اختر طريقة الاستيراد من ملف Word (.docx):
                      </div>
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => handleSelectImport("ALL")}
                          className="w-full px-3 py-2 text-right text-xs font-bold text-[#091B40] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center gap-2 cursor-pointer"
                        >
                          <Layers className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" />
                          <div>
                            <div>استيراد شامل (كافة الأنواع)</div>
                            <div className="text-[10px] text-[#94A3B8] font-normal">استيراد بنك أسئلة متكامل دفعة واحدة</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectImport("MCQ")}
                          className="w-full px-3 py-2 text-right text-xs font-bold text-[#091B40] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <div>
                            <div>اختيار من متعدد (MCQ)</div>
                            <div className="text-[10px] text-[#94A3B8] font-normal">ملف يحتوي على أسئلة MCQ منفصلة</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectImport("TRUE_FALSE")}
                          className="w-full px-3 py-2 text-right text-xs font-bold text-[#091B40] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <div>
                            <div>صواب وخطأ (T/F)</div>
                            <div className="text-[10px] text-[#94A3B8] font-normal">ملف يحتوي على أسئلة صح وخطأ</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectImport("ESSAY")}
                          className="w-full px-3 py-2 text-right text-xs font-bold text-[#091B40] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center gap-2 cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <div>
                            <div>أسئلة مقالية (Essay)</div>
                            <div className="text-[10px] text-[#94A3B8] font-normal">ملف أسئلة مقالية مع الإجابة النموذجية</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Export Questions JSON Button */}
            <button
              type="button"
              onClick={handleExportQuestionsJson}
              className="flex-1 sm:flex-initial w-full sm:w-auto h-10 px-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
              title="تصدير جميع الأسئلة الحالية المطابقة للتصفية كملف JSON"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">تصدير JSON ({filteredCount})</span>
            </button>

            {/* Create Question Button */}
            <button
              type="button"
              onClick={onOpenCreate}
              className="flex-1 sm:flex-initial w-full sm:w-auto h-10 px-4 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs active:scale-[0.98] whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">إضافة سؤال جديد</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Search Input and Secondary Dropdowns (Responsive Balanced Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-2.5 items-center">
          {/* Search Input: spans full width on mobile/tablet (3 cols on sm), 5 cols on desktop */}
          <div className="relative w-full sm:col-span-3 lg:col-span-5">
            <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث في نص السؤال، المفهوم، أو التفسير..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-9 pl-8 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#091B40] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800B34] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#091B40] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Subject Dropdown: 1 col on sm, 3 cols on desktop */}
          <div className="w-full sm:col-span-1 lg:col-span-3">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[12px] font-bold text-[#091B40] dark:text-white focus:outline-none focus:border-[#800B34]"
            >
              <option value="all">كل المواد ({availableSubjects.length})</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"})
                </option>
              ))}
            </select>
          </div>

          {/* Type Dropdown: 1 col on sm, 2 cols on desktop */}
          <div className="w-full sm:col-span-1 lg:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[12px] font-bold text-[#091B40] dark:text-white focus:outline-none focus:border-[#800B34]"
            >
              <option value="all">كل أنواع الأسئلة</option>
              <option value="MCQ">اختيار من متعدد (MCQ)</option>
              <option value="TRUE_FALSE">صح أو خطأ</option>
              <option value="ESSAY">سؤال مقالي</option>
            </select>
          </div>

          {/* Difficulty Dropdown: 1 col on sm, 2 cols on desktop */}
          <div className="w-full sm:col-span-1 lg:col-span-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[12px] font-bold text-[#091B40] dark:text-white focus:outline-none focus:border-[#800B34]"
            >
              <option value="all">كل الصعوبات</option>
              <option value="EASY">سهل</option>
              <option value="MEDIUM">متوسط</option>
              <option value="HARD">متقدم</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Bar */}
        {(hasActiveFilters || filteredCount !== totalQuestions) && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]/60 dark:border-[#334155]/60 text-[12px] font-bold">
            <span className="text-[#536681] dark:text-[#94A3B8]">
              عرض {filteredCount} من إجمالي {totalQuestions} سؤال
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[#800B34] dark:text-[#FB7185] hover:underline cursor-pointer"
              >
                إعادة ضبط جميع الفلاتر
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}