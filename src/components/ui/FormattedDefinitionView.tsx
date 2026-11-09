"use client";

import React, { useMemo } from "react";

export interface DefinitionPoint {
  badge: string;
  isBullet?: boolean;
  title?: string;
  body: string;
}

export interface ParsedDefinitionContent {
  intro?: string;
  type: "points" | "paragraphs" | "single";
  points?: DefinitionPoint[];
  paragraphs?: string[];
  singleText?: string;
}

/**
 * Intelligent parser that extracts points, lists, or multiple paragraphs from definition text.
 * Works seamlessly with Arabic and English educational definitions.
 */
export function parseDefinitionContent(
  rawText: string | null | undefined
): ParsedDefinitionContent {
  if (!rawText) {
    return { type: "single", singleText: "" };
  }

  // Clean invisible Unicode control characters
  const text = rawText
    .replace(/[\u200B-\u200F\uFEFF\u202A-\u202E]/g, "")
    .trim();

  if (!text) {
    return { type: "single", singleText: "" };
  }

  // 1. Check for explicit point markers (numbered or bulleted)
  // Matches: 1. 2. or 1- 2- or 1) 2) or (1) (2) or ١- ٢- or A. B. or a) b) or • - *
  // Uses leading whitespace offset instead of lookbehind for universal browser compatibility.
  const markerRegex =
    /(?:^|[\s\n\r]+)(?:(?:Step|Part|Point|Phase|المرحلة|الخطوة|النقطة)\s+)?(?:\(((?:[0-9]{1,2}|[٠-٩]{1,2}|[a-zA-Z]|[أ-ي]|[ivxIVX]{1,4}))\)|(?:[0-9]{1,2}|[٠-٩]{1,2})\s*[.\-):]|(?:[a-zA-Z]|[أ-ي])\s*[.\-)]|(?:[ivxIVX]{1,4})\s*[.\-)]|[•*⁃\–\—\-])\s+/gi;

  const rawMatches: { index: number; length: number; badge: string; isBullet: boolean }[] = [];
  let m: RegExpExecArray | null;

  while ((m = markerRegex.exec(text)) !== null) {
    const rawMatched = m[0].trim();
    const leadingSpace = m[0].length - m[0].trimStart().length;
    const actualIndex = m.index + leadingSpace;
    const actualLength = m[0].length - leadingSpace;
    const isBullet = /^[•*⁃\–\—\-]$/.test(rawMatched);
    const badge =
      m[1] ||
      rawMatched
        .replace(/^(?:Step|Part|Point|Phase|المرحلة|الخطوة|النقطة)\s+/i, "")
        .replace(/[\s.\-):()]/g, "") ||
      "•";

    rawMatches.push({
      index: actualIndex,
      length: actualLength,
      badge,
      isBullet,
    });
  }

  // Filter out false matches
  const validMatches: typeof rawMatches = [];
  for (let i = 0; i < rawMatches.length; i++) {
    const cur = rawMatches[i];
    const nextIdx = i + 1 < rawMatches.length ? rawMatches[i + 1].index : text.length;
    const sliceLen = nextIdx - (cur.index + cur.length);
    if (sliceLen >= 2) {
      validMatches.push(cur);
    }
  }

  // If 2 or more points were matched, parse them
  if (validMatches.length >= 2) {
    let intro: string | undefined = undefined;
    const firstMatch = validMatches[0];
    if (firstMatch.index > 0) {
      const candIntro = text.substring(0, firstMatch.index).trim();
      if (candIntro.length >= 3) {
        intro = candIntro;
      }
    }

    const points: DefinitionPoint[] = [];
    for (let i = 0; i < validMatches.length; i++) {
      const cur = validMatches[i];
      const start = cur.index + cur.length;
      const end = i + 1 < validMatches.length ? validMatches[i + 1].index : text.length;
      const pointRaw = text.substring(start, end).trim();

      if (pointRaw) {
        // Detect if point has a title prefix like "Client: ..." or "العميل: ..."
        const titleMatch = pointRaw.match(
          /^([^\n:\-–—]{2,50})(?:\s*:\s+|\s+[\-–—]\s+)([\s\S]*)$/
        );
        if (titleMatch) {
          points.push({
            badge: cur.badge,
            isBullet: cur.isBullet,
            title: titleMatch[1].trim() + ":",
            body: titleMatch[2].trim(),
          });
        } else {
          points.push({
            badge: cur.badge,
            isBullet: cur.isBullet,
            body: pointRaw,
          });
        }
      }
    }

    if (points.length >= 2) {
      return { intro, type: "points", points };
    }
  }

  // 2. Check for multiple paragraphs separated by line breaks
  const paragraphs = text
    .split(/[\n\r]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length >= 2) {
    // If lines look like short points (each starting with a dash or bullet)
    const allHaveDash = paragraphs.every((p) => /^[\-\*•\–\—]/.test(p));
    if (allHaveDash) {
      const points: DefinitionPoint[] = paragraphs.map((p, idx) => {
        const clean = p.replace(/^[\-\*•\–\—]\s*/, "").trim();
        const titleMatch = clean.match(/^([^\n:\-–—]{2,50})(?:\s*:\s+|\s+[\-–—]\s+)([\s\S]*)$/);
        return {
          badge: String(idx + 1),
          isBullet: true,
          title: titleMatch ? titleMatch[1].trim() + ":" : undefined,
          body: titleMatch ? titleMatch[2].trim() : clean,
        };
      });
      return { type: "points", points };
    }

    return { type: "paragraphs", paragraphs };
  }

  return { type: "single", singleText: text };
}

