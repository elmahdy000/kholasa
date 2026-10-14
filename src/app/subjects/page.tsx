import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { BookOpen, ArrowLeft, Layers, Sparkles, Zap } from "lucide-react";

export default async function SubjectsPage() {
  const user = await getCurrentUser();

  const subjects = await prisma.subject.findMany({
    where: { isPublished: true },
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
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              الرئيسية
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">المواد الدراسية</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
                المواد الدراسية والمناهج
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mt-1">
                اختر المادة لتستعرض وحداتها ودروسها التفصيلية وملخصات الزتونة المركزة.
              </p>
            </div>

            <Link
              href="/exams/builder"
              className="h-10 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-center shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
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
                className="group p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-2xs"
                      style={{ backgroundColor: subj.color || "#4F46E5" }}
                    >
                      {subj.name[0]}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-800">
                      {subj.units.length} وحدات
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#4F46E5] dark:group-hover:text-indigo-400 transition-colors">
                      {subj.name}
                    </h2>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mt-1.5 line-clamp-3">
                      {subj.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                    {totalLessons} درس وملخص
                  </span>
                  <span className="text-[#4F46E5] dark:text-indigo-400 flex items-center gap-1 group-hover:-translate-x-1 transition-transform font-bold">
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
