import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { QuestionBankManagerClient } from "@/components/admin/QuestionBankManagerClient";

export default async function AdminQuestionsPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/questions");
  }

  // Fetch all questions and subjects with units
  const [questions, subjects] = await Promise.all([
    prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true } },
        unit: { select: { id: true, title: true } },
        options: { orderBy: { order: "asc" } },
        explanation: true,
        rubric: true,
      },
    }),
    prisma.subject.findMany({
      orderBy: { order: "asc" },
      include: {
        units: {
          orderBy: { order: "asc" },
          select: { id: true, title: true },
        },
      },
    }),
  ]);

  return (
    <AdminShell user={user}>
      <div className="space-y-6 text-right font-sans">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-[#14243D] dark:text-white">
            بنك الأسئلة والتفسيرات التفاعلية
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
            إدارة الأسئلة، مراجعة خيارات الإجابة، وربط المفاهيم التعليمية بالدروس
          </p>
        </div>

        <QuestionBankManagerClient
          initialQuestions={questions as any}
          subjects={subjects as any}
        />
      </div>
    </AdminShell>
  );
}
