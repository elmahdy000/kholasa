import Link from "next/link";
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
      <div className="max-w-[1240px] mx-auto space-y-5 text-right font-sans pb-16">
        {/* Compact Breadcrumb & Header */}
        <div className="pb-3 border-b border-[#E8E9ED]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mb-1">
            <Link
              href={user ? "/dashboard" : "/"}
              className="hover:text-[#800020] transition-colors"
            >
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/subjects" className="hover:text-[#800020] transition-colors">
              المواد الدراسية
            </Link>
            <span>/</span>
            <span className="text-[#12263F] font-bold">تجهيز امتحان</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#12263F] tracking-tight">
            جهّز امتحانك
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 font-normal">
            اختار اللي عايز تراجع عليه، وحدد مستوى التحدي، وابدأ اختبارك.
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
