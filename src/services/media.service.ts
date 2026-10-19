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
   * List available media files in an upload category
   */
  static async listFiles(category: MediaCategory) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", category);
    try {
      const files = await fs.readdir(uploadDir);
      return files.map((file) => ({
        filename: file,
        url: `/uploads/${category}/${file}`,
        category,
      }));
    } catch {
      return [];
    }
  }
}
