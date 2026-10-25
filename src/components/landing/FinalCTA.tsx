"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] p-8 sm:p-12 lg:p-14 text-center shadow-xs">
          <div className="max-w-xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#12263F] dark:text-white leading-tight tracking-tight">
              جاهز تخلي مذاكرتك أسهل وأخف؟
            </h2>

            <p className="text-base text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
              افهم الدرس، راجع الزتونة في ٣ دقايق، وحل وانت مطمن.. الخلاصة اتعملت عشان تذاكر بذكاء ومن غير مجهود ع الفاضي.
            </p>

            <div className="pt-2 flex items-center justify-center">
              <Link
                href="/register"
                className="h-12 px-8 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-sm font-bold flex items-center gap-2 transition-all shadow-xs active:scale-[0.99]"
              >
                <span>ابدأ دلوقتي مجانًا</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}