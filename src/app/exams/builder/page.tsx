import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { ExamBuilderForm } from "@/components/exams/ExamBuilderForm";

interface ExamBuilderPageProps {
  searchParams: Promise<{
    subjectId?: string;
    unitId?: string;
    lessonId?: string;
  }>;
}

export default async function ExamBuilderPage({
  searchParams,
}: ExamBuilderPageProps) {
  const user = await getCurrentUser();
  const { subjectId, unitId, lessonId } = await searchParams;

  // Fetch all published subjects with their units and lessons
  const subjects = await prisma.subject.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
    include: {
      units: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true },
          },
        },
      },
    },
  });

  return (
    <StudentShell user={user}>
      <div className="max-w-4xl mx-auto space-y-6 text-right font-sans">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-[#14243D] dark:text-white">
            صانع الامتحانات التكيفي الذكي
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
            حدد نطاق الأسئلة، الصعوبة، والنوع لتوليد اختبار مخصص يناسب خطتك الدراسية تماماً
          </p>
        </div>

        <ExamBuilderForm
          subjects={subjects}
          initialSubjectId={subjectId}
          initialUnitId={unitId}
          initialLessonId={lessonId}
        />
      </div>
    </StudentShell>
  );
}
