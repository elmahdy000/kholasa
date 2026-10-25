"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Network,
  CheckSquare,
  ArrowLeft,
  Clock,
  AlertTriangle,
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
        "صح جداً! أوعية الخشب والألياف بتفقد البروتوبلازم أول ما تنضج وبيترسب عليها لجنين، فبتبقى دعامتها تركيبية وبس.",
    },
    {
      id: 1,
      text: "ب) الخلايا البارنشيمية لقشرة الساق",
      isCorrect: false,
      reason:
        "غلط: الخلايا البارنشيمية خلايا حية ورقيقة وبتعتمد ع الفجوة العصارية والمية، يعني فسيولوجية بس.",
    },
    {
      id: 2,
      text: "ج) خلايا البشرة المغطاة بالكيوتين",
      isCorrect: false,
      reason:
        "غلط: خلايا البشرة حية وفيها فسيولوجية، والكيوتين اللي فوقيها بيزودها دعامة تركيبية.",
    },
    {
      id: 3,
      text: "د) الخلايا الكولنشيمية لأعناق الأوراق",
      isCorrect: false,
      reason:
        "غلط: الخلايا الكولنشيمية حية ومغلظة بالسيليلوز، ففيها دعامة فسيولوجية وتركيبية مع بعض.",
    },
  ];

  return (
    <section id="demo" className="py-20 sm:py-24 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14 text-right">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#12263F] dark:text-white leading-tight tracking-tight">
            جرّب الخلاصة بنفسك وشوف الفرق
          </h2>
          <p className="text-base text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            دوس على أي تبويب وشوف إزاي المنهج بيتحول لمعلومة سهلة وتثبت في دماغك.
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
              <BookmarkCheck className="w-4 h-4 text-[#D97706]" strokeWidth={1.8} />
              <span>كبسولة الزتونة</span>
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
              <CheckSquare className="w-4 h-4" strokeWidth={1.8} />
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
              <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
              <span>كشكول غلطاتي</span>
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
              <Network className="w-4 h-4" strokeWidth={1.8} />
              <span>الخرائط الذهنية</span>
            </button>
          </div>
        </div>

        {/* Tab 1: كبسولة الزتونة */}
        {activeTab === "zatona" && (
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E9ED] dark:border-[#334155] pb-4">
              <div>
                <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] block">
                  عينة حية من كبسولة الزتونة • مادة الأحياء
                </span>
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  الدعامة في النبات (الفسيولوجية والتركيبية)
                </h3>
              </div>
              <span className="text-xs font-semibold bg-[#F7F8FA] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] px-3 py-1.5 rounded-lg border border-[#E8E9ED] dark:border-[#334155] shrink-0 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <span>زمن القراءة: ٣ دقائق</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Concept Box */}
              <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-2">
                <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185] block">
                  الفكرة ببساطة:
                </span>
                <p className="text-sm text-[#12263F] dark:text-[#F8FAFC] leading-relaxed font-normal">
                  الدعامة الفسيولوجية مؤقتة وبتعتمد على المية وانتفاخ الخلية ككل، أما الدعامة التركيبية فدي ثابتة ودائمة عشان النبات بيرسب مواد صلبة تحميه (زي السيليلوز والليجنين والكيوتين والسيوبرين).
                </p>
              </div>

              {/* Exam Note Box */}
              <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#D97706]/40 space-y-2">
                <span className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                  <span>تكة امتحان مهمة وبتتكرر كتير:</span>
                </span>
                <p className="text-sm text-[#12263F] dark:text-[#F8FAFC] leading-relaxed font-normal">
                  وقت الضهر مع النتح العالي، النبات بيفقد شوية من دعامته الفسيولوجية فبيدبل مؤقتاً، وبيرجع يصحصح بالليل أول ما يشرب، من غير ما دعامته التركيبية تتأثر بأي حاجة.
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-2">
              <span className="text-xs font-bold text-[#059669] dark:text-[#34D399] block">
                تأكد إنك مظبط النقطتين دول قبل الامتحان:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#12263F] dark:text-[#F8FAFC] font-medium pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>الفرق بين النسيج الكولنشيمي الحي والإسكلرنشيمي الصلب</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>دور طبقة الكيوتين في الحفاظ على المية ومبيخليهاش تتبخر</span>
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
                سؤال من امتحانات الوزارة السابقة
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
                  كشكول أخطاءك الذكي («غلطاتي»)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 px-3 py-1 rounded-full border border-[#800020]/20">
                  سؤال محتاج تراجعه
                </span>
                <span className="text-xs font-semibold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 px-3 py-1 rounded-full border border-[#059669]/20">
                  ٩٢٪ معدل الإتقان
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64748B]">
                  سؤال كنت غلطت فيه في امتحان الكيمياء (العناصر الانتقالية)
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
                  ليه الإجابة دي؟{" "}
                </span>
                الحديد بيفقد أول اتنين إلكترون من المستوى 4s، وبعدين إلكترون كمان من 3d، فيبقى التوزيع [Ar] 3d⁵ (نصف ممتلئ وأكتر استقراراً كيميائياً).
              </div>
              <div className="flex items-center justify-end pt-1">
                <Link
                  href="/mistakes"
                  className="h-10 px-4 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#66001A] flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>افتح ركن غلطاتك كامل</span>
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
                  1. الفكرة الأساسية
                </span>
                <h4 className="text-sm font-bold text-[#12263F] dark:text-white">
                  قوانين نيوتن ومحصلة القوى
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  تحديد اتجاه الحركة والقوة المؤثرة
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs text-right space-y-1.5">
                <span className="text-xs font-bold text-[#12263F] dark:text-white block">
                  2. العلاقات البيانية
                </span>
                <h4 className="text-sm font-bold text-[#12263F] dark:text-white">
                  ميل المنحنيات البيانية
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  ميل منحنى a-F بيساوي مقلوب الكتلة 1/m
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#D97706]/40 shadow-xs text-right space-y-1.5">
                <span className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] block">
                  3. تكات الامتحان
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
              الخريطة الذهنية بتجمعلك روابط المنهج في عينيك في دقيقتين قبل ما تدخل لجنة الامتحان.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}