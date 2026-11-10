"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  Upload,
  X,
} from "lucide-react";
import { getCleanStudentName } from "@/lib/utils";
import { WhatsAppSupportLinks } from "@/components/ui/WhatsAppSupportLinks";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle?: string;
  unitTitle?: string;
  user?: {
    name?: string | null;
    loginCode?: string | null;
    phone?: string | null;
  } | null;
}

export function PaywallModal({
  isOpen,
  onClose,
  lessonTitle,
  unitTitle,
  user,
}: PaywallModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Official Payment Numbers
  const instapayNumber = "01025131212";
  const vodafoneCash1 = "01025131212";
  const vodafoneCash2 = "01066711545";

  if (!isOpen) return null;

  const handleCopy = (num: string, key: string) => {
    navigator.clipboard.writeText(num);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const studentDisplayName = getCleanStudentName(user?.name) || "طالب المنصة";
  const whatsappMessage = `مرحباً بك يا مستر! 🌟\nأنا الطالب: *${studentDisplayName}*\nكود المنصة: *${user?.loginCode || "—"}*\nأريد تفعيل اشتراك المنصة الشهري (200 جنيه) لفتح جميع الدروس.`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تفعيل الاشتراك لفتح كل الدروس"
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-2xl p-5 sm:p-7 text-right font-sans space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Brand Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#800B34]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق النافذة"
          className="absolute top-4 left-4 p-2 rounded-xl text-[#536681] hover:text-[#091B40] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF6F7] dark:bg-[#071737] text-[#800B34] dark:text-[#E9AD32] flex items-center justify-center border border-[#800B34]/20 dark:border-[#E9AD32]/30 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#EAF2FF] dark:bg-[#112F66] text-[#091B40] dark:text-[#EAF2FF] border border-[#C5DCFA] dark:border-[#1E4D94]">
            <Sparkles className="w-3.5 h-3.5 text-[#E9AD32]" />
            <span>محتوى مخصص للمشتركين</span>
          </span>

          <h2 className="text-lg sm:text-xl font-black text-[#091B40] dark:text-white leading-tight">
            تفعيل الاشتراك الشهري لفتح باقي المنهج
          </h2>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#FAF6F7] dark:bg-[#071737] border border-[#800B34]/20 dark:border-[#E9AD32]/30 text-xs font-bold text-[#800B34] dark:text-[#E9AD32]">
            <span>قيمة الاشتراك:</span>
            <span className="font-black font-mono text-sm">200 جنيه / شهرياً</span>
            <span className="text-[11px] font-normal text-[#536681] dark:text-slate-300">• شامل كل المنهج</span>
          </div>

          {lessonTitle && (
            <p className="text-xs font-bold text-[#091B40] dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 max-w-full truncate">
              الدرس المطلوب: {lessonTitle} {unitTitle ? `• ${unitTitle}` : ""}
            </p>
          )}
        </div>

        {/* Notice Description */}
        <p className="text-xs sm:text-[13px] text-[#536681] dark:text-[#CBD5E1] leading-relaxed text-center px-1">
          لقد استمتعت بالدرس الأول مجاناً للتجربة. للوصول إلى كافة دروس ووحدات المنهج وبنك الأسئلة والامتحانات، حوّل قيمة الاشتراك عبر أي من الطرق المعتمدة أدناه وارفع صورة الإيصال.
        </p>

        {/* Payment Methods Section (Updated Phone Numbers) */}
        <div className="space-y-2.5">
          <span className="text-xs font-black text-[#091B40] dark:text-white block">
            طرق التحويل المعتمدة:
          </span>

          {/* 1. InstaPay Box */}
          <div className="p-3 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200/60 font-bold text-xs">
                IP
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#536681] dark:text-[#94A3B8] block truncate">
                  إنستاباي (InstaPay):
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-[#091B40] dark:text-white tracking-wider block" dir="ltr">
                  {instapayNumber}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(instapayNumber, "instapay")}
              className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-white dark:bg-[#0D214D] hover:bg-[#FAF6F7] text-xs font-bold flex items-center gap-1.5 transition-colors text-[#091B40] dark:text-white shrink-0 active:scale-95 cursor-pointer"
            >
              {copiedKey === "instapay" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#17834B]" />
                  <span className="text-[#17834B]">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#536681]" />
                  <span>نسخ الرقم</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Vodafone Cash Box (2 Numbers) */}
          <div className="p-3 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#536681] dark:text-[#94A3B8]">
              <Smartphone className="w-3.5 h-3.5 text-[#800B34]" />
              <span>فودافون كاش (Vodafone Cash) — رقمين معتمدين:</span>
            </div>

            {/* VF 1 */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300">
                  رقم 1
                </span>
                <span className="text-xs sm:text-sm font-black font-mono text-[#091B40] dark:text-white tracking-wider" dir="ltr">
                  {vodafoneCash1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(vodafoneCash1, "vf1")}
                className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E3A6E] hover:bg-slate-50 text-[11px] font-bold flex items-center gap-1 transition-colors text-[#091B40] dark:text-white cursor-pointer active:scale-95"
              >
                {copiedKey === "vf1" ? (
                  <span className="text-[#17834B]">تم النسخ</span>
                ) : (
                  <span>نسخ</span>
                )}
              </button>
            </div>

            {/* VF 2 */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300">
                  رقم 2
                </span>
                <span className="text-xs sm:text-sm font-black font-mono text-[#091B40] dark:text-white tracking-wider" dir="ltr">
                  {vodafoneCash2}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(vodafoneCash2, "vf2")}
                className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E3A6E] hover:bg-slate-50 text-[11px] font-bold flex items-center gap-1 transition-colors text-[#091B40] dark:text-white cursor-pointer active:scale-95"
              >
                {copiedKey === "vf2" ? (
                  <span className="text-[#17834B]">تم النسخ</span>
                ) : (
                  <span>نسخ</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Main Action: Go to Receipt Upload Screen */}
          <Link
            href="/subscription?renew=true"
            onClick={onClose}
            className="w-full min-h-[48px] sm:min-h-[52px] rounded-xl bg-[#800B34] hover:bg-[#680829] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#800B34]/20 active:scale-[0.98] cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>التوجه لشاشة رفع الإيصال وتفعيل الحساب</span>
          </Link>

          {/* Secondary Action: Direct WhatsApp across all official numbers */}
          <WhatsAppSupportLinks
            variant="buttons"
            title="تأكيد وسداد أو استفسار عبر واتساب:"
            message={whatsappMessage}
          />
        </div>

        {/* Cancel footer */}
        <div className="text-center pt-0.5">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#536681] hover:text-[#091B40] dark:hover:text-white transition-colors cursor-pointer"
          >
            إغلاق ومتابعة الدروس المتاحة
          </button>
        </div>
      </div>
    </div>
  );
}
