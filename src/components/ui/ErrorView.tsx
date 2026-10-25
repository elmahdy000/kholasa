"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Warning, ArrowClockwise, House } from "@phosphor-icons/react";

export function ErrorView({
  error,
  onRetry,
  fullScreen = true,
}: {
  error: unknown;
  onRetry: () => void;
  fullScreen?: boolean;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error ? String((error as Error & { digest?: string }).digest ?? "") : "";

  return (
    <div
      dir="rtl"
      role="alert"
      className={`${fullScreen ? "min-h-screen" : "min-h-[60vh]"} flex items-center justify-center p-6 bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]`}
    >
      <div className="w-full max-w-md text-center space-y-5 p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] ">
        <div className="mx-auto w-14 h-14 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#F87171] text-[#DC2626] dark:text-[#F87171] flex items-center justify-center">
          <Warning className="w-7 h-7" weight="bold" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold">حدث خطأ غير متوقع</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            لم نتمكن من تحميل هذه الصفحة. جرّب مرة أخرى، وإذا استمرت المشكلة عُد للرئيسية.
          </p>
          {digest && (
            <p className="text-[13px] font-mono text-[#64748B]" dir="ltr">
              {digest}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 h-11 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowClockwise className="w-4 h-4" weight="bold" aria-hidden="true" />
            <span>حاول مرة أخرى</span>
          </button>
          <Link
            href="/"
            className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
          >
            <House className="w-4 h-4" weight="bold" aria-hidden="true" />
            <span>الصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
