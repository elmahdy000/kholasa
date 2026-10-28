"use client";

import { CheckCircle, Warning, SpinnerGap } from "@phosphor-icons/react";

interface ExamSubmitModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  answeredCount: number;
  unansweredCount: number;
  submitError: string | null;
  onConfirmSubmit: () => void;
  onClose: () => void;
}

export function ExamSubmitModal({
  isOpen,
  isSubmitting,
  answeredCount,
  unansweredCount,
  submitError,
  onConfirmSubmit,
  onClose,
}: ExamSubmitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-xl p-6 sm:p-8 space-y-5 text-right border border-[#E2E8F0] dark:border-[#334155] shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6" weight="fill" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            متأكد إنك خلصت وعاوز تسلّم؟
          </h3>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-content">
            أول ما تسلّم هنحسب درجتك ونوريك تقرير مفصل بكل إجاباتك ونقط ضعفك.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-around text-center">
          <div>
            <span className="block text-base font-bold text-[#059669] dark:text-[#34D399]">
              {answeredCount}
            </span>
            <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              حليتهم خلاص
            </span>
          </div>
          <div className="w-px h-11 bg-[#E2E8F0] dark:bg-[#334155]" />
          <div>
            <span
              className={`block text-base font-bold ${
                unansweredCount > 0 ? "text-[#D97706] dark:text-[#FBBF24]" : "text-[#64748B] dark:text-[#94A3B8]"
              }`}
            >
              {unansweredCount}
            </span>
            <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              لسه ما حلتهمش
            </span>
          </div>
        </div>

        {unansweredCount > 0 && !submitError && (
          <div className="p-3 rounded-lg bg-[#D97706]/10 border border-[#D97706]/20 text-[13px] font-bold text-[#D97706] flex items-center gap-2">
            <Warning className="w-4 h-4 shrink-0" weight="fill" />
            <span>خلّي بالك! لسه في أسئلة ما جاوبتهاش.</span>
          </div>
        )}

        {submitError && (
          <div className="p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/30 text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
            <Warning className="w-4 h-4 shrink-0" weight="fill" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirmSubmit}
            className="flex-1 h-11 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <SpinnerGap className="w-4 h-4 animate-spin" weight="bold" />
                <span>بنحسب درجاتك ثواني...</span>
              </>
            ) : (
              <span>أيوه، سلّم دلوقتي</span>
            )}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex-1 h-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white font-bold text-[13px] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors cursor-pointer"
          >
            لا، هرجع أكمل حل
          </button>
        </div>
      </div>
    </div>
  );
}
