import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminStructurePage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/curriculum");
  }

  // Redirect to the unified Curriculum & Academic Structure management page
  redirect("/admin/curriculum");
}
