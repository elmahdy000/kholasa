"use client";

import Link from "next/link";
import { Search, Plus, FileText, Upload } from "lucide-react";
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
}: QuestionFilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Action Header & Primary Hierarchy Filter */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col gap-4">
        {/* Top Filter Level: Grade & School Category */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Grade Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                الصف الدراسي:
              </span>
              <div className="flex items-center bg-[#F8FAFC] dark:bg-[#1E293B] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGradeCode("all");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                    selectedGradeCode === "all"
                      ? "bg-[#800020] text-white"
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
                      ? "bg-[#800020] text-white"
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
                      ? "bg-[#800020] text-white"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  تانية بكالوريا (G11)
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                نوع المدرسة:
              </span>
              <div className="flex items-center bg-[#F8FAFC] dark:bg-[#1E293B] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedSubjectId("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-[#800020] text-white"
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
                      ? "bg-[#059669] text-white"
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
                      ? "bg-[#2563EB] text-white"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  مدارس لغات
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/admin/questions/import"
              className="h-10 px-3.5 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] hover:bg-[#800020]/20 text-[#800020] dark:text-[#FB7185] text-[12px] font-bold flex items-center justify-center gap-2 border border-[#800020]/20 dark:border-[#FB7185]/30 transition-colors"
            >
              <FileText className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
              <span>استيراد Word / PDF</span>
            </Link>

            <button
              type="button"
              onClick={onOpenCreate}
              className="h-10 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[12px] font-bold flex items-center justify-center gap-2 shadow-sm transition-colors active:opacity-80 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سؤال جديد</span>
            </button>
          </div>
        </div>

        {/* Detailed Search & Secondary Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث في نص السؤال أو المفهوم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-9 pl-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800020]"
            />
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل المواد المؤهلة ({availableSubjects.length})</option>
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.schoolCategory === "LANGUAGES" ? "— لغات" : "— عربي"}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل أنواع الأسئلة</option>
            <option value="MCQ">اختيار من متعدد (MCQ)</option>
            <option value="TRUE_FALSE">صح أو خطأ</option>
            <option value="ESSAY">سؤال مقالي</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل الصعوبات</option>
            <option value="EASY">سهل</option>
            <option value="MEDIUM">متوسط</option>
            <option value="HARD">متقدم</option>
          </select>
        </div>
      </div>

      {/* Questions Counter Header */}
      <div className="flex items-center justify-between text-[13px] font-bold text-[#64748B] px-1">
        <span>عرض {filteredCount} سؤال من إجمالي {totalQuestions}</span>
        {selectedGradeCode !== "all" || selectedCategory !== "all" ? (
          <span className="text-[12px] font-bold text-[#800020] dark:text-[#FB7185]">
            تطبيق فلتر: {selectedGradeCode === "bacc_g10" ? "أولى بكالوريا" : selectedGradeCode === "bacc_g11" ? "تانية بكالوريا" : ""}{" "}
            {selectedCategory === "ARABIC" ? "• مدارس عربي" : selectedCategory === "LANGUAGES" ? "• مدارس لغات" : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
}
