"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Brain,
  Zap,
  ArrowLeft,
  Clock,
  AlertTriangle,
} from "lucide-react";

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<
    "zatona" | "questions" | "mistakes" | "mindmap"
  >("zatona");

  // Sample interactive MCQ state in demo
  const [selectedDemoOption, setSelectedDemoOption] = useState<number | null>(
    null
  );

  return (
    <section id="demo" className="py-20 sm:py-28 bg-white dark:bg-[#0F172A] border-y border-[#F0E6E8] dark:border-[#334155]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 text-right">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/10 dark:bg-[#1E293B] border border-[#800020]/20 dark:border-[#E11D48] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold">
            <Zap className="w-3.5 h-3.5 text-[#D97706] fill-[#D97706]" />
            <span>معاينة حية للمنصة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#1A0A10] dark:text-white leading-tight">
            استكشف تجربة الخلاصة الآن
          </h2>
          <p className="text-[13px] sm:text-sm text-[#735C63] dark:text-[#94A3B8] font-medium leading-relaxed">
            اضغط على التبويبات بالأسفل لتشاهد كيف تتحول المواد إلى كبسولات سهلة الفهم وأسئلة تفاعلية
          </p>
        </div>

        {/* Cohesive Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto p-2 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] shadow-xs">
          <button
            onClick={() => setActiveTab("zatona")}
            className={`h-11 px-5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "zatona"
                ? "bg-[#800020] text-white shadow-sm"
                : "text-[#735C63] dark:text-[#94A3B8] hover:text-[#1A0A10] dark:hover:text-white hover:bg-white dark:hover:bg-[#334155]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D97706] fill-current" />
            <span>الزتونة الذهبية</span>
          </button>

          <button
            onClick={() => setActiveTab("questions")}
            className={`h-11 px-5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "questions"
                ? "bg-[#800020] text-white shadow-sm"
                : "text-[#735C63] dark:text-[#94A3B8] hover:text-[#1A0A10] dark:hover:text-white hover:bg-white dark:hover:bg-[#334155]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>تفسير كل اختيار</span>
          </button>

          <button
            onClick={() => setActiveTab("mistakes")}
            className={`h-11 px-5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "mistakes"
                ? "bg-[#800020] text-white shadow-sm"
                : "text-[#735C63] dark:text-[#94A3B8] hover:text-[#1A0A10] dark:hover:text-white hover:bg-white dark:hover:bg-[#334155]"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>دفتر غلطاتي</span>
          </button>

          <button
            onClick={() => setActiveTab("mindmap")}
            className={`h-11 px-5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "mindmap"
                ? "bg-[#800020] text-white shadow-sm"
                : "text-[#735C63] dark:text-[#94A3B8] hover:text-[#1A0A10] dark:hover:text-white hover:bg-white dark:hover:bg-[#334155]"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>الخرائط الذهنية</span>
          </button>
        </div>

        {/* Tab 1: الزتونة الذهبية */}
        {activeTab === "zatona" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6E8] dark:border-[#334155] pb-4">
              <div>
                <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] block">
                  عينة حية من كبسولة الزتونة • الأحياء
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#1A0A10] dark:text-white">
                  الدعامة والحركة في الكائنات الحية
                </h3>
              </div>
              <span className="text-[13px] font-bold bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] px-3 py-2 rounded-full border border-[#F0E6E8] dark:border-[#FBBF24]/50 shrink-0 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>مدة القراءة: 3 دقائق</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF7F8] dark:bg-[#1E293B]/60 border border-[#F0E6E8] dark:border-[#334155] space-y-2">
                <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] block">
                  المفهوم الجوهري (Concept):
                </span>
                <p className="text-[13px] text-[#1A0A10] dark:text-[#F8FAFC] leading-relaxed font-medium">
                  الدعامة الفسيولوجية دعامة مؤقتة تتناول الخلية ككل وتعتمد على الخاصية الأسموزية وامتلاء الفجوة العصارية، بينما الدعامة التركيبية دائمة وتعتمد على ترسيب مواد كيميائية صلبة (السيليلوز والليجنين والكيوتين والسيوبرين).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#D97706]/10 dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#FBBF24]/40 space-y-2">
                <span className="text-[13px] font-bold text-[#D97706] dark:text-[#FBBF24] flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>نقطة امتحانية هامة ومكررة:</span>
                </span>
                <p className="text-[13px] text-[#1A0A10] dark:text-[#F8FAFC] leading-relaxed font-medium">
                  عملية النتح في منتصف النهار تفقد النبات الدعامة الفسيولوجية جزئياً فيذبل مؤقتاً، وتستعاد بمجرد الري وامتصاص الماء ليلاً.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#34D399]/40 space-y-2">
              <span className="text-[13px] font-bold text-[#059669] dark:text-[#34D399] block">
                قائمة التحقق قبل الامتحان:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#1A0A10] dark:text-[#F8FAFC] font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>التمييز الدقيق بين النسيج الكولنشيمي والإسكلرنشيمي</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>دور الكيوتين الخارجي في الحفاظ على الدعامة الفسيولوجية</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: تفسير كل اختيار */}
        {activeTab === "questions" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1">
              <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] block">
                سؤال تطبيقي من بنك الأسئلة
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white leading-relaxed">
                أي التراكيب التالية تكتسب دعامة تركيبية فقط ولا تحتوي على بروتوبلازم عند النضج؟
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 0,
                  text: "أ) أوعية الخشب والألياف الإسكلرنشيمية",
                  isCorrect: true,
                  reason: "صحيح! أوعية الخشب والألياف تفقد البروتوبلازم عند النضج وتترسب عليها مادة الليجنين الصلبة، فتصبح دعامتها تركيبية بحتة.",
                },
                {
                  id: 1,
                  text: "ب) الخلايا البارنشيمية لقشرة الساق",
                  isCorrect: false,
                  reason: "خطأ: الخلايا البارنشيمية خلايا حية ذات جدر رقيقة تحتفظ بالفجوة العصارية وتكتسب دعامة فسيولوجية فقط.",
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
                  reason: "خطأ: الخلايا الكولنشيمية مغلظة الأركان بالسيليلوز لكنها خلايا حية تمتلك فجوة وبروتوبلازم.",
                },
              ].map((opt) => {
                const isSelected = selectedDemoOption === opt.id;
                let cardStyle =
                  "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020]";

                if (selectedDemoOption !== null) {
                  if (opt.isCorrect) {
                    cardStyle =
                      "bg-[#059669]/10 dark:bg-[#1E293B] border-[#059669] font-bold";
                  } else if (isSelected && !opt.isCorrect) {
                    cardStyle =
                      "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#DC2626] font-bold";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedDemoOption(opt.id)}
                    className={`p-4 rounded-xl border text-[13px] sm:text-sm text-right transition-all flex flex-col justify-between space-y-3 ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[#0F172A] dark:text-white">
                        {opt.text}
                      </span>
                      {selectedDemoOption !== null && opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                      )}
                      {selectedDemoOption !== null && isSelected && !opt.isCorrect && (
                        <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                      )}
                    </div>
                    {selectedDemoOption !== null && (
                      <p
                        className={`text-[13px] leading-relaxed pt-2 border-t border-[#E2E8F0]/60 dark:border-[#334155] ${
                          opt.isCorrect
                            ? "text-[#059669] dark:text-[#34D399] font-bold"
                            : "text-[#DC2626] dark:text-[#F87171] font-medium"
                        }`}
                      >
                        {opt.reason}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDemoOption === null && (
              <p className="text-center text-[13px] text-[#94A3B8] font-medium">
                اضغط على أي اختيار لمعاينة التحليل التفسيري الفوري.
              </p>
            )}
          </div>
        )}

        {/* Tab 3: دفتر غلطاتي */}
        {activeTab === "mistakes" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
              <div>
                <span className="text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] block">
                  ركن المذاكرة الأكثر فاعلية
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
                  دفتر أخطائي التفاعلي («غلطاتي»)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] bg-[#DC2626]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#F87171]">
                  3 أخطاء قيد المراجعة
                </span>
                <span className="text-[13px] font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#34D399]">
                  92% معدل الإتقان
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#64748B]">
                  سؤال أخطأت فيه في امتحان الكيمياء (العناصر الانتقالية)
                </span>
                <span className="text-[13px] font-bold bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171] px-3 py-1 rounded-full">
                  لم يتم الإتقان بعد
                </span>
              </div>
              <p className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white">
                ما التوزيع الإلكتروني لأيون الحديد الثلاثي Fe³⁺ في مركب FeCl₃؟
              </p>
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-medium">
                <span className="font-bold text-[#800020] dark:text-[#FB7185]">
                  التحليل العلاجي:{" "}
                </span>
                يفقد الحديد إلكتروني المستوى الفرعي 4s أولاً ثم إلكتروناً واحداً من المستوى 3d ليصبح [Ar] 3d⁵ (نصف ممتلئ وأكثر استقراراً كيميائياً).
              </div>
              <div className="flex items-center justify-end">
                <Link
                  href="/mistakes"
                  className="h-11 px-4 rounded-xl bg-[#800020] text-white text-[13px] font-bold hover:bg-[#66001A] flex items-center gap-2 transition-colors "
                >
                  <span>افتح ركن غلطاتي الكامل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: الخريطة الذهنية */}
        {activeTab === "mindmap" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-sm space-y-6 animate-in fade-in duration-200 text-center">
            <div className="space-y-1">
              <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] block">
                العلاقات المفاهيمية البصرية
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
                خريطة ذهنية متكاملة لكل درس
              </h3>
            </div>

            <div className="p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex flex-col md:flex-row items-center justify-around gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border-2 border-[#800020] text-[#800020] dark:text-[#FB7185] font-bold text-[13px] ">
                المفهوم الأساسي
                <br />
                <span className="text-[13px] text-[#64748B] font-normal">
                  (قوانين نيوتن والحركة)
                </span>
              </div>
              <div className="text-[#94A3B8] font-bold text-lg rotate-90 md:rotate-0">
                ←
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border-2 border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white font-bold text-[13px] ">
                العوامل المؤثرة
                <br />
                <span className="text-[13px] text-[#64748B] font-normal">
                  (علاقة طردية مع القوة وعكسية مع الكتلة)
                </span>
              </div>
              <div className="text-[#94A3B8] font-bold text-lg rotate-90 md:rotate-0">
                ←
              </div>
              <div className="p-4 rounded-xl bg-[#D97706]/10 dark:bg-[#1E293B] border-2 border-[#D97706] text-[#D97706] dark:text-[#FBBF24] font-bold text-[13px] ">
                تطبيقات الامتحان الوزاري
                <br />
                <span className="text-[13px] text-[#64748B] font-normal">
                  (مسائل المصاعد والمستويات المائلة)
                </span>
              </div>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium">
              تساعدك الخريطة الذهنية على استحضار روابط المنهج في عقلك خلال دقائق قبل دخول الامتحان.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}