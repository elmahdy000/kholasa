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
  Layers,
} from "lucide-react";

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<
    "zatona" | "questions" | "mistakes" | "mindmap"
  >("zatona");

  const [selectedDemoOption, setSelectedDemoOption] = useState<number | null>(0);

  const demoQuestions = [
    {
      id: 0,
      text: "أ) أوعية الخشب والألياف الإسكلرنشيمية",
      isCorrect: true,
      reason:
        "صحيح! أوعية الخشب والألياف تفقد البروتوبلازم عند النضج وتترسب عليها مادة الليجنين الصلبة، فتصبح دعامتها تركيبية بحتة.",
    },
    {
      id: 1,
      text: "ب) الخلايا البارنشيمية لقشرة الساق",
      isCorrect: false,
      reason:
        "خطأ: الخلايا البارنشيمية خلايا حية ذات جدر رقيقة تحتفظ بالفجوة العصارية وتكتسب دعامة فسيولوجية فقط.",
    },
    {
      id: 2,
      text: "ج) خلايا البشرة المغطاة بالكيوتين",
      isCorrect: false,
      reason:
        "خطأ: خلايا البشرة خلايا حية تحتفظ بالبروتوبلازم ولديها دعامة فسيولوجية مع دعامة تركيبية جزئية.",
    },
    {
      id: 3,
      text: "د) الخلايا الكولنشيمية لأعناق الأوراق",
      isCorrect: false,
      reason:
        "خطأ: الخلايا الكولنشيمية مغلظة الأركان بالسيليلوز لكنها خلايا حية تمتلك فجوة وبروتوبلازم.",
    },
  ];

  return (
    <section id="demo" className="py-20 sm:py-24 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14 text-right">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#12263F] dark:text-white leading-tight tracking-tight">
            جرّب الخلاصة بنفسك
          </h2>
          <p className="text-base text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            استكشف كيف نحوّل المناهج الكبيرة إلى كبسولات ذهبية وأسئلة ذكية تفاعلية.
          </p>
        </div>

        {/* Responsive Tab Bar (Horizontally scrollable on mobile) */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center justify-center gap-2 min-w-max mx-auto p-1.5 rounded-2xl bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155]">
            <button
              type="button"
              onClick={() => setActiveTab("zatona")}
              className={`h-11 px-5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "zatona"
                  ? "bg-[#800020] text-white shadow-xs"
                  : "bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span>الزتونة الذهبية</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("questions")}
              className={`h-11 px-5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "questions"
                  ? "bg-[#800020] text-white shadow-xs"
                  : "bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>تفسير كل اختيار</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("mistakes")}
              className={`h-11 px-5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "mistakes"
                  ? "bg-[#800020] text-white shadow-xs"
                  : "bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-white"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>دفتر غلطاتي</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("mindmap")}
              className={`h-11 px-5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "mindmap"
                  ? "bg-[#800020] text-white shadow-xs"
                  : "bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-white"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>الخرائط الذهنية</span>
            </button>
          </div>
        </div>

        {/* Tab 1: الزتونة الذهبية */}
        {activeTab === "zatona" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E9ED] dark:border-[#334155] pb-4">
              <div>
                <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] block">
                  عينة حية من كبسولة الزتونة • الأحياء
                </span>
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  الدعامة في النبات (الفسيولوجية والتركيبية)
                </h3>
              </div>
              <span className="text-xs font-semibold bg-[#F7F8FA] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] px-3 py-1.5 rounded-lg border border-[#E8E9ED] dark:border-[#334155] shrink-0 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <span>مدة القراءة: 3 دقائق</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Concept Box */}
              <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-2">
                <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185] block">
                  المفهوم الجوهري (Concept):
                </span>
                <p className="text-sm text-[#12263F] dark:text-[#F8FAFC] leading-relaxed font-normal">
                  الدعامة الفسيولوجية مؤقتة وتتناول الخلية ككل وتعتمد على الخاصية الأسموزية وامتلاء الفجوة العصارية، بينما الدعامة التركيبية دائمة وتعتمد على ترسيب مواد صلبة (السيليلوز والليجنين والكيوتين والسيوبرين).
                </p>
              </div>

              {/* Exam Note Box */}
              <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#D97706]/40 space-y-2">
                <span className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                  <span>نقطة امتحانية هامة ومكررة:</span>
                </span>
                <p className="text-sm text-[#12263F] dark:text-[#F8FAFC] leading-relaxed font-normal">
                  عملية النتح في منتصف النهار تفقد النبات الدعامة الفسيولوجية جزئياً فيذبل مؤقتاً، وتستعاد بمجرد الري وامتصاص الماء ليلاً، دون أي تأثر في الدعامة التركيبية.
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-2">
              <span className="text-xs font-bold text-[#059669] dark:text-[#34D399] block">
                قائمة التحقق قبل الامتحان:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#12263F] dark:text-[#F8FAFC] font-medium pt-1">
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
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] block">
                سؤال تطبيقي من بنك الأسئلة الوزاري
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#12263F] dark:text-white leading-relaxed">
                أي التراكيب التالية تكتسب دعامة تركيبية فقط ولا تحتوي على بروتوبلازم عند النضج؟
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoQuestions.map((opt) => {
                const isSelected = selectedDemoOption === opt.id;
                let optionStyle =
                  "bg-[#F7F8FA] dark:bg-[#0F172A] border-[#E8E9ED] dark:border-[#334155] hover:border-[#800020]/40";

                if (selectedDemoOption !== null) {
                  if (opt.isCorrect) {
                    optionStyle = "bg-[#059669]/5 dark:bg-[#059669]/10 border-[#059669]";
                  } else if (isSelected && !opt.isCorrect) {
                    optionStyle = "bg-[#DC2626]/5 dark:bg-[#DC2626]/10 border-[#DC2626]";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedDemoOption(opt.id)}
                    className={`p-4 rounded-xl border text-xs sm:text-sm text-right transition-colors flex flex-col justify-between space-y-3 cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[#12263F] dark:text-white">
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
                        className={`text-xs leading-relaxed pt-2 border-t border-[#E8E9ED] dark:border-[#334155] ${
                          opt.isCorrect
                            ? "text-[#059669] dark:text-[#34D399] font-medium"
                            : "text-[#DC2626] dark:text-[#F87171] font-normal"
                        }`}
                      >
                        {opt.reason}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: دفتر غلطاتي */}
        {activeTab === "mistakes" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E9ED] dark:border-[#334155] pb-4">
              <div>
                <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] block">
                  ركن المذاكرة الأكثر فاعلية
                </span>
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  دفتر أخطائي التفاعلي («غلطاتي»)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 px-3 py-1 rounded-full border border-[#800020]/20">
                  سؤال قيد المراجعة
                </span>
                <span className="text-xs font-semibold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 px-3 py-1 rounded-full border border-[#059669]/20">
                  92% معدل الإتقان
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64748B]">
                  سؤال أخطأت فيه في امتحان الكيمياء (العناصر الانتقالية)
                </span>
                <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185]">
                  معاد جدولته
                </span>
              </div>
              <p className="text-sm font-bold text-[#12263F] dark:text-white">
                ما التوزيع الإلكتروني لأيون الحديد الثلاثي Fe³⁺ في مركب FeCl₃؟
              </p>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] text-xs text-[#12263F] dark:text-[#F8FAFC] leading-relaxed font-normal">
                <span className="font-bold text-[#800020] dark:text-[#FB7185]">
                  التحليل العلاجي:{" "}
                </span>
                يفقد الحديد إلكتروني المستوى الفرعي 4s أولاً ثم إلكتروناً واحداً من المستوى 3d ليصبح [Ar] 3d⁵ (نصف ممتلئ وأكثر استقراراً كيميائياً).
              </div>
              <div className="flex items-center justify-end pt-1">
                <Link
                  href="/mistakes"
                  className="h-10 px-4 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#66001A] flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>افتح ركن غلطاتي الكامل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: الخرائط الذهنية */}
        {activeTab === "mindmap" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6 text-center">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] block">
                العلاقات المفاهيمية البصرية
              </span>
              <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                خريطة ذهنية متكاملة لكل درس
              </h3>
            </div>

            <div className="p-6 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#800020]/30 shadow-xs text-right space-y-1.5">
                <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185] block">
                  1. المفهوم الأساسي
                </span>
                <h4 className="text-sm font-bold text-[#12263F] dark:text-white">
                  قوانين نيوتن ومحصلة القوى
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  تحديد اتجاه الحركة والقوة المحصلة
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs text-right space-y-1.5">
                <span className="text-xs font-bold text-[#12263F] dark:text-white block">
                  2. العلاقات الرياضية
                </span>
                <h4 className="text-sm font-bold text-[#12263F] dark:text-white">
                  ميل المنحنيات البيانية
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  ميل منحنى (a - F) يمثل مقلوب الكتلة 1/m
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D97706]/40 shadow-xs text-right space-y-1.5">
                <span className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] block">
                  3. تطبيقات الامتحان
                </span>
                <h4 className="text-sm font-bold text-[#12263F] dark:text-white">
                  حركة المصاعد والبكرات
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  حساب الوزن الظاهري مقارنة بالوزن الحقيقي
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal">
              تساعدك الخريطة الذهنية على استحضار روابط المنهج في عقلك خلال دقائق قبل دخول الامتحان.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}