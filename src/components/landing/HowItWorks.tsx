"use client";
import { motion } from "framer-motion";
import { BookOpen, Sparkle, Lightning, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: BookOpen,
    color: "#4F46E5",
    title: "اختار مادتك ودرسك",
    description: "تصفح المواد والوحدات بسهولة، واختار الدرس اللي عايز تفهمه أو تراجع عليه.",
  },
  {
    number: "02",
    icon: Sparkle,
    color: "#D97706",
    title: "افهم الشرح وراجع الزتونة",
    description: "اقرا الشرح التفاعلي خطوة بخطوة، أو راجع الزتونة الذهبية المركزة في دقائق.",
  },
  {
    number: "03",
    icon: Lightning,
    color: "#059669",
    title: "اختبر نفسك وافهم غلطاتك",
    description: "حل أسئلة مخصصة وشوف تفسير كل إجابة صح أو غلط عشان ما تنساش المعلومة.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <h2 className="text-[24px] sm:text-[32px] font-bold text-[#0F172A] dark:text-white leading-tight">
            إزاي تذاكر بالخلاصة؟
          </h2>
          <p className="text-base text-[#64748B] dark:text-[#94A3B8] font-content leading-relaxed">
            ثلاث خطوات بسيطة تحول مذاكرتك من حفظ عشوائي لفهم حقيقي.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 right-[16.67%] left-[16.67%] h-px bg-[#E2E8F0] dark:bg-[#334155]" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center space-y-4"
              >
                {/* Step Number & Icon */}
                <div className="relative z-10">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]"
                  >
                    <Icon className="w-11 h-11" weight="bold" style={{ color: step.color }} />
                  </div>
                  <span
                    className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2 max-w-xs">
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-content leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-bold transition-colors"
          >
            <span>ابدأ رحلتك التعليمية</span>
            <ArrowLeft className="w-4 h-4" weight="bold" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}