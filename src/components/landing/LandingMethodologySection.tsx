"use client";

import { Target, Brain, CheckCircle2, RotateCcw } from "lucide-react";

export function LandingMethodologySection() {
  return (
    <section className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold border border-[#E2E8F0] dark:border-[#E11D48]">
          <Target className="w-4 h-4" />
          <span>منهجية واضحة</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
          ثلاث خطوات من الفهم إلى الإتقان
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
          <div className="w-11 h-11 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
            1. افهم الفكرة
          </h3>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            شرح مفكك خطوة بخطوة، وملخص «الزتونة» يحفظ القوانين والمفاهيم في وقت المراجعة.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
          <div className="w-11 h-11 rounded-lg bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
            2. اختبر استيعابك
          </h3>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            امتحانات رسمية ومخصصة مع تصحيح فوري وتفسير لكل اختيار، لا مجرد درجة نهائية.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
          <div className="w-11 h-11 rounded-lg bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
            3. راجع أخطاءك
          </h3>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            كل خطأ يُحفظ في «ركن غلطاتي» ليعود إليك لاحقاً حتى تتقن المفهوم فعلياً.
          </p>
        </div>
      </div>
    </section>
  );
}
