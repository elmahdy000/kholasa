"use client";

import { X } from "lucide-react";
import { Grade } from "./types";

interface GradeModalProps {
  isOpen: boolean;
  grade?: Grade;
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function GradeModal({
  isOpen,
  grade,
  loading,
  onClose,
  onSubmit,
}: GradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
          <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
            {grade ? "تعديل الصف الدراسي" : "إضافة صف دراسي جديد"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748B] hover:text-[#64748B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              اسم الصف
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={grade?.name || ""}
              placeholder="مثال: الصف الثالث الثانوي"
              className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] outline-none"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              رمز الصف (Code)
            </label>
            <input
              type="text"
              name="code"
              required
              defaultValue={grade?.code || ""}
              placeholder="مثال: G12"
              className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-mono outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-3 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-11 px-4 rounded-md bg-[#334155] dark:bg-[#F8FAFC] text-white dark:text-[#1E293B] text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              {loading ? "جاري الحفظ..." : "حفظ الصف"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
