export interface MediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: string;
  type: "audio" | "image" | "document" | "video" | "other";
  ext: string;
}

export interface MediaManagerClientProps {
  initialFiles: MediaFile[];
}

export type MediaType = "audio" | "image" | "document" | "video" | "other";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
