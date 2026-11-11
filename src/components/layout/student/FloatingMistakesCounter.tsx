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
  X,
} from "@phosphor-icons/react";
import { AnimatedCount } from "@/components/ui/AnimatedCount";
import type { StudentMistakeDiagnosisSummary } from "@/lib/mistake-diagnosis";

const COLLAPSE_STORAGE_KEY = "kholasa_floating_mistakes_collapsed";
const COLLAPSE_EVENT = "kholasa:floating-mistakes-collapse";

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

  const [open, setOpen] = useState(false);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollYRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVisible = hasLoaded && shouldShowFloatingMistakesCounter(pathname);

  // Subtle scroll-inertia drift: gently floats ±3.5px while scrolling and settles smoothly back to 0.
  useEffect(() => {
    if (!isVisible || shouldReduceMotion) {
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
  }, [isVisible, shouldReduceMotion]);

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
      className="fixed bottom-[calc(94px+env(safe-area-inset-bottom,0px))] left-3 lg:bottom-5 lg:left-5 z-[35] max-w-[calc(100vw-24px)]"
    >
      {/* Popover Breakdown Card */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="تفاصيل أخطائك"
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }
            }
            animate={
              shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }
            }
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mb-2.5 w-[min(320px,calc(100vw-24px))] rounded-2xl border border-border/90 bg-white/95 dark:bg-slate-900/95 dark:border-slate-700/90 backdrop-blur-md shadow-[0_14px_40px_-10px_rgba(9,27,64,0.22)] dark:shadow-[0_14px_40px_-10px_rgba(0,0,0,0.65)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 px-4 pt-3.5 pb-3 border-b border-border/60 dark:border-slate-800">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${
                      hasUnresolved
                        ? "bg-[#800B34]/10 text-[#800B34] dark:bg-red-500/15 dark:text-red-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                    }`}
                  >
                    {hasUnresolved ? (
                      <ArrowCounterClockwise size={14} weight="bold" />
                    ) : (
                      <CheckCircle size={14} weight="bold" />
                    )}
                  </span>
                  <h3 className="text-sm font-black text-navy dark:text-slate-100">
                    مراجعة لأخطائي
                  </h3>
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground dark:text-slate-400">
                  {hasUnresolved ? (
                    <>
                      عندك{" "}
                      <span className="font-bold text-[#800B34] dark:text-red-400">
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
                          className="flex items-center gap-1.5 rounded-xl border border-border/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-1.5"
                        >
                          <Link
                            href={filterHref}
                            onClick={() => setOpen(false)}
                            className="flex-1 min-w-0 min-h-[44px] flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-navy dark:text-slate-100 truncate">
                                {itemTitle}
                              </p>
                              {showSubjectSub && (
                                <p className="text-[11px] text-muted-foreground dark:text-slate-400 truncate">
                                  {bucket.subjectName}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-full text-[11px] font-black bg-[#800B34]/10 text-[#800B34] dark:bg-red-500/20 dark:text-red-300">
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
            <div className="flex items-center gap-2 px-3 pb-3 pt-1 border-t border-border/50 dark:border-slate-800/80">
              <Link
                href="/mistakes"
                onClick={() => setOpen(false)}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy hover:bg-navy-light dark:bg-slate-100 dark:hover:bg-white text-white dark:text-navy text-xs font-extrabold px-3 transition-colors"
              >
                <span>
                  {hasUnresolved ? "افتح مراجعة لأخطائي" : "شوف سجل الأخطاء"}
                </span>
                <ArrowUpLeft size={14} weight="bold" />
              </Link>
              {isCollapsed && (
                <button
                  type="button"
                  onClick={() => setCollapsePreference(false)}
                  className="min-h-[44px] px-3 rounded-xl border border-border/80 dark:border-slate-700 text-xs font-bold text-muted-foreground hover:text-navy dark:hover:text-slate-100 transition-colors cursor-pointer"
                >
                  توسيع
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calm Floating Pill */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={
          shouldReduceMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 1, y: scrollOffsetY }
        }
        transition={{
          opacity: { duration: 0.22 },
          y: { type: "spring", stiffness: 200, damping: 26, mass: 0.75 },
        }}
        className={`inline-flex items-center rounded-2xl border backdrop-blur-md transition-colors ${
          hasUnresolved
            ? "border-[#800B34]/20 bg-white/95 dark:bg-slate-900/95 dark:border-red-500/30 shadow-[0_8px_28px_-8px_rgba(9,27,64,0.2)] dark:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.6)]"
            : "border-emerald-500/25 bg-white/95 dark:bg-slate-900/95 dark:border-emerald-500/25 shadow-[0_8px_24px_-8px_rgba(9,27,64,0.14)] dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55)]"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={
            hasUnresolved
              ? `مراجعة لأخطائي: ${unresolvedCount} سؤال محتاج مراجعة`
              : "مراجعة لأخطائي: مفيش أخطاء دلوقتي"
          }
          className={`min-h-[44px] inline-flex items-center gap-2.5 text-start transition-colors cursor-pointer rounded-2xl ${
            isCollapsed ? "px-3" : "ps-3 pe-2.5"
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
                  ? "bg-[#800B34]/10 text-[#800B34] dark:bg-red-500/20 dark:text-red-300"
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
