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
  Brain,
  Code2,
  ShieldCheck,
  Cpu,
} from "lucide-react";

// ─── Engineering Track Demo Data ─────────────────────────────────────────────
const demoQuestionsArabic = [
  {
    id: 0,
    text: "أ) التعلم الآلي المُوجَّه (Supervised Learning)",
    isCorrect: true,
    reason:
      "صح! في التعلم المُوجَّه بنديله بيانات مُعَلَّمة (labels) ونموذج يتعلم العلاقة بين المدخلات والمخرجات، زي تصنيف الصور أو التنبؤ بالأسعار.",
  },
  {
    id: 1,
    text: "ب) التعلم الآلي غير المُوجَّه (Unsupervised Learning)",
    isCorrect: false,
    reason:
      "غلط: في غير المُوجَّه البيانات مش معلَّمة والنموذج بيكتشف الأنماط بنفسه (Clustering) زي تجميع العملاء حسب سلوكهم.",
  },
  {
    id: 2,
    text: "ج) التعلم المُعزَّز (Reinforcement Learning)",
    isCorrect: false,
    reason:
      "غلط: التعلم المُعزَّز بيتعلم عن طريق المكافأة والعقوبة (Reward/Penalty) مش عن طريق بيانات مُعَلَّمة.",
  },
  {
    id: 3,
    text: "د) الشبكات العصبية الالتفافية (CNN)",
    isCorrect: false,
    reason:
      "غلط: CNN هي نوع من الشبكات العصبية بُتستخدم في معالجة الصور — هي أداة وليست نوعاً من أنواع التعلم الآلي.",
  },
];

const demoQuestionsLanguages = [
  {
    id: 0,
    text: "A) Supervised Learning",
    isCorrect: true,
    reason:
      "Correct! In supervised learning, the model is trained on labeled data to learn the mapping between inputs and outputs — e.g. image classification or price prediction.",
  },
  {
    id: 1,
    text: "B) Unsupervised Learning",
    isCorrect: false,
    reason:
      "Wrong: Unsupervised learning uses unlabeled data, and the model discovers patterns on its own (like clustering customers by behavior).",
  },
  {
    id: 2,
    text: "C) Reinforcement Learning",
    isCorrect: false,
    reason:
      "Wrong: Reinforcement learning trains an agent via reward and penalty signals, not labeled datasets.",
  },
  {
    id: 3,
    text: "D) Convolutional Neural Networks (CNN)",
    isCorrect: false,
    reason:
      "Wrong: CNN is an architecture (a tool) used in image processing — it is not a category of machine learning paradigm.",
  },
];

const mindmapNodes = [
  {
    num: 1,
    borderColor: "border-[#800B34]/30",
    badgeColor: "text-[#800B34] dark:text-[#FB7185]",
    icon: Cpu,
    titleAr: "أجيال الحاسب",
    titleEn: "Computing Generations",
    descAr: "الجيل الأول (أنابيب مفرغة) → الخامس (شرائح AI)",
    descEn: "1st → 5th gen: vacuum tubes → AI chips",
  },
  {
    num: 2,
    borderColor: "border-[#E8E9ED] dark:border-[#334155]",
    badgeColor: "text-[#12263F] dark:text-white",
    icon: Code2,
    titleAr: "أنواع البيانات",
    titleEn: "Data Types",
    descAr: "منظمة / غير منظمة — الـ 3Vs للبيانات الضخمة",
    descEn: "Structured vs Unstructured — Big Data 3Vs",
  },
  {
    num: 3,
    borderColor: "border-[#E8E9ED] dark:border-[#334155]",
    badgeColor: "text-[#12263F] dark:text-white",
    icon: Brain,
    titleAr: "الحوسبة السحابية والـ IoT",
    titleEn: "Cloud & IoT",
    descAr: "نماذج الخدمة SaaS/PaaS/IaaS + الأجهزة الذكية",
    descEn: "SaaS / PaaS / IaaS + connected smart devices",
  },
  {
    num: 4,
    borderColor: "border-[#D97706]/40",
    badgeColor: "text-[#D97706] dark:text-[#FBBF24]",
    icon: ShieldCheck,
    titleAr: "تكات الامتحان",
    titleEn: "Exam Hot Spots",
    descAr: "أخلاقيات AI — الفجوة الرقمية — جرائم الكمبيوتر",
    descEn: "AI ethics — digital divide — cybercrime types",
  },
];

