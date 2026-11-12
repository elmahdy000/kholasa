"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowCounterClockwise,
  ArrowUpLeft,
  BookOpen,
  CaretDown,
  CaretLeft,
  CaretUp,
  CheckCircle,
  DotsSixVertical,
  X,
} from "@phosphor-icons/react";
import { AnimatedCount } from "@/components/ui/AnimatedCount";
import type { StudentMistakeDiagnosisSummary } from "@/lib/mistake-diagnosis";

const COLLAPSE_STORAGE_KEY = "kholasa_floating_mistakes_collapsed";
const COLLAPSE_EVENT = "kholasa:floating-mistakes-collapse";
const POSITION_STORAGE_KEY = "kholasa_floating_mistakes_pos_v1";
const POSITION_EVENT = "kholasa:floating-mistakes-position";

interface FloatingPosition {
  x: number;
  y: number;
}

function clampFloatingPosition(
  pos: FloatingPosition,
  elWidth: number,
  elHeight: number
): FloatingPosition {
  if (typeof window === "undefined") return pos;
  const margin = 8;
  const maxX = Math.max(margin, window.innerWidth - elWidth - margin);
  const maxY = Math.max(margin, window.innerHeight - elHeight - margin);
  return {
    x: Math.round(Math.min(maxX, Math.max(margin, pos.x))),
    y: Math.round(Math.min(maxY, Math.max(margin, pos.y))),
  };
}

let cachedRawPos: string | null = null;
let cachedParsedPos: FloatingPosition | null = null;

function subscribePositionPreference(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(POSITION_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(POSITION_EVENT, callback);
  };
}

