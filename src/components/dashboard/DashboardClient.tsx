"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  ArrowCounterClockwise,
  BookmarkSimple,
  ArrowLeft,
  Trophy,
  Fire,
  Play,
  Clock,
  Sparkle,
  Compass,
} from "@phosphor-icons/react";
import { DailyChallengeCard } from "./DailyChallengeCard";
import { StreakWidget, WeekDayProgress } from "./StreakWidget";
import { BidiStatement } from "@/components/ui/BidiStatement";

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

interface ContinueLessonItem {
  id: string;
  title: string;
  durationMinutes: number;
  unit: {
    id: string;
    title: string;
    subject: {
      id: string;
      name: string;
      color?: string | null;
    };
  };
  progressPercent?: number;
}

interface SubjectItem {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  unitsCount: number;
  totalLessons: number;
  completedLessons?: number;
  progressPercent?: number;
}

interface RecentExamItem {
  id: string;
  title: string;
  percentage: number;
  totalQuestions: number;
  completedAt: string | null;
}

interface StudentMeta {
  systemName?: string | null;
  gradeName?: string | null;
  trackName?: string | null;
}

interface DashboardClientProps {
  userName?: string | null;
  studentMeta?: StudentMeta;
  completedLessonsCount: number;
  recentAttemptsCount: number;
  averageScore?: number | null;
  streakDays?: number;
  isTodayCompleted?: boolean;
  weekDays?: WeekDayProgress[];
  unresolvedMistakesCount: number;
  subjects: SubjectItem[];
  continueLesson?: ContinueLessonItem | null;
  dailyQuestion?: any;
  recentExams?: RecentExamItem[];
}

