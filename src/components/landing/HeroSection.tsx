"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Cpu,
  ShieldCheck,
  Code2,
  Brain,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Layers,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

const HERO_CHALLENGES = {
  arabic: {
    unitBadge: "الوحدة ١ • معمارية الحاسوب ودورة المعالج (FDE Cycle)",
    question:
      "أثناء دورة الجلب (Fetch) داخل المعالج CPU، أي سجل يحمل عنوان التعليمة التالية ويزداد تلقائياً بمقدار +1؟",
    options: [
      {
        id: 0,
        label: "عداد البرنامج (Program Counter - PC)",
        isCorrect: true,
        feedback:
          "إجابة ممتازة! عداد البرنامج PC بيشيل عنوان التعليمة الجاية، وأول ما تتسحب للـ MAR بيزيد +1 فوراً.",
      },
      {
        id: 1,
        label: "سجل بيانات الذاكرة (MDR)",
        isCorrect: false,
        feedback:
          "ركز يا بطل: الـ MDR بيشيل البيانات نفسها اللي رايحة أو جاية من الـ RAM، مش عنوان التعليمة التالية.",
      },
      {
        id: 2,
        label: "المركم (Accumulator - ACC)",
        isCorrect: false,
        feedback:
          "الـ Accumulator وظيفته يحفظ نواتج العمليات الحسابية والمنطقية اللي بتطلع من وحدة الـ ALU.",
      },
    ],
    capsuleTitle: "زتونة المقارنة السريعة: Stack vs Heap في C++",
    capsulePoints: [
      {
        tag: "Stack Memory",
        desc: "حجز تلقائي سريع جداً (LIFO) للمتغيرات المحلية، وبيتمسح لوحده أول ما الدالة تخلص.",
      },
      {
        tag: "Heap Memory",
        desc: "حجز ديناميكي وقت التشغيل (Runtime) باستخدام new، ولازم تحرره بـ delete عشان تمنع الـ Memory Leak.",
      },
    ],
  },
  languages: {
    unitBadge: "Unit 1 • CPU Architecture & Fetch-Decode-Execute",
    question:
      "During the CPU Fetch phase, which register holds the memory address of the NEXT instruction and increments by +1?",
    options: [
      {
        id: 0,
        label: "Program Counter (PC)",
        isCorrect: true,
        feedback:
          "Spot on! The Program Counter (PC) tracks the next instruction's address and auto-increments by +1 during Fetch.",
      },
      {
        id: 1,
        label: "Memory Data Register (MDR)",
        isCorrect: false,
        feedback:
          "Careful: MDR holds the actual data/instruction fetched from RAM, not the next instruction's address.",
      },
      {
        id: 2,
        label: "Accumulator (ACC)",
        isCorrect: false,
        feedback:
          "The Accumulator stores immediate arithmetic and logic results computed by the ALU.",
      },
    ],
    capsuleTitle: "30-Sec Capsule: Stack vs. Heap Allocation",
    capsulePoints: [
      {
        tag: "Stack Memory",
        desc: "Fast, automatic LIFO allocation for local variables; freed automatically when the function returns.",
      },
      {
        tag: "Heap Memory",
        desc: "Dynamic runtime allocation via new/malloc; must be explicitly freed with delete to prevent memory leaks.",
      },
    ],
  },
};

const INTERNAL_TOPICS = [
  { icon: Cpu, label: "معمارية فون نيومان ودورة FDE" },
  { icon: Brain, label: "الذكاء الاصطناعي والشبكات العصبية" },
  { icon: ShieldCheck, label: "الأمن السيبراني و CIA Triad والتشفير" },
  { icon: Layers, label: "معمارية الويب و CRAP & PDCA" },
  { icon: Code2, label: "برمجة C++ والـ Pointers و Big-O" },
];

