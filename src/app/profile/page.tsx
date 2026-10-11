import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StudentShell } from "@/components/layout/StudentShell";
import { ProfileView } from "@/components/profile/ProfileView";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?callbackUrl=/profile");
  }

  // Fetch student analytics
  const [
    completedLessonsCount,
    attempts,
    resolvedMistakesCount,
    rawBookmarks,
    systems,
  ] = await Promise.all([
    prisma.studentProgress.count({
      where: { userId: user.id, isCompleted: true },
    }),
    prisma.examAttempt.findMany({
      where: { userId: user.id, isCompleted: true },
      select: { percentage: true },
    }),
    prisma.mistakeReview.count({
      where: { userId: user.id, isResolved: true },
    }),
    prisma.bookmark.findMany({
      where: { userId: user.id, lessonId: { not: null } },
    }),
    prisma.educationalSystem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        grades: { orderBy: { order: "asc" } },
      },
    }),
  ]);

  // Fetch bookmarked lessons
  const lessonIds = rawBookmarks
    .map((b) => b.lessonId)
    .filter((id): id is string => Boolean(id));
  const lessons = await prisma.lesson.findMany({
    where: { id: { in: lessonIds } },
    include: {
      unit: {
        include: {
          subject: { select: { name: true } },
        },
      },
    },
  });

  const bookmarks = rawBookmarks.map((b) => ({
    id: b.id,
    lesson: lessons.find((l) => l.id === b.lessonId) || null,
  }));

  const completedExamsCount = attempts.length;
  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
        )
      : 0;

  return (
    <StudentShell user={user}>
      <ProfileView
        user={user as any}
        stats={{
          completedLessonsCount,
          completedExamsCount,
          averageScore,
          resolvedMistakesCount,
        }}
        bookmarks={bookmarks as any}
        systems={systems as any}
      />
    </StudentShell>
  );
}
