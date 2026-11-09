"use client";

import { Filter } from "lucide-react";

interface MistakeFilterBarProps {
  filterStatus: "all" | "unresolved" | "resolved";
  setFilterStatus: (status: "all" | "unresolved" | "resolved") => void;
  unresolvedCount: number;
  resolvedCount: number;
  totalCount: number;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  subjects: { id: string; name: string }[];
}

export function MistakeFilterBar({
  filterStatus,
  setFilterStatus,
  unresolvedCount,
  resolvedCount,
  totalCount,
  selectedSubjectId,
  setSelectedSubjectId,
  subjects,
}: MistakeFilterBarProps) {
  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs">
      {/* Status Filter Tabs - Responsive 3-col on mobile, flex on desktop */}
      <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0]/80 dark:border-[#334155] w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setFilterStatus("unresolved")}
          className={`min-h-[44px] px-2 sm:px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-bold transition-all flex items-center justify-center text-center truncate cursor-pointer active:scale-[0.98] ${
            filterStatus === "unresolved"
              ? "bg-[#DC2626] text-white shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <span className="truncate">محتاجة مراجعة ({unresolvedCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus("resolved")}
          className={`min-h-[44px] px-2 sm:px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-bold transition-all flex items-center justify-center text-center truncate cursor-pointer active:scale-[0.98] ${
            filterStatus === "resolved"
              ? "bg-[#059669] text-white shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <span className="truncate">تم إتقانها ({resolvedCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus("all")}
          className={`min-h-[44px] px-2 sm:px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-bold transition-all flex items-center justify-center text-center truncate cursor-pointer active:scale-[0.98] ${
            filterStatus === "all"
              ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white border border-[#E2E8F0]/80 dark:border-[#334155]/80 shadow-xs"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <span className="truncate">الكل ({totalCount})</span>
        </button>
      </div>

      {/* Subject Filter */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Filter className="w-4 h-4 text-[#94A3B8] shrink-0" />
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="w-full sm:w-auto min-h-[44px] h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs sm:text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800B34]"
        >
          <option value="all">جميع المواد</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
