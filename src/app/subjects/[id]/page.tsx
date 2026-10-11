import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Clock,
  Play,
  Zap,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";

interface SubjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      units: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
            include: {
              summary: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  const totalLessons = subject.units.reduce(
    (sum, u) => sum + u.lessons.length,
    0
  );

  return (
    <StudentShell user={user}>
      <div className="space-y-8 text-right">
        {/* Back navigation */}
        <div>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#6858EA] transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لكل المواد</span>
          </Link>
        </div>

        {/* Subject Header Banner */}
        <section
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${subject.color || "#6858EA"} 0%, #14243D 100%)`,
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold backdrop-blur-sm">
                <Layers className="w-3.5 h-3.5" />
                <span>منهج معتمد • {subject.units.length} وحدات • {totalLessons} درس</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                {subject.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl leading-relaxed">
                {subject.description}
              </p>
            </div>

            <Link
              href={`/exams/builder?subjectId=${subject.id}`}
              className="h-12 px-6 rounded-2xl bg-white text-[#14243D] hover:bg-slate-100 text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all shrink-0"
            >
              <Zap className="w-4 h-4 text-[#FFBA55]" />
              <span>اختبار شامل على المادة</span>
            </Link>
          </div>
        </section>

        {/* Units and Lessons List */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-[#14243D] dark:text-white">
            الوحدات والدروس التفصيلية
          </h2>

          <div className="space-y-5">
            {subject.units.map((unit, index) => (
              <div
                key={unit.id}
                className="rounded-3xl bg-white dark:bg-[#111A2B] border border-[#E2E8F0] dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Unit Header */}
                <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#6858EA] block">
                      الوحدة {index + 1}
                    </span>
                    <h3 className="text-lg font-black text-[#14243D] dark:text-white">
                      {unit.title}
                    </h3>
                    {unit.description && (
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        {unit.description}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/exams/builder?subjectId=${subject.id}&unitId=${unit.id}`}
                    className="h-9 px-4 rounded-xl bg-[#6858EA]/10 hover:bg-[#6858EA]/20 text-[#6858EA] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 self-start sm:self-center"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>امتحان الوحدة</span>
                  </Link>
                </div>

                {/* Lessons in this Unit */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {unit.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#6858EA]/10 text-[#6858EA] flex items-center justify-center shrink-0 mt-0.5">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-[#14243D] dark:text-white leading-snug">
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{lesson.durationMinutes} دقيقة</span>
                            </span>
                            {lesson.summary && (
                              <span className="inline-flex items-center gap-1 text-[#11B7B4] font-bold">
                                <Sparkles className="w-3 h-3" />
                                <span>الزتونة متاحة</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/lessons/${lesson.id}`}
                        className="h-10 px-5 rounded-xl bg-[#6858EA] hover:bg-[#5444D8] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm shadow-[#6858EA]/20 transition-all shrink-0"
                      >
                        <span>ابدأ المذاكرة</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
