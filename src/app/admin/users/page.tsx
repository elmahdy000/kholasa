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

  const [users, systems, grades] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        system: { select: { id: true, name: true } },
        grade: { select: { id: true, name: true } },
        attempts: {
          select: { id: true, score: true, percentage: true },
        },
        progress: { select: { id: true, isCompleted: true } },
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
  ]);

  return (
    <AdminShell user={user}>
      <div className="space-y-6 text-right font-sans">
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white">
            شؤون الطلاب وإدارة المستخدمين
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium">
            متابعة تقدم الطلاب الأكاديمي، التحكم في الرتب والصلاحيات، وإدارة الحسابات
          </p>
        </div>

        <UserManagerClient
          initialUsers={users as any}
          systems={systems}
          grades={grades}
          currentUserId={user.id}
          currentUserRole={user.role}
        />
      </div>
    </AdminShell>
  );
}