const tabList = [
  { id: "zatona" as const, labelAr: "كبسولة الزتونة", labelEn: "Quick Capsule", icon: BookmarkCheck },
  { id: "questions" as const, labelAr: "تفسير كل اختيار", labelEn: "Explain Every Option", icon: CheckSquare },
  { id: "mistakes" as const, labelAr: "كشكول غلطاتي", labelEn: "My Mistakes Book", icon: RotateCcw },
  { id: "mindmap" as const, labelAr: "الخرائط الذهنية", labelEn: "Mind Map", icon: Network },
];

// ──────────────────────────────────────────────────────────────────────────────

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<"zatona" | "questions" | "mistakes" | "mindmap">("zatona");
  const [track, setTrack] = useState<"arabic" | "languages">("arabic");
  const [selectedDemoOption, setSelectedDemoOption] = useState<number | null>(null);

  const isLang = track === "languages";
  const demoQuestions = isLang ? demoQuestionsLanguages : demoQuestionsArabic;

  const handleTabChange = (id: typeof activeTab) => {
    setActiveTab(id);
    setSelectedDemoOption(null);
  };

  return (
    <section
      id="demo"
      className="py-20 sm:py-24 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">

        {/* ── Section Header ── */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#800B34]/10 border border-[#800B34]/20 text-[#800B34] dark:text-[#FB7185] text-xs font-bold mb-2">
            🎓 مسار الهندسة وعلوم الحاسب
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#12263F] dark:text-white leading-tight tracking-tight">
            جرّب الخلاصة بنفسك وشوف الفرق
          </h2>
          <p className="text-base text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            دوس على أي تبويب وشوف إزاي منهج البكالوريا بيتحول لمعلومة واضحة
            تثبت في دماغك — مش حفظ ببغاوي، فهم حقيقي.
          </p>
        </div>

        {/* ── Track Toggle ── */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => { setTrack("arabic"); setSelectedDemoOption(null); }}
            className={`h-10 px-5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
              track === "arabic"
                ? "bg-[#091B40] text-white border-[#091B40] shadow-sm"
                : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E8E9ED] dark:border-[#334155] hover:border-[#091B40]/40"
            }`}
          >
            🇪🇬 بكالوريا عربي
          </button>
          <button
            type="button"
            onClick={() => { setTrack("languages"); setSelectedDemoOption(null); }}
            className={`h-10 px-5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
              track === "languages"
                ? "bg-[#091B40] text-white border-[#091B40] shadow-sm"
                : "bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E8E9ED] dark:border-[#334155] hover:border-[#091B40]/40"
            }`}
          >
            🌍 بكالوريا لغات
          </button>
        </div>

        {/* ── Tab Bar ── */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center justify-center gap-2 min-w-max mx-auto p-1.5 rounded-2xl bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155]">
            {tabList.map(({ id, labelAr, labelEn, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                className={`h-11 px-4 sm:px-5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === id
                    ? "bg-[#800B34] text-white shadow-xs"
                    : "bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.8} />
                <span>{isLang ? labelEn : labelAr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            Tab 1: كبسولة الزتونة — Engineering Track CS content
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "zatona" && (
          <div
            dir={isLang ? "ltr" : "rtl"}
            className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E9ED] dark:border-[#334155] pb-4">
              <div>
                <span className="text-xs font-semibold text-[#800B34] dark:text-[#FB7185] block">
                  {isLang
                    ? "Live sample • Computer Science & AI — Engineering Track"
                    : "عينة حية من كبسولة الزتونة • برمجة وذكاء اصطناعي — مسار الهندسة"}
                </span>
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  {isLang
                    ? "Machine Learning vs Deep Learning"
                    : "الفرق بين التعلم الآلي والتعلم العميق"}
                </h3>
              </div>
              <span className="text-xs font-semibold bg-[#F7F8FA] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] px-3 py-1.5 rounded-lg border border-[#E8E9ED] dark:border-[#334155] shrink-0 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <span>{isLang ? "Read: 3 min" : "زمن القراءة: ٣ دقائق"}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Concept Box */}
              <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-2">
                <span className="text-xs font-bold text-[#800B34] dark:text-[#FB7185] flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  {isLang ? "The Core Idea:" : "الفكرة ببساطة:"}
                </span>
                <p className="text-sm text-[#12263F] dark:text-[#F8FAFC] leading-relaxed font-normal">
                  {isLang ? (
                    <>
                      <strong>Machine Learning</strong> teaches a computer to learn from data
                      using algorithms (decision trees, SVMs, regression).{" "}
                      <strong>Deep Learning</strong> is a subset of ML using multi-layered neural
                      networks — excels at unstructured data like images and speech.
                    </>
                  ) : (
                    <>
                      <strong>التعلم الآلي (ML)</strong> هو تعليم الكمبيوتر يتعلم من البيانات
                      باستخدام خوارزميات (شجرة القرار، SVM، الانحدار الخطي...).{" "}
                      <strong>التعلم العميق (DL)</strong> هو فرع منه بيستخدم شبكات عصبية متعددة
                      الطبقات ويتميز في البيانات غير المنظمة زي الصور والكلام.
                    </>
                  )}
                </p>
              </div>

              {/* Exam Trap Box */}
              <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#D97706]/40 space-y-2">
                <span className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                  {isLang ? "Exam Trap — appears every year:" : "تكة امتحان بتتكرر كل سنة:"}
                </span>
                <p className="text-sm text-[#12263F] dark:text-[#F8FAFC] leading-relaxed font-normal">
                  {isLang
                    ? "Every Deep Learning model IS a Machine Learning model, but NOT every ML model is Deep Learning. This hierarchy is a classic exam trap — always check: \"Is it asking about the broader field or the neural-network subset?\""
                    : "كل نموذج Deep Learning هو ML، بس مش كل ML هو Deep Learning. الامتحانات بتحب تعمل فخ في هذه العلاقة — اسأل نفسك دايماً: السؤال عن المجال الأوسع ولا عن الشبكات العصبية تحديداً؟"}
                </p>
              </div>
            </div>

            {/* Pre-exam Checklist */}
            <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-3">
              <span className="text-xs font-bold text-[#059669] dark:text-[#34D399] block">
                {isLang
                  ? "Make sure you can answer these before the exam:"
                  : "أكد إنك مظبط النقطتين دول قبل الامتحان:"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#12263F] dark:text-[#F8FAFC] font-medium">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <span>
                    {isLang
                      ? "The 3 ML types (Supervised / Unsupervised / Reinforcement) with real examples"
                      : "الفرق بين الثلاث أنواع: موجَّه / غير موجَّه / معزَّز مع أمثلة حقيقية"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <span>
                    {isLang
                      ? "Why Deep Learning needs large datasets and high compute power"
                      : "ليه التعلم العميق محتاج بيانات كتير وقوة حوسبة عالية (GPU)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Tab 2: تفسير كل اختيار — Interactive MCQ
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "questions" && (
          <div
            dir={isLang ? "ltr" : "rtl"}
            className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6"
          >
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#800B34] dark:text-[#FB7185] block">
                {isLang
                  ? "Real Baccalaureate exam question — tap an answer to see why:"
                  : "سؤال من امتحانات البكالوريا — دوس على إجابة وشوف السبب:"}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#12263F] dark:text-white leading-relaxed">
                {isLang
                  ? "Which type of machine learning requires a labeled training dataset to learn a mapping from inputs to outputs?"
                  : "أي أنواع التعلم الآلي يحتاج إلى مجموعة بيانات تدريب مُعَلَّمة (Labeled) لتعلّم العلاقة بين المدخلات والمخرجات؟"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoQuestions.map((opt) => {
                const isSelected = selectedDemoOption === opt.id;
                let optionStyle =
                  "bg-[#F7F8FA] dark:bg-[#0F172A] border-[#E8E9ED] dark:border-[#334155] hover:border-[#800B34]/40";

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
                    className={`p-4 rounded-xl border text-xs sm:text-sm ${
                      isLang ? "text-left" : "text-right"
                    } transition-colors flex flex-col justify-between space-y-3 cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
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

            {selectedDemoOption !== null && (
              <div className={`flex ${isLang ? "justify-start" : "justify-end"}`}>
                <button
                  type="button"
                  onClick={() => setSelectedDemoOption(null)}
                  className="text-xs text-[#64748B] dark:text-[#94A3B8] hover:text-[#800B34] dark:hover:text-[#FB7185] font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isLang ? "Reset" : "إعادة المحاولة"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Tab 3: كشكول غلطاتي
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "mistakes" && (
          <div
            dir={isLang ? "ltr" : "rtl"}
            className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E9ED] dark:border-[#334155] pb-4">
              <div>
                <span className="text-xs font-semibold text-[#800B34] dark:text-[#FB7185] block">
                  {isLang ? "Your smartest study tool" : "ركن المذاكرة الأكثر فاعلية"}
                </span>
                <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                  {isLang ? "Smart Mistakes Journal" : "كشكول أخطاءك الذكي («غلطاتي»)"}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#800B34] dark:text-[#FB7185] bg-[#800B34]/10 px-3 py-1 rounded-full border border-[#800B34]/20">
                  {isLang ? "Needs review" : "سؤال محتاج تراجعه"}
                </span>
                <span className="text-xs font-semibold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 px-3 py-1 rounded-full border border-[#059669]/20">
                  {isLang ? "92% mastery" : "٩٢٪ معدل الإتقان"}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-medium text-[#64748B]">
                  {isLang
                    ? "Question you got wrong — Unit 3: AI & Machine Learning"
                    : "سؤال غلطت فيه — الوحدة ٣: الذكاء الاصطناعي وتعلم الآلة"}
                </span>
                <span className="text-xs font-semibold text-[#800B34] dark:text-[#FB7185]">
                  {isLang ? "Rescheduled for review" : "معاد جدولته للمراجعة"}
                </span>
              </div>
              <p className="text-sm font-bold text-[#12263F] dark:text-white">
                {isLang
                  ? "What is the main difference between a neural network's training phase and inference phase?"
                  : "ما الفرق الرئيسي بين مرحلة تدريب الشبكة العصبية (Training) ومرحلة الاستدلال (Inference)؟"}
              </p>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] text-xs text-[#12263F] dark:text-[#F8FAFC] leading-relaxed">
                <span className="font-bold text-[#800B34] dark:text-[#FB7185]">
                  {isLang ? "Why this answer? " : "ليه الإجابة دي؟ "}
                </span>
                {isLang
                  ? "During training, the network adjusts millions of weights using backpropagation and gradient descent. During inference, the weights are frozen — the model simply predicts with no learning."
                  : "في التدريب، الشبكة بتعدّل الأوزان (Weights) باستخدام الانتشار العكسي (Backpropagation). في الاستدلال، الأوزان ثابتة والنموذج بيتنبأ فقط بدون تعلم."}
              </div>
              <div className={`flex items-center pt-1 ${isLang ? "justify-start" : "justify-end"}`}>
                <Link
                  href="/mistakes"
                  className="h-10 px-4 rounded-xl bg-[#800B34] text-white text-xs font-bold hover:bg-[#680829] flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>
                    {isLang ? "Open your full mistakes book" : "افتح ركن غلطاتك كامل"}
                  </span>
                  <ArrowLeft
                    className={`w-3.5 h-3.5 ${isLang ? "rotate-180" : ""}`}
                  />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Tab 4: الخرائط الذهنية — Engineering Track Unit 1
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "mindmap" && (
          <div
            dir={isLang ? "ltr" : "rtl"}
            className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs space-y-6"
          >
            <div className={`space-y-1 ${isLang ? "text-left" : "text-center"}`}>
              <span className="text-xs font-semibold text-[#800B34] dark:text-[#FB7185] block">
                {isLang ? "Visual concept map — Engineering Track" : "العلاقات المفاهيمية البصرية — مسار الهندسة"}
              </span>
              <h3 className="text-xl font-bold text-[#12263F] dark:text-white">
                {isLang
                  ? "Unit 1 — IT Evolution & Societal Impact"
                  : "الوحدة ١ — تطور تكنولوجيا المعلومات وتأثيرها المجتمعي"}
              </h3>
            </div>

            <div className="p-6 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {mindmapNodes.map(({ num, borderColor, badgeColor, icon: Icon, titleAr, titleEn, descAr, descEn }) => (
                <div
                  key={num}
                  className={`p-4 rounded-xl bg-white dark:bg-[#1E293B] border ${borderColor} shadow-xs ${
                    isLang ? "text-left" : "text-right"
                  } space-y-1.5`}
                >
                  <span className={`text-xs font-bold flex items-center gap-1 ${badgeColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{num}.</span>
                  </span>
                  <h4 className="text-sm font-bold text-[#12263F] dark:text-white">
                    {isLang ? titleEn : titleAr}
                  </h4>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {isLang ? descEn : descAr}
                  </p>
                </div>
              ))}
            </div>

            <p className={`text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal ${isLang ? "text-left" : "text-center"}`}>
              {isLang
                ? "The mind map connects all chapter concepts visually — review it in 2 minutes before entering the exam hall."
                : "الخريطة الذهنية بتجمعلك روابط المنهج في عينيك في دقيقتين قبل ما تدخل لجنة الامتحان."}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
