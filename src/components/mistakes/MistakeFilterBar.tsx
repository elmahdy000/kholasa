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
    <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Status Filter */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0]/80 dark:border-[#334155]">
        <button
          type="button"
          onClick={() => setFilterStatus("unresolved")}
          className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
            filterStatus === "unresolved"
              ? "bg-[#DC2626] text-white"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          بحاجة لمراجعة ({unresolvedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus("resolved")}
          className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
            filterStatus === "resolved"
              ? "bg-[#059669] text-white"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          تم إتقانها ({resolvedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
            filterStatus === "all"
              ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white border border-[#E2E8F0]/80 dark:border-[#334155]/80"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          الكل ({totalCount})
        </button>
      </div>

      {/* Subject Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[#94A3B8]" />
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
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
