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
  Cpu,
  Code2,
  ShieldCheck,
} from "lucide-react";

export function FeaturesBento() {
  return (
    <section
      id="features"
      className="py-20 sm:py-24 bg-[#F7F8FA] dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14 text-right">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#800B34]/10 border border-[#800B34]/20 text-[#800B34] dark:text-[#FB7185] text-xs font-bold">
            إزاي الخلاصة للبكالوريا هتفيدك فعلاً؟
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#12263F] dark:text-white leading-tight tracking-tight">
            تذاكر في ربع الوقت.. وتفهم كل تفصيلة في مسار الهندسة
          </h2>
          <p className="text-base text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            بدل التوهان بين مصادر كتير، بنينالك سيستم مذاكرة ذكي بياخدك من أول فهم المصطلح البرمجي والهندسي لحد ما تقفّل أصعب أسئلة الامتحانات بدون ولا غلطة.
          </p>
        </div>

        {/* Structured Responsive Bento Grid (6 Features) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: الشرح المفكك خطوة بخطوة */}
          <div className="lg:col-span-2 p-7 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800B34]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="w-12 h-12 rounded-xl bg-[#800B34]/8 dark:bg-[#FB7185]/10 border border-[#800B34]/15 dark:border-[#FB7185]/20 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#12263F] dark:text-white">
                  بكالوريا عربي + بكالوريا لغات
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#12263F] dark:text-white">
                  شرح مفكك ومصطلحات مترجمة بدقة هندسية
                </h3>
                <p className="text-base text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal max-w-2xl">
                  سواء بتدرس بالعربي أو باللغات، كل مفهوم مشروح من جذوره: إزاي المعالج بينفذ دورة <span className="font-mono font-bold text-[#12263F] dark:text-white">Fetch-Decode-Execute</span>، وإزاي يشتغل التشفير غير المتماثل <span className="font-mono font-bold text-[#12263F] dark:text-white">Public/Private Key</span>، وإزاي المؤشرات <span className="font-mono font-bold text-[#12263F] dark:text-white">Pointers</span> بتتعامل مع الذاكرة في <span className="font-mono font-bold text-[#12263F] dark:text-white">C++</span>.
                </p>
              </div>

              {/* Mini curriculum preview tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#800B34] dark:text-[#FB7185] shrink-0" />
                  <span className="text-xs font-bold text-[#12263F] dark:text-white">
                    معمارية النظم والـ CPU
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#800B34] dark:text-[#FB7185] shrink-0" />
                  <span className="text-xs font-bold text-[#12263F] dark:text-white">
                    الأمن السيبراني و CIA
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#800B34] dark:text-[#FB7185] shrink-0" />
                  <span className="text-xs font-bold text-[#12263F] dark:text-white">
                    برمجة C++ و Big-O
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E9ED] dark:border-[#334155] flex items-center justify-between text-xs font-semibold text-[#800B34] dark:text-[#FB7185]">
              <span>بطاقات مفاهيم تفاعلية (Flashcards) وبودكاست صوتي لكل درس</span>
              <Link href="/subjects" className="flex items-center gap-1 hover:underline">
                <span>استعرض وحدات المنهج</span>
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
                  كبسولة الزتونة في ٣ دقايق
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  بتلمّلك أهم المقارنات الحاسمة (زي <span className="font-mono font-semibold">MAR vs MDR</span>، و<span className="font-mono font-semibold">Stack vs Heap</span>، و<span className="font-mono font-semibold">Linear vs Binary Search</span>) مع قوانين حساب الـ <span className="font-mono font-semibold">CVR</span> والـ <span className="font-mono font-semibold">CSS Box Model</span> في صفحة واحدة مركزة.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#D97706] dark:text-[#FBBF24]">
              تشيك ليست إتقان قبل الامتحان لكل درس
            </div>
          </div>

          {/* Feature 3: بنك تدريب متدرج */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800B34]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#800B34]/8 dark:bg-[#FB7185]/10 border border-[#800B34]/15 dark:border-[#FB7185]/20 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center">
                <Target className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  تفسير فوري لكل اختيار
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  مش مجرد صح وغلط! في أسئلة الاختيار من متعدد والصواب والخطأ والمقالي، بنوضحلك السبب العلمي وراء الاختيار الصح وليه الاختيارات التانية فخ امتحاني.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155]">
              <Link
                href="/exams/builder"
                className="text-xs font-semibold text-[#800B34] dark:text-[#FB7185] flex items-center gap-1 hover:underline"
              >
                <span>ابني امتحانك المخصص دلوقتي</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 4: ركن غلطاتي */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800B34]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#800B34]/8 dark:bg-[#FB7185]/10 border border-[#800B34]/15 dark:border-[#FB7185]/20 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center">
                <RotateCcw className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  كشكول «غلطاتي» الذكي
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  أكتر ميزة بتفرق في مجموعك: أي سؤال تغلط فيه بيتسجل تلقائياً في كشكولك، وتقدر تفتح جلسة معالجة مركزة لحد ما تقضي على نقط ضعفك نهائياً.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155]">
              <Link
                href="/mistakes"
                className="text-xs font-semibold text-[#800B34] dark:text-[#FB7185] flex items-center gap-1 hover:underline"
              >
                <span>افتح كشكول غلطاتك</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 5: الخرائط الذهنية */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800B34]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#800B34]/8 dark:bg-[#FB7185]/10 border border-[#800B34]/15 dark:border-[#FB7185]/20 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center">
                <Network className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  خرائط ذهنية هندسية
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  شوف هيكل الدرس كله في خريطة بصرية واحدة: من طبقات الويب التلاتة ورموز استجابة <span className="font-mono font-semibold">HTTP</span> لحد هياكل التحكم والخوارزميات.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
              مراجعة بصرية شاملة ليلة الامتحان
            </div>
          </div>

          {/* Feature 6: وضع أوفلاين */}
          <div className="p-7 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] hover:border-[#800B34]/30 dark:hover:border-[#FB7185]/30 transition-colors flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#059669]/10 dark:bg-[#059669]/15 border border-[#059669]/20 text-[#059669] dark:text-[#34D399] flex items-center justify-center">
                <Smartphone className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  احفظ دروسك وذاكر بدون إنترنت
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed font-normal">
                  بضغطة زر واحدة جوة أي درس، احفظ الملخص والمفاهيم والأسئلة على موبايلك وذاكر في أي مكان بتركيز كامل.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#059669]">
              يدعم الموبايل والتابلت والكمبيوتر
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
