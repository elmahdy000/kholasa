"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Scale, Sparkles } from "lucide-react";
import type {
  ArabicGrammarCaseRow,
  ArabicWorkedExampleItem,
} from "@/lib/arabic-curriculum";

interface ArabicGrammarRuleProps {
  title?: string;
  conditions: string[];
}

export function ArabicGrammarRuleBlock({
  title = "شروط عمل القاعدة النحوية",
  conditions,
}: ArabicGrammarRuleProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
      <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0" />
        <span>{title}</span>
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {conditions.map((cond, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 dark:bg-[#0D214D] border border-amber-200/70 dark:border-amber-900/40 text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-white"
          >
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 tabular-nums">
              {idx + 1}
            </span>
            <span className="break-words">{cond}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ArabicGrammarTableProps {
  title?: string;
  rows: ArabicGrammarCaseRow[];
}

export function ArabicGrammarTableBlock({
  title = "جدول الإعراب التفصيلي",
  rows,
}: ArabicGrammarTableProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
      <h4 className="text-xs sm:text-sm font-black text-[#091B40] dark:text-white flex items-center gap-2">
        <Scale className="w-4 h-4 text-[#1E40AF] dark:text-[#60A5FA] shrink-0" />
        <span>{title}</span>
      </h4>

      {/* Responsive stacked layout on narrow mobile (<sm) and clean table on >=sm */}
      <div className="grid grid-cols-1 sm:hidden gap-2.5">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#091B40] text-white text-xs font-black">
                {row.case}
              </span>
              <span className="text-xs font-black text-[#800B34] dark:text-[#E9AD32]">
                العلامة: {row.mark}
              </span>
            </div>
            <p className="text-sm font-black text-[#091B40] dark:text-white">
              المثال: {row.example}
            </p>
            {row.note && (
              <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                {row.note}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="hidden sm:block overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-white dark:bg-[#0D214D]">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#091B40] text-white text-xs font-black">
              <th className="py-2.5 px-4">الحالة الإعرابية</th>
              <th className="py-2.5 px-4">علامة الإعراب</th>
              <th className="py-2.5 px-4">مثال تطبيقي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E3A6E] text-xs sm:text-[13px]">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#F8FAFC] dark:hover:bg-[#132C60]/50">
                <td className="py-2.5 px-4 font-black text-[#091B40] dark:text-white">
                  {row.case}
                </td>
                <td className="py-2.5 px-4 font-black text-[#800B34] dark:text-[#E9AD32]">
                  {row.mark}
                </td>
                <td className="py-2.5 px-4 font-extrabold text-[#1E40AF] dark:text-[#93C5FD]">
                  {row.example}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ArabicWorkedExamplesProps {
  examples: ArabicWorkedExampleItem[];
}

export function ArabicWorkedExamplesBlock({ examples }: ArabicWorkedExamplesProps) {
  const [openIdx, setOpenIdx] = useState<Record<number, boolean>>({ 0: true });

  const parseFourPartSegments = (answer: string) =>
    answer
      .split(/[؛;]/)
      .map((s) => s.trim())
      .filter(Boolean);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
      <h4 className="text-xs sm:text-sm font-black text-[#091B40] dark:text-white flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32] shrink-0" />
        <span>نماذج إعرابية محلولة خطوة بخطوة</span>
      </h4>

      <div className="space-y-2.5">
        {examples.map((ex, idx) => {
          const isOpen = Boolean(openIdx[idx]);
          const parts = parseFourPartSegments(ex.answer);
          return (
            <div
              key={idx}
              className="rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIdx((p) => ({ ...p, [idx]: !p[idx] }))}
                className="w-full px-4 py-3 text-right flex items-center justify-between gap-3 hover:bg-[#F8FAFC] dark:hover:bg-[#132C60]/40 min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-[#800B34] text-white text-[11px] font-black flex items-center justify-center shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#091B40] dark:text-white break-words">
                    {ex.sentence}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-[#1E40AF] dark:text-[#93C5FD] flex items-center gap-1 shrink-0">
                  <span>{isOpen ? "إخفاء الإعراب" : "اعرض الإعراب"}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-3.5 pt-2 border-t border-dashed border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2 bg-emerald-50/40 dark:bg-emerald-950/15">
                  <p className="text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                    التحليل الإعرابي:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parts.map((part, pIdx) => {
                      const [word, ...rest] = part.split(":");
                      return (
                        <div
                          key={pIdx}
                          className="p-2.5 rounded-lg bg-white dark:bg-[#081633] border border-emerald-200 dark:border-emerald-900/50 text-xs font-bold leading-relaxed"
                        >
                          {rest.length > 0 ? (
                            <>
                              <span className="text-[#800B34] dark:text-[#E9AD32] font-black ml-1.5">
                                {word.trim()}:
                              </span>
                              <span className="text-[#091B40] dark:text-white">
                                {rest.join(":").trim()}
                              </span>
                            </>
                          ) : (
                            <span className="text-[#091B40] dark:text-white">{part}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
