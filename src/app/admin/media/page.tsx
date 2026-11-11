import { redirect } from "next/navigation";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { MediaManagerClient } from "@/components/admin/MediaManagerClient";
import { MediaService } from "@/services/media.service";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const user = await getCurrentUser();

  if (!user || !isStaff(user.role)) {
    redirect("/login?callbackUrl=/admin/media");
  }

  // Load all media files from persistent categorized storage (audio, images, docs) + legacy uploads
  const fileList = await MediaService.listAllMediaFiles();

  return (
    <AdminShell user={user}>
      <MediaManagerClient initialFiles={fileList} />
    </AdminShell>
  );
}
