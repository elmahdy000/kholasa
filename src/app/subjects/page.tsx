import Link from "next/link";
import type { Metadata } from "next";
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
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مناهج ومقررات الخلاصة للبكالوريا (عربي ولغات)",
  description:
    "استكشف مناهج ومقررات البكالوريا المصرية المعتمدة على منصة الخلاصة للبكالوريا: بكالوريا عربي وبكالوريا لغات. مفاهيم الدروس، الخرائط الذهنية، وبنك أسئلة بتفسير معتمد بإشراف Dr/Elmahdy.",
  alternates: {
    canonical: "/subjects",
  },
  openGraph: {
    title: "مناهج ومقررات الخلاصة للبكالوريا (عربي ولغات)",
    description:
      "تصفح مناهج البكالوريا المصرية (بكالوريا عربي ولغات) على منصة الخلاصة للبكالوريا مع مفاهيم وخرائط ذهنية وتدريبات بتفسير معتمد بإشراف Dr/Elmahdy.",
    url: "https://el-kholasa.online/subjects",
  },
};

const formatCount = (value: number) => new Intl.NumberFormat("en-US").format(value);

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
    prisma.question
      .count({
        where: { status: "PUBLISHED", ...questionScopeWhere(scope) },
      })
      .catch(() => 0),
  ]);

  const formattedSubjects: SubjectItemData[] = subjects.map((subj) => ({
    id: subj.id,
    name: subj.name,
    code: subj.code,
    description: subj.description,
    color: subj.color,
    schoolCategory: subj.schoolCategory,
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
      <div className="max-w-[1200px] mx-auto space-y-8 text-right pb-12">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="مسار التصفح"
          className="flex items-center gap-2 text-xs font-semibold text-[#536681] dark:text-[#94A3B8]"
        >
          <Link
            href={user ? "/dashboard" : "/"}
            className="hover:text-[#800B34] dark:hover:text-[#FB7185] transition-colors"
          >
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-[#091B40] dark:text-white font-bold">المواد الدراسية</span>
        </nav>

        {/* Hero Summary Card */}
        <section className="rounded-xl p-5 sm:p-8 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
          <div className="space-y-5">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#800B34] dark:text-[#FB7185]">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>منصة الخلاصة للبكالوريا المصرية • عربي ولغات</span>
            </div>

            {/* Main Headline & Primary Action */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#091B40] dark:text-white leading-[1.35]">
                  مناهج ومقررات الخلاصة للبكالوريا
                </h1>
                <p className="text-sm sm:text-[15px] text-[#536681] dark:text-[#94A3B8] leading-[1.7] font-medium">
                  مناهج البكالوريا المصرية المعتمدة (بكالوريا عربي وبكالوريا لغات) — شرح المفاهيم الأساسية، خرائط ذهنية بصرية، وبنك أسئلة بالتفسير العلمي المعتمد بإشراف Dr/Elmahdy.
                </p>
              </div>

              {formattedSubjects.length > 0 && (
                <Link
                  href="/exams/builder"
                  className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors shrink-0 self-start sm:self-auto"
                >
                  <Target className="w-4 h-4 shrink-0" />
                  <span>اختبر نفسك في أي مادة</span>
                </Link>
              )}
            </div>

            {/* Live Verified Stats Grid */}
            {formattedSubjects.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-5 border-t border-[#E2E8F0] dark:border-[#334155]">
                {/* 1. Subjects */}
                <div className="p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#536681] dark:text-[#94A3B8]">
                      المواد الدراسية
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-[#091B40]/10 dark:bg-white/10 text-[#091B40] dark:text-white flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#091B40] dark:text-white block leading-none">
                      {formatCount(formattedSubjects.length)}
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium block">
                      مقررات معتمدة
                    </span>
                  </div>
                </div>

                {/* 2. Units */}
                <div className="p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#536681] dark:text-[#94A3B8]">
                      الوحدات والفصول
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-[#800B34]/10 dark:bg-[#800B34]/20 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#800B34] dark:text-[#FB7185] block leading-none">
                      {formatCount(totalUnits)}
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium block">
                      وحدات المنهج المنشورة
                    </span>
                  </div>
                </div>

                {/* 3. Lessons */}
                <div className="p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#536681] dark:text-[#94A3B8]">
                      الدروس التفصيلية
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-[#091B40]/10 dark:bg-white/10 text-[#091B40] dark:text-white flex items-center justify-center shrink-0">
                      <BookmarkCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#091B40] dark:text-white block leading-none">
                      {formatCount(totalLessons)}
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium block">
                      مفاهيم وخرائط ذهنية
                    </span>
                  </div>
                </div>

                {/* 4. Questions */}
                <div className="p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#536681] dark:text-[#94A3B8]">
                      أسئلة وتدريبات
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-[#059669]/10 text-[#059669] dark:text-[#34D399] flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-bold font-sans tabular-nums text-[#059669] dark:text-[#34D399] block leading-none">
                      {totalQuestions > 0 ? formatCount(totalQuestions) : "قيد الإعداد"}
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium block">
                      أسئلة بتفسير علمي معتمد
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Subjects Explorer with Live Search, Filter Tabs & Adaptive Grid */}
        <section aria-label="قائمة المواد الدراسية">
          <SubjectsExplorer
            subjects={formattedSubjects}
            isStaff={
              user?.role === "ADMIN" ||
              user?.role === "SUPER_ADMIN" ||
              user?.role === "TEACHER"
            }
          />
        </section>
      </div>
    </StudentShell>
  );
}
