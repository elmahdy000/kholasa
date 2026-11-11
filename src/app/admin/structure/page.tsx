import { redirect } from "next/navigation";
import { getCurrentUser, canManageStructure } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminStructurePage() {
  const user = await getCurrentUser();

  if (!user || !canManageStructure(user.role)) {
    redirect("/login?callbackUrl=/admin/curriculum");
  }

  // Redirect to the unified Curriculum & Academic Structure management page
  redirect("/admin/curriculum");
}
