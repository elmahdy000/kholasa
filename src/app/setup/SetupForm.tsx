"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Brain,
  Target,
  BookmarkCheck,
  Flame,
  Clock,
  Rocket,
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
    title: "كبسولات مكثفة للدروس",
    description: "شرح مبسط ومكثف بدون حشو، مركز على نقاط الامتحانات والمفاهيم الجوهرية.",
    accent: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    icon: Brain,
    title: "خرائط ذهنية تفاعلية",
    description: "تلخيص بصري يربط عناصر الدرس في شاشة واحدة لتثبيت العلاقات بالذاكرة.",
    accent: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    icon: Target,
    title: "بنك تدريبات وتصحيح ذكي",
    description: "تدريبات مقننة بنماذج إجابة رسمية وتفسير تفصيلي لكل خيار.",
    accent: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    icon: BookmarkCheck,
    title: "دفتر الأخطاء التلقائي",
    description: "كل سؤال تخطئ فيه يُحفظ تلقائياً لتتدرب عليه مجدداً حتى تتقنه تماماً.",
    accent: "from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
];

const DAILY_GOALS = [
  {
    minutes: 15,
    title: "١٥ دقيقة / يومياً",
    subtitle: "انطلاقة سريعة وخفيفة",
    badge: "بداية سهلة 🚀",
    description: "حل كبسولة درس وسؤال التحدي اليومي لضمان الاستمرارية بدون إرهاق.",
  },
  {
    minutes: 30,
    title: "٣٠ دقيقة / يومياً",
    subtitle: "المعدل الموصى به",
    badge: "الأكثر شيوعاً ⭐",
    description: "التوازن المثالي بين دراسة المفاهيم وحل تدريبات بنك الأسئلة ومراجعة الأخطاء.",
  },
  {
    minutes: 45,
    title: "٤٥ دقيقة / يومياً",
    subtitle: "طموح الدرجات النهائية",
    badge: "متقدم 🔥",
    description: "مذاكرة متعمقة مع حل امتحانات واختبارات قياس مستوى شاملة.",
  },
  {
    minutes: 60,
    title: "٦٠ دقيقة / يومياً",
    subtitle: "بطل البكالوريا",
    badge: "تحدي الأبطال 🏆",
    description: "أقصى درجات التركيز والتفوق لضمان الصدارة في المدارس وعلى مستوى الجمهورية.",
  },
];

export function SetupForm({ systems, userName }: SetupFormProps) {
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
        setError(data.error || "تعذر حفظ البيانات، حاول مرة أخرى");
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم، تأكد من الاتصال وجرب مجددًا");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchDashboard = () => {
    router.push("/dashboard?tour=true");
  };

  const stepsMeta = [
    { num: 1, title: "مرحباً بك" },
    { num: 2, title: "الصف الدراسي" },
    { num: 3, title: "نوع المدرسة" },
    { num: 4, title: "الهدف اليومي" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 text-right font-sans">
      {/* Confetti on celebration step */}
      {step === 5 && <ConfettiCanvas duration={4000} />}

      {/* Stepper Progress Bar (visible on steps 1-4) */}
      {step <= 4 && (
        <div className="space-y-3 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center justify-between text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            <span className="flex items-center gap-1.5 text-[#800020] dark:text-[#FB7185]">
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] text-xs font-bold border border-[#800020]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>منصة الخلاصة التعليمية الذكية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
              طريقك المختصر للتفوق في البكالوريا
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              صممنا لك تجربة دراسية استثنائية تختصر وقتك وتضاعف استيعابك من خلال ٤ مزايا حصرية:
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
            <span>ابدأ تخصيص خطتك الدراسية</span>
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
              <span>اختر صفك الدراسي الحالي</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              نظام البكالوريا المصرية يغطي الصفين الأول والثاني الثانوي بمناهج معتمدة ومطابقة لمواصفات الوزارة.
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
                    <div className="w-10 h-10 rounded-xl bg-[#800020]/10 dark:bg-[#800020]/30 text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-bold text-sm shrink-0">
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
                        ? "الصف الأول الثانوي — منهج عام تأسيسي لمواد العلوم والتكنولوجيا واللغات."
                        : "الصف الثاني الثانوي — يتضمن المسارات التخصصية (علمي، أدبي، وحاسب)."}
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
              <span>التالي: نوع المدرسة</span>
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
                <span>اختر نوع مدرستك (لغة المنهج)</span>
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                يضمن هذا الخيار عزل المنهج وبنك الأسئلة والمصطلحات بدقة تامة طبقاً للغة دراستك.
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
                    مدارس عربي (Arabic Schools)
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    الشرح وبنك الأسئلة والتفسيرات باللغة العربية مع إيضاح المصطلحات.
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
                    مدارس لغات ورسمية (Languages)
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    Curriculum, questions, and model answers are tailored in English.
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
                  الشعبة أو المسار التخصصي (للصف الثاني الثانوي)
                </label>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  اختر مسارك لتحميل موادك التخصصية المقررة بدقة.
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
              <span>التالي: تحديد الهدف اليومي</span>
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
              <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
                حدد هدف المذاكرة اليومي وسلسلة الالتزام
              </h2>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              الالتزام اليومي البسيط يصنع الفارق الأكبر في نتائج البكالوريا؛ اختر المعدل الذي يناسب طاقتك.
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
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
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
                      <Clock className="w-4 h-4 text-amber-500" />
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-500/20 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0F172A] flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-[#0F172A] dark:text-white">
                شعلة الالتزام اليومية (Streak 🔥)
              </div>
              <p className="text-[#64748B] dark:text-[#94A3B8]">
                بمجرد إكمال هدفك اليومي، تشتعل شعلتك وترتفع نقاطك للمنافسة على صدارة مدرستك.
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
              className="px-6 h-12 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ تجهيز خطتك الدراسية...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>اعتماد الخطة والانطلاق</span>
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center space-y-6 py-4"
        >
          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-pulse">
              <Check className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3]" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white">
              أهلاً بك يا بطل! 🎓
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              تم إعداد خطتك الدراسية المخصصة بنجاح. جهزنا لك كبسولات الدروس وبنك الأسئلة والخرائط الذهنية المتوافقة تماماً مع خياراتك.
            </p>
          </div>

          {/* Tailored Plan Summary Capsule */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-[#334155] max-w-md mx-auto text-xs space-y-3">
            <div className="font-bold text-[#0F172A] dark:text-white pb-2 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
              <span>ملخص خطتك الدراسية</span>
              <span className="text-emerald-600 dark:text-emerald-400">جاهزة الآن ✓</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-right">
              <div className="space-y-0.5">
                <span className="text-[#94A3B8] text-[11px] block">الصف الدراسي:</span>
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
                <span className="text-[#94A3B8] text-[11px]">الهدف اليومي الموصى به:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{dailyGoalMinutes} دقيقة / يومياً</span>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleLaunchDashboard}
              className="w-full h-13 rounded-2xl bg-[#800020] hover:bg-[#66001A] text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer active:scale-98"
            >
              <Rocket className="w-5 h-5 animate-bounce" />
              <span>انطلق للوحة التحكم وجولة المنصة</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}