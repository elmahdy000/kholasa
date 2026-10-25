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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F46E5]/10 dark:bg-[#1E293B] border border-[#4F46E5]/20 text-[#4F46E5] dark:text-[#6366F1] text-[13px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>معاينة حية للمنصة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            جرّب تجربة التعلم الذكي بنفسك
          </h2>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed">
            استكشف كيف نحوّل المناهج الكبيرة إلى كبسولات ذهبية وأسئلة ذكية تفاعلية
          </p>
        </div>

        {/* Feature Tabs Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
          <button
            onClick={() => setActiveTab("zatona")}
            className={`h-11 px-4 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 interactive-tap ${
              activeTab === "zatona"
                ? "bg-white dark:bg-[#0F172A] text-[#4F46E5] dark:text-[#6366F1] "
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#4F46E5]" />
            <span>الزتونة الذهبية</span>
          </button>

          <button
            onClick={() => setActiveTab("questions")}
            className={`h-11 px-4 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 interactive-tap ${
              activeTab === "questions"
                ? "bg-white dark:bg-[#0F172A] text-[#4F46E5] dark:text-[#6366F1] "
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4 text-[#D97706]" />
            <span>تفسير كل اختيار</span>
          </button>

          <button
            onClick={() => setActiveTab("mistakes")}
            className={`h-11 px-4 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 interactive-tap ${
              activeTab === "mistakes"
                ? "bg-white dark:bg-[#0F172A] text-[#DC2626] "
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <RotateCcw className="w-4 h-4 text-[#DC2626]" />
            <span>دفتر غلطاتي</span>
          </button>

          <button
            onClick={() => setActiveTab("mindmap")}
            className={`h-11 px-4 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2 interactive-tap ${
              activeTab === "mindmap"
                ? "bg-white dark:bg-[#0F172A] text-[#4F46E5] dark:text-[#6366F1] "
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <Brain className="w-4 h-4 text-[#4F46E5]" />
            <span>الخرائط الذهنية</span>
          </button>
        </div>

        {/* Tab 1: الزتونة الذهبية */}
        {activeTab === "zatona" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
              <div>
                <span className="text-[13px] font-bold text-[#4F46E5] dark:text-[#6366F1] block font-mono">
                  عينة حقيقية من ملخص الزتونة • الأحياء
                </span>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                  الدعامة والحركة في الكائنات الحية
                </h3>
              </div>
              <span className="text-[13px] font-bold bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#FBBF24] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ملخص مركز في 3 دقائق</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#4F46E5]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#6366F1]/40 space-y-2">
                <span className="text-[13px] font-bold text-[#4F46E5] dark:text-[#6366F1] block">
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
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <span className="text-[13px] font-bold text-[#4F46E5] dark:text-[#6366F1] block font-mono">
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
                  cardStyle = "bg-[#4F46E5]/10 dark:bg-[#1E293B] border-[#4F46E5] text-[#4F46E5] dark:text-[#6366F1] font-bold";
                }

                return (
                  <button
                    key={opt.id}
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
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-6 animate-in fade-in duration-300">
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
                <span className="font-bold text-[#4F46E5] dark:text-[#6366F1]">
                  التحليل العلاجي:{" "}
                </span>
                يفقد الحديد إلكتروني المستوى الفرعي 4s أولاً ثم إلكتروناً واحداً من المستوى 3d ليصبح [Ar] 3d⁵ (نصف ممتلئ وأكثر استقراراً).
              </div>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="h-11 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold transition-colors interactive-tap flex items-center gap-2"
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
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-6 animate-in fade-in duration-300 text-center">
            <div className="space-y-1">
              <span className="text-[13px] font-bold text-[#4F46E5] dark:text-[#6366F1] block font-mono">
                العلاقات المفاهيمية البصرية
              </span>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
                خريطة ذهنية متكاملة لكل درس
              </h3>
            </div>

            <div className="p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex flex-col md:flex-row items-center justify-around gap-4">
              <div className="p-4 rounded-xl bg-[#4F46E5] text-white font-bold text-[13px] ">
                المفهوم الأساسي
                <br />
                <span className="text-[13px] text-[#4F46E5] font-normal">
                  (مثال: القوانين الأساسية)
                </span>
              </div>
              <div className="text-[#4F46E5] font-bold text-lg rotate-90 md:rotate-0">
                ↔
              </div>
              <div className="p-4 rounded-xl bg-[#0F172A] dark:bg-[#1E293B] text-white font-bold text-[13px] border border-[#94A3B8] ">
                العوامل المؤثرة
                <br />
                <span className="text-[13px] text-[#94A3B8] font-normal">
                  (علاقات طردية وعكسية)
                </span>
              </div>
              <div className="text-[#D97706] font-bold text-lg rotate-90 md:rotate-0">
                ↔
              </div>
              <div className="p-4 rounded-xl bg-[#D97706] text-white font-bold text-[13px] ">
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

      {/* 2. Comparison Table: Traditional vs El Kholasa */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            لماذا يختار أوائل الثانوية منصة الخلاصة؟
          </h2>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            مقارنة واضحة بين الطرق التقليدية وطريقة المذاكرة الذكية
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden bg-white dark:bg-[#0F172A] ">
          <div className="grid grid-cols-3 p-4 bg-[#F8FAFC] dark:bg-[#1E293B] font-bold text-[13px] sm:text-sm text-[#0F172A] dark:text-white border-b border-[#E2E8F0] dark:border-[#334155] text-center">
            <div>المعيار</div>
            <div className="text-[#DC2626] font-bold">الطرق التقليدية</div>
            <div className="text-[#4F46E5] dark:text-[#6366F1] font-bold">منصة الخلاصة</div>
          </div>

          <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155] text-[13px] sm:text-sm">
            <div className="grid grid-cols-3 p-4 items-center text-center">
              <div className="font-bold text-[#0F172A] dark:text-white">
                زمن مراجعة الدرس
              </div>
              <div className="text-[#64748B]">2 إلى 3 ساعات حفظ عشوائي</div>
              <div className="text-[#059669] dark:text-[#34D399] font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4 text-[#059669]" />
                <span>10 دقائق في الزتونة المركزة</span>
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 items-center text-center">
              <div className="font-bold text-[#0F172A] dark:text-white">
                تفسير الإجابات
              </div>
              <div className="text-[#64748B]">معرفة الإجابة الصحيحة فقط دون سبب</div>
              <div className="text-[#059669] dark:text-[#34D399] font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4 text-[#059669]" />
                <span>تفسير لكل خيار ولماذا الباقي خطأ</span>
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 items-center text-center">
              <div className="font-bold text-[#0F172A] dark:text-white">
                معالجة الأخطاء
              </div>
              <div className="text-[#64748B]">تضيع الأسئلة وتتكرر نفس الغلطة</div>
              <div className="text-[#059669] dark:text-[#34D399] font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4 text-[#059669]" />
                <span>حفظ تلقائي بركن «غلطاتي» وإعادة التدريب</span>
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 items-center text-center">
              <div className="font-bold text-[#0F172A] dark:text-white">
                المذاكرة أوفلاين
              </div>
              <div className="text-[#64748B]">تتوقف تماماً عند انقطاع النت</div>
              <div className="text-[#059669] dark:text-[#34D399] font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4 text-[#059669]" />
                <span>تطبيق PWA يحفظ الملخصات تلقائياً</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F46E5]/10 dark:bg-[#1E293B] text-[#4F46E5] dark:text-[#6366F1] text-[13px] font-bold border border-[#E2E8F0] dark:border-[#6366F1]">
            <Sparkles className="w-4 h-4" />
            <span>منهجية واضحة</span>
          </div>
          <h2 className="text-2xl sm:text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            ثلاث خطوات من الفهم إلى الإتقان
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
            <div className="w-11 h-11 rounded-lg bg-[#4F46E5]/10 dark:bg-[#1E293B] text-[#4F46E5] dark:text-[#6366F1] flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
              1. افهم الفكرة
            </h3>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              شرح مفكك خطوة بخطوة، وملخص «الزتونة» يحفظ القوانين والمفاهيم في وقت المراجعة.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
            <div className="w-11 h-11 rounded-lg bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
              2. اختبر استيعابك
            </h3>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              امتحانات رسمية ومخصصة مع تصحيح فوري وتفسير لكل اختيار، لا مجرد درجة نهائية.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
            <div className="w-11 h-11 rounded-lg bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
              3. راجع أخطاءك
            </h3>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              كل خطأ يُحفظ في «ركن غلطاتي» ليعود إليك لاحقاً حتى تتقن المفهوم فعلياً.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Interactive FAQ Accordion */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>إجابات واضحة</span>
          </div>
          <h2 className="text-2xl sm:text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            الأسئلة الأكثر شيوعاً حول المنصة
          </h2>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] overflow-hidden transition-all "
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-right text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white hover:text-[#4F46E5] dark:hover:text-[#6366F1] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#94A3B8] transition-transform ${
                      isOpen ? "rotate-180 text-[#4F46E5] dark:text-[#6366F1]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed border-t border-[#E2E8F0] dark:border-[#334155]/80 pt-3">
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
