"use client";

import { useState, useRef } from "react";
import { X, Plus, BookOpen, Video, Headphones, AlertCircle, Upload, Loader2 } from "lucide-react";

interface LessonCreateModalProps {
  isOpen: boolean;
  unitId: string;
  unitTitle: string;
  subjectName: string;
  onClose: () => void;
  onCreated: (newLesson: any) => void;
}

export function LessonCreateModal({
  isOpen,
  unitId,
  unitTitle,
  subjectName,
  onClose,
  onCreated,
}: LessonCreateModalProps) {
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [uploadingMedia, setUploadingMedia] = useState<"video" | "audio" | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMediaUpload = async (file: File, target: "video" | "audio") => {
    setUploadingMedia(target);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "فشل رفع الملف");
      }

      if (target === "video") setVideoUrl(data.url);
      if (target === "audio") setAudioUrl(data.url);
    } catch (err: any) {
      setErrorMsg(err.message || "تعذر رفع الملف");
    } finally {
      setUploadingMedia(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("يرجى إدخال عنوان الدرس");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          title: title.trim(),
          durationMinutes: Number(durationMinutes),
          videoUrl: videoUrl.trim() || null,
          audioUrl: audioUrl.trim() || null,
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "تعذر إنشاء الدرس");
      }

      onCreated(data.lesson);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "حدث خطأ أثناء إضافة الدرس");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-3 font-sans"
      dir="rtl"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                إضافة درس جديد
              </h3>
              <p className="text-[13px] text-[#64748B] font-bold">
                {subjectName} • {unitTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#334155] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="px-5 py-3 text-[13px] font-bold bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#1E293B] dark:text-[#F87171] border-b border-[#E2E8F0] dark:border-[#F87171] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              عنوان الدرس *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: النظرية الخلوية والميكروسكوبات"
              className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                المدة (دقائق)
              </label>
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                حالة النشر
              </label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-full h-11 px-3 rounded-xl text-[13px] font-bold flex items-center justify-center border transition-colors ${
                  isPublished
                    ? "bg-[#059669]/10 text-[#059669] border-[#059669]/20"
                    : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                }`}
              >
                {isPublished ? "منشور للطلاب" : "مسودة مخفية"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>رابط فيديو الدرس (YouTube أو MP4)</span>
              </label>
              <div>
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/mp4,video/webm,video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleMediaUpload(e.target.files[0], "video");
                  }}
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingMedia === "video"}
                  className="text-[13px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {uploadingMedia === "video" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  <span>{uploadingMedia === "video" ? "جاري الرفع..." : "رفع فيديو"}</span>
                </button>
              </div>
            </div>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... أو /uploads/video.mp4"
              className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5 text-[#059669]" />
                <span>بودكاست الدرس الصوتي (audioUrl)</span>
              </label>
              <div>
                <input
                  type="file"
                  ref={audioInputRef}
                  accept="audio/mp3,audio/wav,audio/m4a,audio/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleMediaUpload(e.target.files[0], "audio");
                  }}
                />
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={uploadingMedia === "audio"}
                  className="text-[13px] font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {uploadingMedia === "audio" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  <span>{uploadingMedia === "audio" ? "جاري الرفع..." : "رفع صوتي"}</span>
                </button>
              </div>
            </div>
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://example.com/audio/lesson.mp3 أو /uploads/audio.mp3"
              className="w-full h-11 px-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-white focus:outline-none focus:border-[#4F46E5]"
              dir="ltr"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center gap-2 transition-transform active:opacity-80 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إنشاء الدرس الآن</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
