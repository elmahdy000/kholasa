import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { QuestionBankManagerClient } from "@/components/admin/QuestionBankManagerClient";

export default async function AdminQuestionsPage({ searchParams }: {
  searchParams: Promise<{ action?: string; subjectId?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (!user || !isStaff(user.role)) {
    redirect("/login?callbackUrl=/admin/questions");
  }

  // Fetch all questions, subjects with curriculum hierarchy, and baccalaureate grades
  const [questions, subjects, grades] = await Promise.all([
    prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true, gradeId: true, schoolCategory: true } },
        unit: { select: { id: true, title: true } },
        lessons: {
          include: {
            lesson: { select: { id: true, title: true } },
          },
        },
        options: { orderBy: { order: "asc" } },
        explanation: true,
        rubric: true,
        batch: { select: { id: true, fileName: true, fileType: true } },
      },
    }),
    prisma.subject.findMany({
      where: {
        system: { code: "baccalaureate" },
      },
      orderBy: { order: "asc" },
      include: {
        grade: { select: { id: true, name: true, code: true } },
        track: { select: { id: true, name: true, code: true } },
        units: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true },
            },
          },
        },
      },
    }),
    prisma.grade.findMany({
      where: {
        system: { code: "baccalaureate" },
        code: { in: ["bacc_g10", "bacc_g11"] },
      },
      orderBy: { order: "asc" },
      include: {
        tracks: { orderBy: { name: "asc" } },
      },
    }),
  ]);

  return (
    <AdminShell user={user}>
      <div className="space-y-6 text-right font-sans">
        <div className="border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
            بنك الأسئلة والتفسيرات التفاعلية
          </h1>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
            إدارة الأسئلة، مراجعة خيارات الإجابة، استيراد ملفات الوورد، وربط المفاهيم التعليمية بالدروس
          </p>
        </div>

        <QuestionBankManagerClient
          initialQuestions={questions as any}
          subjects={subjects as any}
          grades={grades as any}
          openCreate={params.action === "create"}
          initialSubjectId={params.subjectId}
        />
      </div>
    </AdminShell>
  );
}
