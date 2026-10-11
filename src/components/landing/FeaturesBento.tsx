"use client";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkle,
  Lightning,
  Graph,
  Lightbulb,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";

const features = [
  {
    icon: BookOpen,
    color: "#4F46E5",
    title: "الشرح التفاعلي",
    description: "شرح مبسط خطوة بخطوة مع أمثلة محلولة وتوضيحات بصرية تجعل الفهم أسهل.",
    span: "col-span-1 sm:col-span-2 lg:col-span-2",
  },
  {
    icon: Sparkle,
    color: "#D97706",
    title: "الزتونة الذهبية",
    description: "ملخص مركز لكل درس يحتوي المفاهيم والتعريفات والقوانين وتنبيهات الامتحان.",
    span: "col-span-1",
  },
  {
    icon: Lightning,
    color: "#059669",
    title: "بنك الأسئلة الذكي",
    description: "أسئلة مختارة حسب الدرس والصعوبة مع تفسير تفصيلي لكل إجابة.",
    span: "col-span-1",
  },
  {
    icon: Graph,
    color: "#4F46E5",
    title: "الخرائط الذهنية",
    description: "خرائط مفاهيم تفاعلية تربط الأفكار ببعضها وتساعد على الحفظ والفهم.",
    span: "col-span-1",
  },
  {
    icon: Lightbulb,
    color: "#059669",
    title: "تفسير الصح والغلط",
    description: "اكتشف سبب كل إجابة صحيحة وخاطئة وافهم المفهوم الأساسي وراء كل سؤال.",
    span: "col-span-1 sm:col-span-2 lg:col-span-1",
  },
  {
    icon: ArrowCounterClockwise,
    color: "#DC2626",
    title: "دفتر غلطاتي",
    description: "سجل تلقائي لأخطائك مع إمكانية إعادة المحاولة وتتبع التحسن.",
    span: "col-span-1",
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white dark:bg-[#0F172A]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <h2 className="text-[24px] sm:text-[32px] font-bold text-[#0F172A] dark:text-white leading-tight">
            كل اللي محتاجه في مكان واحد
          </h2>
          <p className="text-base text-[#64748B] dark:text-slate-400 font-content leading-relaxed">
            أدوات تعليمية متكاملة مصممة خصيصاً لطلاب الثانوية العامة والبكالوريا المصرية.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`${feature.span} p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 hover:border-[${feature.color}]/40 transition-colors group`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${feature.color}12`, color: feature.color }}
                  >
                    <Icon className="w-6 h-6" weight="bold" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-slate-400 font-content leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}