"use client";

import { X } from "lucide-react";

interface LessonImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function LessonImageLightbox({ imageUrl, onClose }: LessonImageLightboxProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 left-0 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={imageUrl}
          alt="معاينة الخريطة الذهنية"
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-sm"
        />
      </div>
    </div>
  );
}
