import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { BookOpen, ArrowLeft, Layers, Sparkles } from "lucide-react";

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
      <div className="space-y-6 text-right">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>المناهج والمقررات المعتمدة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white">
            المواد الدراسية
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 max-w-xl">
            اختر المادة لتستعرض وحداتها ودروسها التفصيلية وملخصات الزتونة الخاصة بها.
          </p>
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
                className="group p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-2xs"
                      style={{ backgroundColor: subj.color || "#4F46E5" }}
                    >
                      {subj.name[0]}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                      {subj.units.length} وحدات
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white group-hover:text-[#4F46E5] transition-colors">
                      {subj.name}
                    </h2>
                    <p className="text-xs text-[#475569] dark:text-slate-400 font-medium leading-relaxed mt-1.5 line-clamp-3">
                      {subj.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#475569] dark:text-slate-400 font-mono text-[11px]">
                    {totalLessons} درس وملخص
                  </span>
                  <span className="text-[#4F46E5] flex items-center gap-1 group-hover:-translate-x-1 transition-transform font-bold">
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
