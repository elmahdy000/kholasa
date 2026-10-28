"use client";

import { useRef } from "react";
import {
  Image as ImageIcon,
  Plus,
  Upload,
  Loader2,
  Maximize2,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";

interface LessonMindMapTabProps {
  mindMapTitle: string;
  setMindMapTitle: (v: string) => void;
  mindMapDescription: string;
  setMindMapDescription: (v: string) => void;
  mindMapImages: string[];
  newImageUrl: string;
  setNewImageUrl: (v: string) => void;
  onAddImage: () => void;
  onRemoveImage: (idx: number) => void;
  onMoveImage: (idx: number, dir: "up" | "down") => void;
  uploadingMedia: "video" | "audio" | "mindmap" | "summary_pdf" | "summary_image" | "content_pdf" | null;
  onUploadMedia: (file: File, target: "mindmap") => void;
  onPreviewImage: (url: string) => void;
}

export function LessonMindMapTab({
  mindMapTitle,
  setMindMapTitle,
  mindMapDescription,
  setMindMapDescription,
  mindMapImages,
  newImageUrl,
  setNewImageUrl,
  onAddImage,
  onRemoveImage,
  onMoveImage,
  uploadingMedia,
  onUploadMedia,
  onPreviewImage,
}: LessonMindMapTabProps) {
  const mindMapInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      {/* Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            عنوان الخريطة الذهنية
          </label>
          <input
            type="text"
            value={mindMapTitle}
            onChange={(e) => setMindMapTitle(e.target.value)}
            placeholder="مثال: خريطة مفاهيم الوراثة والجينات"
            className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            إرشادات أو وصف للخريطة (اختياري)
          </label>
          <input
            type="text"
            value={mindMapDescription}
            onChange={(e) => setMindMapDescription(e.target.value)}
            placeholder="مثال: ركّز على الفروق في الجزء الأيمن قبل الامتحان"
            className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          />
        </div>
      </div>

      {/* Add New Image Input */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#E11D48]/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>إضافة صورة خريطة ذهنية جديدة (MindMap Image URL)</span>
          </span>
          <span className="text-[13px] text-[#64748B] font-bold">
            تدعم JPG, PNG, WebP, SVG
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... أو رابط مباشر للصورة"
            className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            dir="ltr"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddImage();
              }
            }}
          />
          <button
            type="button"
            onClick={onAddImage}
            disabled={!newImageUrl.trim()}
            className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة بالرابط</span>
          </button>

          <input
            type="file"
            ref={mindMapInputRef}
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) onUploadMedia(e.target.files[0], "mindmap");
            }}
          />
          <button
            type="button"
            onClick={() => mindMapInputRef.current?.click()}
            disabled={uploadingMedia === "mindmap"}
            className="h-11 px-4 rounded-xl bg-[#0F172A] hover:bg-[#0F172A] dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#1E293B] text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            {uploadingMedia === "mindmap" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploadingMedia === "mindmap" ? "جاري الرفع..." : "رفع من الجهاز"}</span>
          </button>
        </div>
      </div>

      {/* Images Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            معرض الخرائط المرفوعة لهذا الدرس ({mindMapImages.length})
          </h4>
          <span className="text-[13px] text-[#94A3B8]">
            يمكنك تغيير ترتيب الصور أو حذفها في أي وقت
          </span>
        </div>

        {mindMapImages.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-dashed border-[#E2E8F0] dark:border-[#334155] text-center space-y-2">
            <div className="w-11 h-11 mx-auto rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] text-[#94A3B8] flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              لم يتم رفع أي صور خرائط ذهنية بعد.
            </p>
            <p className="text-[13px] text-[#94A3B8] max-w-md mx-auto">
              أضف روابط الصور عالية الدقة بالأعلى لتظهر للطالب في تبويب "خريطة المفاهيم" مع أدوات التكبير ومعرض الصور الكامل.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mindMapImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={`خريطة ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute("data-failed", "true");
                    }}
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 text-white text-[13px] font-bold">
                    خريطة {idx + 1}
                  </div>

                  <button
                    type="button"
                    onClick={() => onPreviewImage(imgUrl)}
                    className="absolute bottom-2 left-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    title="تكبير ومعاينة"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 flex items-center justify-between gap-2 border-t border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]">
                  <span className="text-[13px] font-mono text-[#94A3B8] truncate max-w-[120px]" dir="ltr">
                    {imgUrl.split("/").pop() || "image"}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onMoveImage(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded-md text-[#94A3B8] hover:text-[#800020] disabled:opacity-30 transition-colors cursor-pointer"
                      title="تقديم الترتيب"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveImage(idx, "down")}
                      disabled={idx === mindMapImages.length - 1}
                      className="p-1 rounded-md text-[#94A3B8] hover:text-[#800020] disabled:opacity-30 transition-colors cursor-pointer"
                      title="تأخير الترتيب"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveImage(idx)}
                      className="p-1 rounded-md text-[#DC2626] hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
