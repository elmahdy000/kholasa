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
} from "@phosphor-icons/react";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

interface StatItem {
  icon: React.ComponentType<{ className?: string; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }>;
  color: string;
  value: number | string;
  label: string;
  textColor?: string;
}

interface SubjectItem {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  unitsCount: number;
  totalLessons: number;
}

interface DashboardClientProps {
  userName?: string | null;
  completedLessonsCount: number;
  recentAttemptsCount: number;
  unresolvedMistakesCount: number;
  subjects: SubjectItem[];
}

export function DashboardClient({
  userName,
  completedLessonsCount,
  recentAttemptsCount,
  unresolvedMistakesCount,
  subjects,
}: DashboardClientProps) {
  const stats: StatItem[] = [
    { icon: BookOpen, color: "#4F46E5", value: completedLessonsCount, label: "دروس مكتملة" },
    { icon: Lightning, color: "#059669", value: recentAttemptsCount, label: "امتحانات منفذة" },
    { icon: ArrowCounterClockwise, color: "#DC2626", value: unresolvedMistakesCount, label: "أخطاء تحتاج مراجعة", textColor: "text-[#DC2626]" },
    { icon: Trophy, color: "#D97706", value: "100%", label: "معدل الاستيعاب", textColor: "text-[#D97706]" },
  ];

  return (
    <div className="space-y-8 text-right">
      {/* Personalized Welcome Banner (Vercel Project Overview style) */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-9 relative overflow-hidden shadow-2xs"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>دفعة 2026 • خطتك الدراسية مستمرة بنشاط</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] dark:text-white leading-tight">
              مرحباً بك، {userName || "طالبنا العزيز"}
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 font-medium max-w-lg leading-relaxed">
              جاهز لجلسة الاستذكار اليوم؟ استوعب المفاهيم خطوة بخطوة بالخلاصة المركزة، واختبر تحصيلك فوراً.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/exams/builder"
              className="h-10 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-2xs active:scale-95"
            >
              <Lightning className="w-3.5 h-3.5 text-amber-300" weight="fill" />
              <span>ابدأ اختباراً مخصصاً</span>
            </Link>
            <Link
              href="/mistakes"
              className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-white text-xs font-bold flex items-center gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs active:scale-95"
            >
              <ArrowCounterClockwise className="w-3.5 h-3.5 text-rose-500" weight="bold" />
              <span>ركن غلطاتي ({unresolvedMistakesCount})</span>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Quick Stats Grid (Vercel Metric Cards) */}
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
            className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#475569] dark:text-slate-400 font-bold block">
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
              <span className={`text-2xl sm:text-3xl font-black block tracking-tight ${stat.textColor || "text-[#0F172A] dark:text-white"}`}>
                {stat.value}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Subjects Grid Section (Replit Repls Workspace Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
              المواد الدراسية المقررة
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
              {subjects.length} مواد
            </span>
          </div>
          <Link
            href="/subjects"
            className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
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
          {subjects.map((subj) => (
            <motion.div key={subj.id} variants={fadeInUp}>
              <Link
                href={`/subjects/${subj.id}`}
                className="group p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-all flex flex-col justify-between space-y-4 h-full block"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-2xs"
                      style={{ backgroundColor: subj.color || "#4F46E5" }}
                    >
                      {subj.name[0]}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                      {subj.unitsCount} وحدات
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white group-hover:text-[#4F46E5] transition-colors">
                      {subj.name}
                    </h3>
                    <p className="text-xs text-[#475569] dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {subj.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-[#475569] dark:text-slate-400">
                  <span className="font-mono text-[11px]">{subj.totalLessons} دروس تفاعلية</span>
                  <span className="text-[#4F46E5] flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                    <span>فتح المادة</span>
                    <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}