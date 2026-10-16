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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 font-sans"
      dir="rtl"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100">
                إضافة درس جديد
              </h3>
              <p className="text-[11px] text-zinc-500 font-bold">
                {subjectName} • {unitTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="px-5 py-2.5 text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              عنوان الدرس *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: النظرية الخلوية والميكروسكوبات"
              className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                المدة (دقائق)
              </label>
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-zinc-300">
                حالة النشر
              </label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-full h-10 px-3 rounded-xl text-xs font-bold flex items-center justify-center border transition-colors ${
                  isPublished
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {isPublished ? "منشور للطلاب" : "مسودة مخفية"}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
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
                  className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-emerald-500" />
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
                  className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#4F46E5]"
              dir="ltr"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 text-xs font-bold text-slate-700 dark:text-zinc-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
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
