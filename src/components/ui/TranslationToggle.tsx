"use client";

import React from "react";
import { Translate } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface TranslationToggleProps {
  isTranslated: boolean;
  onToggle: (e?: React.MouseEvent) => void;
  className?: string;
  size?: "xs" | "sm" | "md";
  title?: string;
}

export function TranslationToggle({
  isTranslated,
  onToggle,
  className,
  size = "sm",
  title,
}: TranslationToggleProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(e);
  };

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[11px] gap-1",
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-2",
  }[size];

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={isTranslated}
      aria-label={isTranslated ? "إخفاء الترجمة العربية" : "عرض الترجمة العربية"}
      title={title || (isTranslated ? "إخفاء الترجمة العربية" : "عرض الترجمة العربية للطلاب")}
      className={cn(
        "inline-flex items-center justify-center font-bold rounded-lg border transition-all cursor-pointer select-none",
        sizeClasses,
        isTranslated
          ? "bg-[#800B34]/10 dark:bg-[#800B34]/25 text-[#800B34] dark:text-[#FB7185] border-[#800B34]/30 shadow-xs"
          : "bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#64748B] hover:text-[#800B34] dark:text-[#94A3B8] dark:hover:text-white border-[#E2E8F0] dark:border-[#334155]",
        className
      )}
    >
      <Translate className={cn(iconSizes, isTranslated ? "text-[#800B34] dark:text-[#FB7185]" : "text-[#64748B] dark:text-[#94A3B8]")} weight="bold" />
      <span>{isTranslated ? "إخفاء الترجمة" : "ترجمة"}</span>
    </button>
  );
}

