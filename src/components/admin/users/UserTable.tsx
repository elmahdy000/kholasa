"use client";

import { Shield, Trash2 } from "lucide-react";
import type { UserItem } from "./types";

interface UserTableProps {
  users: UserItem[];
  currentUserId: string;
  onSelectUserToEdit: (user: UserItem) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

export function UserTable({
  users,
  currentUserId,
  onSelectUserToEdit,
  onDeleteUser,
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
                        <span className="font-bold text-[#0F172A] dark:text-white block">
                          {u.name || "مستخدم بدون اسم"}
                        </span>
                        <span className="text-[13px] text-[#94A3B8] font-mono block">
                          {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                        </span>
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
