"use client";

import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { ParsedQuestion } from "@/lib/question-parser";

interface QuestionsPreviewListProps {
  questions: ParsedQuestion[];
  selectedQuestionIds: Set<string>;
  isLanguageSchool: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  onCommit: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onToggleSelect: (id: string) => void;
  onUpdateQuestion: (updated: ParsedQuestion) => void;
  revalidateQuestion: (q: ParsedQuestion) => ParsedQuestion;
}

export function QuestionsPreviewList({
  questions,
  selectedQuestionIds,
  isLanguageSchool,
  isSubmitting,
  submitError,
  onCommit,
  onSelectAll,
  onDeselectAll,
  onToggleSelect,
  onUpdateQuestion,
  revalidateQuestion,
}: QuestionsPreviewListProps) {
  const readyToImportQuestions = questions.filter(
    (q) => q.isValid && selectedQuestionIds.has(q.id)
  );

  const validCount = questions.filter((q) => q.isValid).length;
  const invalidCount = questions.length - validCount;

  return (
    <div className="space-y-4 pt-2">
      {/* Summary Bar */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0]/90 dark:border-[#334155]/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#059669] text-white flex items-center justify-center text-[13px] font-bold shadow-sm">
                4
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <span>10. مراجعة وتعديل الأسئلة المستخرجة ({questions.length})</span>
                <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#FB7185]">
                  {isLanguageSchool ? "English LTR" : "عربي RTL"}
                </span>
              </h3>
            </div>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
              تأكد من صياغة كل سؤال وخياراته وإجابته النموذجية قبل تأكيد الحفظ التراكمي في البنك
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onCommit}
              disabled={readyToImportQuestions.length === 0 || isSubmitting}
              className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] disabled:opacity-50 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ التراكمي...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D97706]" />
                  <span>11. استيراد {readyToImportQuestions.length} سؤال معتمد</span>
                </>
              )}
            </button>
          </div>
        </div>

        {submitError && (
          <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Validation Counts and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-[12px] font-bold border border-[#059669]/20 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>جاهز للاستيراد: {validCount}</span>
            </div>

            {invalidCount > 0 && (
              <div className="px-3 py-1 rounded-full bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171] text-[12px] font-bold border border-[#DC2626]/20 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>يتطلب تدقيق: {invalidCount}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSelectAll}
              className="text-[12px] font-bold text-[#800020] hover:underline"
            >
              تحديد الكل ({questions.length})
            </button>
            <span className="text-[#94A3B8]">•</span>
            <button
              type="button"
              onClick={onDeselectAll}
              className="text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      </div>

      {/* Questions Cards List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isSelected = selectedQuestionIds.has(q.id);
          return (
            <div
              key={q.id}
              dir={isLanguageSchool ? "ltr" : "rtl"}
              className={`p-5 rounded-xl bg-white dark:bg-[#1E293B] border transition-all ${
                !q.isValid
                  ? "border-[#DC2626]/60 bg-[#DC2626]/5"
                  : isSelected
                  ? "border-[#800020]/40 shadow-sm"
                  : "border-[#E2E8F0] dark:border-[#334155] opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(q.id)}
                    className="w-4 h-4 rounded text-[#800020] focus:ring-[#800020]"
                  />
                  <span className="font-bold text-[13px] text-[#800020]">
                    #{idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] border border-[#E2E8F0] dark:border-[#334155]">
                    {q.type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#059669]/10 text-[#059669]">
                    {q.difficulty}
                  </span>
                </div>

                {!q.isValid && (
                  <span className="text-[11px] font-bold text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded">
                    {q.validationNotes.join(" • ")}
                  </span>
                )}
              </div>

              {/* Question Statement */}
              <div className="text-[14px] font-bold text-[#0F172A] dark:text-white mb-3">
                {isLanguageSchool ? (
                  q.statement
                ) : (
                  <BidiStatement text={q.statement} />
                )}
              </div>

              {/* Options or Model Answer */}
              {q.type !== "ESSAY" && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {q.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => {
                        const updatedOpts = q.options.map((o, oIdx) => ({
                          ...o,
                          isCorrect:
                            q.type === "TRUE_FALSE"
                              ? oIdx === optIdx
                              : oIdx === optIdx
                              ? !o.isCorrect
                              : o.isCorrect,
                        }));
                        const updatedQ = revalidateQuestion({ ...q, options: updatedOpts });
                        onUpdateQuestion(updatedQ);
                      }}
                      className={`p-3 rounded-xl border text-[13px] font-medium text-left flex items-center justify-between transition-all ${
                        opt.isCorrect
                          ? "bg-[#059669]/10 border-[#059669] text-[#059669] font-bold"
                          : "bg-[#F8FAFC] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white"
                      }`}
                    >
                      <span>{opt.text}</span>
                      {opt.isCorrect && <Check className="w-4 h-4 text-[#059669] shrink-0" />}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "ESSAY" && q.modelAnswer && (
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[12px] space-y-1 mb-3">
                  <span className="font-bold text-[#800020] block">
                    {isLanguageSchool ? "Model Answer:" : "الإجابة النموذجية:"}
                  </span>
                  <p className="text-[#64748B] dark:text-[#94A3B8]">{q.modelAnswer}</p>
                </div>
              )}

              {/* Explanation */}
              {q.correctReason && (
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2 pt-1 border-t border-[#E2E8F0]/60 dark:border-[#334155]/60">
                  <span className="font-bold text-[#800020]">
                    {isLanguageSchool ? "Explanation:" : "التفسير العلمي:"}
                  </span>
                  <span>{q.correctReason}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
