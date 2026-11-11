"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, FileText, HelpCircle } from "lucide-react";
import type { ArabicWorkedQuestionItem } from "@/lib/arabic-curriculum";

interface ArabicReadingPassageViewerProps {
  title: string;
  passageSummary?: string;
  fullText?: string;
  origin?: string;
  workedQuestions?: ArabicWorkedQuestionItem[];
  children?: React.ReactNode;
}

export function ArabicReadingPassageViewer({
  title,
  passageSummary,
  fullText,
  origin,
  workedQuestions = [],
  children,
}: ArabicReadingPassageViewerProps) {
  const [mobileTab, setMobileTab] = useState<"passage" | "questions">("passage");
  const [revealedWorked, setRevealedWorked] = useState<Record<number, boolean>>({});

  return (
    <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F7F9FC] dark:bg-[#071737] overflow-hidden">
      {/* Mobile switcher preserving drafts across tabs via CSS visibility */}
      <div className="flex lg:hidden border-b border-[#E2E8F0] dark:border-[#1E3A6E] bg-white dark:bg-[#0D214D]">
        <button
          type="button"
          onClick={() => setMobileTab("passage")}
          className={`flex-1 py-3 px-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-colors min-h-[44px] ${
            mobileTab === "passage"
              ? "border-[#800B34] text-[#800B34] dark:border-[#E9AD32] dark:text-[#E9AD32]"
              : "border-transparent text-[#64748B]"
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>النص والتحليل</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("questions")}
          className={`flex-1 py-3 px-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-colors min-h-[44px] ${
            mobileTab === "questions"
              ? "border-[#800B34] text-[#800B34] dark:border-[#E9AD32] dark:text-[#E9AD32]"
              : "border-transparent text-[#64748B]"
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>الأسئلة والتدريب ({workedQuestions.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Passage Column */}
        <div
          className={`lg:col-span-5 p-4 sm:p-5 bg-white dark:bg-[#0D214D] lg:border-l border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3 min-w-0 ${
            mobileTab === "passage" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h4 className="text-sm font-black text-[#091B40] dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32] shrink-0" />
              <span>{title}</span>
            </h4>
            {origin && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#091B40] border border-[#BFDBFE] dark:bg-[#142747] dark:text-[#93C5FD] dark:border-[#1E3A6E]">
                {origin.includes("assessments") ? "الأداءات الرسمية" : "كتاب الوزارة"}
              </span>
            )}
          </div>

          {passageSummary && (
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#081633] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs sm:text-sm font-medium text-[#091B40] dark:text-[#E2E8F0] leading-[1.85]">
              {passageSummary}
            </div>
          )}

          {fullText && (
            <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/15 border border-amber-200/70 dark:border-amber-900/40 text-xs sm:text-sm font-medium text-[#091B40] dark:text-[#E2E8F0] leading-[1.9] whitespace-pre-wrap">
              {fullText}
            </div>
          )}
        </div>

        {/* Linked Questions Column */}
        <div
          className={`lg:col-span-7 p-4 sm:p-5 space-y-3 min-w-0 ${
            mobileTab === "questions" ? "block" : "hidden lg:block"
          }`}
        >
          {workedQuestions.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-black text-[#800B34] dark:text-[#E9AD32]">
                تدريب إرشادي على أسئلة النص المتحرر:
              </p>
              {workedQuestions.map((wq, idx) => {
                const isRevealed = Boolean(revealedWorked[idx]);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2"
                  >
                    <p className="text-xs sm:text-sm font-black text-[#091B40] dark:text-white leading-relaxed">
                      {idx + 1}. {wq.question}
                    </p>
                    {!isRevealed ? (
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedWorked((p) => ({ ...p, [idx]: true }))
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:bg-[#E9AD32]/15 dark:text-[#E9AD32] text-xs font-extrabold hover:bg-[#800B34]/20 min-h-[36px]"
                      >
                        اكشف خطوات الحل والإجابة
                      </button>
                    ) : (
                      <div className="space-y-2 pt-1.5 border-t border-dashed border-[#E2E8F0] dark:border-[#1E3A6E]">
                        <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>الإجابة: {wq.answer}</span>
                        </p>
                        {wq.steps && wq.steps.length > 0 && (
                          <ul className="space-y-1 text-[11px] font-medium text-[#475569] dark:text-[#CBD5E1] list-disc pr-4">
                            {wq.steps.map((st, sIdx) => (
                              <li key={sIdx}>{st}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
