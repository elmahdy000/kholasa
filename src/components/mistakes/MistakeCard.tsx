"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkle,
  PencilLine,
  RotateCcw,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { QuestionExplanationBox } from "@/components/ui/QuestionExplanationBox";
import { QuestionImageAttachment } from "@/components/ui/QuestionImageAttachment";
import { FormattedAnswerView } from "@/components/ui/FormattedAnswerView";
import { TranslationToggle } from "@/components/ui/TranslationToggle";
import { normalizeRubricCriteria } from "@/lib/rubric";
import type { MistakeItem, ActiveAnswerState } from "./types";

interface MistakeCardProps {
  mistake: MistakeItem;
  answerState?: ActiveAnswerState;
  onRetakeAnswer: (questionId: string, optionId: string) => void;
  onResolveMistake?: (questionId: string) => Promise<void> | void;
  onReopenMistake?: (questionId: string) => Promise<void> | void;
}

const ARABIC_LETTERS = ["أ", "ب", "ج", "د", "هـ"];
const ENGLISH_LETTERS = ["A", "B", "C", "D", "E"];

export function MistakeCard({
  mistake,
  answerState,
  onRetakeAnswer,
  onResolveMistake,
  onReopenMistake,
}: MistakeCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showEssayModel, setShowEssayModel] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showModelTranslation, setShowModelTranslation] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const q = mistake.question;
  const isEssay = q.type === "ESSAY" || (!q.options || q.options.length === 0);
  const relatedLesson = q.lessons?.[0]?.lesson;
  const isChecked = Boolean(answerState?.result);

  const isEnglishStatement = !/[\u0600-\u06FF]/.test(q.statement || "");
  const isLanguagesTrack = q.subject?.schoolCategory === "LANGUAGES";
  const isEnglish =
    (isLanguagesTrack && isEnglishStatement) ||
    isEnglishStatement ||
    Boolean(q.options?.some((o) => !/[\u0600-\u06FF]/.test(o.text || "")));

  const normalizedCriteria = normalizeRubricCriteria(q.rubric?.criteria);
  const hasQuestionTranslation = Boolean(q.translation && q.translation.trim().length > 0);
  const hasModelTranslation = Boolean(
    q.rubric?.modelAnswerTranslation && q.rubric.modelAnswerTranslation.trim().length > 0
  );

  const handleResolve = async () => {
    if (!onResolveMistake || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await onResolveMistake(q.id);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReopen = async () => {
    if (!onReopenMistake || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await onReopenMistake(q.id);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const hasExplanationOrModel = Boolean(
    q.explanation?.concept || q.explanation?.correctReason || q.rubric?.modelAnswer
  );

  const distinctExplanationReason =
    q.explanation?.correctReason &&
    q.explanation.correctReason.trim() !== (q.rubric?.modelAnswer || "").trim()
      ? q.explanation.correctReason
      : null;

  return (
    <div
      className={`p-4 sm:p-6 rounded-xl border space-y-4 transition-colors ${
        mistake.isResolved
          ? "bg-[#059669]/5 dark:bg-[#0F172A] border-[#059669]/30 dark:border-[#34D399]/40"
          : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155] pb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#800B34]/10 dark:bg-[#1E293B] text-[#800B34] dark:text-[#FB7185] text-xs font-bold border border-[#800B34]/20 dark:border-[#FB7185]/40">
            <BidiStatement as="span" text={q.subject?.name || ""} />
          </span>
          {isEssay && (
            <span className="px-2.5 py-1 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] dark:text-purple-300 text-xs font-bold border border-[#7C3AED]/20 inline-flex items-center gap-1.5">
              <PencilLine className="w-3.5 h-3.5" />
              <span>{isEnglish ? "Essay Question" : "سؤال مقالي للمراجعة"}</span>
            </span>
          )}
          {!isEssay && mistake.wrongCount > 1 && (
            <span className="px-2.5 py-1 rounded-lg bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171] text-xs font-bold font-sans tabular-nums border border-[#DC2626]/20 dark:border-[#F87171]/40">
              {isEnglish
                ? `Wrong ${mistake.wrongCount} times`
                : `اتكرر الخطأ ${mistake.wrongCount} مرات`}
            </span>
          )}
          {mistake.isResolved && (
            <span className="px-3 py-1 rounded-lg bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] dark:text-[#34D399] text-xs font-bold inline-flex items-center gap-1 border border-[#059669]/20 dark:border-[#34D399]/40">
              <Check className="w-3.5 h-3.5" />
              <span>{isEnglish ? "Mastered" : "تم إتقانها"}</span>
            </span>
          )}
          {hasQuestionTranslation && (
            <TranslationToggle
              size="xs"
              isTranslated={showTranslation}
              onToggle={() => setShowTranslation((v) => !v)}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mistake.isResolved && onReopenMistake && (
            <button
              type="button"
              onClick={handleReopen}
              disabled={isUpdatingStatus}
              className="min-h-[38px] px-3 py-1 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34] text-xs font-bold text-[#536681] dark:text-[#94A3B8] hover:text-[#800B34] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إرجاع لقائمة المراجعة</span>
            </button>
          )}

          {relatedLesson && (
            <Link
              href={`/lessons/${relatedLesson.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#800B34] dark:text-[#FB7185] hover:underline shrink min-w-0 max-w-full sm:max-w-md"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="break-words">
                {isEnglish ? "Lesson: " : "الدرس: "}
                <BidiStatement as="span" text={relatedLesson.title} />
              </span>
              <ArrowLeft className="w-3 h-3 shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* Statement */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className={`space-y-2 ${isEnglish ? "text-left" : "text-right"}`}
      >
        <BidiStatement
          as="h3"
          text={q.statement}
          className={`text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed ${
            isEnglish ? "font-sans" : "font-content"
          }`}
        />

        {showTranslation && q.translation && (
          <div
            dir="rtl"
            className="p-3 rounded-lg bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-right text-xs sm:text-sm text-[#536681] dark:text-slate-200 leading-relaxed"
          >
            {q.translation}
          </div>
        )}
      </div>

      <QuestionImageAttachment imageUrl={q.imageUrl} />

      {/* 1. Objective Questions (MCQ / TRUE_FALSE): Inline Options to Retake */}
      {!isEssay && q.options && q.options.length > 0 && (
        <div className="space-y-2.5 sm:space-y-3">
          <span className="text-xs sm:text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block mb-1">
            {isEnglish
              ? "Try answering again now and verify the explanation:"
              : "جرب تحل السؤال تاني دلوقتي وتأكد من فهم السبب:"}
          </span>
          {q.options.map((opt, optIdx) => {
            const isSelected = answerState?.selectedOptionId === opt.id;

            let rowStyle =
              "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#800B34]/40";

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
                className={`w-full min-h-[48px] p-3.5 sm:p-4 rounded-xl border ${
                  isEnglishOpt ? "text-left font-sans" : "text-right font-content"
                } text-xs sm:text-sm font-medium flex items-center justify-between gap-3 transition-colors overflow-hidden ${rowStyle} ${
                  isChecked || answerState?.isChecking ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-md bg-[#F7F9FC] dark:bg-[#0F172A] text-[#536681] dark:text-[#F8FAFC] flex items-center justify-center text-xs font-sans tabular-nums font-bold shrink-0 border border-[#E2E8F0] dark:border-[#334155]">
                    {letter}
                  </span>
                  <div
                    className={`min-w-0 flex-1 leading-relaxed break-words ${
                      isEnglishOpt ? "text-left" : "text-right"
                    }`}
                  >
                    <BidiStatement as="span" text={opt.text} />
                  </div>
                </div>

                {isChecked && (
                  <div className="shrink-0 flex items-center">
                    {opt.isCorrect ? (
                      <span className="text-[#059669] dark:text-[#34D399] text-xs sm:text-[13px] font-bold inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>{isEnglishOpt ? "Correct" : "إجابة صحيحة"}</span>
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

      {/* 2. Essay Questions: Model Answer, Rubric Criteria & Mastery Confirmation */}
      {isEssay && (
        <div className="space-y-4 pt-1">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowEssayModel((prev) => !prev)}
              className={`min-h-[44px] px-4 py-2 rounded-lg text-xs sm:text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                showEssayModel
                  ? "bg-[#7C3AED]/15 text-[#7C3AED] dark:text-purple-300 border border-[#7C3AED]/30"
                  : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
              }`}
            >
              <Sparkle className="w-4 h-4" />
              <span>
                {showEssayModel
                  ? isEnglish
                    ? "Hide Model Answer"
                    : "إخفاء نموذج الإجابة"
                  : isEnglish
                  ? "View Model Answer"
                  : "عرض نموذج الإجابة للمقارنة"}
              </span>
            </button>

            {!mistake.isResolved && onResolveMistake && (
              <button
                type="button"
                onClick={handleResolve}
                disabled={isUpdatingStatus}
                className="min-h-[44px] px-4 py-2 rounded-lg text-xs sm:text-[13px] font-bold bg-[#059669] hover:bg-[#047857] text-white inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isUpdatingStatus
                    ? isEnglish
                      ? "Saving..."
                      : "جاري الحفظ..."
                    : isEnglish
                    ? "Mark as Mastered"
                    : "فهمتها وتمت المراجعة ✓"}
                </span>
              </button>
            )}
          </div>

          {showEssayModel && (
            <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
              <div
                dir={isEnglish ? "ltr" : "rtl"}
                className={`p-4 sm:p-5 rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/20 space-y-3 ${
                  isEnglish ? "text-left font-sans" : "text-right font-content"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#7C3AED] dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>
                      {isEnglish ? "Approved Model Answer:" : "النموذج المعتمد للإجابة:"}
                    </span>
                  </span>

                  {hasModelTranslation && (
                    <TranslationToggle
                      size="xs"
                      isTranslated={showModelTranslation}
                      onToggle={() => setShowModelTranslation((v) => !v)}
                    />
                  )}
                </div>

                <FormattedAnswerView
                  text={
                    q.rubric?.modelAnswer ||
                    q.explanation?.correctReason ||
                    (isEnglish
                      ? "Review the core lesson concepts and structured explanation."
                      : "راجع عناصر ومفاهيم الدرس الأساسية لتأكيد الحل.")
                  }
                  colorScheme="purple"
                />

                {showModelTranslation && q.rubric?.modelAnswerTranslation && (
                  <div
                    dir="rtl"
                    className="p-3 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-right text-xs sm:text-sm text-[#536681] dark:text-slate-200 leading-relaxed"
                  >
                    {q.rubric.modelAnswerTranslation}
                  </div>
                )}
              </div>

              {normalizedCriteria.length > 0 && (
                <div
                  dir={isEnglish ? "ltr" : "rtl"}
                  className="p-4 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2"
                >
                  <span className="text-xs font-bold text-[#536681] dark:text-[#94A3B8] block">
                    {isEnglish ? "Grading Criteria:" : "معايير توزيع الدرجات:"}
                  </span>
                  <div className="space-y-1.5">
                    {normalizedCriteria.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center justify-between gap-2 text-xs sm:text-[13px] py-1 border-b border-[#E2E8F0]/50 dark:border-[#334155]/50 last:border-0"
                      >
                        <span className="text-[#0F172A] dark:text-white font-medium">
                          • {c.text}
                        </span>
                        {c.marks !== undefined && (
                          <span className="font-sans tabular-nums text-[#7C3AED] dark:text-purple-300 font-bold shrink-0">
                            {isEnglish ? `${c.marks} pts` : `${c.marks} درجات`}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {distinctExplanationReason && (
                <QuestionExplanationBox
                  concept={q.explanation?.concept}
                  correctReason={distinctExplanationReason}
                  forceEnglish={isEnglish}
                />
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
            className="min-h-[40px] inline-flex items-center gap-2 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#800B34] dark:hover:text-[#FB7185] transition-colors py-1 cursor-pointer"
          >
            {showExplanation ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>{isEnglish ? "Hide explanation" : "إخفاء التفسير والحل"}</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {isEnglish
                    ? "View verified explanation directly"
                    : "عرض التفسير والحل المعتمد مباشرة"}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Explanation for objective questions */}
      {!isEssay && (mistake.isResolved || isChecked || showExplanation) && q.explanation && (
        <QuestionExplanationBox
          concept={q.explanation.concept}
          correctReason={q.explanation.correctReason}
          forceEnglish={isEnglish}
        />
      )}
    </div>
  );
}
