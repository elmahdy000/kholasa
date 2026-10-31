"use client";

import { useState } from "react";
import { ZoomIn, X } from "lucide-react";

interface QuestionImageAttachmentProps {
  imageUrl?: string | null;
  alt?: string;
  className?: string;
}

export function QuestionImageAttachment({
  imageUrl,
  alt = "رسم توضيحي للسؤال",
  className = "",
}: QuestionImageAttachmentProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!imageUrl || !imageUrl.trim()) return null;

  return (
    <>
      <div
        className={`relative group rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0B1120] p-2 overflow-hidden max-w-lg mx-auto ${className}`}
      >
        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          className="relative w-full block cursor-zoom-in"
          title="اضغط لتكبير الرسم التوضيحي"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            className="w-full max-h-72 sm:max-h-80 object-contain rounded-lg mx-auto transition-transform group-hover:scale-[1.01]"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-[11px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-3.5 h-3.5" />
            <span>تكبير</span>
          </div>
        </button>
      </div>

      {/* Lightbox Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs select-none"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-[#0F172A] rounded-2xl p-3 sm:p-4 shadow-2xl border border-white/20 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#334155] text-right mb-2">
              <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                {alt}
              </span>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[78vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={alt}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
