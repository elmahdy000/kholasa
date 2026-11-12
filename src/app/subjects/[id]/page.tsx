import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdminOrAssistant } from "@/lib/roles";
import { getCurriculumScope, isSubjectInScope, questionScopeWhere } from "@/lib/curriculum";
import { hasActiveSubscription, isTrialLesson } from "@/lib/lesson-access";
import { StudentShell } from "@/components/layout/StudentShell";
import { SubjectUnitsList } from "@/components/subjects/SubjectUnitsList";
import { SubjectUnderConstructionView } from "@/components/subjects/SubjectUnderConstructionView";
import { Lock, Target } from "lucide-react";

interface SubjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SubjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const subject = await prisma.subject.findUnique({
    where: { id },
    select: { name: true, description: true, schoolCategory: true },
  });

  if (!subject) {
    return { title: "المادة غير موجودة | الخلاصة للبكالوريا" };
  }

  const catLabel = subject.schoolCategory === "LANGUAGES" ? "بكالوريا لغات" : "بكالوريا عربي";
  const title = `${subject.name} (${catLabel})`;
  const description =
    subject.description ||
    `منهج ${subject.name} لطلاب البكالوريا المصرية (${catLabel}): وحدات المنهج، ملخصات الزتونة، وخرائط ذهنية وبنك أسئلة بإشراف Dr/Elmahdy.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | الخلاصة للبكالوريا`,
      description,
      url: `https://el-kholasa.online/subjects/${id}`,
    },
    alternates: {
      canonical: `/subjects/${id}`,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?callbackUrl=/subjects/${id}`);
  }

  const isStaff = isAdminOrAssistant(user.role);
  const isSubscriptionActive = hasActiveSubscription(user);
  const scope = getCurriculumScope(user);

  const [
    subject,
    userProgress,
    masteredAttempts,
    officialSubjectExam,
    publishedQuestionsCount,
  ] = await Promise.all([
    prisma.subject.findUnique({
      where: { id, isPublished: true },
      include: {
        grade: { select: { name: true, code: true } },
        track: { select: { name: true } },
        units: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                order: true,
                durationMinutes: true,
                isTrial: true,
                summary: { select: { id: true } },
                questions: {
                  select: { questionId: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.studentProgress.findMany({
      where: {
        userId: user.id,
        lesson: { unit: { subjectId: id } },
      },
      select: {
        lessonId: true,
        isCompleted: true,
        progressPercent: true,
      },
    }),
    prisma.questionAttempt.findMany({
      where: {
        userId: user.id,
        isCorrect: true,
        question: { subjectId: id },
      },
      select: { questionId: true },
    }),
    prisma.exam.findFirst({
      where: {
        subjectId: id,
        isCustom: false,
        isPublished: true,
        ...(scope?.schoolCategory ? { schoolCategory: scope.schoolCategory } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    }),
    prisma.question.count({
      where: {
        subjectId: id,
        status: "PUBLISHED",
        ...questionScopeWhere(scope),
      },
    }),
  ]);

  if (!subject) {
    notFound();
  }

  // Students may only open subjects belonging to their exact grade, school category & track.
  if (!isSubjectInScope(scope, subject)) {
    notFound();
  }

  if (subject.isUnderConstruction && !isStaff) {
    return (
      <StudentShell user={user}>
        <SubjectUnderConstructionView
          subjectName={subject.name}
          description={subject.description}
        />
      </StudentShell>
    );
  }

  const lessonProgressById: Record<string, { isCompleted: boolean; progressPercent: number }> = {};
  const completedLessonIds: string[] = [];

  for (const row of userProgress) {
    lessonProgressById[row.lessonId] = {
      isCompleted: row.isCompleted,
      progressPercent: row.progressPercent,
    };
    if (row.isCompleted) {
      completedLessonIds.push(row.lessonId);
    }
  }

  const completedSet = new Set(completedLessonIds);
  const masteredSet = new Set(masteredAttempts.map((a) => a.questionId));

  const totalLessons = subject.units.reduce((sum, u) => sum + u.lessons.length, 0);
  const completedCount = subject.units.reduce(
    (sum, u) => sum + u.lessons.filter((l) => completedSet.has(l.id)).length,
    0
  );
  const subjectProgress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const trialLessonsCount = subject.units.reduce(
    (sum, u) =>
      sum +
      u.lessons.filter((l) =>
        isTrialLesson({
          isTrial: l.isTrial,
          order: l.order,
          unit: { order: u.order },
        })
      ).length,
    0
  );

  // Only show comprehensive exam button if an official exam exists OR the subject has enough published questions for its exam builder.
  const comprehensiveExamHref = officialSubjectExam
    ? `/exams/${officialSubjectExam.id}`
    : !subject.isUnderConstruction && publishedQuestionsCount >= 30
      ? `/exams/builder?subjectId=${subject.id}`
      : null;

  const categoryBadge = subject.isCommonCategory
    ? "مادة عامة لكل المسارات"
    : subject.schoolCategory === "LANGUAGES"
      ? "مدارس لغات"
      : "مدارس عربي";

  return (
    <StudentShell user={user}>
      <div className="space-y-4 sm:space-y-5 text-right pb-8" dir="rtl">
        {/* Compact Breadcrumbs Navigation */}
        <nav
          aria-label="مسار التصفح"
          className="flex items-center flex-wrap gap-1.5 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]"
        >
          <Link href="/dashboard" className="hover:text-[#830D3C] dark:hover:text-[#FDA4AF] transition-colors">
            الرئيسية
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/subjects" className="hover:text-[#830D3C] dark:hover:text-[#FDA4AF] transition-colors">
            المواد
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#0B1D42] dark:text-white font-bold">{subject.name}</span>
        </nav>

        {/* Compact Subject Summary Header */}
        <section
          aria-label="ملخص المادة"
          className="rounded-2xl bg-white dark:bg-[#0D214D] border border-[#DFE6F0] dark:border-[#1E3A6E] shadow-[0_2px_12px_rgba(11,29,66,0.05)] p-4 sm:p-5"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {subject.grade?.name && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F5F7FB] dark:bg-[#071737] border border-[#DFE6F0] dark:border-[#1E3A6E] text-[11px] font-bold text-[#0B1D42] dark:text-[#CBD5E1]">
                    {subject.grade.name}
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FDF2F4] dark:bg-[#830D3C]/25 border border-[#F5D0DA]/70 dark:border-[#830D3C]/40 text-[11px] font-bold text-[#830D3C] dark:text-[#FDA4AF]">
                  {categoryBadge}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B1D42] dark:text-white leading-snug break-words">
                {subject.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-[#0B1D42] dark:text-[#E2E8F0] font-sans tabular-nums">
                  {subject.units.length} وحدات | {totalLessons} درس
                </span>
                <span aria-hidden="true" className="text-[#CBD5E1] dark:text-[#334155]">
                  •
                </span>
                <span className="font-sans tabular-nums">
                  {completedCount} من {totalLessons} درس مكتمل —{" "}
                  <strong
                    className={
                      subjectProgress >= 100
                        ? "text-[#15803D] dark:text-[#6EE7B7]"
                        : "text-[#830D3C] dark:text-[#FDA4AF]"
                    }
                  >
                    {subjectProgress}%
                  </strong>
                </span>
              </div>

              {/* Slim Progress Bar */}
              <div
                role="progressbar"
                aria-valuenow={subjectProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="نسبة إنجاز المادة"
                className="w-full max-w-md h-2 rounded-full bg-[#E8EEF6] dark:bg-[#1E3A6E] overflow-hidden"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    subjectProgress >= 100 ? "bg-[#15803D]" : "bg-[#830D3C]"
                  }`}
                  style={{ width: `${subjectProgress}%` }}
                />
              </div>
            </div>

            {comprehensiveExamHref && (
              <Link
                href={comprehensiveExamHref}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#830D3C] hover:bg-[#6B0930] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0 self-start md:self-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#830D3C]"
              >
                <Target className="w-4 h-4 shrink-0" />
                <span>الاختبار الشامل للمادة</span>
              </Link>
            )}
          </div>
        </section>

        {/* Compact Trial Limitation Notice (shown strictly when trial/non-subscribed) */}
        {!isSubscriptionActive && (
          <section
            aria-label="تنبيه فترة التجربة"
            className="rounded-xl bg-[#FDF6F3] dark:bg-[#231420] border border-[#E8D2CA] dark:border-[#830D3C]/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
          >
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#2A1622] border border-[#EBD5CC] dark:border-[#830D3C]/40 text-[#830D3C] dark:text-[#FDA4AF] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-[13px] font-semibold text-[#0B1D42] dark:text-[#F5F7FB] leading-relaxed">
                أنت حالياً في{" "}
                <strong className="font-extrabold text-[#830D3C] dark:text-[#FDA4AF]">
                  الفترة التجريبية
                </strong>{" "}
                — متاح لك{" "}
                {trialLessonsCount <= 1
                  ? "الدرس التجريبي المجاني فقط"
                  : `${trialLessonsCount} دروس مجانية فقط`}
                ، وباقي الدروس والاختبارات مقفولة للمشتركين.
              </p>
            </div>
            <Link
              href="/subscription"
              className="min-h-[44px] px-4 rounded-xl bg-white dark:bg-[#0D214D] hover:bg-[#FAF0EB] text-[#830D3C] dark:text-[#FDA4AF] border border-[#E5CFC6] dark:border-[#830D3C]/50 text-xs font-extrabold inline-flex items-center justify-center shrink-0 transition-colors"
            >
              تفعيل الاشتراك
            </Link>
          </section>
        )}

        {/* Interactive Grid / List Subject Lessons Workspace */}
        <SubjectUnitsList
          subjectId={subject.id}
          units={subject.units}
          completedLessonIds={completedLessonIds}
          lessonProgressById={lessonProgressById}
          masteredQuestionIds={Array.from(masteredSet)}
          isSubscriptionActive={isSubscriptionActive}
          isSubjectUnderConstruction={subject.isUnderConstruction}
          user={user}
        />
      </div>
    </StudentShell>
  );
}
