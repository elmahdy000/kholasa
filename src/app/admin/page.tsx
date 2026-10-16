import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/auth";
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
  TrendingUp,
  Award,
  Upload,
  Plus,
  Clock,
  ArrowUpRight,
  Database,
  HardDrive,
  Activity,
  SlidersHorizontal,
  ChevronLeft,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || !isStaff(user.role)) {
    redirect("/login?callbackUrl=/admin");
  }

  // Aggregate Admin Metrics
  const [
    studentsCount,
    subjectsCount,
    unitsCount,
    lessonsCount,
    questionsCount,
    examsCount,
    attempts,
    recentUsers,
    recentAttempts,
    subjectsWithStats,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.subject.count(),
    prisma.unit.count(),
    prisma.lesson.count(),
    prisma.question.count(),
    prisma.exam.count(),
    prisma.examAttempt.findMany({
      where: { isCompleted: true },
      select: { percentage: true },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        grade: { select: { name: true } },
        system: { select: { name: true } },
        attempts: { select: { id: true } },
      },
    }),
    prisma.examAttempt.findMany({
      where: { isCompleted: true },
      take: 6,
      orderBy: { completedAt: "desc" },
      include: {
        user: { select: { name: true, phone: true } },
        exam: {
          select: {
            title: true,
            subject: { select: { name: true, color: true } },
          },
        },
      },
    }),
    prisma.subject.findMany({
      take: 4,
      orderBy: { order: "asc" },
      include: {
        units: {
          include: {
            lessons: { select: { id: true } },
          },
        },
        questions: { select: { id: true } },
        exams: { select: { id: true } },
      },
    }),
  ]);

  const attemptsCount = attempts.length;
  const avgScore =
    attemptsCount > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attemptsCount
        )
      : 0;

  // Complete List of 10 Integrated Administrative Services (Vercel Style)
  const administrativeServices = [
    {
      title: "المناهج والدروس",
      desc: "تحرير الدروس، مشغلات الفيديو والبودكاست والخرائط الذهنية",
      href: "/admin/curriculum",
      icon: BookOpen,
      stat: `${lessonsCount} درس`,
    },
    {
      title: "الهيكل والأنظمة والصفوف",
      desc: "إدارة الأنظمة التعليمية، الصفوف، وتوزيع المواد والمسارات",
      href: "/admin/structure",
      icon: Layers,
      stat: `${subjectsCount} مادة`,
    },
    {
      title: "بنك الأسئلة والتفسيرات",
      desc: "إضافة وتعديل وحذف الأسئلة وربط المفاهيم التعليمية",
      href: "/admin/questions",
      icon: HelpCircle,
      stat: `${questionsCount} سؤال`,
    },
    {
      title: "استيراد الأسئلة المجمع",
      desc: "رفع بنوك أسئلة كاملة عبر ملفات CSV أو لصق نصي",
      href: "/admin/questions/import",
      icon: Upload,
      stat: "CSV / JSON",
    },
    {
      title: "إدارة الامتحانات الرسمية",
      desc: "إنشاء وجدولة الامتحانات، وتحديد التوقيت وربط الأسئلة",
      href: "/admin/exams",
      icon: Award,
      stat: `${examsCount} امتحان`,
    },
    {
      title: "سجل المحاولات والتصحيح",
      desc: "متابعة إجابات الطلاب، وتصحيح الأسئلة المقالية في الوقت الفعلي",
      href: "/admin/attempts",
      icon: CheckCircle2,
      stat: `${attemptsCount} محاولة`,
    },
    {
      title: "شؤون الطلاب والمستخدمين",
      desc: "متابعة أداء الطلاب، ترقية المسؤولين، ومراجعة السجلات",
      href: "/admin/users",
      icon: Users,
      stat: `${studentsCount} طالب`,
    },
    {
      title: "مركز رفع الوسائط والملفات",
      desc: "رفع ملفات الصوت (البودكاست)، الخرائط الذهنية ومستندات PDF",
      href: "/admin/media",
      icon: HardDrive,
      stat: "Upload Center",
    },
    {
      title: "التحليلات ومؤشرات الأداء",
      desc: "مؤشرات التحصيل، توزيع صعوبة الأسئلة، وسجل تدقيق العمليات",
      href: "/admin/analytics",
      icon: Activity,
      stat: `${avgScore}% معدل`,
    },
  ];

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        {/* 1. Vercel Command Center Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                لوحة القيادة الإدارية والأكاديمية
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                v2.4
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              إدارة مركزية كاملة للمناهج، الامتحانات، بنك الأسئلة، والتحصيل الأكاديمي
            </p>
          </div>

          {/* Quick Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/exams"
              className="h-8 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إنشاء امتحان</span>
            </Link>
            <Link
              href="/admin/media"
              className="h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>رفع وسائط</span>
            </Link>
            <Link
              href="/admin/questions/import"
              className="h-8 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>استيراد أسئلة</span>
            </Link>
          </div>
        </div>

        {/* 2. 6 Geist-Style Minimalist Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                الطلاب النشطون
              </span>
              <Users className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {studentsCount}
              </span>
            </div>
            <span className="text-[10px] text-emerald-500 font-mono mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>حسابات نشطة</span>
            </span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                المواد الدراسية
              </span>
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {subjectsCount}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-2">
              في {unitsCount} وحدة تعليمية
            </span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                الدروس المنشورة
              </span>
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {lessonsCount}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-2">
              بودكاست وفيديو وخرائط
            </span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                بنك الأسئلة
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {questionsCount}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-2">
              مع التفسير والمفاهيم
            </span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                الامتحانات
              </span>
              <Award className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {examsCount}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-2">
              رسمية وتدريبية
            </span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                متوسط التحصيل
              </span>
              <Trophy className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {avgScore}%
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-2">
              من {attemptsCount} محاولة
            </span>
          </div>
        </div>

        {/* 3. Core Administrative Services Matrix (All 9 Modules) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              الخدمات والعمليات الإدارية المتكاملة
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">
              9 خدمات نشطة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {administrativeServices.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <Link
                  key={idx}
                  href={srv.href}
                  className="group p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {srv.stat}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                      <span>{srv.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                      {srv.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 4. Two-Column Live Stream: Realtime Submissions + Subject Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Realtime Submissions */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                <span>أحدث محاولات الطلاب المكتملة</span>
              </h3>
              <Link
                href="/admin/attempts"
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 font-medium"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentAttempts.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">
                لا توجد محاولات مكتملة مسجلة بعد.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                        {attempt.user?.name || "طالب"}
                      </span>
                      <span className="text-[10px] text-zinc-400 block font-mono">
                        {attempt.exam?.title || "اختبار"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono font-bold text-xs ${
                          (attempt.percentage || 0) >= 85
                            ? "text-emerald-500"
                            : (attempt.percentage || 0) >= 50
                            ? "text-amber-500"
                            : "text-red-500"
                        }`}
                      >
                        {attempt.percentage}%
                      </span>
                      <Link
                        href="/admin/attempts"
                        className="text-[11px] text-zinc-400 hover:text-zinc-200"
                      >
                        مراجعة
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Curriculum & Subject Saturation */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-400" />
                <span>حالة المناهج وتغطية المواد الدراسية</span>
              </h3>
              <Link
                href="/admin/curriculum"
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 font-medium"
              >
                <span>المناهج</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {subjectsWithStats.map((sub) => {
                const subLessons = sub.units.reduce(
                  (acc, u) => acc + u.lessons.length,
                  0
                );
                return (
                  <div
                    key={sub.id}
                    className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub.color || "#4F46E5" }}
                      />
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {sub.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
                      <span>{sub.units.length} وحدات</span>
                      <span>·</span>
                      <span>{subLessons} درس</span>
                      <span>·</span>
                      <span>{sub.questions.length} سؤال</span>
                      <span>·</span>
                      <span>{sub.exams.length} امتحانات</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Vercel-Style Infrastructure Telemetry Bar */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>PostgreSQL Cluster Operational</span>
            </span>
            <span>·</span>
            <span>Prisma 6.4.1</span>
            <span>·</span>
            <span>Next.js 16 App Router</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/analytics"
              className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              عرض سجل التدقيق
            </Link>
            <Link
              href="/admin/structure"
              className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              إدارة الهيكل الأكاديمي
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
