import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageExams } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { ExamCreateForm } from "@/components/admin/exams/ExamCreateForm";

export default async function AdminExamCreatePage() {
  const user = await getCurrentUser();

  if (!user || !canManageExams(user.role)) {
    redirect("/login?callbackUrl=/admin/exams/create");
  }

  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, color: true },
  });

  return (
    <AdminShell user={user}>
      <div className="space-y-6 text-right font-sans">
        <div className="border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
            إنشاء امتحان رسمي جديد
          </h1>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium">
            تحديد المادة، مدة الامتحان، نوع الاختبار (تدريب أو رسمي)، وتوليد أسئلة مبدئية
          </p>
        </div>

        <ExamCreateForm subjects={subjects} isStandaloneRoute={true} />
      </div>
    </AdminShell>
  );
}
