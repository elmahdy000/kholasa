"use client";

import Link from "next/link";
import {
  CheckCircle2,
  BookOpen,
  RotateCcw,
  Network,
  ArrowLeft,
  Lightbulb,
  Languages,
} from "lucide-react";
import type { LandingCurriculumPayload } from "@/components/landing/types";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface FeaturesBentoProps {
  sampleProofs: LandingCurriculumPayload["sampleProofs"];
}

export function FeaturesBento({ sampleProofs }: FeaturesBentoProps) {
  const { questionExample, definitionExample, mindMapExample } = sampleProofs;

  return (
    <section
      id="features"
      className="py-12 sm:py-16 bg-[#F7F9FC] dark:bg-[#081426] border-b border-[#E8E9ED] dark:border-[#22364F]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-right">
        {/* Section Header */}
        <div className="max-w-2xl space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#091B40] dark:text-white leading-snug">
            ماذا تقدّم لك المنصة داخل كل درس؟
          </h2>
          <p className="text-sm sm:text-[15px] text-[#536681] dark:text-[#94A3B8] leading-relaxed font-normal">
            أربع أدوات فعلية مبنية على دروسك ومفاهيمك وأسئلتك الحقيقية — مش وعود دعائية.
          </p>
        </div>

        {/* Balanced 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* 1. افهم السؤال مش تحفظ إجابته */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#091B40] dark:text-white">
                  1. افهم السؤال مش تحفظ إجابته
                </h3>
              </div>

              <p className="text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                بعد اختيار إجابتك في أي سؤال، بيظهر لك السبب العلمي المعتمد وربطه بمفهوم الدرس.
              </p>

              {questionExample && (
                <div className="p-3.5 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2">
                  <div className="text-xs font-bold text-[#800B34] dark:text-[#FB7185]">
                    مثال من درس: {questionExample.lessonTitle}
                  </div>
                  <div className="text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-white leading-snug">
                    <BidiStatement text={questionExample.statement} />
                  </div>
                  <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] text-xs text-[#059669] dark:text-[#34D399] font-medium leading-relaxed flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-bold">{questionExample.correctAnswerText}: </strong>
                      {questionExample.correctReason}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#22364F]">
              <a
                href="#curriculum-explorer"
                className="text-xs font-bold text-[#800B34] dark:text-[#FB7185] hover:underline inline-flex items-center gap-1"
              >
                <span>جرّب حل سؤال حقيقي دلوقتي</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 2. راجع المفاهيم بطريقة أسرع */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#091B40]/10 dark:bg-white/10 text-[#091B40] dark:text-white flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#091B40] dark:text-white">
                  2. راجع المفاهيم بطريقة أسرع
                </h3>
              </div>

              <p className="text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                كل درس معاه مصطلحاته الأساسية منظمة في بطاقات مراجعة وبحث فوري، ومعاها ترجمة عربية لمدارس اللغات.
              </p>

              {definitionExample && (
                <div
                  dir={definitionExample.isLanguages ? "ltr" : "rtl"}
                  className={`p-3.5 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2 ${
                    definitionExample.isLanguages ? "text-left" : "text-right"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-[13px] font-bold text-[#059669] dark:text-[#34D399]">
                      <BidiStatement text={definitionExample.term} />
                    </span>
                    {definitionExample.translation && (
                      <span
                        dir="rtl"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#091B40]/8 dark:bg-white/10 text-[#091B40] dark:text-slate-200 text-[11px] font-semibold shrink-0"
                      >
                        <Languages className="w-3 h-3" />
                        <span>مترجم بالعربي</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#091B40] dark:text-slate-200 leading-relaxed">
                    <BidiStatement text={definitionExample.meaning} />
                  </p>
                  {definitionExample.translation && (
                    <p
                      dir="rtl"
                      className="text-xs text-[#536681] dark:text-[#94A3B8] pt-1.5 border-t border-[#E2E8F0] dark:border-[#334155] text-right leading-relaxed"
                    >
                      {definitionExample.translation}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#22364F]">
              <a
                href="#curriculum-explorer"
                className="text-xs font-bold text-[#800B34] dark:text-[#FB7185] hover:underline inline-flex items-center gap-1"
              >
                <span>تصفّح مصطلحات الدروس</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 3. اتعامل مع أخطائك بذكاء */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#091B40] dark:text-white">
                  3. اتعامل مع أخطائك بذكاء
                </h3>
              </div>

              <p className="text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                أي سؤال بتجاوبه غلط أثناء التدريب أو الامتحان بيتسجل تلقائياً في حسابك تحت قسم «غلطاتي» عشان ترجع تحله مع تفسيره الكامل.
              </p>

              <div className="p-3.5 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#091B40] dark:text-white">
                    آلية العمل الفعلية داخل حسابك:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171] font-bold text-[11px]">
                    قيد المراجعة
                  </span>
                </div>
                <ol className="space-y-1.5 text-xs text-[#536681] dark:text-[#94A3B8] list-decimal list-inside">
                  <li>تسجيل السؤال في «غلطاتي» تلقائياً مع عدد مرات الخطأ.</li>
                  <li>إمكانية إنشاء امتحان مراجعة مخصص من أسئلة غلطاتك فقط.</li>
                  <li>يتحول إلى «تم الإتقان» فور حله بشكل صحيح في المراجعة.</li>
                </ol>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#22364F]">
              <Link
                href="/mistakes"
                className="text-xs font-bold text-[#800B34] dark:text-[#FB7185] hover:underline inline-flex items-center gap-1"
              >
                <span>افتح قسم غلطاتي</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 4. اربط أفكار الدرس ببعض */}
          <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#091B40]/10 dark:bg-white/10 text-[#091B40] dark:text-white flex items-center justify-center shrink-0">
                  <Network className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#091B40] dark:text-white">
                  4. اربط أفكار الدرس ببعض
                </h3>
              </div>

              <p className="text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                لوحات خرائط ذهنية بصرية مرفقة بالدروس بتلخصلك العلاقات والأجزاء الأساسية قبل المذاكرة أو المراجعة.
              </p>

              {mindMapExample ? (
                <div className="p-3 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center gap-3">
                  <div className="w-24 h-16 rounded-md overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-white shrink-0">
                    <img
                      src={mindMapExample.imageUrl}
                      alt={mindMapExample.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-xs font-bold text-[#091B40] dark:text-white block truncate">
                      {mindMapExample.title}
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">
                      {mindMapExample.boardsCount} لوحات بصرية تفاعلية في هذا الدرس
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs text-[#536681] dark:text-[#94A3B8]">
                  معرض خرائط ذهنية تفاعلي يدعم التكبير والسحب باللمس على كل الأجهزة.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#22364F]">
              <a
                href="#curriculum-explorer"
                className="text-xs font-bold text-[#800B34] dark:text-[#FB7185] hover:underline inline-flex items-center gap-1"
              >
                <span>عاين الخرائط الذهنية للدروس</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
