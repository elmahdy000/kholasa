"use client";

import { Shield, Trash2, Smartphone, RotateCcw, Eye, Copy, KeyRound } from "lucide-react";
import type { UserItem } from "./types";

interface UserTableProps {
  users: UserItem[];
  currentUserId: string;
  onSelectUserToEdit: (user: UserItem) => void;
  onDeleteUser: (userId: string, userName: string) => void;
  onResetDevices: (userId: string, userName: string) => void;
  onInspectUser?: (userId: string) => void;
}

export function UserTable({
  users,
  currentUserId,
  onSelectUserToEdit,
  onDeleteUser,
  onResetDevices,
  onInspectUser,
}: UserTableProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-[13px]">
          <thead className="bg-[#F8FAFC] dark:bg-[#1E293B]/80 border-b border-[#E2E8F0]/80 dark:border-[#334155]/80 text-[#64748B] font-bold">
            <tr>
              <th className="p-4">المستخدم</th>
              <th className="p-4">بيانات الاتصال</th>
              <th className="p-4">النظام والصف الدراسي</th>
              <th className="p-4">الرتبة والصلاحية</th>
              <th className="p-4">الأجهزة</th>
              <th className="p-4">الدروس المنجزة</th>
              <th className="p-4">الامتحانات</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/60 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            {users.map((u) => {
              const completedLessons = u.progress.filter((p) => p.isCompleted).length;
              return (
                <tr
                  key={u.id}
                  className="hover:bg-[#F8FAFC] dark:hover:bg-[#334155]/20 transition-colors"
                >
                  {/* User info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#800020] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                        {(u.name || "م").charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onInspectUser?.(u.id)}
                            className="font-bold text-[#0F172A] dark:text-white block hover:text-[#800020] dark:hover:text-[#FB7185] transition-colors text-right cursor-pointer"
                          >
                            {u.name || "مستخدم بدون اسم"}
                          </button>
                          {u.loginCode && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(u.loginCode!);
                                alert(`تم نسخ كود الطالب: ${u.loginCode}`);
                              }}
                              title="انقر لنسخ كود الطالب"
                              className="px-2 py-0.5 rounded-md bg-[#800020]/10 hover:bg-[#800020]/20 text-[#800020] dark:text-[#FB7185] font-mono text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <KeyRound className="w-3 h-3 text-[#800020] dark:text-[#FB7185]" />
                              <span>{u.loginCode}</span>
                              <Copy className="w-3 h-3 opacity-60" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-[#94A3B8] font-mono mt-0.5">
                          <span>{new Date(u.createdAt).toLocaleDateString("ar-EG")}</span>
                          {u.schoolCategory && (
                            <span>• {u.schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="p-4 font-mono text-[13px] text-[#64748B]" dir="ltr">
                    {u.phone || u.email || "—"}
                  </td>

                  {/* Educational Info */}
                  <td className="p-4">
                    {u.system?.name ? (
                      <div className="space-y-1">
                        <span className="text-[13px] font-bold block">{u.system.name}</span>
                        <span className="text-[13px] text-[#94A3B8] font-medium">
                          {u.grade?.name || "الصف غير محدد"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#94A3B8] text-[13px]">غير محدد</span>
                    )}
                  </td>

                  {/* Role Badge */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-bold ${
                        u.role === "SUPER_ADMIN"
                          ? "bg-[#800020]/10 text-[#800020] border border-[#800020]/20"
                          : u.role === "ADMIN"
                          ? "bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20"
                          : u.role === "TEACHER"
                          ? "bg-[#800020]/10 text-[#800020] border border-[#800020]/20"
                          : "bg-[#800020]/10 text-[#800020] border border-[#800020]/20"
                      }`}
                    >
                      {u.role === "SUPER_ADMIN"
                        ? "مشرف عام أعلى"
                        : u.role === "ADMIN"
                        ? "مسؤول نظام"
                        : u.role === "TEACHER"
                        ? "معلم"
                        : "طالب"}
                    </span>
                  </td>

                  {/* Bound Devices */}
                  <td className="p-4">
                    {u.role === "STUDENT" ? (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            (u.boundDevices?.length || 0) >= (u.maxDevices || 2)
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                              : (u.boundDevices?.length || 0) > 0
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                          title={`الأجهزة المسجلة: ${u.boundDevices?.length || 0} من أصل ${u.maxDevices || 2}`}
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>
                            {u.boundDevices?.length || 0} / {u.maxDevices || 2}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#94A3B8] text-xs font-medium">غير مقيد</span>
                    )}
                  </td>

                  {/* Progress */}
                  <td className="p-4">
                    <span className="text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]">
                      {completedLessons} درس
                    </span>
                  </td>

                  {/* Attempts */}
                  <td className="p-4">
                    <span className="text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]">
                      {u.attempts.length} اختبار
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onInspectUser?.(u.id)}
                        className="h-11 px-3 rounded-lg bg-[#800020]/10 hover:bg-[#800020]/20 text-[#800020] dark:text-[#FB7185] text-[13px] font-bold flex items-center gap-1 transition-colors"
                        title="عرض الملف الشامل للطالب"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">تفاصيل</span>
                      </button>

                      {u.role === "STUDENT" && (
                        <button
                          onClick={() => onResetDevices(u.id, u.name || "")}
                          className="h-11 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/50 text-[13px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 transition-colors"
                          title="فك ربط الأجهزة المسجلة وإلغاء الجلسات"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">فك الأجهزة</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectUserToEdit(u)}
                        className="h-11 px-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-[13px] font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-1 transition-colors"
                        title="تعديل الرتبة"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>الرتبة</span>
                      </button>

                      <button
                        onClick={() => onDeleteUser(u.id, u.name || "")}
                        disabled={u.id === currentUserId}
                        className="p-2 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="حذف المستخدم"
                      >
                        <Trash2 className="w-4 h-4" />
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
