"use client";

import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { Subject } from "./types";

interface ExamFilterBarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (v: string) => void;
  selectedType: string;
  setSelectedType: (v: string) => void;
  subjects: Subject[];
  totalExams: number;
  filteredCount: number;
  onOpenCreate: () => void;
}

export function ExamFilterBar({
  searchQuery,
  setSearchQuery,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedType,
  setSelectedType,
  subjects,
  totalExams,
  filteredCount,
  onOpenCreate,
}: ExamFilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Action Header & Filters */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Bar */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن امتحان أو مادة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pr-9 pl-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800020]"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل المواد الدراسية</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل التصنيفات</option>
            <option value="exam">امتحانات رسمية بمؤقت</option>
            <option value="practice">تدريبات تكيفية فورية</option>
          </select>
        </div>

        {/* Create Exam CTA Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/exams/create"
            className="h-11 px-4 rounded-xl border border-[#800020] text-[#800020] dark:text-[#FB7185] hover:bg-[#800020]/10 text-[13px] font-bold flex items-center justify-center gap-2 transition-colors"
            title="إنشاء في صفحة مستقلة برابط مخصص"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء في صفحة مستقلة</span>
          </Link>

          <button
            type="button"
            onClick={onOpenCreate}
            className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-colors active:opacity-80 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>نافذة سريعة</span>
          </button>
        </div>
      </div>

      {/* Counter */}
      <div className="text-[13px] font-bold text-[#64748B] px-1">
        عرض {filteredCount} من أصل {totalExams} امتحان
      </div>
    </div>
  );
}
