import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { LessonEditorForm } from "@/components/admin/lesson-editor/LessonEditorForm";
import { ArabicLessonEditorForm } from "@/components/admin/arabic-lesson-editor/ArabicLessonEditorForm";

interface AdminLessonEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminLessonEditPage({ params }: AdminLessonEditPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || !isStaff(user.role)) {
    redirect(`/login?callbackUrl=/admin/curriculum/lessons/${id}`);
  }

  const lessonSubject = await prisma.lesson.findUnique({
    where: { id },
    select: {
      unit: {
        select: {
          subject: {
            select: {
              learningEngine: true,
            },
          },
        },
      },
    },
  });

  const isArabicGuided = lessonSubject?.unit?.subject?.learningEngine === "ARABIC_GUIDED";

  return (
    <AdminShell user={user}>
      <div className="max-w-5xl mx-auto space-y-6">
        {isArabicGuided ? (
          <ArabicLessonEditorForm lessonId={id} isStandaloneRoute={true} />
        ) : (
          <LessonEditorForm lessonId={id} isStandaloneRoute={true} />
        )}
      </div>
    </AdminShell>
  );
}
