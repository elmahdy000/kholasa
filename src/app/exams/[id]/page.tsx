import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, isSubjectInScope } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { ExamSolver } from "@/components/exams/ExamSolver";

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
              type: true,
              difficulty: true,
              options: {
                select: { id: true, text: true, order: true },
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
      />
    </StudentShell>
  );
}
