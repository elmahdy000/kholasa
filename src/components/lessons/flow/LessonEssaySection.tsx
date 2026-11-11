"use client";

import { useState } from "react";
import {
  PencilLine,
  Sparkle,
  Star,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { FormattedAnswerView } from "@/components/ui/FormattedAnswerView";
import { QuestionImageAttachment } from "@/components/ui/QuestionImageAttachment";
import { TranslationToggle } from "@/components/ui/TranslationToggle";
import { EssayReviewToggleButton } from "@/components/questions/EssayReviewToggleButton";
import { normalizeRubricCriteria } from "@/lib/rubric";
import { Question } from "../types";

interface LessonEssaySectionProps {
  questions: { question: Question }[];
  essayDrafts: Record<string, string>;
  revealedEssays: Record<string, boolean>;
  essaySelfScores: Record<string, number>;
  markedForReviewIds?: Set<string>;
  onDraftChange: (questionId: string, draft: string) => void;
  onToggleReveal: (questionId: string) => void;
  onSelectScore: (questionId: string, score: number) => void;
  onReviewToggle?: (questionId: string, marked: boolean) => void;
  isLanguages?: boolean;
}

export function LessonEssaySection({
  questions,
  essayDrafts,
  revealedEssays,
  essaySelfScores,
  markedForReviewIds,
  onDraftChange,
  onToggleReveal,
  onSelectScore,
  onReviewToggle,
  isLanguages = false,
}: LessonEssaySectionProps) {
  // Independent translation states for questions and model answers
  const [questionTranslations, setQuestionTranslations] = useState<Record<string, boolean>>({});
  const [modelAnswerTranslations, setModelAnswerTranslations] = useState<Record<string, boolean>>({});

  const toggleQuestionTranslation = (questionId: string) => {
    setQuestionTranslations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const toggleModelAnswerTranslation = (questionId: string) => {
    setModelAnswerTranslations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  return (
    <div id="section-essay" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#EAF2FF]/70 dark:bg-[#142747]/70 border border-[#BFDBFE] dark:border-[#1E3A6E] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#091B40] dark:bg-[#2C70BF] text-white flex items-center justify-center shrink-0 shadow-sm">
            <PencilLine className="w-6 h-6" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8] dark:text-[#93C5FD] bg-[#2C70BF]/12 dark:bg-[#2C70BF]/25 px-2 py-0.5 rounded-md">
                تدريب كتابي
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                الأسئلة المقالية
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              {isLanguages
                ? "درب نفسك واكتب إجابتك هنا، وقارنها بنموذج الإجابة الرسمي مع إمكانية عرض الترجمة"
                : "درب نفسك واكتب إجابتك هنا، وقارنها فوراً بنموذج الإجابة المعتمد وسلم التقدير"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0F1E36] border border-[#BFDBFE] dark:border-[#1E3A6E] text-[#1D4ED8] dark:text-[#93C5FD] text-[13px] font-bold font-mono">
            {questions.length} سؤال مقالي
          </span>
        </div>
      </div>

      {/* Clear Self-Comparison Notice (آلية تصحيح المقالي المعتمدة) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#EAF2FF]/50 dark:bg-[#142747]/50 border border-[#BFDBFE] dark:border-[#1E3A6E] text-xs sm:text-[13px] text-[#091B40] dark:text-[#E2E8F0] flex items-start gap-3 shadow-2xs">
        <div className="w-7 h-7 rounded-lg bg-[#2C70BF] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 shadow-xs">
          💡
        </div>
        <div className="leading-relaxed space-y-1">
          <strong className="block text-[#091B40] dark:text-[#93C5FD] font-bold text-sm">
            آلية حل وتصحيح الأسئلة المقالية:
          </strong>
          <p className="text-slate-700 dark:text-slate-300">
            الأسئلة المقالية في الامتحانات تقاس باستيعابك للمفاهيم الرئيسية؛ اكتب مسودة إجابتك أولاً لاختبار نفسك، ثم اضغط على <strong>"عرض نموذج الإجابة المعتمد"</strong> لمقارنة نقاطك بنموذج الوزارة وعناصر التقييم، وتحديد مدى تغطيتك للمفاهيم المطلوبة.
          </p>
        </div>
      </div>

      {/* Essay Questions List */}
      {questions.length > 0 ? (
        <div className="space-y-6">
          {questions.map(({ question }, qIndex) => {
            const isRevealed = !!revealedEssays[question.id];
            const draft = essayDrafts[question.id] || "";
            const selfScore = essaySelfScores[question.id];
            const maxScore = question.rubric?.maxScore || 3;

            const isQuestionTranslated = Boolean(questionTranslations[question.id]);
            const isModelAnswerTranslated = Boolean(modelAnswerTranslations[question.id]);
            const isEnglishStatement = !/[\u0600-\u06FF]/.test(question.statement || "");
            const isEnglish = isLanguages && isEnglishStatement;
            const hasQuestionTranslation = isLanguages && Boolean(question.translation && question.translation.trim().length > 0);
            const hasModelAnswerTranslation = isLanguages && Boolean(
              question.rubric?.modelAnswerTranslation &&
              question.rubric.modelAnswerTranslation.trim().length > 0
            );
            const normalizedCriteria = normalizeRubricCriteria(question.rubric?.criteria);
            const isMarkedForReview = Boolean(markedForReviewIds?.has(question.id));

            return (
              <div
                key={question.id}
                className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#E2E8F0] dark:border-[#1E3352] space-y-4 shadow-sm"
              >
                {/* Question Header & Controls */}
                <div
                  dir={isEnglishStatement ? "ltr" : "rtl"}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#1E3352] pb-3"
                >
                  <span className="text-[13px] font-bold text-[#091B40] dark:text-[#93C5FD] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#EAF2FF] dark:bg-[#142747] text-[#1D4ED8] dark:text-[#93C5FD] flex items-center justify-center font-sans tabular-nums font-bold text-[12px]">
                      {qIndex + 1}
                    </span>
                    <span>
                      {isEnglishStatement
                        ? `Essay Question ${qIndex + 1}`
                        : `سؤال مقالي رقم ${qIndex + 1}`}
                    </span>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {hasQuestionTranslation && (
                      <TranslationToggle
                        size="xs"
                        isTranslated={isQuestionTranslated}
                        onToggle={() => toggleQuestionTranslation(question.id)}
                      />
                    )}
                    <EssayReviewToggleButton
                      questionId={question.id}
                      marked={markedForReviewIds ? isMarkedForReview : undefined}
                      essayText={draft}
                      isEnglish={isEnglish}
                      size="sm"
                      onChange={(marked) => onReviewToggle?.(question.id, marked)}
                    />
                    <span className="px-3 py-1 rounded-lg text-[12px] font-bold bg-[#EAF2FF] dark:bg-[#142747] text-[#091B40] dark:text-[#93C5FD]">
                      {isEnglishStatement
                        ? `Score: ${maxScore} pts`
                        : `درجة السؤال: ${maxScore} درجات`}
                    </span>
                  </div>
                </div>

                {/* Question Statement */}
                <div
                  dir={isEnglishStatement ? "ltr" : "rtl"}
                  className={isEnglishStatement ? "text-left" : "text-right"}
                >
                  <BidiStatement
                    as="h4"
                    text={question.statement}
                    className={`text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed ${isEnglishStatement ? "font-sans" : "font-content"}`}
                  />
                </div>

                {/* Collapsible Arabic Translation for Question Statement */}
                {isQuestionTranslated && question.translation && (
                  <div
                    dir="rtl"
                    className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] text-right animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#1D4ED8] dark:bg-[#142747] dark:text-[#93C5FD] mb-1.5 inline-block">
                      الترجمة العربية للسؤال
                    </span>
                    <p className="text-[13px] sm:text-[14px] text-[#1E293B] dark:text-slate-200 leading-relaxed font-content">
                      {question.translation}
                    </p>
                  </div>
                )}

                <QuestionImageAttachment imageUrl={question.imageUrl} />

                {/* Student Drafting Box */}
                <div className="space-y-2">
                  <label
                    dir={isEnglishStatement ? "ltr" : "rtl"}
                    className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between"
                  >
                    <span>
                      {isEnglishStatement
                        ? "Write your draft answer here (optional):"
                        : "اكتب مسودة إجابتك هنا للتدريب (اختياري):"}
                    </span>
                    <span className="font-mono text-[11px]">
                      {draft.length} {isEnglishStatement ? "chars" : "حرف"}
                    </span>
                  </label>
                  <textarea
                    value={draft}
                    onChange={(e) => onDraftChange(question.id, e.target.value)}
                    dir={isEnglishStatement ? "ltr" : "rtl"}
                    placeholder={
                      isEnglishStatement
                        ? "Write your thoughts or draft answer here before revealing the model answer..."
                        : "اكتب أفكارك أو صياغتك هنا قبل فتح نموذج الإجابة لتختبر نفسك..."
                    }
                    rows={3}
                    className={`w-full p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#142747]/70 border border-[#E2E8F0] dark:border-[#1E3352] text-[13px] sm:text-sm text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#2C70BF] transition-colors resize-y ${isEnglishStatement ? "text-left font-sans" : "text-right font-content"}`}
                  />
                </div>

                {/* Toggle Model Answer Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onToggleReveal(question.id)}
                    className={`h-11 px-5 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isRevealed
                        ? "bg-[#EAF2FF] text-[#091B40] border border-[#BFDBFE] dark:bg-[#142747] dark:text-[#93C5FD] dark:border-[#2C70BF]/40"
                        : "bg-[#091B40] hover:bg-[#12263F] dark:bg-[#2C70BF] dark:hover:bg-[#1D4ED8] text-white shadow-sm"
                    }`}
                  >
                    <Sparkle className="w-4 h-4" weight="fill" />
                    <span>
                      {isRevealed
                        ? "إخفاء نموذج الإجابة والمعايير"
                        : "عرض نموذج الإجابة المعتمد وتوزيع الدرجات"}
                    </span>
                  </button>
                </div>

                {/* Model Answer & Rubric Breakdown */}
                {isRevealed && (
                  <div className="space-y-4 pt-3 border-t border-[#E2E8F0] dark:border-[#1E3352] animate-in fade-in duration-200">
                    {/* Model Answer Box */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#EAF2FF]/50 dark:bg-[#142747]/50 border border-[#BFDBFE] dark:border-[#1E3A6E] space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-bold uppercase tracking-wider text-[#1D4ED8] dark:text-[#93C5FD] flex items-center gap-1.5">
                          <Sparkle className="w-3.5 h-3.5" weight="fill" />
                          <span>النموذج المعتمد للإجابة:</span>
                        </span>

                        {hasModelAnswerTranslation && (
                          <TranslationToggle
                            size="xs"
                            isTranslated={isModelAnswerTranslated}
                            onToggle={() => toggleModelAnswerTranslation(question.id)}
                            title="عرض الترجمة العربية لنموذج الإجابة"
                          />
                        )}
                      </div>

                      <FormattedAnswerView
                        text={
                          question.rubric?.modelAnswer ||
                          question.explanation?.correctReason ||
                          "الإجابة المعتمدة تركز على الخطوات والشرح المنهجي لمفاهيم السؤال."
                        }
                        colorScheme="blue"
                      />

                      {/* Collapsible Arabic Translation for Model Answer */}
                      {isModelAnswerTranslated && question.rubric?.modelAnswerTranslation && (
                        <div
                          dir="rtl"
                          className="mt-3 p-3.5 rounded-xl bg-[#EAF2FF]/70 dark:bg-[#142747]/70 border border-[#BFDBFE] dark:border-[#1E3A6E] text-right animate-in fade-in duration-200"
                        >
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-[#0F1E36] text-[#1D4ED8] dark:text-[#93C5FD] mb-1.5 inline-block">
                            الترجمة العربية لنموذج الإجابة
                          </span>
                          <p className="text-[13px] sm:text-[14px] text-slate-800 dark:text-slate-200 leading-relaxed font-content">
                            {question.rubric.modelAnswerTranslation}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Rubric Criteria */}
                    {normalizedCriteria.length > 0 && (
                        <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2.5">
                          <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                            {isEnglish ? "Grading Criteria:" : "معايير توزيع الدرجات:"}
                          </span>
                          <div className="space-y-1.5">
                            {normalizedCriteria.map((c, cIdx) => (
                              <div
                                key={cIdx}
                                className="flex items-center justify-between gap-2 text-[13px] py-1 border-b border-[#E2E8F0]/40 dark:border-[#334155]/40 last:border-0"
                              >
                                <span className="text-[#0F172A] dark:text-white flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2C70BF] shrink-0" />
                                  <span>{c.text}</span>
                                </span>
                                {c.marks !== undefined && (
                                  <span className="font-sans tabular-nums font-bold text-[#1D4ED8] dark:text-[#93C5FD] bg-[#EAF2FF] dark:bg-[#142747] px-2 py-0.5 rounded-md text-[11px] shrink-0">
                                    {isEnglish ? `${c.marks} pts` : `${c.marks} درجات`}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Self-Scoring & Mark-for-Review Bar */}
                    <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[13px] font-bold text-[#0F172A] dark:text-white block">
                            قيّم إجابتك بنفسك:
                          </span>
                          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                            بناءً على معايير النموذج، كم تعطي نفسك من {maxScore}؟
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: maxScore + 1 }, (_, i) => i).map((score) => {
                            const isSelected = selfScore === score;
                            return (
                              <button
                                key={score}
                                type="button"
                                onClick={() => onSelectScore(question.id, score)}
                                className={`w-8 h-8 rounded-lg font-sans tabular-nums font-bold text-[13px] transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#091B40] dark:bg-[#2C70BF] text-white shadow-sm"
                                    : "bg-white dark:bg-[#0F1E36] text-[#64748B] dark:text-[#CBD5E1] hover:border-[#2C70BF]/50 border border-[#E2E8F0] dark:border-[#1E3352]"
                                }`}
                              >
                                {score}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <span className="text-xs font-semibold text-[#536681] dark:text-[#94A3B8]">
                          {selfScore !== undefined && selfScore < maxScore
                            ? "حسّيت إن إجابتك محتاجة تثبيت أكتر؟ احفظ السؤال في غلطاتي عشان تراجعه تاني."
                            : "لو حابب تراجع السؤال ده تاني لاحقاً، تقدر تضيفه لركن غلطاتي مباشرة:"}
                        </span>
                        <EssayReviewToggleButton
                          questionId={question.id}
                          marked={markedForReviewIds ? isMarkedForReview : undefined}
                          essayText={draft}
                          isEnglish={isEnglish}
                          size="sm"
                          onChange={(marked) => onReviewToggle?.(question.id, marked)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
            لا توجد أسئلة مقالية مضافة لهذا الدرس بعد
          </p>
        </div>
      )}
    </div>
  );
}
