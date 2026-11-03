"use client";

import { Search, Plus, Download, UserCheck, Shield } from "lucide-react";
import type { EducationalSystem } from "./types";

interface UserFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedStatus: "all" | "active" | "inactive";
  setSelectedStatus: (status: "all" | "active" | "inactive") => void;
  selectedSystemId: string;
  setSelectedSystemId: (id: string) => void;
  systems: EducationalSystem[];
  totalFilteredCount: number;
  totalUsersCount: number;
  suspendedCount?: number;
  staffCount?: number;
  studentsCount?: number;
  onOpenCreate: () => void;
  onOpenBulkActivation?: () => void;
}

export function UserFilterBar({
  searchQuery,
  setSearchQuery,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  selectedSystemId,
  setSelectedSystemId,
  systems,
  totalFilteredCount,
  totalUsersCount,
  suspendedCount = 0,
  staffCount = 0,
  studentsCount = 0,
  onOpenCreate,
  onOpenBulkActivation,
}: UserFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Quick Category Segmented Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-2xs">
          <button
            type="button"
            onClick={() => setSelectedRole("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            كل الحسابات ({totalUsersCount})
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("STAFF")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRole === "STAFF"
                ? "bg-[#800020] text-white shadow-xs"
                : "text-[#800020] dark:text-[#FB7185] hover:bg-[#800020]/10"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>المساعدون والإداريون</span>
            <span className="font-mono text-[11px]">({staffCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("STUDENT")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === "STUDENT"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            الطلاب ({studentsCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Activation Button */}
          {onOpenBulkActivation && (
            <button
              type="button"
              onClick={onOpenBulkActivation}
              className="h-10 px-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
              title="تفعيل جماعي لحسابات الطلاب"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>تفعيل جماعي للطلاب</span>
            </button>
          )}

          <a
            href="/api/admin/users/export"
            download
            className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1.5 transition-colors"
            title="تصدير كشف بيانات الطلاب إلى ملف Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
            <span className="hidden sm:inline">تصدير CSV</span>
          </a>

          <button
            onClick={onOpenCreate}
            className="h-10 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مساعد أو مستخدم</span>
          </button>
        </div>
      </div>

      {/* Main Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث بالاسم، كود الطالب/المساعد، رقم الهاتف، أو البريد..."
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
            <option value="STAFF">المساعدون والإداريون (Staff) 🛡️</option>
            <option value="ADMIN">مسؤول / مساعد (ADMIN)</option>
            <option value="EDITOR">محرر محتوى (EDITOR)</option>
            <option value="TEACHER">معلم (TEACHER)</option>
            <option value="STUDENT">طالب (STUDENT)</option>
            <option value="SUPER_ADMIN">مشرف عام أعلى (SUPER_ADMIN)</option>
          </select>

          {/* Activation Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "all" | "active" | "inactive")}
            className={`h-11 px-3 rounded-xl border text-[13px] font-bold transition-colors ${
              selectedStatus === "inactive"
                ? "border-rose-300 bg-rose-50/50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900"
                : selectedStatus === "active"
                ? "border-emerald-300 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
                : "border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-white"
            }`}
          >
            <option value="all">كل حالات التفعيل</option>
            <option value="inactive">المعلقون فقط (بانتظار التفعيل {suspendedCount > 0 ? `• ${suspendedCount}` : ""})</option>
            <option value="active">المفعّلون فقط</option>
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

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs font-bold text-[#94A3B8]">
            عرض {totalFilteredCount} من أصل {totalUsersCount} مستخدم
          </span>
        </div>
      </div>
    </div>
  );
}
