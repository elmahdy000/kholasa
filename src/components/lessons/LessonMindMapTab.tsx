"use client";

import { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  ExternalLink,
  Move,
  Layers,
  FileText,
  Sparkles,
} from "lucide-react";
import { MindMap, MindNode, MindEdge } from "./types";

interface LessonMindMapTabProps {
  mindMap?: MindMap | null;
}

export function LessonMindMapTab({ mindMap }: LessonMindMapTabProps) {
  const images = Array.isArray(mindMap?.images) ? mindMap.images : [];
  const mindNodes = Array.isArray(mindMap?.nodes)
    ? (mindMap.nodes as MindNode[])
    : [];
  const mindEdges = Array.isArray(mindMap?.edges)
    ? (mindMap.edges as MindEdge[])
    : [];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
  } | null>(null);

  // Textual Tree / Outline mode state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isOutlineMode, setIsOutlineMode] = useState(false);
  const [selectedMindNode, setSelectedMindNode] = useState<string | null>(null);

  const hasImages = images.length > 0;
  const hasNodes = mindNodes.length > 0;

  // Zoom and Pan helpers
  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(1, Math.min(3.5, Math.round(newZoom * 100) / 100));
    setImageZoom(clamped);
    if (clamped === 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  const handleResetZoom = () => {
    setImageZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (imageZoom > 1) {
      handleResetZoom();
    } else {
      handleZoomChange(2);
    }
  };

  const switchImage = (newIndex: number) => {
    setSelectedImageIndex(newIndex);
    setImageZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  };

  // Pointer drag for smooth panning when zoomed in
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (imageZoom <= 1) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    setPan({
      x: dragStartRef.current.initialPanX + dx,
      y: dragStartRef.current.initialPanY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isFullscreenImage) return;
    e.preventDefault();
    const step = 0.25;
    const delta = e.deltaY < 0 ? step : -step;
    handleZoomChange(imageZoom + delta);
  };

  // Lock body scroll when fullscreen lightbox is open
  useEffect(() => {
    if (!isFullscreenImage) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isFullscreenImage]);

  // Keyboard navigation inside lightbox
  useEffect(() => {
    if (!isFullscreenImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreenImage(false);
      } else if (e.key === "+" || e.key === "=") {
        handleZoomChange(imageZoom + 0.25);
      } else if (e.key === "-") {
        handleZoomChange(imageZoom - 0.25);
      } else if (e.key === "0") {
        handleResetZoom();
      } else if (e.key === "ArrowLeft") {
        if (images.length > 1) {
          switchImage(
            selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0
          );
        }
      } else if (e.key === "ArrowRight") {
        if (images.length > 1) {
          switchImage(
            selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreenImage, imageZoom, selectedImageIndex, images.length]);

  // Empty state if mindMap is null or has neither images nor textual nodes
  if (!mindMap || (!hasImages && !hasNodes)) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-[#800020]/10 dark:bg-[#800020]/25 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
          <ImageIcon className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-[#0F172A] dark:text-white">
          الخريطة الذهنية قيد الإعداد
        </h4>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] max-w-md leading-relaxed">
          يقوم معلمو المادة بإعداد المخطط البصري والخرائط الذهنية التلخيصية لهذا
          الدرس لتثبيت المفاهيم والروابط الأساسية.
        </p>
      </div>
    );
  }

  // Visual Image-Based Mind Maps
  if (hasImages) {
    const currentFullscreenImage = images[selectedImageIndex] || images[0];

    return (
      <div className="space-y-6">
        {/* Header & Quick Navigation Bar */}
        <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#800020]/10 dark:bg-[#800020]/25 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
                {mindMap.title || "ملخص ومخططات الدرس"}
              </h3>
              {images.length > 1 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#800020]/10 text-[#800020] dark:bg-[#FB7185]/20 dark:text-[#FB7185]">
                  {images.length} لوحات
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1.5 leading-relaxed">
              {mindMap.description ||
                "ملخص بصري ومخططات لتثبيت الروابط والمفاهيم — انقر على أي لوحة للتكبير والتنقل الحر"}
            </p>
          </div>

          {/* Quick Jump Navigation Pills */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 p-1.5 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-x-auto scrollbar-none shrink-0">
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
                  لوحة {idx + 1}
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
                      ? `لوحة المخطط (${idx + 1} من ${images.length})`
                      : "المخطط الذهني للدرس"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setImageZoom(1);
                      setPan({ x: 0, y: 0 });
                      setIsFullscreenImage(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white hover:border-[#800020] hover:text-[#800020] dark:hover:text-[#FB7185] transition-colors cursor-pointer"
                    title="عرض بملء الشاشة وتكبير حر"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>ملء الشاشة</span>
                  </button>

                  <a
                    href={img}
                    download={`kholasa-mindmap-${idx + 1}.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] hover:bg-[#800020]/20 transition-colors"
                    title="تحميل المخطط بجودة عالية"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل</span>
                  </a>

                  <a
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                    title="فتح الصورة في نافذة مستقلة"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">نافذة جديدة</span>
                  </a>
                </div>
              </div>

              {/* Card Image Display Area */}
              <div
                onClick={() => {
                  setSelectedImageIndex(idx);
                  setImageZoom(1);
                  setPan({ x: 0, y: 0 });
                  setIsFullscreenImage(true);
                }}
                className="relative group p-1.5 sm:p-6 bg-[#0F172A]/5 dark:bg-black/40 flex items-center justify-center min-h-[240px] sm:min-h-[360px] cursor-zoom-in"
              >
                <img
                  src={img}
                  alt={`${mindMap.title || "الخريطة الذهنية"} - لوحة ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-h-none sm:max-h-[85vh] object-contain rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-[1.008]"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />

                {/* Subtle Hover Action Hint Badge */}
                <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex justify-center pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="px-4 py-1.5 rounded-full bg-[#0F172A]/85 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg border border-white/10">
                    <Maximize2 className="w-3.5 h-3.5 text-[#FB7185]" />
                    <span>انقر للتكبير والتنقل الحر بملء الشاشة</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fullscreen Interactive Lightbox Modal */}
        {isFullscreenImage && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="عرض الخريطة الذهنية بملء الشاشة"
            className="fixed inset-0 z-50 bg-[#0B0F17]/95 backdrop-blur-md flex flex-col text-white animate-in fade-in duration-150 select-none"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 shrink-0 bg-[#0F172A]/80">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm sm:text-base font-bold break-words line-clamp-1">
                  {mindMap.title || "الخريطة الذهنية"}
                </span>
                {images.length > 1 && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white/10 text-[#FB7185] shrink-0">
                    لوحة {selectedImageIndex + 1} من {images.length}
                  </span>
                )}
              </div>

              {/* Viewer Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Zoom Out */}
                <button
                  type="button"
                  onClick={() => handleZoomChange(imageZoom - 0.25)}
                  disabled={imageZoom <= 1}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="تصغير (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                {/* Zoom Badge */}
                <span
                  className="font-mono text-xs px-2 min-w-[3.25rem] text-center font-bold"
                  dir="ltr"
                >
                  {Math.round(imageZoom * 100)}%
                </span>

                {/* Zoom In */}
                <button
                  type="button"
                  onClick={() => handleZoomChange(imageZoom + 0.25)}
                  disabled={imageZoom >= 3.5}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="تكبير (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Reset Zoom */}
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="h-9 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="إعادة ضبط الحجم (0)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">100%</span>
                </button>

                <div className="w-px h-6 bg-white/15 mx-1" />

                {/* Download Image */}
                <a
                  href={currentFullscreenImage}
                  download={`kholasa-mindmap-${selectedImageIndex + 1}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                  title="تحميل الصورة بجودة عالية"
                >
                  <Download className="w-4 h-4" />
                </a>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsFullscreenImage(false)}
                  className="w-9 h-9 rounded-lg bg-red-600/80 hover:bg-red-600 flex items-center justify-center transition-colors cursor-pointer mr-1"
                  title="إغلاق (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Interactive Canvas Area */}
            <div
              className="flex-1 overflow-hidden relative flex items-center justify-center touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              onDoubleClick={handleDoubleClick}
            >
              {/* Previous / Next Arrows for Multi-image */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      switchImage(
                        selectedImageIndex > 0
                          ? selectedImageIndex - 1
                          : images.length - 1
                      );
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg hover:scale-105"
                    title="اللوحة السابقة (سهم يمين)"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      switchImage(
                        selectedImageIndex < images.length - 1
                          ? selectedImageIndex + 1
                          : 0
                      );
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg hover:scale-105"
                    title="اللوحة التالية (سهم يسار)"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Main Image with Pan & Zoom Transform */}
              <div
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${imageZoom})`,
                  transition: isDragging ? "none" : "transform 150ms ease-out",
                  cursor:
                    imageZoom > 1
                      ? isDragging
                        ? "grabbing"
                        : "grab"
                      : "zoom-in",
                }}
                className="max-w-full max-h-full p-4 flex items-center justify-center select-none"
              >
                <img
                  src={currentFullscreenImage}
                  alt={mindMap.title || "الخريطة الذهنية"}
                  className="max-w-full max-h-[92vh] sm:max-h-[88vh] object-contain rounded-lg shadow-2xl pointer-events-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>

              {/* Floating Helper Footer */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
                <div className="px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white/80 text-xs font-bold flex items-center gap-3 shadow-lg">
                  {imageZoom > 1 ? (
                    <span className="flex items-center gap-1.5 text-[#FB7185]">
                      <Move className="w-3.5 h-3.5" />
                      اسحب بالماوس أو اللمس للتحريك • انقر مرتين لإعادة الضبط
                    </span>
                  ) : (
                    <span>
                      انقر مرتين للتكبير السريع • Esc للإغلاق • عجلة الماوس
                      للتحكم في الحجم
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback: Textual Mind Map (Hierarchical Tree or Outline)
  const rootNodes = mindNodes.filter((n) => n.level === 0);

  // Helper: Find child nodes for a given parent node respecting edges & hierarchy
  const getChildrenOf = (parentId: string, expectedLevel: number): MindNode[] => {
    // 1. If edges exist, find targets connected from parentId
    if (mindEdges.length > 0) {
      const targetIds = new Set(
        mindEdges.filter((e) => e.source === parentId).map((e) => e.target)
      );
      const connected = mindNodes.filter((n) => targetIds.has(n.id));
      if (connected.length > 0) return connected;
    }

    // 2. If node has explicit parentId attribute
    const byParentId = mindNodes.filter(
      (n) => (n as unknown as { parentId?: string }).parentId === parentId
    );
    if (byParentId.length > 0) return byParentId;

    // 3. Fallback for legacy data without edges:
    if (expectedLevel === 1) {
      return mindNodes.filter((n) => n.level === 1);
    }

    const allL1 = mindNodes.filter((n) => n.level === 1);
    if (expectedLevel === 2 && allL1.length === 1) {
      return mindNodes.filter((n) => n.level === 2);
    }

    return [];
  };

  const selectedNodeObject = mindNodes.find((n) => n.id === selectedMindNode);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden shadow-xs">
      {/* Header & Controls Toolbar */}
      <div className="p-4 border-b border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#1E293B]/60">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
            <span>{mindMap.title || "شجرة المفاهيم الذهنية"}</span>
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            مخطط تسلسلي تفاعلي لاستيعاب البنية الهيكلية لمفاهيم الدرس
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isOutlineMode && (
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors font-bold text-sm"
                title="تصغير"
              >
                −
              </button>
              <span
                className="text-xs font-mono font-bold text-[#64748B] min-w-[2.5rem] text-center"
                dir="ltr"
              >
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors font-bold text-sm"
                title="تكبير"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="h-8 px-2.5 rounded-lg text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
                title="إعادة ضبط الحجم"
              >
                100%
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOutlineMode(!isOutlineMode)}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isOutlineMode
                ? "bg-[#800020] text-white shadow-xs"
                : "border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white hover:border-[#800020]"
            }`}
          >
            {isOutlineMode ? (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>عرض المخطط</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span>عرض تسلسلي</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-8 min-h-[380px] overflow-auto overscroll-contain">
        {!isOutlineMode ? (
          <div
            className="transition-transform duration-200 origin-top flex flex-col items-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="flex flex-col items-center gap-6 min-w-[480px] sm:min-w-[620px] w-full">
              {rootNodes.map((root) => {
                const l1Children = getChildrenOf(root.id, 1);

                return (
                  <div
                    key={root.id}
                    className="flex flex-col items-center gap-4 w-full"
                  >
                    {/* Root Node */}
                    <div
                      onClick={() =>
                        setSelectedMindNode(
                          selectedMindNode === root.id ? null : root.id
                        )
                      }
                      className={`px-6 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-all shadow-md text-center max-w-sm ${
                        selectedMindNode === root.id
                          ? "bg-[#66001A] text-white ring-4 ring-[#800020]/20 scale-105"
                          : "bg-[#800020] text-white hover:bg-[#66001A]"
                      }`}
                    >
                      <div className="text-[11px] font-medium text-white/80 mb-0.5">
                        المفهوم الرئيسي
                      </div>
                      <div>{root.label}</div>
                    </div>

                    {l1Children.length > 0 && (
                      <>
                        <div className="w-0.5 h-6 bg-[#CBD5E1] dark:bg-[#475569]" />
                        <div className="flex flex-wrap justify-center gap-6 w-full">
                          {l1Children.map((l1) => {
                            const l2Children = getChildrenOf(l1.id, 2);

                            return (
                              <div
                                key={l1.id}
                                className="flex flex-col items-center gap-3 min-w-[140px]"
                              >
                                <div
                                  onClick={() =>
                                    setSelectedMindNode(
                                      selectedMindNode === l1.id ? null : l1.id
                                    )
                                  }
                                  className={`px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all text-center min-w-[130px] shadow-sm ${
                                    selectedMindNode === l1.id
                                      ? "bg-[#047857] text-white ring-4 ring-[#059669]/25 scale-105"
                                      : "bg-[#059669] text-white hover:bg-[#047857]"
                                  }`}
                                >
                                  {l1.label}
                                </div>

                                {l2Children.length > 0 && (
                                  <>
                                    <div className="w-0.5 h-4 bg-[#CBD5E1] dark:bg-[#475569]" />
                                    <div className="flex flex-col gap-2 w-full">
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
                                          className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all text-center border shadow-2xs ${
                                            selectedMindNode === l2.id
                                              ? "bg-[#800020]/10 border-[#800020] text-[#800020] dark:text-[#FB7185] ring-2 ring-[#800020]/20"
                                              : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#800020]"
                                          }`}
                                        >
                                          {l2.label}
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Structured Outline Mode */
          <div className="space-y-3 font-content max-w-2xl mx-auto">
            {mindNodes.map((n) => (
              <div
                key={n.id}
                onClick={() =>
                  setSelectedMindNode(
                    selectedMindNode === n.id ? null : n.id
                  )
                }
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  n.level === 0
                    ? "bg-[#800020]/5 border-[#800020]/25 mr-0"
                    : n.level === 1
                    ? "bg-[#059669]/5 border-[#059669]/20 mr-4"
                    : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] mr-8"
                } ${
                  selectedMindNode === n.id
                    ? "ring-2 ring-[#800020] dark:ring-[#FB7185]"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        n.level === 0
                          ? "bg-[#800020] text-white"
                          : n.level === 1
                          ? "bg-[#059669] text-white"
                          : "bg-[#64748B] text-white"
                      }`}
                    >
                      {n.level === 0
                        ? "رئيسي"
                        : n.level === 1
                        ? "محور"
                        : "تفصيل"}
                    </span>
                    <h4
                      className={`text-sm font-bold ${
                        n.level === 0
                          ? "text-[#800020] dark:text-[#FB7185] text-base"
                          : "text-[#0F172A] dark:text-white"
                      }`}
                    >
                      {n.label}
                    </h4>
                  </div>
                </div>
                {n.description && (
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-2 leading-relaxed">
                    {n.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNodeObject && (
          <div className="mt-6 p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
                <span className="text-xs font-bold text-[#800020] dark:text-[#FB7185]">
                  تفاصيل المفهوم المحدد
                </span>
              </div>
              <h5 className="text-sm font-bold text-[#0F172A] dark:text-white">
                {selectedNodeObject.label}
              </h5>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                {selectedNodeObject.description ||
                  "لا يوجد وصف إضافي مسجل لهذا المفهوم."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMindNode(null)}
              className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white p-1"
              title="إغلاق التفاصيل"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
