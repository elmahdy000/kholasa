import { redirect } from "next/navigation";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { LessonEditorForm } from "@/components/admin/lesson-editor/LessonEditorForm";

interface AdminLessonEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminLessonEditPage({ params }: AdminLessonEditPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || !isStaff(user.role)) {
    redirect(`/login?callbackUrl=/admin/curriculum/lessons/${id}`);
  }

  return (
    <AdminShell user={user}>
      <div className="max-w-5xl mx-auto space-y-6">
        <LessonEditorForm lessonId={id} isStandaloneRoute={true} />
      </div>
    </AdminShell>
  );
}
