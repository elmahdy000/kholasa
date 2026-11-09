"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Check, ArrowLeft, Eye, EyeOff, Sparkle, PencilLine } from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { QuestionExplanationBox } from "@/components/ui/QuestionExplanationBox";
import { QuestionImageAttachment } from "@/components/ui/QuestionImageAttachment";
import { FormattedAnswerView } from "@/components/ui/FormattedAnswerView";
import type { MistakeItem, ActiveAnswerState, RubricCriterion } from "./types";

interface MistakeCardProps {
  mistake: MistakeItem;
  answerState?: ActiveAnswerState;
  onRetakeAnswer: (questionId: string, optionId: string) => void;
  onResolveMistake?: (questionId: string) => Promise<void> | void;
}

const ARABIC_LETTERS = ["أ", "ب", "ج", "د", "هـ"];
const ENGLISH_LETTERS = ["A", "B", "C", "D", "E"];

export function MistakeCard({
  mistake,
  answerState,
  onRetakeAnswer,
  onResolveMistake,
}: MistakeCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showEssayModel, setShowEssayModel] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const q = mistake.question;
  const isEssay = q.type === "ESSAY" || (!q.options || q.options.length === 0);
  const relatedLesson = q.lessons?.[0]?.lesson;
  const isChecked = Boolean(answerState?.result);

  const isEnglishStatement = !/[\u0600-\u06FF]/.test(q.statement || "");
  const isEnglish =
    isEnglishStatement ||
    Boolean(q.options?.some((o) => !/[\u0600-\u06FF]/.test(o.text || "")));

  const handleResolve = async () => {
    if (!onResolveMistake || isResolving) return;
    setIsResolving(true);
    try {
      await onResolveMistake(q.id);
    } finally {
      setIsResolving(false);
    }
  };

  const hasExplanationOrModel =
    Boolean(q.explanation?.concept || q.explanation?.correctReason || q.rubric?.modelAnswer);

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl border space-y-4 transition-all shadow-xs ${
        mistake.isResolved
          ? "bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399]/40"
          : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155] pb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#800B34]/10 dark:bg-[#1E293B] text-[#800B34] dark:text-[#FB7185] text-xs sm:text-[13px] font-bold border border-[#800B34]/20 dark:border-[#E11D48]/50">
            <BidiStatement as="span" text={q.subject?.name || ""} />
          </span>
          {isEssay && (
            <span className="px-2.5 py-1 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] text-xs sm:text-[13px] font-bold border border-[#7C3AED]/20 flex items-center gap-1.5">
              <PencilLine className="w-3.5 h-3.5" />
              <span>{isEnglish ? "Essay Question" : "سؤال مقالي"}</span>
            </span>
          )}
          {mistake.wrongCount > 1 && (
            <span className="px-2.5 py-1 rounded-lg bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] text-xs sm:text-[13px] font-bold border border-[#DC2626]/20 dark:border-[#F87171]/50">
              {isEnglish ? `Repeated mistake ${mistake.wrongCount} times` : `اتكرر الغلط ${mistake.wrongCount} مرات`}
            </span>
          )}
          {mistake.isResolved && (
            <span className="px-3 py-1 rounded-lg bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] text-xs sm:text-[13px] font-bold flex items-center gap-1 border border-[#059669]/20 dark:border-[#34D399]/40">
              <Check className="w-3.5 h-3.5" />
              <span>{isEnglish ? "Understood & Mastered" : "فهمتها خلاص"}</span>
            </span>
          )}
        </div>

        {relatedLesson && (
          <Link
            href={`/lessons/${relatedLesson.id}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#800B34] dark:text-[#FB7185] hover:text-[#680829] dark:hover:text-[#FB7185] transition-colors shrink min-w-0 max-w-full sm:max-w-md group"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#800B34]" />
            <span className="break-words">
              {isEnglish ? "Lesson: " : "شرح الدرس: "}<BidiStatement as="span" text={relatedLesson.title} />
            </span>
            <ArrowLeft className="w-3 h-3 shrink-0" />
          </Link>
        )}
      </div>

      {/* Statement */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className={isEnglish ? "text-left" : "text-right"}
      >
        <BidiStatement
          as="h3"
          text={q.statement}
          className={`text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed ${isEnglish ? "font-sans" : "font-content"}`}
        />
      </div>

      <QuestionImageAttachment imageUrl={q.imageUrl} />

      {/* 1. Objective Questions (MCQ / TRUE_FALSE): Inline Options to Retake */}
      {!isEssay && q.options && q.options.length > 0 && (
        <div className="space-y-2.5 sm:space-y-3">
          <span className="text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">
            {isEnglish ? "Try answering again now and understand the correct reasoning:" : "جرب تحلها تاني دلوقتي وافهم الصح عشان متغلطش فيها:"}
          </span>
          {q.options.map((opt, optIdx) => {
            const isSelected = answerState?.selectedOptionId === opt.id;

            let rowStyle =
              "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#800B34]/30";

            if (isChecked) {
              if (opt.isCorrect) {
                rowStyle =
                  "bg-[#059669]/10 dark:bg-[#1E293B] border-2 border-[#059669] text-[#059669] dark:text-[#34D399] font-bold";
              } else if (isSelected && !opt.isCorrect) {
                rowStyle =
                  "bg-[#DC2626]/10 dark:bg-[#1E293B] border-2 border-[#DC2626] text-[#DC2626] dark:text-[#F87171] font-bold";
              }
            }

            const isEnglishOpt = isEnglish || !/[\u0600-\u06FF]/.test(opt.text || "");
            const letter = isEnglishOpt
              ? ENGLISH_LETTERS[optIdx] || opt.order
              : ARABIC_LETTERS[optIdx] || opt.order;

            return (
              <button
                key={opt.id}
                type="button"
                dir={isEnglishOpt ? "ltr" : "rtl"}
                disabled={isChecked || answerState?.isChecking}
                onClick={() => onRetakeAnswer(q.id, opt.id)}
                className={`w-full min-h-[48px] p-3.5 sm:p-4 rounded-xl border ${isEnglishOpt ? "text-left font-sans" : "text-right font-content"} text-xs sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 transition-colors overflow-hidden active:scale-[0.99] cursor-pointer ${rowStyle} ${
                  isChecked || answerState?.isChecking ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] flex items-center justify-center text-xs sm:text-[13px] font-mono font-bold shrink-0 mt-0.5 sm:mt-0 border border-[#E2E8F0]/60 dark:border-[#334155]/60">
                    {letter}
                  </span>
                  <div className={`min-w-0 flex-1 leading-relaxed break-words ${isEnglishOpt ? "text-left" : "text-right"}`}>
                    <BidiStatement as="span" text={opt.text} />
                  </div>
                </div>

                {isChecked && (
                  <div className="shrink-0">
                    {opt.isCorrect ? (
                      <span className="text-[#059669] dark:text-[#34D399] text-xs sm:text-[13px] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>{isEnglishOpt ? "Correct" : "إجابة صحيحة ✓"}</span>
                      </span>
                    ) : isSelected ? (
                      <span className="text-[#DC2626] dark:text-[#F87171] text-xs sm:text-[13px] font-bold">
                        {isEnglishOpt ? "Incorrect" : "إجابة غير صحيحة"}
                      </span>
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Essay Questions: Model Answer & Mastery Confirmation */}
      {isEssay && (
        <div className="space-y-4 pt-1">
          {/* Action Row for Essay Questions */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowEssayModel((prev) => !prev)}
              className={`min-h-[44px] h-11 px-4 rounded-xl text-xs sm:text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${
                showEssayModel || mistake.isResolved
                  ? "bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30"
                  : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xs"
              }`}
            >
              <Sparkle className="w-4 h-4" />
              <span>
                {showEssayModel || mistake.isResolved
                  ? isEnglish ? "Hide Model Answer" : "إخفاء نموذج الإجابة"
                  : isEnglish ? "View Model Answer" : "عرض نموذج الإجابة المعتمد"}
              </span>
            </button>

            {!mistake.isResolved && onResolveMistake && (
              <button
                type="button"
                onClick={handleResolve}
                disabled={isResolving}
                className="min-h-[44px] h-11 px-4 rounded-xl text-xs sm:text-[13px] font-bold bg-[#059669] hover:bg-[#047857] text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>{isResolving ? (isEnglish ? "Saving..." : "جاري الحفظ...") : (isEnglish ? "Understood & Mastered" : "فهمتها خلاص")}</span>
              </button>
            )}
          </div>

          {/* Essay Model Answer & Rubric Criteria Display */}
          {(showEssayModel || mistake.isResolved) && (
            <div className="space-y-4 pt-3 border-t border-[#E2E8F0] dark:border-[#334155] animate-in fade-in duration-200">
              <div
                dir={isEnglish ? "ltr" : "rtl"}
                className={`p-4 sm:p-5 rounded-2xl bg-[#7C3AED]/5 border border-[#7C3AED]/20 space-y-3 ${isEnglish ? "text-left font-sans" : "text-right font-content"}`}
              >
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5" />
                  <span>{isEnglish ? "Approved Model Answer:" : "النموذج المعتمد للإجابة:"}</span>
                </span>
                <FormattedAnswerView
                  text={
                    q.rubric?.modelAnswer ||
                    q.explanation?.correctReason ||
                    (isEnglish
                      ? "The approved model answer focuses on step-by-step methodology and curriculum concepts."
                      : "الإجابة المعتمدة تركز على الخطوات والشرح المنهجي لمفاهيم السؤال.")
                  }
                  colorScheme="purple"
                />
              </div>

              {Array.isArray(q.rubric?.criteria) && q.rubric.criteria.length > 0 && (
                <div
                  dir={isEnglish ? "ltr" : "rtl"}
                  className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2"
                >
                  <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                    {isEnglish ? "Grading Criteria:" : "معايير توزيع الدرجات:"}
                  </span>
                  <div className="space-y-1.5">
                    {(q.rubric.criteria as RubricCriterion[]).map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center justify-between text-xs sm:text-[13px] py-1 border-b border-[#E2E8F0]/40 dark:border-[#334155]/40 last:border-0"
                      >
                        <span className="text-[#0F172A] dark:text-white font-medium">
                          {c.criterion}
                        </span>
                        <span className="font-mono text-[#7C3AED] font-bold shrink-0">
                          {isEnglish ? `${c.points} Marks` : `${c.points} درجات`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual toggle to view explanation for objective questions if not yet answered/resolved */}
      {!isEssay && !mistake.isResolved && !isChecked && hasExplanationOrModel && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowExplanation((prev) => !prev)}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#800B34] dark:hover:text-[#FB7185] transition-colors py-1 cursor-pointer"
          >
            {showExplanation ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>{isEnglish ? "Hide explanation & solution" : "إخفاء التفسير والحل"}</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>{isEnglish ? "View explanation & solution directly" : "عرض التفسير والحل المعتمد مباشرة"}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Explanation for objective questions - shown once resolved, or student answered, or manually revealed */}
      {!isEssay && (mistake.isResolved || isChecked || showExplanation) && q.explanation && (
        <div className="animate-in fade-in duration-200">
          <QuestionExplanationBox
            concept={q.explanation.concept}
            correctReason={q.explanation.correctReason}
            forceEnglish={isEnglish}
          />
        </div>
      )}
    </div>
  );
}
