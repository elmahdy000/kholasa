"use client";

import { X, Check } from "lucide-react";
import type { Attempt } from "./types";
import { Dialog } from "@/components/ui/Dialog";

interface AttemptInspectModalProps {
  isOpen: boolean;
  attempt?: Attempt;
  loadingDetails: boolean;
  detailsError?: string | null;
  savingGradeId: string | null;
  onClose: () => void;
  onGradeEssay: (
    answerId: string,
    score: number,
    isCorrect: boolean,
    attemptId: string
  ) => void;
}

export function AttemptInspectModal({
  isOpen,
  attempt,
  loadingDetails,
  detailsError,
  savingGradeId,
  onClose,
  onGradeEssay,
}: AttemptInspectModalProps) {
  if (!isOpen || !attempt) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} ariaLabel="تفاصيل محاولة الطالب" className="w-full max-w-3xl max-h-[90vh] rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-sm flex flex-col overflow-hidden text-right">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] dark:border-[#334155] shrink-0 bg-[#F8FAFC] dark:bg-[#1E293B]/50">
          <div>
            <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <span>تفاصيل محاولة: {attempt.user.name}</span>
              <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC]">
                {attempt.percentage}%
              </span>
            </h3>
            <span className="text-[13px] text-[#64748B] font-mono block mt-1">
              {attempt.exam?.title || attempt.title}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق تفاصيل المحاولة"
            className="p-1 rounded text-[#64748B] hover:text-[#64748B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content / Answers List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {detailsError ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{detailsError}</p> : loadingDetails ? (
            <div className="py-12 text-center text-[13px] text-[#64748B]">
              جاري تحميل الإجابات والتفسيرات الأكاديمية...
            </div>
          ) : attempt.answers && attempt.answers.length > 0 ? (
            attempt.answers.map((ans, idx) => {
              const q = ans.question;
              const isMCQ = q.type === "MCQ" || q.type === "TRUE_FALSE";
              const isEssay = q.type === "ESSAY";

              return (
                <div
                  key={ans.id}
                  className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/20 space-y-3"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[13px] font-mono text-[#64748B]">
                        سؤال {idx + 1} ({q.type})
                      </span>
                      <p className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                        {q.statement}
                      </p>
                    </div>

                    {ans.isCorrect === true ? (
                      <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#059669]/10 text-[#059669] font-bold shrink-0">
                        إجابة صحيحة
                      </span>
                    ) : ans.isCorrect === false ? (
                      <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#DC2626]/10 text-[#DC2626] font-bold shrink-0">
                        إجابة خاطئة
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#D97706]/10 text-[#D97706] font-bold shrink-0">
                        بانتظار التصحيح
                      </span>
                    )}
                  </div>

                  {/* MCQ Choices view */}
                  {isMCQ && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => {
                        const isSelected = ans.selectedOptionId === opt.id;
                        const isCorrectOpt = opt.isCorrect;

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded text-[13px] border flex items-center justify-between ${
                              isCorrectOpt
                                ? "border-[#059669]/60 bg-[#059669]/10 text-[#059669] font-semibold"
                                : isSelected
                                ? "border-[#DC2626]/60 bg-[#DC2626]/10 text-[#DC2626]"
                                : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]"
                            }`}
                          >
                            <span>{opt.text}</span>
                            {isCorrectOpt && (
                              <span className="text-[13px] font-mono">
                                الإجابة النموذجية
                              </span>
                            )}
                            {isSelected && !isCorrectOpt && (
                              <span className="text-[13px] font-mono">
                                اختيار الطالب
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Essay Question view & manual grading */}
                  {isEssay && (
                    <div className="space-y-3 pt-1">
                      {/* Student Answer */}
                      <div className="p-3 rounded bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
                        <span className="text-[13px] font-mono text-[#64748B] block mb-1">
                          إجابة الطالب المقالية:
                        </span>
                        <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-medium whitespace-pre-wrap">
                          {ans.essayText || "لم يقم الطالب بكتابة إجابة"}
                        </p>
                      </div>

                      {/* Model Answer from rubric */}
                      {q.rubric && (
                        <div className="p-3 rounded bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/50 dark:border-[#E11D48]/40 text-[13px]">
                          <span className="text-[13px] font-mono text-[#800020] block mb-1">
                            الإجابة النموذجية (معيار التصحيح):
                          </span>
                          <p className="text-[#0F172A] dark:text-[#F8FAFC]">
                            {q.rubric.modelAnswer}
                          </p>
                        </div>
                      )}

                      {/* Manual Grading Action Bar */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                        <span className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          تصحيح هذا السؤال:
                        </span>
                        <button
                          onClick={() =>
                            onGradeEssay(
                              ans.id,
                              q.rubric?.maxScore || 10,
                              true,
                              attempt.id
                            )
                          }
                          disabled={savingGradeId !== null || !attempt.isCompleted}
                          className="min-h-11 px-3 py-2 rounded text-[13px] font-semibold bg-[#059669] hover:bg-[#047857] text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>اعتماد إجابة صحيحة (درجة كاملة)</span>
                        </button>
                        <button
                          onClick={() =>
                            onGradeEssay(
                              ans.id,
                              0,
                              false,
                              attempt.id
                            )
                          }
                          disabled={savingGradeId !== null || !attempt.isCompleted}
                          className="min-h-11 px-3 py-2 rounded text-[13px] font-semibold bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>إجابة خاطئة (0 درجة)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Academic explanation if available */}
                  {q.explanation && (
                    <div className="text-[13px] text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC]/60 dark:bg-[#1E293B]/40 p-3 rounded border border-[#E2E8F0]/50 dark:border-[#334155]/50">
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                        المفهوم التعليمي: {q.explanation.concept}
                      </span>
                      <span>{q.explanation.correctReason}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-[13px] text-[#64748B]">
              لا توجد إجابات مسجلة لهذه المحاولة.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="h-11 px-4 rounded-md bg-[#334155] dark:bg-[#F8FAFC] text-white dark:text-[#1E293B] text-[13px] font-semibold"
          >
            إغلاق
          </button>
        </div>
    </Dialog>
  );
}
