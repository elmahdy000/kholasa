"use client";

import { Filter } from "lucide-react";

export type MistakeQuestionTypeFilter = "ALL" | "OBJECTIVE" | "ESSAY";

interface MistakeFilterBarProps {
  filterStatus: "all" | "unresolved" | "resolved";
  setFilterStatus: (status: "all" | "unresolved" | "resolved") => void;
  typeFilter: MistakeQuestionTypeFilter;
  setTypeFilter: (type: MistakeQuestionTypeFilter) => void;
  unresolvedCount: number;
  resolvedCount: number;
  totalCount: number;
  essayCount: number;
  objectiveCount: number;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  subjects: { id: string; name: string }[];
}

export function MistakeFilterBar({
  filterStatus,
  setFilterStatus,
  typeFilter,
  setTypeFilter,
  unresolvedCount,
  resolvedCount,
  totalCount,
  essayCount,
  objectiveCount,
  selectedSubjectId,
  setSelectedSubjectId,
  subjects,
}: MistakeFilterBarProps) {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0F1E36] border border-[#E2E8F0] dark:border-[#1E3352] space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs - Responsive 3-col on mobile, flex on desktop */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 rounded-lg bg-[#F7F9FC] dark:bg-[#142747] border border-[#E2E8F0] dark:border-[#1E3352] w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterStatus("unresolved")}
            className={`min-h-[44px] px-2 sm:px-3.5 py-2 rounded-md text-xs sm:text-[13px] font-bold font-sans tabular-nums transition-colors flex items-center justify-center text-center truncate cursor-pointer ${
              filterStatus === "unresolved"
                ? "bg-[#800B34] dark:bg-[#9E1043] text-white"
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <span className="truncate">محتاجة مراجعة ({unresolvedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("resolved")}
            className={`min-h-[44px] px-2 sm:px-3.5 py-2 rounded-md text-xs sm:text-[13px] font-bold font-sans tabular-nums transition-colors flex items-center justify-center text-center truncate cursor-pointer ${
              filterStatus === "resolved"
                ? "bg-[#059669] text-white"
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <span className="truncate">خلصتها ({resolvedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`min-h-[44px] px-2 sm:px-3.5 py-2 rounded-md text-xs sm:text-[13px] font-bold font-sans tabular-nums transition-colors flex items-center justify-center text-center truncate cursor-pointer ${
              filterStatus === "all"
                ? "bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155]"
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <span className="truncate">الكل ({totalCount})</span>
          </button>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
          <select
            aria-label="تصفية حسب المادة"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full sm:w-auto min-h-[44px] px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] text-xs sm:text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800B34]"
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

      {/* Question Type Filter */}
      {(essayCount > 0 || typeFilter !== "ALL") && (
        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155]">
          <span className="text-xs font-bold text-[#536681] dark:text-[#94A3B8]">
            نوع السؤال:
          </span>
          {[
            { id: "ALL" as const, label: `الكل (${totalCount})` },
            { id: "OBJECTIVE" as const, label: `اختيار وصح وغلط (${objectiveCount})` },
            { id: "ESSAY" as const, label: `أسئلة مقالية (${essayCount})` },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTypeFilter(item.id)}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold font-sans tabular-nums transition-colors cursor-pointer ${
                typeFilter === item.id
                  ? "bg-[#800B34] text-white"
                  : "bg-[#F7F9FC] dark:bg-[#1E293B] text-[#536681] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] hover:text-[#091B40] dark:hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
