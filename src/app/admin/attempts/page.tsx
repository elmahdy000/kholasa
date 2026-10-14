import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { AttemptsManagerClient } from "@/components/admin/AttemptsManagerClient";

export default async function AdminAttemptsPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/attempts");
  }

  const [attempts, subjects] = await Promise.all([
    prisma.examAttempt.findMany({
      take: 60,
      orderBy: { startedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
        exam: {
          select: {
            id: true,
            title: true,
            durationMinutes: true,
            subject: { select: { name: true, color: true } },
          },
        },
      },
    }),
    prisma.subject.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const formattedAttempts = attempts.map((att) => ({
    id: att.id,
    title: att.title,
    mode: att.mode,
    score: att.score,
    percentage: att.percentage,
    timeSpentSeconds: att.timeSpentSeconds,
    isCompleted: att.isCompleted,
    startedAt: att.startedAt.toISOString(),
    completedAt: att.completedAt ? att.completedAt.toISOString() : null,
    user: att.user,
    exam: att.exam,
  }));

  return (
    <AdminShell user={user}>
      <AttemptsManagerClient
        initialAttempts={formattedAttempts as any}
        subjects={subjects}
      />
    </AdminShell>
  );
}
