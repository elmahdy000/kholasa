"use client";

import Link from "next/link";
import { Compass, BookOpen, CheckSquare, ArrowLeft } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "اختار منهجك ودرسك",
    description:
      "حدد الصف الدراسي ونوع المدرسة (عربي أو لغات) للوصول المباشر لوحدات ودروس مسارك دون تداخل.",
    icon: Compass,
  },
  {
    number: "2",
    title: "افهم المفاهيم والخريطة الذهنية",
    description:
      "استعرض تعريفات الدرس الأساسية وترجمتها واللوحات البصرية قبل أن تبدأ في حل التدريبات.",
    icon: BookOpen,
  },
  {
    number: "3",
    title: "اختبر نفسك وعالج غلطاتك",
    description:
      "جاوب على أسئلة الدرس، اقرأ التفسير العلمي لإجابتك، وارجع لأخطائك المسجلة من ركن غلطاتي.",
    icon: CheckSquare,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-12 sm:py-16 bg-[#F7F9FC] dark:bg-[#081426] border-b border-[#E8E9ED] dark:border-[#22364F]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-right">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#091B40] dark:text-white leading-snug">
              إزاي تستخدم الخلاصة في مذاكرتك؟
            </h2>
            <p className="text-sm sm:text-[15px] text-[#536681] dark:text-[#94A3B8] leading-relaxed">
              ثلاث خطوات عملية تمشي عليها في كل درس.
            </p>
          </div>

          <Link
            href="/login"
            className="min-h-[44px] px-5 py-2 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors self-start sm:self-auto shrink-0"
          >
            <span>دخول الطالب بالكود</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3 text-right"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="w-9 h-9 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-sans tabular-nums font-bold px-2.5 py-1 rounded-md bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#091B40] dark:text-white">
                    خطوة {step.number}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#091B40] dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
