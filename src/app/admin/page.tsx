import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import {
  Users,
  BookOpen,
  HelpCircle,
  Trophy,
  Layers,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  // Aggregate Admin Metrics
  const [
    studentsCount,
    subjectsCount,
    unitsCount,
    lessonsCount,
    questionsCount,
    attempts,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.subject.count(),
    prisma.unit.count(),
    prisma.lesson.count(),
    prisma.question.count(),
    prisma.examAttempt.findMany({
      where: { isCompleted: true },
      select: { percentage: true },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { grade: true },
    }),
  ]);

  const attemptsCount = attempts.length;
  const avgScore =
    attemptsCount > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.percentage, 0) / attemptsCount
        )
      : 0;

  return (
    <AdminShell user={user}>
      <div className="space-y-8 text-right font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-[#14243D] dark:text-white">
              نظرة عامة على المنصة التعليمية
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
              متابعة المحتوى الأكاديمي، نمو الطلاب، ومؤشرات أداء بنك الأسئلة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/questions"
              className="h-10 px-4 rounded-xl bg-[#6858EA] hover:bg-[#5444D8] text-white text-xs font-black flex items-center gap-2 shadow-md shadow-[#6858EA]/20 transition-transform active:scale-95"
            >
              <HelpCircle className="w-4 h-4" />
              <span>إضافة سؤال جديد</span>
            </Link>
          </div>
        </div>

        {/* 6 Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">
                إجمالي الطلاب المسجلين
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#6858EA]/10 text-[#6858EA] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-black text-[#14243D] dark:text-white block">
              {studentsCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3" />
              <span>تفاعل نشط</span>
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">
                المواد والوحدات
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#11B7B4]/10 text-[#11B7B4] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-black text-[#14243D] dark:text-white block">
              {subjectsCount} مواد
            </span>
            <span className="text-[11px] font-bold text-slate-400 mt-2 block">
              موزعة على {unitsCount} وحدة دراسية
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">
                الدروس المتاحة
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-black text-[#14243D] dark:text-white block">
              {lessonsCount} درساً
            </span>
            <span className="text-[11px] font-bold text-amber-600 mt-2 block">
              مزودة بالزتونة الذهبية وخرائط المفاهيم
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">
                بنك الأسئلة المنشورة
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#6858EA]/10 text-[#6858EA] flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-black text-[#14243D] dark:text-white block">
              {questionsCount} سؤالاً
            </span>
            <span className="text-[11px] font-bold text-[#6858EA] mt-2 block">
              مدعومة بتفسيرات تفصيلية لكل خيار
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">
                الاختبارات المنفذة
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-black text-[#14243D] dark:text-white block">
              {attemptsCount} اختباراً
            </span>
            <span className="text-[11px] font-bold text-emerald-600 mt-2 block">
              تدريبات تكيفية وامتحانات رسمية
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">
                متوسط أداء الطلاب
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-black text-[#14243D] dark:text-white block">
              {avgScore}%
            </span>
            <span className="text-[11px] font-bold text-slate-400 mt-2 block">
              مؤشر التحصيل العام
            </span>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/curriculum"
            className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 hover:border-[#6858EA] transition-all flex items-center justify-between group"
          >
            <div>
              <h3 className="text-base font-black text-[#14243D] dark:text-white group-hover:text-[#6858EA] transition-colors">
                إدارة المناهج والوحدات والدروس
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                تعديل هيكل المناهج والتحكم في ظهور ونشر الدروس
              </p>
            </div>
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-[#6858EA] transition-transform group-hover:-translate-x-1" />
          </Link>

          <Link
            href="/admin/questions"
            className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 hover:border-[#11B7B4] transition-all flex items-center justify-between group"
          >
            <div>
              <h3 className="text-base font-black text-[#14243D] dark:text-white group-hover:text-[#11B7B4] transition-colors">
                بنك الأسئلة والتفسيرات التفصيلية
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                إضافة أسئلة MCQ وصح/خطأ ومقالي مع تفسيرات الخيارات
              </p>
            </div>
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-[#11B7B4] transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>

        {/* Recent Registered Users */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-base font-black text-[#14243D] dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#6858EA]" />
            <span>أحدث الطلاب المنضمين</span>
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs sm:text-sm font-black text-[#14243D] dark:text-white block">
                    {u.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold block" dir="ltr">
                    {u.email || u.phone || "حساب تجريبي"}
                  </span>
                </div>
                <div className="text-left">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6858EA]/10 text-[#6858EA]">
                    {u.grade?.name || "طالب"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
