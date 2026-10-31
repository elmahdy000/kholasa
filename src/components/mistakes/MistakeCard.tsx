"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Check, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { QuestionExplanationBox } from "@/components/ui/QuestionExplanationBox";
import { QuestionImageAttachment } from "@/components/ui/QuestionImageAttachment";
import type { MistakeItem, ActiveAnswerState } from "./types";

interface MistakeCardProps {
  mistake: MistakeItem;
  answerState?: ActiveAnswerState;
  onRetakeAnswer: (questionId: string, optionId: string) => void;
}

const ARABIC_LETTERS = ["أ", "ب", "ج", "د", "هـ"];

export function MistakeCard({
  mistake,
  answerState,
  onRetakeAnswer,
}: MistakeCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const q = mistake.question;
  const relatedLesson = q.lessons?.[0]?.lesson;
  const isChecked = !!answerState?.result;

  return (
    <div
      className={`p-6 sm:p-7 rounded-xl border space-y-4 transition-all ${
        mistake.isResolved
          ? "bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399]/40"
          : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#E11D48]/50">
            <BidiStatement as="span" text={q.subject?.name || ""} />
          </span>
          {mistake.wrongCount > 1 && (
            <span className="px-2 py-1 rounded-lg bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#F87171]/50">
              اتكرر الغلط {mistake.wrongCount} مرات
            </span>
          )}
          {mistake.isResolved && (
            <span className="px-3 py-1 rounded-lg bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] text-[13px] font-bold flex items-center gap-1 border border-[#E2E8F0]/50 dark:border-[#34D399]/50">
              <Check className="w-3 h-3" />
              <span>اتقنتها خلاص</span>
            </span>
          )}
        </div>

        {relatedLesson && (
          <Link
            href={`/lessons/${relatedLesson.id}`}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#800020] dark:text-[#FB7185] hover:text-[#800020] dark:hover:text-[#FB7185] transition-colors shrink min-w-0 max-w-full sm:max-w-md group"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#800020]" />
            <span className="break-words">
              شرح الدرس: <BidiStatement as="span" text={relatedLesson.title} />
            </span>
            <ArrowLeft className="w-3 h-3 shrink-0" />
          </Link>
        )}
      </div>

      {/* Statement */}
      <BidiStatement
        as="h3"
        text={q.statement}
        className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed font-content"
      />

      <QuestionImageAttachment imageUrl={q.imageUrl} />

      {/* Inline Options to Retake */}
      {q.options && q.options.length > 0 && (
        <div className="space-y-3">
          <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">
            جرب تحلها تاني دلوقتي وافهم الصح عشان متغلطش فيها:
          </span>
          {q.options.map((opt, optIdx) => {
            const isSelected = answerState?.selectedOptionId === opt.id;

            let rowStyle =
              "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0]";

            if (isChecked) {
              if (opt.isCorrect) {
                rowStyle =
                  "bg-[#059669]/10 dark:bg-[#1E293B] border-2 border-[#059669] text-[#059669] dark:text-[#34D399] font-bold";
              } else if (isSelected && !opt.isCorrect) {
                rowStyle =
                  "bg-[#DC2626]/10 dark:bg-[#1E293B] border-2 border-[#DC2626] text-[#DC2626] dark:text-[#F87171] font-bold";
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isChecked || answerState?.isChecking}
                onClick={() => onRetakeAnswer(q.id, opt.id)}
                className={`w-full p-4 rounded-xl border text-right text-[13px] sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 transition-colors ${rowStyle} ${
                  isChecked || answerState?.isChecking ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] flex items-center justify-center text-[13px] font-mono font-bold shrink-0 mt-1 sm:mt-0 border border-[#E2E8F0]/60 dark:border-[#334155]/60">
                    {ARABIC_LETTERS[optIdx] || opt.order}
                  </span>
                  <div className="min-w-0 flex-1 leading-relaxed">
                    <BidiStatement as="span" text={opt.text} />
                  </div>
                </div>

                {isChecked && (
                  <div className="shrink-0">
                    {opt.isCorrect ? (
                      <span className="text-[#059669] dark:text-[#34D399] text-[13px] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>صح! برافو عليك</span>
                      </span>
                    ) : isSelected ? (
                      <span className="text-[#DC2626] dark:text-[#F87171] text-[13px] font-bold">
                        مش صحيحة
                      </span>
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Manual toggle to view explanation if not yet answered/resolved */}
      {!mistake.isResolved && !isChecked && q.explanation && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowExplanation((prev) => !prev)}
            className="inline-flex items-center gap-2 text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#800020] dark:hover:text-[#FB7185] transition-colors"
          >
            {showExplanation ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>إخفاء التفسير والحل</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>عرض التفسير والحل المعتمد مباشرة</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Explanation - shown once resolved, or student answered, or manually revealed */}
      {(mistake.isResolved || isChecked || showExplanation) && q.explanation && (
        <div className="animate-in fade-in duration-200">
          <QuestionExplanationBox
            concept={q.explanation.concept}
            correctReason={q.explanation.correctReason}
          />
        </div>
      )}
    </div>
  );
}
