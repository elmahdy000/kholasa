import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { ExamManagerClient } from "@/components/admin/ExamManagerClient";

export default async function AdminExamsPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/exams");
  }

  const [exams, subjects] = await Promise.all([
    prisma.exam.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        questions: { select: { id: true, questionId: true } },
        attempts: {
          select: { id: true, score: true, percentage: true, isCompleted: true },
        },
      },
    }),
    prisma.subject.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, color: true },
    }),
  ]);

  const formattedExams = exams.map((exam) => {
    const completedAttempts = exam.attempts.filter((a) => a.isCompleted);
    const attemptsCount = completedAttempts.length;
    const avgPercentage =
      attemptsCount > 0
        ? Math.round(
            completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
              attemptsCount
          )
        : 0;

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      isPractice: exam.isPractice,
      subject: exam.subject,
      questionsCount: exam.questions.length,
      attemptsCount,
      avgPercentage,
      createdAt: exam.createdAt.toISOString(),
    };
  });

  return (
    <AdminShell user={user}>
      <div className="space-y-6 text-right font-sans">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white">
            إدارة الامتحانات والاختبارات الرسمية
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium">
            إنشاء وجدولة الامتحانات، التحكم في النشر، ومتابعة متوسط تحصيل الطلاب لكل اختبار
          </p>
        </div>

        <ExamManagerClient
          initialExams={formattedExams as any}
          subjects={subjects}
        />
      </div>
    </AdminShell>
  );
}
