"use client";

import { useRouter } from "next/navigation";
import { Trash2, Save } from "lucide-react";

interface LessonEditorFooterProps {
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (val: boolean) => void;
  isDeleting: boolean;
  isSaving: boolean;
  isLoading: boolean;
  isStandaloneRoute: boolean;
  onSave: () => void;
  onDelete: () => void;
  onClose?: () => void;
}

export function LessonEditorFooter({
  showDeleteConfirm,
  setShowDeleteConfirm,
  isDeleting,
  isSaving,
  isLoading,
  isStandaloneRoute,
  onSave,
  onDelete,
  onClose,
}: LessonEditorFooterProps) {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/80 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-4 shrink-0">
      <div>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-[#DC2626]">
              هل أنت متأكد من الحذف؟
            </span>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="h-11 px-3 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-bold transition-colors cursor-pointer"
            >
              {isDeleting ? "جارٍ الحذف..." : "نعم، احذف نهائياً"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="h-11 px-3 rounded-lg bg-[#E2E8F0] text-[#0F172A] dark:bg-[#1E293B] dark:text-[#F8FAFC] text-[13px] font-bold cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="h-11 px-3 rounded-lg text-[13px] font-bold text-[#DC2626] hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف هذا الدرس</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isStandaloneRoute && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            إغلاق النافذة
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/admin/curriculum")}
            className="h-11 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            العودة للمناهج
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || isLoading}
          className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ كافة التعديلات</span>
        </button>
      </div>
    </div>
  );
}
