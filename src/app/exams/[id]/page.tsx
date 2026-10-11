import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
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
            include: {
              options: {
                orderBy: { order: "asc" },
              },
              explanation: true,
              rubric: true,
            },
          },
        },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  // Find or create an attempt for this user
  let attemptId = queryAttemptId;
  if (!attemptId) {
    const newAttempt = await prisma.examAttempt.create({
      data: {
        userId: user.id,
        examId: exam.id,
        title: exam.title,
        mode: exam.isPractice ? "PRACTICE" : "EXAM",
        totalQuestions: exam.questions.length,
      },
    });
    attemptId = newAttempt.id;
  }

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  });

  // If already completed, redirect directly to results
  if (attempt?.isCompleted) {
    redirect(`/exams/${exam.id}/results?attemptId=${attempt.id}`);
  }

  return (
    <StudentShell user={user}>
      <ExamSolver
        exam={exam as any}
        attemptId={attemptId}
        initialMode={attempt?.mode === "PRACTICE" ? "PRACTICE" : "EXAM"}
      />
    </StudentShell>
  );
}
