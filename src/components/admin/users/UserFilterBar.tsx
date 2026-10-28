"use client";

import { Search, Plus } from "lucide-react";
import type { EducationalSystem } from "./types";

interface UserFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedSystemId: string;
  setSelectedSystemId: (id: string) => void;
  systems: EducationalSystem[];
  totalFilteredCount: number;
  totalUsersCount: number;
  onOpenCreate: () => void;
}

export function UserFilterBar({
  searchQuery,
  setSearchQuery,
  selectedRole,
  setSelectedRole,
  selectedSystemId,
  setSelectedSystemId,
  systems,
  totalFilteredCount,
  totalUsersCount,
  onOpenCreate,
}: UserFilterBarProps) {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search Box */}
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث بالاسم، رقم الهاتف، أو البريد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-9 pl-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800020]"
          />
        </div>

        {/* Role Filter */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
        >
          <option value="all">كل الرتب والصلاحيات</option>
          <option value="STUDENT">طالب (STUDENT)</option>
          <option value="TEACHER">معلم (TEACHER)</option>
          <option value="EDITOR">محرر محتوى (EDITOR)</option>
          <option value="ADMIN">مسؤول (ADMIN)</option>
          <option value="SUPER_ADMIN">مشرف عام أعلى (SUPER_ADMIN)</option>
        </select>

        {/* System Filter */}
        <select
          value={selectedSystemId}
          onChange={(e) => setSelectedSystemId(e.target.value)}
          className="h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
        >
          <option value="all">كل الأنظمة التعليمية</option>
          {systems.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[13px] font-bold text-[#94A3B8]">
          عرض {totalFilteredCount} من أصل {totalUsersCount} مستخدم
        </span>
        <button
          onClick={onOpenCreate}
          className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مستخدم أو مشرف</span>
        </button>
      </div>
    </div>
  );
}
