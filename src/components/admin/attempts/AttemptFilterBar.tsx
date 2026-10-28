"use client";

import { Search } from "lucide-react";

interface AttemptFilterBarProps {
  modeFilter: string;
  setModeFilter: (m: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function AttemptFilterBar({
  modeFilter,
  setModeFilter,
  searchQuery,
  setSearchQuery,
}: AttemptFilterBarProps) {
  const pills = [
    { id: "all", label: "كافة المحاولات" },
    { id: "EXAM", label: "الامتحانات الرسمية" },
    { id: "PRACTICE", label: "التدريبات الحرة" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Mode filter pills */}
      <div className="flex items-center gap-2">
        {pills.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setModeFilter(pill.id)}
            className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
              modeFilter === pill.id
                ? "bg-[#334155] text-white dark:bg-[#F8FAFC] dark:text-[#1E293B] font-semibold"
                : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث باسم الطالب، الهاتف، أو الامتحان..."
          className="w-full h-11 pr-8 pl-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] outline-none"
        />
      </div>
    </div>
  );
}
