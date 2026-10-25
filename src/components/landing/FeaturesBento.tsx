"use client";

import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  Zap,
  Brain,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Compass,
} from "lucide-react";

export function FeaturesBento() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-[#FAF7F8] dark:bg-[#0F172A] border-t border-[#F0E6E8] dark:border-[#334155]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 text-right">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] text-xs font-semibold shadow-xs">
            <Compass className="w-3.5 h-3.5 text-[#D97706]" />
            <span>منهجية الخلاصة المعتمدة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1A0A10] dark:text-white leading-tight tracking-tight">
            الركائز الخمس لتفوقك الأكاديمي
          </h2>
          <p className="text-sm text-[#735C63] dark:text-[#94A3B8] font-normal leading-relaxed">
            صُممت المنصة لعلاج المعضلة المزمنة: الحفظ التلقيني وتراكم المذكرات غير المفهومة، عبر تفكيك المنهج إلى نواتج تعلم واضحة قابلة للقياس.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: الشرح المفكك (Span 2 cols on md) */}
          <div className="md:col-span-2 p-7 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-all duration-200 flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185]">
                  الاستيعاب المفاهيمي
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1A0A10] dark:text-white">
                  تفكيك المفاهيم والتسلسل المنطقي
                </h3>
              </div>
              <p className="text-sm text-[#735C63] dark:text-[#94A3B8] leading-relaxed max-w-xl font-normal">
                تفكيك النظريات والقوانين المعقدة إلى خطوات تسلسلية منطقية مع إبراز الجداول المقارنة، والمسائل النموذجية المحلولة بالتفصيل لتفهم الأساس الرياضي والفيزيائي بدقة.
              </p>
            </div>

            <div className="pt-4 border-t border-[#F0E6E8] dark:border-[#334155] flex items-center justify-between text-xs font-semibold text-[#800020] dark:text-[#FB7185]">
              <span>مصحوب بملخص صوتي لكل درس (بودكاست الخلاصة)</span>
              <Link href="/subjects" className="flex items-center gap-1 hover:underline">
                <span>استعراض المنهج</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: الزتونة المركزة (Signature Pillar) */}
          <div className="p-7 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] hover:border-[#D97706]/40 transition-all duration-200 flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden">
            {/* Subtle top gold accent line */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#D97706] to-[#800020]" />

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] text-[#D97706] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#D97706] dark:text-[#FBBF24]">
                  العلامة الفارقة
                </span>
                <h3 className="text-xl font-bold text-[#1A0A10] dark:text-white">
                  كبسولة الزتونة المركزة
                </h3>
              </div>
              <p className="text-sm text-[#735C63] dark:text-[#94A3B8] leading-relaxed font-normal">
                ملخص تنفيذي مكثف في صفحة واحدة لا يتجاوز 3 دقائق قراءة، يجمع القوانين النهائية، تكات الامتحانات، والمغالطات الشائعة.
              </p>
            </div>

            <div className="pt-4 border-t border-[#F0E6E8] dark:border-[#334155] text-xs font-semibold text-[#D97706] dark:text-[#FBBF24]">
              جاهزة للطباعة وتحميل ملفات PDF بضغطة زر
            </div>
          </div>

          {/* Card 3: بنك الأسئلة المعياري */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#735C63] dark:text-[#94A3B8]">
                  تقييم متكيف
                </span>
                <h3 className="text-lg font-bold text-[#1A0A10] dark:text-white">
                  بنك الأسئلة والتحليل الاستنتاجي
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#735C63] dark:text-[#94A3B8] leading-relaxed font-normal">
                أنشئ اختبارات مخصصة مصنفة حسب مستويات الصعوبة مع تحليل فوري يوضح تعليل كل خيار بدقة.
              </p>
            </div>
          </div>

          {/* Card 4: ركن معالجة الأخطاء */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#735C63] dark:text-[#94A3B8]">
                  تكرار متباعد
                </span>
                <h3 className="text-lg font-bold text-[#1A0A10] dark:text-white">
                  سجل معالجة الأخطاء التراكمي
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#735C63] dark:text-[#94A3B8] leading-relaxed font-normal">
                كل سؤال تخطئ فيه يسجل تلقائياً في ركن خاص، ويعيد النظام اختباره لاحقاً حتى تتأكد من سد فجوة الفهم.
              </p>
            </div>
          </div>

          {/* Card 5: الخرائط الذهنية & PWA */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#735C63] dark:text-[#94A3B8]">
                  استذكار مرئي
                </span>
                <h3 className="text-lg font-bold text-[#1A0A10] dark:text-white">
                  خرائط العلاقات ووضع بلا إنترنت
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#735C63] dark:text-[#94A3B8] leading-relaxed font-normal">
                ربط بصري للروابط السببية بين الفصول، مع تثبيت فوري كـ PWA للمذاكرة الهادئة دون تشتت إشعارات.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}