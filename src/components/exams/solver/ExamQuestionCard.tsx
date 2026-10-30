"use client";

import {
  Flag,
  CaretRight,
  CaretLeft,
  Sparkle,
  Lightbulb,
  Check,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { FormattedAnswerView } from "@/components/ui/FormattedAnswerView";
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

  return (
    <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-6">
      {/* Question Header & Badges */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#E11D48]/50">
            السؤال {currentIndex + 1} من {totalQuestions}
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#334155]/50">
            {currentQ.difficulty === "EASY"
              ? "سهل"
              : currentQ.difficulty === "MEDIUM"
              ? "متوسط"
              : "صعب"}
          </span>
        </div>

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
          <span>{isFlagged ? "متعلّم للمراجعة" : "علّم عليه للمراجعة"}</span>
        </button>
      </div>

      {/* Statement */}
      {isLanguages ? (
        <h2
          dir="ltr"
          className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-white leading-relaxed font-sans text-left"
        >
          {currentQ.statement}
        </h2>
      ) : (
        <BidiStatement
          as="h2"
          text={currentQ.statement}
          className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white leading-relaxed font-content"
        />
      )}

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

            const letter = isLanguages
              ? englishLetters[optIdx] || opt.order
              : arabicLetters[optIdx] || opt.order;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectOption(opt.id)}
                className={`w-full p-4 sm:p-4 rounded-xl border ${isLanguages ? "text-left font-sans" : "text-right"} text-[13px] sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 transition-colors cursor-pointer ${cardStyle}`}
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
                  <div className="min-w-0 flex-1 leading-relaxed">
                    {isLanguages ? (
                      <span className="font-sans">{opt.text}</span>
                    ) : (
                      <BidiStatement as="span" text={opt.text} />
                    )}
                  </div>
                </div>

                {isRevealed && (
                  <div className="shrink-0">
                    {isOptionCorrect ? (
                      <span className="text-[#059669] dark:text-[#34D399] text-[13px] font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" weight="bold" />
                        <span>صح! برافو</span>
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

      {/* Essay Question Area */}
      {currentQ.type === "ESSAY" && (
        <div className="space-y-4">
          <label className="block text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8]">
            اكتب إجابتك هنا بالتفصيل:
          </label>
          <textarea
            value={currentAnswer.essayText || ""}
            onChange={(e) => onEssayChange(e.target.value)}
            placeholder="اكتب خطوات الحل وشرحك هنا بالتفصيل..."
            rows={5}
            className="w-full p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#800020] text-[#0F172A] dark:text-white font-content"
          />

          {initialMode === "PRACTICE" && currentAnswer.practiceRevealed && revealedAnswer?.modelAnswer && (
            <div className="p-5 rounded-2xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/60 dark:border-[#E11D48]/60 space-y-3">
              <h4 className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-2">
                <Sparkle className="w-4 h-4" weight="fill" />
                <span>نموذج الإجابة ومعايير التقييم</span>
              </h4>
              <FormattedAnswerView
                text={revealedAnswer.modelAnswer}
                colorScheme="burgundy"
              />
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
              <div className="p-5 rounded-2xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/60 dark:border-[#E11D48]/60 space-y-3">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#800020] dark:text-[#FB7185]">
                  <Lightbulb className="w-4 h-4" weight="fill" />
                  <span>الفكرة الأساسية: {revealedAnswer.explanation.concept}</span>
                </div>
                <FormattedAnswerView
                  text={revealedAnswer.explanation.correctReason}
                  colorScheme="burgundy"
                />

                {/* Per-option breakdown */}
                <div className="pt-2 border-t border-[#E2E8F0]/40 dark:border-[#E11D48]/40 space-y-2">
                  <span className="text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                    ليه ده صح وده غلط؟
                  </span>
                  {currentQ.options.map((opt) => {
                    const revealedOpt = revealedAnswer.options?.find(
                      (o) => o.id === opt.id
                    );
                    return (
                      <div
                        key={opt.id}
                        className="text-[13px] text-[#64748B] dark:text-[#94A3B8] flex items-start gap-2 font-content"
                      >
                        <span className="font-bold shrink-0">
                          • <BidiStatement as="span" text={opt.text} />:
                        </span>
                        <span>
                          {revealedOpt?.explanation ||
                            (revealedOpt?.isCorrect
                              ? "ده الخيار الدقيق والمظبوط"
                              : "مش مظبوط في الحالة دي")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
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
