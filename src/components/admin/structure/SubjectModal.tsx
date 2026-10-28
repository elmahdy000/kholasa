"use client";

import { X } from "lucide-react";
import { Subject } from "./types";

interface SubjectModalProps {
  isOpen: boolean;
  subject?: Subject;
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SubjectModal({
  isOpen,
  subject,
  loading,
  onClose,
  onSubmit,
}: SubjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
          <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
            {subject ? "تعديل المادة الدراسية" : "إضافة مادة دراسية جديدة"}
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
              اسم المادة
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={subject?.name || ""}
              placeholder="مثال: الفيزياء الحديثة"
              className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] outline-none"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              رمز المادة (Code)
            </label>
            <input
              type="text"
              name="code"
              required
              defaultValue={subject?.code || ""}
              placeholder="مثال: PHYS_G12"
              className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-mono outline-none"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              لون الهوية للمادة
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="color"
                defaultValue={subject?.color || "#800020"}
                className="w-11 h-11 rounded border border-[#E2E8F0] dark:border-[#334155] p-1 cursor-pointer bg-transparent"
              />
              <span className="text-[13px] font-mono text-[#64748B]">
                رمز اللون المستخدم في الواجهة
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              name="isPublished"
              id="subPublished"
              defaultChecked={subject?.isPublished ?? true}
              className="rounded border-[#94A3B8] text-[#800020] focus:ring-0"
            />
            <label
              htmlFor="subPublished"
              className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]"
            >
              نشر المادة وإتاحتها للطلاب
            </label>
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
              {loading ? "جاري الحفظ..." : "حفظ المادة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
