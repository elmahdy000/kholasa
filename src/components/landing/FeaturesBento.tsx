"use client";

import Link from "next/link";
import {
  BookOpen,
  BookmarkCheck,
  Target,
  RotateCcw,
  Network,
  Smartphone,
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
            بدل ما تتشتت بين ملازم وفيديوهات طويلة ع الفاضي.. هنا هتلاقي كل حاجة تساعدك تفهم وتثبت المعلومة.
          </p>
        </div>

        {/* Structured Responsive Bento Grid (6 Features) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: الشرح المفكك خطوة بخطوة */}
          <div className="lg:col-span-2 p-7 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#800020]/8 dark:bg-[#FB7185]/10 border border-[#800020]/15 dark:border-[#FB7185]/20 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <BookOpen className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#12263F] dark:text-white">
                  الشرح المفكك خطوة بخطوة
                </h3>
                <p className="text-base text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal max-w-2xl">
                  بندخل في عمق الدرس ونفكك القوانين والمسائل خطوة بخطوة، مع مقارنات وتطبيقات عملية عشان تفهم منين جت المعلومة بدل ما تحفظ وتنسى.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E9ED] dark:border-[#334155] flex items-center justify-between text-xs font-semibold text-[#800020] dark:text-[#FB7185]">
              <span>ومع كل درس بودكاست صوتي سريع تسمعه في طريقك</span>
              <Link href="/subjects" className="flex items-center gap-1 hover:underline">
                <span>تصفح المواد</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 2: كبسولة الزتونة */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#D97706]/40 transition-colors flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#D97706]/10 dark:bg-[#D97706]/15 border border-[#D97706]/20 text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
                <BookmarkCheck className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  كبسولة الزتونة
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  ملخص مركز في صفحة واحدة يخلص في ٣ دقايق.. فيه تكات واضعي الامتحانات، والقوانين كلها متجمعة بشكل يثبت في دماغك.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#D97706] dark:text-[#FBBF24]">
              جاهزة للطباعة وحفظ الـ PDF بضغطة واحدة
            </div>
          </div>

          {/* Feature 3: بنك تدريب متدرج */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#800020]/8 dark:bg-[#FB7185]/10 border border-[#800020]/15 dark:border-[#FB7185]/20 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <Target className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  بنك تدريب متدرج
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  حل امتحانات وتدريبات متدرجة من السهل للأصعب على كل درس، ومع كل اختيار بنقولك ليه ده صح وليه الباقي غلط بالتفصيل.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155]">
              <Link href="/exams/builder" className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] flex items-center gap-1 hover:underline">
                <span>جرّب تعمل امتحان دلوقتي</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 4: ركن غلطاتي */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#800020]/8 dark:bg-[#FB7185]/10 border border-[#800020]/15 dark:border-[#FB7185]/20 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <RotateCcw className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  ركن غلطاتي
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  أي سؤال تغلط فيه بيتحفظ في كشكولك الخاص، والنظام يرجع يختبرك فيه تاني لحد ما تتأكد إنك فهمته وماتغلطش فيه في الامتحان.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155]">
              <Link href="/mistakes" className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] flex items-center gap-1 hover:underline">
                <span>شوف ركن غلطاتك</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 5: الخرائط الذهنية */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#800020]/8 dark:bg-[#FB7185]/10 border border-[#800020]/15 dark:border-[#FB7185]/20 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <Network className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  الخرائط الذهنية
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  اربط فصول المادة ببعض بصرياً، عشان تفتكر علاقات القوانين في عينيك في ثواني قبل ما تدخل اللجنة.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
              مراجعة بصرية سريعة قبل الامتحان
            </div>
          </div>

          {/* Feature 6: وضع أوفلاين (PWA) */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#059669]/10 dark:bg-[#059669]/15 border border-[#059669]/20 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
                <Smartphone className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  شغال من غير نت (PWA)
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  نزّل المنصة على موبايلك في ثواني، وذاكر ملخصاتك والزتونة في أي وقت ومن غير ما تشتتك إشعارات السوشيال ميديا.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#059669]">
              تطبيق خفيف وسريع على كل الأجهزة
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}