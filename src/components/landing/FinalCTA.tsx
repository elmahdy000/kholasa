"use client";

import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] p-8 sm:p-12 lg:p-14 text-center shadow-xs">
          <div className="max-w-2xl mx-auto space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#800B34]/10 border border-[#800B34]/20 text-[#800B34] dark:text-[#FB7185] text-xs font-bold">
              الخلاصة للبكالوريا • بإشراف Dr/Elmahdy
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#12263F] dark:text-white leading-tight tracking-tight">
              جاهز تقفّل مسار الهندسة وعلوم الحاسب بثقة؟
            </h2>

            <p className="text-base text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
              افهم معمارية النظم والـ CPU، أتقن الأمن السيبراني والتشفير، وبرمج بلغة C++ والذكاء الاصطناعي من غير حفظ عشوائي.. راجع الزتونة في ٣ دقايق وحل آلاف الأسئلة المتدرجة بالتفسير الكامل.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/login"
                className="h-12 px-8 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-sm font-bold flex items-center gap-2 transition-all shadow-xs active:scale-[0.99]"
              >
                <span>دخول بكود الطالب</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <Link
                href="/subjects"
                className="h-12 px-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#12263F] dark:text-white text-sm font-bold flex items-center gap-2 hover:border-[#800B34] hover:text-[#800B34] transition-colors shadow-xs"
              >
                <Target className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" />
                <span>تصفح الوحدات والدروس</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
