import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { badRequest } from "@/lib/http";

export type MediaCategory = "audio" | "images" | "documents";
export type MediaType = "audio" | "image" | "document" | "video" | "other";

interface AllowedExt {
  category: MediaCategory;
  mimes: string[];
  contentType: string;
}

const ALLOWED_EXT: Record<string, AllowedExt> = {
  ".png": { category: "images", mimes: ["image/png"], contentType: "image/png" },
  ".jpg": { category: "images", mimes: ["image/jpeg"], contentType: "image/jpeg" },
  ".jpeg": { category: "images", mimes: ["image/jpeg"], contentType: "image/jpeg" },
  ".webp": { category: "images", mimes: ["image/webp"], contentType: "image/webp" },
  ".gif": { category: "images", mimes: ["image/gif"], contentType: "image/gif" },
  ".mp3": { category: "audio", mimes: ["audio/mpeg", "audio/mp3"], contentType: "audio/mpeg" },
  ".m4a": {
    category: "audio",
    mimes: ["audio/mp4", "audio/x-m4a", "audio/m4a"],
    contentType: "audio/mp4",
  },
  ".aac": { category: "audio", mimes: ["audio/aac", "audio/x-aac"], contentType: "audio/aac" },
  ".ogg": { category: "audio", mimes: ["audio/ogg", "application/ogg"], contentType: "audio/ogg" },
  ".wav": {
    category: "audio",
    mimes: ["audio/wav", "audio/x-wav", "audio/wave"],
    contentType: "audio/wav",
  },
  ".pdf": { category: "documents", mimes: ["application/pdf"], contentType: "application/pdf" },
  ".docx": {
    category: "documents",
    mimes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
};

const CATEGORIES: MediaCategory[] = ["audio", "images", "documents"];

/** Root of the private (non-public) upload storage. */
export function getUploadRoot() {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR || "storage/uploads");
}

/** Content type for an allowlisted extension, or null. */
export function contentTypeForExt(ext: string): string | null {
  return ALLOWED_EXT[ext.toLowerCase()]?.contentType ?? null;
}

export function isMediaCategory(value: string): value is MediaCategory {
  return (CATEGORIES as string[]).includes(value);
}

function startsWith(buf: Buffer, bytes: number[], offset = 0) {
  return bytes.every((b, i) => buf[offset + i] === b);
}

/** Verify the file signature matches the claimed extension. */
function sniffMatches(ext: string, buf: Buffer): boolean {
  const ascii = (s: number, e: number) => buf.subarray(s, e).toString("latin1");
  switch (ext) {
    case ".png":
      return startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case ".jpg":
    case ".jpeg":
      return startsWith(buf, [0xff, 0xd8, 0xff]);
    case ".gif":
      return ascii(0, 4) === "GIF8";
    case ".webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    case ".pdf":
      return ascii(0, 1024).includes("%PDF-");
    case ".docx":
      return startsWith(buf, [0x50, 0x4b, 0x03, 0x04]);
    case ".wav":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WAVE";
    case ".ogg":
      return ascii(0, 4) === "OggS";
    case ".mp3":
      return ascii(0, 3) === "ID3" || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0);
    case ".m4a":
      return ascii(4, 8) === "ftyp";
    case ".aac":
      return ascii(0, 3) === "ID3" || (buf[0] === 0xff && (buf[1] & 0xf0) === 0xf0);
    default:
      return false;
  }
}

export class MediaService {
  private static MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  /** Validate size, extension and MIME against the allowlist. */
  static validate(fileSize: number, mimeType: string, originalName: string) {
    if (fileSize <= 0) throw badRequest("الملف فارغ");
    if (fileSize > this.MAX_FILE_SIZE) {
      throw badRequest("حجم الملف يتجاوز الحد الأقصى المسموح به (50 ميجابايت)");
    }
    const ext = path.extname(originalName || "").toLowerCase();
    const rule = ALLOWED_EXT[ext];
    if (!rule) throw badRequest("نوع الملف غير مدعوم");
    const mime = (mimeType || "").toLowerCase().split(";")[0].trim();
    if (!rule.mimes.includes(mime)) throw badRequest("نوع الملف لا يطابق امتداده");
    return { ext, category: rule.category };
  }

  /**
   * Validate then save an upload to private storage with a random name.
   * URL scheme: /api/media/<category>/<uuid><ext>
   */
  static async saveUploadedBuffer(buffer: Buffer, originalName: string, mimeType?: string) {
    const { ext, category } = this.validate(buffer.length, mimeType || "", originalName);
    if (!sniffMatches(ext, buffer)) throw badRequest("محتوى الملف لا يطابق نوعه");

    const dir = path.join(getUploadRoot(), category);
    await fs.mkdir(dir, { recursive: true });
    const filename = `${crypto.randomUUID()}${ext}`;
    await fs.writeFile(path.join(/*turbopackIgnore: true*/ dir, filename), buffer, { flag: "wx" });

    return {
      success: true,
      url: `/api/media/${category}/${filename}`,
      filename: `${category}/${filename}`,
      size: buffer.length,
      type: ALLOWED_EXT[ext].contentType,
    };
  }

  private static typeForExt(ext: string): MediaType {
    if ([".mp3", ".wav", ".ogg", ".m4a", ".aac"].includes(ext)) return "audio";
    if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"].includes(ext)) return "image";
    if ([".mp4", ".webm", ".mkv", ".mov"].includes(ext)) return "video";
    if ([".pdf", ".doc", ".docx", ".txt", ".json", ".csv"].includes(ext)) return "document";
    return "other";
  }

  private static async readDirFiles(dir: string, namePrefix: string, urlPrefix: string) {
    let names: string[] = [];
    try {
      names = await fs.readdir(dir);
    } catch {
      return [];
    }
    const items = await Promise.all(
      names
        .filter((f) => !f.startsWith("."))
        .map(async (filename) => {
          try {
            const st = await fs.stat(path.join(dir, filename));
            if (!st.isFile()) return null;
            const ext = path.extname(filename).toLowerCase();
            return {
              name: `${namePrefix}${filename}`,
              url: `${urlPrefix}${filename}`,
              size: st.size,
              createdAt: st.birthtime.toISOString(),
              type: this.typeForExt(ext),
              ext,
            };
          } catch {
            return null;
          }
        })
    );
    return items.filter((i): i is NonNullable<typeof i> => i !== null);
  }

  /** List media from private storage plus legacy public/uploads. */
  static async listAllMediaFiles() {
    const legacy = await this.readDirFiles(
      path.join(process.cwd(), "public", "uploads"),
      "",
      "/uploads/"
    );
    const fresh = (
      await Promise.all(
        CATEGORIES.map((c) =>
          this.readDirFiles(path.join(/*turbopackIgnore: true*/ getUploadRoot(), c), `${c}/`, `/api/media/${c}/`)
        )
      )
    ).flat();

    const all = [...fresh, ...legacy];
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all;
  }

  /**
   * Delete a media file. `filename` is "<category>/<file>" (private storage)
   * or a bare name (legacy public/uploads).
   */
  static async deleteMediaFile(filename: string) {
    let filePath: string;
    const parts = filename.split("/");
    if (parts.length === 2 && isMediaCategory(parts[0])) {
      filePath = path.join(/*turbopackIgnore: true*/ getUploadRoot(), parts[0], path.basename(parts[1]));
    } else if (parts.length === 1) {
      filePath = path.join(process.cwd(), "public", "uploads", path.basename(filename));
    } else {
      throw badRequest("اسم ملف غير صالح");
    }
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
    return { success: true };
  }
}
