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

  // Fetch only Baccalaureate educational structure and active curriculum
  const [grades, subjects] = await Promise.all([
    prisma.grade.findMany({
      where: {
        system: { code: "baccalaureate" },
      },
      orderBy: { order: "asc" },
      include: {
        tracks: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            name: true,
            nameEn: true,
            code: true,
          },
        },
      },
    }),
    prisma.subject.findMany({
      where: {
        system: { code: "baccalaureate" },
      },
      orderBy: { order: "asc" },
      include: {
        grade: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        track: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            code: true,
          },
        },
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
    }),
  ]);

  return (
    <AdminShell user={user}>
      <div className="font-sans text-right max-w-7xl mx-auto pb-16 px-4 sm:px-6">
        <QuestionWordImporter
          grades={grades as any}
          subjects={subjects as any}
          initialSubjectId={params.subjectId}
          initialUnitId={params.unitId}
          initialLessonId={params.lessonId}
        />
      </div>
    </AdminShell>
  );
}
