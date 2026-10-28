"use client";

import { X } from "lucide-react";
import { System } from "./types";

interface SystemModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  system?: System;
  loading: boolean;
  errorMsg: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SystemModal({
  isOpen,
  mode,
  system,
  loading,
  errorMsg,
  onClose,
  onSubmit,
}: SystemModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
          <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
            {mode === "create"
              ? "إضافة نظام تعليمي جديد"
              : "تعديل النظام التعليمي"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64748B] hover:text-[#64748B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-[13px]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              اسم النظام التعليمي
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={system?.name || ""}
              placeholder="مثال: الثانوية العامة المصرية"
              className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] outline-none"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              رمز النظام (Code)
            </label>
            <input
              type="text"
              name="code"
              required
              defaultValue={system?.code || ""}
              placeholder="مثال: EGY_GEN_SEC"
              className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-mono outline-none"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
              الوصف
            </label>
            <textarea
              name="description"
              rows={2}
              defaultValue={system?.description || ""}
              placeholder="وصف مختصر للنظام والمسارات التابعة له..."
              className="w-full p-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-transparent text-[13px] text-[#0F172A] dark:text-[#F8FAFC] outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              name="isActive"
              id="sysActive"
              defaultChecked={system?.isActive ?? true}
              className="rounded border-[#94A3B8] text-[#800020] focus:ring-0"
            />
            <label
              htmlFor="sysActive"
              className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]"
            >
              النظام مفعل ومتاح للطلاب
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
              {loading ? "جاري الحفظ..." : "حفظ النظام"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
