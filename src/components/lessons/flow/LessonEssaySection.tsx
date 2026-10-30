"use client";

import {
  PencilLine,
  Sparkle,
  Star,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { FormattedAnswerView } from "@/components/ui/FormattedAnswerView";
import { Question, RubricCriterion } from "../types";

interface LessonEssaySectionProps {
  questions: { question: Question }[];
  essayDrafts: Record<string, string>;
  revealedEssays: Record<string, boolean>;
  essaySelfScores: Record<string, number>;
  onDraftChange: (questionId: string, draft: string) => void;
  onToggleReveal: (questionId: string) => void;
  onSelectScore: (questionId: string, score: number) => void;
}

export function LessonEssaySection({
  questions,
  essayDrafts,
  revealedEssays,
  essaySelfScores,
  onDraftChange,
  onToggleReveal,
  onSelectScore,
}: LessonEssaySectionProps) {
  return (
    <div id="section-essay" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="p-6 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/25 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-sm">
            <PencilLine className="w-6 h-6" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED] bg-[#7C3AED]/15 px-2 py-0.5 rounded-md">
                تدريب كتابي
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                الأسئلة المقالية
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              درب نفسك واكتب إجابتك هنا، وقارنها فوراً بنموذج الإجابة الرسمي وتوزيع الدرجات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#7C3AED]/20 text-[#7C3AED] text-[13px] font-bold font-mono">
            {questions.length} سؤال مقالي
          </span>
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

            return (
              <div
                key={question.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
                  <span className="text-[13px] font-bold text-[#7C3AED] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-mono font-bold text-[12px]">
                      {qIndex + 1}
                    </span>
                    <span>سؤال مقالي رقم {qIndex + 1}</span>
                  </span>
                  <span className="px-3 py-1 rounded-lg text-[12px] font-bold bg-[#7C3AED]/10 text-[#7C3AED]">
                    درجة السؤال: {maxScore} درجات
                  </span>
                </div>

                <BidiStatement
                  as="h4"
                  text={question.statement}
                  className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed font-content"
                />

                {/* Student Drafting Box */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                    <span>اكتب مسودة إجابتك هنا للتدريب (اختياري):</span>
                    <span className="font-mono text-[11px]">{draft.length} حرف</span>
                  </label>
                  <textarea
                    value={draft}
                    onChange={(e) => onDraftChange(question.id, e.target.value)}
                    placeholder="اكتب أفكارك أو صياغتك هنا قبل فتح نموذج الإجابة لتختبر نفسك..."
                    rows={3}
                    className="w-full p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED] transition-colors resize-y font-content"
                  />
                </div>

                {/* Toggle Model Answer Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onToggleReveal(question.id)}
                    className={`h-11 px-5 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all ${
                      isRevealed
                        ? "bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30"
                        : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm"
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
                  <div className="space-y-4 pt-3 border-t border-[#E2E8F0] dark:border-[#334155] animate-in fade-in duration-200">
                    {/* Model Answer Box */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#7C3AED]/5 border border-[#7C3AED]/20 space-y-3">
                      <span className="text-[12px] font-bold uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
                        <Sparkle className="w-3.5 h-3.5" weight="fill" />
                        <span>النموذج المعتمد للإجابة:</span>
                      </span>
                      <FormattedAnswerView
                        text={
                          question.rubric?.modelAnswer ||
                          question.explanation?.correctReason ||
                          "الإجابة المعتمدة تركز على الخطوات والشرح المنهجي لمفاهيم السؤال."
                        }
                        colorScheme="purple"
                      />
                    </div>

                    {/* Rubric Criteria */}
                    {Array.isArray(question.rubric?.criteria) &&
                      (question.rubric.criteria as RubricCriterion[]).length > 0 && (
                        <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-2">
                          <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                            معايير توزيع الدرجات في الامتحان:
                          </span>
                          <div className="space-y-1.5">
                            {(question.rubric.criteria as RubricCriterion[]).map(
                              (c: RubricCriterion, cIdx: number) => (
                                <div
                                  key={cIdx}
                                  className="flex items-center justify-between text-[12px] sm:text-[13px] p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A]"
                                >
                                  <span className="font-content text-[#0F172A] dark:text-[#F8FAFC]">
                                    • {c.point}
                                  </span>
                                  <span className="font-bold font-mono text-[#7C3AED] shrink-0">
                                    {c.marks} {c.marks === 1 ? "درجة" : "درجات"}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Self Evaluation Scoring */}
                    <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[13px] font-bold text-[#0F172A] dark:text-white block">
                          قيّم إجابتك بنفسك:
                        </span>
                        <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                          كم تستحق إجابتك من أصل {maxScore} درجات؟
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: maxScore }, (_, i) => i + 1).map((score) => {
                          const isScoreSelected = selfScore === score;
                          return (
                            <button
                              key={score}
                              type="button"
                              onClick={() => onSelectScore(question.id, score)}
                              className={`w-10 h-10 rounded-xl text-[13px] font-bold font-mono transition-all flex items-center justify-center gap-1 ${
                                isScoreSelected
                                  ? "bg-[#7C3AED] text-white shadow-sm"
                                  : "bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#F8FAFC] hover:border-[#7C3AED]"
                              }`}
                            >
                              <Star
                                className="w-3.5 h-3.5"
                                weight={isScoreSelected ? "fill" : "regular"}
                              />
                              <span>{score}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selfScore !== undefined && (
                      <p className="text-[12px] font-bold text-[#7C3AED] text-center pt-1">
                        {selfScore === maxScore
                          ? "ممتاز! صياغة نموذجية متكاملة 🌟"
                          : selfScore >= maxScore / 2
                          ? "جيد جداً! راجع النقاط الناقصة في المعايير لتضمن الدرجة الكاملة 👍"
                          : "بداية طيبة! احفظ النقاط الأساسية من نموذج الإجابة وأعد المحاولة 🎯"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-[#64748B] rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
          الأسئلة المقالية قيد التجهيز...
        </div>
      )}
    </div>
  );
}
