"use client";

import { useState, useRef, useId, useEffect } from "react";
import { AlertTriangle, Trash2, Info, Loader2, X } from "lucide-react";
import { Dialog } from "./Dialog";

export interface ConfirmModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemHighlight?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  isOpen,
  onClose,
  onConfirm,
  title = "تأكيد العملية",
  description = "هل أنت متأكد من تنفيذ هذه العملية؟ لا يمكن التراجع عنها بعد الإتمام.",
  itemHighlight,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const isModalOpen = Boolean(open ?? isOpen);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      setError(null);
      setInternalLoading(false);
    }
  }, [isModalOpen]);

  const loading = isLoading || internalLoading;

  const handleConfirm = async () => {
    if (loading) return;
    try {
      setError(null);
      setInternalLoading(true);
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تنفيذ العملية، يرجى المحاولة مرة أخرى.");
    } finally {
      setInternalLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
          iconBg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40",
          btnBg: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40",
          btnBg: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />,
          iconBg: "bg-[#800020]/10 border border-[#800020]/20 text-[#800020]",
          btnBg: "bg-[#800020] hover:bg-[#66001A] text-white focus:ring-[#800020]",
        };
    }
  };

  const { icon, iconBg, btnBg } = getVariantStyles();

  return (
    <Dialog
      open={isModalOpen}
      labelledBy={titleId}
      onClose={loading ? () => {} : onClose}
      initialFocusRef={cancelBtnRef}
    >
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-[#334155] p-6 text-right font-sans antialiased overflow-hidden" dir="rtl">
        {/* Header icon and close button */}
        <div className="flex items-start justify-between gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${iconBg}`}>
            {icon}
          </div>
          <button
            type="button"
            onClick={loading ? undefined : onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Description */}
        <div className="mt-4">
          <h3 id={titleId} className="text-base font-bold text-[#0F172A] dark:text-white">
            {title}
          </h3>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1.5 leading-relaxed">
            {description}
          </p>

          {/* Optional item highlight card */}
          {itemHighlight && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate font-mono">
              {itemHighlight}
            </div>
          )}

          {/* Error alert inside modal */}
          {error && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${btnBg}`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
