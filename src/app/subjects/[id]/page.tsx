import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, isSubjectInScope } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import {
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

  const [subject, userProgress] = await Promise.all([
    prisma.subject.findUnique({
      where: { id, isPublished: true },
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
    }),
    user?.id
      ? prisma.studentProgress.findMany({
          where: {
            userId: user.id,
            isCompleted: true,
          },
          select: { lessonId: true },
        })
      : [],
  ]);

  if (!subject) {
    notFound();
  }

  // Students may only open subjects from their own curriculum.
  if (!isSubjectInScope(getCurriculumScope(user), subject)) {
    notFound();
  }

  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));

  const totalLessons = subject.units.reduce(
    (sum, u) => sum + u.lessons.length,
    0
  );

  const completedCount = subject.units.reduce(
    (sum, u) => sum + u.lessons.filter((l) => completedLessonIds.has(l.id)).length,
    0
  );

  const subjectProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <StudentShell user={user}>
      <div className="space-y-7 text-right pb-16">
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
          <Link href="/dashboard" className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/subjects" className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]">
            المواد
          </Link>
          <span>/</span>
          <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">{subject.name}</span>
        </div>

        {/* Subject Header Banner (Vercel Style) */}
        <section className="relative overflow-hidden rounded-xl p-6 sm:p-8 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] ">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0]/80 dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                <Layers className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>منهج معتمد • {subject.units.length} وحدات • {totalLessons} درس</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                {subject.name}
              </h1>
              {subject.description && (
                <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-medium max-w-2xl leading-relaxed">
                  {subject.description}
                </p>
              )}

              {/* Progress Summary */}
              <div className="pt-2 flex items-center gap-3">
                <div className="w-36 h-2 rounded-full bg-[#F8FAFC] dark:bg-[#334155] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4F46E5] dark:bg-[#6366F1] transition-all duration-500"
                    style={{ width: `${subjectProgress}%` }}
                  />
                </div>
                <span className="text-[13px] font-mono font-bold text-[#64748B] dark:text-[#94A3B8]">
                  {completedCount} من {totalLessons} مكتمل ({subjectProgress}%)
                </span>
              </div>
            </div>

            <Link
              href={`/exams/builder?subjectId=${subject.id}`}
              className="h-11 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center justify-center gap-2  transition-all shrink-0 active:opacity-80"
            >
              <Zap className="w-3.5 h-3.5 text-[#D97706] fill-[#D97706]" />
              <span>اختبار شامل على المادة</span>
            </Link>
          </div>
        </section>

        {/* Units and Lessons List */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              الوحدات والدروس التفصيلية
            </h2>
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium">
              مرتبة حسب خطة المنهج
            </span>
          </div>

          <div className="space-y-4">
            {subject.units.map((unit, index) => {
              const unitCompleted = unit.lessons.filter((l) => completedLessonIds.has(l.id)).length;
              const unitTotal = unit.lessons.length;
              const unitProgress = unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0;

              return (
                <div
                  key={unit.id}
                  className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  overflow-hidden"
                >
                  {/* Unit Header */}
                  <div className="p-4 sm:p-5 bg-[#F8FAFC]/80 dark:bg-[#1E293B]/40 border-b border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-mono font-bold text-[#4F46E5] dark:text-[#6366F1]">
                          الوحدة {index + 1}
                        </span>
                        <span className="text-[13px] text-[#64748B]">•</span>
                        <span className="text-[13px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                          {unitCompleted} من {unitTotal} منجز ({unitProgress}%)
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {unit.title}
                      </h3>
                      {unit.description && (
                        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                          {unit.description}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/exams/builder?subjectId=${subject.id}&unitId=${unit.id}`}
                      className="h-11 px-4 rounded-lg bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-bold flex items-center justify-center gap-2 transition-all shrink-0 self-start sm:self-center border border-[#E2E8F0] dark:border-[#334155]"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#D97706] fill-[#D97706]" />
                      <span>امتحان الوحدة</span>
                    </Link>
                  </div>

                  {/* Lessons in this Unit */}
                  <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/80">
                    {unit.lessons.map((lesson) => {
                      const isLessonCompleted = completedLessonIds.has(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          className="p-4 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC]/60 dark:hover:bg-[#1E293B]/40 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
                                isLessonCompleted
                                  ? "bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399]"
                                  : "bg-[#4F46E5]/10 dark:bg-[#1E293B] text-[#4F46E5] dark:text-[#6366F1]"
                              }`}
                            >
                              {isLessonCompleted ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-1" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug">
                                  {lesson.title}
                                </h4>
                                {isLessonCompleted && (
                                  <span className="text-[13px] font-bold px-2 py-1 rounded-full bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399]">
                                    مكتمل
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">
                                <span className="flex items-center gap-1 font-mono text-[13px]">
                                  <Clock className="w-3 h-3 text-[#64748B]" />
                                  <span>{lesson.durationMinutes} دقيقة</span>
                                </span>
                                {lesson.summary && (
                                  <span className="inline-flex items-center gap-1 text-[#D97706] dark:text-[#FBBF24] font-bold">
                                    <Sparkles className="w-3 h-3" />
                                    <span>الزتونة جاهزة</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/lessons/${lesson.id}`}
                            className={`h-11 px-4 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all shrink-0 active:opacity-80 ${
                              isLessonCompleted
                                ? "bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155]"
                                : "bg-[#4F46E5] hover:bg-[#4338CA] text-white "
                            }`}
                          >
                            <span>{isLessonCompleted ? "مراجعة الدرس" : "ابدأ المذاكرة"}</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
