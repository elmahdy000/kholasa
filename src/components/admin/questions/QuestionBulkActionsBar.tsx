"use client";

import { Trash2, CheckSquare, Square, X, AlertTriangle } from "lucide-react";

interface QuestionBulkActionsBarProps {
  totalCount: number;
  selectedCount: number;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  isDeleting: boolean;
}

export function QuestionBulkActionsBar({
  totalCount,
  selectedCount,
  isAllSelected,
  onToggleSelectAll,
  onClearSelection,
  onDeleteSelected,
  isDeleting,
}: QuestionBulkActionsBarProps) {
  if (totalCount === 0) return null;

  return (
    <>
      {/* Top Header Select-All Control */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right">
        <button
          type="button"
          onClick={onToggleSelectAll}
          className="flex items-center gap-2 text-[13px] font-bold text-[#0F172A] dark:text-white hover:text-[#800020] dark:hover:text-[#FB7185] transition-colors cursor-pointer select-none"
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
          ) : (
            <Square className="w-4 h-4 text-[#94A3B8]" />
          )}
          <span>{isAllSelected ? "إلغاء تحديد جميع الأسئلة" : `تحديد الكل (${totalCount} سؤال)`}</span>
        </button>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg bg-[#800020]/10 text-[#800020] dark:text-[#FB7185]">
              تم تحديد {selectedCount} من {totalCount}
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
            >
              إلغاء التحديد
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 right-1/2 translate-x-1/2 z-40 w-[92%] max-w-xl">
          <div className="bg-[#0F172A] text-white p-3.5 px-5 rounded-2xl shadow-2xl border border-[#334155] flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-[#800020] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                {selectedCount}
              </span>
              <div className="text-right">
                <p className="text-[13px] font-bold leading-tight">
                  تم تحديد {selectedCount} {selectedCount === 1 ? "سؤال" : "أسئلة"}
                </p>
                <p className="text-[11px] text-[#94A3B8]">
                  يمكنك حذفها دفعة واحدة من بنك الأسئلة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDeleteSelected}
                disabled={isDeleting}
                className="h-10 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-[#DC2626]/20"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جارٍ الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الأسئلة المحددة ({selectedCount})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClearSelection}
                disabled={isDeleting}
                className="h-10 w-10 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="إلغاء التحديد"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