function getPositionSnapshot(): FloatingPosition | null {
  try {
    const raw = window.localStorage.getItem(POSITION_STORAGE_KEY);
    if (raw === cachedRawPos) return cachedParsedPos;
    cachedRawPos = raw;
    if (!raw) {
      cachedParsedPos = null;
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<FloatingPosition>;
    if (typeof parsed.x === "number" && typeof parsed.y === "number" && Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
      cachedParsedPos = { x: parsed.x, y: parsed.y };
      return cachedParsedPos;
    }
    cachedParsedPos = null;
    return null;
  } catch {
    cachedParsedPos = null;
    return null;
  }
}

function setPositionPreference(pos: FloatingPosition | null): void {
  try {
    if (pos) {
      const serialized = JSON.stringify(pos);
      cachedRawPos = serialized;
      cachedParsedPos = pos;
      window.localStorage.setItem(POSITION_STORAGE_KEY, serialized);
    } else {
      cachedRawPos = null;
      cachedParsedPos = null;
      window.localStorage.removeItem(POSITION_STORAGE_KEY);
    }
    window.dispatchEvent(new Event(POSITION_EVENT));
  } catch {
    // Ignore storage access restrictions.
  }
}

function subscribeCollapsePreference(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(COLLAPSE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(COLLAPSE_EVENT, callback);
  };
}

function getCollapseSnapshot(): boolean {
  try {
    return window.sessionStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setCollapsePreference(next: boolean): void {
  try {
    if (next) {
      window.sessionStorage.setItem(COLLAPSE_STORAGE_KEY, "1");
    } else {
      window.sessionStorage.removeItem(COLLAPSE_STORAGE_KEY);
    }
    window.dispatchEvent(new Event(COLLAPSE_EVENT));
  } catch {
    // Ignore storage access restrictions (e.g. private browsing).
  }
}

/**
 * Determines whether the floating mistakes widget should appear on the current route.
 * Hidden on the mistakes hub itself, subscription/payment screens, and active exam-solving pages.
 */
export function shouldShowFloatingMistakesCounter(
  pathname: string | null | undefined
): boolean {
  if (!pathname) return false;
  const cleanPath = pathname.split("?")[0];
  if (cleanPath === "/mistakes" || cleanPath.startsWith("/mistakes/")) {
    return false;
  }
  if (cleanPath === "/subscription" || cleanPath.startsWith("/subscription/")) {
    return false;
  }
  if (cleanPath.startsWith("/admin")) {
    return false;
  }
  if (
    cleanPath.startsWith("/exams/") &&
    cleanPath !== "/exams/builder" &&
    !cleanPath.endsWith("/results")
  ) {
    return false;
  }
  return true;
}

interface FloatingMistakesCounterProps {
  pathname: string | null;
  summary: StudentMistakeDiagnosisSummary;
  hasLoaded: boolean;
}

export function FloatingMistakesCounter({
  pathname,
  summary,
  hasLoaded,
}: FloatingMistakesCounterProps) {
  const shouldReduceMotion = useReducedMotion();
  const isCollapsed = useSyncExternalStore(
    subscribeCollapsePreference,
    getCollapseSnapshot,
    () => false
  );
  const savedPosition = useSyncExternalStore<FloatingPosition | null>(
    subscribePositionPreference,
    getPositionSnapshot,
    () => null
  );

  const [open, setOpen] = useState(false);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const [liveDragPos, setLiveDragPos] = useState<FloatingPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [popoverAlign, setPopoverAlign] = useState<{ openDown: boolean; alignRight: boolean }>({
    openDown: false,
    alignRight: false,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const dragSessionRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    pillW: number;
    pillH: number;
    moved: boolean;
  } | null>(null);
  const suppressNextClickRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activePosition = liveDragPos ?? savedPosition;

  const isVisible = hasLoaded && shouldShowFloatingMistakesCounter(pathname);

  // Re-clamp persisted custom position safely if viewport size changes.
  useEffect(() => {
    if (!isVisible || !savedPosition) return;
    const handleResize = () => {
      const rect = pillRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clamped = clampFloatingPosition(savedPosition, rect.width, rect.height);
      if (clamped.x !== savedPosition.x || clamped.y !== savedPosition.y) {
        setPositionPreference(clamped);
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [isVisible, savedPosition]);

  // Subtle scroll-inertia drift: gently floats ±3.5px while scrolling and settles smoothly back to 0.
  useEffect(() => {
    if (!isVisible || shouldReduceMotion || isDragging) {
      return;
    }

    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const currentY = window.scrollY;
        const delta = currentY - lastScrollYRef.current;
        lastScrollYRef.current = currentY;

        if (Math.abs(delta) >= 2) {
          const nextDrift = delta > 0 ? 3.5 : -3.5;
          setScrollOffsetY(nextDrift);
          if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
          settleTimerRef.current = setTimeout(() => {
            setScrollOffsetY(0);
          }, 160);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };
  }, [isVisible, shouldReduceMotion, isDragging]);

  const updateSmartPopoverPlacement = () => {
    if (typeof window === "undefined" || !pillRef.current) return;
    const rect = pillRef.current.getBoundingClientRect();
    setPopoverAlign({
      openDown: rect.top < window.innerHeight * 0.45,
      alignRight: rect.right > window.innerWidth * 0.65 && rect.left > 140,
    });
  };

  const handlePillPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const pillEl = pillRef.current;
    if (!pillEl) return;
    const rect = pillEl.getBoundingClientRect();
    const session = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
      pillW: rect.width,
      pillH: rect.height,
      moved: false,
    };
    dragSessionRef.current = session;

    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      const current = dragSessionRef.current;
      if (!current || current.pointerId !== moveEvent.pointerId) return;
      const dx = moveEvent.clientX - current.startX;
      const dy = moveEvent.clientY - current.startY;
      if (!current.moved && Math.hypot(dx, dy) < 6) {
        return;
      }
      if (!current.moved) {
        current.moved = true;
        suppressNextClickRef.current = true;
        setIsDragging(true);
        setOpen(false);
      }
      const nextPos = clampFloatingPosition(
        { x: current.originX + dx, y: current.originY + dy },
        current.pillW,
        current.pillH
      );
      setLiveDragPos(nextPos);
    };

    const cleanupDragListeners = () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerEnd);
      window.removeEventListener("pointercancel", handleWindowPointerEnd);
    };

    const handleWindowPointerEnd = (endEvent: PointerEvent) => {
      const current = dragSessionRef.current;
      if (!current || current.pointerId !== endEvent.pointerId) return;
      cleanupDragListeners();
      if (current.moved) {
        const dx = endEvent.clientX - current.startX;
        const dy = endEvent.clientY - current.startY;
        const finalPos = clampFloatingPosition(
          { x: current.originX + dx, y: current.originY + dy },
          current.pillW,
          current.pillH
        );
        setPositionPreference(finalPos);
        setLiveDragPos(null);
        setIsDragging(false);
        setTimeout(() => {
          suppressNextClickRef.current = false;
        }, 60);
      }
      dragSessionRef.current = null;
    };

    window.addEventListener("pointermove", handleWindowPointerMove, { passive: true });
    window.addEventListener("pointerup", handleWindowPointerEnd);
    window.addEventListener("pointercancel", handleWindowPointerEnd);
  };

  // Close popover on outside tap or Escape key.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!isVisible) {
    return null;
  }

  const { unresolvedCount, resolvedCount, topWeakness, breakdown } = summary;
  const hasUnresolved = unresolvedCount > 0;
  const focusLabel = topWeakness
    ? topWeakness.lessonTitle || topWeakness.unitTitle || topWeakness.subjectName
    : null;
  const visibleBreakdown = breakdown.slice(0, 4);

  return (
    <div
      ref={containerRef}
      data-testid="floating-mistakes-counter"
      style={
        activePosition
          ? { left: `${activePosition.x}px`, top: `${activePosition.y}px` }
          : undefined
      }
      className={
        activePosition
          ? "fixed z-[35] max-w-[calc(100vw-16px)] select-none"
          : "fixed bottom-[calc(94px+env(safe-area-inset-bottom,0px))] left-3 lg:bottom-5 lg:left-5 z-[35] max-w-[calc(100vw-16px)] select-none"
      }
    >
      {/* Popover Breakdown Card */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="تفاصيل أخطائك"
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: popoverAlign.openDown ? -8 : 8, scale: 0.98 }
            }
            animate={
              shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: popoverAlign.openDown ? -6 : 6, scale: 0.98 }
            }
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`absolute z-10 ${
              popoverAlign.openDown ? "top-full mt-2.5" : "bottom-full mb-2.5"
            } ${
              popoverAlign.alignRight ? "right-0" : "left-0"
            } w-[min(320px,calc(100vw-24px))] rounded-2xl border border-[#E2E8F0] bg-white/95 dark:bg-[#0F1E36]/95 dark:border-[#1E3352] backdrop-blur-md shadow-[0_14px_40px_-10px_rgba(9,27,64,0.22)] dark:shadow-[0_14px_40px_-10px_rgba(0,0,0,0.65)] overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 px-4 pt-3.5 pb-3 border-b border-[#E2E8F0]/80 dark:border-[#1E3352]">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${
                      hasUnresolved
                        ? "bg-[#800B34]/10 text-[#800B34] dark:bg-[#9E1043]/25 dark:text-[#FDA4AF]"
                        : "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    }`}
                  >
                    {hasUnresolved ? (
                      <ArrowCounterClockwise size={14} weight="bold" />
                    ) : (
                      <CheckCircle size={14} weight="bold" />
                    )}
                  </span>
                  <h3 className="text-sm font-black text-navy dark:text-[#F5F7FB]">
                    مراجعة لأخطائي
                  </h3>
                </div>
                <p className="mt-1 text-xs font-medium text-[#536681] dark:text-[#CBD5E1]">
                  {hasUnresolved ? (
                    <>
                      عندك{" "}
                      <span className="font-bold text-[#800B34] dark:text-[#FDA4AF]">
                        {unresolvedCount === 1
                          ? "سؤال واحد"
                          : unresolvedCount === 2
                            ? "سؤالين"
                            : unresolvedCount}
                      </span>
                      {unresolvedCount > 2 ? " أسئلة" : ""} محتاج
                      {unresolvedCount === 1 ? "" : "ين"} مراجعة
                      {resolvedCount > 0 ? ` • خلصت ${resolvedCount}` : ""}
                    </>
                  ) : resolvedCount > 0 ? (
                    `مفيش أخطاء مستنياك دلوقتي • خلصت ${resolvedCount}`
                  ) : (
                    "مفيش أخطاء متسجلة دلوقتي"
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="قفل قائمة الأخطاء"
                className="inline-flex h-11 w-11 -mt-1.5 -ml-2 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:text-navy hover:bg-muted/60 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Breakdown Body */}
            <div className="p-3 space-y-2 max-h-[260px] overflow-y-auto">
              {hasUnresolved && visibleBreakdown.length > 0 ? (
                <>
                  <p className="px-1 text-[11px] font-bold text-muted-foreground dark:text-slate-400">
                    أخطاءك متركزة في:
                  </p>
                  <div className="space-y-1.5">
                    {visibleBreakdown.map((bucket) => {
                      const filterHref = bucket.lessonId
                        ? `/mistakes?subjectId=${encodeURIComponent(
                            bucket.subjectId
                          )}&lessonId=${encodeURIComponent(bucket.lessonId)}`
                        : `/mistakes?subjectId=${encodeURIComponent(
                            bucket.subjectId
                          )}`;
                      const itemTitle =
                        bucket.lessonTitle || bucket.unitTitle || bucket.subjectName;
                      const showSubjectSub = Boolean(
                        bucket.lessonTitle || bucket.unitTitle
                      );

                      return (
                        <div
                          key={bucket.key}
                          className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E3352] bg-[#F7F9FC] dark:bg-[#142747]/70 p-1.5"
                        >
                          <Link
                            href={filterHref}
                            onClick={() => setOpen(false)}
                            className="flex-1 min-w-0 min-h-[44px] flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-white dark:hover:bg-[#142747] transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-navy dark:text-[#F5F7FB] truncate">
                                {itemTitle}
                              </p>
                              {showSubjectSub && (
                                <p className="text-[11px] text-[#536681] dark:text-[#94A3B8] truncate">
                                  {bucket.subjectName}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-full text-[11px] font-black bg-[#800B34]/10 text-[#800B34] dark:bg-[#9E1043]/25 dark:text-[#FDA4AF]">
                              {bucket.count}
                            </span>
                          </Link>

                          {bucket.lessonId && (
                            <Link
                              href={`/lessons/${bucket.lessonId}`}
                              onClick={() => setOpen(false)}
                              title="راجع شرح الدرس"
                              className="shrink-0 min-h-[44px] inline-flex items-center gap-1 rounded-lg px-2.5 text-[11px] font-bold text-action-blue dark:text-sky-400 hover:bg-action-blue/10 dark:hover:bg-sky-500/15 transition-colors"
                            >
                              <BookOpen size={13} weight="bold" />
                              <span>الشرح</span>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {breakdown.length > 4 && (
                    <p className="px-1 pt-0.5 text-[11px] text-muted-foreground dark:text-slate-400">
                      + {breakdown.length - 4} دروس تانية جوا صفحة المراجعة
                    </p>
                  )}
                </>
              ) : (
                <p className="px-2 py-2 text-xs leading-relaxed text-muted-foreground dark:text-slate-300">
                  كل أسئلتك تمام لحد دلوقتي. أي سؤال يقف معاك في الامتحانات هيتسجل
                  هنا أوتوماتيك عشان ترجعله بعدين.
                </p>
              )}
            </div>

            {/* Footer Action */}
            <div className="flex items-center gap-2 px-3 pb-3 pt-2 border-t border-[#E2E8F0]/70 dark:border-[#1E3352]">
              <Link
                href="/mistakes"
                onClick={() => setOpen(false)}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy hover:bg-navy-light dark:bg-[#2C70BF] dark:hover:bg-[#1D4ED8] text-white text-xs font-extrabold px-3 transition-colors"
              >
                <span>
                  {hasUnresolved ? "افتح مراجعة لأخطائي" : "شوف سجل الأخطاء"}
                </span>
                <ArrowUpLeft size={14} weight="bold" />
              </Link>
              {savedPosition && (
                <button
                  type="button"
                  onClick={() => {
                    setPositionPreference(null);
                    setOpen(false);
                  }}
                  className="min-h-[44px] px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E3352] text-[11px] font-bold text-[#536681] hover:text-navy dark:text-[#CBD5E1] dark:hover:text-white transition-colors cursor-pointer shrink-0"
                  title="إرجاع العداد لمكانه الافتراضي"
                >
                  إرجاع مكانه
                </button>
              )}
              {isCollapsed && (
                <button
                  type="button"
                  onClick={() => setCollapsePreference(false)}
                  className="min-h-[44px] px-3 rounded-xl border border-[#E2E8F0] dark:border-[#1E3352] text-xs font-bold text-[#536681] hover:text-navy dark:text-[#CBD5E1] dark:hover:text-white transition-colors cursor-pointer"
                >
                  توسيع
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable Calm Floating Pill */}
      <motion.div
        ref={pillRef}
        onPointerDown={handlePillPointerDown}
        onDragStart={(e) => e.preventDefault()}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={
          shouldReduceMotion || isDragging
            ? { opacity: 1, y: 0 }
            : { opacity: 1, y: scrollOffsetY }
        }
        transition={{
          opacity: { duration: 0.22 },
          y: { type: "spring", stiffness: 200, damping: 26, mass: 0.75 },
        }}
        className={`touch-none inline-flex items-center rounded-2xl border backdrop-blur-md transition-colors ${
          isDragging ? "cursor-grabbing shadow-2xl scale-[1.02]" : "cursor-grab"
        } ${
          hasUnresolved
            ? "border-[#800B34]/20 bg-white/95 dark:bg-[#0F1E36]/95 dark:border-[#9E1043]/40 shadow-[0_8px_28px_-8px_rgba(9,27,64,0.2)] dark:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.6)]"
            : "border-emerald-500/25 bg-white/95 dark:bg-[#0F1E36]/95 dark:border-emerald-500/30 shadow-[0_8px_24px_-8px_rgba(9,27,64,0.14)] dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55)]"
        }`}
      >
        <span
          title="اسحب لتحريك العداد لأي مكان"
          aria-hidden="true"
          className="ps-1.5 pe-0.5 text-[#94A3B8] dark:text-[#64748B] flex items-center justify-center shrink-0"
        >
          <DotsSixVertical size={15} weight="bold" />
        </span>
        <button
          type="button"
          onClick={() => {
            if (suppressNextClickRef.current) return;
            updateSmartPopoverPlacement();
            setOpen((prev) => !prev);
          }}
          aria-expanded={open}
          aria-label={
            hasUnresolved
              ? `مراجعة لأخطائي: ${unresolvedCount} سؤال محتاج مراجعة (اسحب للتحريك)`
              : "مراجعة لأخطائي: مفيش أخطاء دلوقتي (اسحب للتحريك)"
          }
          className={`min-h-[44px] inline-flex items-center gap-2 text-start transition-colors rounded-2xl cursor-pointer ${
            isCollapsed ? "pe-2.5 ps-1" : "ps-1.5 pe-2.5"
          }`}
        >
          <span
            className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
              hasUnresolved
                ? "bg-[#800B34] text-white"
                : "bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
            }`}
          >
            {hasUnresolved ? (
              <ArrowCounterClockwise size={15} weight="bold" />
            ) : (
              <CheckCircle size={15} weight="bold" />
            )}
          </span>

          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-black tabular-nums ${
                hasUnresolved
                  ? "bg-[#800B34]/10 text-[#800B34] dark:bg-[#9E1043]/25 dark:text-[#FDA4AF]"
                  : "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
              }`}
            >
              <AnimatedCount value={unresolvedCount} />
            </span>

            {!isCollapsed && (
              <div className="min-w-0 max-w-[140px] sm:max-w-[185px]">
                <p className="text-xs font-extrabold text-navy dark:text-slate-100 leading-tight truncate">
                  مراجعة لأخطائي
                </p>
                {hasUnresolved && focusLabel ? (
                  <p className="hidden sm:block text-[10px] font-medium text-muted-foreground dark:text-slate-400 truncate mt-0.5">
                    أكترهم: {focusLabel}
                  </p>
                ) : (
                  <p className="hidden sm:block text-[10px] font-medium text-muted-foreground dark:text-slate-400 truncate mt-0.5">
                    {hasUnresolved ? "اضغط للمراجعة" : "مفيش أخطاء دلوقتي"}
                  </p>
                )}
              </div>
            )}
          </div>

          <span className="text-muted-foreground dark:text-slate-400 shrink-0">
            {open ? (
              <CaretDown size={13} weight="bold" />
            ) : (
              <CaretUp size={13} weight="bold" />
            )}
          </span>
        </button>

        {!isCollapsed && (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCollapsePreference(true);
            }}
            aria-label="تصغير عداد الأخطاء"
            title="تصغير العداد"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border-s border-border/60 dark:border-slate-800 text-muted-foreground hover:text-navy dark:hover:text-slate-200 transition-colors cursor-pointer rounded-e-2xl"
          >
            <CaretLeft size={14} weight="bold" />
          </button>
        )}
      </motion.div>
    </div>
  );
}
