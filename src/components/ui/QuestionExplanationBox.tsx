"use client";

import React, { useMemo } from "react";
import { Lightbulb, Sparkle } from "@phosphor-icons/react";
import { FormattedAnswerView } from "@/components/ui/FormattedAnswerView";

export interface QuestionExplanationBoxProps {
  concept?: string | null;
  correctReason?: string | null;
  className?: string;
  colorScheme?: "emerald" | "amber" | "burgundy" | "blue";
}

/**
 * Checks if a concept string is just generic filler (e.g. "تفسير الحل", "تفسير", "شرح")
 * rather than a genuine educational topic / curriculum concept.
 */
function isGenericConcept(concept?: string | null, reason?: string | null): boolean {
  if (!concept) return true;
  const trimmed = concept.trim().toLowerCase();
  if (trimmed.length < 2) return true;

  const genericPatterns = [
    "تفسير الحل",
    "تفسير",
    "التفسير",
    "شرح",
    "الشرح",
    "شرح الحل",
    "فكرة الحل",
    "الفكرة",
    "الفكرة الأساسية",
    "حل",
    "الحل",
    "إجابة",
    "الاجابة",
    "الإجابة",
    "نموذج الإجابة",
    "الجواب",
    "سبب الإجابة",
    "عام",
    "سؤال",
    "السؤال",
    "explanation",
    "reason",
    "concept",
    "answer",
    "solution",
  ];

  if (genericPatterns.includes(trimmed)) return true;

  // If concept is merely repeating the first few words of the reason
  if (reason && reason.trim().toLowerCase().startsWith(trimmed)) {
    return true;
  }

  return false;
}

export function QuestionExplanationBox({
  concept,
  correctReason,
  className = "",
  colorScheme = "emerald",
}: QuestionExplanationBoxProps) {
  const cleanReason = (correctReason || "").trim();
  const cleanConcept = (concept || "").trim();

  const isConceptMeaningful = useMemo(() => {
    return !isGenericConcept(cleanConcept, cleanReason);
  }, [cleanConcept, cleanReason]);

  if (!cleanReason) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className={`p-4 sm:p-5 rounded-2xl bg-emerald-500/[0.03] dark:bg-[#1E293B]/80 border border-emerald-500/20 dark:border-emerald-500/25 space-y-3 mt-3.5 text-right font-sans transition-all animate-in fade-in duration-200 shadow-xs ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-emerald-500/10 dark:border-emerald-500/15">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 fill-current" weight="fill" />
          </div>
          <span className="text-[13px] sm:text-sm font-bold text-slate-800 dark:text-slate-100">
            تفسير الإجابة
          </span>
        </div>

        {/* Meaningful concept badge (only rendered if it's a real academic concept) */}
        {isConceptMeaningful && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkle className="w-3 h-3 text-emerald-500" weight="fill" />
            <span>المفهوم: {cleanConcept}</span>
          </div>
        )}
      </div>

      {/* Full explanation text without any truncation or clipping */}
      <div className="text-[13px] sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-content break-words whitespace-pre-wrap">
        <FormattedAnswerView
          text={cleanReason}
          colorScheme={colorScheme}
          className="text-slate-800 dark:text-slate-200"
        />
      </div>
    </div>
  );
}
