"use client";

import { useState } from "react";
import { RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { fetchWithRetry } from "@/lib/network";

interface EssayReviewToggleButtonProps {
  questionId: string;
  initialMarked?: boolean;
  /** Controlled override when parent manages mistakes state (e.g. LessonViewer). */
  marked?: boolean;
  essayText?: string;
  isEnglish?: boolean;
  size?: "sm" | "md";
  onChange?: (marked: boolean) => void;
}

export function EssayReviewToggleButton({
  questionId,
  initialMarked = false,
  marked,
  essayText,
  isEnglish = false,
  size = "md",
  onChange,
}: EssayReviewToggleButtonProps) {
  const [internalMarked, setInternalMarked] = useState(initialMarked);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMarked = marked !== undefined ? marked : internalMarked;

  const handleToggle = async () => {
    if (isSaving) return;
    const nextMarked = !isMarked;

    setIsSaving(true);
    setErrorMsg(null);
    if (marked === undefined) {
      setInternalMarked(nextMarked);
    }

    try {
      const res = await fetchWithRetry(`/api/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          nextMarked
            ? {
                markForReview: true,
                ...(essayText !== undefined ? { essayText } : {}),
              }
            : {
                resolve: true,
                ...(essayText !== undefined ? { essayText } : {}),
              }
        ),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "تعذر تحديث حالة المراجعة");
      }

      onChange?.(nextMarked);
    } catch (err) {
      if (marked === undefined) {
        setInternalMarked(!nextMarked);
      }
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isEnglish
          ? "Failed to save review status"
          : "تعذر حفظ حالة المراجعة، حاول مرة أخرى"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const sizeClass =
    size === "sm"
      ? "min-h-[40px] px-3 py-1.5 text-xs"
      : "min-h-[44px] px-4 py-2 text-xs sm:text-[13px]";

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isSaving}
        aria-pressed={isMarked}
        className={`${sizeClass} rounded-lg font-bold inline-flex items-center justify-center gap-2 border transition-colors cursor-pointer disabled:opacity-60 ${
          isMarked
            ? "bg-[#800B34]/10 dark:bg-[#800B34]/25 border-[#800B34] dark:border-[#FB7185] text-[#800B34] dark:text-[#FB7185]"
            : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#091B40] dark:text-white hover:border-[#800B34] hover:text-[#800B34] dark:hover:border-[#FB7185] dark:hover:text-[#FB7185]"
        }`}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : isMarked ? (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        ) : (
          <RotateCcw className="w-4 h-4 shrink-0" />
        )}
        <span>
          {isMarked
            ? isEnglish
              ? "Saved in Mistakes for Review ✓"
              : "مضاف للمراجعة في «غلطاتي» ✓"
            : isEnglish
            ? "Review Again (Add to Mistakes)"
            : "عاوز أراجعه تاني (أضف لغلطاتي)"}
        </span>
      </button>

      {errorMsg && (
        <span className="text-[11px] font-semibold text-[#DC2626] dark:text-[#F87171]">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
