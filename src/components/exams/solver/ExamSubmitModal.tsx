"use client";

import { CheckCircle, Warning, SpinnerGap, ArrowArcLeft } from "@phosphor-icons/react";

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 space-y-5 text-right border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
          <CheckCircle className="w-8 h-8" weight="fill" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            متأكد إنك خلصت وعاوز تسلّم؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-content leading-relaxed">
            أول ما تسلّم هنحسب درجتك ونوريك تقرير مفصل بكل إجاباتك ونقاط القوة والضعف.
          </p>
        </div>

        {/* Stats card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-around text-center">
          <div className="space-y-1">
            <span className="block text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {answeredCount}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              حليتهم خلاص ✓
            </span>
          </div>

          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-1">
            <span
              className={`block text-xl font-extrabold font-mono ${
                unansweredCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
              }`}
            >
              {unansweredCount}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              لسه ما جاوبتهمش
            </span>
          </div>
        </div>

        {unansweredCount > 0 && !submitError && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
            <Warning className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" weight="fill" />
            <span>خلّي بالك! لسه عندك {unansweredCount} سؤال ما جاوبتهمش.</span>
          </div>
        )}

        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2.5">
            <Warning className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" weight="fill" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirmSubmit}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer select-none"
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
            className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <ArrowArcLeft className="w-4 h-4" />
            <span>رجوع للاستكمال</span>
          </button>
        </div>
      </div>
    </div>
  );
}
