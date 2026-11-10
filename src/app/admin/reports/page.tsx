import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canViewAnalytics } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { DailyReportsService } from "@/services/daily-reports.service";
import { DailyReportsClient } from "@/components/admin/DailyReportsClient";

export const dynamic = "force-dynamic";

export default async function AdminDailyReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    category?: string;
    studyMode?: string;
    center?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user || !canViewAnalytics(user.role)) {
    redirect("/login?callbackUrl=/admin/reports");
  }

  const sp = await searchParams;
  const category =
    sp.category === "ARABIC" || sp.category === "LANGUAGES" ? sp.category : "ALL";
  const studyMode =
    sp.studyMode === "ONLINE" || sp.studyMode === "OFFLINE" ? sp.studyMode : "ALL";

  const [initialReport, systems, grades] = await Promise.all([
    DailyReportsService.getDailyReport({
      dateKey: sp.date,
      category,
      studyMode,
      centerName: sp.center,
    }),
    prisma.educationalSystem.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
    prisma.grade.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, systemId: true },
    }),
  ]);

  const canManageStudents =
    user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <AdminShell user={user}>
      <DailyReportsClient
        initialReport={initialReport}
        systems={systems}
        grades={grades}
        canManageStudents={canManageStudents}
      />
    </AdminShell>
  );
}
