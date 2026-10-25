"use client";

import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  Zap,
  RotateCcw,
  Brain,
  WifiOff,
  ArrowLeft,
} from "lucide-react";

export function FeaturesBento() {
  return (
    <section id="features" className="py-20 sm:py-24 bg-[#F7F8FA] dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14 text-right">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#12263F] dark:text-white leading-tight tracking-tight">
            كل أدوات مذاكرتك في مكان واحد
          </h2>
          <p className="text-base text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            منظومة تعليمية متكاملة مصممة لطلاب الثانوية العامة، تفكك المنهج لنواتج تعلم وتضمن التفوق.
          </p>
        </div>

        {/* Structured Responsive Bento Grid (6 Features) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: الشرح التفاعلي (Large featured card, spans 2 cols on lg) */}
          <div className="lg:col-span-2 p-7 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#12263F] dark:text-white">
                  الشرح التفاعلي المفكك
                </h3>
                <p className="text-base text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal max-w-2xl">
                  تفكيك المفاهيم المعقدة خطوة بخطوة مع إبراز الجداول المقارنة، القوانين الرياضية، والمسائل المحلولة بالتفصيل لتفهم الأساس العلمي قبل الحفظ.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E9ED] dark:border-[#334155] flex items-center justify-between text-xs font-semibold text-[#800020] dark:text-[#FB7185]">
              <span>مصحوب بملخص صوتي (بودكاست الخلاصة) لكل درس</span>
              <Link href="/subjects" className="flex items-center gap-1 hover:underline">
                <span>تصفح المواد</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 2: الزتونة الذهبية */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#D97706]/40 transition-colors flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#D97706] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  الزتونة الذهبية
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  كبسولة مركزة في صفحة واحدة لا تتجاوز 3 دقائق قراءة، تجمع أهم القوانين، تكات واضعي الامتحانات، وقائمة تحقق سريعة.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#D97706] dark:text-[#FBBF24]">
              جاهزة للطباعة وحفظ الـ PDF بضغطة زر
            </div>
          </div>

          {/* Feature 3: بنك الأسئلة المتكيف */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  بنك الأسئلة المتكيف
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  اختبارات مخصصة حسب الوحدة والدرس مع تحليل فوري يوضح تعليل كل خيار صحيح وسبب خطأ الخيارات الأخرى.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155]">
              <Link href="/exams/builder" className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] flex items-center gap-1 hover:underline">
                <span>تخصيص اختبار الآن</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 4: ركن غلطاتي */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  ركن غلطاتي
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  أي سؤال تخطئ فيه يحفظ فوراً في دفترك الخاص، ويعيد النظام اختبارك فيه لاحقاً حتى تتقن ناتج التعلم بنسبة 100%.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155]">
              <Link href="/mistakes" className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] flex items-center gap-1 hover:underline">
                <span>استعراض سجل الأخطاء</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 5: الخرائط الذهنية */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  الخرائط الذهنية
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  خرائط بصرية للعلاقات المفهومية والروابط السببية بين الفصول، لتسترجع تفاصيل المنهج بالكامل في دقائق معدودة.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
              استذكار مرئي منظم قبل ليلة الامتحان
            </div>
          </div>

          {/* Feature 6: وضع أوفلاين (PWA) */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <WifiOff className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  وضع أوفلاين (PWA)
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  تثبيت مباشر وسريع على الهاتف أو الحاسوب، وتصفح ملخصات الزتونة والمراجعات بدون إنترنت لتذاكر بهدوء وبلا مشتتات.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#059669]">
              تطبيق خفيف وسريع متوافق مع كافة الأنظمة
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}