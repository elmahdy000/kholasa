"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Lightning,
  ArrowCounterClockwise,
  Sparkle,
  ArrowLeft,
  Trophy,
  Fire,
  Play,
  CheckCircle,
  Clock,
  GraduationCap,
} from "@phosphor-icons/react";
import { DailyChallengeCard } from "./DailyChallengeCard";

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
  unresolvedMistakesCount,
  subjects,
  continueLesson,
  dailyQuestion,
  recentExams = [],
}: DashboardClientProps) {
  const stats = [
    {
      icon: BookOpen,
      color: "#4F46E5",
      value: completedLessonsCount,
      label: "دروس أتممتها",
      subtext: "مفاهيم مستوعبة",
    },
    {
      icon: Lightning,
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
      textColor: "text-rose-600 dark:text-rose-400",
      subtext: "تحتاج تركيز",
    },
    {
      icon: Trophy,
      color: "#D97706",
      value: "100%",
      label: "معدل الاستيعاب",
      textColor: "text-amber-600 dark:text-amber-400",
      subtext: "مستوى الأداء العام",
    },
  ];

  const quickActions = [
    {
      title: "تصفح المناهج",
      desc: "كل المواد والوحدات",
      href: "/subjects",
      icon: BookOpen,
      badge: `${subjects.length} مواد`,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-900/40",
    },
    {
      title: "اختبار سريع 5 دقائق",
      desc: "تحديد مستوى مخصص",
      href: "/exams/builder",
      icon: Lightning,
      badge: "فوري",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/40",
    },
    {
      title: "الزتونة الذهبية",
      desc: "مفاهيم وقوانين مركزة",
      href: "/subjects",
      icon: Sparkle,
      badge: "شامل",
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/40",
    },
    {
      title: "ركن غلطاتي",
      desc: "علاج نقاط الضعف",
      href: "/mistakes",
      icon: ArrowCounterClockwise,
      badge: `${unresolvedMistakesCount} أخطاء`,
      badgeColor: unresolvedMistakesCount > 0 ? "bg-rose-500 text-white" : undefined,
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/40",
    },
    {
      title: "لوحة الشرف",
      desc: "ترتيب المتفوقين",
      href: "/leaderboard",
      icon: Trophy,
      badge: "تنافسي",
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-900/40",
    },
  ];

  return (
    <div className="space-y-7 text-right">
      {/* 1. Personalized Hero Header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 relative overflow-hidden shadow-2xs"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>دفعة 2026 • خطتك الدراسية مستمرة بنشاط</span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-600 dark:text-amber-400 border-r border-zinc-300 dark:border-zinc-700 pr-2 mr-1">
                <Fire className="w-3.5 h-3.5 fill-current" />
                <span>5 أيام</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
              أهلاً بك، {userName || "طالبنا العزيز"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium max-w-lg leading-relaxed">
              افهم المفاهيم خطوة بخطوة بالخلاصة المركزة، واختبر استيعابك فوراً.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/exams/builder"
              className="h-10 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <Lightning className="w-3.5 h-3.5 text-amber-300" weight="fill" />
              <span>اختبار مخصص 5 دقائق</span>
            </Link>
            <Link
              href="/mistakes"
              className="h-10 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold flex items-center gap-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-2xs active:scale-95"
            >
              <ArrowCounterClockwise className="w-3.5 h-3.5 text-rose-500" weight="bold" />
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
          className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-indigo-500/[0.04] to-purple-500/[0.02] dark:from-indigo-500/[0.08] dark:to-transparent bg-white dark:bg-zinc-950 border-2 border-indigo-500/20 dark:border-indigo-500/30 shadow-2xs"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-[#4F46E5] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-900/50">
                    واصل من حيث توقفت
                  </span>
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    {continueLesson.unit.subject.name} • {continueLesson.unit.title}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {continueLesson.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{continueLesson.durationMinutes} دقيقة</span>
                  </span>
                  <span>•</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>الزتونة جاهزة للمراجعة</span>
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/lessons/${continueLesson.id}`}
              className="h-11 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 active:scale-95"
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
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
            محطات الوصول السريع
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
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
                className="group p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs transition-all flex flex-col justify-between space-y-3 text-right hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${action.color}`}
                  >
                    <Icon className="w-4.5 h-4.5" weight="bold" />
                  </div>
                  {action.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        action.badgeColor ||
                        "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      {action.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#4F46E5] dark:group-hover:text-indigo-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-bold block">
                {stat.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                <stat.icon className="w-4 h-4" weight="bold" />
              </div>
            </div>
            <div>
              <span
                className={`text-2xl sm:text-3xl font-black block tracking-tight ${
                  stat.textColor || "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {stat.value}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
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
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              المواد الدراسية المقررة
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {subjects.length} مواد
            </span>
          </div>
          <Link
            href="/subjects"
            className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline flex items-center gap-1"
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
                <div className="group p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs transition-all flex flex-col justify-between space-y-4 h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-2xs"
                        style={{ backgroundColor: subj.color || "#4F46E5" }}
                      >
                        {subj.name[0]}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-800">
                        {subj.unitsCount} وحدات
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#4F46E5] dark:group-hover:text-indigo-400 transition-colors">
                        {subj.name}
                      </h3>
                      {subj.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {subj.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        <span>
                          {completed} من {subj.totalLessons} دروس مكتملة
                        </span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#4F46E5] dark:bg-indigo-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    <Link
                      href={`/exams/builder?subjectId=${subj.id}`}
                      className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 font-medium"
                    >
                      <Lightning className="w-3.5 h-3.5 text-amber-500" weight="fill" />
                      <span>اختبار سريع</span>
                    </Link>

                    <Link
                      href={`/subjects/${subj.id}`}
                      className="text-[#4F46E5] dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:-translate-x-1 transition-transform"
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
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              آخر نتائج الاختبارات
            </h2>
            <Link
              href="/exams/builder"
              className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline"
            >
              ابدأ اختباراً جديداً
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentExams.map((exam) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}/results`}
                className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs transition-colors flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {exam.title}
                  </h3>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {exam.totalQuestions} أسئلة
                  </span>
                </div>
                <div className="text-left">
                  <span
                    className={`text-sm font-black font-mono ${
                      exam.percentage >= 80
                        ? "text-emerald-600 dark:text-emerald-400"
                        : exam.percentage >= 50
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400"
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