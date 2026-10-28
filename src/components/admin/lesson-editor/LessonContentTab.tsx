"use client";

import { CheckCircle2, Plus, Trash2 } from "lucide-react";

interface LessonContentTabProps {
  objectives: string[];
  newObjective: string;
  setNewObjective: (v: string) => void;
  onAddObjective: () => void;
  onRemoveObjective: (idx: number) => void;
  bodyText: string;
  setBodyText: (v: string) => void;
}

export function LessonContentTab({
  objectives,
  newObjective,
  setNewObjective,
  onAddObjective,
  onRemoveObjective,
  bodyText,
  setBodyText,
}: LessonContentTabProps) {
  return (
    <div className="space-y-6">
      {/* Objectives */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#800020]" />
            <span>الأهداف التعليمية ومخرجات التعلم ({objectives.length})</span>
          </label>
          <span className="text-[13px] text-[#94A3B8]">
            تظهر أعلى الدرس للطالب
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            placeholder="مثال: التمييز بين الانقسام الميتوزي والميوزي بدقة"
            className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddObjective();
              }
            }}
          />
          <button
            type="button"
            onClick={onAddObjective}
            disabled={!newObjective.trim()}
            className="h-11 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 shrink-0 transition-transform active:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة هدف</span>
          </button>
        </div>

        {objectives.length > 0 && (
          <ul className="space-y-2 pt-2">
            {objectives.map((obj, i) => (
              <li
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3 text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-lg bg-[#800020]/10 text-[#800020] text-[13px] flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span>{obj}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveObjective(i)}
                  className="text-[#DC2626] hover:text-[#B91C1C] p-1 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Body Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            الشرح التفصيلي للدرس (Body Text)
          </label>
          <span className="text-[13px] text-[#94A3B8]">
            يدعم الترويسات (## عنوان رئيسي، ### عنوان فرعي، * قائمة)
          </span>
        </div>

        <textarea
          rows={14}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="اكتب أو الصق شرح الدرس هنا..."
          className="w-full p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm font-sans leading-relaxed text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
        />
      </div>
    </div>
  );
}
