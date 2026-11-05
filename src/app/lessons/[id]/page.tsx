import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope, isSubjectInScope } from "@/lib/curriculum";
import { StudentShell } from "@/components/layout/StudentShell";
import { LessonViewer } from "@/components/lessons/LessonViewer";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const lesson = await prisma.lesson.findFirst({
    where: {
      id,
      isPublished: true,
      unit: { isPublished: true, subject: { isPublished: true } },
    },
    include: {
      unit: {
        include: {
          subject: true,
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true },
          },
        },
      },
      content: true,
      summary: true,
      mindMap: true,
      questions: {
        where: {
          question: { status: "PUBLISHED" },
        },
        select: {
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
              rubric: {
                select: {
                  modelAnswer: true,
                  modelAnswerTranslation: true,
                  criteria: true,
                  maxScore: true,
                },
              },
              explanation: {
                select: {
                  concept: true,
                  correctReason: true,
                },
              },
            },
          },
        },
      },
      progress: user
        ? {
            where: { userId: user.id },
          }
        : false,
    },
  });

  if (!lesson) {
    notFound();
  }

  // Students may only open lessons from their own curriculum.
  if (!isSubjectInScope(getCurriculumScope(user), lesson.unit.subject)) {
    notFound();
  }

  // Increment views count asynchronously
  prisma.lesson
    .update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    })
    .catch(() => {});

  let isBookmarked = false;
  if (user) {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        lessonId: lesson.id,
      },
    });
    isBookmarked = !!bookmark;
  }

  const isCompleted =
    Array.isArray(lesson.progress) && lesson.progress.length > 0
      ? lesson.progress[0].isCompleted
      : false;

  let initialMistakes: any[] = [];
  if (user) {
    const rawMistakes = await prisma.mistakeReview.findMany({
      where: {
        userId: user.id,
        isResolved: false,
        question: {
          lessons: {
            some: { lessonId: lesson.id },
          },
        },
      },
      orderBy: { lastAttemptAt: "desc" },
      include: {
        question: {
          include: {
            options: { orderBy: { order: "asc" } },
            explanation: true,
            rubric: true,
          },
        },
      },
    });

    initialMistakes = rawMistakes.map((m) => ({
      id: m.id,
      questionId: m.questionId,
      wrongCount: m.wrongCount,
      question: m.question,
    }));
  }

  // Fetch student's previously saved answers for this lesson's questions
  let initialQuestionAttempts: {
    questionId: string;
    selectedOptionId: string | null;
    essayText: string | null;
    isCorrect: boolean;
  }[] = [];

  if (user && lesson.questions.length > 0) {
    const rawAttempts = await prisma.questionAttempt.findMany({
      where: {
        userId: user.id,
        questionId: {
          in: lesson.questions.map((q) => q.question.id),
        },
      },
    });

    initialQuestionAttempts = rawAttempts.map((a) => ({
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
      essayText: a.essayText,
      isCorrect: a.isCorrect,
    }));
  }

  return (
    <StudentShell user={user}>
      <LessonViewer
        lesson={lesson as any}
        initialIsBookmarked={isBookmarked}
        initialIsCompleted={isCompleted}
        initialMistakes={initialMistakes}
        initialQuestionAttempts={initialQuestionAttempts}
        userId={user?.id}
      />
    </StudentShell>
  );
}
