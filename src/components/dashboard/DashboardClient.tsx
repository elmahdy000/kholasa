"use client";

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
  CheckCircle,
  Clock,
  GraduationCap,
} from "@phosphor-icons/react";
import { DailyChallengeCard } from "./DailyChallengeCard";
import { formatArabicDays } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
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

interface DashboardClientProps {
  userName?: string | null;
  completedLessonsCount: number;
  recentAttemptsCount: number;
  averageScore?: number | null;
  streakDays?: number;
  unresolvedMistakesCount: number;
  subjects: SubjectItem[];
  continueLesson?: ContinueLessonItem | null;
  dailyQuestion?: any;
  recentExams?: RecentExamItem[];
}

export function DashboardClient({
  userName,
  completedLessonsCount,
  recentAttemptsCount,
  averageScore = null,
  streakDays = 0,
  unresolvedMistakesCount,
  subjects,
  continueLesson,
  dailyQuestion,
  recentExams = [],
}: DashboardClientProps) {
  const stats = [
    {
      icon: BookOpen,
      color: "#800020",
      value: completedLessonsCount,
      label: "دروس أتممتها",
      subtext: "مفاهيم مستوعبة",
    },
    {
      icon: Target,
      color: "#059669",
      value: recentAttemptsCount,
      label: "اختبارات منجزة",
      subtext: "جلسات تدريب",
    },
    {
      icon: ArrowCounterClockwise,
      color: "#DC2626",
      value: unresolvedMistakesCount,
      label: "أخطاء للمراجعة",
      textColor: "text-[#DC2626] dark:text-[#F87171]",
      subtext: "تحتاج تركيز",
    },
    {
      icon: Trophy,
      color: "#D97706",
      value: averageScore !== null ? `${averageScore}%` : "—",
      label: "معدل الاستيعاب",
      textColor: "text-[#D97706] dark:text-[#FBBF24]",
      subtext: "متوسط نتائج اختباراتك",
    },
  ];

  const quickActions = [
    {
      title: "تصفح المناهج",
      desc: "كل المواد والوحدات",
      href: "/subjects",
      icon: BookOpen,
      badge: `${subjects.length} مواد`,
      color: "text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 dark:bg-[#1E293B] border-[#F0E6E8]/60 dark:border-[#E11D48]/40",
    },
    {
      title: "اختبار سريع 5 دقائق",
      desc: "تحديد مستوى مخصص",
      href: "/exams/builder",
      icon: Target,
      badge: "فوري",
      color: "text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#1E293B] border-[#F0E6E8]/60 dark:border-[#34D399]/40",
    },
    {
      title: "كبسولة الزتونة",
      desc: "مفاهيم وقوانين مركزة",
      href: "/subjects",
      icon: BookmarkSimple,
      badge: "شامل",
      color: "text-[#D97706] dark:text-[#FBBF24] bg-[#D97706]/10 dark:bg-[#1E293B] border-[#F0E6E8]/60 dark:border-[#FBBF24]/40",
    },
    {
      title: "ركن غلطاتي",
      desc: "علاج نقاط الضعف",
      href: "/mistakes",
      icon: ArrowCounterClockwise,
      badge: `${unresolvedMistakesCount} أخطاء`,
      badgeColor: unresolvedMistakesCount > 0 ? "bg-[#DC2626] text-white" : undefined,
      color: "text-[#DC2626] dark:text-[#F87171] bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#F0E6E8]/60 dark:border-[#F87171]/40",
    },
    {
      title: "لوحة الشرف",
      desc: "ترتيب المتفوقين",
      href: "/leaderboard",
      icon: Trophy,
      badge: "تنافسي",
      color: "text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 dark:bg-[#1E293B] border-[#F0E6E8]/60 dark:border-[#E11D48]/40",
    },
  ];

  return (
    <div className="space-y-7 text-right">
      {/* 1. Personalized Hero Header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] p-6 sm:p-7 relative overflow-hidden "
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F8] dark:bg-[#1E293B] border border-[#F0E6E8]/80 dark:border-[#334155] text-[13px] font-bold text-[#1A0A10] dark:text-[#F8FAFC]">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              <span>منصة الخلاصة • مسارك الدراسي</span>
              {streakDays > 0 && (
                <span className="inline-flex items-center gap-1 font-mono text-[13px] text-[#D97706] dark:text-[#FBBF24] border-r border-[#F0E6E8] dark:border-[#334155] pr-2 mr-1">
                  <Fire className="w-3.5 h-3.5 fill-current" />
                  <span>{formatArabicDays(streakDays)}</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A0A10] dark:text-[#F8FAFC] leading-tight">
              أهلاً بك، {userName || "طالبنا العزيز"}
            </h1>
            <p className="text-[13px] sm:text-sm text-[#735C63] dark:text-[#94A3B8] font-medium max-w-lg leading-relaxed">
              افهم المفاهيم خطوة بخطوة بالخلاصة المركزة، واختبر استيعابك فوراً.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("kholasa_open_entrance_exam"));
              }}
              className="h-11 px-4 rounded-xl bg-[#D97706]/10 dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#FBBF24]/60 text-[#D97706] dark:text-[#FBBF24] text-[13px] font-bold flex items-center gap-2 hover:bg-[#D97706]/10 dark:hover:bg-[#1E293B] transition-all  active:opacity-80"
            >
              <Fire className="w-3.5 h-3.5 text-[#D97706]" weight="fill" />
              <span>تحدي الدخول اليومي</span>
            </button>
            <Link
              href="/exams/builder"
              className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-all shadow-sm active:opacity-80"
            >
              <Target className="w-3.5 h-3.5 text-[#D97706]" weight="fill" />
              <span>اختبار مخصص 5 دقائق</span>
            </Link>
            <Link
              href="/mistakes"
              className="h-11 px-4 rounded-xl bg-[#FAF7F8] dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] text-[#1A0A10] dark:text-[#F8FAFC] text-[13px] font-bold flex items-center gap-2 hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-all  active:opacity-80"
            >
              <ArrowCounterClockwise className="w-3.5 h-3.5 text-[#DC2626]" weight="bold" />
              <span>ركن غلطاتي ({unresolvedMistakesCount})</span>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 2. Step 1 in Flow: Continue Learning (Primary Action Card) */}
      {continueLesson && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="rounded-xl p-5 sm:p-6 bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] "
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#800020] text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Play className="w-5 h-5 fill-current ml-1" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 dark:bg-[#1E293B] px-3 py-1 rounded-md border border-[#F0E6E8]/50 dark:border-[#E11D48]/50">
                    واصل من حيث توقفت
                  </span>
                  <span className="text-[13px] font-bold text-[#735C63] dark:text-[#94A3B8]">
                    {continueLesson.unit.subject.name} • {continueLesson.unit.title}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-bold text-[#1A0A10] dark:text-[#F8FAFC]">
                  {continueLesson.title}
                </h2>
                <div className="flex items-center gap-3 text-[13px] text-[#735C63] dark:text-[#94A3B8]">
                  <span className="flex items-center gap-1 font-mono text-[13px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{continueLesson.durationMinutes} دقيقة</span>
                  </span>
                  <span>•</span>
                  <span className="text-[#D97706] dark:text-[#FBBF24] font-bold flex items-center gap-1">
                    <BookmarkSimple className="w-3.5 h-3.5" />
                    <span>الزتونة جاهزة للمراجعة</span>
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/lessons/${continueLesson.id}`}
              className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 active:opacity-80"
            >
              <span>استكمال المذاكرة الآن</span>
              <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
            </Link>
          </div>
        </motion.section>
      )}

      {/* 3. Step 2 in Flow: Quick Action Hub (5 Clear Commands) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-[#1A0A10] dark:text-[#F8FAFC]">
            محطات الوصول السريع
          </h2>
          <span className="text-[13px] text-[#735C63] dark:text-[#94A3B8] font-medium">
            كل أدواتك في متناول يدك
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                href={action.href}
                className="group p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60  transition-all flex flex-col justify-between space-y-3 text-right "
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border ${action.color}`}
                  >
                    <Icon className="w-4.5 h-4.5" weight="bold" />
                  </div>
                  {action.badge && (
                    <span
                      className={`text-[13px] font-bold px-2 py-1 rounded-full ${
                        action.badgeColor ||
                        "bg-[#FAF7F8] dark:bg-[#334155] text-[#735C63] dark:text-[#F8FAFC]"
                      }`}
                    >
                      {action.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-[13px] sm:text-sm font-bold text-[#1A0A10] dark:text-[#F8FAFC] group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-[13px] text-[#735C63] dark:text-[#94A3B8] mt-1">
                    {action.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Step 3 in Flow: Daily Challenge Card (Inline & Engaging) */}
      {dailyQuestion && (
        <section>
          <DailyChallengeCard question={dailyQuestion} />
        </section>
      )}

      {/* 5. Key Metrics Grid (Razor-sharp Zinc/Vercel Cards) */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155]  hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-colors flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#735C63] dark:text-[#94A3B8] font-bold block">
                {stat.label}
              </span>
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                <stat.icon className="w-4 h-4" weight="bold" />
              </div>
            </div>
            <div>
              <span
                className={`text-2xl sm:text-2xl sm:text-3xl font-bold block tracking-tight ${
                  stat.textColor || "text-[#1A0A10] dark:text-[#F8FAFC]"
                }`}
              >
                {stat.value}
              </span>
              <span className="text-[13px] text-[#735C63] dark:text-[#94A3B8] mt-1 block">
                {stat.subtext}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* 6. Step 4 in Flow: Curriculum Subjects with Real Progress */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#1A0A10] dark:text-[#F8FAFC]">
              المواد الدراسية المقررة
            </h2>
            <span className="px-2 py-1 rounded-full text-[13px] font-mono font-bold bg-[#FAF7F8] dark:bg-[#334155] text-[#735C63] dark:text-[#94A3B8]">
              {subjects.length} مواد
            </span>
          </div>
          <Link
            href="/subjects"
            className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1"
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {subjects.map((subj) => {
            const progress = subj.progressPercent ?? 0;
            const completed = subj.completedLessons ?? 0;

            return (
              <motion.div key={subj.id} variants={fadeInUp}>
                <div className="group p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60  transition-all flex flex-col justify-between space-y-4 h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base "
                        style={{ backgroundColor: subj.color || "#800020" }}
                      >
                        {subj.name[0]}
                      </div>
                      <span className="text-[13px] font-mono font-bold text-[#735C63] dark:text-[#94A3B8] bg-[#FAF7F8] dark:bg-[#1E293B] px-3 py-1 rounded-md border border-[#F0E6E8]/60 dark:border-[#334155]">
                        {subj.unitsCount} وحدات
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#1A0A10] dark:text-[#F8FAFC] group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors">
                        {subj.name}
                      </h3>
                      {subj.description && (
                        <p className="text-[13px] text-[#735C63] dark:text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
                          {subj.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[13px] text-[#735C63] dark:text-[#94A3B8] font-mono">
                        <span>
                          {completed} من {subj.totalLessons} دروس مكتملة
                        </span>
                        <span className="font-bold text-[#1A0A10] dark:text-[#F8FAFC]">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#FAF7F8] dark:bg-[#334155] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#800020] dark:bg-[#E11D48] transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#F0E6E8] dark:border-[#334155]/80 flex items-center justify-between text-[13px]">
                    <Link
                      href={`/exams/builder?subjectId=${subj.id}`}
                      className="text-[#735C63] dark:text-[#94A3B8] hover:text-[#1A0A10] dark:hover:text-[#F8FAFC] flex items-center gap-1 font-medium"
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

      {/* 7. Step 5 in Flow: Recent Exams / History (if exists) */}
      {recentExams.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-[#1A0A10] dark:text-[#F8FAFC]">
              آخر نتائج الاختبارات
            </h2>
            <Link
              href="/exams/builder"
              className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline"
            >
              ابدأ اختباراً جديداً
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentExams.map((exam) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}/results`}
                className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#F0E6E8] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60  transition-colors flex items-center justify-between"
              >
                <div>
                  <h3 className="text-[13px] font-bold text-[#1A0A10] dark:text-[#F8FAFC] line-clamp-1">
                    {exam.title}
                  </h3>
                  <span className="text-[13px] text-[#735C63] dark:text-[#94A3B8]">
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