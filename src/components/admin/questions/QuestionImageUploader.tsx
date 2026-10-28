"use client";

import { useState, useRef } from "react";
import { ImageIcon, UploadCloud, Trash2, ExternalLink, Link2, AlertCircle } from "lucide-react";

interface QuestionImageUploaderProps {
  imageUrl: string;
  onChange: (url: string) => void;
}

export function QuestionImageUploader({
  imageUrl,
  onChange,
}: QuestionImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setUploadError("يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP, SVG)");
      return;
    }

    // Limit to 10MB for question diagrams
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("حجم الصورة يجب ألا يتجاوز 10 ميجابايت");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر رفع الصورة");
      }

      if (data.url) {
        onChange(data.url);
        setManualUrl(data.url);
      } else {
        throw new Error("لم يتم إرجاع رابط الصورة المرفوعة");
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    setManualUrl("");
    setUploadError(null);
  };

  const handleApplyManualUrl = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
          صورة توضيحية للسؤال (اختياري)
        </label>
        {!imageUrl && (
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[12px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{showUrlInput ? "إلغاء إدخال الرابط" : "إدخال رابط صورة مباشرة"}</span>
          </button>
        )}
      </div>

      {uploadError && (
        <div className="p-2.5 rounded-xl bg-[#DC2626]/10 text-[#DC2626] text-[12px] font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {imageUrl ? (
        /* Image Preview Box */
        <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] shrink-0 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="صورة السؤال التوضيحية"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5 text-right">
            <span className="text-[12px] font-bold text-[#059669] flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              تم إرفاق الصورة بنجاح
            </span>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono truncate dir-ltr text-left">
              {imageUrl}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-2.5 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[11px] font-bold text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>عرض بالحجم الكامل</span>
              </a>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="h-8 px-2.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>إزالة الصورة</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Image Upload Controls */
        <div className="space-y-2">
          {showUrlInput ? (
            <div className="flex gap-2">
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://example.com/diagram.png أو /api/media/..."
                className="flex-1 h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-mono text-[#0F172A] dark:text-white dir-ltr text-left focus:outline-none focus:border-[#800020]"
              />
              <button
                type="button"
                onClick={handleApplyManualUrl}
                className="h-10 px-4 rounded-xl bg-[#800020] text-white text-[12px] font-bold cursor-pointer shrink-0"
              >
                تطبيق
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020] dark:hover:border-[#FB7185] bg-[#F8FAFC] dark:bg-[#1E293B]/50 rounded-xl p-4 text-center cursor-pointer transition-colors space-y-1.5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-9 h-9 mx-auto rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#800020] dark:text-[#FB7185]">
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
              </div>
              <p className="text-[12px] font-bold text-[#0F172A] dark:text-white">
                {isUploading
                  ? "جارٍ رفع الصورة إلى الخادم..."
                  : "اضغط لرفع رسم توضيحي، شكل هندسي، أو خريطة من جهازك"}
              </p>
              <p className="text-[11px] text-[#94A3B8]">
                صيغ الصور المدعومة: PNG, JPG, WebP, SVG (حتى 10 ميجابايت)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
