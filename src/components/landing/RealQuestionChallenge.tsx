"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Languages as Translate,
} from "lucide-react";
import { verifyLandingPreviewAnswer } from "@/app/actions/landing-preview";
import type {
  LandingAnswerCheckResult,
  LandingPreviewQuestionPublic,
} from "@/components/landing/types";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { QuestionExplanationBox } from "@/components/ui/QuestionExplanationBox";

interface RealQuestionChallengeProps {
  lessonId: string;
  lessonTitle: string;
  unitTitle?: string;
  question: LandingPreviewQuestionPublic | null;
  isLanguages?: boolean;
  totalQuestionsCount?: number;
  compact?: boolean;
  onEvaluated?: (
    result: LandingAnswerCheckResult,
    question: LandingPreviewQuestionPublic
  ) => void;
}

const LETTERS_AR = ["أ", "ب", "ج", "د", "هـ", "و"];
const LETTERS_EN = ["A", "B", "C", "D", "E", "F"];

export function RealQuestionChallenge({
  lessonId,
  lessonTitle,
  unitTitle,
  question,
  isLanguages = false,
  totalQuestionsCount,
  compact = false,
  onEvaluated,
}: RealQuestionChallengeProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<LandingAnswerCheckResult | null>(null);
  const [showArabicTranslation, setShowArabicTranslation] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!question) {
    return (
      <div className="p-6 rounded-xl bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-center space-y-2">
        <p className="text-sm font-bold text-[#12263F] dark:text-white">
          الأسئلة وتفسيراتها لهذا الدرس قيد الإعداد والمراجعة
        </p>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          يمكنك اختيار درس آخر من القائمة للاستمتاع بمعاينة الأسئلة المعتمدة والتفسيرات الكاملة.
        </p>
      </div>
    );
  }

  const handleSubmitAnswer = () => {
    if (!selectedId || isPending) return;
    startTransition(async () => {
      const res = await verifyLandingPreviewAnswer({
        lessonId,
        questionId: question.id,
        selectedOptionId: selectedId,
      });
      setResult(res);
      if (res.ok && onEvaluated) {
        onEvaluated(res, question);
      }
    });
  };

  const handleReset = () => {
    setSelectedId(null);
    setResult(null);
  };

  const dir = isLanguages ? "ltr" : "rtl";
  const textAlign = isLanguages ? "text-left" : "text-right";
  const letters = isLanguages ? LETTERS_EN : LETTERS_AR;

  return (
    <div dir={dir} className={`space-y-4 ${textAlign}`}>
      {/* Lesson Source Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E8E9ED] dark:border-[#334155]">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#800B34] dark:text-[#FB7185] min-w-0">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {unitTitle ? `${unitTitle} • ${lessonTitle}` : lessonTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isLanguages && question.translation && (
            <button
              type="button"
              onClick={() => setShowArabicTranslation((v) => !v)}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-bold border inline-flex items-center gap-1 transition-colors cursor-pointer ${
                showArabicTranslation
                  ? "bg-[#091B40] text-white border-[#091B40]"
                  : "bg-white dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] border-[#E8E9ED] dark:border-[#334155]"
              }`}
            >
              <Translate className="w-3.5 h-3.5" />
              <span>{showArabicTranslation ? "إخفاء الترجمة" : "ترجمة السؤال"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Statement */}
      <div className="space-y-2">
        <div
          className={`${
            compact ? "text-sm sm:text-[15px]" : "text-base sm:text-lg"
          } font-bold text-[#12263F] dark:text-white leading-relaxed`}
        >
          <BidiStatement text={question.statement} />
        </div>

        {isLanguages && showArabicTranslation && question.translation && (
          <div
            dir="rtl"
            className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#0F172A] border border-[#E8E9ED] dark:border-[#334155] text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] text-right leading-relaxed"
          >
            {question.translation}
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div
        className={`grid ${
          compact ? "grid-cols-1 gap-2" : "grid-cols-1 sm:grid-cols-2 gap-3"
        }`}
      >
        {question.options.map((opt, idx) => {
          const isPicked = selectedId === opt.id;
          const isSubmitted = Boolean(result?.ok);
          const isCorrectChoice = isSubmitted && result?.correctOptionId === opt.id;
          const isWrongPicked =
            isSubmitted && isPicked && result?.correctOptionId !== opt.id;

          let cardClass =
            "bg-[#F7F8FA] dark:bg-[#0F172A] border-[#E8E9ED] dark:border-[#334155] text-[#12263F] dark:text-white hover:border-[#800B34]/50";

          if (!isSubmitted && isPicked) {
            cardClass =
              "bg-[#800B34]/8 dark:bg-[#800B34]/20 border-[#800B34] text-[#091B40] dark:text-white ring-1 ring-[#800B34]";
          } else if (isSubmitted && isCorrectChoice) {
            cardClass =
              "bg-[#059669]/10 border-[#059669] text-[#059669] dark:text-[#34D399]";
          } else if (isSubmitted && isWrongPicked) {
            cardClass =
              "bg-[#DC2626]/10 border-[#DC2626] text-[#DC2626] dark:text-[#F87171]";
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isSubmitted || isPending}
              onClick={() => setSelectedId(opt.id)}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between gap-2.5 ${textAlign} ${
                isSubmitted ? "cursor-default" : "cursor-pointer"
              } ${cardClass}`}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <span
                  className={`w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 border ${
                    isPicked && !isSubmitted
                      ? "bg-[#800B34] text-white border-[#800B34]"
                      : isCorrectChoice
                      ? "bg-[#059669] text-white border-[#059669]"
                      : isWrongPicked
                      ? "bg-[#DC2626] text-white border-[#DC2626]"
                      : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                  }`}
                >
                  {letters[idx] || idx + 1}
                </span>
                <span className="leading-snug break-words min-w-0">
                  <BidiStatement text={opt.text} />
                </span>
              </div>

              {isCorrectChoice && (
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              )}
              {isWrongPicked && (
                <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Submit Action / Reset + Error */}
      {result && !result.ok && (
        <div
          dir="rtl"
          className="p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626] dark:text-[#F87171] text-right"
        >
          {result.error}
        </div>
      )}

      {!result?.ok ? (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            disabled={!selectedId || isPending}
            onClick={handleSubmitAnswer}
            className="min-h-[44px] px-5 py-2 rounded-lg bg-[#800B34] hover:bg-[#680829] disabled:opacity-50 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {isLanguages ? "Check Answer" : "تحقق من إجابتك"}
            </span>
          </button>

          {!compact && (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/lessons/${lessonId}`)}`}
              dir="rtl"
              className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#800B34] dark:hover:text-[#FB7185] inline-flex items-center gap-1 transition-colors"
            >
              <span>
                افتح الدرس الكامل
                {totalQuestionsCount ? ` (${totalQuestionsCount} سؤال)` : ""}
              </span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {/* Result Banner */}
          <div
            className={`p-3 rounded-lg border text-xs sm:text-sm font-bold flex items-center justify-between gap-2 ${
              result.isCorrect
                ? "bg-[#059669]/10 border-[#059669]/30 text-[#059669] dark:text-[#34D399]"
                : "bg-[#DC2626]/10 border-[#DC2626]/30 text-[#DC2626] dark:text-[#F87171]"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0" />
              )}
              <span>
                {result.isCorrect
                  ? isLanguages
                    ? "Correct answer!"
                    : "إجابة صحيحة!"
                  : isLanguages
                  ? "Incorrect — see the verified explanation below."
                  : "إجابة غير صحيحة — شوف التفسير المعتمد تحت:"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold inline-flex items-center gap-1 underline hover:opacity-80 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isLanguages ? "Retry" : "أعد المحاولة"}</span>
            </button>
          </div>

          {/* Verified Explanation Box reused directly from the platform */}
          {result.explanation?.correctReason && (
            <QuestionExplanationBox
              concept={result.explanation.concept}
              correctReason={result.explanation.correctReason}
              forceEnglish={isLanguages}
              className="!mt-0"
            />
          )}

          {/* Direct Source Lesson Link */}
          <div
            dir="rtl"
            className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs"
          >
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/lessons/${lessonId}`)}`}
              className="font-bold text-[#800B34] dark:text-[#FB7185] hover:underline inline-flex items-center gap-1.5"
            >
              <span>
                افتح الدرس الكامل وتدرب على باقي الأسئلة
                {totalQuestionsCount ? ` (${totalQuestionsCount})` : ""}
              </span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
