"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  GitFork,
  CheckCircle2,
  BookmarkCheck,
  Flame,
  ChevronLeft,
  ChevronRight,
  X,
  Brain,
  Target,
  Trophy,
  Check,
} from "lucide-react";
import { ConfettiCanvas } from "@/components/ui/ConfettiCanvas";

interface ProductTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string | null;
}

interface TourStep {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  previewTitle: string;
  previewHighlights: { icon: React.ElementType; text: string }[];
  tagline: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "capsules",
    badge: "الخطوة ١ من ٥",
    title: "كبسولة الدرس (الزتونة)",
    description:
      "كل درس معمول في كبسولة سريعة تديك المفيد في دقايق، من غير رغي ولا حشو، ومركزة على النقط اللي بتيجي في الامتحان.",
    icon: BookOpen,
    iconColor: "text-[#800B34] dark:text-[#FB7185]",
    iconBg: "bg-[#800B34]/10 dark:bg-[#800B34]/25",
    previewTitle: "كبسولة الدرس بتوفرلك إيه؟",
    previewHighlights: [
      { icon: Sparkles, text: "شرح مباشر وسريع لكل فكرة في الدرس" },
      { icon: Target, text: "تكات الامتحانات وأكتر الأسئلة اللي بتكرر" },
      { icon: CheckCircle2, text: "المصطلحات المهمة مترجمة ومتلخصة" },
    ],
    tagline: "وفر وقتك وافهم الزتونة في دقايق",
  },
  {
    id: "mindmaps",
    badge: "الخطوة ٢ من ٥",
    title: "الخرائط الذهنية",
    description:
      "انسى الحفظ الصم! الخريطة بتلم أفكار الدرس كله في شاشة واحدة تفاعلية، تكبر وتصغر وتربط النقط ببعضها عشان متنساش.",
    icon: Brain,
    iconColor: "text-[#2563EB] dark:text-[#60A5FA]",
    iconBg: "bg-[#2563EB]/10 dark:bg-[#2563EB]/25",
    previewTitle: "الخريطة هتفيدك في إيه؟",
    previewHighlights: [
      { icon: GitFork, text: "بتشوف الدرس كله مترتب قدام عينك" },
      { icon: Sparkles, text: "سهل تكبر وتشوف تفاصيل كل فرع" },
      { icon: CheckCircle2, text: "المعلومة بتثبت في الذاكرة ومبتطيرش" },
    ],
    tagline: "افهم الصورة الكاملة للدرس الأول",
  },
  {
    id: "questions",
    badge: "الخطوة ٣ من ٥",
    title: "بنك الأسئلة والتدريبات",
    description:
      "حل واتدرب على كل درس براحتك؛ أسئلة اختيار من متعدد ومقالي، وهتعرف إجابتك صح ولا غلط فوراً مع التفسير المعتمد.",
    icon: Target,
    iconColor: "text-[#059669] dark:text-[#34D399]",
    iconBg: "bg-[#059669]/10 dark:bg-[#059669]/25",
    previewTitle: "نظام التدريب الذكي:",
    previewHighlights: [
      { icon: CheckCircle2, text: "تصحيح فوري وتفسير كامل للإجابة الصح" },
      { icon: Sparkles, text: "إجابات نموذجية وطريقة التوزيع للأسئلة المقالية" },
      { icon: Target, text: "أسئلة متدرجة من البسيط لحد المستويات العليا" },
    ],
    tagline: "اتدرب كأنك جوه لجنة الامتحان بالضبط",
  },
  {
    id: "mistakes",
    badge: "الخطوة ٤ من ٥",
    title: "مراجعة لأخطائي",
    description:
      "أي سؤال تغلط فيه وإنت بتحل بيتحفظ لوحده هنا، عشان ترجعله بعدين وتفهمه لحد ما تقفله.",
    icon: BookmarkCheck,
    iconColor: "text-[#D97706] dark:text-[#FBBF24]",
    iconBg: "bg-[#D97706]/10 dark:bg-[#D97706]/25",
    previewTitle: "ليه صفحة مراجعة لأخطائي مهمة؟",
    previewHighlights: [
      { icon: CheckCircle2, text: "بيعرفك إنت بتغلط في إيه من غير ما تدور" },
      { icon: Sparkles, text: "تقدر تعيد السؤال وتفهم السبب علطول" },
      { icon: Target, text: "مراجعة مركزة تفكرك بأفكار الأسئلة قبل الامتحان" },
    ],
    tagline: "كل غلطة بتراجعها دلوقتي بتوفر عليك درجة في الامتحان",
  },
  {
    id: "streak",
    badge: "الخطوة ٥ من ٥",
    title: "التحدي اليومي وسلسلة المذاكرة",
    description:
      "سؤال واحد خفيف كل يوم يخليك فايق ومتابع، ويحافظ على شعلة التزامك (Streak) عشان تعلى في الترتيب بين زمايلك.",
    icon: Flame,
    iconColor: "text-[#E11D48] dark:text-[#FB7185]",
    iconBg: "bg-[#E11D48]/10 dark:bg-[#E11D48]/25",
    previewTitle: "إزاي تكسب نقاط التحدي؟",
    previewHighlights: [
      { icon: Flame, text: "حل سؤال التحدي كل يوم وحافظ على شعلتك" },
      { icon: Trophy, text: "اجمع نقاط ترفع اسمك في لوحة الأوائل" },
      { icon: Sparkles, text: "أوسمة وشارات تشجيع للملتزمين" },
    ],
    tagline: "الاستمرار البسيط كل يوم هو سر التقفيل",
  },
];

