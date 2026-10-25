import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, subjectScopeWhere } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { BookOpen, ArrowLeft, Layers, Sparkles, Zap } from "lucide-react";

export default async function SubjectsPage() {
  const user = await getCurrentUser();
  const scope = getCurriculumScope(user);

  const subjects = await prisma.subject.findMany({
    where: { isPublished: true, ...subjectScopeWhere(scope) },
    orderBy: { order: "asc" },
    include: {
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
  });

  return (
    <StudentShell user={user}>
      <div className="space-y-6 text-right pb-16">
        {/* Breadcrumb & Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            <Link href="/dashboard" className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">
              الرئيسية
            </Link>
            <span>/</span>
            <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">المواد الدراسية</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-2xl sm:text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                المواد الدراسية والمناهج
              </h1>
              <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-xl mt-1">
                اختر المادة لتستعرض وحداتها ودروسها التفصيلية وملخصات الزتونة المركزة.
              </p>
            </div>

            <Link
              href="/exams/builder"
              className="h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold flex items-center gap-2 transition-all self-start sm:self-center shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-[#D97706] fill-[#D97706]" />
              <span>إنشاء اختبار شامل</span>
            </Link>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subj) => {
            const totalLessons = subj.units.reduce(
              (sum, u) => sum + u.lessons.length,
              0
            );

            return (
              <Link
                key={subj.id}
                href={`/subjects/${subj.id}`}
                className="group p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl "
                      style={{ backgroundColor: subj.color || "#800020" }}
                    >
                      {subj.name[0]}
                    </div>
                    <span className="text-[13px] font-mono font-bold text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#1E293B] px-3 py-1 rounded-md border border-[#E2E8F0]/60 dark:border-[#334155]">
                      {subj.units.length} وحدات
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors">
                      {subj.name}
                    </h2>
                    <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed mt-2 line-clamp-3">
                      {subj.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155]/80 flex items-center justify-between text-[13px] font-semibold">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-mono text-[13px]">
                    {totalLessons} درس وملخص
                  </span>
                  <span className="text-[#800020] dark:text-[#FB7185] flex items-center gap-1 font-bold">
                    <span>فتح المادة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </StudentShell>
  );
}
