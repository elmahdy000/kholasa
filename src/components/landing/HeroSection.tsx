"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Zap,
  CheckCircle2,
  Flame,
  Lightbulb,
  Check,
} from "lucide-react";

export function HeroSection() {
  const [demoSelected, setDemoSelected] = useState<number | null>(null);

  const demoOptions = [
    {
      id: 1,
      text: "تزداد إلى الضعف (علاقة طردية)",
      isCorrect: true,
      explanation: "صحيح! طبقاً لقانون نيوتن الثاني F = m × a، عند ثبوت الكتلة m تتناسب العجلة طردياً مع القوة.",
    },
    {
      id: 2,
      text: "تقل إلى النصف (علاقة عكسية)",
      isCorrect: false,
      explanation: "خطأ: العجلة تتناسب عكسياً مع الكتلة فقط، وليس مع القوة المؤثرة.",
    },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-white dark:bg-[#0F172A] bg-grid-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left / Main Text Column (7 cols) */}
          <div className="lg:col-span-7 text-right space-y-6 sm:space-y-8">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185]">
                المنصة التعليمية الشاملة لطلاب الثانوية العامة 2026
              </span>
            </div>

            {/* Massive Bold Headline */}
            <h1 className="text-2xl sm:text-3xl sm:text-4xl lg:text-4xl font-bold text-[#1A0A10] dark:text-white leading-[1.25] tracking-tight">
              افهم المنهج من الجذور..{" "}
              <br className="hidden sm:inline" />
              وراجع{" "}
              <span className="text-[#D97706] dark:text-[#FBBF24]">
                بالزتونة الذهبية
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-[#735C63] dark:text-[#94A3B8] leading-relaxed max-w-xl font-medium">
              شروحات مفككة خطوة بخطوة، كبسولات "الزتونة" المركزة للمراجعة في دقائق، خرائط ذهنية للعلاقات، وبنك أسئلة متكيف يفسر سبب كل اختيار مع ركن خاص بأخطائك لضمان الدرجة النهائية.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register"
                className="h-12 px-8 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-sm font-bold flex items-center gap-3 shadow-sm hover:shadow-md transition-all active:opacity-80"
              >
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <span>ابدأ مذاكرتك مجانًا</span>
                <ArrowLeft className="w-4 h-4 mr-1" />
              </Link>

              <Link
                href="/exams/builder"
                className="h-12 px-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] text-[#1A0A10] dark:text-white text-sm font-bold flex items-center gap-2 hover:border-[#800020] hover:text-[#800020] transition-all active:opacity-80 shadow-xs"
              >
                <Zap className="w-4 h-4 text-[#D97706] fill-[#D97706]" />
                <span>جرّب بنك الأسئلة</span>
              </Link>
            </div>

            {/* Trust Strip */}
            <div className="pt-6 border-t border-[#F0E6E8] dark:border-[#334155] grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-[#1A0A10] dark:text-white block">
                  شرح لكل سؤال
                </span>
                <span className="text-[13px] text-[#735C63] dark:text-[#94A3B8] font-bold block">
                  تفسير كامل لكل إجابة
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-[#1A0A10] dark:text-white block">
                  راجع غلطاتك
                </span>
                <span className="text-[13px] text-[#735C63] dark:text-[#94A3B8] font-bold block">
                  أخطاؤك محفوظة في ركن «غلطاتي»
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-bold text-[#D97706] dark:text-[#FBBF24] block">
                  مناهج شاملة
                </span>
                <span className="text-[13px] text-[#735C63] dark:text-[#94A3B8] font-bold block">
                  تغطي المسارات الدراسية
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-bold text-[#059669] dark:text-[#34D399] block">
                  PWA
                </span>
                <span className="text-[13px] text-[#735C63] dark:text-[#94A3B8] font-bold block">
                  يعمل أوفلاين على الهاتف
                </span>
              </div>
            </div>
          </div>

          {/* Right Product Preview Mockup (5 cols) */}
          <div className="lg:col-span-5 relative">
            {/* Floating Achievement 1 (Top Left) */}
            <div className="absolute -top-4 -left-4 sm:-left-6 z-20 px-4 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] shadow-sm flex items-center gap-2">
              <div className="w-11 h-11 rounded-lg bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] flex items-center justify-center font-bold">
                <Flame className="w-4 h-4 fill-[#D97706]" />
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#1A0A10] dark:text-white block">
                  تحدي يومي
                </span>
                <span className="text-[13px] text-[#D97706] dark:text-[#FBBF24] font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-[#D97706] text-[#D97706]" />
                  <span>سؤال جديد كل يوم</span>
                </span>
              </div>
            </div>

            {/* Floating Achievement 2 (Bottom Right) */}
            <div className="absolute -bottom-4 -right-4 sm:-right-6 z-20 px-4 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] shadow-sm flex items-center gap-2">
              <div className="w-11 h-11 rounded-lg bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[13px] font-bold text-[#1A0A10] dark:text-white block">
                  ركن غلطاتي
                </span>
                <span className="text-[13px] text-[#059669] dark:text-[#34D399] font-bold block">
                  مراجعة مستمرة للأخطاء
                </span>
              </div>
            </div>

            {/* Main Interactive Preview Card */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] shadow-sm relative overflow-hidden space-y-4 text-right">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#F0E6E8] dark:border-[#334155] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold border border-[#800020]/20 dark:border-[#E11D48]/40">
                    الفيزياء • قوانين نيوتن
                  </span>
                  <span className="text-[13px] text-[#735C63] dark:text-[#94A3B8] font-bold">
                    معاينة حية
                  </span>
                </div>
              </div>

              {/* Question Statement */}
              <div className="space-y-1">
                <span className="text-[13px] font-bold text-[#D97706] dark:text-[#FBBF24] block">
                  سؤال تطبيقي من الامتحان الوزاري:
                </span>
                <h4 className="text-sm sm:text-base font-bold text-[#1A0A10] dark:text-white leading-relaxed">
                  إذا زادت القوة المؤثرة على جسم كتلته ثابتة إلى الضعف، فإن العجلة التي يتحرك بها...
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {demoOptions.map((opt) => {
                  const isSelected = demoSelected === opt.id;
                  let style =
                    "bg-[#FAF7F8] dark:bg-[#1E293B] border-[#F0E6E8] dark:border-[#334155] hover:border-[#800020]";

                  if (demoSelected !== null) {
                    if (opt.isCorrect) {
                      style =
                        "bg-[#059669]/10 dark:bg-[#1E293B] border-[#059669] text-[#059669] dark:text-[#34D399] font-bold";
                    } else if (isSelected && !opt.isCorrect) {
                      style =
                        "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#DC2626] text-[#DC2626] dark:text-[#F87171] font-bold";
                    } else {
                      style = "opacity-50 bg-[#FAF7F8] dark:bg-[#1E293B] border-[#F0E6E8]";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDemoSelected(opt.id)}
                      className={`w-full p-3 rounded-xl border text-[13px] text-right transition-all flex flex-col space-y-2 ${style}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold">{opt.text}</span>
                        {demoSelected !== null && opt.isCorrect && (
                          <span className="text-[13px] bg-[#059669] text-white px-2 py-1 rounded-full font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>صحيح</span>
                          </span>
                        )}
                      </div>
                      {demoSelected !== null && isSelected && (
                        <p className="text-[13px] leading-relaxed pt-1 border-t border-[#F0E6E8]/60 dark:border-[#334155]">
                          {opt.explanation}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Micro Tip */}
              {demoSelected === null ? (
                <p className="text-[13px] text-center text-[#735C63] font-medium pt-1">
                  اختر أحد البديلين لمعاينة التفسير العلمي الفوري.
                </p>
              ) : (
                <div className="p-3 rounded-xl bg-[#D97706]/10 dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#FBBF24]/40 flex items-start gap-2 text-[13px]">
                  <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0 mt-1" />
                  <span className="text-[13px] text-[#D97706] dark:text-[#FBBF24] font-bold leading-relaxed">
                    سر الزتونة: كل سؤال في الخلاصة يحتوي على تعليل لماذا الإجابة صحيحة ولماذا باقي الخيارات خاطئة.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}