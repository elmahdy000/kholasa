"use client";

import {
  Lightbulb,
  WarningCircle,
  XCircle,
  CheckCircle,
  Check,
} from "@phosphor-icons/react";
import {
  LessonSummary,
  Formula,
  Comparison,
  Mistake,
  ChecklistItem,
} from "../types";

interface LessonSummarySectionProps {
  summary?: LessonSummary | null;
  keyConcepts: string[];
  formulas: Formula[];
  comparisons: Comparison[];
  examTips: string[];
  commonMistakes: Mistake[];
  checklist: ChecklistItem[];
  onToggleChecklistItem: (index: number) => void;
}

export function LessonSummarySection({
  summary,
  keyConcepts,
  formulas,
  comparisons,
  examTips,
  commonMistakes,
  checklist,
  onToggleChecklistItem,
}: LessonSummarySectionProps) {
  return (
    <div id="section-summary" className="space-y-6">
      {/* Section Header */}
      <div className="p-6 rounded-2xl bg-[#D97706]/10 border border-[#D97706]/25 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#D97706] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Lightbulb className="w-6 h-6" weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706] bg-[#D97706]/15 px-2 py-0.5 rounded-md">
                المحطة الأولى
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                1. كبسولة الزتونة المركزة
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              أهم المفاهيم، القوانين، المقارنات، والتنبيهات الامتحانية الحاسمة في كبسولة سريعة
            </p>
          </div>
        </div>
      </div>

      {summary ? (
        <>
          {/* Key Concepts Grid */}
          {keyConcepts.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
              <h3 className="text-sm font-bold text-[#D97706] flex items-center gap-2">
                <Lightbulb className="w-4 h-4" weight="fill" />
                <span>أهم المفاهيم الأساسية المستخلصة من الدرس</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {keyConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#D97706]/5 border border-[#D97706]/15 text-[13px] sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-start gap-3 font-content"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#D97706] text-white flex items-center justify-center text-[12px] shrink-0 font-bold">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{concept}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas & Code Snippets */}
          {formulas.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <span className="font-mono text-base font-bold text-[#800020]">#</span>
                <span>القوانين والمعادلات الأساسية</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formulas.map((formula, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0F172A] text-white space-y-2 dir-ltr text-left border border-[#334155]"
                  >
                    <span className="text-[12px] font-bold text-[#94A3B8] block uppercase tracking-wider">
                      {formula.title}
                    </span>
                    <code className="text-sm font-mono text-[#059669] block font-semibold">
                      {formula.code}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparisons Table */}
          {comparisons.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
              <h3 className="text-sm font-bold text-[#800020] dark:text-[#FB7185] flex items-center gap-2">
                <span className="text-base">⇄</span>
                <span>المقارنات الهامة التي تكرر في الامتحانات</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] sm:text-sm text-right font-content">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-[#334155]">
                      <th className="py-2.5 px-3 font-bold text-[#64748B]">وجه المقارنة</th>
                      <th className="py-2.5 px-3 font-bold text-[#800020] dark:text-[#FB7185]">العنصر الأول</th>
                      <th className="py-2.5 px-3 font-bold text-[#059669]">العنصر الثاني</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((comp, idx) => (
                      <tr key={idx} className="border-b border-[#E2E8F0]/50 dark:border-[#334155]/50 last:border-0">
                        <td className="py-3 px-3 font-bold text-[#0F172A] dark:text-white">{comp.aspect}</td>
                        <td className="py-3 px-3 text-[#64748B] dark:text-[#F8FAFC]">{comp.first}</td>
                        <td className="py-3 px-3 text-[#64748B] dark:text-[#F8FAFC]">{comp.second}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Exam Tips */}
          {examTips.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#D97706]/5 border border-[#D97706]/20 space-y-4">
              <h3 className="text-sm font-bold text-[#D97706] flex items-center gap-2">
                <WarningCircle className="w-4 h-4 text-[#D97706]" weight="fill" />
                <span>تنبيهات وتكات امتحانية هامة</span>
              </h3>
              <ul className="space-y-2.5">
                {examTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[13px] sm:text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] font-content">
                    <span className="text-[#D97706] shrink-0 mt-1 font-bold">•</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {commonMistakes.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#DC2626]/5 border border-[#DC2626]/20 space-y-4">
              <h3 className="text-sm font-bold text-[#DC2626] flex items-center gap-2">
                <XCircle className="w-4 h-4 text-[#DC2626]" weight="fill" />
                <span>أخطاء شائعة يقع فيها الطلاب في الامتحان</span>
              </h3>
              <div className="space-y-3">
                {commonMistakes.map((mistake, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#DC2626]/15 font-content space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[#DC2626] font-bold text-[13px] shrink-0 mt-0.5">خطأ:</span>
                      <span className="text-[13px] text-[#DC2626] line-through leading-relaxed">{mistake.mistake}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#059669] font-bold text-[13px] shrink-0 mt-0.5">صح:</span>
                      <span className="text-[13px] text-[#059669] font-medium leading-relaxed">{mistake.correction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Checklist */}
          {checklist.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
              <h3 className="text-sm font-bold text-[#059669] flex items-center gap-2">
                <CheckCircle className="w-4 h-4" weight="bold" />
                <span>قائمة مراجعة إتقان الدرس السريعة</span>
              </h3>
              <div className="space-y-2">
                {checklist.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onToggleChecklistItem(idx)}
                    className={`w-full p-3 rounded-xl border text-right flex items-center gap-3 transition-colors text-[13px] sm:text-sm font-medium font-content ${
                      item.completed
                        ? "bg-[#059669]/10 border-[#059669]/30 text-[#059669]"
                        : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#059669]/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        item.completed
                          ? "bg-[#059669] border-[#059669] text-white"
                          : "border-[#E2E8F0] dark:border-[#334155]"
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5" weight="bold" />}
                    </div>
                    <span className={item.completed ? "line-through opacity-70" : ""}>
                      {item.task}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-[#64748B] rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
          كبسولة الزتونة قيد التجهيز...
        </div>
      )}
    </div>
  );
}
