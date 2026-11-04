"use client";

import React, { useState } from "react";
import { BidiStatement } from "./BidiStatement";
import { TranslationToggle } from "./TranslationToggle";
import { cn } from "@/lib/utils";

interface BilingualContentProps {
  englishText: string;
  arabicTranslation?: string | null;
  variant?: "statement" | "option" | "definition" | "rubric";
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  showToggle?: boolean;
  isControlled?: boolean;
  isTranslated?: boolean;
  onToggleTranslation?: () => void;
  badgeLabel?: string;
}

export function BilingualContent({
  englishText,
  arabicTranslation,
  variant = "statement",
  as = "div",
  className,
  showToggle = true,
  isControlled = false,
  isTranslated: controlledIsTranslated,
  onToggleTranslation,
  badgeLabel = "الترجمة العربية",
}: BilingualContentProps) {
  const [internalTranslated, setInternalTranslated] = useState(false);

  const hasTranslation = Boolean(arabicTranslation && arabicTranslation.trim().length > 0);
  const isExpanded = hasTranslation && (isControlled ? Boolean(controlledIsTranslated) : internalTranslated);

  const handleToggle = () => {
    if (isControlled && onToggleTranslation) {
      onToggleTranslation();
    } else {
      setInternalTranslated((prev) => !prev);
    }
  };

  // Determine if original text is predominantly English
  const hasArabicInOriginal = /[\u0600-\u06FF]/.test(englishText || "");
  const isEnglishOriginal = !hasArabicInOriginal;

  return (
    <div className={cn("space-y-2", className)}>
      {/* 1. Header or Inline English Content with Toggle */}
      <div className="flex items-start justify-between gap-3">
        <div
          dir={isEnglishOriginal ? "ltr" : "rtl"}
          className={cn(
            "flex-1",
            isEnglishOriginal ? "text-left font-sans" : "text-right font-content"
          )}
        >
          <BidiStatement as={as} text={englishText} />
        </div>

        {hasTranslation && showToggle && (
          <div className="shrink-0 pt-0.5">
            <TranslationToggle
              isTranslated={isExpanded}
              onToggle={handleToggle}
              size={variant === "option" ? "xs" : "sm"}
            />
          </div>
        )}
      </div>

      {/* 2. Collapsible Arabic Translation Container */}
      {isExpanded && arabicTranslation && (
        <div
          dir="rtl"
          className={cn(
            "text-right animate-in fade-in slide-in-from-top-1 duration-200 transition-all select-text",
            variant === "statement" &&
              "p-3.5 sm:p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] shadow-2xs space-y-1.5",
            variant === "option" &&
              "px-3 py-2 rounded-lg bg-black/4 dark:bg-white/5 border border-dashed border-[#E2E8F0] dark:border-[#334155] text-xs sm:text-[13px] font-medium text-[#475569] dark:text-slate-300",
            variant === "definition" &&
              "p-3.5 rounded-xl bg-[#059669]/5 dark:bg-[#059669]/10 border border-[#059669]/20 space-y-1.5",
            variant === "rubric" &&
              "p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 space-y-1.5"
          )}
        >
          {variant !== "option" && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded tracking-wide",
                  variant === "statement" && "bg-[#800020]/10 text-[#800020] dark:text-[#FB7185]",
                  variant === "definition" && "bg-[#059669]/15 text-[#059669] dark:text-[#34D399]",
                  variant === "rubric" && "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                )}
              >
                {badgeLabel}
              </span>
            </div>
          )}

          <p
            className={cn(
              "leading-relaxed font-content text-[#1E293B] dark:text-slate-200",
              variant === "statement" && "text-[13px] sm:text-[14px] font-medium",
              variant === "option" && "text-[12px] sm:text-[13px]",
              variant === "definition" && "text-[13px] sm:text-[14px]",
              variant === "rubric" && "text-[13px] sm:text-[14px]"
            )}
          >
            {arabicTranslation}
          </p>
        </div>
      )}
    </div>
  );
}

