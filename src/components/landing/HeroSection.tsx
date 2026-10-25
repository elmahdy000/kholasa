"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Zap, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Right Column — Text & CTAs (7 cols on desktop) */}
          <div className="lg:col-span-7 text-right space-y-6 sm:space-y-7">
            {/* 1) Small top badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] text-xs font-semibold text-[#800020] dark:text-[#FB7185] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#800020] dark:bg-[#FB7185]" />
              <span>المنصة التعليمية الشاملة لطلاب الثانوية العامة 2026</span>
            </div>

            {/* 2) Main headline */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-extrabold text-[#12263F] dark:text-white leading-[1.2] tracking-tight">
                افهم المنهج بسهولة...
                <br />
                <span className="text-[#800020] dark:text-[#FB7185] inline-block mt-1 sm:mt-2">
                  وحوّل مذاكرتك لتفوّق حقيقي
                </span>
              </h1>
            </div>

            {/* 3) Supporting subheadline */}
            <p className="text-base sm:text-lg text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-xl font-normal">
              شرح مبسّط خطوة بخطوة، زتونة سريعة للمراجعة، أسئلة متكيفة، وتفسير ذكي لكل غلطة...
              <br className="hidden sm:inline" />
              كل اللي تحتاجه علشان تذاكر بفهم، تراجع بسرعة، وتدخل الامتحان وأنت واثق.
            </p>

            {/* 4) CTA buttons */}
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

            {/* Reassurance line below buttons */}
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] pt-1 font-medium">
              تغطية كاملة للمنهج الوزاري الجديد • يعمل كتطبيق ويب تقدمي (PWA) • متاح على الهاتف بسهولة
            </p>
          </div>

          {/* Left Column — Hero Image / Product Visual (5 cols on desktop) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#E8E9ED] dark:border-[#334155] bg-[#F7F8FA] dark:bg-[#1E293B] shadow-md">
              <Image
                src="/hero-student.jpg"
                alt="طالبة في الثانوية العامة تذاكر بتركيز وثقة عبر منصة الخلاصة الذكية"
                width={800}
                height={600}
                priority
                className="w-full h-auto object-cover aspect-4/3 transition-transform duration-500 hover:scale-[1.02]"
              />

              {/* Minimal floating pill on image corner for credibility */}
              <div className="absolute bottom-3.5 right-3.5 left-3.5 sm:left-auto sm:right-3.5 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border border-[#E8E9ED] dark:border-[#334155] shadow-xs flex items-center gap-2.5 text-right">
                <span className="w-2 h-2 rounded-full bg-[#059669] shrink-0" />
                <span className="text-xs font-bold text-[#12263F] dark:text-white">
                  بيئة استذكار ذكية • شروحات، زتونة، وبنك أسئلة
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}