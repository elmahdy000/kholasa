import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageExams } from "@/lib/auth";
import { getCurriculumScope, isSubjectInScope } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { ExamSolver } from "@/components/exams/ExamSolver";
import { ExamWaitingRoom } from "@/components/exams/ExamWaitingRoom";
import { StudentPaywallView } from "@/components/student/subscription/StudentPaywallView";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ExamPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function ExamPage({ params, searchParams }: ExamPageProps) {
  const { id } = await params;
  const { attemptId: queryAttemptId } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?callbackUrl=/exams/${id}`);
  }

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      subject: true,
      questions: {
        orderBy: { order: "asc" },
        include: {
          question: {
            select: {
              id: true,
              statement: true,
              translation: true,
              type: true,
              difficulty: true,
              imageUrl: true,
              options: {
                select: { id: true, text: true, translation: true, order: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  // Custom (student-generated) exams are private to their creator
  if (exam.isCustom && exam.createdById !== user.id) {
    notFound();
  }

  // Official exams are limited to the student's own curriculum.
  if (!isSubjectInScope(getCurriculumScope(user), exam.subject)) {
    notFound();
  }

  const isStaff = canManageExams(user.role);

  // Draft exams are hidden from students
  if (!isStaff && exam.isPublished === false) {
    notFound();
  }

  // Subscription paywall for exams: only active subscribers can take exams
  if (!isStaff && user.subscriptionStatus !== "ACTIVE") {
    return (
      <StudentShell user={user}>
        <StudentPaywallView
          isExam={true}
          examTitle={exam.title}
          user={user}
        />
      </StudentShell>
    );
  }

  // Future scheduled exams: Show waiting room with countdown
  if (!isStaff && exam.startsAt && new Date(exam.startsAt) > new Date()) {
    return (
      <StudentShell user={user}>
        <ExamWaitingRoom
          exam={{
            id: exam.id,
            title: exam.title,
            description: exam.description,
            durationMinutes: exam.durationMinutes,
            startsAt: exam.startsAt,
            endsAt: exam.endsAt,
            subject: exam.subject,
            questionsCount: exam.questions.length,
          }}
        />
      </StudentShell>
    );
  }

  // Expired exams: Deadline has passed
  if (!isStaff && exam.endsAt && new Date(exam.endsAt) < new Date()) {
    return (
      <StudentShell user={user}>
        <div className="max-w-xl mx-auto py-16 px-4 text-center font-sans space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
            انتهى موعد هذا الامتحان
          </h2>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            تم إغلاق فترة التقديم لهذا الامتحان المجدول ولم يعد يقبل محاولات جديدة. يمكنك استكشاف الامتحانات والتدريبات الأخرى المتاحة.
          </p>
          <div className="pt-2">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#800B34] text-white text-[13px] font-bold hover:bg-[#680829] transition-colors"
            >
              <span>العودة لقائمة الامتحانات</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </StudentShell>
    );
  }

  // Find the current user's attempt only (never trust a foreign attemptId)
  let attempt = queryAttemptId
    ? await prisma.examAttempt.findFirst({
        where: { id: queryAttemptId, userId: user.id, examId: exam.id },
      })
    : await prisma.examAttempt.findFirst({
        where: { examId: exam.id, userId: user.id, isCompleted: false },
        orderBy: { startedAt: "desc" },
      });

  if (!attempt) {
    attempt = await prisma.examAttempt.create({
      data: {
        userId: user.id,
        examId: exam.id,
        title: exam.title,
        mode: exam.isPractice ? "PRACTICE" : "EXAM",
        totalQuestions: exam.questions.length,
      },
    });
  }

  const attemptId = attempt.id;

  // If already completed, redirect directly to results
  if (attempt.isCompleted) {
    redirect(`/exams/${exam.id}/results?attemptId=${attempt.id}`);
  }

  return (
    <StudentShell user={user}>
      <ExamSolver
        exam={exam as any}
        attemptId={attemptId}
        initialMode={attempt.mode === "PRACTICE" ? "PRACTICE" : "EXAM"}
        attemptStartedAt={attempt.startedAt.toISOString()}
      />
    </StudentShell>
  );
}
