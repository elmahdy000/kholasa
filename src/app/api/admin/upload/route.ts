import { NextResponse } from "next/server";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { writeFile, readdir, stat, unlink, mkdir } from "fs/promises";
import path from "path";

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureUploadsDir() {
  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    // Already exists or cannot create
  }
}

// GET: List all uploaded files with metadata
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    await ensureUploadsDir();

    const files = await readdir(UPLOADS_DIR);
    const fileList = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const fileStat = await stat(filePath);

        // Determine file category
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

    // Sort newest first
    fileList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ files: fileList });
  } catch (error) {
    console.error("Failed to list media files:", error);
    return NextResponse.json(
      { error: "تعذر تحميل قائمة الملفات" },
      { status: 500 }
    );
  }
}

// POST: Upload a file
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    await ensureUploadsDir();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم تحديد أي ملف" }, { status: 400 });
    }

    // Limit file size (50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "حجم الملف يتجاوز الحد الأقصى المسموح به (50 ميجابايت)" },
        { status: 400 }
      );
    }

    // Sanitize and create safe filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const ext = path.extname(originalName) || ".bin";
    const baseName = path.basename(originalName, ext);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    const safeFilename = `${baseName}-${uniqueSuffix}${ext}`;

    const destination = path.join(UPLOADS_DIR, safeFilename);
    await writeFile(destination, buffer);

    const publicUrl = `/uploads/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Failed to upload file:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء رفع الملف إلى الخادم" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an uploaded file
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "اسم الملف مطلوب" }, { status: 400 });
    }

    // Security check to avoid path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    await unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete file:", error);
    return NextResponse.json(
      { error: "تعذر حذف الملف من الخادم" },
      { status: 500 }
    );
  }
}
