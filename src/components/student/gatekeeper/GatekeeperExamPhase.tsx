"use client";

import { Check, X } from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { QuestionItem } from "./types";

interface GatekeeperExamPhaseProps {
  currentQ: QuestionItem;
  answers: Record<string, { selectedOptionId?: string; essayText?: string }>;
  onSelectOption: (questionId: string, optionId: string) => void;
  onEssayChange: (questionId: string, text: string) => void;
}

export function GatekeeperExamPhase({
  currentQ,
  answers,
  onSelectOption,
  onEssayChange,
}: GatekeeperExamPhaseProps) {
  return (
    <div className="space-y-5">
      {/* Question Category & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#800B34]/10 dark:bg-[#1E293B] text-[#800B34] text-[13px] font-bold">
            {currentQ.subjectName}
          </span>
          {currentQ.unitTitle && (
            <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] text-[13px] font-bold">
              {currentQ.unitTitle}
            </span>
          )}
        </div>

        <span className="text-[13px] font-bold px-2 py-1 rounded-md bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706]">
          {currentQ.type === "MCQ"
            ? "اختيار من متعدد"
            : currentQ.type === "TRUE_FALSE"
            ? "صح أو خطأ"
            : "سؤال مقالي"}
        </span>
      </div>

      {/* Statement */}
      <div className="py-1">
        <BidiStatement
          as="h3"
          text={currentQ.statement}
          className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed"
        />
      </div>

      {/* Options Section */}
      {/* MCQ Options */}
      {currentQ.type === "MCQ" && (
        <div className="space-y-3 pt-1">
          {currentQ.options.map((opt, oIdx) => {
            const isSelected =
              answers[currentQ.id]?.selectedOptionId === opt.id;
            const letters = ["أ", "ب", "ج", "د", "هـ"];
            const englishLetters = ["A", "B", "C", "D", "E"];
            const isEnglish = !/[\u0600-\u06FF]/.test(currentQ.statement || "");
            const letter = isEnglish
              ? englishLetters[oIdx] || oIdx + 1
              : letters[oIdx] || oIdx + 1;

            return (
              <button
                key={opt.id}
                type="button"
                dir={isEnglish ? "ltr" : "rtl"}
                aria-pressed={isSelected}
                onClick={() => onSelectOption(currentQ.id, opt.id)}
                className={`w-full p-3 sm:p-4 rounded-xl border ${isEnglish ? "text-left font-sans" : "text-right font-content"} transition-all flex items-start justify-between gap-3 cursor-pointer overflow-hidden ${
                  isSelected
                    ? "bg-[#800B34]/10 dark:bg-[#1E293B] border-[#800B34] text-[#0F172A] dark:text-white"
                    : "bg-[#F8FAFC] dark:bg-[#1E293B]/60 hover:bg-[#F8FAFC] dark:hover:bg-[#334155] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span
                    className={`w-6 h-6 rounded-lg text-[13px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-[#800B34] text-white"
                        : "bg-[#E2E8F0] dark:bg-[#334155] text-[#64748B] dark:text-[#94A3B8]"
                    }`}
                  >
                    {letter}
                  </span>
                  <div className={`min-w-0 flex-1 leading-relaxed break-words ${isEnglish ? "text-left" : "text-right"}`}>
                    <BidiStatement
                      as="span"
                      text={opt.text}
                      className="text-[13px] sm:text-sm font-bold"
                    />
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? "border-[#800B34] bg-[#800B34] text-white"
                      : "border-[#E2E8F0] dark:border-[#334155] text-transparent"
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* TRUE_FALSE Options */}
      {currentQ.type === "TRUE_FALSE" && (
        <div className="space-y-3 pt-2">
          <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block font-bold">
            حدد صحة العبارة:
          </span>
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt) => {
              const isSelected =
                answers[currentQ.id]?.selectedOptionId === opt.id;
              const isTrue =
                opt.text.includes("صح") ||
                opt.text.includes("صواب") ||
                opt.text.toLowerCase().includes("true");

              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectOption(currentQ.id, opt.id)}
                  className={`p-4 rounded-xl border text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? isTrue
                        ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                        : "bg-[#DC2626] text-white border-[#DC2626] shadow-sm"
                      : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0]"
                  }`}
                >
                  {isTrue ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ESSAY Input */}
      {currentQ.type === "ESSAY" && (
        <div className="space-y-2 pt-1">
          <label className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block font-bold">
            اكتب إجابتك أو الفكرة الرئيسية باختصار:
          </label>
          <textarea
            rows={4}
            value={answers[currentQ.id]?.essayText || ""}
            onChange={(e) => onEssayChange(currentQ.id, e.target.value)}
            placeholder="اكتب هنا ما تتذكره من مفاهيم أو تعليلات... وسنعرض لك نموذج الإجابة والمفهوم لمقارنته فور التسليم."
            className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800B34] leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
