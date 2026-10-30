"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MindMap, MindNode } from "./types";

interface LessonMindMapTabProps {
  mindMap?: MindMap | null;
}

export function LessonMindMapTab({ mindMap }: LessonMindMapTabProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isOutlineMode, setIsOutlineMode] = useState(false);
  const [selectedMindNode, setSelectedMindNode] = useState<string | null>(null);

  if (!mindMap) {
    return (
      <div className="p-8 text-center text-[#64748B] rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
        الملخص قيد الإعداد...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mindMap.images && mindMap.images.length > 0 ? (() => {
        const images = mindMap.images;
        return (
        <div className="space-y-6">
          {/* Header & Quick Navigation Bar */}
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
                <span>{mindMap.title || "ملخص ومخططات الدرس"}</span>
              </h3>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                ملخص بصري ومخططات لتثبيت الروابط والمفاهيم — معروضة بالتمرير التتابعي
              </p>
            </div>

            {/* Quick Jump Navigation (Pills for fast scrolling) */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 p-1.5 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] px-2 shrink-0">
                  انتقال سريع:
                </span>
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      document
                        .getElementById(`mindmap-card-${idx}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white hover:border-[#800020] hover:text-[#800020] dark:hover:text-[#FB7185] transition-all shrink-0 cursor-pointer shadow-2xs"
                  >
                    خريطة {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* All MindMap Images Stacked Vertically with Continuous Scroll */}
          <div className="space-y-6">
            {images.map((img, idx) => (
              <div
                key={idx}
                id={`mindmap-card-${idx}`}
                className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Card Header Bar */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#800020]/10 dark:bg-[#800020]/25 text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                      {images.length > 1
                        ? `الملخص (${idx + 1} من ${images.length})`
                        : "ملخص الدرس"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageIndex(idx);
                        setImageZoom(1);
                        setIsFullscreenImage(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white hover:border-[#800020] hover:text-[#800020] dark:hover:text-[#FB7185] transition-colors cursor-pointer"
                      title="عرض بملء الشاشة وتكبير"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>ملء الشاشة</span>
                    </button>
                    <a
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] hover:bg-[#800020]/20 transition-colors"
                      title="فتح الصورة في نافذة جديدة"
                    >
                      <span>فتح بالحجم الأصلي</span>
                    </a>
                  </div>
                </div>

                {/* Card Image Display Area */}
                <div className="p-4 sm:p-6 bg-[#0F172A]/5 dark:bg-black/40 flex items-center justify-center min-h-[320px]">
                  <img
                    src={img}
                    alt={`${mindMap.title || "الخريطة الذهنية"} - خريطة ${idx + 1}`}
                    loading="lazy"
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setImageZoom(1);
                      setIsFullscreenImage(true);
                    }}
                    className="w-full max-h-[85vh] object-contain rounded-xl shadow-xs cursor-zoom-in transition-transform duration-200 hover:scale-[1.005]"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        );
      })() : (
        /* Fallback: Interactive Outline or Tree for lessons with textual nodes */
        <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
          {/* Toolbar */}
          <div className="p-3 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                className="w-11 h-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
              >
                <span className="text-sm font-bold">−</span>
              </button>
              <span className="text-[13px] font-bold text-[#64748B] min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                className="w-11 h-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
              >
                <span className="text-sm font-bold">+</span>
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
              >
                إعادة ضبط
              </button>
            </div>

            <button
              onClick={() => setIsOutlineMode(!isOutlineMode)}
              className={`h-11 px-3 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-colors ${
                isOutlineMode
                  ? "bg-[#800020] text-white"
                  : "border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155]"
              }`}
            >
              <span>{isOutlineMode ? "عرض الخريطة" : "عرض نصي"}</span>
            </button>
          </div>

          {/* Map Canvas or Outline */}
          <div className="p-4 sm:p-6 min-h-[400px] overflow-auto overscroll-contain">
            {!isOutlineMode ? (
              <div
                className="transition-transform duration-200 origin-top-right"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <div className="flex flex-col items-center gap-6 min-w-[480px] sm:min-w-[600px]">
                  {(() => {
                    const mindNodes = (mindMap.nodes as MindNode[]) || [];
                    const rootNodes = mindNodes.filter((n) => n.level === 0);
                    const l1Children = mindNodes.filter((n) => n.level === 1);
                    const l2Children = mindNodes.filter((n) => n.level === 2);
                    return rootNodes.map((root) => (
                      <div key={root.id} className="flex flex-col items-center gap-4 w-full">
                        <div
                          onClick={() =>
                            setSelectedMindNode(
                              selectedMindNode === root.id ? null : root.id
                            )
                          }
                          className="px-6 py-3 rounded-lg bg-[#800020] text-white text-sm font-bold cursor-pointer hover:bg-[#66001A] transition-colors shadow-sm"
                        >
                          {root.label}
                        </div>

                        {l1Children.length > 0 && (
                          <>
                            <div className="w-0.5 h-6 bg-[#E2E8F0] dark:bg-[#334155]" />
                            <div className="flex flex-wrap justify-center gap-4">
                              {l1Children.map((l1) => (
                                <div
                                  key={l1.id}
                                  className="flex flex-col items-center gap-3"
                                >
                                  <div
                                    onClick={() =>
                                      setSelectedMindNode(
                                        selectedMindNode === l1.id ? null : l1.id
                                      )
                                    }
                                    className="px-4 py-3 rounded-lg bg-[#059669] text-white text-[13px] font-bold cursor-pointer hover:bg-[#047857] transition-colors text-center min-w-[120px]"
                                  >
                                    {l1.label}
                                  </div>

                                  {l2Children.length > 0 && (
                                    <>
                                      <div className="w-0.5 h-4 bg-[#E2E8F0] dark:bg-[#334155]" />
                                      <div className="flex flex-col gap-2">
                                        {l2Children.map((l2) => (
                                          <div
                                            key={l2.id}
                                            onClick={() =>
                                              setSelectedMindNode(
                                                selectedMindNode === l2.id
                                                  ? null
                                                  : l2.id
                                              )
                                            }
                                            className="px-3 py-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer hover:border-[#800020] transition-colors text-center min-w-[100px]"
                                          >
                                            {l2.label}
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ) : (
              /* Outline View */
              <div className="space-y-3 font-content">
                {((mindMap.nodes as MindNode[]) || []).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      n.level === 0
                        ? "bg-[#800020]/10 border-[#800020]/20 mr-0 font-bold"
                        : n.level === 1
                        ? "bg-[#059669]/10 border-[#059669]/20 mr-4 font-semibold"
                        : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] mr-8"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-[13px] sm:text-sm font-bold ${
                          n.level === 0
                            ? "text-[#800020] text-base"
                            : "text-[#0F172A] dark:text-white"
                        }`}
                      >
                        {n.label}
                      </h4>
                    </div>
                    {n.description && (
                      <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1 font-content">
                        {n.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreenImage && mindMap.images && mindMap.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-4 sm:p-6 text-white animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold">
                {mindMap.title || "الملخص"}
              </span>
              {mindMap.images.length > 1 && (
                <span className="text-[13px] text-white/60">
                  (ملخص {selectedImageIndex + 1} من {mindMap.images.length})
                </span>
              )}
            </div>

            {/* Zoom & Close Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setImageZoom((z) =>
                    Math.max(0.5, Math.round((z - 0.25) * 100) / 100)
                  )
                }
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                title="تصغير"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span
                className="font-mono text-xs px-1 min-w-[3rem] text-center"
                dir="ltr"
              >
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  setImageZoom((z) =>
                    Math.min(3, Math.round((z + 0.25) * 100) / 100)
                  )
                }
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                title="تكبير"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setImageZoom(1)}
                className="h-9 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer"
                title="إعادة ضبط الحجم"
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenImage(false)}
                className="w-9 h-9 rounded-lg bg-white/15 hover:bg-red-600/80 flex items-center justify-center transition-colors mr-2 cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative">
            {mindMap.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImageIndex((i) =>
                      i > 0 ? i - 1 : mindMap.images!.length - 1
                    );
                    setImageZoom(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors z-10 cursor-pointer"
                  title="الخريطة السابقة"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImageIndex((i) =>
                      i < mindMap.images!.length - 1 ? i + 1 : 0
                    );
                    setImageZoom(1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors z-10 cursor-pointer"
                  title="الخريطة التالية"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </>
            )}
            <img
              src={mindMap.images[selectedImageIndex]}
              alt={mindMap.title}
              style={{
                transform: `scale(${imageZoom})`,
                transformOrigin: "center center",
              }}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm select-none transition-transform duration-150"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
