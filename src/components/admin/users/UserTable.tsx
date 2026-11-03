"use client";

import { useState } from "react";
import { Shield, Trash2, Smartphone, RotateCcw, Eye, Copy, KeyRound, Check, Clock } from "lucide-react";
import type { UserItem } from "./types";

interface UserTableProps {
  users: UserItem[];
  currentUserId: string;
  onSelectUserToEdit: (user: UserItem) => void;
  onDeleteUser: (userId: string, userName: string) => void;
  onResetDevices: (userId: string, userName: string) => void;
  onInspectUser?: (userId: string) => void;
}

function formatLastActive(dateStr?: string | Date | null) {
  if (!dateStr) return "لم يسجل دخول بعد";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffMinutes < 5) return "نشط الآن 🟢";
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return date.toLocaleDateString("ar-EG");
}

export function UserTable({
  users,
  currentUserId,
  onSelectUserToEdit,
  onDeleteUser,
  onResetDevices,
  onInspectUser,
}: UserTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2000);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-[13px] border-collapse">
          <thead className="bg-[#F8FAFC] dark:bg-[#1E293B]/90 border-b border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] font-bold">
            <tr>
              <th className="py-3.5 px-4 whitespace-nowrap min-w-[220px]">المستخدم والكود</th>
              <th className="py-3.5 px-4 whitespace-nowrap">بيانات الاتصال</th>
              <th className="py-3.5 px-4 whitespace-nowrap">الصف الدراسي</th>
              <th className="py-3.5 px-4 whitespace-nowrap">الصلاحية</th>
              <th className="py-3.5 px-4 whitespace-nowrap text-center">الأجهزة</th>
              <th className="py-3.5 px-4 whitespace-nowrap text-center min-w-[170px]">إنجاز المنهج الدراسي</th>
              <th className="py-3.5 px-4 whitespace-nowrap text-center">الامتحانات</th>
              <th className="sticky left-0 bg-[#F8FAFC] dark:bg-[#1E293B] shadow-[-6px_0_12px_rgba(0,0,0,0.06)] dark:shadow-[-6px_0_12px_rgba(0,0,0,0.3)] border-r border-[#E2E8F0] dark:border-[#334155] py-3.5 px-4 whitespace-nowrap text-center min-w-[295px] z-10">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/60 text-[#0F172A] dark:text-[#F8FAFC]">
            {users.map((u) => {
              const completedLessons = u.progress?.filter((p) => p.isCompleted).length || 0;
              const isCopied = copiedCode === u.loginCode;

              return (
                <tr
                  key={u.id}
                  className="group hover:bg-[#F8FAFC]/80 dark:hover:bg-[#1E293B]/40 transition-colors"
                >
                  {/* 1. User & Code info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#800020] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        {(u.name || "م").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onInspectUser?.(u.id)}
                          className="font-bold text-[13px] sm:text-sm text-[#0F172A] dark:text-white hover:text-[#800020] dark:hover:text-[#FB7185] transition-colors text-right block truncate max-w-[210px] cursor-pointer"
                          title={u.name || "مستخدم بدون اسم"}
                        >
                          {u.name || "مستخدم بدون اسم"}
                        </button>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {u.loginCode && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCode(u.loginCode!);
                              }}
                              title="انقر لنسخ كود الطالب"
                              className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer shrink-0 border ${
                                isCopied
                                  ? "bg-emerald-600 text-white border-emerald-700"
                                  : "bg-[#800020]/10 hover:bg-[#800020]/20 text-[#800020] dark:text-[#FB7185] border-[#800020]/20"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-white" />
                                  <span>تم النسخ!</span>
                                </>
                              ) : (
                                <>
                                  <KeyRound className="w-3 h-3 text-[#800020] dark:text-[#FB7185]" />
                                  <span>{u.loginCode}</span>
                                  <Copy className="w-2.5 h-2.5 opacity-60" />
                                </>
                              )}
                            </button>
                          )}
                          <span className="text-[11px] text-[#94A3B8] font-mono whitespace-nowrap">
                            {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                          </span>
                          {u.schoolCategory && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap ${
                                u.schoolCategory === "LANGUAGES"
                                  ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {u.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}
                            </span>
                          )}
                          {u.role === "STUDENT" && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono inline-flex items-center gap-1 border ${
                                u.lastActiveAt
                                  ? "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                  : "bg-slate-50 text-slate-400 dark:bg-slate-800/40 dark:text-slate-500 border-transparent"
                              }`}
                              title={
                                u.lastActiveAt
                                  ? `آخر نشاط: ${new Date(u.lastActiveAt).toLocaleString("ar-EG")}`
                                  : "لم يتم تسجيل أي دخول بعد"
                              }
                            >
                              <Clock className="w-2.5 h-2.5 opacity-60" />
                              <span>{formatLastActive(u.lastActiveAt)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Contact */}
                  <td className="py-3.5 px-4 font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap" dir="ltr">
                    {u.phone || u.email || "—"}
                  </td>

                  {/* 3. Educational Info */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {u.grade?.name ? (
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-[#0F172A] dark:text-white">
                          {u.grade.name.includes("الصف الثاني")
                            ? "تانية ثانوي (بكالوريا)"
                            : u.grade.name.includes("الصف الأول")
                            ? "أولى ثانوي (بكالوريا)"
                            : u.grade.name}
                        </span>
                        <span className="text-[11px] text-[#94A3B8]">
                          {u.system?.name ? "البكالوريا المصرية" : "—"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#94A3B8] text-[12px]">غير محدد</span>
                    )}
                  </td>

                  {/* 4. Role Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        u.role === "SUPER_ADMIN"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent"
                          : u.role === "ADMIN"
                          ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                          : u.role === "TEACHER"
                          ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {u.role === "SUPER_ADMIN"
                        ? "مشرف أعلى"
                        : u.role === "ADMIN"
                        ? "مسؤول"
                        : u.role === "TEACHER"
                        ? "معلم"
                        : "طالب"}
                    </span>
                  </td>

                  {/* 5. Bound Devices */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    {u.role === "STUDENT" ? (
                      <span
                        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap border ${
                          (u.boundDevices?.length || 0) >= (u.maxDevices || 1)
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                            : (u.boundDevices?.length || 0) > 0
                            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            : "bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                        title={`الأجهزة المسجلة: ${u.boundDevices?.length || 0} من أصل ${u.maxDevices || 1}`}
                      >
                        <Smartphone className="w-3 h-3 shrink-0 opacity-70" />
                        <span className="font-mono">
                          {u.boundDevices?.length || 0} / {u.maxDevices || 1}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[#94A3B8] text-[11px]">غير مقيد</span>
                    )}
                  </td>

                  {/* 6. Completed Lessons & Progress Bar */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {u.role === "STUDENT" ? (
                      <div className="flex flex-col gap-1 min-w-[140px] max-w-[190px] mx-auto text-right">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span
                            className={`font-bold ${
                              (u.progressPercent || 0) >= 75
                                ? "text-emerald-600 dark:text-emerald-400"
                                : (u.progressPercent || 0) >= 30
                                ? "text-blue-600 dark:text-blue-400"
                                : (u.progressPercent || 0) > 0
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-slate-400"
                            }`}
                          >
                            {u.progressPercent || 0}%
                          </span>
                          <span className="text-[#64748B] dark:text-[#94A3B8] text-[10px]">
                            {completedLessons} / {u.totalLessons || 32} درس
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              (u.progressPercent || 0) >= 75
                                ? "bg-emerald-500 dark:bg-emerald-400"
                                : (u.progressPercent || 0) >= 30
                                ? "bg-[#800020] dark:bg-[#FB7185]"
                                : (u.progressPercent || 0) > 0
                                ? "bg-amber-500 dark:bg-amber-400"
                                : "bg-slate-300 dark:bg-slate-700"
                            }`}
                            style={{
                              width: `${Math.max(u.progressPercent || 0, (u.progressPercent || 0) > 0 ? 5 : 0)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-[#94A3B8] text-[11px]">غير مقيد بالمنهج</span>
                      </div>
                    )}
                  </td>

                  {/* 7. Exams Attempts */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    <span className="text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#1E293B] px-2 py-0.5 rounded-md font-mono">
                      {u.attempts?.length || 0}
                    </span>
                  </td>

                  {/* 8. Sticky Actions Column */}
                  <td className="sticky left-0 bg-white group-hover:bg-[#F8FAFC] dark:bg-[#0F172A] dark:group-hover:bg-[#1E293B] shadow-[-6px_0_12px_rgba(0,0,0,0.06)] dark:shadow-[-6px_0_12px_rgba(0,0,0,0.3)] border-r border-[#E2E8F0] dark:border-[#334155] py-3.5 px-4 whitespace-nowrap text-center min-w-[295px] z-10 transition-colors">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onInspectUser?.(u.id)}
                        className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-[#800020] hover:text-white dark:bg-[#1E293B] dark:hover:bg-[#800020] text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="عرض الملف الشامل للطالب"
                      >
                        <Eye className="w-3.5 h-3.5 opacity-70" />
                        <span>تفاصيل</span>
                      </button>

                      {u.role === "STUDENT" && (
                        <button
                          type="button"
                          onClick={() => onResetDevices(u.id, u.name || "")}
                          className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-amber-500/15 text-slate-700 hover:text-amber-800 dark:bg-[#1E293B] dark:text-slate-300 dark:hover:text-amber-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-amber-300/40"
                          title="فك ربط الأجهزة المسجلة لإتاحة الدخول من جهاز جديد"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>فك الأجهزة</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectUserToEdit(u)}
                        className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1E293B] dark:hover:bg-[#334155] text-slate-600 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="تعديل الرتبة أو عدد الأجهزة"
                      >
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>الرتبة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteUser(u.id, u.name || "")}
                        disabled={u.id === currentUserId}
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                        title="حذف المستخدم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
