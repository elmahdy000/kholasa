"use client";

import { useState, useEffect, useRef, RefObject } from "react";
import { Play, Pause, SpeakerHigh, CaretUp, X } from "@phosphor-icons/react";

interface LessonAudioPlayerProps {
  audioUrl?: string | null;
  isPlayingAudio: boolean;
  audioProgress: number;
  playbackSpeed: 1 | 1.5 | 2;
  audioElemRef: RefObject<HTMLAudioElement | null>;
  onTogglePlay: () => void;
  onChangeSpeed: () => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onEnded: () => void;
}

export function LessonAudioPlayer({
  audioUrl,
  isPlayingAudio,
  audioProgress,
  playbackSpeed,
  audioElemRef,
  onTogglePlay,
  onChangeSpeed,
  onTimeUpdate,
  onEnded,
}: LessonAudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOutOfView, setIsOutOfView] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Monitor when the top player scrolls out of the student's view
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOutOfView(!entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Re-open sticky player if user presses play
  useEffect(() => {
    if (isPlayingAudio) {
      setIsDismissed(false);
    }
  }, [isPlayingAudio]);

  return (
    <>
      {/* 1. Main Inline Lesson Audio Player */}
      <div
        ref={containerRef}
        className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xs transition-colors"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer"
            title={isPlayingAudio ? "إيقاف مؤقت" : "تشغيل الملخص الصوتي"}
          >
            {isPlayingAudio ? (
              <Pause className="w-4 h-4" weight="fill" />
            ) : (
              <Play className="w-4 h-4 mr-0.5" weight="fill" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#12263F] dark:text-white">
                {audioUrl ? "الملخص الصوتي للدرس" : "ملخص صوتي سريع ومباشر"}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#D97706] border border-amber-200 dark:border-amber-800/60">
                <SpeakerHigh className="w-3 h-3" />
                <span>بودكاست سريع</span>
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
              استمع للنقاط الجوهرية والكبسولة الشاملة
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-72">
          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-[#0D1B2E] overflow-hidden border border-slate-200/60 dark:border-slate-800">
            <div
              className="h-full bg-gradient-to-l from-[#800020] to-[#D97706] rounded-full transition-all duration-300"
              style={{ width: `${audioProgress}%` }}
            />
          </div>

          <button
            type="button"
            onClick={onChangeSpeed}
            className="h-8 px-2.5 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] font-mono text-xs font-bold text-[#12263F] dark:text-white bg-slate-50 dark:bg-[#0D1B2E] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer shadow-2xs"
            title="تغيير سرعة الصوت"
          >
            {playbackSpeed}x
          </button>
        </div>

        {/* Real Audio Player Tag */}
        {audioUrl && (
          <audio
            ref={audioElemRef}
            src={audioUrl}
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              if (el.duration) {
                onTimeUpdate(el.currentTime, el.duration);
              }
            }}
            onEnded={onEnded}
            className="hidden"
          />
        )}
      </div>

      {/* 2. Smart Sticky Mini-Player when Scrolled Down */}
      {isOutOfView && (isPlayingAudio || audioProgress > 0) && !isDismissed && (
        <div
          dir="rtl"
          className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md sm:max-w-lg bg-white/95 dark:bg-[#10233A]/95 backdrop-blur-md border border-[#E8E9ED] dark:border-[#22364F] shadow-2xl rounded-2xl p-2.5 px-3.5 sm:px-4 flex items-center justify-between gap-2.5 animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-black/5 dark:ring-white/10"
        >
          {/* Left: Play/Pause button + Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer"
              title={isPlayingAudio ? "إيقاف مؤقت" : "متابعة الاستماع"}
            >
              {isPlayingAudio ? (
                <Pause className="w-4 h-4" weight="fill" />
              ) : (
                <Play className="w-4 h-4 mr-0.5" weight="fill" />
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-bold text-[#12263F] dark:text-white truncate">
                  {audioUrl ? "الملخص الصوتي للدرس" : "ملخص صوتي سريع"}
                </span>
                {isPlayingAudio && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>يعمل الآن</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono" dir="ltr">
                {Math.round(audioProgress)}%
              </span>
            </div>
          </div>

          {/* Right: Progress bar + Speed + Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-16 sm:w-28 h-1.5 rounded-full bg-slate-100 dark:bg-[#0D1B2E] overflow-hidden border border-slate-200/60 dark:border-slate-800">
              <div
                className="h-full bg-gradient-to-l from-[#800020] to-[#D97706] rounded-full transition-all duration-300"
                style={{ width: `${audioProgress}%` }}
              />
            </div>

            <button
              type="button"
              onClick={onChangeSpeed}
              className="h-7 px-2 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] font-mono text-xs font-bold text-[#12263F] dark:text-white bg-slate-50 dark:bg-[#0D1B2E] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title="تغيير السرعة"
            >
              {playbackSpeed}x
            </button>

            {/* Scroll back to main player */}
            <button
              type="button"
              onClick={() => {
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#800020] dark:hover:text-[#FB7185] flex items-center justify-center transition-colors cursor-pointer"
              title="الرجوع لمشغل الدرس"
            >
              <CaretUp className="w-3.5 h-3.5" weight="bold" />
            </button>

            {/* Dismiss sticky */}
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              title="إخفاء الشريط المصغر"
            >
              <X className="w-3.5 h-3.5" weight="bold" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
