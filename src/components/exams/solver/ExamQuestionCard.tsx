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
  const isEnglishStatement = !/[\u0600-\u06FF]/.test(currentQ.statement || "");
  const isEnglish = isLanguages && isEnglishStatement;
  const hasTranslation = Boolean(
    isLanguages &&
    initialMode === "PRACTICE" &&
    ((currentQ.translation && currentQ.translation.trim().length > 0) ||
      currentQ.options?.some((o) => o.translation && o.translation.trim().length > 0) ||
      hasExplanationTranslation)
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 sm:p-7 space-y-6 transition-colors">
      {/* Question Header & Action Bar (Unified height h-9, balanced modern badges) */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4"
      >
        {/* Left: Question index and difficulty badges */}
        <div className="flex items-center gap-2">
          {/* Question Index Pill */}
          <span className="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#800020] dark:bg-[#FB7185]" />
            <span>
              {isEnglish
                ? `Question ${currentIndex + 1} of ${totalQuestions}`
                : `السؤال ${currentIndex + 1} من ${totalQuestions}`}
            </span>
          </span>

          {/* Difficulty Badge */}
          <span
            className={`h-9 px-3 rounded-xl text-xs font-bold border flex items-center gap-1 ${
              currentQ.difficulty === "EASY"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : currentQ.difficulty === "MEDIUM"
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
            }`}
          >
            {currentQ.difficulty === "EASY"
              ? isEnglish ? "Easy" : "سهل"
              : currentQ.difficulty === "MEDIUM"
              ? isEnglish ? "Medium" : "متوسط"
              : isEnglish ? "Hard" : "صعب"}
          </span>
        </div>

        {/* Right: Translation toggle & Flag for review button */}
        <div className="flex items-center gap-2">
          {hasTranslation && (
            <button
              type="button"
              onClick={() => setIsQuestionTranslated((prev) => !prev)}
              className={`h-9 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                isQuestionTranslated
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600"
              }`}
              title={isQuestionTranslated ? "إخفاء الترجمة العربية" : "عرض الترجمة العربية"}
            >
              <Translate className="w-3.5 h-3.5" weight="bold" />
              <span>{isQuestionTranslated ? "إخفاء الترجمة" : "ترجمة السؤال"}</span>
            </button>
          )}

          {/* Flag for review toggle */}
          <button
            type="button"
            onClick={onToggleFlag}
            className={`h-9 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none ${
              isFlagged
                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 hover:border-amber-300"
            }`}
          >
            <Flag
              className={`w-3.5 h-3.5 ${isFlagged ? "fill-current" : ""}`}
              weight={isFlagged ? "fill" : "bold"}
            />
            <span>
              {isFlagged
                ? isEnglish ? "Flagged for review" : "متعلّم للمراجعة"
                : isEnglish ? "Flag for review" : "علّم عليه للمراجعة"}
            </span>
          </button>
        </div>
      </div>

      {/* Statement Area */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className={`space-y-4 ${isEnglish ? "text-left" : "text-right"}`}
      >
        <BidiStatement
          as="h2"
          text={currentQ.statement}
          className={`text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white leading-relaxed ${
            isEnglish ? "font-sans" : "font-content"
          }`}
        />
        <QuestionImageAttachment imageUrl={currentQ.imageUrl} />

        {isQuestionTranslated && currentQ.translation && (
          <div
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-right animate-in fade-in duration-200 space-y-1"
            dir="rtl"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Translate className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
              <span>الترجمة العربية للسؤال:</span>
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
              "bg-white dark:bg-slate-900/60 border-2 border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50";

            if (isSelected) {
              cardStyle =
                "bg-[#800020]/5 dark:bg-[#800020]/20 border-2 border-[#800020] dark:border-[#FB7185] text-slate-900 dark:text-white font-bold shadow-xs";
            }

            if (isRevealed) {
              if (isOptionCorrect) {
                cardStyle =
                  "bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold shadow-xs";
              } else if (isSelected && !isOptionCorrect) {
                cardStyle =
                  "bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-500 text-rose-900 dark:text-rose-100 font-bold shadow-xs";
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
                className={`w-full p-4 rounded-xl transition-all cursor-pointer overflow-hidden flex items-start justify-between gap-3.5 text-left sm:text-right ${cardStyle}`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Option Letter Indicator */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 transition-transform ${
                      isRevealed && isOptionCorrect
                        ? "bg-emerald-600 text-white shadow-xs"
                        : isRevealed && isSelected && !isOptionCorrect
                        ? "bg-rose-600 text-white shadow-xs"
                        : isSelected
                        ? "bg-[#800020] dark:bg-[#FB7185] text-white shadow-xs scale-105"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {letter}
                  </div>

                  {/* Option Text */}
                  <div
                    className={`min-w-0 flex-1 leading-relaxed break-words pt-1 text-sm sm:text-base font-medium ${
                      isEnglishOpt ? "text-left font-sans" : "text-right font-content"
                    }`}
                  >
                    <BidiStatement as="span" text={opt.text} />

                    {isQuestionTranslated && opt.translation && (
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

                {/* Practice revealed check/incorrect badge */}
                {isRevealed && (
                  <div className="shrink-0 pt-1">
                    {isOptionCorrect ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        <Check className="w-3.5 h-3.5" weight="bold" />
                        <span>{isEnglish ? "Correct" : "صحيح"}</span>
                      </span>
                    ) : isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold">
                        <span>{isEnglish ? "Incorrect" : "غير صحيح"}</span>
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
          <label
            className={`block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 ${
              isEnglish ? "text-left font-sans" : "text-right font-content"
            }`}
          >
            {isEnglish ? "Write your detailed answer here:" : "اكتب إجابتك هنا بالتفصيل:"}
          </label>
          <textarea
            value={currentAnswer.essayText || ""}
            onChange={(e) => onEssayChange(e.target.value)}
            dir={isEnglish ? "ltr" : "rtl"}
            placeholder={
              isEnglish
                ? "Write your solution steps and explanation here..."
                : "اكتب خطوات الحل وشرحك هنا بالتفصيل..."
            }
            rows={5}
            className={`w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#800020] text-slate-900 dark:text-white leading-relaxed ${
              isEnglish ? "text-left font-sans" : "text-right font-content"
            }`}
          />

          {initialMode === "PRACTICE" && currentAnswer.practiceRevealed && revealedAnswer?.modelAnswer && (
            <div className="p-5 rounded-2xl bg-[#800020]/5 dark:bg-[#800020]/15 border border-[#800020]/20 dark:border-[#FB7185]/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-2">
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
        <div className="pt-2">
          {!currentAnswer.practiceRevealed ? (
            <button
              type="button"
              onClick={onRevealPractice}
              disabled={
                isRevealing ||
                (!currentAnswer.selectedOptionId && !currentAnswer.essayText)
              }
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-[#800020] to-[#991B1B] hover:from-[#66001A] hover:to-[#800020] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs hover:shadow transition-all active:scale-98 disabled:opacity-40 cursor-pointer select-none"
            >
              <Lightbulb className="w-4 h-4" weight="fill" />
              <span>
                {isRevealing
                  ? "بنراجع إجابتك..."
                  : "تحقق من إجابتك وشاهد التفسير الفوري"}
              </span>
            </button>
          ) : (
            revealedAnswer?.explanation && (
              <QuestionExplanationBox
                concept={revealedAnswer.explanation.concept}
                correctReason={revealedAnswer.explanation.correctReason}
                isTranslated={isQuestionTranslated}
                onToggleTranslation={() => setIsQuestionTranslated((prev) => !prev)}
                forceEnglish={isEnglish}
              />
            )
          )}
        </div>
      )}

      {/* Question Navigation Controls */}
      <div
        dir={isEnglish ? "ltr" : "rtl"}
        className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800"
      >
        <button
          type="button"
          onClick={onPrevQuestion}
          disabled={currentIndex === 0}
          className="h-11 px-4 sm:px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all cursor-pointer select-none"
        >
          {isEnglish ? <CaretLeft className="w-4 h-4" weight="bold" /> : <CaretRight className="w-4 h-4" weight="bold" />}
          <span>{isEnglish ? "Previous Question" : "السؤال السابق"}</span>
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            type="button"
            onClick={onNextQuestion}
            className="h-11 px-5 sm:px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs hover:shadow transition-all active:scale-98 cursor-pointer select-none"
          >
            <span>{isEnglish ? "Next Question" : "السؤال التالي"}</span>
            {isEnglish ? <CaretRight className="w-4 h-4" weight="bold" /> : <CaretLeft className="w-4 h-4" weight="bold" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="h-11 px-5 sm:px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs hover:shadow transition-all active:scale-98 cursor-pointer select-none"
          >
            <span>{isEnglish ? "Finished? Submit Exam" : "إنهاء وتسليم الامتحان"}</span>
            <PaperPlaneTilt className="w-4 h-4" weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}
