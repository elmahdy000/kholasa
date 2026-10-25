"use client";

import Link from "next/link";
import { BookOpen, Sparkles, Zap, ArrowLeft, CheckCircle2 } from "lucide-react";

const steps = [
  {
    stepNumber: "01",
    icon: BookOpen,
    badgeText: "المرحلة الأولى",
    title: "التفكيك والاستيعاب المفاهيمي",
    description:
      "تصفح الشرح المفكك خطوة بخطوة، واستمع لبودكاست الدرس المركز لتفهم القواعد والعلاقات العلمية قبل حفظها.",
  },
  {
    stepNumber: "02",
    icon: Sparkles,
    badgeText: "المرحلة الثانية",
    title: "التثبيت عبر كبسولة الزتونة",
    description:
      "راجع الملخص التنفيذي في 3 دقائق، وتعرف على أهم تكات واضعي الامتحانات الوزارية وقائمة التحقق قبل الحل.",
  },
  {
    stepNumber: "03",
    icon: Zap,
    badgeText: "المرحلة الثالثة",
    title: "القياس والمعالجة التراكمية",
    description:
      "خض تجربة بنك الأسئلة المتكيف، وافهم تعليل كل خيار، واجعل النظام يعيد تدريبك تلقائياً على كل سؤال أخطأت فيه.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#FAF7F8] dark:bg-[#0F172A] border-t border-[#F0E6E8] dark:border-[#334155]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 text-right">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] text-xs font-semibold shadow-xs">
            <span>منهجية الإتقان • 3 مراحل</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1A0A10] dark:text-white leading-tight tracking-tight">
            مسار التعلم النشط نحو الدرجة النهائية
          </h2>
          <p className="text-sm text-[#735C63] dark:text-[#94A3B8] font-normal leading-relaxed">
            خارطة طريق أكاديمية واضحة تحول مذاكرتك اليومية من شتات المذكرات إلى إتقان مدروس وتراكمي.
          </p>
        </div>

        {/* 3 Steps Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.stepNumber}
                className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-all duration-200 flex flex-col justify-between space-y-5 shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-sm font-bold text-[#735C63] dark:text-[#94A3B8] px-2.5 py-1 rounded-md bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155]">
                      {step.stepNumber}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185]">
                      {step.badgeText}
                    </span>
                    <h3 className="text-lg font-bold text-[#1A0A10] dark:text-white">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#735C63] dark:text-[#94A3B8] leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.99]"
          >
            <span>ابدأ المذاكرة وفق المنهجية</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}