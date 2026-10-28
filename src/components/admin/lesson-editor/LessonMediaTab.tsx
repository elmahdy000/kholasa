"use client";

import { useRef } from "react";
import {
  Video,
  Headphones,
  Upload,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

interface LessonMediaTabProps {
  title: string;
  setTitle: (v: string) => void;
  durationMinutes: number;
  setDurationMinutes: (v: number) => void;
  order: number;
  setOrder: (v: number) => void;
  isPublished: boolean;
  setIsPublished: (v: boolean) => void;
  videoUrl: string;
  setVideoUrl: (v: string) => void;
  audioUrl: string;
  setAudioUrl: (v: string) => void;
  uploadingMedia: "video" | "audio" | "mindmap" | "summary_pdf" | "summary_image" | "content_pdf" | null;
  onUploadMedia: (file: File, target: "video" | "audio") => void;
  onOpenPairUploadModal: () => void;
}

export function LessonMediaTab({
  title,
  setTitle,
  durationMinutes,
  setDurationMinutes,
  order,
  setOrder,
  isPublished,
  setIsPublished,
  videoUrl,
  setVideoUrl,
  audioUrl,
  setAudioUrl,
  uploadingMedia,
  onUploadMedia,
  onOpenPairUploadModal,
}: LessonMediaTabProps) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // YouTube Embed helper
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="space-y-6">
      {/* Basic Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 space-y-2">
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            عنوان الدرس *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: الخلية الحية ووظائف العضيات"
            className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            المدة التقديرية (بالدقائق)
          </label>
          <input
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            ترتيب الدرس داخل الوحدة
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            حالة نشر الدرس للطلاب
          </label>
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`w-full h-11 px-4 rounded-xl text-[13px] font-bold flex items-center justify-between border transition-colors cursor-pointer ${
              isPublished
                ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399] border-[#059669]/20"
                : "bg-[#F8FAFC] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155]"
            }`}
          >
            <span className="flex items-center gap-2">
              {isPublished ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              <span>
                {isPublished
                  ? "منشور ومتاح للطلاب في التطبيق"
                  : "مسودة مخفية (غير مرئي للطلاب)"}
              </span>
            </span>
            <span className="text-[13px] px-2 py-1 rounded-md font-mono bg-white dark:bg-[#1E293B]">
              {isPublished ? "PUBLISHED" : "DRAFT"}
            </span>
          </button>
        </div>
      </div>

      {/* Video URL Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#0F172A] dark:text-white">
            <Video className="w-4 h-4 text-[#800020]" />
            <span>فيديو الدرس (YouTube / Vimeo / MP4 مباشر)</span>
          </div>
          <div>
            <input
              type="file"
              ref={videoInputRef}
              accept="video/mp4,video/webm,video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) onUploadMedia(e.target.files[0], "video");
              }}
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadingMedia === "video"}
              className="h-7 px-3 rounded-lg bg-[#800020]/10 hover:bg-[#800020]/20 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {uploadingMedia === "video" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploadingMedia === "video" ? "جاري الرفع..." : "رفع فيديو MP4"}</span>
            </button>
          </div>
        </div>

        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=... أو /uploads/video.mp4"
          className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          dir="ltr"
        />

        {embedUrl ? (
          <div className="aspect-video w-full max-w-lg rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-black mt-2">
            <iframe
              src={embedUrl}
              title="معاينة الفيديو"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : videoUrl ? (
          <div className="rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-black mt-2 max-w-lg">
            <video
              src={videoUrl}
              controls
              className="w-full max-h-[300px]"
            />
          </div>
        ) : null}
      </div>

      {/* Podcast / Audio URL Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#0F172A] dark:text-white">
            <Headphones className="w-4 h-4 text-[#059669]" />
            <span>بودكاست الدرس / التسجيل الصوتي (audioUrl)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPairUploadModal}
              className="h-7 px-3 rounded-lg bg-[#800020]/10 hover:bg-[#800020]/20 text-[#800020] dark:text-[#F87171] text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>رفع صوت مع صورة الشرح</span>
            </button>

            <input
              type="file"
              ref={audioInputRef}
              accept="audio/mp3,audio/wav,audio/m4a,audio/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) onUploadMedia(e.target.files[0], "audio");
              }}
            />
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              disabled={uploadingMedia === "audio"}
              className="h-7 px-3 rounded-lg bg-[#059669]/10 hover:bg-[#059669]/20 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] text-[13px] font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {uploadingMedia === "audio" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploadingMedia === "audio" ? "جاري الرفع..." : "رفع ملف صوتي فقط"}</span>
            </button>
            <span className="text-[13px] font-bold text-[#059669] bg-[#059669]/10 px-2 py-1 rounded-md">
              الخلاصة الصوتية
            </span>
          </div>
        </div>

        <input
          type="url"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          placeholder="https://example.com/audio/lesson-summary.mp3 أو /uploads/podcast.mp3"
          className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          dir="ltr"
        />

        {audioUrl && (
          <div className="pt-2">
            <span className="text-[13px] font-bold text-[#64748B] block mb-2">
              معاينة الاستماع المباشر:
            </span>
            <audio
              src={audioUrl}
              controls
              className="w-full h-11 rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
