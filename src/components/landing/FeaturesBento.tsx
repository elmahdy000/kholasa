"use client";

import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  Zap,
  Brain,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

export function FeaturesBento() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white dark:bg-[#09090B]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12 text-right">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800 text-[#4F46E5] dark:text-indigo-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>منهجية الخلاصة المعتمدة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-white leading-tight">
            منظومة تعلم متكاملة.. صُممت لتضمن تفوقك
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] font-medium leading-relaxed">
            وداعاً للحفظ التلقيني وتراكم المذكرات غير المفهومة. كل درس يتم تفكيكه علمياً إلى ركائز متكاملة.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: الشرح التفاعلي (Span 2 cols on md) */}
          <div className="md:col-span-2 p-7 sm:p-8 rounded-2xl bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-[#4F46E5]/40 transition-colors flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white">
                1. الشرح التفاعلي المفكك خطوة بخطوة
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed max-w-xl font-medium">
                تفكيك المفاهيم المعقدة إلى خطوات بسيطة مع إبراز التعريفات الهامة، الجداول المقارنة، والمسائل المحلولة بالتفصيل لتفهم الأساس الرياضي والعلمي بدلاً من مجرد الحفظ.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#4F46E5] dark:text-indigo-400">
              <span>مصحوب ببودكاست صوتي لكل درس (بودكاست الخلاصة)</span>
              <Link href="/subjects" className="flex items-center gap-1 hover:underline">
                <span>تصفح المواد</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: الزتونة الذهبية (Signature Feature) */}
          <div className="p-7 sm:p-8 rounded-2xl bg-amber-50/40 dark:bg-zinc-950 border-2 border-amber-300 dark:border-amber-700/60 shadow-2xs hover:border-amber-400 transition-colors flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-2xs">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 text-[10px] font-bold">
                كبسولة المراجعة السريعة
              </div>
              <h3 className="text-xl font-black text-[#0F172A] dark:text-white">
                2. الزتونة الذهبية
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed font-medium">
                كبسولة مركزة في صفحة واحدة لا تزيد عن 3 دقائق قراءة، تجمع أهم القوانين، تكات واضعي الامتحانات، وقائمة تحقق قبل النوم.
              </p>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#D97706] dark:text-amber-400">
                جاهزة للطباعة وحفظ الـ PDF بضغطة واحدة
              </span>
            </div>
          </div>

          {/* Bento Card 3: بنك الأسئلة المتكيف */}
          <div className="p-7 rounded-2xl bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-[#4F46E5]/40 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#0F172A] dark:text-white">
                3. بنك الأسئلة المتكيف
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed font-medium">
                أنشئ اختبارات مخصصة بضغطة زر حسب الدرس أو الوحدة، مع تحليل فوري يوضح لماذا كل اختيار صح ولماذا الباقي خطأ.
              </p>
            </div>
          </div>

          {/* Bento Card 4: ركن غلطاتي */}
          <div className="p-7 rounded-2xl bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-[#4F46E5]/40 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#0F172A] dark:text-white">
                4. ركن «غلطاتي» التراكمي
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed font-medium">
                أي سؤال تخطئ فيه يحفظ فوراً في دفترك الخاص، ويعيد النظام اختبارك فيه لاحقاً حتى تتقنه وتصل نسبة استيعابك إلى 100%.
              </p>
            </div>
          </div>

          {/* Bento Card 5: الخرائط الذهنية & PWA */}
          <div className="p-7 rounded-2xl bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-[#4F46E5]/40 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#0F172A] dark:text-white">
                5. خرائط ذهنية + وضع أوفلاين
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed font-medium">
                خرائط مرئية للعلاقات بين المفاهيم، مع دعم كامل للعمل بدون إنترنت كـ PWA على الهاتف لتذاكر في أي وقت بدون مشتتات.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}