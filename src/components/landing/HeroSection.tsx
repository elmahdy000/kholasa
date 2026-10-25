"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Zap,
  RotateCcw,
  FileText,
  Volume2,
} from "lucide-react";

export function HeroSection() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"zatona" | "quiz">("zatona");
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(1);

  const quizOptions = [
    {
      id: 1,
      text: "تزداد إلى الضعف (علاقة طردية خطية)",
      isCorrect: true,
      explanation:
        "تفسير وزاري: طبقاً لقانون نيوتن الثاني (F = m · a)، بثبوت الكتلة m تتناسب العجلة a طردياً مع محصلة القوة المؤثرة F.",
    },
    {
      id: 2,
      text: "تقل إلى النصف (علاقة عكسية)",
      isCorrect: false,
      explanation:
        "تحليل الخطأ: العجلة تتناسب عكسياً مع الكتلة m عند ثبوت القوة، بينما تتناسب طردياً مع القوة المؤثرة.",
    },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-white dark:bg-[#0F172A]">
      {/* Subtle radial ambient background glow */}
      <div
        className="absolute top-0 right-1/2 translate-x-1/2 w-[900px] h-[400px] opacity-[0.06] dark:opacity-[0.12] pointer-events-none blur-3xl rounded-full"
        style={{
          background: "radial-gradient(circle, #800020 0%, #D97706 60%, transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Main Left Text Column (7 cols) */}
          <div className="lg:col-span-7 text-right space-y-6 sm:space-y-8">
            {/* Top Academic Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FAF7F8] dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[#800020] dark:bg-[#FB7185]" />
              <span className="text-[13px] font-semibold text-[#800020] dark:text-[#FB7185] tracking-tight">
                دفعة 2026 • المنهج الوزاري ونواتج التعلم الرسمية
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A0A10] dark:text-white leading-[1.2] tracking-tight">
              افهم المنهج من جذوره..{" "}
              <br className="hidden sm:inline" />
              وراجع بذكاء مع{" "}
              <span className="text-[#800020] dark:text-[#FB7185]">الخلاصة</span>{" "}
              <span className="text-[#D97706] dark:text-[#FBBF24]">المركزة</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-[#735C63] dark:text-[#94A3B8] leading-relaxed max-w-xl font-normal">
              منظومة تعليمية متكاملة لطلاب الثانوية العامة والبكالوريا: شروحات مفككة خطوة بخطوة، كبسولات تلخيصية تغنيك عن شتات المذكرات، وبنك أسئلة متكيف يحلل سبب كل إجابة مع سجل دقيق يعالج أخطاءك تلقائياً.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/register"
                className="h-12 px-7 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-sm font-bold flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
              >
                <span>ابدأ مذاكرتك مجانًا</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <Link
                href="/exams/builder"
                className="h-12 px-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] text-[#1A0A10] dark:text-white text-sm font-semibold flex items-center gap-2 hover:border-[#800020] hover:text-[#800020] dark:hover:border-[#FB7185] dark:hover:text-[#FB7185] transition-all active:scale-[0.99] shadow-xs"
              >
                <Zap className="w-4 h-4 text-[#D97706]" />
                <span>جرّب بنك الأسئلة</span>
              </Link>
            </div>

            {/* Metrics Strip */}
            <div className="pt-6 border-t border-[#F0E6E8] dark:border-[#334155] grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-extrabold text-[#1A0A10] dark:text-white block font-mono">
                  +15,000
                </span>
                <span className="text-xs text-[#735C63] dark:text-[#94A3B8] font-medium block">
                  سؤال وزاري وتدريبي محلول
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-extrabold text-[#D97706] dark:text-[#FBBF24] block font-mono">
                  3 دقائق
                </span>
                <span className="text-xs text-[#735C63] dark:text-[#94A3B8] font-medium block">
                  متوسط مراجعة كبسولة الزتونة
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-extrabold text-[#059669] dark:text-[#34D399] block font-mono">
                  100%
                </span>
                <span className="text-xs text-[#735C63] dark:text-[#94A3B8] font-medium block">
                  تغطية لنواتج التعلم الرسمية
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-extrabold text-[#800020] dark:text-[#FB7185] block font-mono">
                  PWA
                </span>
                <span className="text-xs text-[#735C63] dark:text-[#94A3B8] font-medium block">
                  يعمل بلا إنترنت على كافة الأجهزة
                </span>
              </div>
            </div>
          </div>

          {/* Right Product Preview Mockup (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#F0E6E8] dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-lg shadow-black/[0.04] overflow-hidden">
              {/* Top Window Bar */}
              <div className="px-4 py-3 border-b border-[#F0E6E8] dark:border-[#334155] bg-[#FAF7F8] dark:bg-[#0F172A] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB] dark:bg-[#334155]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB] dark:bg-[#334155]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB] dark:bg-[#334155]" />
                </div>
                <div className="text-[12px] font-mono text-[#735C63] dark:text-[#94A3B8] dir-ltr text-center">
                  kholasa.app / physics / lesson-1
                </div>
                <span className="text-[11px] font-semibold text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 dark:bg-[#FB7185]/10 px-2 py-0.5 rounded-md">
                  معاينة حية
                </span>
              </div>

              {/* Workspace Inner Controls */}
              <div className="p-5 space-y-4 text-right">
                {/* Segmented Switcher */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155]">
                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceTab("zatona")}
                    className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeWorkspaceTab === "zatona"
                        ? "bg-white dark:bg-[#1E293B] text-[#800020] dark:text-white shadow-xs"
                        : "text-[#735C63] dark:text-[#94A3B8] hover:text-[#1A0A10]"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>كبسولة الزتونة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceTab("quiz")}
                    className={`h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeWorkspaceTab === "quiz"
                        ? "bg-white dark:bg-[#1E293B] text-[#800020] dark:text-white shadow-xs"
                        : "text-[#735C63] dark:text-[#94A3B8] hover:text-[#1A0A10]"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
                    <span>سؤال تحليلي</span>
                  </button>
                </div>

                {/* Tab 1: كبسولة الزتونة */}
                {activeWorkspaceTab === "zatona" && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-[#735C63] dark:text-[#94A3B8]">
                        <span>الفيزياء الكهربية • الدرس الأول</span>
                        <span className="font-semibold text-[#059669]">استيعاب 100%</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1A0A10] dark:text-white">
                        قانون نيوتن الثاني والعلاقات البيانية
                      </h4>
                    </div>

                    {/* Formula Card */}
                    <div className="p-3.5 rounded-xl border border-[#F0E6E8] dark:border-[#334155] bg-[#FAF7F8] dark:bg-[#0F172A] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185]">
                          القانون الرياضي الرئيسي
                        </span>
                        <span className="font-mono text-sm font-bold text-[#1A0A10] dark:text-white">
                          F = m · a
                        </span>
                      </div>
                      <p className="text-xs text-[#735C63] dark:text-[#94A3B8] leading-relaxed">
                        تتناسب عجلة تحرك الجسم طردياً مع محصلة القوى المؤثرة عليه، وعكسياً مع كتلته عند ثبوت القوة.
                      </p>
                    </div>

                    {/* Examiner Secret Tip */}
                    <div className="p-3 rounded-xl border border-[#D97706]/30 bg-[#D97706]/5 dark:bg-[#D97706]/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] dark:text-[#FBBF24]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>تكة واضعي الامتحانات:</span>
                      </div>
                      <p className="text-xs text-[#735C63] dark:text-[#E2E8F0] leading-relaxed">
                        انتبه: انعدام محصلة القوى (F = 0) يعني حركة بسرعة منتظمة وعجلة صفرية، وليس سكوناً حتمياً للجسم.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: سؤال تحليلي */}
                {activeWorkspaceTab === "quiz" && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#D97706] dark:text-[#FBBF24] block">
                        نموذج من امتحان الدور الأول:
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#1A0A10] dark:text-white leading-relaxed">
                        إذا زادت القوة المؤثرة على جسم كتلته ثابتة إلى الضعف، فإن العجلة التي يتحرك بها:
                      </h4>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2">
                      {quizOptions.map((opt) => {
                        const isSelected = selectedQuizOption === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSelectedQuizOption(opt.id)}
                            className={`w-full p-3 rounded-xl border text-right text-xs transition-all cursor-pointer ${
                              isSelected
                                ? opt.isCorrect
                                  ? "border-[#059669] bg-[#059669]/5 dark:bg-[#059669]/10"
                                  : "border-[#DC2626] bg-[#DC2626]/5 dark:bg-[#DC2626]/10"
                                : "border-[#F0E6E8] dark:border-[#334155] bg-[#FAF7F8] dark:bg-[#0F172A] hover:border-[#800020]/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#1A0A10] dark:text-white">
                                {opt.text}
                              </span>
                              {isSelected && opt.isCorrect && (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-[#059669]">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>صحيح</span>
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <p className="mt-2 pt-2 border-t border-[#F0E6E8] dark:border-[#334155] text-[11px] text-[#735C63] dark:text-[#94A3B8] leading-relaxed">
                                {opt.explanation}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer bar inside preview */}
                <div className="pt-2 border-t border-[#F0E6E8] dark:border-[#334155] flex items-center justify-between text-[11px] text-[#735C63] dark:text-[#94A3B8]">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
                    <span>بودكاست الدرس متاح (4:20 د)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>ملخص PDF جاهز للطباعة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}