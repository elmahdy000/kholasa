"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsCounterClockwise,
  ArrowsOut,
  X,
} from "@phosphor-icons/react";
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
        خريطة المفاهيم قيد الإعداد...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mindMap.images && mindMap.images.length > 0 ? (
        <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden space-y-4 p-4 sm:p-6">
          {/* Header & Image Selector Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <ImageIcon
                  className="w-5 h-5 text-[#800020] dark:text-[#FB7185]"
                  weight="bold"
                />
                <span>{mindMap.title || "الخرائط الذهنية للدرس"}</span>
              </h3>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                خرائط مرئية عالية الدقة لتثبيت الروابط والمفاهيم بين أجزاء الدرس
              </p>
            </div>

            {/* Image Selector Pills (if multiple images) */}
            {mindMap.images.length > 1 && (
              <div className="flex items-center gap-2 p-1 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-x-auto">
                {mindMap.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setImageZoom(1);
                    }}
                    className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? "bg-[#800020] text-white"
                        : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    خريطة {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-2 text-[13px]">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setImageZoom((z) =>
                    Math.max(0.5, Math.round((z - 0.25) * 100) / 100)
                  )
                }
                className="w-11 h-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0]"
                title="تصغير"
              >
                <MagnifyingGlassMinus className="w-4 h-4" weight="bold" />
              </button>
              <span
                className="font-mono font-bold text-[13px] px-2 min-w-[3.5rem] text-center text-[#0F172A] dark:text-white"
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
                className="w-11 h-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0]"
                title="تكبير"
              >
                <MagnifyingGlassPlus className="w-4 h-4" weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setImageZoom(1)}
                className="h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0] flex items-center gap-1"
                title="إعادة ضبط الحجم"
              >
                <ArrowsCounterClockwise className="w-3.5 h-3.5" weight="bold" />
                <span className="hidden sm:inline">100%</span>
              </button>
            </div>

            {/* Action: Fullscreen */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreenImage(true)}
                className="h-11 px-3 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-colors interactive-tap"
              >
                <ArrowsOut className="w-3.5 h-3.5" weight="bold" />
                <span>عرض ملء الشاشة</span>
              </button>
            </div>
          </div>

          {/* Main Image Container */}
          <div className="relative rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#0F172A]/5 dark:bg-black/40 min-h-[420px] max-h-[700px] overflow-auto flex items-center justify-center p-4">
            <img
              src={mindMap.images[selectedImageIndex]}
              alt={`${mindMap.title} - خريطة ${selectedImageIndex + 1}`}
              style={{
                transform: `scale(${imageZoom})`,
                transformOrigin: "center center",
              }}
              className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-150 select-none shadow-sm cursor-zoom-in"
              onClick={() => setIsFullscreenImage(true)}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </div>

          {/* Thumbnails Row if multiple */}
          {mindMap.images.length > 1 && (
            <div className="flex items-center gap-3 pt-2 overflow-x-auto pb-1">
              {mindMap.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setImageZoom(1);
                  }}
                  className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? "border-[#800020] shadow-sm"
                      : "border-[#E2E8F0] dark:border-[#334155] opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`خريطة ${idx + 1}`}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
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
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4 sm:p-6 text-white animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold">
                {mindMap.title || "الخريطة الذهنية"}
              </span>
              {mindMap.images.length > 1 && (
                <span className="text-[13px] text-white/60">
                  (خريطة {selectedImageIndex + 1} من {mindMap.images.length})
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreenImage(false)}
              className="w-11 h-11 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" weight="bold" />
            </button>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={mindMap.images[selectedImageIndex]}
              alt={mindMap.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm select-none"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
