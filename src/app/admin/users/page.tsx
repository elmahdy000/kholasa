import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { UserManagerClient } from "@/components/admin/UserManagerClient";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/users");
  }

  const [users, systems, grades, gradeUnits] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        loginCode: true,
        role: true,
        schoolCategory: true,
        createdAt: true,
        maxDevices: true,
        boundDevices: true,
        system: { select: { id: true, name: true } },
        grade: { select: { id: true, name: true } },
        attempts: {
          select: { id: true, score: true, percentage: true, startedAt: true },
        },
        progress: {
          select: { id: true, isCompleted: true, lastAccessedAt: true },
        },
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.educationalSystem.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
    prisma.grade.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, systemId: true },
    }),
    prisma.unit.findMany({
      where: { subject: { isPublished: true }, isPublished: true },
      select: {
        subject: { select: { gradeId: true, schoolCategory: true } },
        _count: { select: { lessons: true } },
      },
    }),
  ]);

  // Map lessons count by Grade ID AND School Category (Strict Separation: Arabic vs Languages)
  const curriculumLessonsMap: Record<string, number> = {};
  for (const u of gradeUnits) {
    const gid = u.subject?.gradeId;
    const cat = u.subject?.schoolCategory || "ARABIC";
    if (gid) {
      const key = `${gid}:${cat}`;
      curriculumLessonsMap[key] = (curriculumLessonsMap[key] || 0) + u._count.lessons;
    }
  }

  const mappedUsers = users.map((u) => {
    const completedCount = u.progress.filter((p) => p.isCompleted).length;
    const studentCat = u.schoolCategory || "ARABIC";
    const studentKey = `${u.grade?.id}:${studentCat}`;
    const totalForStudent =
      u.grade?.id && curriculumLessonsMap[studentKey]
        ? curriculumLessonsMap[studentKey]
        : studentCat === "LANGUAGES"
        ? 14
        : 18;

    const progressPercent =
      totalForStudent > 0
        ? Math.min(100, Math.round((completedCount / totalForStudent) * 100))
        : 0;

    const sessionTime = u.sessions[0]?.createdAt
      ? new Date(u.sessions[0].createdAt).getTime()
      : 0;
    const progressTime =
      u.progress.length > 0
        ? Math.max(...u.progress.map((p) => new Date(p.lastAccessedAt).getTime()))
        : 0;
    const attemptTime =
      u.attempts.length > 0
        ? Math.max(...u.attempts.map((a) => new Date(a.startedAt).getTime()))
        : 0;
    const maxTime = Math.max(sessionTime, progressTime, attemptTime);
    const lastActiveAt = maxTime > 0 ? new Date(maxTime).toISOString() : null;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      loginCode: u.loginCode,
      role: u.role,
      schoolCategory: u.schoolCategory,
      createdAt: u.createdAt,
      maxDevices: u.maxDevices,
      boundDevices: u.boundDevices,
      system: u.system,
      grade: u.grade,
      attempts: u.attempts,
      progress: u.progress,
      totalLessons: totalForStudent,
      progressPercent,
      lastActiveAt,
    };
  });

  return (
    <AdminShell user={user}>
      <div className="space-y-6 text-right font-sans">
        <div className="border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
            شؤون الطلاب وإدارة المستخدمين
          </h1>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium">
            متابعة تقدم الطلاب الأكاديمي، التحكم في الرتب والصلاحيات، وإدارة الحسابات
          </p>
        </div>

        <UserManagerClient
          initialUsers={mappedUsers as any}
          systems={systems}
          grades={grades}
          currentUserId={user.id}
          currentUserRole={user.role}
        />
      </div>
    </AdminShell>
  );
}
