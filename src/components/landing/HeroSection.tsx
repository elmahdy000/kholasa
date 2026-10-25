"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Zap, BookOpen } from "lucide-react";

export function HeroSection() {
  const [selectedOptionId, setSelectedOptionId] = useState<number>(1);

  const mcqOptions = [
    {
      id: 1,
      label: "أ",
      text: "تزداد إلى الضعف (علاقة طردية)",
      isCorrect: true,
      explanation:
        "صحيح! طبقاً لقانون نيوتن الثاني F = m · a، عند ثبوت الكتلة m تتناسب العجلة a طردياً مع محصلة القوة المؤثرة.",
    },
    {
      id: 2,
      label: "ب",
      text: "تقل إلى النصف (علاقة عكسية)",
      isCorrect: false,
      explanation:
        "خطأ: العجلة تتناسب طردياً مع القوة المؤثرة F، بينما تتناسب عكسياً مع كتلة الجسم فقط.",
    },
    {
      id: 3,
      label: "ج",
      text: "تظل ثابتة دون تغيير",
      isCorrect: false,
      explanation:
        "خطأ: ثبوت العجلة يتطلب ثبوت محصلة القوى المؤثرة، وتضاعف القوة يستلزم تضاعف العجلة.",
    },
    {
      id: 4,
      label: "د",
      text: "تزداد إلى أربعة أمثالها",
      isCorrect: false,
      explanation:
        "خطأ: التناسب بين العجلة والقوة تناسب طردي خطي من الدرجة الأولى وليس تربيعياً.",
    },
  ];

  const currentOption = mcqOptions.find((opt) => opt.id === selectedOptionId) || mcqOptions[0];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Right Column — Core Message (7 cols) */}
          <div className="lg:col-span-7 text-right space-y-6 sm:space-y-8">
            {/* Top Product Category Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#800020] dark:text-[#FB7185]">
              <span className="w-2 h-2 rounded-full bg-[#800020] dark:bg-[#FB7185]" />
              <span>المنصة التعليمية الشاملة لطلاب الثانوية العامة 2026</span>
            </div>

            {/* Primary Heading */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#12263F] dark:text-white leading-[1.18] tracking-tight">
                افهم المنهج من الجذور..
                <br />
                <span className="text-[#D97706] dark:text-[#FBBF24]">
                  وراجع بالزتونة الذهبية
                </span>
              </h1>
            </div>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-xl font-normal">
              شروحات مفككة خطوة بخطوة، كبسولات "الزتونة" المركزة للمراجعة في دقائق، خرائط ذهنية للعلاقات، وبنك أسئلة متكيف يفسر سبب كل اختيار مع ركن خاص بأخطائك لضمان الدرجة النهائية.
            </p>

            {/* Call To Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/register"
                className="h-12 px-7 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-sm font-bold flex items-center gap-2.5 transition-all shadow-xs active:scale-[0.99]"
              >
                <span>ابدأ مذاكرتك مجانًا</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <Link
                href="/exams/builder"
                className="h-12 px-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] text-[#12263F] dark:text-white text-sm font-semibold flex items-center gap-2 hover:border-[#800020] hover:text-[#800020] dark:hover:border-[#FB7185] dark:hover:text-[#FB7185] transition-colors active:scale-[0.99] shadow-xs"
              >
                <Zap className="w-4 h-4 text-[#D97706]" />
                <span>جرّب بنك الأسئلة</span>
              </Link>
            </div>

            {/* Concise Supporting Line */}
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] pt-1 font-medium">
              تغطية كاملة للمنهج الوزاري الجديد • يعمل كتطبيق ويب تقدمي (PWA) بدون إنترنت
            </p>
          </div>

          {/* Left Column — Interactive Product Preview (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#E8E9ED] dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-sm p-5 sm:p-6 space-y-4 text-right">
              {/* Product Header / Lesson Bar */}
              <div className="flex items-center justify-between border-b border-[#E8E9ED] dark:border-[#334155] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#800020]/10 dark:bg-[#FB7185]/10 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#12263F] dark:text-white block">
                      الفيزياء • قوانين نيوتن والحركة
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">
                      الدرس الأول: القوة والعجلة
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#059669]/10 text-[#059669] text-[11px] font-semibold border border-[#059669]/20">
                    استيعاب 100%
                  </span>
                </div>
              </div>

              {/* Educational Concept & Statement */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] block">
                  سؤال تطبيقي من الامتحان الوزاري:
                </span>
                <p className="text-sm font-bold text-[#12263F] dark:text-white leading-relaxed">
                  إذا زادت القوة المؤثرة على جسم كتلته ثابتة إلى الضعف، فإن العجلة التي يتحرك بها:
                </p>
              </div>

              {/* 4 Selectable Options */}
              <div className="space-y-2 pt-1">
                {mcqOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  let optionClasses =
                    "border-[#E8E9ED] dark:border-[#334155] bg-[#F7F8FA] dark:bg-[#0F172A] hover:border-[#800020]/40";

                  if (isSelected) {
                    optionClasses = opt.isCorrect
                      ? "border-[#059669] bg-[#059669]/5 dark:bg-[#059669]/10 font-bold"
                      : "border-[#DC2626] bg-[#DC2626]/5 dark:bg-[#DC2626]/10 font-bold";
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`w-full p-3 rounded-xl border text-right text-xs transition-colors flex items-center justify-between cursor-pointer ${optionClasses}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] flex items-center justify-center font-bold text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {opt.label}
                        </span>
                        <span className="text-[#12263F] dark:text-white">
                          {opt.text}
                        </span>
                      </div>

                      {isSelected && (
                        <span>
                          {opt.isCorrect ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[#059669]">
                              <Check className="w-3.5 h-3.5" />
                              <span>صحيح</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[#DC2626]">
                              <X className="w-3.5 h-3.5" />
                              <span>غير صحيح</span>
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Answer Feedback with Scientific Explanation */}
              <div className="pt-2">
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    currentOption.isCorrect
                      ? "border-[#059669]/30 bg-[#059669]/5 dark:bg-[#059669]/10 text-[#059669] dark:text-[#34D399]"
                      : "border-[#DC2626]/30 bg-[#DC2626]/5 dark:bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171]"
                  }`}
                >
                  <span className="font-bold block mb-1">
                    {currentOption.isCorrect ? "التفسير العلمي المعتمد:" : "تحليل الخطأ:"}
                  </span>
                  <p className="text-[12px] text-[#12263F] dark:text-[#E2E8F0]">
                    {currentOption.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}