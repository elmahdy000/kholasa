"use client";

import React, { useMemo, useState } from "react";
import { Lightbulb, Sparkle, Translate } from "@phosphor-icons/react";
import { FormattedAnswerView } from "@/components/ui/FormattedAnswerView";

export interface QuestionExplanationBoxProps {
  concept?: string | null;
  correctReason?: string | null;
  correctReasonTranslation?: string | null;
  isTranslated?: boolean;
  onToggleTranslation?: () => void;
  className?: string;
  colorScheme?: "emerald" | "amber" | "burgundy" | "blue";
}

/**
 * Splits an explanation string that may contain both primary explanation
 * and an embedded translation (e.g. separated by <!-- translation -->, [TRANSLATION],
 * or heading markers like "الترجمة العربية للتفسير:").
 */
export function splitExplanation(text: string | null | undefined): {
  primary: string;
  translation?: string;
} {
  if (!text) return { primary: "" };
  const trimmed = text.trim();
  if (!trimmed) return { primary: "" };

  // 1. Explicit comment marker: <!-- translation -->
  const commentMarker = trimmed.search(/<!--\s*translation\s*-->/i);
  if (commentMarker !== -1) {
    const primary = trimmed.substring(0, commentMarker).trim();
    const translation = trimmed
      .substring(commentMarker)
      .replace(/<!--\s*translation\s*-->\s*/i, "")
      .trim();
    return { primary, translation: translation || undefined };
  }

  // 2. [TRANSLATION] marker
  const bracketMarker = trimmed.search(/\[TRANSLATION\]/i);
  if (bracketMarker !== -1) {
    const primary = trimmed.substring(0, bracketMarker).trim();
    const translation = trimmed
      .substring(bracketMarker)
      .replace(/\[TRANSLATION\]\s*/i, "")
      .trim();
    return { primary, translation: translation || undefined };
  }

  // 3. Header marker: newline or spacing followed by "الترجمة العربية للتفسير:" or "الترجمة العربية:" or similar
  const headerMatch = trimmed.match(
    /(?:[\r\n]+|^|\s{2,})(?:(?:الترجمة العربية للتفسير|ترجمة التفسير|الترجمة العربية|Arabic Translation|الترجمة)\s*[:：\-]?\s*)([\s\S]+)$/i
  );
  if (headerMatch && headerMatch.index !== undefined) {
    const rawPrimary = trimmed.substring(0, headerMatch.index).trim();
    // Clean any leading/trailing dot artifacts from BiDi inversion
    const primary = rawPrimary.replace(/^\.\s*/, "").trim();
    const translation = headerMatch[1].trim();
    return { primary, translation: translation || undefined };
  }

  // Clean any leading dot artifact on fallback
  return { primary: trimmed.replace(/^\.\s*/, "").trim() };
}

