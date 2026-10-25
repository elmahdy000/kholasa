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
  Compass,
  Check,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<
    "zatona" | "questions" | "mistakes" | "mindmap"
  >("zatona");

  const [selectedDemoOption, setSelectedDemoOption] = useState<number | null>(0);

  return (
    <section id="demo" className="py-20 sm:py-28 bg-white dark:bg-[#0F172A] border-y border-[#F0E6E8] dark:border-[#334155]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12 text-right">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F8] dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] text-[#800020] dark:text-[#FB7185] text-xs font-semibold shadow-xs">
            <Zap className="w-3.5 h-3.5 text-[#D97706]" />
            <span>معاينة حية للنظام</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1A0A10] dark:text-white leading-tight tracking-tight">
            استكشف تجربة الخلاصة بنفسك
          </h2>
          <p className="text-sm text-[#735C63] dark:text-[#94A3B8] font-normal leading-relaxed">
            تنقل بين الأدوات الأكاديمية أدناه لتتعرف كيف تحوّل الخلاصة المناهج الكثيفة إلى نواتج استيعاب واضحة وسريعة.
          </p>
        </div>

        {/* Cohesive Segmented Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-2xl mx-auto p-1.5 rounded-2xl bg-[#FAF7F8] dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("zatona")}
            className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "zatona"
                ? "bg-[#800020] text-white shadow-sm"
                : "text-[#735C63] dark:text-[#94A3B8] hover:text-[#1A0A10] dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>الزتونة المركزة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "questions"
                ? "bg-[#800020] text-white shadow-sm"
                : "text-[#735C63] dark:text-[#94A3B8] hover:text-[#1A0A10] dark:hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>تفسير الخيارات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("mistakes")}
            className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "mistakes"
                ? "bg-[#800020] text-white shadow-sm"
                : "text-[#735C63] dark:text-[#94A3B8] hover:text-[#1A0A10] dark:hover:text-white"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>سجل معالجة الأخطاء</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("mindmap")}
            className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "mindmap"
                ? "bg-[#800020] text-white shadow-sm"
                : "text-[#735C63] dark:text-[#94A3B8] hover:text-[#1A0A10] dark:hover:text-white"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>الخرائط المفاهيمية</span>
          </button>
        </div>

        {/* Tab 1: الزتونة المركزة */}
        {activeTab === "zatona" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6E8] dark:border-[#334155] pb-4">
              <div>
                <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] block">
                  عينة نموذجية • مادة الأحياء للثانوية العامة
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#1A0A10] dark:text-white">
                  الدعامة في النبات (الفسيولوجية والتركيبية)
                </h3>
              </div>
              <span className="text-xs font-semibold bg-[#FAF7F8] dark:bg-[#0F172A] text-[#735C63] dark:text-[#94A3B8] px-3 py-1.5 rounded-lg border border-[#F0E6E8] dark:border-[#334155] shrink-0 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                <span>زمن القراءة: 3 دقائق</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] space-y-2">
                <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185] block">
                  المفهوم الجوهري المقارن:
                </span>
                <p className="text-xs sm:text-sm text-[#735C63] dark:text-[#E2E8F0] leading-relaxed">
                  الدعامة الفسيولوجية مؤقتة وتعتمد على الخاصية الأسموزية وانتفاخ الفجوة العصارية، بينما الدعامة التركيبية دائمة وتعتمد على ترسب مواد صلبة (السيليلوز، الليجنين، الكيوتين، السيوبرين).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#D97706]/30 space-y-2">
                <span className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تكة واضعي الامتحانات:</span>
                </span>
                <p className="text-xs sm:text-sm text-[#735C63] dark:text-[#E2E8F0] leading-relaxed">
                  عملية النتح الحاد وقت الظهيرة تفقد النبات دعامته الفسيولوجية جزئياً فيذبل مؤقتاً، وتستعاد بمجرد الري وامتصاص الماء ليلاً، دون أي تغير في الدعامة التركيبية.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] space-y-2">
              <span className="text-xs font-bold text-[#059669] dark:text-[#34D399] block">
                قائمة التحقق قبل الامتحان الوزاري:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1A0A10] dark:text-white font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>التمييز بين النسيج الكولنشيمي الحي والإسكلرنشيمي غير الحي</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>دور طبقة الكيوتين الخارجية في حماية الدعامة الفسيولوجية</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: تفسير الخيارات */}
        {activeTab === "questions" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] block">
                نموذج تطبيقي من بنك الأسئلة الوزاري
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#1A0A10] dark:text-white leading-relaxed">
                أي التراكيب النباتية التالية تكتسب دعامة تركيبية فقط ولا تحتوي على بروتوبلازم عند النضج؟
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 0,
                  text: "أ) أوعية الخشب والألياف الإسكلرنشيمية",
                  isCorrect: true,
                  reason:
                    "تحليل الخيار الصحيح: أوعية الخشب تفقد بروتوبلازمها عند النضج وتترسب على جدرانها مادة الليجنين الصلبة، فتصبح دعامتها تركيبية فقط.",
                },
                {
                  id: 1,
                  text: "ب) الخلايا البارنشيمية لقشرة الساق",
                  isCorrect: false,
                  reason:
                    "تحليل الخطأ: الخلايا البارنشيمية خلايا حية ذات جدر رقيقة تحتفظ بالفجوة العصارية وتكتسب دعامة فسيولوجية فقط.",
                },
                {
                  id: 2,
                  text: "ج) خلايا البشرة المغطاة بالكيوتين",
                  isCorrect: false,
                  reason:
                    "تحليل الخطأ: خلايا البشرة حية تحتفظ ببروتوبلازمها وتجمع بين الدعامة الفسيولوجية وترسيب الكيوتين التركيبي.",
                },
                {
                  id: 3,
                  text: "د) الخلايا الكولنشيمية لأعناق الأوراق",
                  isCorrect: false,
                  reason:
                    "تحليل الخطأ: الخلايا الكولنشيمية مغلظة بالسيليلوز لكنها خلايا حية ذات بروتوبلازم وفجوة عصارية نامية.",
                },
              ].map((opt) => {
                const isSelected = selectedDemoOption === opt.id;
                let cardStyle =
                  "bg-[#FAF7F8] dark:bg-[#0F172A] border-[#F0E6E8] dark:border-[#334155] hover:border-[#800020]/40";

                if (selectedDemoOption !== null) {
                  if (opt.isCorrect) {
                    cardStyle =
                      "bg-[#059669]/5 dark:bg-[#059669]/10 border-[#059669]";
                  } else if (isSelected && !opt.isCorrect) {
                    cardStyle =
                      "bg-[#DC2626]/5 dark:bg-[#DC2626]/10 border-[#DC2626]";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedDemoOption(opt.id)}
                    className={`p-4 rounded-xl border text-xs sm:text-sm text-right transition-all flex flex-col justify-between space-y-3 cursor-pointer ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[#1A0A10] dark:text-white">
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
                        className={`text-xs leading-relaxed pt-2 border-t border-[#F0E6E8] dark:border-[#334155] ${
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

        {/* Tab 3: سجل الأخطاء */}
        {activeTab === "mistakes" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6E8] dark:border-[#334155] pb-4">
              <div>
                <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] block">
                  خوارزمية الإتقان التراكمي
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#1A0A10] dark:text-white">
                  سجل معالجة الأخطاء الذكي
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 px-3 py-1 rounded-full border border-[#800020]/20">
                  سؤالان قيد المراجعة
                </span>
                <span className="text-xs font-semibold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 px-3 py-1 rounded-full border border-[#059669]/20">
                  معدل التثبيت: 94%
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#735C63] dark:text-[#94A3B8]">
                  كيمياء الثانوية العامة • الباب الأول (العناصر الانتقالية)
                </span>
                <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185]">
                  معاد جدولة السؤال
                </span>
              </div>
              <p className="text-sm font-bold text-[#1A0A10] dark:text-white">
                ما هو التوزيع الإلكتروني الصحيح لأيون الحديد الثلاثي Fe³⁺ في مركب FeCl₃؟
              </p>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] text-xs text-[#735C63] dark:text-[#E2E8F0] leading-relaxed">
                <span className="font-bold text-[#800020] dark:text-[#FB7185]">
                  التحليل العلاجي:{" "}
                </span>
                يفقد الحديد إلكتروني المستوى 4s أولاً ثم إلكتروناً واحداً من المستوى 3d ليصبح التوزيع [Ar] 3d⁵ (نصف ممتلئ وأكثر استقراراً ثرموديناميكياً).
              </div>
              <div className="flex items-center justify-end pt-1">
                <Link
                  href="/mistakes"
                  className="h-10 px-4 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#66001A] flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>استعراض سجل أخطائك الكامل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: الخريطة المفاهيمية */}
        {activeTab === "mindmap" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] shadow-xs space-y-6 animate-in fade-in duration-150 text-center">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] block">
                الروابط السببية والاستذكار الفوري
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#1A0A10] dark:text-white">
                خريطة العلاقات المفهومية لكل فصل
              </h3>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF7F8] dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#800020]/30 shadow-xs text-right space-y-1.5">
                <span className="text-[11px] font-bold text-[#800020] dark:text-[#FB7185] block">
                  1. المفهوم الأساسي
                </span>
                <h4 className="text-xs font-bold text-[#1A0A10] dark:text-white">
                  قوانين نيوتن ومحصلة القوى
                </h4>
                <p className="text-[11px] text-[#735C63] dark:text-[#94A3B8]">
                  تحديد اتجاه الحركة والقوة المحصلة
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] shadow-xs text-right space-y-1.5">
                <span className="text-[11px] font-bold text-[#735C63] dark:text-[#94A3B8] block">
                  2. العلاقات الرياضية والبيانية
                </span>
                <h4 className="text-xs font-bold text-[#1A0A10] dark:text-white">
                  ميل المنحنيات (Slope)
                </h4>
                <p className="text-[11px] text-[#735C63] dark:text-[#94A3B8]">
                  ميل منحنى (a - F) يمثل مقلوب الكتلة 1/m
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D97706]/40 shadow-xs text-right space-y-1.5">
                <span className="text-[11px] font-bold text-[#D97706] dark:text-[#FBBF24] block">
                  3. أنماط الامتحان الوزاري
                </span>
                <h4 className="text-xs font-bold text-[#1A0A10] dark:text-white">
                  حركة المصاعد والبكرات
                </h4>
                <p className="text-[11px] text-[#735C63] dark:text-[#94A3B8]">
                  حساب الوزن الظاهري مقارنة بالوزن الحقيقي
                </p>
              </div>
            </div>

            <p className="text-xs text-[#735C63] dark:text-[#94A3B8] font-normal">
              تساعدك الخرائط الذهنية على استرجاع تفاصيل المنهج كاملة قبل دخول لجنة الامتحان بعيداً عن حشو المذكرات.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}