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
    <section id="demo" className="py-20 sm:py-28 bg-[#F8FAFC] dark:bg-[#09090B] border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 text-right">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800 text-[#4F46E5] dark:text-indigo-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>معاينة حية للمنصة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-white leading-tight">
            استكشف تجربة الخلاصة الآن
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] font-medium leading-relaxed">
            اضغط على التبويبات بالأسفل لتشاهد كيف تتحول المواد إلى كبسولات سهلة الفهم وأسئلة تفاعلية
          </p>
        </div>

        {/* Cohesive Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-2xl mx-auto p-1.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <button
            onClick={() => setActiveTab("zatona")}
            className={`h-10 px-5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === "zatona"
                ? "bg-[#4F46E5] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-current" />
            <span>الزتونة الذهبية</span>
          </button>

          <button
            onClick={() => setActiveTab("questions")}
            className={`h-10 px-5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === "questions"
                ? "bg-[#4F46E5] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>تفسير كل اختيار</span>
          </button>

          <button
            onClick={() => setActiveTab("mistakes")}
            className={`h-10 px-5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === "mistakes"
                ? "bg-[#4F46E5] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>دفتر غلطاتي</span>
          </button>

          <button
            onClick={() => setActiveTab("mindmap")}
            className={`h-10 px-5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === "mindmap"
                ? "bg-[#4F46E5] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>الخرائط الذهنية</span>
          </button>
        </div>

        {/* Tab 1: الزتونة الذهبية */}
        {activeTab === "zatona" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 block">
                  عينة حية من كبسولة الزتونة • الأحياء
                </span>
                <h3 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
                  الدعامة والحركة في الكائنات الحية
                </h3>
              </div>
              <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900/50 shrink-0 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>مدة القراءة: 3 دقائق</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 block">
                  المفهوم الجوهري (Concept):
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  الدعامة الفسيولوجية دعامة مؤقتة تتناول الخلية ككل وتعتمد على الخاصية الأسموزية وامتلاء الفجوة العصارية، بينما الدعامة التركيبية دائمة وتعتمد على ترسيب مواد كيميائية صلبة (السيليلوز والليجنين والكيوتين والسيوبرين).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                <span className="text-xs font-bold text-[#D97706] dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>نقطة امتحانية هامة ومكررة:</span>
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  عملية النتح في منتصف النهار تفقد النبات الدعامة الفسيولوجية جزئياً فيذبل مؤقتاً، وتستعاد بمجرد الري وامتصاص الماء ليلاً.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                قائمة التحقق قبل الامتحان:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>التمييز الدقيق بين النسيج الكولنشيمي والإسكلرنشيمي</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>دور الكيوتين الخارجي في الحفاظ على الدعامة الفسيولوجية</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: تفسير كل اختيار */}
        {activeTab === "questions" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 block">
                سؤال تطبيقي من بنك الأسئلة
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white leading-relaxed">
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
                  "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#4F46E5]";

                if (selectedDemoOption !== null) {
                  if (opt.isCorrect) {
                    cardStyle =
                      "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 font-bold";
                  } else if (isSelected && !opt.isCorrect) {
                    cardStyle =
                      "bg-rose-50 dark:bg-rose-950/40 border-rose-600 font-bold";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedDemoOption(opt.id)}
                    className={`p-4 rounded-xl border text-xs sm:text-sm text-right transition-all flex flex-col justify-between space-y-2.5 ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[#0F172A] dark:text-white">
                        {opt.text}
                      </span>
                      {selectedDemoOption !== null && opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {selectedDemoOption !== null && isSelected && !opt.isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </div>
                    {selectedDemoOption !== null && (
                      <p
                        className={`text-[11px] leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-800 ${
                          opt.isCorrect
                            ? "text-emerald-700 dark:text-emerald-300 font-bold"
                            : "text-rose-600 dark:text-rose-400 font-medium"
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
              <p className="text-center text-xs text-slate-400 font-medium">
                اضغط على أي اختيار لمعاينة التحليل التفسيري الفوري.
              </p>
            )}
          </div>
        )}

        {/* Tab 3: دفتر غلطاتي */}
        {activeTab === "mistakes" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                  ركن المذاكرة الأكثر فاعلية
                </span>
                <h3 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
                  دفتر أخطائي التفاعلي («غلطاتي»)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                  3 أخطاء قيد المراجعة
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  92% معدل الإتقان
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  سؤال أخطأت فيه في امتحان الكيمياء (العناصر الانتقالية)
                </span>
                <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 rounded-full">
                  لم يتم الإتقان بعد
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                ما التوزيع الإلكتروني لأيون الحديد الثلاثي Fe³⁺ في مركب FeCl₃؟
              </p>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                <span className="font-bold text-[#4F46E5] dark:text-indigo-400">
                  التحليل العلاجي:{" "}
                </span>
                يفقد الحديد إلكتروني المستوى الفرعي 4s أولاً ثم إلكتروناً واحداً من المستوى 3d ليصبح [Ar] 3d⁵ (نصف ممتلئ وأكثر استقراراً كيميائياً).
              </div>
              <div className="flex items-center justify-end">
                <Link
                  href="/mistakes"
                  className="h-9 px-4 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#4338CA] flex items-center gap-1.5 transition-colors shadow-2xs"
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
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200 text-center">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 block">
                العلاقات المفاهيمية البصرية
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
                خريطة ذهنية متكاملة لكل درس
              </h3>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-around gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-[#4F46E5] text-[#4F46E5] dark:text-indigo-300 font-bold text-xs shadow-2xs">
                المفهوم الأساسي
                <br />
                <span className="text-[10px] text-slate-500 font-normal">
                  (قوانين نيوتن والحركة)
                </span>
              </div>
              <div className="text-slate-400 font-bold text-lg rotate-90 md:rotate-0">
                ←
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white font-bold text-xs shadow-2xs">
                العوامل المؤثرة
                <br />
                <span className="text-[10px] text-slate-500 font-normal">
                  (علاقة طردية مع القوة وعكسية مع الكتلة)
                </span>
              </div>
              <div className="text-slate-400 font-bold text-lg rotate-90 md:rotate-0">
                ←
              </div>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-400 text-amber-800 dark:text-amber-300 font-bold text-xs shadow-2xs">
                تطبيقات الامتحان الوزاري
                <br />
                <span className="text-[10px] text-slate-500 font-normal">
                  (مسائل المصاعد والمستويات المائلة)
                </span>
              </div>
            </div>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium">
              تساعدك الخريطة الذهنية على استحضار روابط المنهج في عقلك خلال دقائق قبل دخول الامتحان.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}