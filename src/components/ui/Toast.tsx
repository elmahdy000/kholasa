"use client";

import React, { createContext, useContext, useState, useCallback, useId } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        dismiss(id);
      }, 4000);
    },
    [dismiss]
  );

  const toast = {
    success: (title: string, description?: string) => addToast("success", title, description),
    error: (title: string, description?: string) => addToast("error", title, description),
    warning: (title: string, description?: string) => addToast("warning", title, description),
    info: (title: string, description?: string) => addToast("info", title, description),
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast Floating Container */}
      <div
        dir="rtl"
        aria-live="polite"
        className="fixed bottom-5 left-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider to prevent crashes
    return {
      toast: {
        success: (title: string) => console.log("[Toast Success]", title),
        error: (title: string) => console.error("[Toast Error]", title),
        warning: (title: string) => console.warn("[Toast Warning]", title),
        info: (title: string) => console.info("[Toast Info]", title),
      },
      dismiss: () => {},
    };
  }
  return context;
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const getVisuals = () => {
    switch (item.type) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
          border: "border-slate-200 dark:border-slate-700/80",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
          badgeBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60",
          border: "border-slate-200 dark:border-slate-700/80",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          badgeBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
          border: "border-slate-200 dark:border-slate-700/80",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" />,
          badgeBg: "bg-[#800B34]/10 border-[#800B34]/20",
          border: "border-slate-200 dark:border-slate-700/80",
        };
    }
  };

  const { icon, badgeBg, border } = getVisuals();

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border ${border} shadow-lg shadow-black/5 dark:shadow-black/20 text-right transition-all animate-in fade-in slide-in-from-bottom-2 duration-200`}
    >
      <div className={`p-1.5 rounded-lg border shrink-0 ${badgeBg}`}>{icon}</div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {item.title}
        </p>
        {item.description && (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
            {item.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-md shrink-0 cursor-pointer"
        aria-label="إغلاق الإشعار"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

