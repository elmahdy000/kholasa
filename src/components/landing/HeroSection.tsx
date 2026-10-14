"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
  Brain,
  Zap,
  CheckCircle2,
  Flame,
  Award,
  RotateCcw,
  Lightbulb,
  Check,
  X,
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
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-[#F8FAFC] dark:bg-[#09090B] bg-grid-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left / Main Text Column (7 cols) */}
          <div className="lg:col-span-7 text-right space-y-6 sm:space-y-8">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400">
                المنصة التعليمية الشاملة لطلاب الثانوية العامة 2026
              </span>
            </div>

            {/* Massive Bold Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] dark:text-white leading-[1.25] tracking-tight">
              افهم المنهج من الجذور..{" "}
              <br className="hidden sm:inline" />
              وراجع{" "}
              <span className="text-[#D97706] dark:text-amber-400">
                بالزتونة الذهبية
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-[#475569] dark:text-[#94A3B8] leading-relaxed max-w-xl font-medium">
              شروحات مفككة خطوة بخطوة، كبسولات "الزتونة" المركزة للمراجعة في دقائق، خرائط ذهنية للعلاقات، وبنك أسئلة متكيف يفسر سبب كل اختيار مع ركن خاص بأخطائك لضمان الدرجة النهائية.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/register"
                className="h-12 px-8 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-bold flex items-center gap-2.5 shadow-sm transition-colors active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ابدأ مذاكرتك مجانًا</span>
                <ArrowLeft className="w-4 h-4 mr-1" />
              </Link>

              <Link
                href="/exams/builder"
                className="h-12 px-6 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[#0F172A] dark:text-white text-sm font-bold flex items-center gap-2 hover:border-[#4F46E5] shadow-2xs transition-all active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>جرّب بنك الأسئلة</span>
              </Link>
            </div>

            {/* Live Trust Metrics Strip */}
            <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white block">
                  +15,000
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block">
                  سؤال بتفسير شامل
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white block">
                  98%
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block">
                  نسبة استيعاب المفاهيم
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-[#D97706] dark:text-amber-400 block">
                  دفعة 2026
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block">
                  مناهج معتمدة بالكامل
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                  PWA
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block">
                  يعمل أوفلاين على الهاتف
                </span>
              </div>
            </div>
          </div>

          {/* Right Product Preview Mockup (5 cols) */}
          <div className="lg:col-span-5 relative">
            {/* Floating Achievement 1 (Top Left) */}
            <div className="absolute -top-4 -left-4 sm:-left-6 z-20 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-md flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4 fill-amber-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F172A] dark:text-white block">
                  5 أيام متواصلة
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>450 XP مكتسبة</span>
                </span>
              </div>
            </div>

            {/* Floating Achievement 2 (Bottom Right) */}
            <div className="absolute -bottom-4 -right-4 sm:-right-6 z-20 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-md flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F172A] dark:text-white block">
                  ركن غلطاتي: 100%
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                  تم علاج كافة الأخطاء
                </span>
              </div>
            </div>

            {/* Main Interactive Preview Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl relative overflow-hidden space-y-4 text-right">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 text-[10px] font-bold">
                    الفيزياء • قوانين نيوتن
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    معاينة حية
                  </span>
                </div>
              </div>

              {/* Question Statement */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#D97706] dark:text-amber-400 block">
                  سؤال تطبيقي من الامتحان الوزاري:
                </span>
                <h4 className="text-sm sm:text-base font-black text-[#0F172A] dark:text-white leading-relaxed">
                  إذا زادت القوة المؤثرة على جسم كتلته ثابتة إلى الضعف، فإن العجلة التي يتحرك بها...
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {demoOptions.map((opt) => {
                  const isSelected = demoSelected === opt.id;
                  let style =
                    "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-[#4F46E5]";

                  if (demoSelected !== null) {
                    if (opt.isCorrect) {
                      style =
                        "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-black";
                    } else if (isSelected && !opt.isCorrect) {
                      style =
                        "bg-rose-50 dark:bg-rose-950/40 border-rose-600 text-rose-900 dark:text-rose-200 font-bold";
                    } else {
                      style = "opacity-50 bg-slate-50 dark:bg-zinc-900 border-slate-200";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDemoSelected(opt.id)}
                      className={`w-full p-3 rounded-xl border text-xs text-right transition-all flex flex-col space-y-1.5 ${style}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold">{opt.text}</span>
                        {demoSelected !== null && opt.isCorrect && (
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>صحيح</span>
                          </span>
                        )}
                      </div>
                      {demoSelected !== null && isSelected && (
                        <p className="text-[11px] leading-relaxed pt-1 border-t border-slate-200/60 dark:border-zinc-800">
                          {opt.explanation}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Micro Tip */}
              {demoSelected === null ? (
                <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
                  اختر أحد البديلين لمعاينة التفسير العلمي الفوري.
                </p>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2 text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-amber-900 dark:text-amber-200 font-bold leading-relaxed">
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