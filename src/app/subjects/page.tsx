import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, subjectScopeWhere, questionScopeWhere } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { SubjectsExplorer, type SubjectItemData } from "@/components/subjects/SubjectsExplorer";
import {
  Layers,
  BookmarkCheck,
  Target,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const user = await getCurrentUser();
  const scope = getCurriculumScope(user);

  const [subjects, totalQuestions] = await Promise.all([
    prisma.subject.findMany({
      where: { isPublished: true, ...subjectScopeWhere(scope) },
      orderBy: { order: "asc" },
      include: {
        system: { select: { name: true } },
        grade: { select: { name: true } },
        track: { select: { name: true } },
        units: {
          where: { isPublished: true },
          include: {
            lessons: {
              where: { isPublished: true },
              select: { id: true },
            },
          },
        },
      },
    }),
    prisma.question.count({
      where: { status: "PUBLISHED", ...questionScopeWhere(scope) },
    }).catch(() => 0),
  ]);

  const formattedSubjects: SubjectItemData[] = subjects.map((subj) => ({
    id: subj.id,
    name: subj.name,
    code: subj.code,
    description: subj.description,
    color: subj.color,
    systemName: subj.system?.name || null,
    gradeName: subj.grade?.name || null,
    trackName: subj.track?.name || null,
    unitsCount: subj.units.length,
    lessonsCount: subj.units.reduce((sum, u) => sum + u.lessons.length, 0),
  }));

  const totalUnits = formattedSubjects.reduce((sum, s) => sum + s.unitsCount, 0);
  const totalLessons = formattedSubjects.reduce((sum, s) => sum + s.lessonsCount, 0);

  return (
    <StudentShell user={user}>
      <div className="space-y-8 text-right pb-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="مسار التصفح" className="flex items-center gap-2 text-xs font-semibold text-[#536681] dark:text-[#94A3B8]">
          <Link
            href={user ? "/dashboard" : "/"}
            className="hover:text-[#800B34] dark:hover:text-[#E9AD32] transition-colors"
          >
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-[#091B40] dark:text-white font-bold">المواد الدراسية</span>
        </nav>

        {/* Hero Banner Section */}
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-[0_8px_28px_rgba(9,27,64,0.07)]">
          <div className="relative z-10 space-y-4">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800B34]/10 dark:bg-[#E9AD32]/15 border border-[#800B34]/20 dark:border-[#E9AD32]/30 text-xs font-bold text-[#800B34] dark:text-[#E9AD32] self-start">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>مناهج 2026 المعتمدة</span>
            </div>

            {/* Main Headline & Description */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#091B40] dark:text-white tracking-tight">
                  المواد الدراسية
                </h1>
                <p className="text-xs sm:text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                  كل موادك ومناهجك في مكان واحد — شرح بسيط، ملخص مركز، وتدريبات على كل درس.
                </p>
              </div>

              {formattedSubjects.length > 0 && (
                <Link
                  href="/exams/builder"
                  className="h-11 px-5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-md shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-[#E9AD32]" />
                  <span>اختبر نفسك في أي مادة</span>
                </Link>
              )}
            </div>

            {/* Live Stats Row — Only when there are subjects */}
            {formattedSubjects.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E2E8F0] dark:border-[#1E3A6E]">
                <div className="p-3.5 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-[#091B40] dark:text-white font-mono block">
                    {formattedSubjects.length}
                  </span>
                  <span className="text-[11px] font-bold text-[#536681] dark:text-[#94A3B8] block">
                    مادة
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-[#800B34] dark:text-[#E9AD32] font-mono block">
                    {totalUnits}
                  </span>
                  <span className="text-[11px] font-bold text-[#536681] dark:text-[#94A3B8] block">
                    وحدة وفصل
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-[#091B40] dark:text-white font-mono block">
                    {totalLessons}
                  </span>
                  <span className="text-[11px] font-bold text-[#536681] dark:text-[#94A3B8] block">
                    درس
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-[#E9AD32] font-mono block">
                    {totalQuestions > 0 ? totalQuestions : "متجدد"}
                  </span>
                  <span className="text-[11px] font-bold text-[#536681] dark:text-[#94A3B8] block">
                    سؤال وتدريب
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Subjects Explorer with Live Search, Filter Tabs & Grid */}
        <section aria-label="قائمة المواد الدراسية">
          <SubjectsExplorer
            subjects={formattedSubjects}
            isStaff={user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.role === "TEACHER"}
          />
        </section>
      </div>
    </StudentShell>
  );
}
