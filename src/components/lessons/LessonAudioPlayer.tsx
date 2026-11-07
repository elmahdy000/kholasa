"use client";

import { RefObject } from "react";
import { Play, Pause, SpeakerHigh } from "@phosphor-icons/react";

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
  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xs transition-colors">
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
  );
}