/**
 * Checks if a concept string is just generic filler rather than a genuine educational topic.
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

  if (reason && reason.trim().toLowerCase().startsWith(trimmed)) {
    return true;
  }

  return false;
}

export function QuestionExplanationBox({
  concept,
  correctReason,
  correctReasonTranslation,
  isTranslated,
  onToggleTranslation,
  className = "",
  colorScheme = "emerald",
}: QuestionExplanationBoxProps) {
  // Split explanation into primary and translation
  const { primary: parsedPrimary, translation: parsedTranslation } = useMemo(
    () => splitExplanation(correctReason),
    [correctReason]
  );

  const cleanPrimary = parsedPrimary.trim();
  const cleanTranslation = (correctReasonTranslation || parsedTranslation || "").trim();
  const cleanConcept = (concept || "").trim();

  // Internal translation toggle state when not controlled by parent
  const [internalTranslated, setInternalTranslated] = useState(false);
  const showTranslation = isTranslated !== undefined ? isTranslated : internalTranslated;

  const handleToggleTranslation = () => {
    if (onToggleTranslation) {
      onToggleTranslation();
    } else {
      setInternalTranslated((prev) => !prev);
    }
  };

  const isConceptMeaningful = useMemo(() => {
    return !isGenericConcept(cleanConcept, cleanPrimary);
  }, [cleanConcept, cleanPrimary]);

  // Direction and Language Detection for Primary Content
  const isEnglish = useMemo(() => {
    if (!cleanPrimary) return false;
    return !/[\u0600-\u06FF]/.test(cleanPrimary);
  }, [cleanPrimary]);

  const isConceptEnglish = useMemo(() => {
    if (!cleanConcept) return false;
    return !/[\u0600-\u06FF]/.test(cleanConcept);
  }, [cleanConcept]);

  if (!cleanPrimary && !cleanTranslation) {
    return null;
  }

  const boxDir = isEnglish ? "ltr" : "rtl";
  const boxAlign = isEnglish ? "text-left" : "text-right";

  return (
    <div
      dir={boxDir}
      className={`p-4 sm:p-5 rounded-2xl bg-emerald-500/[0.03] dark:bg-[#1E293B]/80 border border-emerald-500/20 dark:border-emerald-500/25 space-y-3 mt-3.5 ${boxAlign} ${
        isEnglish ? "font-sans" : "font-content"
      } transition-all animate-in fade-in duration-200 shadow-xs ${className}`}
    >
      {/* Header Bar */}
      <div
        dir={boxDir}
        className={`flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-emerald-500/10 dark:border-emerald-500/15 ${boxAlign}`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 fill-current" weight="fill" />
          </div>
          <span className="text-[13px] sm:text-sm font-bold text-slate-800 dark:text-slate-100">
            {isEnglish ? "Explanation" : "تفسير الإجابة"}
          </span>

          {/* Quick translation toggle if translation is available */}
          {cleanTranslation && (
            <button
              type="button"
              onClick={handleToggleTranslation}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                showTranslation
                  ? "bg-sky-500 text-white shadow-xs"
                  : "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40"
              }`}
              title={showTranslation ? "إخفاء الترجمة" : "عرض ترجمة التفسير"}
            >
              <Translate className="w-3.5 h-3.5" />
              <span>{showTranslation ? "إخفاء الترجمة" : "ترجمة التفسير"}</span>
            </button>
          )}
        </div>

        {/* Meaningful concept badge (only rendered if it's a real academic concept) */}
        {isConceptMeaningful && (
          <div
            dir={isConceptEnglish ? "ltr" : "rtl"}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
          >
            <Sparkle className="w-3 h-3 text-emerald-500 shrink-0" weight="fill" />
            <span className="inline-flex items-center gap-1 font-mono">
              <span className="font-bold">{isConceptEnglish ? "Concept:" : "المفهوم:"}</span>
              <span dir={isConceptEnglish ? "ltr" : "rtl"}>{cleanConcept}</span>
            </span>
          </div>
        )}
      </div>

      {/* Primary explanation text */}
      {cleanPrimary && (
        <div
          dir={boxDir}
          className={`text-[13px] sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed ${
            isEnglish ? "font-sans" : "font-content"
          } break-words whitespace-pre-wrap`}
        >
          <FormattedAnswerView
            text={cleanPrimary}
            colorScheme={colorScheme}
            className="text-slate-800 dark:text-slate-200"
          />
        </div>
      )}

      {/* Collapsible Arabic Translation for Explanation - Only shown on student demand */}
      {showTranslation && cleanTranslation && (
        <div
          dir="rtl"
          className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-right animate-in fade-in slide-in-from-top-1 duration-200 space-y-1.5"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
            <Translate className="w-3.5 h-3.5" />
            <span>الترجمة العربية للتفسير:</span>
          </div>
          <FormattedAnswerView
            text={cleanTranslation}
            colorScheme={colorScheme}
            className="text-slate-800 dark:text-slate-200 font-content"
          />
        </div>
      )}
    </div>
  );
}
