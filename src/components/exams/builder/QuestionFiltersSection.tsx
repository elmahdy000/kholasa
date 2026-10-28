"use client";

import {
  HelpCircle,
  SlidersHorizontal,
  ListChecks,
  CheckSquare,
  FileText,
  Shuffle,
  Check,
} from "lucide-react";
import { QuestionTypeOption, DifficultyOption } from "./types";

interface QuestionFiltersSectionProps {
  questionType: QuestionTypeOption;
  setQuestionType: (t: QuestionTypeOption) => void;
  difficulty: DifficultyOption;
  setDifficulty: (d: DifficultyOption) => void;
}

export function QuestionFiltersSection({
  questionType,
  setQuestionType,
  difficulty,
  setDifficulty,
}: QuestionFiltersSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 3. نوع الأسئلة (Question Types) */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
              3. نوع الأسئلة
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              اختر نمط ونوعية الأسئلة
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {[
            { id: "MCQ" as const, label: "اختيار من متعدد", icon: ListChecks },
            { id: "TRUE_FALSE" as const, label: "صح أم خطأ", icon: CheckSquare },
            { id: "ESSAY" as const, label: "أسئلة مقالية", icon: FileText },
            { id: "ALL" as const, label: "مختلط (الكل)", icon: Shuffle },
          ].map((t) => {
            const isSelected = questionType === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setQuestionType(t.id)}
                className={`min-h-[44px] h-auto p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 text-[#800020] dark:text-[#F5F7FB] font-bold shadow-xs"
                    : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] text-[#12263F] dark:text-[#C8D2E0] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="selection-label text-xs font-bold leading-snug">
                    {t.label}
                  </span>
                </div>
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                      : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
                  }`}
                >
                  {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. مستوى الصعوبة (Difficulty) */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
              4. مستوى الصعوبة
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              حدد درجة التحدي المناسبة لمستواك
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {[
            { id: "EASY" as const, label: "سهل", desc: "تأسيسي" },
            { id: "MEDIUM" as const, label: "متوسط", desc: "تطبيق" },
            { id: "HARD" as const, label: "متقدم", desc: "تحليل" },
            { id: "ALL" as const, label: "جميع المستويات", desc: "متدرج" },
          ].map((d) => {
            const isSelected = difficulty === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id)}
                className={`min-h-[44px] h-auto p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 text-[#800020] dark:text-[#F5F7FB] font-bold shadow-xs"
                    : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] text-[#12263F] dark:text-[#C8D2E0] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <span className="selection-label text-xs block font-bold leading-tight">
                    {d.label}
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                    {d.desc}
                  </span>
                </div>
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                      : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
                  }`}
                >
                  {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
