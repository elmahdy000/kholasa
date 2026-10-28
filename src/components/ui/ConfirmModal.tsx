"use client";

import { useState, useRef } from "react";
import { AlertTriangle, Trash2, Info, Loader2, X } from "lucide-react";
import { Dialog } from "./Dialog";

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "تأكيد العملية",
  description = "هل أنت متأكد من تنفيذ هذه العملية؟ لا يمكن التراجع عنها بعد الإتمام.",
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const loading = isLoading || internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } catch (err) {
      console.error("Confirmation action failed:", err);
    } finally {
      setInternalLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />,
          iconBg: "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50",
          btnBg: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50",
          btnBg: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-6 h-6 text-[#800020] dark:text-[#E11D48]" />,
          iconBg: "bg-[#800020]/10 border border-[#800020]/20",
          btnBg: "bg-[#800020] hover:bg-[#66001A] text-white focus:ring-[#800020]",
        };
    }
  };

  const { icon, iconBg, btnBg } = getVariantStyles();

  return (
    <Dialog
      open={open}
      onClose={loading ? () => {} : onClose}
      initialFocusRef={cancelBtnRef}
      className="relative w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xl overflow-hidden p-6 text-right animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl shrink-0 ${iconBg}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white leading-6 mb-1">
            {title}
          </h3>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors disabled:opacity-40"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          ref={cancelBtnRef}
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-sm font-bold text-[#334155] dark:text-[#E2E8F0] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${btnBg}`}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{confirmText}</span>
        </button>
      </div>
    </Dialog>
  );
}
