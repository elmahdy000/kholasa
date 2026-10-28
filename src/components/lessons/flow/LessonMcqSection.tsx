"use client";

import {
  CheckCircle,
  Lightbulb,
  Check,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { Question, QuestionAnswerState } from "../types";

interface LessonMcqSectionProps {
  questions: { question: Question }[];
  questionAnswers: Record<string, QuestionAnswerState>;
  onSelectOption: (questionId: string, optionId: string) => void;
}

export function LessonMcqSection({
  questions,
  questionAnswers,
  onSelectOption,
}: LessonMcqSectionProps) {
  return (
    <div id="section-mcq" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="p-6 rounded-2xl bg-[#800020]/10 border border-[#800020]/25 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#800020] text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle className="w-6 h-6" weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#800020] dark:text-[#FB7185] bg-[#800020]/15 px-2 py-0.5 rounded-md">
                المحطة الثالثة
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                3. أسئلة اختيار من متعدد
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              اختر الإجابة بلمسة واحدة لتحصل على التصحيح اللحظي مع الشرح التفكيكي لكل خيار
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#800020]/20 text-[#800020] dark:text-[#FB7185] text-[13px] font-bold font-mono">
            {questions.length} سؤال اختيار
          </span>
        </div>
      </div>

      {/* Questions List */}
      {questions.length > 0 ? (
        <div className="space-y-5">
          {questions.map(({ question }, qIndex) => {
            const state = questionAnswers[question.id];

            return (
              <div
                key={question.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
                  <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#800020]/10 dark:bg-[#800020]/30 text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-mono font-bold text-[12px]">
                      {qIndex + 1}
                    </span>
                    <span>السؤال رقم {qIndex + 1}</span>
                  </span>
                  <span className="px-3 py-1 rounded-lg text-[12px] font-bold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] border border-[#E2E8F0]/60 dark:border-[#334155]/60">
                    {question.difficulty === "EASY"
                      ? "مباشر"
                      : question.difficulty === "MEDIUM"
                      ? "متوسط"
                      : "متقدم"}
                  </span>
                </div>

                <BidiStatement
                  as="h4"
                  text={question.statement}
                  className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed font-content"
                />

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((opt, optIdx) => {
                    const isSelected = state?.selectedOptionId === opt.id;
                    const isRevealed = state?.revealed;
                    const isOptionCorrect = state?.reveal?.correctOptionId === opt.id;
                    let btnStyle =
                      "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#800020]/50";

                    if (isRevealed) {
                      if (isOptionCorrect) {
                        btnStyle =
                          "bg-[#059669]/10 border-[#059669]/40 text-[#059669] font-bold";
                      } else if (isSelected && !isOptionCorrect) {
                        btnStyle =
                          "bg-[#DC2626]/10 border-[#DC2626]/40 text-[#DC2626] font-bold";
                      }
                    }

                    const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isRevealed}
                        onClick={() => onSelectOption(question.id, opt.id)}
                        className={`w-full p-4 rounded-xl border text-right text-[13px] sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 transition-all font-content ${btnStyle}`}
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          <span className="w-7 h-7 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] flex items-center justify-center text-[13px] font-mono font-bold shrink-0 mt-0.5 sm:mt-0 border border-[#E2E8F0]/80 dark:border-[#334155]/80">
                            {arabicLetters[optIdx] || opt.order}
                          </span>
                          <div className="min-w-0 flex-1 leading-relaxed">
                            <BidiStatement as="span" text={opt.text} />
                          </div>
                        </div>

                        {isRevealed && (
                          <div className="shrink-0">
                            {isOptionCorrect ? (
                              <span className="text-[#059669] text-[13px] font-bold flex items-center gap-1">
                                <Check className="w-4 h-4" weight="bold" />
                                <span>صح! ممتاز</span>
                              </span>
                            ) : isSelected ? (
                              <span className="text-[#DC2626] text-[13px] font-bold">
                                مش مضبوطة
                              </span>
                            ) : null}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Explanation Reveal */}
                {state?.revealed && state.reveal?.explanation && (
                  <div className="p-4 rounded-xl bg-[#800020]/5 dark:bg-[#1E293B] border border-[#800020]/20 dark:border-[#FB7185]/20 space-y-2 mt-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#800020] dark:text-[#FB7185]">
                      <Lightbulb className="w-4 h-4" weight="fill" />
                      <span>الفكرة الأساسية: {state.reveal.explanation.concept}</span>
                    </div>
                    <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-content">
                      {state.reveal.explanation.correctReason}
                    </p>

                    {/* Per-option explanations */}
                    <div className="pt-2 border-t border-[#E2E8F0]/60 dark:border-[#334155]/60 space-y-1.5">
                      <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                        تفكيك الخيارات:
                      </span>
                      {question.options.map((opt) => {
                        const revealedOpt = state.reveal?.options?.find((o) => o.id === opt.id);
                        return (
                          <div
                            key={opt.id}
                            className="text-[12px] text-[#64748B] dark:text-[#94A3B8] flex items-start gap-2 font-content"
                          >
                            <span className="font-bold shrink-0">
                              • <BidiStatement as="span" text={opt.text} />:
                            </span>
                            <span>
                              {revealedOpt?.explanation ||
                                (revealedOpt?.isCorrect
                                  ? "الإجابة الصحيحة والدقيقة"
                                  : "غير دقيقة في سياق هذا السؤال")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-[#64748B] rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
          أسئلة الاختيار من متعدد قيد التجهيز...
        </div>
      )}
    </div>
  );
}
