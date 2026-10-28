import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { Plus, HardDrive, Upload } from "lucide-react";
import { AdminMetricCards } from "@/components/admin/dashboard/AdminMetricCards";
import { AdminServicesMatrix } from "@/components/admin/dashboard/AdminServicesMatrix";
import { AdminRecentActivity } from "@/components/admin/dashboard/AdminRecentActivity";
import { AdminTelemetryBar } from "@/components/admin/dashboard/AdminTelemetryBar";
import type { AdminDashboardMetrics } from "@/components/admin/dashboard/types";

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

  const metrics: AdminDashboardMetrics = {
    studentsCount,
    subjectsCount,
    unitsCount,
    lessonsCount,
    questionsCount,
    examsCount,
    attemptsCount,
    avgScore,
  };

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        {/* 1. Header Toolbar */}
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
              className="h-11 px-3 rounded-lg bg-[#334155] hover:bg-[#334155] dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#1E293B] text-[13px] font-semibold flex items-center gap-2 transition-all"
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

        {/* 2. Metric Cards */}
        <AdminMetricCards metrics={metrics} />

        {/* 3. Core Administrative Services Matrix */}
        <AdminServicesMatrix metrics={metrics} />

        {/* 4. Realtime Submissions + Subject Progress */}
        <AdminRecentActivity
          recentAttempts={recentAttempts}
          subjectsWithStats={subjectsWithStats}
        />

        {/* 5. Infrastructure Telemetry Bar */}
        <AdminTelemetryBar />
      </div>
    </AdminShell>
  );
}
