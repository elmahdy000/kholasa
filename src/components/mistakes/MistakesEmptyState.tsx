"use client";

import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export function MistakesEmptyState() {
  return (
    <div className="p-12 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-center space-y-3">
      <div className="w-12 h-12 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
        رائع! لا توجد أخطاء في هذا التحديد
      </h3>
      <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
        استمر في خوض الامتحانات وحل التدريبات لاكتشاف المزيد وتثبيت حفظك وفهمك.
      </p>
      <Link
        href="/exams"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold transition-all active:opacity-80"
      >
        <span>انتقل إلى الامتحانات</span>
        <ArrowLeft className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
