"use client";

import { useState } from "react";
import { Share2, Printer, Check, Copy } from "lucide-react";

interface ExamResultActionsProps {
  examTitle: string;
  percentage: number;
  score: number;
  totalQuestions: number;
}

export function ExamResultActions({
  examTitle,
  percentage,
  score,
  totalQuestions,
}: ExamResultActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareTitle = `نتيجة ${examTitle} على منصة الخلاصة`;
    const shareText = `حققت ${Math.round(percentage)}% (${score}/${totalQuestions}) في ${examTitle} على منصة الخلاصة!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 transition-colors interactive-tap shadow-2xs"
        title="مشاركة النتيجة أو نسخ الرابط"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400">تم نسخ الرابط!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>مشاركة النتيجة</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 transition-colors interactive-tap shadow-2xs"
        title="طباعة التقرير أو حفظ كـ PDF"
      >
        <Printer className="w-3.5 h-3.5 text-slate-500" />
        <span className="hidden sm:inline">طباعة / حفظ PDF</span>
      </button>
    </div>
  );
}
