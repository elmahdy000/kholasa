"use client";

import { useState } from "react";
import {
  X,
  Copy,
  Check,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Music,
  Image as ImageIcon,
  FileText,
  Video,
  HardDrive,
  FileCheck,
} from "lucide-react";
import { MediaFile, formatFileSize } from "./types";

interface MediaPreviewModalProps {
  previewFile: MediaFile | null;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
  isCopied: boolean;
}

export function MediaPreviewModal({
  previewFile,
  onClose,
  onCopyUrl,
  isCopied,
}: MediaPreviewModalProps) {
  const [imageZoom, setImageZoom] = useState<number>(1);

  if (!previewFile) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6"
      dir="rtl"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 px-5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#334155] flex items-center justify-center shrink-0">
              {previewFile.type === "audio" && <Music className="w-5 h-5 text-[#800020]" />}
              {previewFile.type === "image" && <ImageIcon className="w-5 h-5 text-[#059669]" />}
              {previewFile.type === "document" && <FileText className="w-5 h-5 text-[#D97706]" />}
              {previewFile.type === "video" && <Video className="w-5 h-5 text-[#DC2626]" />}
              {previewFile.type === "other" && <HardDrive className="w-5 h-5 text-[#64748B]" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate" title={previewFile.name}>
                {previewFile.name}
              </h3>
              <div className="flex items-center gap-2 text-[13px] text-[#64748B] font-mono mt-1">
                <span>{formatFileSize(previewFile.size)}</span>
                <span>•</span>
                <span>{new Date(previewFile.createdAt).toLocaleDateString("ar-EG")}</span>
                <span className="uppercase px-2 py-0.2 rounded bg-[#E2E8F0] dark:bg-[#334155] text-[13px]">
                  {previewFile.ext.replace(".", "")}
                </span>
              </div>
            </div>
          </div>

          {/* Actions & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onCopyUrl(previewFile.url)}
              className="h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[13px] font-mono text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2 cursor-pointer"
              title="نسخ الرابط المباشر"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#059669]" />
                  <span className="text-[#059669] font-bold">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">نسخ الرابط</span>
                </>
              )}
            </button>

            <a
              href={previewFile.url}
              download={previewFile.name}
              className="h-11 px-3 rounded-lg bg-[#334155] hover:bg-[#334155] dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#1E293B] text-[13px] font-bold flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تنزيل</span>
            </a>

            <button
              onClick={onClose}
              className="w-11 h-11 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col items-center justify-center min-h-[350px]">
          {/* IMAGE PREVIEW */}
          {previewFile.type === "image" && (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-1 px-2">
                <button
                  onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#64748B] dark:text-[#F8FAFC]"
                  title="تصغير"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[13px] font-mono px-2 text-[#64748B] dark:text-[#F8FAFC]">
                  {Math.round(imageZoom * 100)}%
                </span>
                <button
                  onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                  className="p-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#64748B] dark:text-[#F8FAFC]"
                  title="تكبير"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setImageZoom(1)}
                  className="p-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#64748B] dark:text-[#F8FAFC]"
                  title="إعادة ضبط"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-auto max-w-full max-h-[65vh] rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] p-2">
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  style={{ transform: `scale(${imageZoom})`, transformOrigin: "center center" }}
                  className="max-h-[60vh] max-w-full object-contain mx-auto transition-transform duration-150"
                />
              </div>
            </div>
          )}

          {/* PDF / DOCUMENT PREVIEW */}
          {previewFile.type === "document" && (
            <div className="w-full h-full flex flex-col items-center">
              {previewFile.ext === ".pdf" ? (
                <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]">
                  <iframe
                    src={previewFile.url}
                    title={previewFile.name}
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="p-8 text-center space-y-4 bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] max-w-md">
                  <FileCheck className="w-12 h-12 text-[#D97706] mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">{previewFile.name}</h4>
                    <p className="text-[13px] text-[#64748B] mt-1">
                      هذا المستند يتطلب تحميله لفتحه في التطبيق المخصص له على جهازك
                    </p>
                  </div>
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#800020] text-white text-[13px] font-bold"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل المستند الآن</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* VIDEO PREVIEW */}
          {previewFile.type === "video" && (
            <div className="w-full max-w-3xl rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-black">
              <video
                src={previewFile.url}
                controls
                autoPlay
                className="w-full max-h-[65vh]"
              />
            </div>
          )}

          {/* AUDIO PREVIEW */}
          {previewFile.type === "audio" && (
            <div className="w-full max-w-lg p-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] flex items-center justify-center shrink-0">
                  <Music className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    {previewFile.name}
                  </h4>
                  <p className="text-[13px] text-[#64748B] mt-1">
                    تسجيل صوتي وبودكاست مخصص للدروس والمراجعات
                  </p>
                </div>
              </div>

              <audio
                src={previewFile.url}
                controls
                autoPlay
                className="w-full h-11 rounded-lg"
              />
            </div>
          )}

          {/* OTHER FILES */}
          {previewFile.type === "other" && (
            <div className="p-8 text-center space-y-4 bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] max-w-md">
              <HardDrive className="w-12 h-12 text-[#64748B] mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">{previewFile.name}</h4>
                <p className="text-[13px] text-[#64748B] mt-1">نوع الملف: {previewFile.ext}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
