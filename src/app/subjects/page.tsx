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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6858EA]/10 text-xs font-bold text-[#6858EA]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>المناهج والمقررات المعتمدة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14243D] dark:text-white">
            المواد الدراسية
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-xl">
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
                className="group p-6 rounded-3xl bg-white dark:bg-[#111A2B] border border-[#E2E8F0] dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-[#6858EA]/50 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
                      style={{ backgroundColor: subj.color || "#6858EA" }}
                    >
                      {subj.name[0]}
                    </div>
                    <span className="text-xs font-bold text-[#6858EA] bg-[#6858EA]/10 px-3 py-1 rounded-full">
                      {subj.units.length} وحدات
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-[#14243D] dark:text-white group-hover:text-[#6858EA] transition-colors">
                      {subj.name}
                    </h2>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed mt-1.5 line-clamp-3">
                      {subj.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">
                    {totalLessons} درس وملخص
                  </span>
                  <span className="text-[#6858EA] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
