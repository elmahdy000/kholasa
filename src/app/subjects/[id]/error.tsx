"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, RotateCcw } from "lucide-react";

export default function SubjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Subject detail page error:", error);
  }, [error]);

  return (
    <div
      dir="rtl"
      className="max-w-lg mx-auto my-8 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#DFE6F0] dark:border-[#1E3352] text-center space-y-4 shadow-xs"
    >
      <div className="w-12 h-12 rounded-xl bg-[#FDF6F3] dark:bg-[#2A1622] border border-[#EBD5CC] text-[#830D3C] dark:text-[#FDA4AF] flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-lg font-extrabold text-[#0B1D42] dark:text-white">
          تعذّر تحميل بيانات المادة
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
          حدث خطأ مؤقت أثناء جلب وحدات ودروس المادة. يمكنك إعادة المحاولة الآن أو العودة لقائمة المواد.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => reset()}
          className="w-full sm:w-auto min-h-[44px] px-5 rounded-xl bg-[#830D3C] hover:bg-[#6B0930] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>إعادة المحاولة</span>
        </button>
        <Link
          href="/subjects"
          className="w-full sm:w-auto min-h-[44px] px-5 rounded-xl bg-[#F5F7FB] dark:bg-[#142747] hover:bg-[#EAF0F8] border border-[#DFE6F0] dark:border-[#1E3A6E] text-[#0B1D42] dark:text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى المواد</span>
        </Link>
      </div>
    </div>
  );
}