export function DashboardClient({
  userName,
  studentMeta,
  completedLessonsCount,
  recentAttemptsCount,
  averageScore = null,
  streakDays = 0,
  isTodayCompleted = false,
  weekDays = [],
  unresolvedMistakesCount,
  subjects,
  continueLesson,
  dailyQuestion,
  recentExams = [],
}: DashboardClientProps) {
  const [currentStreakDays, setCurrentStreakDays] = useState(streakDays);
  const [isTodayCompletedState, setIsTodayCompletedState] = useState(isTodayCompleted);

  useEffect(() => {
    const handleStreakUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ streakDays: number; isTodayCompleted: boolean }>;
      if (customEvent.detail) {
        if (typeof customEvent.detail.streakDays === "number") {
          setCurrentStreakDays(customEvent.detail.streakDays);
        }
        if (customEvent.detail.isTodayCompleted) {
          setIsTodayCompletedState(true);
        }
      }
    };
    window.addEventListener("kholasa_streak_updated", handleStreakUpdate);
    return () => window.removeEventListener("kholasa_streak_updated", handleStreakUpdate);
  }, []);

  // Clean student name without parenthesized metadata
  const displayName = userName?.replace(/\s*\([^)]*\)/g, "").trim() || "طالبنا العزيز";

  // Academic metadata tags
  const metaPills = [
    studentMeta?.systemName,
    studentMeta?.gradeName,
    studentMeta?.trackName,
  ].filter(Boolean) as string[];

  // 4 Key Statistics Cards
  const stats = [
    {
      icon: BookOpen,
      color: "#800020",
      bgColor: "bg-[#800020]/10 dark:bg-[#800020]/20",
      textColor: "text-[#800020] dark:text-[#FB7185]",
      value: completedLessonsCount,
      label: "دروس أتقنتها",
      subtext: "مفاهيم مستوعبة",
    },
    {
      icon: Target,
      color: "#059669",
      bgColor: "bg-[#059669]/10 dark:bg-[#059669]/20",
      textColor: "text-[#059669] dark:text-[#34D399]",
      value: recentAttemptsCount,
      label: "اختبارات منجزة",
      subtext: "جلسات تدريب مكتملة",
    },
    {
      icon: ArrowCounterClockwise,
      color: "#DC2626",
      bgColor: "bg-[#DC2626]/10 dark:bg-[#DC2626]/20",
      textColor: "text-[#DC2626] dark:text-[#F87171]",
      value: unresolvedMistakesCount,
      label: "أخطاء للمراجعة",
      subtext: "تحتاج تركيز وتثبيت",
    },
    {
      icon: Trophy,
      color: "#D97706",
      bgColor: "bg-[#D97706]/10 dark:bg-[#D97706]/20",
      textColor: "text-[#D97706] dark:text-[#FBBF24]",
      value: averageScore !== null ? `${averageScore}%` : "—",
      label: "معدل الاستيعاب",
      subtext: "متوسط نتائج اختباراتك",
    },
  ];

  // 5 Quick Access Cards (Bento-balanced)
  const quickActions = [
    {
      id: "subjects",
      title: "تصفح المناهج",
      desc: "كل المواد والوحدات والدروس المقررة",
      href: "/subjects",
      icon: BookOpen,
      badge: `${subjects.length} مواد`,
      badgeColor: "bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185]",
      iconBg: "bg-[#800020]/10 text-[#800020] dark:bg-[#1E293B] dark:text-[#FB7185]",
      // Layout classes across breakpoints
      layoutClass: "col-span-2 sm:col-span-3 lg:col-span-1",
      isFeaturedOnMobile: true,
    },
    {
      id: "quick-exam",
      title: "اختبار سريع 5 دقائق",
      desc: "تقييم فوري لمستوى استيعابك",
      href: "/exams/builder",
      icon: Target,
      badge: "فوري",
      badgeColor: "bg-[#059669]/10 text-[#059669] dark:bg-[#059669]/30 dark:text-[#34D399]",
      iconBg: "bg-[#059669]/10 text-[#059669] dark:bg-[#1E293B] dark:text-[#34D399]",
      layoutClass: "col-span-1 sm:col-span-3 lg:col-span-1",
    },
    {
      id: "capsule",
      title: "كبسولة الزتونة",
      desc: "خلاصات القوانين والمفاهيم المركزة",
      href: "/subjects",
      icon: BookmarkSimple,
      badge: "شامل",
      badgeColor: "bg-[#D97706]/10 text-[#D97706] dark:bg-[#D97706]/30 dark:text-[#FBBF24]",
      iconBg: "bg-[#D97706]/10 text-[#D97706] dark:bg-[#1E293B] dark:text-[#FBBF24]",
      layoutClass: "col-span-1 sm:col-span-2 lg:col-span-1",
    },
    {
      id: "mistakes",
      title: "ركن غلطاتي",
      desc: "علاج نقاط الضعف والمراجعة الذكية",
      href: "/mistakes",
      icon: ArrowCounterClockwise,
      badge: `${unresolvedMistakesCount} أخطاء`,
      badgeColor:
        unresolvedMistakesCount > 0
          ? "bg-[#DC2626] text-white"
          : "bg-[#F3F4F6] text-[#6B7280] dark:bg-[#334155] dark:text-[#94A3B8]",
      iconBg: "bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#1E293B] dark:text-[#F87171]",
      layoutClass: "col-span-1 sm:col-span-2 lg:col-span-1",
    },
    {
      id: "leaderboard",
      title: "لوحة الشرف",
      desc: "ترتيب المتفوقين والتنافس الأسبوعي",
      href: "/leaderboard",
      icon: Trophy,
      badge: "تنافسي",
      badgeColor: "bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/30 dark:text-[#FB7185]",
      iconBg: "bg-[#800020]/10 text-[#800020] dark:bg-[#1E293B] dark:text-[#FB7185]",
      layoutClass: "col-span-1 sm:col-span-2 lg:col-span-1",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-7 text-right">
      {/* 1. Redesigned Student Dashboard Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] p-5 sm:p-6 lg:p-7 relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-6">
          {/* Welcome Text & Metadata */}
          <div className="space-y-2.5 max-w-2xl">
            {/* Metadata Pills Row */}
            <div className="flex items-center gap-2 flex-wrap text-xs sm:text-[13px] font-bold">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] dark:text-[#34D399] border border-[#059669]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                <span>حساب مفعل</span>
              </span>

              {metaPills.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {metaPills.map((pill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-[#F3F4F6] dark:bg-[#1E293B] text-[#4B5563] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-[#334155]"
                    >
                      <BidiStatement as="span" text={pill} />
                    </span>
                  ))}
                </div>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F6] dark:bg-[#1E293B] text-[#4B5563] dark:text-[#CBD5E1] border border-[#E5E7EB] dark:border-[#334155]">
                  مسارك الدراسي
                </span>
              )}
            </div>

            {/* Welcome Heading */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#12263F] dark:text-[#F8FAFC] tracking-tight">
              أهلًا بيك، {displayName}
            </h1>

            {/* Supporting Subtext */}
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed">
              كمّل مذاكرتك من آخر درس، واختبر فهمك خطوة بخطوة.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Primary Action: Continue Learning */}
            <Link
              href={continueLesson ? `/lessons/${continueLesson.id}` : "/subjects"}
              className="h-11 px-5 sm:px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>كمّل مذاكرتك</span>
            </Link>

            {/* Secondary Action: Quick Exam */}
            <Link
              href="/exams/builder"
              className="h-11 px-4 sm:px-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#12263F] dark:text-[#F8FAFC] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Target className="w-4 h-4 text-[#D97706]" weight="fill" />
              <span>اختبار سريع</span>
            </Link>

            {/* Daily Challenge Pill (non-competing) */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("daily-challenge-card");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                } else {
                  window.dispatchEvent(new CustomEvent("kholasa_open_entrance_exam"));
                }
              }}
              className="h-11 px-3.5 rounded-xl bg-[#D97706]/10 dark:bg-[#1E293B] border border-[#D97706]/30 dark:border-[#FBBF24]/40 text-[#D97706] dark:text-[#FBBF24] text-[12px] sm:text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all hover:bg-[#D97706]/15 active:scale-[0.98]"
            >
              <Fire className="w-4 h-4 fill-current" />
              <span className="hidden xs:inline">تحدي اليوم</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* 2. Study Streak Timeline Component */}
      <StreakWidget
        initialStreakDays={currentStreakDays}
        initialIsTodayCompleted={isTodayCompletedState}
        initialWeekDays={weekDays}
        onOpenDailyChallenge={() => {
          const el = document.getElementById("daily-challenge-card");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            window.dispatchEvent(new CustomEvent("kholasa_open_entrance_exam"));
          }
        }}
      />

      {/* 3. Continue Learning Section */}
      <section>
        {continueLesson ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.04 }}
            className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#800020] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 dark:bg-[#1E293B] px-2.5 py-0.5 rounded-md border border-[#800020]/20 dark:border-[#E11D48]/30">
                      واصل من حيث توقفت
                    </span>
                    <span className="text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] truncate">
                      {continueLesson.unit.subject.name} • {continueLesson.unit.title}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-[#12263F] dark:text-[#F8FAFC] break-words leading-snug">
                    {continueLesson.title}
                  </h2>

                  <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8] flex-wrap">
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{continueLesson.durationMinutes} دقيقة</span>
                    </span>
                    <span>•</span>
                    <span className="text-[#D97706] dark:text-[#FBBF24] font-bold flex items-center gap-1">
                      <BookmarkSimple className="w-3.5 h-3.5" />
                      <span>الزتونة جاهزة للمراجعة</span>
                    </span>
                    {typeof continueLesson.progressPercent === "number" &&
                      continueLesson.progressPercent > 0 && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-bold text-[#059669] dark:text-[#34D399]">
                            {continueLesson.progressPercent}% مكتمل
                          </span>
                        </>
                      )}
                  </div>
                </div>
              </div>

              <Link
                href={`/lessons/${continueLesson.id}`}
                className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 active:scale-[0.98]"
              >
                <span>كمّل الدرس</span>
                <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#800020]/10 text-[#800020] dark:bg-[#1E293B] dark:text-[#FB7185] flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" weight="bold" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-[#12263F] dark:text-[#F8FAFC]">
                  ابدأ رحلتك التعليمية
                </h2>
                <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  اختر مادتك الأولى للبدء في المذاكرة خطوة بخطوة وتثبيت حضورك وتقدمك تلقائيًا.
                </p>
              </div>
            </div>

            <Link
              href="/subjects"
              className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 active:scale-[0.98]"
            >
              <span>تصفح المواد الدراسية</span>
              <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
            </Link>
          </div>
        )}
      </section>

      {/* 4. Student Key Metrics Grid (4 Balanced Cards) */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-colors flex flex-col justify-between min-h-[118px] sm:min-h-[126px]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-bold">
                {stat.label}
              </span>
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bgColor} ${stat.textColor}`}
              >
                <stat.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" weight="bold" />
              </div>
            </div>

            <div className="pt-2">
              <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight block ${stat.textColor}`}>
                {stat.value}
              </span>
              <span className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 block">
                {stat.subtext}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* 5. Adaptive Bento Quick Action Grid (No Orphaned 5th Card) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-[#12263F] dark:text-[#F8FAFC]">
            محطات الوصول السريع
          </h2>
          <span className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium">
            كل أدواتك في متناول يدك
          </span>
        </div>

        {/* 
          Bento Grid Layout Strategy:
          - Mobile (< sm): 2 columns. Card 1 spans 2 cols (full width header card). Cards 2-5 are 1 col each in 2x2.
          - Tablet (sm to lg): 6 columns. Row 1 has 2 cards (3+3 cols). Row 2 has 3 cards (2+2+2 cols).
          - Desktop (lg+): 5 columns. All 5 cards in 1 row (1 col each).
          Zero orphans anywhere!
        */}
        <div className="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-5 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                href={action.href}
                className={`group p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-all flex flex-col justify-between text-right ${action.layoutClass}`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${action.iconBg}`}
                  >
                    <Icon className="w-5 h-5" weight="bold" />
                  </div>
                  {action.badge && (
                    <span
                      className={`text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${action.badgeColor}`}
                    >
                      {action.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-[13px] sm:text-sm font-bold text-[#12263F] dark:text-[#F8FAFC] group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors leading-snug">
                    {action.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed line-clamp-2">
                    {action.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. Daily Challenge Card */}
      {dailyQuestion && (
        <section>
          <DailyChallengeCard
            question={dailyQuestion}
            isTodayAlreadyCompleted={isTodayCompletedState}
          />
        </section>
      )}

      {/* 7. Curriculum Subjects with Real Progress */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[#12263F] dark:text-[#F8FAFC]">
              المواد الدراسية المقررة
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F3F4F6] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
              {subjects.length} مواد
            </span>
          </div>
          <Link
            href="/subjects"
            className="text-xs sm:text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1"
          >
            <span>عرض كل المواد</span>
            <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
          </Link>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {subjects.map((subj) => {
            const progress = subj.progressPercent ?? 0;
            const completed = subj.completedLessons ?? 0;

            return (
              <motion.div key={subj.id} variants={fadeInUp}>
                <div className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-all flex flex-col justify-between space-y-4 h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
                        style={{ backgroundColor: subj.color || "#800020" }}
                      >
                        {subj.name[0]}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] bg-[#F3F4F6] dark:bg-[#1E293B] px-2.5 py-0.5 rounded-md border border-[#E5E7EB] dark:border-[#334155]">
                        {subj.unitsCount} وحدات
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#12263F] dark:text-[#F8FAFC] group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors leading-snug">
                        {subj.name}
                      </h3>
                      {subj.description && (
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
                          {subj.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">
                        <span>
                          {completed} من {subj.totalLessons} دروس مكتملة
                        </span>
                        <span className="font-bold text-[#12263F] dark:text-[#F8FAFC]">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#F3F4F6] dark:bg-[#334155] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#800020] dark:bg-[#E11D48] transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#334155] flex items-center justify-between text-xs">
                    <Link
                      href={`/exams/builder?subjectId=${subj.id}`}
                      className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F8FAFC] flex items-center gap-1 font-medium"
                    >
                      <Target className="w-3.5 h-3.5 text-[#D97706]" weight="fill" />
                      <span>اختبار سريع</span>
                    </Link>

                    <Link
                      href={`/subjects/${subj.id}`}
                      className="text-[#800020] dark:text-[#FB7185] font-bold flex items-center gap-1"
                    >
                      <span>فتح المادة</span>
                      <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 8. Recent Exam Results */}
      {recentExams.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-[#12263F] dark:text-[#F8FAFC]">
              آخر نتائج الاختبارات
            </h2>
            <Link
              href="/exams/builder"
              className="text-xs sm:text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline"
            >
              ابدأ اختباراً جديداً
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentExams.map((exam) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}/results`}
                className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-colors flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xs sm:text-[13px] font-bold text-[#12263F] dark:text-[#F8FAFC] line-clamp-1">
                    {exam.title}
                  </h3>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {exam.totalQuestions} أسئلة
                  </span>
                </div>
                <div className="text-left">
                  <span
                    className={`text-sm font-bold font-mono ${
                      exam.percentage >= 80
                        ? "text-[#059669] dark:text-[#34D399]"
                        : exam.percentage >= 50
                        ? "text-[#D97706] dark:text-[#FBBF24]"
                        : "text-[#DC2626] dark:text-[#F87171]"
                    }`}
                  >
                    {exam.percentage}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}