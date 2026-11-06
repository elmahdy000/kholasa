"use client";

import { useState, useEffect } from "react";
import {
  Flag,
  CaretRight,
  CaretLeft,
  Sparkle,
  Lightbulb,
  Check,
  PaperPlaneTilt,
  Translate,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { FormattedAnswerView } from "@/components/ui/FormattedAnswerView";
import { QuestionExplanationBox } from "@/components/ui/QuestionExplanationBox";
import { QuestionImageAttachment } from "@/components/ui/QuestionImageAttachment";
import { TranslationToggle } from "@/components/ui/TranslationToggle";
import { Question, UserAnswerState, RevealedAnswer } from "./types";

interface ExamQuestionCardProps {
  currentQ: Question;
  currentIndex: number;
  totalQuestions: number;
  initialMode: "PRACTICE" | "EXAM";
  currentAnswer: UserAnswerState;
  revealedAnswer?: RevealedAnswer;
  isFlagged: boolean;
  isLanguages: boolean;
  isRevealing: boolean;
  onToggleFlag: () => void;
  onSelectOption: (optionId: string) => void;
  onEssayChange: (text: string) => void;
  onRevealPractice: () => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onOpenSubmitModal: () => void;
}

export function ExamQuestionCard({
  currentQ,
  currentIndex,
  totalQuestions,
  initialMode,
  currentAnswer,
  revealedAnswer,
  isFlagged,
  isLanguages,
  isRevealing,
  onToggleFlag,
  onSelectOption,
  onEssayChange,
  onRevealPractice,
  onPrevQuestion,
  onNextQuestion,
  onOpenSubmitModal,
}: ExamQuestionCardProps) {
  const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];
  const englishLetters = ["A", "B", "C", "D", "E"];

  const [isQuestionTranslated, setIsQuestionTranslated] = useState(false);
  const [isModelAnswerTranslated, setIsModelAnswerTranslated] = useState(false);

  useEffect(() => {
    setIsQuestionTranslated(false);
    setIsModelAnswerTranslated(false);
  }, [currentQ.id]);

  const rawExplanationReason =
    revealedAnswer?.explanation?.correctReason ||
    (currentQ as any)?.explanation?.correctReason ||
    "";
  const hasExplanationTranslation =
    /\n+\s*(?:الترجمة العربية للتفسير|الترجمة العربية|ترجمة التفسير|<!--\s*translation\s*-->|\[TRANSLATION\])/i.test(
      rawExplanationReason
    );
  const hasTranslation = Boolean(
    initialMode === "PRACTICE" &&
    ((currentQ.translation && currentQ.translation.trim().length > 0) ||
      currentQ.options?.some((o) => o.translation && o.translation.trim().length > 0) ||
      hasExplanationTranslation)
  );

  const isEnglishStatement = !/[\u0600-\u06FF]/.test(currentQ.statement || "");
  const isEnglish = isLanguages || isEnglishStatement;

  return (
    <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-6">
      {/* Question Header & Badges */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4"
      >
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#E11D48]/50">
            {isEnglish
              ? `Question ${currentIndex + 1} of ${totalQuestions}`
              : `السؤال ${currentIndex + 1} من ${totalQuestions}`}
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#334155]/50">
            {currentQ.difficulty === "EASY"
              ? isEnglish ? "Easy" : "سهل"
              : currentQ.difficulty === "MEDIUM"
              ? isEnglish ? "Medium" : "متوسط"
              : isEnglish ? "Hard" : "صعب"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasTranslation && (
            <TranslationToggle
              size="xs"
              isTranslated={isQuestionTranslated}
              onToggle={() => setIsQuestionTranslated((prev) => !prev)}
            />
          )}
          <button
            type="button"
            onClick={onToggleFlag}
            className={`px-3 py-2 rounded-lg border text-[13px] font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              isFlagged
                ? "bg-[#D97706]/10 dark:bg-[#1E293B] border-[#E2E8F0] text-[#D97706]"
                : "border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-current" : ""}`} weight={isFlagged ? "fill" : "bold"} />
            <span>
              {isFlagged
                ? isEnglish ? "Flagged for review" : "متعلّم للمراجعة"
                : isEnglish ? "Flag for review" : "علّم عليه للمراجعة"}
            </span>
          </button>
        </div>
      </div>

      {/* Statement */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className={`space-y-4 ${isEnglish ? "text-left" : "text-right"}`}
      >
        <BidiStatement
          as="h2"
          text={currentQ.statement}
          className={`text-base sm:text-lg font-bold text-[#0F172A] dark:text-white leading-relaxed ${isEnglish ? "font-sans" : "font-content"}`}
        />
        <QuestionImageAttachment imageUrl={currentQ.imageUrl} />

        {initialMode === "PRACTICE" && isQuestionTranslated && currentQ.translation && (
          <div
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-right animate-in fade-in duration-200"
            dir="rtl"
          >
            <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <Translate className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
              <span>الترجمة العربية للسؤال</span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-content">
              {currentQ.translation}
            </p>
          </div>
        )}
      </div>

      {/* MCQ / TRUE_FALSE Options */}
      {(currentQ.type === "MCQ" || currentQ.type === "TRUE_FALSE") && (
        <div className="space-y-3">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = currentAnswer.selectedOptionId === opt.id;
            const isRevealed =
              initialMode === "PRACTICE" && currentAnswer.practiceRevealed;
            const isOptionCorrect =
              revealedAnswer?.options?.find((o) => o.id === opt.id)?.isCorrect === true;

            let cardStyle =
              "bg-white dark:bg-[#1E293B]/80 border-[#E2E8F0] dark:border-[#334155]/80 text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#800020] dark:hover:border-[#64748B]";

            if (isSelected) {
              cardStyle =
                "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] dark:border-[#E11D48] text-[#0F172A] dark:text-white font-bold";
            }

            if (isRevealed) {
              if (isOptionCorrect) {
                cardStyle =
                  "bg-[#059669]/10 dark:bg-[#1E293B] border-2 border-[#059669] text-[#059669] dark:text-[#34D399] font-bold";
              } else if (isSelected && !isOptionCorrect) {
                cardStyle =
                  "bg-[#DC2626]/10 dark:bg-[#1E293B] border-2 border-[#DC2626] text-[#DC2626] dark:text-[#F87171] font-bold";
              }
            }

            const isEnglishOpt = isEnglish || !/[\u0600-\u06FF]/.test(opt.text || "");
            const letter = isEnglishOpt
              ? englishLetters[optIdx] || opt.order
              : arabicLetters[optIdx] || opt.order;

            return (
              <button
                key={opt.id}
                type="button"
                dir={isEnglishOpt ? "ltr" : "rtl"}
                onClick={() => onSelectOption(opt.id)}
                className={`w-full p-4 sm:p-4 rounded-xl border ${isEnglishOpt ? "text-left font-sans" : "text-right font-content"} text-[13px] sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 transition-colors cursor-pointer ${cardStyle}`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-mono font-bold shrink-0 mt-1 sm:mt-0 ${
                      isSelected
                        ? "bg-[#800020] dark:bg-[#E11D48] text-white"
                        : "bg-[#F8FAFC] dark:bg-[#334155] text-[#64748B] dark:text-[#F8FAFC] border border-[#E2E8F0]/60 dark:border-[#334155]"
                    }`}
                  >
                    {letter}
                  </div>
                  <div className={`min-w-0 flex-1 leading-relaxed ${isEnglishOpt ? "text-left" : "text-right"}`}>
                    <BidiStatement as="span" text={opt.text} />

                    {initialMode === "PRACTICE" && isQuestionTranslated && opt.translation && (
                      <div
                        className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-right text-xs text-slate-600 dark:text-slate-300 font-medium font-content animate-in fade-in duration-150"
                        dir="rtl"
                      >
                        <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">الترجمة:</span>
                        <span>{opt.translation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isRevealed && (
                  <div className="shrink-0">
                    {isOptionCorrect ? (
                      <span className="text-[#059669] dark:text-[#34D399] text-[13px] font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" weight="bold" />
                        <span>{isEnglish ? "Correct" : "صح! برافو"}</span>
                      </span>
                    ) : isSelected ? (
                      <span className="text-[#DC2626] dark:text-[#F87171] text-[13px] font-bold">
                        {isEnglish ? "Incorrect" : "مش صحيحة"}
                      </span>
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Essay Question Area */}
      {currentQ.type === "ESSAY" && (
        <div className="space-y-4">
          <label className={`block text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] ${isEnglish ? "text-left" : "text-right"}`}>
            {isEnglish ? "Write your detailed answer here:" : "اكتب إجابتك هنا بالتفصيل:"}
          </label>
          <textarea
            value={currentAnswer.essayText || ""}
            onChange={(e) => onEssayChange(e.target.value)}
            dir={isEnglish ? "ltr" : "rtl"}
            placeholder={isEnglish ? "Write your solution steps and explanation here..." : "اكتب خطوات الحل وشرحك هنا بالتفصيل..."}
            rows={5}
            className={`w-full p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#800020] text-[#0F172A] dark:text-white ${isEnglish ? "text-left font-sans" : "text-right font-content"}`}
          />

          {initialMode === "PRACTICE" && currentAnswer.practiceRevealed && revealedAnswer?.modelAnswer && (
            <div className="p-5 rounded-2xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/60 dark:border-[#E11D48]/60 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-2">
                  <Sparkle className="w-4 h-4" weight="fill" />
                  <span>نموذج الإجابة ومعايير التقييم</span>
                </h4>
                {revealedAnswer.modelAnswerTranslation && (
                  <TranslationToggle
                    size="xs"
                    isTranslated={isModelAnswerTranslated}
                    onToggle={() => setIsModelAnswerTranslated((prev) => !prev)}
                  />
                )}
              </div>
              <FormattedAnswerView
                text={revealedAnswer.modelAnswer}
                colorScheme="burgundy"
              />
              {isModelAnswerTranslated && revealedAnswer.modelAnswerTranslation && (
                <div
                  className="p-3.5 rounded-xl bg-white/80 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-700 text-right animate-in fade-in duration-200"
                  dir="rtl"
                >
                  <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <Translate className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
                    <span>الترجمة العربية لنموذج الإجابة</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-content whitespace-pre-wrap">
                    {revealedAnswer.modelAnswerTranslation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Practice Mode: Reveal Button & In-depth Explanation */}
      {initialMode === "PRACTICE" && (
        <div>
          {!currentAnswer.practiceRevealed ? (
            <button
              type="button"
              onClick={onRevealPractice}
              disabled={
                isRevealing ||
                (!currentAnswer.selectedOptionId && !currentAnswer.essayText)
              }
              className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white font-bold text-[13px] flex items-center gap-2 transition-all active:opacity-80 disabled:opacity-40 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" weight="fill" />
              <span>
                {isRevealing
                  ? "بنراجع إجابتك..."
                  : "شوف إجابتك صح ولا غلط واعرف التفسير"}
              </span>
            </button>
          ) : (
            revealedAnswer?.explanation && (
              <QuestionExplanationBox
                concept={revealedAnswer.explanation.concept}
                correctReason={revealedAnswer.explanation.correctReason}
                isTranslated={isQuestionTranslated}
                onToggleTranslation={() => setIsQuestionTranslated((prev) => !prev)}
              />
            )
          )}
        </div>
      )}

      {/* Question Navigation Controls */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
        <button
          type="button"
          onClick={onPrevQuestion}
          disabled={currentIndex === 0}
          className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2 hover:bg-[#F8FAFC] dark:hover:bg-[#334155] disabled:opacity-40 transition-colors cursor-pointer"
        >
          <CaretRight className="w-4 h-4" weight="bold" />
          <span>السؤال اللي قبله</span>
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            type="button"
            onClick={onNextQuestion}
            className="h-11 px-5 sm:px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 transition-colors active:opacity-80 cursor-pointer"
          >
            <span>السؤال اللي بعده</span>
            <CaretLeft className="w-4 h-4" weight="bold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="h-11 px-5 sm:px-6 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-[13px] font-bold flex items-center gap-2 transition-colors active:opacity-80 cursor-pointer"
          >
            <span>خلصت؟ سلّم الامتحان</span>
            <PaperPlaneTilt className="w-3.5 h-3.5" weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}
