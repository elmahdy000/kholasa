"use client";

import type { UserItem } from "./types";

interface UserMetricsStripProps {
  users: UserItem[];
}

export function UserMetricsStrip({ users }: UserMetricsStripProps) {
  const studentsCount = users.filter((u) => u.role === "STUDENT").length;
  const adminsCount = users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;
  const totalAttempts = users.reduce((sum, u) => sum + u.attempts.length, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80">
        <span className="text-[13px] font-bold text-[#64748B]">إجمالي الحسابات</span>
        <span className="text-2xl font-bold text-[#0F172A] dark:text-white block mt-1">
          {users.length}
        </span>
      </div>
      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80">
        <span className="text-[13px] font-bold text-[#800020]">الطلاب المسجلون</span>
        <span className="text-2xl font-bold text-[#800020] dark:text-[#FB7185] block mt-1">
          {studentsCount}
        </span>
      </div>
      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80">
        <span className="text-[13px] font-bold text-[#D97706]">المسؤولون والمشرفون</span>
        <span className="text-2xl font-bold text-[#D97706] dark:text-[#FBBF24] block mt-1">
          {adminsCount}
        </span>
      </div>
      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80">
        <span className="text-[13px] font-bold text-[#059669]">إجمالي الامتحانات المنفذة</span>
        <span className="text-2xl font-bold text-[#059669] dark:text-[#34D399] block mt-1">
          {totalAttempts}
        </span>
      </div>
    </div>
  );
}
