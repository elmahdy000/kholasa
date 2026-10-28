"use client";

import { Shield } from "lucide-react";
import type { UserItem } from "./types";

interface EditRoleModalProps {
  user: UserItem | null;
  newRole: string;
  setNewRole: (role: string) => void;
  isUpdating: boolean;
  errorMsg: string | null;
  currentUserRole: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditRoleModal({
  user,
  newRole,
  setNewRole,
  isUpdating,
  errorMsg,
  currentUserRole,
  onClose,
  onSubmit,
}: EditRoleModalProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl p-6 space-y-5 text-right shadow-sm border border-[#E2E8F0] dark:border-[#334155]">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#800020]" />
            <span>تعديل رتبة وصلاحيات المستخدم</span>
          </h3>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"
          >
            ×
          </button>
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0]/60 dark:border-[#334155]/60 text-[13px] space-y-1">
          <span className="text-[#94A3B8] font-bold block">المستخدم المستهدف:</span>
          <span className="font-bold text-[#0F172A] dark:text-white block text-sm">
            {user.name || "مستخدم"}
          </span>
          <span className="text-[13px] font-mono text-[#64748B] block" dir="ltr">
            {user.email || user.phone}
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] text-[13px] font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-2">
              اختر الرتبة الجديدة
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
            >
              <option value="STUDENT">طالب (STUDENT) - تصفح وحل الامتحانات</option>
              <option value="TEACHER">معلم (TEACHER) - متابعة درجات الطلاب</option>
              <option value="EDITOR">محرر (EDITOR) - إضافة أسئلة ومحتوى</option>
              <option value="ADMIN">مسؤول (ADMIN) - تحكم كامل بالمنصة</option>
              {currentUserRole === "SUPER_ADMIN" && (
                <option value="SUPER_ADMIN">مشرف عام أعلى (SUPER_ADMIN)</option>
              )}
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold disabled:opacity-50"
            >
              {isUpdating ? "جاري الحفظ..." : "حفظ التعديل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
