"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Music,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Play,
  Pause,
} from "lucide-react";

interface AudioImagePairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: { audioUrl: string; imageUrl: string }) => void;
  title?: string;
  description?: string;
}

export function AudioImagePairModal({
  isOpen,
  onClose,
  onSuccess,
  title = "رفع تسجيل صوتي مع صورة الشرح",
  description = "اختر صورة الشرح أو الغلاف أولاً، ثم اختر الملف الصوتي وارفع الاثنين معاً بنقرة واحدة.",
}: AudioImagePairModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Clean object URLs on unmount / reset
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, [imagePreview, audioPreview]);

  if (!isOpen) return null;

  const handleSelectImage = (file: File) => {
    if (!file.type.startsWith("image/") && !file.name.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i)) {
      setErrorMsg("الرجاء اختيار ملف صورة صالح (PNG, JPG, WebP, SVG)");
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMsg(null);
  };

  const handleSelectAudio = (file: File) => {
    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      setErrorMsg("الرجاء اختيار ملف صوتي صالح (MP3, WAV, M4A, OGG)");
      return;
    }
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
    setErrorMsg(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleUpload = async () => {
    if (!imageFile) {
      setErrorMsg("يرجى اختيار الصورة أولاً");
      return;
    }
    if (!audioFile) {
      setErrorMsg("يرجى اختيار الملف الصوتي ثانياً");
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("audio", audioFile);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل رفع الملفين");
      }

      setSuccessMsg("تم رفع الصورة والملف الصوتي بنجاح!");
      setTimeout(() => {
        onSuccess({
          audioUrl: data.audioUrl,
          imageUrl: data.imageUrl,
        });
        handleClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء الرفع");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setImageFile(null);
    setAudioFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setImagePreview(null);
    setAudioPreview(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 font-sans"
      dir="rtl"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#800020]/10 text-[#800020] flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {title}
              </h3>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                {description}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="w-9 h-9 rounded-lg bg-white dark:bg-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white flex items-center justify-center transition-colors border border-[#E2E8F0] dark:border-[#334155] disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Banners */}
        {errorMsg && (
          <div className="px-5 py-3 text-[13px] font-bold bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#1E293B] dark:text-[#F87171] border-b border-[#E2E8F0] dark:border-[#F87171] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="px-5 py-3 text-[13px] font-bold bg-[#059669]/10 text-[#059669] dark:bg-[#1E293B] dark:text-[#34D399] border-b border-[#E2E8F0] dark:border-[#34D399] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#059669] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* STEP 1: IMAGE SELECTION */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-white text-[12px] font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#800020]" />
                  <span>الصورة أولاً (الغلاف أو خريطة الشرح)</span>
                </span>
              </div>
              {imageFile && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669]">
                  جاهزة
                </span>
              )}
            </div>

            <input
              type="file"
              ref={imageInputRef}
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleSelectImage(e.target.files[0]);
              }}
            />

            {imageFile && imagePreview ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
                <img
                  src={imagePreview}
                  alt="معاينة الصورة"
                  className="w-16 h-16 rounded-lg object-cover border border-[#E2E8F0] dark:border-[#334155] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#0F172A] dark:text-white truncate">
                    {imageFile.name}
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {formatFileSize(imageFile.size)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg text-[12px] font-bold bg-[#F8FAFC] dark:bg-[#334155] text-[#0F172A] dark:text-white hover:bg-[#E2E8F0] transition-colors"
                  >
                    تغيير
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                      setImagePreview(null);
                    }}
                    className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full h-24 rounded-xl border-2 border-dashed border-[#CBD5E1] dark:border-[#475569] hover:border-[#800020] dark:hover:border-[#800020] bg-white dark:bg-[#1E293B] flex flex-col items-center justify-center gap-1.5 text-center transition-colors cursor-pointer group"
              >
                <ImageIcon className="w-6 h-6 text-[#94A3B8] group-hover:text-[#800020] transition-colors" />
                <span className="text-[13px] font-bold text-[#0F172A] dark:text-white">
                  اضغط هنا لاختيار صورة الغلاف / الشرح
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  يدعم صيغ PNG, JPG, WebP حتى 10MB
                </span>
              </button>
            )}
          </div>

          {/* STEP 2: AUDIO SELECTION */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#059669] text-white text-[12px] font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-[#059669]" />
                  <span>الملف الصوتي ثانياً (التسجيل / البودكاست)</span>
                </span>
              </div>
              {audioFile && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669]">
                  جاهز
                </span>
              )}
            </div>

            <input
              type="file"
              ref={audioInputRef}
              accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleSelectAudio(e.target.files[0]);
              }}
            />

            {audioFile ? (
              <div className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#0F172A] dark:text-white truncate">
                        {audioFile.name}
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        {formatFileSize(audioFile.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg text-[12px] font-bold bg-[#F8FAFC] dark:bg-[#334155] text-[#0F172A] dark:text-white hover:bg-[#E2E8F0] transition-colors"
                    >
                      تغيير
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAudioFile(null);
                        if (audioPreview) URL.revokeObjectURL(audioPreview);
                        setAudioPreview(null);
                      }}
                      className="p-1.5 rounded-lg text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {audioPreview && (
                  <audio
                    src={audioPreview}
                    controls
                    className="w-full h-9 rounded-lg mt-1"
                  />
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="w-full h-24 rounded-xl border-2 border-dashed border-[#CBD5E1] dark:border-[#475569] hover:border-[#059669] dark:hover:border-[#059669] bg-white dark:bg-[#1E293B] flex flex-col items-center justify-center gap-1.5 text-center transition-colors cursor-pointer group"
              >
                <Music className="w-6 h-6 text-[#94A3B8] group-hover:text-[#059669] transition-colors" />
                <span className="text-[13px] font-bold text-[#0F172A] dark:text-white">
                  اضغط هنا لاختيار الملف الصوتي
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  يدعم صيغ MP3, WAV, M4A حتى 50MB
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#475569] text-[#475569] dark:text-[#94A3B8] hover:bg-white dark:hover:bg-[#1E293B] text-[13px] font-bold transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!imageFile || !audioFile || isUploading}
            className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري رفع الاثنين معاً...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>رفع الصورة والملف الصوتي معاً</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
