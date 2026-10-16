import { redirect } from "next/navigation";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { AdminShell } from "@/components/layout/AdminShell";
import { MediaManagerClient } from "@/components/admin/MediaManagerClient";
import { readdir, stat, mkdir } from "fs/promises";
import path from "path";

export default async function AdminMediaPage() {
  const user = await getCurrentUser();

  if (!user || !isStaff(user.role)) {
    redirect("/login?callbackUrl=/admin/media");
  }

  const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
  } catch {}

  const files = await readdir(UPLOADS_DIR);
  const fileList = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(UPLOADS_DIR, filename);
      const fileStat = await stat(filePath);
      const ext = path.extname(filename).toLowerCase();
      let type: "audio" | "image" | "document" | "video" | "other" = "other";
      if ([".mp3", ".wav", ".ogg", ".m4a", ".aac"].includes(ext)) {
        type = "audio";
      } else if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"].includes(ext)) {
        type = "image";
      } else if ([".mp4", ".webm", ".mkv", ".mov"].includes(ext)) {
        type = "video";
      } else if ([".pdf", ".doc", ".docx", ".txt", ".json", ".csv"].includes(ext)) {
        type = "document";
      }

      return {
        name: filename,
        url: `/uploads/${filename}`,
        size: fileStat.size,
        createdAt: fileStat.birthtime.toISOString(),
        type,
        ext,
      };
    })
  );

  fileList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AdminShell user={user}>
      <MediaManagerClient initialFiles={fileList} />
    </AdminShell>
  );
}
