"use client";

import { useState } from "react";
import {
  BookOpen,
  Brain,
  BookmarkCheck,
  Target,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Check,
  AlertTriangle,
} from "lucide-react";
import type { LandingTabType, DemoMcqOption } from "./types";

const DEMO_OPTIONS: DemoMcqOption[] = [
  {
    id: 0,
    text: "أ) أوعية الخشب والألياف الإسكلرنشيمية",
    isCorrect: true,
    reason: "صحيح! أوعية الخشب والألياف تفقد البروتوبلازم وتترسب عليها مادة الليجنين الصلبة، فتصبح دعامتها تركيبية بحتة.",
  },
  {
    id: 1,
    text: "ب) الخلايا البارنشيمية لقشرة الساق",
    isCorrect: false,
    reason: "خطأ: الخلايا البارنشيمية خلايا حية ذات جدر رقيقة تكتسب دعامة فسيولوجية فقط.",
  },
  {
    id: 2,
    text: "ج) خلايا البشرة المغطاة بالكيوتين",
    isCorrect: false,
    reason: "خطأ: خلايا البشرة خلايا حية تحتفظ بالبروتوبلازم ولديها دعامة فسيولوجية مع دعامة تركيبية جزئية.",
  },
  {
    id: 3,
    text: "د) الخلايا الكولنشيمية لأعناق الأوراق",
    isCorrect: false,
    reason: "خطأ: الخلايا الكولنشيمية مغلظة بالسيليلوز لكنها خلايا حية تمتلك فجوة عصارية.",
  },
];

