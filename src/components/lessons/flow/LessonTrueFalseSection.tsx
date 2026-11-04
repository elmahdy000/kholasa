"use client";

import { useState } from "react";
import {
  Question as QuestionIcon,
  Check,
  X,
  CheckCircle,
  XCircle,
  Translate,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { QuestionExplanationBox } from "@/components/ui/QuestionExplanationBox";
import { QuestionImageAttachment } from "@/components/ui/QuestionImageAttachment";
import { TranslationToggle } from "@/components/ui/TranslationToggle";
import { Question, QuestionAnswerState } from "../types";

interface LessonTrueFalseSectionProps {
  questions: { question: Question }[];
  questionAnswers: Record<string, QuestionAnswerState>;
  onSelectOption: (questionId: string, optionId: string) => void;
}

export function LessonTrueFalseSection({
  questions,
  questionAnswers,
  onSelectOption,
}: LessonTrueFalseSectionProps) {
  const [translatedQuestions, setTranslatedQuestions] = useState<Record<string, boolean>>({});

  const toggleTranslation = (questionId: string) => {
    setTranslatedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <div id="section-true-false" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="p-6 rounded-2xl bg-[#0284C7]/10 border border-[#0284C7]/25 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shrink-0 shadow-sm">
            <QuestionIcon className="w-6 h-6" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7] bg-[#0284C7]/15 px-2 py-0.5 rounded-md">
                تحدي الفهم السريع
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                أسئلة صح وغلط
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              اختبر دقة تركيزك وتفريقك بين المفاهيم في ثوانٍ معدودة مع دعم الترجمة الفورية عند الحاجة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#0284C7]/20 text-[#0284C7] text-[13px] font-bold font-mono">
            {questions.length} سؤال صح وغلط
          </span>
        </div>
      </div>

      {/* True/False Questions List */}
      {questions.length > 0 ? (
        <div className="space-y-5">
          {questions.map(({ question }, qIndex) => {
            const state = questionAnswers[question.id];
            const isTranslated = Boolean(translatedQuestions[question.id]);
            const hasTranslation = Boolean(
              question.translation && question.translation.trim().length > 0
            );

            return (
              <div
                key={question.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
                  <span className="text-[13px] font-bold text-[#0284C7] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center font-mono font-bold text-[12px]">
                      {qIndex + 1}
                    </span>
                    <span>تحدي صح وغلط رقم {qIndex + 1}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {hasTranslation && (
                      <TranslationToggle
                        size="xs"
                        isTranslated={isTranslated}
                        onToggle={() => toggleTranslation(question.id)}
                      />
                    )}
                    <span className="px-3 py-1 rounded-lg text-[12px] font-bold bg-[#0284C7]/10 text-[#0284C7]">
                      تحدي سريع
                    </span>
                  </div>
                </div>

                <BidiStatement
                  as="h4"
                  text={question.statement}
                  className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed font-content"
                />

                {/* Collapsible Arabic Translation for Statement */}
                {isTranslated && question.translation && (
                  <div
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-right animate-in fade-in duration-200"
                    dir="rtl"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <Translate className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>الترجمة العربية للعبارة</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-content">
                      {question.translation}
                    </p>
                  </div>
                )}

                <QuestionImageAttachment imageUrl={question.imageUrl} />

                {/* 2 Big Tactile Buttons: صواب / خطأ */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {question.options.map((opt) => {
                    const isSelected = state?.selectedOptionId === opt.id;
                    const isRevealed = state?.revealed;
                    const isOptionCorrect = state?.reveal?.correctOptionId === opt.id;
                    const isTrueOption =
                      opt.text.includes("صواب") ||
                      opt.text.includes("صح") ||
                      opt.text.toLowerCase().includes("true");

                    let btnStyle =
                      "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]";

                    if (isRevealed) {
                      if (isOptionCorrect) {
                        btnStyle =
                          "bg-[#059669]/15 border-[#059669] text-[#059669] font-bold ring-2 ring-[#059669]/30";
                      } else if (isSelected && !isOptionCorrect) {
                        btnStyle =
                          "bg-[#DC2626]/15 border-[#DC2626] text-[#DC2626] font-bold ring-2 ring-[#DC2626]/30";
                      }
                    } else {
                      btnStyle += isTrueOption
                        ? " hover:border-[#059669] hover:text-[#059669]"
                        : " hover:border-[#DC2626] hover:text-[#DC2626]";
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isRevealed}
                        onClick={() => onSelectOption(question.id, opt.id)}
                        className={`h-14 rounded-2xl border text-[14px] sm:text-base font-bold flex items-center justify-center gap-2 transition-all ${btnStyle}`}
                      >
                        {isTrueOption ? (
                          <Check className="w-5 h-5 shrink-0" weight="bold" />
                        ) : (
                          <X className="w-5 h-5 shrink-0" weight="bold" />
                        )}
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Result & Explanation */}
                {state?.revealed && (
                  <QuestionExplanationBox
                    concept={state.reveal?.explanation?.concept}
                    correctReason={
                      state.reveal?.explanation?.correctReason ||
                      state.reveal?.options?.find((o) => o.isCorrect)?.explanation
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-[#64748B] rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
          أسئلة صح وغلط قيد التجهيز...
        </div>
      )}
    </div>
  );
}
