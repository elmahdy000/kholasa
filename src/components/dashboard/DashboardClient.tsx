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
      {/* Personalized Welcome Banner */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 p-6 sm:p-8 lg:p-10"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4F46E5]/10 border border-[#4F46E5]/20">
              <Sparkle className="w-4 h-4 text-[#4F46E5]" weight="fill" />
              <span className="text-xs font-bold text-[#4F46E5]">
                دفعة 2026 • خطتك الدراسية مستمرة
              </span>
            </div>
            <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-[#0F172A] dark:text-white leading-tight">
              أهلاً بك، {userName || "يا بطل"}! 👋
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 font-content max-w-lg leading-relaxed">
              جاهز لرحلة مذاكرة اليوم؟ افهم المفاهيم خطوة بخطوة بالزتونة، واختبر نفسك فوراً.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/exams/builder"
              className="h-11 px-5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Lightning className="w-4 h-4 text-[#D97706]" weight="fill" />
              <span>ابدأ اختباراً مخصصاً</span>
            </Link>
            <Link
              href="/mistakes"
              className="h-11 px-4 rounded-lg border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white text-xs font-bold flex items-center gap-2 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowCounterClockwise className="w-4 h-4 text-[#DC2626]" weight="bold" />
              <span>ركن غلطاتي ({unresolvedMistakesCount})</span>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Quick Stats Grid */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 flex items-center gap-3"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${stat.color}12`, color: stat.color }}
            >
              <stat.icon className="w-6 h-6" weight="bold" />
            </div>
            <div>
              <span className={`text-2xl font-bold block leading-tight ${stat.textColor || "text-[#0F172A] dark:text-white"}`}>
                {stat.value}
              </span>
              <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium block">
                {stat.label}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Subjects Grid Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
            المواد الدراسية المقررة
          </h2>
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
                className="group p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 hover:border-[#4F46E5]/40 transition-colors flex flex-col justify-between space-y-4 h-full block"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: subj.color || "#4F46E5" }}
                    >
                      {subj.name[0]}
                    </div>
                    <span className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 bg-[#F8FAFC] dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      {subj.unitsCount} وحدات
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#0F172A] dark:text-white group-hover:text-[#4F46E5] transition-colors">
                      {subj.name}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 font-content line-clamp-2 mt-1">
                      {subj.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between text-xs font-medium text-[#64748B] dark:text-slate-400">
                  <span>{subj.totalLessons} دروس تفاعلية</span>
                  <span className="text-[#4F46E5] flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                    <span>عرض الدروس</span>
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