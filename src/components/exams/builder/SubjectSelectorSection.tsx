"use client";

import { BookOpen, Check } from "lucide-react";
import { Subject } from "./types";

interface SubjectSelectorSectionProps {
  subjects: Subject[];
  selectedSubjectId: string;
  currentSubject?: Subject;
  onSelectSubject: (id: string) => void;
}

export function SubjectSelectorSection({
  subjects,
  selectedSubjectId,
  currentSubject,
  onSelectSubject,
}: SubjectSelectorSectionProps) {
  return (
    <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
              1. المادة الدراسية
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              اختر المادة اللي حابب تتدرب على أسئلتها
            </p>
          </div>
        </div>
        {currentSubject && (
          <span className="hidden sm:inline-flex text-xs font-bold text-[#800020] dark:text-[#F5F7FB] bg-[#800020]/8 dark:bg-[#A30D36]/20 border border-transparent dark:border-[#A30D36]/40 px-2.5 py-1 rounded-lg shrink-0">
            <bdi>{currentSubject.name}</bdi>
          </span>
        )}
      </div>

      {/* Subject Cards Grid with Adaptive Layout & Zero Truncation */}
      <div className="subject-grid w-full pt-1">
        {subjects.map((s) => {
          const isSelected = selectedSubjectId === s.id;
          const totalLessons = s.units.reduce(
            (sum, u) => sum + u.lessons.length,
            0
          );

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSubject(s.id)}
              className={`subject-card w-full h-full p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                isSelected
                  ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 shadow-xs"
                  : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
              }`}
            >
              <div className="flex items-start justify-between gap-2.5 w-full">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                    style={{ backgroundColor: s.color || "#800020" }}
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={`subject-title text-xs sm:text-sm font-bold block ${
                        isSelected
                          ? "text-[#800020] dark:text-[#F5F7FB]"
                          : "text-[#12263F] dark:text-[#C8D2E0]"
                      }`}
                    >
                      <bdi>{s.name}</bdi>
                    </span>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                      : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E9ED]/60 dark:border-[#22364F]/60 w-full flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                <span>{s.units.length} فصول</span>
                <span className="opacity-40">•</span>
                <span>{totalLessons} درس</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
