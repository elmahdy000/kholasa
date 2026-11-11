"use client";

import { useState } from "react";
import {
  AlertCircle,
  Bookmark,
  CheckCircle2,
  Compass,
  Eye,
  Lightbulb,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import type {
  Question,
  QuestionAnswerState,
  RevealedOption,
} from "../types";
import type { ArabicSourceReference } from "./types";
import {
  ARABIC_ORIGIN_LABELS,
  ARABIC_SKILL_LABELS,
  type ArabicQuestionMeta,
  type ArabicQuestionOriginEnum,
} from "@/lib/arabic-curriculum";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface ArabicQuestionCardProps {
  index: number;
  question: Question;
  answerState?: QuestionAnswerState;
  essayDraft: string;
  isEssayRevealed: boolean;
  isMarkedForReview: boolean;
  meta?: Partial<ArabicQuestionMeta>;
  sectionSolvingTip?: string;
  onSelectOption: (questionId: string, optionId: string) => void;
  onChangeEssayDraft: (questionId: string, value: string) => void;
  onRevealEssay: (questionId: string, draftText?: string) => Promise<void> | void;
  onToggleEssayReview: (
    questionId: string,
    mark: boolean,
    essayText?: string
  ) => Promise<void> | void;
}

const ARABIC_CHOICE_LABELS = ["أ", "ب", "ج", "د", "هـ", "و"];

const RAW_ORIGIN_LABELS: Record<string, string> = {
  official_textbook: "كتاب الوزارة",
  official_textbook_transcribed: "كتاب الوزارة",
  official_textbook_adapted: "مقتبس من كتاب الوزارة",
  official_assessments_adapted: "التقييمات والأداءات الرسمية",
  official_assessments_transcribed: "التقييمات والأداءات الرسمية",
  official_classroom_assessment: "تقييم صفي رسمي",
  official_home_assessment: "أداء منزلي رسمي",
  official_weekly_assessment: "تقييم أسبوعي رسمي",
  kholasa_practice: "تدريبات الخلاصة",
};

const DIFFICULTY_LABELS: Record<string, { label: string; cls: string }> = {
  EASY: {
    label: "سهل",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  },
  MEDIUM: {
    label: "متوسط",
    cls: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  },
  HARD: {
    label: "متقدم",
    cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  },
};

function formatSourceRefs(refs?: ArabicSourceReference[]): string | null {
  if (!refs || refs.length === 0) return null;
  return refs
    .map((r) => {
      const label = r.sourceId === "assessments" ? "التقييمات الرسمية" : "كتاب الوزارة";
      return `${label} ص ${r.pages.join("، ")}`;
    })
    .join(" • ");
}

export function ArabicQuestionCard({
  index,
  question,
  answerState,
  essayDraft,
  isEssayRevealed,
  isMarkedForReview,
  meta,
  sectionSolvingTip,
  onSelectOption,
  onChangeEssayDraft,
  onRevealEssay,
  onToggleEssayReview,
}: ArabicQuestionCardProps) {
  const [isTogglingReview, setIsTogglingReview] = useState(false);
  const [isRevealingEssay, setIsRevealingEssay] = useState(false);

  const isEssay = question.type === "ESSAY";
  const isRevealed = Boolean(answerState?.revealed);
  const revealedOptions: RevealedOption[] = answerState?.reveal?.options || [];
  const explanation = answerState?.reveal?.explanation || question.explanation;
  const revealedModelAnswer =
    answerState?.reveal?.modelAnswer || question.rubric?.modelAnswer;

  const examTrick =
    explanation?.examTrick ||
    meta?.examTrick ||
    undefined;

  const originLabel =
    (meta?.originEnum && ARABIC_ORIGIN_LABELS[meta.originEnum as ArabicQuestionOriginEnum]) ||
    (meta?.rawOrigin && RAW_ORIGIN_LABELS[meta.rawOrigin]) ||
    (explanation?.origin && RAW_ORIGIN_LABELS[explanation.origin]) ||
    null;

  const skillLabel = meta?.skillCategory
    ? ARABIC_SKILL_LABELS[meta.skillCategory]
    : null;

  const difficultyMeta = DIFFICULTY_LABELS[question.difficulty] || DIFFICULTY_LABELS.MEDIUM;
  const sourceText = formatSourceRefs(meta?.sourceReferences);
  const wordCount = essayDraft.trim()
    ? essayDraft.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const correctOptionObj =
    revealedOptions.find((o) => o.isCorrect) ||
    question.options.find(
      (o) =>
        revealedOptions.find((r) => r.id === o.id)?.isCorrect ||
        o.id === answerState?.reveal?.correctOptionId
    );

  return (
    <div
      id={`arabic-q-${question.id}`}
      className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-2xs space-y-4 min-w-0"
    >
      {/* Top Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-[#091B40] text-white text-xs font-black tabular-nums">
            س{index + 1}
          </span>
          <span
            className={`px-2 py-0.5 rounded-md border text-[11px] font-extrabold ${difficultyMeta.cls}`}
          >
            {difficultyMeta.label}
          </span>
          {skillLabel && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800 text-[11px] font-bold">
              {skillLabel}
            </span>
          )}
          {originLabel && (
            <span className="px-2 py-0.5 rounded-md bg-[#EAF2FF] text-[#091B40] border border-[#BFDBFE] dark:bg-[#142747] dark:text-[#93C5FD] dark:border-[#1E3A6E] text-[11px] font-bold">
              {originLabel}
            </span>
          )}
          {sourceText && (
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
              ({sourceText})
            </span>
          )}
        </div>

        {isMarkedForReview && (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 text-[11px] font-extrabold flex items-center gap-1">
            <Bookmark className="w-3 h-3 fill-current" />
            <span>في غلطاتي</span>
          </span>
        )}
      </div>

      {/* Question Statement */}
      <div className="text-sm sm:text-base font-bold text-[#091B40] dark:text-white leading-[1.85] break-words">
        <BidiStatement text={question.statement} />
      </div>

      {/* Options or Essay Input */}
      {!isEssay ? (
        <div className="space-y-2.5">
          {question.options.map((opt, oIdx) => {
            const isSelected = answerState?.selectedOptionId === opt.id;
            const revealedOpt = revealedOptions.find((r) => r.id === opt.id);
            const isCorrectOpt = Boolean(revealedOpt?.isCorrect);

            let btnCls =
              "border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F8FAFC] dark:bg-[#081633] hover:border-[#1E40AF] text-[#091B40] dark:text-white";
            if (isRevealed) {
              if (isCorrectOpt) {
                btnCls =
                  "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200";
              } else if (isSelected && !isCorrectOpt) {
                btnCls =
                  "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200";
              } else {
                btnCls =
                  "border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F8FAFC]/60 dark:bg-[#081633]/60 text-[#64748B] dark:text-[#94A3B8]";
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isRevealed || Boolean(answerState?.isLoading)}
                onClick={() => onSelectOption(question.id, opt.id)}
                className={`w-full text-right p-3.5 rounded-xl border-2 transition-all flex items-start justify-between gap-3 min-h-[48px] ${btnCls}`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-white dark:bg-[#0D214D] border border-[#CBD5E1] dark:border-[#1E3A6E] text-xs font-black flex items-center justify-center shrink-0 mt-0.5 tabular-nums text-[#091B40] dark:text-white">
                    {ARABIC_CHOICE_LABELS[oIdx] || String(oIdx + 1)}
                  </span>
                  <span className="text-xs sm:text-sm font-bold leading-relaxed break-words text-right">
                    {opt.text}
                  </span>
                </div>

                {isRevealed && isCorrectOpt && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {isRevealed && isSelected && !isCorrectOpt && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            <span>اكتب إجابتك بنفسك ثم اكشف الإجابة النموذجية ومعايير التصحيح</span>
            <span className="tabular-nums">عدد الكلمات: {wordCount}</span>
          </div>
          <textarea
            rows={4}
            value={essayDraft}
            onChange={(e) => onChangeEssayDraft(question.id, e.target.value)}
            placeholder="اكتب مسودة إجابتك هنا للتدريب..."
            className="w-full p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#081633] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs sm:text-sm font-medium text-[#091B40] dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isRevealingEssay}
              onClick={async () => {
                setIsRevealingEssay(true);
                try {
                  await onRevealEssay(question.id, essayDraft);
                } finally {
                  setIsRevealingEssay(false);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-xs font-extrabold flex items-center gap-1.5 min-h-[42px] disabled:opacity-60"
            >
              <Eye className="w-4 h-4" />
              <span>
                {isRevealingEssay
                  ? "جاري التحميل..."
                  : isEssayRevealed
                    ? "تحديث عرض الإجابة النموذجية"
                    : "اعرض الإجابة النموذجية ومعايير الحل"}
              </span>
            </button>

            <button
              type="button"
              disabled={isTogglingReview}
              onClick={async () => {
                setIsTogglingReview(true);
                try {
                  await onToggleEssayReview(
                    question.id,
                    !isMarkedForReview,
                    essayDraft
                  );
                } finally {
                  setIsTogglingReview(false);
                }
              }}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 min-h-[42px] transition-colors ${isMarkedForReview
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
                }`}
            >
              {isMarkedForReview ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تمت مراجعته ✓</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>راجع في غلطاتي</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Post-submission structured educational feedback (4 REQUIRED LABELS per Master Prompt §3) */}
      {(isRevealed || (isEssay && isEssayRevealed)) && (
        <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
          {!isEssay && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
              <p className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>الإجابة الصحيحة</span>
              </p>
              <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100 leading-relaxed">
                {correctOptionObj?.text ||
                  (answerState?.isCorrect
                    ? "إجابتك صحيحة!"
                    : "راجع الخيار المحدد بالأخضر أعلاه")}
              </p>
            </div>
          )}

          {isEssay && revealedModelAnswer && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
              <p className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>الإجابة الصحيحة (النموذجية)</span>
              </p>
              <p className="text-xs sm:text-sm font-medium text-emerald-950 dark:text-emerald-100 leading-relaxed whitespace-pre-wrap">
                {revealedModelAnswer}
              </p>
            </div>
          )}

          {explanation?.correctReason && (
            <div className="space-y-1">
              <p className="text-xs font-black text-[#091B40] dark:text-white flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-[#1E40AF] dark:text-[#60A5FA] shrink-0" />
                <span>ليه دي الإجابة الصح؟</span>
              </p>
              <p className="text-xs sm:text-sm font-medium text-[#334155] dark:text-[#E2E8F0] leading-relaxed">
                {explanation.correctReason}
              </p>
            </div>
          )}

          {examTrick && (
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
              <p className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>فين التركة؟</span>
              </p>
              <p className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 leading-relaxed">
                {examTrick}
              </p>
            </div>
          )}

          {sectionSolvingTip && (
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-1">
              <p className="text-xs font-black text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 shrink-0" />
                <span>إزاي تحل سؤال شبه ده؟</span>
              </p>
              <p className="text-xs sm:text-sm font-medium text-blue-950 dark:text-blue-100 leading-relaxed">
                {sectionSolvingTip}
              </p>
            </div>
          )}

          {!isEssay && (
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                disabled={isTogglingReview}
                onClick={async () => {
                  setIsTogglingReview(true);
                  try {
                    await onToggleEssayReview(question.id, !isMarkedForReview);
                  } finally {
                    setIsTogglingReview(false);
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-[#64748B] hover:text-[#800B34] dark:text-[#94A3B8] dark:hover:text-[#E9AD32] flex items-center gap-1"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isMarkedForReview ? "إزالة من غلطاتي" : "أضف السؤال للمراجعة في غلطاتي"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
