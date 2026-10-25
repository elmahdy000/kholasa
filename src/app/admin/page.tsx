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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                لوحة القيادة الإدارية والأكاديمية
              </h1>
              <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                v2.4
              </span>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
              إدارة مركزية كاملة للمناهج، الامتحانات، بنك الأسئلة، والتحصيل الأكاديمي
            </p>
          </div>

          {/* Quick Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/exams"
              className="h-11 px-3 rounded-lg bg-[#334155] hover:bg-[#334155] dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#1E293B] text-[13px] font-semibold flex items-center gap-2 transition-all "
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إنشاء امتحان</span>
            </Link>
            <Link
              href="/admin/media"
              className="h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-medium flex items-center gap-2 transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>رفع وسائط</span>
            </Link>
            <Link
              href="/admin/questions/import"
              className="h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-medium flex items-center gap-2 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>استيراد أسئلة</span>
            </Link>
          </div>
        </div>

        {/* 2. 6 Geist-Style Minimalist Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]  flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
                الطلاب النشطون
              </span>
              <Users className="w-3.5 h-3.5 text-[#64748B]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                {studentsCount}
              </span>
            </div>
            <span className="text-[13px] text-[#059669] font-mono mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>حسابات نشطة</span>
            </span>
          </div>

          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]  flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
                المواد الدراسية
              </span>
              <BookOpen className="w-3.5 h-3.5 text-[#64748B]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                {subjectsCount}
              </span>
            </div>
            <span className="text-[13px] text-[#64748B] font-mono mt-2">
              في {unitsCount} وحدة تعليمية
            </span>
          </div>

          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]  flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
                الدروس المنشورة
              </span>
              <Layers className="w-3.5 h-3.5 text-[#64748B]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                {lessonsCount}
              </span>
            </div>
            <span className="text-[13px] text-[#64748B] font-mono mt-2">
              بودكاست وفيديو وخرائط
            </span>
          </div>

          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]  flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
                بنك الأسئلة
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-[#64748B]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                {questionsCount}
              </span>
            </div>
            <span className="text-[13px] text-[#64748B] font-mono mt-2">
              مع التفسير والمفاهيم
            </span>
          </div>

          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]  flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
                الامتحانات
              </span>
              <Award className="w-3.5 h-3.5 text-[#64748B]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                {examsCount}
              </span>
            </div>
            <span className="text-[13px] text-[#64748B] font-mono mt-2">
              رسمية وتدريبية
            </span>
          </div>

          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A]  flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
                متوسط التحصيل
              </span>
              <Trophy className="w-3.5 h-3.5 text-[#64748B]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                {avgScore}%
              </span>
            </div>
            <span className="text-[13px] text-[#64748B] font-mono mt-2">
              من {attemptsCount} محاولة
            </span>
          </div>
        </div>

        {/* 3. Core Administrative Services Matrix (All 9 Modules) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#64748B]">
              الخدمات والعمليات الإدارية المتكاملة
            </h2>
            <span className="text-[13px] font-mono text-[#64748B]">
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
                  className="group p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-[#E2E8F0] dark:hover:border-[#E11D48]/60 transition-colors  flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC] group- transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]">
                      {srv.stat}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors flex items-center justify-between">
                      <span>{srv.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed line-clamp-2">
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
          <div className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] space-y-4 ">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="text-[13px] font-mono uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#64748B]" />
                <span>أحدث محاولات الطلاب المكتملة</span>
              </h3>
              <Link
                href="/admin/attempts"
                className="text-[13px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1 font-medium"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentAttempts.length === 0 ? (
              <p className="text-[13px] text-[#64748B] py-6 text-center">
                لا توجد محاولات مكتملة مسجلة بعد.
              </p>
            ) : (
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="py-3 flex items-center justify-between text-[13px]"
                  >
                    <div>
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">
                        {attempt.user?.name || "طالب"}
                      </span>
                      <span className="text-[13px] text-[#64748B] block font-mono">
                        {attempt.exam?.title || "اختبار"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono font-bold text-[13px] ${
                          (attempt.percentage || 0) >= 85
                            ? "text-[#059669]"
                            : (attempt.percentage || 0) >= 50
                            ? "text-[#D97706]"
                            : "text-[#DC2626]"
                        }`}
                      >
                        {attempt.percentage}%
                      </span>
                      <Link
                        href="/admin/attempts"
                        className="text-[13px] text-[#64748B] hover:text-[#64748B]"
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
          <div className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] space-y-4 ">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <h3 className="text-[13px] font-mono uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#64748B]" />
                <span>حالة المناهج وتغطية المواد الدراسية</span>
              </h3>
              <Link
                href="/admin/curriculum"
                className="text-[13px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center gap-1 font-medium"
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
                    className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30 flex items-center justify-between text-[13px]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub.color || "#800020" }}
                      />
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {sub.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[13px] text-[#64748B]">
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
        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] font-mono text-[#64748B]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-[#059669] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
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
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
            >
              عرض سجل التدقيق
            </Link>
            <Link
              href="/admin/structure"
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
            >
              إدارة الهيكل الأكاديمي
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
