import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageCurriculum } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { QuestionWordImporter } from "@/components/admin/QuestionWordImporter";

interface AdminQuestionsImportPageProps {
  searchParams?: Promise<{
    subjectId?: string;
    unitId?: string;
    lessonId?: string;
  }>;
}

export default async function AdminQuestionsImportPage({
  searchParams,
}: AdminQuestionsImportPageProps) {
  const user = await getCurrentUser();

  if (!user || !canManageCurriculum(user.role)) {
    redirect("/login?callbackUrl=/admin/questions/import");
  }

  const params = searchParams ? await searchParams : {};

  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      units: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return (
    <AdminShell user={user}>
      <div className="font-sans text-right max-w-5xl mx-auto pb-12">
        <QuestionWordImporter
          subjects={subjects as any}
          initialSubjectId={params.subjectId}
          initialUnitId={params.unitId}
          initialLessonId={params.lessonId}
        />
      </div>
    </AdminShell>
  );
}
