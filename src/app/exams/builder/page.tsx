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
      <div className="max-w-[1050px] mx-auto space-y-6 text-right font-sans">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800">
              فصّل امتحانك على مزاجك
            </span>
            <span className="text-xs text-slate-400 font-medium">• إعداد مخصص</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">
            تجهيز امتحان مخصص
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1 font-medium leading-relaxed">
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
