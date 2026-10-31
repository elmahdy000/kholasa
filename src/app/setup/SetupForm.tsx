"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  BookOpen,
  Brain,
  Target,
  BookmarkCheck,
  Flame,
  Clock,
  ArrowRight,
  GraduationCap,
  Languages,
  Check,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { ConfettiCanvas } from "@/components/ui/ConfettiCanvas";

interface AcademicTrack {
  id: string;
  name: string;
  code: string;
}

interface Grade {
  id: string;
  name: string;
  code: string;
  tracks: AcademicTrack[];
}

interface EducationalSystem {
  id: string;
  name: string;
  code: string;
  grades: Grade[];
}

interface SetupFormProps {
  systems: EducationalSystem[];
  userId: string;
  userName?: string | null;
}

const SUPERPOWERS = [
  {
    icon: Sparkles,
    title: "كبسولة الدرس (الزتونة)",
    description: "شرح مركز بيجيبلك المفيد في دقايق، ومن غير رغي ولا تضييع وقت.",
    accent: "from-amber-500/10 to-amber-500/5 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  {
    icon: Brain,
    title: "خريطة ذهنية تلم الدرس",
    description: "رسمة بصرية تفاعلية تفهم منها العلاقات وترتب أفكارك قبل ما تحفظ.",
    accent: "from-blue-500/10 to-blue-500/5 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  {
    icon: Target,
    title: "تدريب فوري مع التفسير",
    description: "حل وجرب إيدك، وهتعرف إجابتك صح ولا لأ فوراً مع الشرح المعتمد.",
    accent: "from-emerald-500/10 to-emerald-500/5 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  {
    icon: BookmarkCheck,
    title: "دفتر أخطائك الذكي",
    description: "أي سؤال يقع منك بيتحفظ لوحده، عشان تراجعه تاني لغاية ما تقفل درجته.",
    accent: "from-rose-500/10 to-rose-500/5 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
];

const DAILY_GOALS = [
  {
    minutes: 15,
    title: "١٥ دقيقة في اليوم",
    subtitle: "على الماشي",
    badge: "بداية خفيفة",
    description: "كبسولة سريعة وسؤال التحدي عشان تفضل إيدك في المادة.",
  },
  {
    minutes: 30,
    title: "٣٠ دقيقة في اليوم",
    subtitle: "المعدل المظبوط",
    badge: "الموصى به",
    description: "الوقت المثالي تلم فيه الشرح وتحل شوية أسئلة تظبط الفهم.",
  },
  {
    minutes: 45,
    title: "٤٥ دقيقة في اليوم",
    subtitle: "لو ناوي تقفل",
    badge: "مستوى متقدم",
    description: "مذاكرة مركزة مع حل اختبارات وامتحانات شاملة على الدروس.",
  },
  {
    minutes: 60,
    title: "ساعة كاملة في اليوم",
    subtitle: "مذاكرة الأبطال",
    badge: "تحدي عالي",
    description: "أعلى درجات الالتزام عشان تكون في صدارة أوائل مدرستك.",
  },
];

export function SetupForm({ systems }: SetupFormProps) {
  const router = useRouter();

  // Active step: 1 (Welcome & Superpowers), 2 (Grade), 3 (Category & Track), 4 (Daily Goal), 5 (Celebration)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Selections
  const [systemId] = useState(systems[0]?.id || "");
  const [gradeId, setGradeId] = useState(systems[0]?.grades[0]?.id || "");
  const [schoolCategory, setSchoolCategory] = useState<"ARABIC" | "LANGUAGES">("ARABIC");
  const [trackId, setTrackId] = useState("");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(30);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedSystem = systems.find((s) => s.id === systemId) || systems[0];
  const availableGrades = selectedSystem?.grades || [];
  const selectedGrade = availableGrades.find((g) => g.id === gradeId);
  const availableTracks = selectedGrade?.tracks || [];
  const requiresTrack = Boolean(selectedGrade && availableTracks.length > 0);

  // If grade requires track and track is not set yet, pick first track by default
  const effectiveTrackId = requiresTrack ? trackId || availableTracks[0]?.id || "" : "";

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId,
          gradeId,
          schoolCategory,
          trackId: requiresTrack ? effectiveTrackId : null,
        }),
      });

      if (res.ok) {
        // Save chosen daily study goal in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("kholasa_daily_goal_minutes", String(dailyGoalMinutes));
        }
        // Advance to celebration step
        setStep(5);
      } else {
        const data = await res.json();
        setError(data.error || "حصلت مشكلة في حفظ البيانات، جرب تاني");
      }
    } catch {
      setError("في مشكلة في الاتصال بالسيرفر، اتأكد من النت وجرب تاني");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchDashboard = () => {
    router.push("/dashboard?tour=true");
  };

  const stepsMeta = [
    { num: 1, title: "مرحباً بيك" },
    { num: 2, title: "سنتك الدراسية" },
    { num: 3, title: "نوع المدرسة" },
    { num: 4, title: "هدفك اليومي" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 text-right font-sans">
      {/* Confetti on celebration step */}
      {step === 5 && <ConfettiCanvas duration={3500} />}

      {/* Stepper Progress Bar (visible on steps 1-4) */}
      {step <= 4 && (
        <div className="space-y-3 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            <span className="flex items-center gap-1.5 text-[#800020] dark:text-[#FB7185]">
              الخطوة {step} من ٤
            </span>
            <span>{stepsMeta[step - 1]?.title}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {stepsMeta.map((s) => {
              const isPast = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isPast
                        ? "bg-[#059669] dark:bg-[#34D399]"
                        : isCurrent
                        ? "bg-[#800020] dark:bg-[#FB7185]"
                        : "bg-[#E2E8F0] dark:bg-[#334155]"
                    }`}
                  />
                  <span
                    className={`hidden sm:block text-[11px] truncate text-center ${
                      isCurrent
                        ? "font-bold text-[#800020] dark:text-[#FB7185]"
                        : isPast
                        ? "text-[#059669] dark:text-[#34D399]"
                        : "text-[#94A3B8]"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: WELCOME & FLAGSHIP SUPERPOWERS
      ───────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <motion.div
          key="step1"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] text-xs font-bold border border-[#800020]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>منور في منصة الخلاصة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
              طريقك الأسهل لمذاكرة البكالوريا
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              مكان معمول مخصوص عشان يظبطلك المذاكرة ويجيبلك المفيد من غير لف ولا تشتيت:
            </p>
          </div>

          {/* 4 Superpower Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {SUPERPOWERS.map((power, idx) => {
              const Icon = power.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border bg-gradient-to-br ${power.accent} flex items-start gap-3.5 transition-all hover:scale-[1.01]`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0F172A] shadow-xs flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-current" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                      {power.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      {power.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full h-12 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>يلا نبدأ نجهز خطتك</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: GRADE SELECTION
      ───────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
              <span>أنت في سنة كام دلوقتي؟</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              اختار سنتك الدراسية عشان نظهرلك المواد والمناهج المعتمدة الخاصة بيك:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {availableGrades.map((grade) => {
              const isSelected = gradeId === grade.id;
              const isG10 = grade.code === "bacc_g10";

              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => {
                    setGradeId(grade.id);
                    setTrackId("");
                  }}
                  className={`p-5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "border-[#800020] dark:border-[#FB7185] bg-[#800020]/5 dark:bg-[#800020]/20 shadow-md ring-2 ring-[#800020]/20"
                      : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-[#800020]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#800020]/10 dark:bg-[#800020]/30 text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-bold text-sm shrink-0 font-mono">
                      {isG10 ? "١٠" : "١١"}
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "border-[#800020] dark:border-[#FB7185] bg-[#800020] dark:bg-[#FB7185] text-white"
                          : "border-[#CBD5E1] dark:border-[#475569]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                      <BidiStatement as="span" text={grade.name} />
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      {isG10
                        ? "الصف الأول الثانوي — سنة عامة وتأسيسية لمواد العلوم والتكنولوجيا واللغات."
                        : "الصف الثاني الثانوي — سنة التخصص واختيار الشعبة (علمي، أدبي، أو حاسب)."}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!gradeId}
              className="px-6 h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-40 cursor-pointer"
            >
              <span>التالي: نوع مدرستك</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 3: SCHOOL CATEGORY & TRACK
      ───────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <motion.div
          key="step3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="space-y-6"
        >
          {/* School Category */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <Languages className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
                <span>بتدرس في مدرسة إيه؟ (لغة المنهج)</span>
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                عشان نفصل المنهج والأسئلة والمصطلحات باللغة اللي بتدرس بيها في مدرستك:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Arabic Schools */}
              <button
                type="button"
                onClick={() => setSchoolCategory("ARABIC")}
                className={`p-4 sm:p-5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  schoolCategory === "ARABIC"
                    ? "border-[#059669] dark:border-[#34D399] bg-[#059669]/5 dark:bg-[#059669]/20 shadow-md ring-2 ring-[#059669]/20"
                    : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-[#059669]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#059669]/10 text-[#059669] dark:text-[#34D399]">
                    عربي
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      schoolCategory === "ARABIC"
                        ? "border-[#059669] bg-[#059669] text-white"
                        : "border-[#CBD5E1] dark:border-[#475569]"
                    }`}
                  >
                    {schoolCategory === "ARABIC" && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                    مدارس عربي
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    الشرح وبنك الأسئلة والمصطلحات كلها باللغة العربية.
                  </p>
                </div>
              </button>

              {/* Languages Schools */}
              <button
                type="button"
                onClick={() => setSchoolCategory("LANGUAGES")}
                className={`p-4 sm:p-5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  schoolCategory === "LANGUAGES"
                    ? "border-[#2563EB] dark:border-[#60A5FA] bg-[#2563EB]/5 dark:bg-[#2563EB]/20 shadow-md ring-2 ring-[#2563EB]/20"
                    : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-[#2563EB]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA]">
                    Languages
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      schoolCategory === "LANGUAGES"
                        ? "border-[#2563EB] bg-[#2563EB] text-white"
                        : "border-[#CBD5E1] dark:border-[#475569]"
                    }`}
                  >
                    {schoolCategory === "LANGUAGES" && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                    مدارس لغات ورسمية
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    المناهج والأسئلة ونماذج الإجابة مجهزة بالإنجليزي.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Academic Track (if Grade 11) */}
          {requiresTrack && (
            <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
              <div className="space-y-1">
                <label className="block text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                  اختار شعبتك (لتانية ثانوي):
                </label>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  عشان نظهرلك المواد الخاصة بتخصصك بس:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableTracks.map((track) => {
                  const isSelected = effectiveTrackId === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setTrackId(track.id)}
                      className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? "border-[#800020] dark:border-[#FB7185] bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] font-bold"
                          : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#334155] dark:text-[#CBD5E1] hover:border-[#800020]/40"
                      }`}
                    >
                      <BidiStatement as="span" text={track.name} className="text-xs truncate" />
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-[#800020] dark:border-[#FB7185] bg-[#800020] dark:bg-[#FB7185] text-white"
                            : "border-[#CBD5E1] dark:border-[#475569]"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>التالي: وقت مذاكرتك اليومي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 4: DAILY STUDY GOAL & STREAK
      ───────────────────────────────────────────────────────────── */}
      {step === 4 && (
        <motion.div
          key="step4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
                ناوي تذاكر كام دقيقة في اليوم؟
              </h2>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              الالتزام كل يوم حتى لو بوقت قليل هو اللي بيفرق في البكالوريا، اختار اللي يناسبك:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {DAILY_GOALS.map((goal) => {
              const isSelected = dailyGoalMinutes === goal.minutes;
              return (
                <button
                  key={goal.minutes}
                  type="button"
                  onClick={() => setDailyGoalMinutes(goal.minutes)}
                  className={`p-4 sm:p-5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? "border-amber-500 dark:border-amber-400 bg-amber-500/5 dark:bg-amber-500/15 shadow-md ring-2 ring-amber-500/20"
                      : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-amber-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                          : "bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]"
                      }`}
                    >
                      {goal.badge}
                    </span>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-[#CBD5E1] dark:border-[#475569]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-[#0F172A] dark:text-white">
                      <span>{goal.title}</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                      {goal.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Motivational Preview Box */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-[#0F172A] dark:text-white">
                شعلة الالتزام اليومي (Streak)
              </div>
              <p className="text-[#64748B] dark:text-[#94A3B8]">
                كل يوم تذاكر فيه وتسجل حضورك، شعلتك بتكبر ونقاطك بتزيد في ترتيب مدرستك.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-6 h-12 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>بنجهز خطتك الدراسية...</span>
                </>
              ) : (
                <>
                  <span>حفظ الخطة ويلا بينا</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 5: CELEBRATION & READY TO GO!
      ───────────────────────────────────────────────────────────── */}
      {step === 5 && (
        <motion.div
          key="step5"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="text-center space-y-6 py-3"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
              كده تمام، كل حاجة جاهزة!
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              ظبطنالك خطتك وموادك وبنك الأسئلة حسب اختياراتك بالضبط، تقدر تبدأ دلوقتي.
            </p>
          </div>

          {/* Tailored Plan Summary Capsule */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-[#334155] max-w-md mx-auto text-xs space-y-3">
            <div className="font-bold text-[#0F172A] dark:text-white pb-2 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
              <span>ملخص اختياراتك</span>
              <span className="text-emerald-600 dark:text-emerald-400">جاهزة ✓</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-right">
              <div className="space-y-0.5">
                <span className="text-[#94A3B8] text-[11px] block">السنة الدراسية:</span>
                <span className="font-bold text-[#0F172A] dark:text-white">
                  {selectedGrade?.name || "شهادة البكالوريا"}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#94A3B8] text-[11px] block">نوع المدرسة:</span>
                <span className="font-bold text-[#0F172A] dark:text-white">
                  {schoolCategory === "ARABIC" ? "مدارس عربي" : "Languages"}
                </span>
              </div>

              {requiresTrack && (
                <div className="space-y-0.5 col-span-2">
                  <span className="text-[#94A3B8] text-[11px] block">الشعبة:</span>
                  <span className="font-bold text-[#0F172A] dark:text-white">
                    {availableTracks.find((t) => t.id === effectiveTrackId)?.name || "عام"}
                  </span>
                </div>
              )}

              <div className="space-y-0.5 col-span-2 pt-1 border-t border-[#E2E8F0] dark:border-[#334155]/60 flex items-center justify-between">
                <span className="text-[#94A3B8] text-[11px]">وقت المذاكرة اليومي:</span>
                <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{dailyGoalMinutes} دقيقة في اليوم</span>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleLaunchDashboard}
              className="w-full h-12 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
            >
              <span>ادخل على لوحة التحكم</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}