export interface FormattedDefinitionViewProps {
  text: string | null | undefined;
  variant?: "flashcard" | "card" | "translation";
  colorScheme?: "emerald" | "burgundy" | "slate";
  className?: string;
  forceDir?: "rtl" | "ltr";
}

export function FormattedDefinitionView({
  text,
  variant = "card",
  colorScheme = "emerald",
  className = "",
  forceDir,
}: FormattedDefinitionViewProps) {
  const parsed = useMemo(() => parseDefinitionContent(text), [text]);
  const isArabic = useMemo(() => /[\u0600-\u06FF]/.test(text || ""), [text]);
  const dir = forceDir || (isArabic ? "rtl" : "ltr");
  const isRtl = dir === "rtl";
  const alignClass = isRtl ? "text-right" : "text-left";
  const titleMargin = isRtl ? "ml-1.5" : "mr-1.5";

  if (!text || !text.trim()) {
    return null;
  }

  // Color configurations
  const theme = {
    emerald: {
      badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
      bullet: "bg-emerald-600 dark:bg-emerald-400",
      itemBg:
        variant === "flashcard"
          ? "bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40"
          : "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30",
      title: "text-emerald-800 dark:text-emerald-300 font-bold",
      body: "text-slate-800 dark:text-slate-100",
      intro: "text-emerald-800 dark:text-emerald-300 font-bold",
    },
    burgundy: {
      badge: "bg-[#800B34]/15 text-[#800B34] dark:text-[#FB7185] border border-[#800B34]/30",
      bullet: "bg-[#800B34] dark:bg-[#FB7185]",
      itemBg:
        variant === "flashcard"
          ? "bg-[#800B34]/5 dark:bg-[#800B34]/15 border border-[#800B34]/20 dark:border-[#800B34]/30"
          : "bg-[#800B34]/5 dark:bg-[#800B34]/10 border border-[#800B34]/15",
      title: "text-[#800B34] dark:text-[#FB7185] font-bold",
      body: "text-slate-800 dark:text-slate-100",
      intro: "text-[#800B34] dark:text-[#FB7185] font-bold",
    },
    slate: {
      badge: "bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600",
      bullet: "bg-slate-500",
      itemBg: "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700",
      title: "text-slate-900 dark:text-white font-bold",
      body: "text-slate-800 dark:text-slate-200",
      intro: "text-slate-700 dark:text-slate-300 font-bold",
    },
  }[colorScheme];

  // CASE 1: Structured Points / Numbered List
  if (parsed.type === "points" && parsed.points && parsed.points.length > 0) {
    return (
      <div className={`space-y-2.5 ${alignClass} ${className}`} dir={dir}>
        {parsed.intro && (
          <p className={`text-xs sm:text-sm font-bold leading-relaxed mb-1.5 ${theme.intro}`}>
            {parsed.intro}
          </p>
        )}

        <div className="space-y-2">
          {parsed.points.map((pt, idx) => (
            <div
              key={idx}
              className={`p-2.5 sm:p-3 rounded-xl ${theme.itemBg} shadow-2xs flex items-center sm:items-start gap-2.5 transition-all ${alignClass}`}
              dir={dir}
            >
              {/* Badge: Number or Bullet Dot */}
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg ${theme.badge} font-mono font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 sm:mt-0.5 shadow-2xs`}
              >
                {pt.badge}
              </div>

              {/* Point content */}
              <div className={`text-[13px] sm:text-[14px] leading-relaxed font-content ${theme.body} flex-1 min-w-0 break-words [overflow-wrap:anywhere]`}>
                {pt.title && (
                  <strong className={`font-bold ${titleMargin} ${theme.title}`}>
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

  // CASE 2: Multiple Paragraphs
  if (parsed.type === "paragraphs" && parsed.paragraphs && parsed.paragraphs.length > 0) {
    return (
      <div className={`space-y-3 ${alignClass} ${className}`} dir={dir}>
        {parsed.paragraphs.map((p, idx) => (
          <p
            key={idx}
            className={`text-[13px] sm:text-[15px] leading-relaxed font-content ${theme.body} break-words [overflow-wrap:anywhere] ${
              idx > 0
                ? "pt-2 border-t border-slate-200/60 dark:border-slate-700/60"
                : ""
            }`}
          >
            {p}
          </p>
        ))}
      </div>
    );
  }

  // CASE 3: Single Paragraph
  return (
    <p
      className={`text-[13px] sm:text-[15px] font-medium leading-relaxed font-content ${theme.body} ${alignClass} break-words [overflow-wrap:anywhere] ${className}`}
      dir={dir}
    >
      {parsed.singleText || text}
    </p>
  );
}

