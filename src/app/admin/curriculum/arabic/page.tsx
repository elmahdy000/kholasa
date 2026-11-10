import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { ArabicCurriculumService } from "@/services/arabic-curriculum.service";
import {
  ArabicCurriculumManagerClient,
  type ArabicSubjectWorkspace,
} from "@/components/admin/ArabicCurriculumManagerClient";

export default async function AdminArabicCurriculumPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/curriculum/arabic");
  }

  const workspace = await ArabicCurriculumService.getAdminArabicWorkspace();

  return (
    <AdminShell user={user}>
      <ArabicCurriculumManagerClient
        initialSubjects={JSON.parse(JSON.stringify(workspace.subjects)) as ArabicSubjectWorkspace[]}
      />
    </AdminShell>
  );
}