export function LandingFeatureShowcase() {
  const [activeTab, setActiveTab] = useState<LandingTabType>("zatona");
  const [selectedDemoOption, setSelectedDemoOption] = useState<number | null>(null);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  return (
    <section className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/10 dark:bg-[#1E293B] border border-[#800020]/20 text-[#800020] dark:text-[#FB7185] text-[13px] font-bold">
          <Target className="w-3.5 h-3.5" />
          <span>معاينة حية للمنصة</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white">
          جرّب تجربة التعلم الذكي بنفسك
        </h2>
        <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed">
          استكشف كيف نحوّل المناهج الكبيرة إلى كبسولات مركزة وأسئلة ذكية تفاعلية
        </p>
      </div>

      {/* Feature Tabs Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
        <button
          type="button"
          onClick={() => setActiveTab("zatona")}
          className={`h-11 px-4 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 interactive-tap ${
            activeTab === "zatona"
              ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-[#FB7185]"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#800020]" />
          <span>كبسولة الزتونة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`h-11 px-4 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 interactive-tap ${
            activeTab === "questions"
              ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-[#FB7185]"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <BookmarkCheck className="w-4 h-4 text-[#D97706]" />
          <span>تفسير كل اختيار</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mistakes")}
          className={`h-11 px-4 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 interactive-tap ${
            activeTab === "mistakes"
              ? "bg-white dark:bg-[#0F172A] text-[#DC2626]"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <RotateCcw className="w-4 h-4 text-[#DC2626]" />
          <span>دفتر غلطاتي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mindmap")}
          className={`h-11 px-4 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 interactive-tap ${
            activeTab === "mindmap"
              ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-[#FB7185]"
              : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          <Brain className="w-4 h-4 text-[#800020]" />
          <span>الخرائط الذهنية</span>
        </button>
      </div>

      {/* Tab 1: كبسولة الزتونة */}
      {activeTab === "zatona" && (
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
            <div>
              <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] block font-mono">
                عينة حقيقية من ملخص الزتونة • الأحياء
              </span>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                الدعامة والحركة في الكائنات الحية
              </h3>
            </div>
            <span className="text-[13px] font-bold bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#FBBF24] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>ملخص مركز في 3 دقائق</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#E11D48]/40 space-y-2">
              <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] block">
                المفهوم الجوهري (Concept):
              </span>
              <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                الدعامة الفسيولوجية دعامة مؤقتة تعتمد على الخاصية الأسموزية وانتفاخ الفجوة العصارية، بينما الدعامة التركيبية دائمة وتعتمد على ترسب مواد صلبة مثل السيليلوز والليجنين.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#D97706]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/60 dark:border-[#FBBF24]/40 space-y-2">
              <span className="text-[13px] font-bold text-[#D97706] dark:text-[#FBBF24] flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                <span>تكة امتحان ثانوية عامة مكررة:</span>
              </span>
              <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                فقدان الماء بعملية النتح السريع في وقت الظهيرة يؤدي لفقدان الدعامة الفسيولوجية مؤقتاً، وتستعاد عند الري ليلاً بامتصاص الماء.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/50 dark:border-[#34D399]/40 space-y-2">
            <span className="text-[13px] font-bold text-[#059669] dark:text-[#34D399] block">
              قائمة التحقق السريعة قبل الامتحان (Checklist):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#0F172A] dark:text-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                <span>التمييز بين النسيج البارنشيمي والكولنشيمي</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                <span>دور الكيوتين والسيوبرين في منع فقد الماء</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: تفسير كل اختيار */}
      {activeTab === "questions" && (
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] block font-mono">
              سؤال تفاعلي من بنك الأسئلة الذكي
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white leading-relaxed">
              أي التراكيب التالية تكتسب دعامة تركيبية فقط ولا تحتوي على بروتوبلازم عند النضج؟
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_OPTIONS.map((opt) => {
              const isSelected = selectedDemoOption === opt.id;
              let cardStyle =
                "bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-[#E2E8F0] dark:border-[#334155]";

              if (demoSubmitted) {
                if (opt.isCorrect) {
                  cardStyle =
                    "bg-[#059669]/10 dark:bg-[#1E293B] border-[#059669] font-bold";
                } else if (isSelected && !opt.isCorrect) {
                  cardStyle =
                    "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#DC2626] font-bold";
                }
              } else if (isSelected) {
                cardStyle =
                  "bg-[#800020]/10 dark:bg-[#1E293B] border-[#800020] text-[#800020] dark:text-[#FB7185] font-bold";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedDemoOption(opt.id);
                    setDemoSubmitted(true);
                  }}
                  className={`p-4 rounded-xl border text-[13px] sm:text-sm text-right transition-all flex flex-col justify-between space-y-2 interactive-tap ${cardStyle}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-[#0F172A] dark:text-white">
                      {opt.text}
                    </span>
                    {demoSubmitted && opt.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                    )}
                    {demoSubmitted && isSelected && !opt.isCorrect && (
                      <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    )}
                  </div>
                  {demoSubmitted && (
                    <p
                      className={`text-[13px] leading-relaxed pt-1 border-t border-[#E2E8F0]/60 dark:border-[#334155] ${
                        opt.isCorrect
                          ? "text-[#059669] dark:text-[#34D399] font-semibold"
                          : "text-[#DC2626] dark:text-[#F87171]"
                      }`}
                    >
                      {opt.reason}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {!demoSubmitted && (
            <p className="text-center text-[13px] text-[#94A3B8]">
              اضغط على أي اختيار لمعاينة التحليل التفسيري الفوري.
            </p>
          )}
        </div>
      )}

      {/* Tab 3: دفتر غلطاتي */}
      {activeTab === "mistakes" && (
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
            <div>
              <span className="text-[13px] font-bold text-[#DC2626] block font-mono">
                ركن المذاكرة الأكثر فاعلية في الثانوية
              </span>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                دفتر أخطائي التفاعلي («غلطاتي»)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] bg-[#DC2626]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#F87171]/40">
                3 أخطاء بانتظار الإتقان
              </span>
              <span className="text-[13px] font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#34D399]/40">
                92% معدل التحسن
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#64748B]">
                سؤال أخطأت فيه في امتحان الوحدة الأولى (الكيمياء)
              </span>
              <span className="text-[13px] font-bold bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#F87171]/40">
                لم يتم الإتقان بعد
              </span>
            </div>
            <p className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white">
              ما التوزيع الإلكتروني لأيون الحديد الثلاثي Fe³⁺ في مركب FeCl₃؟
            </p>
            <div className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
              <span className="font-bold text-[#800020] dark:text-[#FB7185]">
                التحليل العلاجي:{" "}
              </span>
              يفقد الحديد إلكتروني المستوى الفرعي 4s أولاً ثم إلكتروناً واحداً من المستوى 3d ليصبح [Ar] 3d⁵ (نصف ممتلئ وأكثر استقراراً).
            </div>
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="h-11 px-4 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold transition-colors interactive-tap flex items-center gap-2"
              >
                <Check className="w-3.5 h-3.5" />
                <span>إعادة المحاولة وحذف الخطأ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: الخرائط الذهنية */}
      {activeTab === "mindmap" && (
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-6 animate-in fade-in duration-300 text-center">
          <div className="space-y-1">
            <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] block font-mono">
              العلاقات المفاهيمية البصرية
            </span>
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
              خريطة ذهنية متكاملة لكل درس
            </h3>
          </div>

          <div className="p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex flex-col md:flex-row items-center justify-around gap-4">
            <div className="p-4 rounded-xl bg-[#800020] text-white font-bold text-[13px]">
              المفهوم الأساسي
              <br />
              <span className="text-[13px] text-[#800020] font-normal">
                (مثال: القوانين الأساسية)
              </span>
            </div>
            <div className="text-[#800020] font-bold text-lg rotate-90 md:rotate-0">
              ↔
            </div>
            <div className="p-4 rounded-xl bg-[#0F172A] dark:bg-[#1E293B] text-white font-bold text-[13px] border border-[#94A3B8]">
              العوامل المؤثرة
              <br />
              <span className="text-[13px] text-[#94A3B8] font-normal">
                (علاقات طردية وعكسية)
              </span>
            </div>
            <div className="text-[#D97706] font-bold text-lg rotate-90 md:rotate-0">
              ↔
            </div>
            <div className="p-4 rounded-xl bg-[#D97706] text-white font-bold text-[13px]">
              تطبيقات الامتحان
              <br />
              <span className="text-[13px] text-[#F8FAFC] font-normal">
                (مسائل الربط المتقدمة)
              </span>
            </div>
          </div>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
            تساعدك الخريطة الذهنية على استحضار روابط المنهج في عقلك خلال 30 ثانية قبل دخول اللجنة.
          </p>
        </div>
      )}
    </section>
  );
}
