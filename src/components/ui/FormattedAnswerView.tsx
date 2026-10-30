"use client";

import React, { useMemo } from "react";

export interface FormattedPoint {
  badge: string;
  title?: string;
  body: string;
}

/**
 * Extracts structured points from raw educational answer text.
 * Supports:
 * - Numbered lists: 1. 2. 3. or 1- 2- or 1) or (1)
 * - Arabic digits: ١. ٢. ٣.
 * - Arabic letters: أ) ب) ج)
 * - Bullet characters: •, -, *, ⁃
 * - Multi-line separated paragraphs
 */
export function extractAnswerPoints(rawText: string | null | undefined): {
  intro?: string;
  points: FormattedPoint[];
} | null {
  if (!rawText) return null;
  const text = rawText.trim();
  if (!text || text.length < 5) return null;

  // 1. Check for numbered or bullet markers (either on newlines or inline like " 2. ")
  const markerRegex =
    /(?:^|[\n\r]+|(?<=\s))(?:\(([0-9]{1,2}|[٠-٩]{1,2})\)|([0-9]{1,2}|[٠-٩]{1,2})[.\-):]|([أ-يA-Za-z])[.\-)]|[•*⁃\-])\s+/g;

  const matches: { index: number; length: number; badge: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = markerRegex.exec(text)) !== null) {
    const badge = m[1] || m[2] || m[3] || "•";
    matches.push({
      index: m.index,
      length: m[0].length,
      badge,
    });
  }

  // If at least 2 structured points were matched
  if (matches.length >= 2) {
    let intro: string | undefined = undefined;
    const firstMatch = matches[0];
    if (firstMatch.index > 0) {
      const candidateIntro = text.substring(0, firstMatch.index).trim();
      if (candidateIntro.length >= 3) {
        intro = candidateIntro;
      }
    }

    const points: FormattedPoint[] = [];
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const start = current.index + current.length;
      const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const fullPointText = text.substring(start, end).trim();

      if (fullPointText) {
        // Check if point has a title prefix e.g. "القيادة الذاتية: تستخدم..."
        const titleMatch = fullPointText.match(/^([^\n:]{2,40}):\s+([\s\S]*)$/);
        if (titleMatch) {
          points.push({
            badge: current.badge,
            title: titleMatch[1].trim() + ":",
            body: titleMatch[2].trim(),
          });
        } else {
          points.push({
            badge: current.badge,
            body: fullPointText,
          });
        }
      }
    }

    if (points.length >= 2) {
      return { intro, points };
    }
  }

  // 2. Check if the text is split across multiple separate lines
  const lines = text
    .split(/[\n\r]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length >= 2) {
    const points: FormattedPoint[] = [];
    let intro: string | undefined = undefined;
    let startIdx = 0;

    // If first line ends with a colon, treat it as intro (e.g. "المراحل الخمس لتطور الحاسوب:")
    if (lines[0].endsWith(":") && lines.length >= 3) {
      intro = lines[0];
      startIdx = 1;
    }

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      // Clean leading digit or bullet if any
      const cleaned = line
        .replace(
          /^(?:\([0-9٠-٩]+\)|[0-9٠-٩]+[.\-):]|[أ-يA-Za-z][.\-)]|[•*⁃\-])\s*/,
          ""
        )
        .trim();

      const titleMatch = cleaned.match(/^([^\n:]{2,40}):\s+([\s\S]*)$/);
      if (titleMatch) {
        points.push({
          badge: String(points.length + 1),
          title: titleMatch[1].trim() + ":",
          body: titleMatch[2].trim(),
        });
      } else {
        points.push({
          badge: String(points.length + 1),
          body: cleaned,
        });
      }
    }

    if (points.length >= 2) {
      return { intro, points };
    }
  }

  return null;
}

export interface FormattedAnswerViewProps {
  text: string | null | undefined;
  colorScheme?: "purple" | "burgundy" | "blue" | "emerald" | "amber";
  emptyFallback?: string;
  className?: string;
}