export function HeroSection() {
  const [heroTrack, setHeroTrack] = useState<"arabic" | "languages">("arabic");
  const [heroMode, setHeroMode] = useState<"quiz" | "capsule">("quiz");
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const activeData = HERO_CHALLENGES[heroTrack];
  const isLang = heroTrack === "languages";

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Right Column — Enthusiastic Student Value Proposition (7 cols) */}
          <div className="lg:col-span-7 text-right space-y-6">
            {/* 1) Top Identity Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] text-xs font-bold text-[#800B34] dark:text-[#FB7185] shadow-xs">
              <BrandLogo variant="icon" size="xs" glow={false} />
              <span>
                الخلاصة للبكالوريا — مسار الهندسة وعلوم الحاسب (بكالوريا عربي وبكالوريا لغات)
              </span>
            </div>

            {/* 2) High-Impact Motivating Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-extrabold text-[#12263F] dark:text-white leading-[1.22] tracking-tight">
                منهج البكالوريا ومسار الهندسة في جيبك..
                <br />
                <span className="text-[#800B34] dark:text-[#FB7185] inline-block mt-1">
                  افهم بذكاء، راجع في دقايق، وقفّل الامتحان بثقة
                </span>
              </h1>
            </div>

            {/* 3) How El-Kholasa Helps the Student */}
            <p className="text-base sm:text-lg text-[#475569] dark:text-[#94A3B8] leading-relaxed max-w-2xl font-normal">
              إزاي <strong className="text-[#12263F] dark:text-white font-bold">الخلاصة للبكالوريا</strong> هتفرق معاك؟ بدل التشتت في ملازم معقدة وفيديوهات بالساعات، فكّكنالك منهج البرمجة وعلوم الحاسب والذكاء الاصطناعي بالكامل لكبسولات زتونة سريعة، خرائط ذهنية بتربط الأفكار، وبنك أسئلة تفاعلي بيشرحلك ليه كل اختيار صح أو غلط عشان تدخل اللجنة فاهم كل تكة.
            </p>

            {/* 4) Real Curriculum Topics Strip */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-[#800B34] dark:text-[#FB7185] block">
                مواضيع حقيقية من الشرح الداخلي على المنصة:
              </span>
              <div className="flex flex-wrap gap-2">
                {INTERNAL_TOPICS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] text-xs font-bold text-[#12263F] dark:text-[#F8FAFC]"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#800B34] dark:text-[#FB7185] shrink-0" />
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 5) Action CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/login"
                className="h-12 px-7 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-sm font-bold flex items-center gap-2.5 transition-all shadow-xs active:scale-[0.99]"
              >
                <span>ابدأ مذاكرتك بكود الطالب</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <Link
                href="/exams/builder"
                className="h-12 px-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] text-[#12263F] dark:text-white text-sm font-bold flex items-center gap-2 hover:border-[#800B34] hover:text-[#800B34] dark:hover:border-[#FB7185] dark:hover:text-[#FB7185] transition-colors active:scale-[0.99] shadow-xs"
              >
                <Target className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" strokeWidth={2} />
                <span>اختبر نفسك في مسار الهندسة</span>
              </Link>
            </div>

            {/* 6) Trust Line */}
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] pt-1 font-medium">
              منهج البكالوريا المصرية المعتمد (أولى وتانية بكالوريا • مسار الهندسة وعلوم الحاسب) • بإشراف Dr/Elmahdy
            </p>
          </div>

          {/* Left Column — Live Interactive Student Widget (No Cheesy Stock Photos!) (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#E8E9ED] dark:border-[#334155] bg-[#F7F8FA] dark:bg-[#1E293B] p-4 sm:p-5 shadow-md space-y-4">
              {/* Top Widget Bar: Track Switcher + Mode Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8E9ED] dark:border-[#334155]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                  <span className="text-xs font-extrabold text-[#12263F] dark:text-white">
                    تفاعل حي من داخل الدرس
                  </span>
                </div>

                {/* Track Toggle: بكالوريا عربي | بكالوريا لغات */}
                <div className="inline-flex p-1 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155]">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroTrack("arabic");
                      setSelectedOpt(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      heroTrack === "arabic"
                        ? "bg-[#091B40] text-white"
                        : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F]"
                    }`}
                  >
                    بكالوريا عربي
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroTrack("languages");
                      setSelectedOpt(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      heroTrack === "languages"
                        ? "bg-[#091B40] text-white"
                        : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F]"
                    }`}
                  >
                    بكالوريا لغات
                  </button>
                </div>
              </div>

              {/* Sub-mode Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHeroMode("quiz")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    heroMode === "quiz"
                      ? "bg-[#800B34] text-white border-[#800B34]"
                      : "bg-white dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] border-[#E8E9ED] dark:border-[#334155]"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>سؤال تفاعلي سريع</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeroMode("capsule")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    heroMode === "capsule"
                      ? "bg-[#800B34] text-white border-[#800B34]"
                      : "bg-white dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] border-[#E8E9ED] dark:border-[#334155]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>كبسولة مقارنة (30 ث)</span>
                </button>
              </div>

              {/* Interactive Body */}
              <div
                dir={isLang ? "ltr" : "rtl"}
                className={`rounded-xl bg-white dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] p-4 space-y-3.5 ${
                  isLang ? "text-left" : "text-right"
                }`}
              >
                <span className="inline-block text-[11px] font-bold text-[#800B34] dark:text-[#FB7185] bg-[#800B34]/8 dark:bg-[#FB7185]/10 px-2.5 py-1 rounded-lg">
                  {activeData.unitBadge}
                </span>

                {heroMode === "quiz" ? (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm font-bold text-[#12263F] dark:text-white leading-relaxed">
                      {activeData.question}
                    </p>

                    <div className="space-y-2">
                      {activeData.options.map((opt) => {
                        const isPicked = selectedOpt === opt.id;
                        let style =
                          "bg-[#F7F8FA] dark:bg-[#1E293B] border-[#E8E9ED] dark:border-[#334155] hover:border-[#800B34]/40";
                        if (selectedOpt !== null) {
                          if (opt.isCorrect) {
                            style =
                              "bg-[#059669]/10 border-[#059669] text-[#059669] dark:text-[#34D399]";
                          } else if (isPicked) {
                            style =
                              "bg-[#DC2626]/10 border-[#DC2626] text-[#DC2626] dark:text-[#F87171]";
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSelectedOpt(opt.id)}
                            className={`w-full p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                              isLang ? "text-left" : "text-right"
                            } ${style}`}
                          >
                            <span className="text-[#12263F] dark:text-white">
                              {opt.label}
                            </span>
                            {selectedOpt !== null && opt.isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                            )}
                            {selectedOpt !== null && isPicked && !opt.isCorrect && (
                              <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedOpt !== null && (
                      <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] text-xs leading-relaxed text-[#12263F] dark:text-[#F8FAFC]">
                        {activeData.options[selectedOpt]?.feedback}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#12263F] dark:text-white">
                      {activeData.capsuleTitle}
                    </h3>
                    <div className="space-y-2.5">
                      {activeData.capsulePoints.map((pt) => (
                        <div
                          key={pt.tag}
                          className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] space-y-1"
                        >
                          <span className="font-mono text-xs font-extrabold text-[#800B34] dark:text-[#FB7185] block">
                            {pt.tag}
                          </span>
                          <p className="text-xs text-[#12263F] dark:text-[#F8FAFC] leading-relaxed">
                            {pt.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom reassurance footer inside widget */}
              <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] px-1">
                <span>دوس على أي اختيار وجرب التفسير الفوري</span>
                <Link
                  href="#demo"
                  className="font-bold text-[#800B34] dark:text-[#FB7185] hover:underline"
                >
                  استكشف باقي الأدوات ↓
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
