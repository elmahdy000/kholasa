"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  Zap,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Flame,
  Award,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

export function LandingInteractiveClient() {
  const [activeTab, setActiveTab] = useState<
    "zatona" | "questions" | "mistakes" | "mindmap"
  >("zatona");

  // Sample interactive MCQ state in demo
  const [selectedDemoOption, setSelectedDemoOption] = useState<number | null>(
    null
  );
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // FAQ open items state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "ما هو الفرق بين تطبيق الخلاصة وأي منصة فيديوهات أخرى؟",
      a: "الخلاصة ليست مجرد فيديوهات مسجلة تشاهدها بسلبية. نحن نركز على مصفوفة التعلم النشط: ملخص الزتونة المكثف لكل درس، خرائط العلاقات الذهنية، بنك أسئلة متكيف يفسر لماذا كل اختيار صح أو غلط، وركن أخطائي التلقائي الذي يضمن عدم تكرار الغلطة في الامتحان النهائي.",
    },
    {
      q: "هل المنصة تغطي منهج الثانوية العامة أم البكالوريا المصرية فقط؟",
      a: "تغطي المنصة كلاً من نظام الثانوية العامة ونظام البكالوريا المصرية بشكل مخصص ومنفصل تماماً، مع توزيع الوحدات ونواتج التعلم وتكات الامتحانات الخاصة بكل نظام.",
    },
    {
      q: "هل يعمل التطبيق بدون إنترنت (PWA)؟",
      a: "نعم! الخلاصة مصممة كـ Progressive Web App كامل، مما يتيح لك تثبيتها مباشرة على هاتفك أو حاسوبك بدون متجر تطبيقات، واستعراض ملخصات الزتونة ومراجعاتك في أي وقت حتى عند انقطاع الاتصال.",
    },
    {
      q: "كيف يساعدني «ركن غلطاتي» على تحسين مجموعي؟",
      a: "كل سؤال تجيب عنه بشكل غير صحيح في أي اختبار مخصص يتم ترحيله فوراً إلى «ركن غلطاتي». يعيد النظام اختبارك فيه لاحقاً بذكاء، ويعرض لك التفسير المفهومي حتى تتحول نسبة إتقانك للمفهوم إلى 100%.",
    },
  ];

  return (
    <div className="w-full space-y-24 text-right">
      {/* 1. Interactive Platform Feature Showcase */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-[#4F46E5]/20 text-[#4F46E5] dark:text-indigo-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>معاينة حية للمنصة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            جرّب تجربة التعلم الذكي بنفسك
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed">
            استكشف كيف نحوّل المناهج الكبيرة إلى كبسولات ذهبية وأسئلة ذكية تفاعلية
          </p>
        </div>

        {/* Feature Tabs Selector */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-3xl mx-auto p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("zatona")}
            className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 interactive-tap ${
              activeTab === "zatona"
                ? "bg-white dark:bg-zinc-950 text-[#4F46E5] dark:text-indigo-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#4F46E5]" />
            <span>الزتونة الذهبية</span>
          </button>

          <button
            onClick={() => setActiveTab("questions")}
            className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 interactive-tap ${
              activeTab === "questions"
                ? "bg-white dark:bg-zinc-950 text-[#4F46E5] dark:text-indigo-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>تفسير كل اختيار</span>
          </button>

          <button
            onClick={() => setActiveTab("mistakes")}
            className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 interactive-tap ${
              activeTab === "mistakes"
                ? "bg-white dark:bg-zinc-950 text-rose-500 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>دفتر غلطاتي</span>
          </button>

          <button
            onClick={() => setActiveTab("mindmap")}
            className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 interactive-tap ${
              activeTab === "mindmap"
                ? "bg-white dark:bg-zinc-950 text-[#4F46E5] dark:text-indigo-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Brain className="w-4 h-4 text-[#4F46E5]" />
            <span>الخرائط الذهنية</span>
          </button>
        </div>

        {/* Tab 1: الزتونة الذهبية */}
        {activeTab === "zatona" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 block font-mono">
                  عينة حقيقية من ملخص الزتونة • الأحياء
                </span>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                  الدعامة والحركة في الكائنات الحية
                </h3>
              </div>
              <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ملخص مركز في 3 دقائق</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                <span className="text-xs font-black text-[#4F46E5] dark:text-indigo-400 block">
                  المفهوم الجوهري (Concept):
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  الدعامة الفسيولوجية دعامة مؤقتة تعتمد على الخاصية الأسموزية وانتفاخ الفجوة العصارية، بينما الدعامة التركيبية دائمة وتعتمد على ترسب مواد صلبة مثل السيليلوز والليجنين.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>تكة امتحان ثانوية عامة مكررة:</span>
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  فقدان الماء بعملية النتح السريع في وقت الظهيرة يؤدي لفقدان الدعامة الفسيولوجية مؤقتاً، وتستعاد عند الري ليلاً بامتصاص الماء.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 space-y-2">
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 block">
                قائمة التحقق السريعة قبل الامتحان (Checklist):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>التمييز بين النسيج البارنشيمي والكولنشيمي</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>دور الكيوتين والسيوبرين في منع فقد الماء</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: تفسير كل اختيار */}
        {activeTab === "questions" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 block font-mono">
                سؤال تفاعلي من بنك الأسئلة الذكي
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
              ].map((opt) => {
                const isSelected = selectedDemoOption === opt.id;
                let cardStyle =
                  "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800";

                if (demoSubmitted) {
                  if (opt.isCorrect) {
                    cardStyle =
                      "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-bold";
                  } else if (isSelected && !opt.isCorrect) {
                    cardStyle =
                      "bg-rose-50 dark:bg-rose-950/40 border-rose-500 font-bold";
                  }
                } else if (isSelected) {
                  cardStyle = "bg-indigo-50/50 dark:bg-indigo-950/30 border-[#4F46E5] text-[#4F46E5] dark:text-indigo-400 font-bold";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedDemoOption(opt.id);
                      setDemoSubmitted(true);
                    }}
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm text-right transition-all flex flex-col justify-between space-y-2 interactive-tap ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[#0F172A] dark:text-white">
                        {opt.text}
                      </span>
                      {demoSubmitted && opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {demoSubmitted && isSelected && !opt.isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </div>
                    {demoSubmitted && (
                      <p
                        className={`text-[11px] leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-800 ${
                          opt.isCorrect
                            ? "text-emerald-700 dark:text-emerald-300 font-semibold"
                            : "text-rose-600 dark:text-rose-400"
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
              <p className="text-center text-xs text-slate-400">
                اضغط على أي اختيار لمعاينة التحليل التفسيري الفوري.
              </p>
            )}
          </div>
        )}

        {/* Tab 3: دفتر غلطاتي */}
        {activeTab === "mistakes" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-rose-500 block font-mono">
                  ركن المذاكرة الأكثر فاعلية في الثانوية
                </span>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                  دفتر أخطائي التفاعلي («غلطاتي»)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900/40">
                  3 أخطاء بانتظار الإتقان
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40">
                  92% معدل التحسن
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  سؤال أخطأت فيه في امتحان الوحدة الأولى (الكيمياء)
                </span>
                <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/40">
                  لم يتم الإتقان بعد
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                ما التوزيع الإلكتروني لأيون الحديد الثلاثي Fe³⁺ في مركب FeCl₃؟
              </p>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-[#4F46E5] dark:text-indigo-400">
                  التحليل العلاجي:{" "}
                </span>
                يفقد الحديد إلكتروني المستوى الفرعي 4s أولاً ثم إلكتروناً واحداً من المستوى 3d ليصبح [Ar] 3d⁵ (نصف ممتلئ وأكثر استقراراً).
              </div>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="h-8 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-colors interactive-tap flex items-center gap-1.5"
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
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-300 text-center">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 block font-mono">
                العلاقات المفاهيمية البصرية
              </span>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                خريطة ذهنية متكاملة لكل درس
              </h3>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-around gap-4">
              <div className="p-4 rounded-xl bg-[#4F46E5] text-white font-bold text-xs shadow-2xs">
                المفهوم الأساسي
                <br />
                <span className="text-[10px] text-indigo-200 font-normal">
                  (مثال: القوانين الأساسية)
                </span>
              </div>
              <div className="text-[#4F46E5] font-bold text-lg rotate-90 md:rotate-0">
                ↔
              </div>
              <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs border border-slate-700 shadow-2xs">
                العوامل المؤثرة
                <br />
                <span className="text-[10px] text-slate-300 font-normal">
                  (علاقات طردية وعكسية)
                </span>
              </div>
              <div className="text-amber-500 font-bold text-lg rotate-90 md:rotate-0">
                ↔
              </div>
              <div className="p-4 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-2xs">
                تطبيقات الامتحان
                <br />
                <span className="text-[10px] text-amber-100 font-normal">
                  (مسائل الربط المتقدمة)
                </span>
              </div>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              تساعدك الخريطة الذهنية على استحضار روابط المنهج في عقلك خلال 30 ثانية قبل دخول اللجنة.
            </p>
          </div>
        )}
      </section>

      {/* 2. Comparison Table: Traditional vs El Kholasa */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            لماذا يختار أوائل الثانوية منصة الخلاصة؟
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            مقارنة واضحة بين الطرق التقليدية وطريقة المذاكرة الذكية
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-zinc-950 shadow-xs">
          <div className="grid grid-cols-3 p-4 bg-slate-100 dark:bg-slate-900 font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white border-b border-slate-200 dark:border-slate-800 text-center">
            <div>المعيار</div>
            <div className="text-rose-500 font-bold">الطرق التقليدية</div>
            <div className="text-[#4F46E5] dark:text-indigo-400 font-bold">منصة الخلاصة</div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
            <div className="grid grid-cols-3 p-4 items-center text-center">
              <div className="font-bold text-[#0F172A] dark:text-white">
                زمن مراجعة الدرس
              </div>
              <div className="text-slate-500">2 إلى 3 ساعات حفظ عشوائي</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>10 دقائق في الزتونة المركزة</span>
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 items-center text-center">
              <div className="font-bold text-[#0F172A] dark:text-white">
                تفسير الإجابات
              </div>
              <div className="text-slate-500">معرفة الإجابة الصحيحة فقط دون سبب</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>تفسير لكل خيار ولماذا الباقي خطأ</span>
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 items-center text-center">
              <div className="font-bold text-[#0F172A] dark:text-white">
                معالجة الأخطاء
              </div>
              <div className="text-slate-500">تضيع الأسئلة وتتكرر نفس الغلطة</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>حفظ تلقائي بركن «غلطاتي» وإعادة التدريب</span>
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 items-center text-center">
              <div className="font-bold text-[#0F172A] dark:text-white">
                المذاكرة أوفلاين
              </div>
              <div className="text-slate-500">تتوقف تماماً عند انقطاع النت</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>تطبيق PWA يحفظ الملخصات تلقائياً</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Egyptian Student Testimonials */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800">
            <Award className="w-3.5 h-3.5" />
            <span>قصص نجاح حقيقية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            ماذا يقول طلاب دفعة 2026 عن الخلاصة؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 font-bold flex items-center justify-center">
                ي
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  يوسف مصطفى علام
                </h4>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  ثانوية عامة • علمي علوم (97.6%)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              "أكتر حاجة فادتني هي تفسير الخيارات الغلط. زمان كنت أحل ومش فاهم ليه اخترت كذا، في الخلاصة فهمت فكر واضعي الامتحانات وتجنبت الفخاخ تماماً."
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 font-bold flex items-center justify-center">
                م
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  مريم محمود القاضي
                </h4>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  البكالوريا المصرية • رياضيات (98.2%)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              "ملخصات الزتونة في الرياضة والفيزياء كانت معايا على الموبايل في المواصلات. في أقل من 5 دقائق كنت أسترجع قوانين الوحدة كلها كأني ذاكرتها من جديد."
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center">
                ع
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  عمر حسام الشريف
                </h4>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  ثانوية عامة • أدبي (95.8%)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              "ركن غلطاتي غير طريقتي في التعامل مع التاريخ والفلسفة. الأسئلة اللي كنت بأغلط فيها رجعت وحليتها صح لغاية ما اتقنتها 100% بدون أي قلق."
            </p>
          </div>
        </div>
      </section>

      {/* 4. Interactive FAQ Accordion */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>إجابات واضحة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            الأسئلة الأكثر شيوعاً حول المنصة
          </h2>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-right text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white hover:text-[#4F46E5] dark:hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? "rotate-180 text-[#4F46E5] dark:text-indigo-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
