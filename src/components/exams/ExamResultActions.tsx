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
        className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2 transition-colors interactive-tap "
        title="مشاركة النتيجة أو نسخ الرابط"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" />
            <span className="text-[#059669] dark:text-[#34D399]">تم نسخ الرابط!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-[#800020]" />
            <span>مشاركة النتيجة</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2 transition-colors interactive-tap "
        title="طباعة التقرير أو حفظ كـ PDF"
      >
        <Printer className="w-3.5 h-3.5 text-[#64748B]" />
        <span className="hidden sm:inline">طباعة / حفظ PDF</span>
      </button>
    </div>
  );
}
