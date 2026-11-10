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
  BookOpen,
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
                  className="h-11 px-5 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-md shrink-0 self-start sm:self-auto cursor-pointer active:scale-[0.98]"
                >
                  <Target className="w-4 h-4 text-[#E9AD32]" />
                  <span>اختبر نفسك في أي مادة</span>
                </Link>
              )}
            </div>

            {/* Live Stats Row — Only when there are subjects */}
            {formattedSubjects.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-5 border-t border-[#E2E8F0] dark:border-[#1E3A6E]">
                {/* 1. Subjects */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#091B40]/30 dark:hover:border-white/30 transition-all flex flex-col justify-between gap-3 shadow-2xs group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-[13px] font-bold text-[#536681] dark:text-[#94A3B8]">
                      المواد الدراسية
                    </span>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#091B40]/10 dark:bg-white/10 text-[#091B40] dark:text-white flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#091B40] dark:text-white block">
                      {formattedSubjects.length}
                    </span>
                    <span className="text-[11px] text-[#536681] dark:text-[#94A3B8] font-medium block mt-0.5">
                      مقررات معتمدة
                    </span>
                  </div>
                </div>

                {/* 2. Units */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#800B34]/30 dark:hover:border-[#FB7185]/30 transition-all flex flex-col justify-between gap-3 shadow-2xs group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-[13px] font-bold text-[#536681] dark:text-[#94A3B8]">
                      الوحدات والفصول
                    </span>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#800B34]/10 dark:bg-[#800B34]/25 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#800B34] dark:text-[#FB7185] block">
                      {totalUnits}
                    </span>
                    <span className="text-[11px] text-[#536681] dark:text-[#94A3B8] font-medium block mt-0.5">
                      تغطية كاملة للمنهج
                    </span>
                  </div>
                </div>

                {/* 3. Lessons */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#0284C7]/30 dark:hover:border-[#38BDF8]/30 transition-all flex flex-col justify-between gap-3 shadow-2xs group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-[13px] font-bold text-[#536681] dark:text-[#94A3B8]">
                      الدروس التفصيلية
                    </span>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0284C7]/10 dark:bg-[#0284C7]/20 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                      <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#0284C7] dark:text-[#38BDF8] block">
                      {totalLessons}
                    </span>
                    <span className="text-[11px] text-[#536681] dark:text-[#94A3B8] font-medium block mt-0.5">
                      ملخصات وخرائط ذهنية
                    </span>
                  </div>
                </div>

                {/* 4. Questions */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#D97706]/30 dark:hover:border-[#FBBF24]/30 transition-all flex flex-col justify-between gap-3 shadow-2xs group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-[13px] font-bold text-[#536681] dark:text-[#94A3B8]">
                      أسئلة وتدريبات
                    </span>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E9AD32]/15 dark:bg-[#E9AD32]/25 text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#D97706] dark:text-[#FBBF24] block">
                      {totalQuestions > 0 ? totalQuestions.toLocaleString("ar-EG") : "متجدد"}
                    </span>
                    <span className="text-[11px] text-[#536681] dark:text-[#94A3B8] font-medium block mt-0.5">
                      تدريبات باختبارات فورية
                    </span>
                  </div>
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
