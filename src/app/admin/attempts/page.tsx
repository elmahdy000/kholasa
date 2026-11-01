import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canGradeAttempts } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { AttemptsManagerClient } from "@/components/admin/AttemptsManagerClient";
import { ExamService } from "@/services";

export default async function AdminAttemptsPage() {
  const user = await getCurrentUser();

  if (!user || !canGradeAttempts(user.role)) {
    redirect("/login?callbackUrl=/admin/attempts");
  }

  const [attemptsData, subjects] = await Promise.all([
    ExamService.getAdminAttemptsList({ page: 1, pageSize: 20 }),
    prisma.subject.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const attemptsList =
    attemptsData && "attempts" in attemptsData
      ? (attemptsData.attempts as any[])
      : Array.isArray(attemptsData)
      ? attemptsData
      : [];

  const pagination =
    attemptsData && "pagination" in attemptsData
      ? attemptsData.pagination
      : { page: 1, pageSize: 20, totalCount: attemptsList.length, totalPages: 1 };

  const formattedAttempts = attemptsList.map((att: any) => ({
    id: att.id,
    title: att.title,
    mode: att.mode,
    score: att.score,
    percentage: att.percentage,
    timeSpentSeconds: att.timeSpentSeconds,
    isCompleted: att.isCompleted,
    startedAt: typeof att.startedAt === "string" ? att.startedAt : att.startedAt.toISOString(),
    completedAt: att.completedAt
      ? typeof att.completedAt === "string"
        ? att.completedAt
        : att.completedAt.toISOString()
      : null,
    user: att.user,
    exam: att.exam,
  }));

  return (
    <AdminShell user={user}>
      <AttemptsManagerClient
        initialAttempts={formattedAttempts as any}
        initialPagination={pagination}
        subjects={subjects}
      />
    </AdminShell>
  );
}
