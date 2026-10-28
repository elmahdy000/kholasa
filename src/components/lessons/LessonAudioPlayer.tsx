"use client";

import { RefObject } from "react";
import { Play, Pause } from "@phosphor-icons/react";

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
    <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-lg bg-[#800020] text-white flex items-center justify-center shrink-0 hover:bg-[#66001A] transition-colors"
        >
          {isPlayingAudio ? (
            <Pause className="w-5 h-5" weight="fill" />
          ) : (
            <Play className="w-5 h-5 mr-0.5" weight="fill" />
          )}
        </button>
        <div>
          <span className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white block">
            {audioUrl ? "الملخص الصوتي للدرس" : "ملخص صوتي سريع ومباشر"}
          </span>
          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
            استمع للنقاط الجوهرية والكبسولة الشاملة
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-64">
        <div className="flex-1 h-1.5 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] overflow-hidden">
          <div
            className="h-full bg-[#800020] transition-all duration-300"
            style={{ width: `${audioProgress}%` }}
          />
        </div>
        <button
          onClick={onChangeSpeed}
          className="px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#334155] font-mono text-[13px] font-bold text-[#0F172A] dark:text-white bg-[#F8FAFC] dark:bg-[#1E293B] hover:border-[#E2E8F0] transition-colors"
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
