import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, subjectScopeWhere } from "@/lib/curriculum";
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
  const scope = getCurriculumScope(user);
  const { subjectId, unitId, lessonId } = await searchParams;

  // Fetch published subjects for the student's curriculum
  const subjects = await prisma.subject.findMany({
    where: { isPublished: true, ...subjectScopeWhere(scope) },
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
      <div className="max-w-[1050px] mx-auto space-y-6 text-right font-sans">
        <div className="border-b border-[#E2E8F0] dark:border-[#334155] pb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] font-bold text-[#4F46E5] dark:text-[#6366F1] bg-[#4F46E5]/10 dark:bg-[#1E293B] px-3 py-1 rounded-md border border-[#E2E8F0]/60 dark:border-[#6366F1]">
              فصّل امتحانك على مزاجك
            </span>
            <span className="text-[13px] text-[#94A3B8] font-medium">• إعداد مخصص</span>
          </div>
          <h1 className="text-2xl sm:text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            تجهيز امتحان مخصص
          </h1>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium leading-relaxed">
            اختار المادة والدروس اللي عاوز تراجعها، ومستوى الصعوبة اللي يناسبك، وابدأ حل فوراً.
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
