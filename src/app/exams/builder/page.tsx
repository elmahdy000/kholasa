import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isAdminOrAssistant } from "@/lib/roles";
import { getCurriculumScope, subjectScopeWhere } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { ExamBuilderForm } from "@/components/exams/ExamBuilderForm";
import { StudentPaywallView } from "@/components/student/subscription/StudentPaywallView";

export const metadata: Metadata = {
  title: "بنك الأسئلة الذكي والامتحانات التفاعلية | الخلاصة للبكالوريا",
  description:
    "كوّن تدريبك المخصص وامتحاناتك التفاعلية من بنك أسئلة البكالوريا المصرية (بكالوريا عربي وبكالوريا لغات) مع نماذج إجابة معتمدة وتصحيح ذكي بإشراف Dr/Elmahdy.",
  alternates: {
    canonical: "/exams/builder",
  },
};

interface ExamBuilderPageProps {
  searchParams: Promise<{
    subjectId?: string;
    unitId?: string;
    lessonId?: string;
    questionCount?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ExamBuilderPage({
  searchParams,
}: ExamBuilderPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/exams/builder");
  }

  const isStaff = isAdminOrAssistant(user.role);
  if (!isStaff && user.subscriptionStatus !== "ACTIVE") {
    return (
      <StudentShell user={user}>
        <StudentPaywallView
          isExam={true}
          examTitle="تجهيز وتوليد الامتحانات المخصصة"
          user={user}
        />
      </StudentShell>
    );
  }

  const scope = getCurriculumScope(user);
  const { subjectId, unitId, lessonId, questionCount } = await searchParams;

  // Fetch published subjects for the student's curriculum
  const subjects = await prisma.subject.findMany({
    where: {
      isPublished: true,
      ...(isStaff ? {} : { isUnderConstruction: false }),
      ...subjectScopeWhere(scope),
    },
    orderBy: { order: "asc" },
    include: {
      units: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true },
          },
        },
      },
    },
  });

  return (
    <StudentShell user={user}>
      <div className="w-full max-w-[1240px] mx-auto space-y-5 text-right font-sans pb-16">
        {/* Compact Breadcrumb & Header */}
        <div className="pb-3 border-b border-[#E8E9ED] dark:border-[#22364F]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1">
            <Link
              href={user ? "/dashboard" : "/"}
              className="hover:text-[#800B34] dark:hover:text-[#BD123F] transition-colors"
            >
              الرئيسية
            </Link>
            <span className="text-[#64748B]/60 dark:text-[#64748B]">/</span>
            <Link
              href="/subjects"
              className="hover:text-[#800B34] dark:hover:text-[#BD123F] transition-colors"
            >
              المواد الدراسية
            </Link>
            <span className="text-[#64748B]/60 dark:text-[#64748B]">/</span>
            <span className="text-[#12263F] dark:text-[#F5F7FB] font-bold">تجهيز امتحان</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#12263F] dark:text-[#F5F7FB] tracking-tight">
            جهّز امتحانك
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-normal">
            اختار اللي عايز تراجع عليه، وحدد مستوى التحدي، وابدأ اختبارك.
          </p>
        </div>

        <ExamBuilderForm
          subjects={subjects}
          initialSubjectId={subjectId}
          initialUnitId={unitId}
          initialLessonId={lessonId}
          initialQuestionCount={questionCount ? Number(questionCount) : undefined}
        />
      </div>
    </StudentShell>
  );
}
