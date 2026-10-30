import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, subjectScopeWhere } from "@/lib/curriculum";
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
      where: { status: "PUBLISHED" },
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
        <nav aria-label="مسار التصفح" className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
          <Link
            href={user ? "/dashboard" : "/"}
            className="hover:text-[#800020] dark:hover:text-[#FB7185] transition-colors"
          >
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-[#12263F] dark:text-white font-bold">المواد الدراسية</span>
        </nav>

        {/* Hero Banner Section */}
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-[#E8E9ED] dark:border-[#334155] shadow-xs">
          <div className="relative z-10 space-y-4">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/8 dark:bg-[#FB7185]/10 border border-[#800020]/15 dark:border-[#FB7185]/20 text-xs font-bold text-[#800020] dark:text-[#FB7185] self-start">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>مناهج 2026 المعتمدة</span>
            </div>

            {/* Main Headline & Description */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12263F] dark:text-white tracking-tight">
                  المواد الدراسية
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  كل موادك ومناهجك في مكان واحد — شرح بسيط، ملخص مركز، وتدريبات على كل درس.
                </p>
              </div>

              {formattedSubjects.length > 0 && (
                <Link
                  href="/exams/builder"
                  className="h-10 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-[#FDE047]" />
                  <span>اختبر نفسك في أي مادة</span>
                </Link>
              )}
            </div>

            {/* Live Stats Row — Only when there are subjects */}
            {formattedSubjects.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E8E9ED]/60 dark:border-[#334155]/60">
                <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-[#12263F] dark:text-white font-mono block">
                    {formattedSubjects.length}
                  </span>
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                    مادة
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-[#800020] dark:text-[#FB7185] font-mono block">
                    {totalUnits}
                  </span>
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                    وحدة وفصل
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-[#12263F] dark:text-white font-mono block">
                    {totalLessons}
                  </span>
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                    درس
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-[#D97706] font-mono block">
                    {totalQuestions > 0 ? `+${totalQuestions}` : "متجدد"}
                  </span>
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                    سؤال وتدريب
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Subjects Explorer with Live Search, Filter Tabs & Grid */}
        <section aria-label="قائمة المواد الدراسية">
          <SubjectsExplorer subjects={formattedSubjects} />
        </section>
      </div>
    </StudentShell>
  );
}
