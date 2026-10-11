"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Sparkle, CheckCircle, Lightbulb } from "@phosphor-icons/react";

export function HeroSection() {
  return (
    <section className="bg-white dark:bg-[#0F172A] pt-16 pb-20 sm:pt-24 sm:pb-32">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-right space-y-6 sm:space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4F46E5]/10 border border-[#4F46E5]/20">
              <Sparkle className="w-4 h-4 text-[#4F46E5]" weight="fill" />
              <span className="text-xs font-bold text-[#4F46E5]">
                مصمم لطلاب الثانوية العامة والبكالوريا المصرية
              </span>
            </div>

            <h1 className="text-[28px] sm:text-[36px] lg:text-[48px] font-bold text-[#0F172A] dark:text-white leading-[1.25] tracking-tight">
              افهم أسرع.{" "}
              <span className="text-[#4F46E5]">ذاكر أذكى.</span>
              <br />
              وادخل امتحانك بثقة.
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] dark:text-slate-400 leading-relaxed max-w-xl font-content">
              الشرح والزتونة والخرائط الذهنية وبنك الأسئلة في مكان واحد. ذاكر بالطريقة اللي تناسبك، واكتشف سبب كل إجابة صح أو غلط.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-2">
              <Link
                href="/register"
                className="h-12 px-7 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <span>ابدأ مذاكرتك مجانًا</span>
                <ArrowLeft className="w-4 h-4" weight="bold" />
              </Link>
              <Link
                href="#demo"
                className="h-12 px-7 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white text-sm font-bold flex items-center gap-2 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
              >
                <span>جرّب سؤالًا دلوقتي</span>
              </Link>
            </div>
          </motion.div>

          {/* Product Preview Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            <div className="rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
              {/* Mock App Header */}
              <div className="px-5 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-bold text-sm">
                    خ
                  </div>
                  <span className="font-bold text-sm text-[#0F172A] dark:text-white">الخلاصة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#059669]" />
                  <span className="text-[10px] font-bold text-[#64748B]">متصل</span>
                </div>
              </div>

              {/* Mock Lesson Summary Card */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#4F46E5]/10 text-[#4F46E5] text-[10px] font-bold">
                    الفيزياء
                  </span>
                  <span className="text-[10px] text-[#64748B] font-medium">• الوحدة الثالثة</span>
                </div>

                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                  قوانين نيوتن للحركة
                </h3>

                {/* Key Concept Highlight */}
                <div className="p-3.5 rounded-lg bg-[#D97706]/10 border border-[#D97706]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-[#D97706]" weight="fill" />
                    <span className="text-[11px] font-bold text-[#D97706]">المفهوم الأساسي</span>
                  </div>
                  <p className="text-xs text-[#0F172A] dark:text-slate-300 font-content leading-relaxed">
                    القوة المحصلة تساوي حاصل ضرب الكتلة في العجلة: <span className="font-mono text-[#4F46E5] font-bold">F = m × a</span>
                  </p>
                </div>

                {/* Mini MCQ Preview */}
                <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 space-y-2.5">
                  <p className="text-xs font-bold text-[#0F172A] dark:text-white">
                    إذا زادت القوة المؤثرة على جسم إلى الضعف مع ثبات الكتلة، فإن العجلة...
                  </p>
                  <div className="space-y-1.5">
                    <div className="p-2 rounded-md bg-[#059669]/10 border border-[#059669]/30 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#059669]" weight="fill" />
                      <span className="text-[11px] font-bold text-[#059669]">تزداد إلى الضعف ✓</span>
                    </div>
                    <div className="p-2 rounded-md border border-[#E2E8F0] dark:border-slate-700 text-[11px] text-[#64748B]">
                      تقل إلى النصف
                    </div>
                  </div>
                </div>

                {/* CTA inside preview */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-[#64748B] font-medium">3 أسئلة تدريبية متاحة</span>
                  <span className="text-[11px] font-bold text-[#4F46E5] flex items-center gap-1">
                    عرض الزتونة الكاملة
                    <ArrowLeft className="w-3 h-3" weight="bold" />
                  </span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 sm:-right-6 px-4 py-2.5 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 shadow-sm flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[#059669]/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#059669]" weight="bold" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0F172A] dark:text-white block">شرح + زتونة</span>
                <span className="text-[10px] text-[#64748B] font-medium">في مكان واحد</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}