import fs from "fs/promises";
import path from "path";

export type MediaCategory = "audio" | "images" | "documents";

export class MediaService {
  private static MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  private static ALLOWED_TYPES: Record<MediaCategory, string[]> = {
    audio: ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/wav"],
    images: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
    documents: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ],
  };

  /**
   * Validate file size and MIME type
   */
  static validate(fileSize: number, mimeType: string, category: MediaCategory) {
    if (fileSize > this.MAX_FILE_SIZE) {
      throw new Error("حجم الملف يتجاوز الحد الأقصى المسموح به (50 ميجابايت)");
    }

    const allowed = this.ALLOWED_TYPES[category];
    if (allowed && !allowed.includes(mimeType)) {
      throw new Error(`نوع الملف غير مدعوم لهذه الفئة. الأنواع المدعومة: ${allowed.join(", ")}`);
    }

    return true;
  }

  /**
   * Save an uploaded file buffer to public/uploads directory
   */
  static async saveFile(buffer: Buffer, originalFilename: string, category: MediaCategory) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", category);
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate safe clean filename with timestamp
    const ext = path.extname(originalFilename).toLowerCase();
    const cleanBase = path
      .basename(originalFilename, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const uniqueFilename = `${cleanBase}_${Date.now()}${ext}`;

    const filePath = path.join(uploadDir, uniqueFilename);
    await fs.writeFile(filePath, buffer);

    return {
      filename: uniqueFilename,
      url: `/uploads/${category}/${uniqueFilename}`,
      size: buffer.length,
      category,
    };
  }

  /**
   * List all uploaded media files in public/uploads with details
   */
  static async listAllMediaFiles() {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const files = await fs.readdir(uploadDir);
    const fileList = await Promise.all(
      files
        .filter((f) => !f.startsWith("."))
        .map(async (filename) => {
          const filePath = path.join(uploadDir, filename);
          try {
            const fileStat = await fs.stat(filePath);
            if (fileStat.isDirectory()) return null;

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
          } catch {
            return null;
          }
        })
    );

    const validFiles = fileList.filter(Boolean) as Array<{
      name: string;
      url: string;
      size: number;
      createdAt: string;
      type: "audio" | "image" | "document" | "video" | "other";
      ext: string;
    }>;

    validFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return validFiles;
  }

  /**
   * Save uploaded buffer into public/uploads
   */
  static async saveUploadedBuffer(buffer: Buffer, originalName: string, mimeType?: string) {
    if (buffer.length > this.MAX_FILE_SIZE) {
      throw new Error("حجم الملف يتجاوز الحد الأقصى المسموح به (50 ميجابايت)");
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const ext = path.extname(cleanName) || ".bin";
    const baseName = path.basename(cleanName, ext);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    const safeFilename = `${baseName}-${uniqueSuffix}${ext}`;

    const destination = path.join(uploadDir, safeFilename);
    await fs.writeFile(destination, buffer);

    return {
      success: true,
      url: `/uploads/${safeFilename}`,
      filename: safeFilename,
      size: buffer.length,
      type: mimeType || "application/octet-stream",
    };
  }

  /**
   * Delete uploaded media file
   */
  static async deleteMediaFile(filename: string) {
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", safeFilename);
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
    return { success: true };
  }
}

