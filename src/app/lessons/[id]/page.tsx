import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { LessonViewer } from "@/components/lessons/LessonViewer";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const lesson = await prisma.lesson.findUnique({
    where: { id },
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

  return (
    <StudentShell user={user}>
      <LessonViewer
        lesson={lesson as any}
        initialIsBookmarked={isBookmarked}
        initialIsCompleted={isCompleted}
        userId={user?.id}
      />
    </StudentShell>
  );
}
