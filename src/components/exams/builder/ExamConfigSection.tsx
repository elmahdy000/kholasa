"use client";

import { Target, Timer, Clock, Loader2, Check } from "lucide-react";
import { ExamMode } from "./types";

interface ExamConfigSectionProps {
  questionCount: number;
  setQuestionCount: (n: number) => void;
  availableCount: number | null;
  isCounting: boolean;
  mode: ExamMode;
  setMode: (m: ExamMode) => void;
  durationMinutes: number;
  setDurationMinutes: (d: number) => void;
}

export function ExamConfigSection({
  questionCount,
  setQuestionCount,
  availableCount,
  isCounting,
  mode,
  setMode,
  durationMinutes,
  setDurationMinutes,
}: ExamConfigSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 5. عدد الأسئلة (Question Count) */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
                5. عدد الأسئلة
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                اختر كمية الأسئلة للاختبار
              </p>
            </div>
          </div>

          <div className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] bg-[#F7F8FA] dark:bg-[#0D1B2E] px-2 py-0.5 rounded-md border border-[#E8E9ED] dark:border-[#22364F]">
            {isCounting ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>فحص...</span>
              </span>
            ) : (
              <span>
                المتاح:{" "}
                <strong className="text-[#800020] dark:text-[#E59A18] font-mono">
                  {availableCount ?? 0}
                </strong>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((num) => {
              const isSelected = questionCount === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`h-11 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white font-bold shadow-xs"
                      : "bg-white dark:bg-[#0D1B2E] border-[#E8E9ED] dark:border-[#22364F] text-[#12263F] dark:text-[#C8D2E0] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
                  }`}
                >
                  <span className="text-sm font-extrabold font-mono leading-none">
                    {num}
                  </span>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? "text-white/80" : "text-[#64748B] dark:text-[#94A3B8]"
                    }`}
                  >
                    أسئلة
                  </span>
                </button>
              );
            })}
          </div>

          {availableCount !== null &&
            availableCount < questionCount &&
            availableCount > 0 && (
              <p className="text-[11px] text-[#D97706] dark:text-[#E59A18] font-medium leading-relaxed">
                * متاح {availableCount} أسئلة فقط بالمعايير الحالية؛ سيتم تضمين أقصى عدد متاح.
              </p>
            )}
        </div>
      </section>

      {/* 6. نظام الاختبار (Exam Mode) */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
              6. نظام الاختبار
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              تدريب ذاتي أم محاكاة امتحان
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            {/* وضع التدريب */}
            <button
              type="button"
              onClick={() => setMode("PRACTICE")}
              className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between min-h-[64px] h-auto cursor-pointer ${
                mode === "PRACTICE"
                  ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 shadow-xs"
                  : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`selection-label text-xs font-bold ${
                    mode === "PRACTICE"
                      ? "text-[#800020] dark:text-[#F5F7FB]"
                      : "text-[#12263F] dark:text-[#C8D2E0]"
                  }`}
                >
                  وضع التدريب
                </span>
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    mode === "PRACTICE"
                      ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                      : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
                  }`}
                >
                  {mode === "PRACTICE" && (
                    <Check className="w-2 h-2 stroke-[3]" />
                  )}
                </div>
              </div>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-normal mt-1">
                تصحيح وتفسير بعد كل سؤال
              </span>
            </button>

            {/* وضع الامتحان */}
            <button
              type="button"
              onClick={() => setMode("EXAM")}
              className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between min-h-[64px] h-auto cursor-pointer ${
                mode === "EXAM"
                  ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 shadow-xs"
                  : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`selection-label text-xs font-bold ${
                    mode === "EXAM"
                      ? "text-[#800020] dark:text-[#F5F7FB]"
                      : "text-[#12263F] dark:text-[#C8D2E0]"
                  }`}
                >
                  وضع الامتحان
                </span>
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    mode === "EXAM"
                      ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                      : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
                  }`}
                >
                  {mode === "EXAM" && <Check className="w-2 h-2 stroke-[3]" />}
                </div>
              </div>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-normal mt-1">
                حل الكل ثم النتيجة والتعليل
              </span>
            </button>
          </div>

          {/* Duration selector if Exam mode */}
          {mode === "EXAM" && (
            <div className="pt-2 border-t border-[#E8E9ED] dark:border-[#22364F] flex items-center justify-between gap-2 text-xs">
              <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#800020] dark:text-[#E59A18]" />
                <span>المدة:</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {[15, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      durationMinutes === mins
                        ? "bg-[#800020] dark:bg-[#A30D36] text-white"
                        : "bg-[#F7F8FA] dark:bg-[#0D1B2E] border border-[#E8E9ED] dark:border-[#22364F] text-[#12263F] dark:text-[#C8D2E0] hover:border-[#800020] dark:hover:border-[#2D4563]"
                    }`}
                  >
                    {mins}د
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
