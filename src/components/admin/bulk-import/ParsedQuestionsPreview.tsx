"use client";

import { CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import type { ParsedQuestion } from "./types";

interface ParsedQuestionsPreviewProps {
  parsedQuestions: ParsedQuestion[];
  isSubmitting: boolean;
  submitError: string | null;
  onCommitImport: () => void;
}

export function ParsedQuestionsPreview({
  parsedQuestions,
  isSubmitting,
  submitError,
  onCommitImport,
}: ParsedQuestionsPreviewProps) {
  if (parsedQuestions.length === 0) return null;

  const validQuestions = parsedQuestions.filter((q) => q.isValid);
  const invalidQuestions = parsedQuestions.filter((q) => !q.isValid);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white">
            إجمالي الأسئلة المحللة: {parsedQuestions.length}
          </div>
          <div className="px-3 py-1 rounded-full bg-[#059669]/10 dark:bg-[#1E293B] text-[13px] font-bold text-[#059669] dark:text-[#34D399] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>جاهزة للاستيراد: {validQuestions.length}</span>
          </div>
          {invalidQuestions.length > 0 && (
            <div className="px-3 py-1 rounded-full bg-[#DC2626]/10 dark:bg-[#1E293B] text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>غير صالحة: {invalidQuestions.length}</span>
            </div>
          )}
        </div>

        {/* Import Confirmation Button */}
        <button
          onClick={onCommitImport}
          disabled={validQuestions.length === 0 || isSubmitting}
          className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] disabled:opacity-50 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري حفظ {validQuestions.length} سؤال...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span>تأكيد استيراد {validQuestions.length} سؤال الآن</span>
            </>
          )}
        </button>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#F87171] text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Questions Preview Cards */}
      <div className="space-y-3">
        {parsedQuestions.map((q, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border transition-all ${
              q.isValid
                ? "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155]"
                : "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#F87171]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-bold px-2 py-1 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC]">
                    سؤال #{idx + 1}
                  </span>
                  <span className="text-[13px] font-bold px-2 py-1 rounded-md bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020]">
                    {q.type === "MCQ"
                      ? "اختيار من متعدد"
                      : q.type === "TRUE_FALSE"
                      ? "صح/خطأ"
                      : "مقالي"}
                  </span>
                  <span className="text-[13px] font-bold px-2 py-1 rounded-md bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706]">
                    {q.difficulty === "EASY"
                      ? "سهل"
                      : q.difficulty === "MEDIUM"
                      ? "متوسط"
                      : "متقدم"}
                  </span>
                </div>

                <BidiStatement
                  as="h4"
                  text={q.statement}
                  className="text-sm font-bold text-[#0F172A] dark:text-white leading-relaxed"
                />

                {/* Options preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-xl text-[13px] flex items-center justify-between border ${
                        opt.isCorrect
                          ? "bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399] text-[#059669] dark:text-[#34D399] font-bold"
                          : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
                      }`}
                    >
                      <BidiStatement as="span" text={opt.text} />
                      {opt.isCorrect && (
                        <span className="text-[13px] bg-[#059669] text-white px-2 py-1 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>صحيح</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {q.concept && (
                  <div className="pt-2 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                    <span className="font-bold text-[#800020]">المفهوم: </span>
                    {q.concept} • {q.correctReason}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {q.isValid ? (
                  <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#34D399]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>سليم</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] bg-[#DC2626]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#F87171]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{q.error || "خطأ"}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
