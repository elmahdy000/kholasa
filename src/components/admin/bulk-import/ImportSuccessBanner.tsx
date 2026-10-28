"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface ImportSuccessBannerProps {
  submitSuccess: number;
  onReset: () => void;
}

export function ImportSuccessBanner({ submitSuccess, onReset }: ImportSuccessBannerProps) {
  return (
    <div className="p-8 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#34D399]/60 text-center space-y-4">
      <div className="w-16 h-16 rounded-xl bg-[#059669] text-white flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-11 h-11" />
      </div>
      <h2 className="text-xl font-bold text-[#059669] dark:text-[#34D399]">
        تم استيراد {submitSuccess} سؤال بنجاح!
      </h2>
      <p className="text-[13px] sm:text-sm text-[#059669] dark:text-[#34D399] max-w-md mx-auto">
        تمت إضافة الأسئلة ونشرها في بنك الأسئلة للمادة المحددة، وأصبحت جاهزة للاختبارات الفورية والتمارين.
      </p>
      <div className="pt-2 flex items-center justify-center gap-3">
        <Link
          href="/admin/questions"
          className="h-11 px-6 rounded-xl bg-[#800020] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm hover:bg-[#66001A] transition-all"
        >
          <span>الانتقال لبنك الأسئلة</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </Link>
        <button
          onClick={onReset}
          className="h-11 px-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors"
        >
          استيراد دفعة أخرى
        </button>
      </div>
    </div>
  );
}
