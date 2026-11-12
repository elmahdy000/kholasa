"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-12 sm:py-16 bg-[#F7F9FC] dark:bg-[#081426] border-b border-[#E8E9ED] dark:border-[#22364F]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-6 sm:p-10 text-right flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#091B40] dark:text-white leading-snug">
              جاهز تدخل على المنصة وتبدأ مذاكرة؟
            </h2>
            <p className="text-sm sm:text-[15px] text-[#536681] dark:text-[#94A3B8] leading-relaxed">
              سجّل بياناتك واشترك في دقيقة أو ادخل بكود الطالب وابدأ المذاكرة — وهتفضل مسجّل دخول على جهازك لحد ما تخرج بنفسك.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
            >
              <span>دخول بكود الطالب</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              href="/subscription"
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#091B40] hover:bg-[#1D4ED8] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
            >
              <span>طالب جديد؟ سجل واشترك</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              href="/subjects"
              className="min-h-[44px] px-4 py-2.5 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#091B40] dark:text-white text-sm font-bold inline-flex items-center gap-2 hover:border-[#800B34] hover:text-[#800B34] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" />
              <span>تصفّح المواد</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
