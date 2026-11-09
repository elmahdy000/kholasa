"use client";

import { useState } from "react";
import {
  CheckCircle,
  Check,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { QuestionExplanationBox } from "@/components/ui/QuestionExplanationBox";
import { QuestionImageAttachment } from "@/components/ui/QuestionImageAttachment";
import { TranslationToggle } from "@/components/ui/TranslationToggle";
import { Question, QuestionAnswerState } from "../types";

interface LessonMcqSectionProps {
  questions: { question: Question }[];
  questionAnswers: Record<string, QuestionAnswerState>;
  onSelectOption: (questionId: string, optionId: string) => void;
  isLanguages?: boolean;
}

export function LessonMcqSection({
  questions,
  questionAnswers,
  onSelectOption,
  isLanguages = false,
}: LessonMcqSectionProps) {
  const [translatedQuestions, setTranslatedQuestions] = useState<Record<string, boolean>>({});

  const toggleTranslation = (questionId: string) => {
    setTranslatedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <div id="section-mcq" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="p-6 rounded-2xl bg-[#800B34]/10 border border-[#800B34]/25 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#800B34] text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle className="w-6 h-6" weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#800B34] dark:text-[#FB7185] bg-[#800B34]/15 px-2 py-0.5 rounded-md">
                تدريب تفاعلي
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                أسئلة اختيار من متعدد
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              {isLanguages
                ? "اختر الإجابة وشوف النتيجة لحظياً مع شرح تفصيلي وتوضيح وترجمة فورية عند الحاجة"
                : "اختر الإجابة وشوف النتيجة لحظياً مع شرح تفصيلي وتوضيح فوري للإجابة الصحيحة"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#800B34]/20 text-[#800B34] dark:text-[#FB7185] text-[13px] font-bold font-mono">
            {questions.length} سؤال اختيار
          </span>
        </div>
      </div>

      {/* Questions List */}
      {questions.length > 0 ? (
        <div className="space-y-5">
          {questions.map(({ question }, qIndex) => {
            const state = questionAnswers[question.id];
            const isTranslated = Boolean(translatedQuestions[question.id]);
            const rawExplanationReason =
              question.explanation?.correctReason ||
              question.options?.find((o) => o.isCorrect)?.explanation ||
              "";
            const hasExplanationTranslation =
              /\n+\s*(?:الترجمة العربية للتفسير|الترجمة العربية|ترجمة التفسير|<!--\s*translation\s*-->|\[TRANSLATION\])/i.test(
                rawExplanationReason
              );
            const isEnglishStatement = !/[\u0600-\u06FF]/.test(question.statement || "");
            const isEnglish = isLanguages && isEnglishStatement;
            const hasTranslation = isLanguages && Boolean(
              (question.translation && question.translation.trim().length > 0) ||
              question.options?.some((o) => o.translation && o.translation.trim().length > 0) ||
              hasExplanationTranslation
            );

            return (
              <div
                key={question.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4 shadow-sm"
              >
                {/* Question Header & Controls */}
                <div
                  dir={isEnglish ? "ltr" : "rtl"}
                  className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3"
                >
                  <span className="text-[13px] font-bold text-[#800B34] dark:text-[#FB7185] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#800B34]/10 dark:bg-[#800B34]/30 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center font-mono font-bold text-[12px]">
                      {qIndex + 1}
                    </span>
                    <span>{isEnglish ? `Question ${qIndex + 1}` : `السؤال رقم ${qIndex + 1}`}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {hasTranslation && (
                      <TranslationToggle
                        size="xs"
                        isTranslated={isTranslated}
                        onToggle={() => toggleTranslation(question.id)}
                      />
                    )}
                    <span className="px-3 py-1 rounded-lg text-[12px] font-bold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] border border-[#E2E8F0]/60 dark:border-[#334155]/60">
                      {question.difficulty === "EASY"
                        ? isEnglish ? "Easy" : "مباشر"
                        : question.difficulty === "MEDIUM"
                        ? isEnglish ? "Medium" : "متوسط"
                        : isEnglish ? "Advanced" : "متقدم"}
                    </span>
                  </div>
                </div>

                {/* Question Statement */}
                <div
                  dir={isEnglish ? "ltr" : "rtl"}
                  className={isEnglish ? "text-left" : "text-right"}
                >
                  <BidiStatement
                    as="h4"
                    text={question.statement}
                    className={`text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed ${isEnglish ? "font-sans" : "font-content"}`}
                  />
                </div>

                {/* Collapsible Arabic Translation for Statement */}
                {isTranslated && question.translation && (
                  <div
                    dir="rtl"
                    className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] text-right animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] mb-1.5 inline-block">
                      الترجمة العربية للسؤال
                    </span>
                    <p className="text-[13px] sm:text-[14px] text-[#1E293B] dark:text-slate-200 leading-relaxed font-content">
                      {question.translation}
                    </p>
                  </div>
                )}

                <QuestionImageAttachment imageUrl={question.imageUrl} />

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((opt, optIdx) => {
                    const isSelected = state?.selectedOptionId === opt.id;
                    const isRevealed = state?.revealed;
                    const isOptionCorrect =
                      state?.reveal?.correctOptionId === opt.id ||
                      (state?.isCorrect && isSelected) ||
                      Boolean(opt.isCorrect);

                    let btnStyle =
                      "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#800B34]/50";

                    if (isRevealed) {
                      if (isOptionCorrect) {
                        btnStyle =
                          "bg-[#059669]/10 border-[#059669]/40 text-[#059669] font-bold";
                      } else if (isSelected && !isOptionCorrect) {
                        btnStyle =
                          "bg-[#DC2626]/10 border-[#DC2626]/40 text-[#DC2626] font-bold";
                      }
                    }

                    const isEnglishOpt = isEnglish || !/[\u0600-\u06FF]/.test(opt.text || "");
                    const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];
                    const englishLetters = ["A", "B", "C", "D", "E"];
                    const letter = isEnglish ? englishLetters[optIdx] || opt.order : arabicLetters[optIdx] || opt.order;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        dir={isEnglishOpt ? "ltr" : "rtl"}
                        disabled={isSelected}
                        onClick={() => onSelectOption(question.id, opt.id)}
                        className={`w-full p-4 rounded-xl border ${isEnglishOpt ? "text-left font-sans" : "text-right font-content"} text-[13px] sm:text-sm font-medium flex items-start justify-between gap-3 transition-all cursor-pointer overflow-hidden ${btnStyle}`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="w-7 h-7 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] flex items-center justify-center text-[13px] font-mono font-bold shrink-0 mt-0.5 border border-[#E2E8F0]/80 dark:border-[#334155]/80">
                            {letter}
                          </span>
                          <div className={`min-w-0 flex-1 leading-relaxed break-words ${isEnglishOpt ? "text-left" : "text-right"}`}>
                            <BidiStatement as="span" text={opt.text} />

                            {/* Collapsible Arabic Translation for Option */}
                            {isTranslated && opt.translation && (
                              <div
                                dir="rtl"
                                className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-black/4 dark:bg-white/5 border border-dashed border-[#E2E8F0] dark:border-[#334155] text-right animate-in fade-in duration-150"
                              >
                                <span className="text-[12px] font-medium text-[#475569] dark:text-slate-300">
                                  {opt.translation}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isRevealed && (
                          <div className="shrink-0">
                            {isOptionCorrect ? (
                              <span className="text-[#059669] text-[13px] font-bold flex items-center gap-1">
                                <Check className="w-4 h-4" weight="bold" />
                                <span>{isEnglish ? "Correct!" : "صح! ممتاز"}</span>
                              </span>
                            ) : isSelected ? (
                              <span className="text-[#DC2626] text-[13px] font-bold">
                                {isEnglish ? "Incorrect" : "مش مضبوطة"}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Immediate Celebratory Feedback ("برافو كمل!") */}
                {state?.revealed && (
                  <div
                    className={`p-3.5 rounded-xl text-xs sm:text-[13px] font-bold flex items-center gap-2 animate-in zoom-in-95 duration-200 border shadow-2xs ${
                      state.isCorrect
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200"
                        : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700/60 text-red-900 dark:text-red-200"
                    }`}
                  >
                    <span className="text-lg">{state.isCorrect ? "🎉" : "💡"}</span>
                    <span className="leading-relaxed">
                      {state.isCorrect
                        ? isEnglish ? "Bravo champion! Correct answer.. keep going!" : "برافو عليك يا بطل! إجابة صحيحة وممتازة.. كمل يا وحش!"
                        : isEnglish ? "Not quite right.. review the explanation below to master the concept." : "إجابة غير دقيقة.. راجع التفسير التعليمي المعتمد بالأسفل عشان تفهم الفكرة كويس."}
                    </span>
                  </div>
                )}

                {/* Explanation Box when revealed */}
                {state?.revealed && (
                  <QuestionExplanationBox
                    concept={state.reveal?.explanation?.concept}
                    correctReason={
                      state.reveal?.explanation?.correctReason ||
                      state.reveal?.options?.find((o) => o.isCorrect)?.explanation
                    }
                    isTranslated={isTranslated}
                    onToggleTranslation={() => toggleTranslation(question.id)}
                    forceEnglish={isEnglish}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
            لا توجد أسئلة اختيار من متعدد مضافة لهذا الدرس بعد
          </p>
        </div>
      )}
    </div>
  );
}
