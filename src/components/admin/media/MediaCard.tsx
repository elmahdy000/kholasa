"use client";

import {
  Music,
  Image as ImageIcon,
  FileText,
  Video,
  HardDrive,
  Copy,
  Check,
  Download,
  ExternalLink,
  Trash2,
  Eye,
  Play,
  Pause,
} from "lucide-react";
import { MediaFile, formatFileSize } from "./types";

interface MediaCardProps {
  file: MediaFile;
  isCopied: boolean;
  isPlayingAudio: boolean;
  onPreview: (file: MediaFile) => void;
  onToggleAudio: (url: string) => void;
  onCopyUrl: (url: string) => void;
  onDelete: (filename: string) => void;
}

export function MediaCard({
  file,
  isCopied,
  isPlayingAudio,
  onPreview,
  onToggleAudio,
  onCopyUrl,
  onDelete,
}: MediaCardProps) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] p-4 flex flex-col justify-between space-y-3 hover:border-[#E2E8F0] dark:hover:border-[#E11D48]/60 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div
          onClick={() => onPreview(file)}
          className="flex items-center gap-3 min-w-0 cursor-pointer group/title"
        >
          <div className="w-11 h-11 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center shrink-0 text-[#64748B] dark:text-[#94A3B8] group-hover/title:border-[#800020] transition-colors">
            {file.type === "audio" && <Music className="w-5 h-5 text-[#800020]" />}
            {file.type === "image" && <ImageIcon className="w-5 h-5 text-[#059669]" />}
            {file.type === "document" && <FileText className="w-5 h-5 text-[#D97706]" />}
            {file.type === "video" && <Video className="w-5 h-5 text-[#DC2626]" />}
            {file.type === "other" && <HardDrive className="w-5 h-5 text-[#64748B]" />}
          </div>
          <div className="min-w-0">
            <span
              className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block truncate group-hover/title:text-[#800020] dark:group-hover/title:text-[#800020] transition-colors"
              title={file.name}
            >
              {file.name}
            </span>
            <span className="text-[13px] font-mono text-[#64748B] block mt-1">
              {formatFileSize(file.size)} · {new Date(file.createdAt).toLocaleDateString("ar-EG")}
            </span>
          </div>
        </div>

        <span className="px-2 py-1 rounded text-[13px] font-mono uppercase bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] shrink-0">
          {file.ext.replace(".", "")}
        </span>
      </div>

      {/* Inline Audio Preview */}
      {file.type === "audio" && (
        <button
          onClick={() => onToggleAudio(file.url)}
          className="w-full h-11 px-3 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#E11D48]/60 text-[#800020] dark:text-[#FB7185] text-[13px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
        >
          {isPlayingAudio ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>إيقاف المعاينة الصوتية</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>تشغيل ومعاينة البودكاست</span>
            </>
          )}
        </button>
      )}

      {/* Inline Image Preview Thumbnail */}
      {file.type === "image" && (
        <div
          onClick={() => onPreview(file)}
          className="h-28 rounded-lg overflow-hidden border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#1E293B] relative cursor-pointer group/img"
        >
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover transition-transform"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[13px] font-bold gap-2">
            <Eye className="w-4 h-4" />
            <span>معاينة مكبرة</span>
          </div>
        </div>
      )}

      {/* Video Indicator */}
      {file.type === "video" && (
        <div
          onClick={() => onPreview(file)}
          className="h-24 rounded-lg overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-[#0F172A] flex items-center justify-center cursor-pointer group/vid relative"
        >
          <div className="w-11 h-11 rounded-full bg-white/20 group-hover/vid:bg-white/30 flex items-center justify-center text-white transition-all">
            <Play className="w-5 h-5 fill-current mr-1" />
          </div>
          <span className="absolute bottom-2 right-2 text-[13px] font-mono text-[#64748B] bg-black/60 px-2 py-1 rounded">
            فيديو MP4
          </span>
        </div>
      )}

      {/* PDF Document Indicator */}
      {file.type === "document" && (
        <button
          onClick={() => onPreview(file)}
          className="w-full h-11 px-3 rounded-lg bg-[#D97706]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#FBBF24]/50 text-[#D97706] dark:text-[#FBBF24] text-[13px] font-semibold flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>معاينة المستند (PDF Viewer)</span>
        </button>
      )}

      {/* Action Buttons: Preview, Copy URL, Download, Delete */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] text-[13px]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(file)}
            className="h-7 px-3 rounded-md bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
            title="معاينة كاملة"
          >
            <Eye className="w-3 h-3 text-[#800020]" />
            <span>معاينة</span>
          </button>

          <button
            onClick={() => onCopyUrl(file.url)}
            className="h-7 px-2 rounded-md border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[13px] font-mono text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1 transition-colors cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-[#059669]" />
                <span className="text-[#059669] font-bold">تم!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>نسخ</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <a
            href={file.url}
            download={file.name}
            className="p-2 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors"
            title="تنزيل الملف"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors"
            title="فتح في علامة تبويب جديدة"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => onDelete(file.name)}
            className="p-2 rounded-md text-[#64748B] hover:text-[#DC2626] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            title="حذف الملف"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
