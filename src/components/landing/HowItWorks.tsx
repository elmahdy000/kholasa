"use client";

import Link from "next/link";
import { BookOpen, BookmarkCheck, CheckSquare, ArrowLeft } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "اختار مادتك ودرسك",
    description:
      "ادخل على المادة اللي عايز تذاكرها، واختار الدرس اللي محتاج تفهمه أو تراجع عليه بسرعة.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "افهم الشرح وراجع الزتونة",
    description:
      "اقرا الشرح خطوة بخطوة، أو ادخل ع الزتونة واعرف تكات الامتحان والقوانين في ٣ دقايق.",
    icon: BookmarkCheck,
  },
  {
    number: "03",
    title: "حل أسئلة وافهم غلطاتك",
    description:
      "حل كويز على الدرس، واعرف سبب كل اختيار، وأي سؤال تغلط فيه بيتسجل عشان تراجعه تاني.",
    icon: CheckSquare,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-[#F7F8FA] dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 text-right">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#12263F] dark:text-white leading-tight tracking-tight">
            إزاي تذاكر بالخلاصة؟
          </h2>
          <p className="text-base text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            ٣ خطوات سهلة تحول مذاكرتك من حفظ وتسميع لفهم يثبت في دماغك ويدخلك الامتحان مرتاح.
          </p>
        </div>

        {/* 3 Step Cards Connected by Subtle Directional Line */}
        <div className="relative">
          {/* Subtle Directional Line on Desktop (Respecting RTL from step 1 to 3) */}
          <div className="hidden md:block absolute top-1/2 -translate-y-6 right-[15%] left-[15%] h-[1px] bg-[#E8E9ED] dark:bg-[#334155] z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors shadow-xs flex flex-col justify-between space-y-4 text-right"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#800020]/8 dark:bg-[#FB7185]/10 border border-[#800020]/15 dark:border-[#FB7185]/20 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                        <Icon className="w-5 h-5" strokeWidth={1.8} />
                      </div>
                      <span className="font-mono text-sm font-bold text-[#800020] dark:text-[#FB7185] px-2.5 py-1 rounded-lg bg-[#800020]/5 dark:bg-[#FB7185]/10 border border-[#800020]/15 dark:border-[#FB7185]/20">
                        {step.number}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-[#12263F] dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact CTA */}
        <div className="text-center pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-sm font-bold transition-all shadow-xs active:scale-[0.99]"
          >
            <span>ابدأ المذاكرة بالطريقة دي</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}