export function ProductTourModal({ isOpen, onClose, userName }: ProductTourModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const step = TOUR_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setShowCelebration(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (isLast) {
      // Complete tour
      setShowCelebration(true);
      setTimeout(() => {
        if (typeof window !== "undefined") {
          localStorage.setItem("kholasa_tour_completed", "true");
        }
        onClose();
      }, 1800);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kholasa_tour_completed", "true");
    }
    onClose();
  };

  if (!isOpen) return null;

  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans text-right select-none">
        {showCelebration && <ConfettiCanvas duration={2500} />}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-3xl border border-[#E2E8F0] dark:border-[#334155] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative"
        >
          {/* Top Bar with Dismiss */}
          <div className="p-4 sm:p-5 border-b border-[#F1F5F9] dark:border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#800B34] dark:bg-[#FB7185]" />
              <span className="text-xs sm:text-[13px] font-bold text-[#800B34] dark:text-[#FB7185]">
                جولة سريعة في المنصة
              </span>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-5 sm:space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Header Section */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${step.iconBg} ${step.iconColor} flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    <StepIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
                      {step.badge}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white leading-tight">
                      {step.title}
                    </h2>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  {step.description}
                </p>

                {/* Interactive Visual Preview Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]/80 space-y-3">
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" />
                    <span>{step.previewTitle}</span>
                  </div>

                  <div className="space-y-2">
                    {step.previewHighlights.map((item, idx) => {
                      const ItemIcon = item.icon;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 text-xs text-[#334155] dark:text-[#CBD5E1]"
                        >
                          <ItemIcon className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0" />
                          <span>{item.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155]/60 text-[11px] font-bold text-[#800B34] dark:text-[#FB7185]">
                    {step.tagline}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stepper Footer */}
          <div className="p-4 sm:p-5 border-t border-[#F1F5F9] dark:border-[#1E293B] flex items-center justify-between gap-3 bg-[#FAFAFA] dark:bg-[#0B1120]">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? "w-6 bg-[#800B34] dark:bg-[#FB7185]"
                      : "w-2 bg-[#CBD5E1] dark:bg-[#475569] hover:bg-[#94A3B8]"
                  }`}
                  aria-label={`الخطوة ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98 ${
                  isLast
                    ? "bg-[#059669] hover:bg-[#047857]"
                    : "bg-[#800B34] hover:bg-[#680829]"
                }`}
              >
                {isLast ? (
                  <>
                    <span>يلا نبدأ المذاكرة</span>
                    <Check className="w-4 h-4 stroke-[3]" />
                  </>
                ) : (
                  <>
                    <span>التالي</span>
                    <ChevronLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
