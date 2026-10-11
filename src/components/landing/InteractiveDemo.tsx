"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkle,
  CheckCircle,
  XCircle,
  ArrowCounterClockwise,
  Graph,
  Lightbulb,
  Warning,
  ArrowLeft,
} from "@phosphor-icons/react";

const tabs = [
  { id: "summary", label: "الزتونة الذهبية", icon: Sparkle },
  { id: "explanation", label: "تفسير الإجابات", icon: CheckCircle },
  { id: "mistakes", label: "دفتر غلطاتي", icon: ArrowCounterClockwise },
  { id: "mindmap", label: "الخرائط الذهنية", icon: Graph },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<TabId>("summary");

  return (
    <section id="demo" className="py-16 sm:py-24 bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <h2 className="text-[24px] sm:text-[32px] font-bold text-[#0F172A] dark:text-white leading-tight">
            جرّب الخلاصة بنفسك
          </h2>
          <p className="text-base text-[#64748B] dark:text-slate-400 font-content leading-relaxed">
            شوف إزاي المعلومة بتتحول من شرح بسيط لفهم حقيقي.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none -mx-4 sm:mx-0 px-4 sm:px-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 h-11 px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
                  isActive
                    ? "bg-[#4F46E5] text-white"
                    : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700 hover:border-[#4F46E5]/50"
                }`}
              >
                <Icon className="w-4 h-4" weight={isActive ? "fill" : "regular"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "summary" && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <div className="rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-bold">
                        الفيزياء
                      </span>
                      <span className="text-xs text-[#64748B] font-medium">الوحدة الثالثة • قوانين نيوتن</span>
                    </div>
                    <Sparkle className="w-5 h-5 text-[#D97706]" weight="fill" />
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                      الزتونة الذهبية — كبسولة الدرس المركزة
                    </h3>
                    <div className="p-4 rounded-lg bg-[#4F46E5]/5 border border-[#4F46E5]/15 space-y-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-[#4F46E5]" weight="fill" />
                        <span className="text-xs font-bold text-[#4F46E5]">المفهوم الأساسي</span>
                      </div>
                      <p className="text-sm text-[#0F172A] dark:text-slate-300 font-content leading-relaxed">
                        القوة المحصلة تساوي حاصل ضرب الكتلة في العجلة وتعمل في نفس اتجاهها.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700">
                      <span className="text-xs font-bold text-[#059669] block mb-1">تعريف هام</span>
                      <p className="text-sm text-[#0F172A] dark:text-slate-300 font-content">
                        <strong className="text-[#0F172A] dark:text-white">القوة:</strong> مؤثر خارجي يغير حالة الجسم من السكون أو الحركة المنتظمة.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-[#059669]/5 border border-[#059669]/20">
                        <span className="text-[10px] font-bold text-[#059669] block mb-1">الكتلة القصورية</span>
                        <p className="text-[11px] text-[#0F172A] dark:text-slate-300 font-content">مقاومة الجسم لتغيير حالته الحركية</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#D97706]/5 border border-[#D97706]/20">
                        <span className="text-[10px] font-bold text-[#D97706] block mb-1">الوزن</span>
                        <p className="text-[11px] text-[#0F172A] dark:text-slate-300 font-content">قوة جذب الأرض للجسم (W = mg)</p>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#D97706]/10 border border-[#D97706]/20 flex items-start gap-2.5">
                      <Warning className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" weight="fill" />
                      <div>
                        <span className="text-[11px] font-bold text-[#D97706] block">تنبيه امتحاني</span>
                        <p className="text-[11px] text-[#0F172A] dark:text-slate-300 font-content mt-0.5">
                          لا تخلط بين الكتلة (كمية قياسية) والوزن (كمية متجهة).
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center justify-end">
                      <span className="text-xs font-bold text-[#4F46E5] flex items-center gap-1 cursor-pointer hover:underline">
                        عرض الزتونة الكاملة
                        <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "explanation" && (
              <motion.div
                key="explanation"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <div className="rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-bold">
                      سؤال تدريبي
                    </span>
                    <span className="text-xs text-[#64748B] font-medium">الفيزياء • قوانين نيوتن</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed">
                      إذا أثرت قوة مقدارها 20 نيوتن على جسم كتلته 4 كجم، فإن عجلة الجسم تساوي...
                    </p>
                    <div className="space-y-2">
                      <div className="p-3.5 rounded-lg bg-[#059669]/10 border border-[#059669]/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-md bg-[#059669] text-white flex items-center justify-center text-xs font-bold">أ</span>
                          <span className="text-sm font-bold text-[#059669]">5 م/ث²</span>
                        </div>
                        <CheckCircle className="w-5 h-5 text-[#059669]" weight="fill" />
                      </div>
                      <div className="p-3.5 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/5 flex items-center justify-between opacity-70">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-md bg-[#E2E8F0] dark:bg-slate-700 text-[#64748B] flex items-center justify-center text-xs font-bold">ب</span>
                          <span className="text-sm font-bold text-[#DC2626] line-through">80 م/ث²</span>
                        </div>
                        <XCircle className="w-5 h-5 text-[#DC2626]" weight="fill" />
                      </div>
                      <div className="p-3.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 opacity-50">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-md bg-[#E2E8F0] dark:bg-slate-700 text-[#64748B] flex items-center justify-center text-xs font-bold">ج</span>
                          <span className="text-sm font-bold text-[#64748B]">0.2 م/ث²</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#4F46E5]/5 border border-[#4F46E5]/15 space-y-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-[#4F46E5]" weight="fill" />
                        <span className="text-xs font-bold text-[#4F46E5]">التفسير</span>
                      </div>
                      <p className="text-sm text-[#0F172A] dark:text-slate-300 font-content leading-relaxed">
                        بتطبيق القانون الثاني لنيوتن: <span className="font-mono text-[#4F46E5] font-bold">a = F/m = 20/4 = 5 م/ث²</span>
                      </p>
                      <div className="pt-2 border-t border-[#4F46E5]/15 space-y-1.5">
                        <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-content">
                          <strong>الخيار ب (80):</strong> خطأ شائع بضرب القوة في الكتلة بدل القسمة.
                        </p>
                        <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-content">
                          <strong>الخيار ج (0.2):</strong> ناتج قسمة الكتلة على القوة بدلاً من العكس.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "mistakes" && (
              <motion.div
                key="mistakes"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <div className="rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#DC2626]/10 flex items-center justify-center">
                        <ArrowCounterClockwise className="w-4 h-4 text-[#DC2626]" weight="bold" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-[#0F172A] dark:text-white block">دفتر غلطاتي</span>
                        <span className="text-[10px] text-[#64748B] font-medium">3 أخطاء تحتاج مراجعة</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-[#DC2626]/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md bg-[#DC2626]/10 text-[#DC2626] text-[10px] font-bold">
                          خطأ متكرر ×2
                        </span>
                        <span className="text-[10px] text-[#64748B] font-medium">الفيزياء • الوحدة 3</span>
                      </div>
                      <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                        وحدة قياس القوة في النظام الدولي هي...
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-md bg-[#DC2626]/5 border border-[#DC2626]/20">
                          <span className="text-[10px] font-bold text-[#DC2626] block mb-0.5">إجابتك ✗</span>
                          <span className="text-xs font-bold text-[#DC2626]">الجول</span>
                        </div>
                        <div className="p-2.5 rounded-md bg-[#059669]/5 border border-[#059669]/20">
                          <span className="text-[10px] font-bold text-[#059669] block mb-0.5">الصحيحة ✓</span>
                          <span className="text-xs font-bold text-[#059669]">النيوتن</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-md bg-[#4F46E5]/5 border border-[#4F46E5]/15">
                        <p className="text-[11px] text-[#0F172A] dark:text-slate-300 font-content leading-relaxed">
                          <strong className="text-[#4F46E5]">لماذا؟</strong> الجول هو وحدة قياس الطاقة والشغل، بينما النيوتن هو وحدة القوة. تذكر: القوة = كتلة × عجلة (كجم.م/ث²).
                        </p>
                      </div>
                      <button className="w-full h-10 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-colors">
                        أعد المحاولة
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "mindmap" && (
              <motion.div
                key="mindmap"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <div className="rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#4F46E5]/10 flex items-center justify-center">
                        <Graph className="w-4 h-4 text-[#4F46E5]" weight="bold" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-[#0F172A] dark:text-white block">خريطة المفاهيم</span>
                        <span className="text-[10px] text-[#64748B] font-medium">قوانين نيوتن للحركة</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="relative flex flex-col items-center gap-6">
                      <div className="px-6 py-3 rounded-lg bg-[#4F46E5] text-white text-sm font-bold">
                        قوانين نيوتن
                      </div>
                      <div className="w-0.5 h-6 bg-[#E2E8F0] dark:bg-slate-700" />
                      <div className="grid grid-cols-3 gap-4 w-full">
                        <div className="flex flex-col items-center gap-3">
                          <div className="px-4 py-2.5 rounded-lg bg-[#059669] text-white text-xs font-bold text-center">
                            القانون الأول
                          </div>
                          <div className="w-0.5 h-4 bg-[#E2E8F0] dark:bg-slate-700" />
                          <div className="px-3 py-2 rounded-md bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[10px] font-medium text-[#0F172A] dark:text-slate-300 text-center">
                            قانون القصور الذاتي
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                          <div className="px-4 py-2.5 rounded-lg bg-[#D97706] text-white text-xs font-bold text-center">
                            القانون الثاني
                          </div>
                          <div className="w-0.5 h-4 bg-[#E2E8F0] dark:bg-slate-700" />
                          <div className="px-3 py-2 rounded-md bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[10px] font-medium text-[#0F172A] dark:text-slate-300 text-center font-mono">
                            F = m × a
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                          <div className="px-4 py-2.5 rounded-lg bg-[#DC2626] text-white text-xs font-bold text-center">
                            القانون الثالث
                          </div>
                          <div className="w-0.5 h-4 bg-[#E2E8F0] dark:bg-slate-700" />
                          <div className="px-3 py-2 rounded-md bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-[10px] font-medium text-[#0F172A] dark:text-slate-300 text-center">
                            الفعل ورد الفعل
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 text-center">
                      <span className="text-xs font-bold text-[#4F46E5] flex items-center justify-center gap-1 cursor-pointer hover:underline">
                        استكشف الخريطة التفاعلية كاملة
                        <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}