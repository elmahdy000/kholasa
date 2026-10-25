"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles, Smartphone, ShieldCheck } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F8] dark:bg-[#0F172A] border-t border-[#F0E6E8] dark:border-[#334155]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#800020] via-[#66001A] to-[#400010] text-white p-8 sm:p-14 lg:p-16 text-center shadow-xl relative overflow-hidden">
          {/* Subtle ambient blur glow inside card */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#D97706]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>ابدأ رحلتك نحو التفوق الأكاديمي</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              جاهز لتغيير طريقتك في المذاكرة وتحقيق الدرجة النهائية؟
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl mx-auto font-normal">
              انضم لطلاب دفعة 2026، وتخلص من حشو المذكرات وضياع الوقت مع شروحات مفككة، كبسولات الزتونة المركزة، وبنك أسئلة يضمن استيعابك بنسبة 100%.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-white text-[#800020] hover:bg-[#FAF7F8] text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
              >
                <span>ابدأ المذاكرة مجانًا الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <Link
                href="/exams/builder"
                className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <span>تصفح بنك الأسئلة</span>
              </Link>
            </div>

            {/* Reassurance Features */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FBBF24]" />
                <span>تغطية معتمدة لنواتج التعلم</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#FBBF24]" />
                <span>تثبيت PWA فوري على الهاتف</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FBBF24]" />
                <span>يعمل دون اتصال بالإنترنت</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}