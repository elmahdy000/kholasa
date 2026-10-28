"use client";

import { Search } from "lucide-react";
import { MediaFile } from "./types";

interface MediaFilterBarProps {
  files: MediaFile[];
  filterType: string;
  onFilterChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MediaFilterBar({
  files,
  filterType,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: MediaFilterBarProps) {
  const categories = [
    { id: "all", label: "كافة الملفات", count: files.length },
    {
      id: "audio",
      label: "صوتيات وبودكاست",
      count: files.filter((f) => f.type === "audio").length,
    },
    {
      id: "image",
      label: "صور وخرائط ذهنية",
      count: files.filter((f) => f.type === "image").length,
    },
    {
      id: "document",
      label: "مستندات PDF",
      count: files.filter((f) => f.type === "document").length,
    },
    {
      id: "video",
      label: "فيديوهات",
      count: files.filter((f) => f.type === "video").length,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onFilterChange(cat.id)}
            className={`px-3 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              filterType === cat.id
                ? "bg-[#334155] text-white dark:bg-[#F8FAFC] dark:text-[#1E293B] font-semibold"
                : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <span>{cat.label}</span>
            <span className="text-[13px] font-mono opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="بحث باسم الملف..."
          className="w-full h-11 pr-8 pl-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] outline-none"
        />
      </div>
    </div>
  );
}
