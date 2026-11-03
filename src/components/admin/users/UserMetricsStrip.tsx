"use client";

import type { UserItem } from "./types";

interface UserMetricsStripProps {
  users: UserItem[];
}

export function UserMetricsStrip({ users }: UserMetricsStripProps) {
  const students = users.filter((u) => u.role === "STUDENT");
  const studentsCount = students.length;
  const activatedCount = students.filter((s) => s.isActive !== false).length;
  const suspendedCount = students.filter((s) => s.isActive === false).length;
  const activeStudents = students.filter((u) => (u.boundDevices?.length || 0) > 0).length;
  const pendingStudents = studentsCount - activeStudents;
  const arabicStudents = students.filter((u) => u.schoolCategory !== "LANGUAGES").length;
  const languagesStudents = students.filter((u) => u.schoolCategory === "LANGUAGES").length;
  const adminsCount = users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;
  const totalAttempts = users.reduce((sum, u) => sum + u.attempts.length, 0);

  const studentProgressList = students.map((s) => s.progressPercent || 0);
  const avgStudentProgress =
    studentProgressList.length > 0
      ? Math.round(studentProgressList.reduce((a, b) => a + b, 0) / studentProgressList.length)
      : 0;
  const totalCompletedLessons = students.reduce(
    (sum, u) => sum + (u.progress?.filter((p) => p.isCompleted).length || 0),
    0
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex flex-col justify-between">
        <span className="text-xs font-bold text-[#64748B]">إجمالي الحسابات</span>
        <span className="text-2xl font-bold font-mono text-[#0F172A] dark:text-white block mt-1">
          {users.length}
        </span>
        <span className="text-[11px] text-[#64748B] mt-1 font-mono">في قاعدة البيانات</span>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex flex-col justify-between">
        <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185]">الطلاب المسجلون</span>
        <span className="text-2xl font-bold font-mono text-[#800020] dark:text-[#FB7185] block mt-1">
          {studentsCount}
        </span>
        <span className="text-[11px] text-[#64748B] mt-1">
          عربي: {arabicStudents} • لغات: {languagesStudents}
        </span>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex flex-col justify-between">
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">حالة التفعيل والاشتراك</span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {activatedCount}
          </span>
          <span className="text-xs text-[#64748B]">مفعّل</span>
          <span className="text-xs text-[#94A3B8]">/</span>
          <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
            {suspendedCount}
          </span>
          <span className="text-xs text-[#64748B]">معلّق</span>
        </div>
        <span className="text-[11px] text-[#64748B] mt-1 font-mono">
          {suspendedCount > 0 ? "بانتظار تفعيل المساعد" : `مرتبط ${activeStudents} جهاز`}
        </span>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex flex-col justify-between">
        <span className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24]">إنجاز المنهج للدفعة</span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold font-mono text-[#D97706] dark:text-[#FBBF24]">
            {avgStudentProgress}%
          </span>
          <span className="text-xs text-[#64748B]">متوسط التقدم</span>
        </div>
        <span className="text-[11px] text-[#64748B] mt-1 font-mono">
          {totalCompletedLessons} درس مكتمل
        </span>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 flex flex-col justify-between">
        <span className="text-xs font-bold text-[#059669] dark:text-[#34D399]">إجمالي الامتحانات المنفذة</span>
        <span className="text-2xl font-bold font-mono text-[#059669] dark:text-[#34D399] block mt-1">
          {totalAttempts}
        </span>
        <span className="text-[11px] text-[#64748B] mt-1 font-mono">محاولة اختبارية</span>
      </div>
    </div>
  );
}