const colorStyles = {
  purple: {
    cardBg: "bg-white dark:bg-[#1E293B]",
    border: "border-[#7C3AED]/20 dark:border-[#7C3AED]/30",
    badgeBg: "bg-[#7C3AED]/10 dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA]",
    title: "text-[#7C3AED] dark:text-[#C4B5FD]",
    body: "text-[#0F172A] dark:text-[#F8FAFC]",
    intro: "text-[#7C3AED] dark:text-[#A78BFA]",
  },
  burgundy: {
    cardBg: "bg-white dark:bg-[#1E293B]",
    border: "border-[#800020]/20 dark:border-[#E11D48]/30",
    badgeBg: "bg-[#800020]/10 dark:bg-[#E11D48]/20 text-[#800020] dark:text-[#FB7185]",
    title: "text-[#800020] dark:text-[#FDA4AF]",
    body: "text-[#0F172A] dark:text-[#F8FAFC]",
    intro: "text-[#800020] dark:text-[#FB7185]",
  },
  blue: {
    cardBg: "bg-white dark:bg-[#1E293B]",
    border: "border-blue-200 dark:border-blue-800",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    title: "text-blue-700 dark:text-blue-300",
    body: "text-slate-900 dark:text-white",
    intro: "text-blue-600 dark:text-blue-400",
  },
  emerald: {
    cardBg: "bg-white dark:bg-[#1E293B]",
    border: "border-emerald-200 dark:border-emerald-800",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-700 dark:text-emerald-300",
    body: "text-slate-900 dark:text-white",
    intro: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    cardBg: "bg-white dark:bg-[#1E293B]",
    border: "border-amber-200 dark:border-amber-800",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
    title: "text-amber-800 dark:text-amber-300",
    body: "text-slate-900 dark:text-white",
    intro: "text-amber-700 dark:text-amber-400",
  },
};

export function FormattedAnswerView({
  text,
  colorScheme = "purple",
  emptyFallback = "الإجابة المعتمدة تركز على الخطوات والشرح المنهجي لمفاهيم السؤال.",
  className = "",
}: FormattedAnswerViewProps) {
  const parsed = useMemo(() => extractAnswerPoints(text), [text]);
  const styles = colorStyles[colorScheme] || colorStyles.purple;

  if (!text || !text.trim()) {
    return (
      <p className={`text-[13px] sm:text-sm font-content leading-relaxed ${styles.body} ${className}`}>
        {emptyFallback}
      </p>
    );
  }

  // If points were detected, render them in a clean, vertical points list
  if (parsed && parsed.points.length > 0) {
    return (
      <div className={`space-y-2.5 ${className}`} dir="rtl">
        {parsed.intro && (
          <p className={`text-[13px] sm:text-sm font-bold font-content leading-relaxed ${styles.intro}`}>
            {parsed.intro}
          </p>
        )}

        <div className="space-y-2">
          {parsed.points.map((pt, idx) => (
            <div
              key={idx}
              className={`p-3 sm:p-3.5 rounded-xl ${styles.cardBg} border ${styles.border} shadow-2xs flex items-start gap-3 transition-all`}
            >
              <div
                className={`w-6 h-6 rounded-lg ${styles.badgeBg} font-bold text-xs flex items-center justify-center shrink-0 mt-0.5`}
              >
                {pt.badge}
              </div>
              <div className={`text-[13px] sm:text-sm leading-relaxed font-content ${styles.body} flex-1`}>
                {pt.title && (
                  <strong className={`font-bold ml-1.5 ${styles.title}`}>
                    {pt.title}
                  </strong>
                )}
                <span>{pt.body}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single paragraph fallback with proper line breaks
  return (
    <p
      className={`text-[13px] sm:text-sm leading-relaxed font-content font-medium whitespace-pre-wrap break-words ${styles.body} ${className}`}
      dir="rtl"
    >
      {text}
    </p>
  );
}
