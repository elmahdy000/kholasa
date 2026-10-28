"use client";

import { useState, useRef } from "react";
import {
  Music,
  Image as ImageIcon,
  Upload,
  Check,
  X,
} from "lucide-react";
import { formatFileSize, MediaFile } from "./types";

interface PairUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newFiles: MediaFile[]) => void;
}

export function PairUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: PairUploadModalProps) {
  const [pairImageFile, setPairImageFile] = useState<File | null>(null);
  const [pairAudioFile, setPairAudioFile] = useState<File | null>(null);
  const [pairImagePreview, setPairImagePreview] = useState<string | null>(null);
  const [pairAudioPreview, setPairAudioPreview] = useState<string | null>(null);
  const [isUploadingPair, setIsUploadingPair] = useState(false);
  const [pairUploadError, setPairUploadError] = useState<string | null>(null);
  const [pairUploadSuccess, setPairUploadSuccess] = useState<string | null>(null);

  const pairImageInputRef = useRef<HTMLInputElement>(null);
  const pairAudioInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setPairImageFile(null);
    setPairAudioFile(null);
    setPairImagePreview(null);
    setPairAudioPreview(null);
    setPairUploadError(null);
    setPairUploadSuccess(null);
  };

  const handleSelectPairImage = (file: File) => {
    if (!file.type.startsWith("image/") && !file.name.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i)) {
      setPairUploadError("الرجاء اختيار ملف صورة صالح (PNG, JPG, WebP, SVG)");
      return;
    }
    setPairImageFile(file);
    setPairImagePreview(URL.createObjectURL(file));
    setPairUploadError(null);
  };

  const handleSelectPairAudio = (file: File) => {
    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      setPairUploadError("الرجاء اختيار ملف صوتي صالح (MP3, WAV, M4A, OGG)");
      return;
    }
    setPairAudioFile(file);
    setPairAudioPreview(URL.createObjectURL(file));
    setPairUploadError(null);
  };

  const handlePairUploadSubmit = async () => {
    if (!pairImageFile || !pairAudioFile) {
      setPairUploadError("يجب اختيار الصورة وملف الصوت معاً أولاً");
      return;
    }

    setIsUploadingPair(true);
    setPairUploadError(null);
    setPairUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append("image", pairImageFile);
      formData.append("audio", pairAudioFile);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل رفع الملفين");

      setPairUploadSuccess("تم رفع الصورة والملف الصوتي معاً بنجاح!");

      // Refresh files list
      const listRes = await fetch("/api/admin/upload");
      const listData = await listRes.json();
      if (listData.files) {
        onUploadSuccess(listData.files);
      }

      setTimeout(() => {
        resetForm();
        onClose();
      }, 1400);
    } catch (err: any) {
      setPairUploadError(err.message || "حدث خطأ أثناء الرفع");
    } finally {
      setIsUploadingPair(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-xl overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#800020]/10 text-[#800020] dark:bg-[#800020]/25 dark:text-[#FB7185] flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                رفع تسجيل صوتي مع صورة الغلاف
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                اختار الصورة أولاً ثم اختار الملف الصوتي وارفع الاتنين مع بعض
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!isUploadingPair) {
                resetForm();
                onClose();
              }
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Step 1: Image Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#800020] text-white flex items-center justify-center text-[11px] font-mono font-bold">1</span>
                <span>اختيار صورة الغلاف أو خريطة الشرح</span>
              </label>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">PNG, JPG, WebP, SVG</span>
            </div>

            <input
              type="file"
              ref={pairImageInputRef}
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleSelectPairImage(e.target.files[0]);
              }}
            />

            {!pairImageFile ? (
              <div
                onClick={() => pairImageInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020] dark:hover:border-[#FB7185] rounded-xl text-center cursor-pointer transition-colors bg-[#F8FAFC] dark:bg-[#1E293B]/40 group"
              >
                <ImageIcon className="w-7 h-7 mx-auto mb-2 text-[#64748B] group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors" />
                <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  انقر هنا لاختيار صورة الغلاف أولاً
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  تظهر كغلاف للبودكاست أو صورة توضيحية للدرس
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {pairImagePreview && (
                    <img
                      src={pairImagePreview}
                      alt="Cover preview"
                      className="w-12 h-12 rounded-lg object-cover border border-[#E2E8F0] dark:border-[#334155] shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                      {pairImageFile.name}
                    </p>
                    <p className="text-[11px] text-[#64748B] font-mono">
                      {formatFileSize(pairImageFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => pairImageInputRef.current?.click()}
                  className="text-xs font-bold text-[#800020] dark:text-[#FB7185] hover:underline shrink-0 cursor-pointer"
                >
                  تغيير
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Audio Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center text-[11px] font-mono font-bold">2</span>
                <span>اختيار الملف الصوتي (التسجيل / البودكاست)</span>
              </label>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">MP3, WAV, M4A, OGG</span>
            </div>

            <input
              type="file"
              ref={pairAudioInputRef}
              accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleSelectPairAudio(e.target.files[0]);
              }}
            />

            {!pairAudioFile ? (
              <div
                onClick={() => pairAudioInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] hover:border-[#059669] rounded-xl text-center cursor-pointer transition-colors bg-[#F8FAFC] dark:bg-[#1E293B]/40 group"
              >
                <Music className="w-7 h-7 mx-auto mb-2 text-[#64748B] group-hover:text-[#059669] transition-colors" />
                <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  انقر لاختيار الملف الصوتي
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  ملف الصوت التابع للصورة المسجلة
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#059669]/10 text-[#059669] flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                        {pairAudioFile.name}
                      </p>
                      <p className="text-[11px] text-[#64748B] font-mono">
                        {formatFileSize(pairAudioFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => pairAudioInputRef.current?.click()}
                    className="text-xs font-bold text-[#059669] hover:underline shrink-0 cursor-pointer"
                  >
                    تغيير
                  </button>
                </div>
                {pairAudioPreview && (
                  <audio
                    src={pairAudioPreview}
                    controls
                    className="w-full h-8 pt-1"
                  />
                )}
              </div>
            )}
          </div>

          {/* Error or Success Notice */}
          {pairUploadError && (
            <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] dark:text-[#F87171] text-xs font-bold flex items-center justify-between gap-2">
              <span>{pairUploadError}</span>
              <button
                type="button"
                onClick={() => setPairUploadError(null)}
                className="text-[11px] underline cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          )}

          {pairUploadSuccess && (
            <div className="p-3 rounded-xl bg-[#059669]/10 border border-[#059669]/20 text-[#059669] dark:text-[#34D399] text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{pairUploadSuccess}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-[#F8FAFC] dark:bg-[#0F172A] border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isUploadingPair}
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="h-10 px-4 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#E2E8F0]/50 dark:hover:bg-[#1E293B] cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={!pairImageFile || !pairAudioFile || isUploadingPair}
            onClick={handlePairUploadSubmit}
            className="h-10 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploadingPair ? "جاري رفع الملفين معاً..." : "رفع الصورة والتسجيل الصوتي معاً"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
