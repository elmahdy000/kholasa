"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  Send,
  Upload,
  X,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { getCleanStudentName } from "@/lib/utils";

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
  const [copiedNumber, setCopiedNumber] = useState(false);
  const paymentNumber = "01021482860"; // Vodafone Cash & InstaPay

  if (!isOpen) return null;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleWhatsApp = () => {
    const studentDisplayName = getCleanStudentName(user?.name) || "طالب المنصة";
    const text = `مرحباً بك يا مستر! 🌟\nأنا الطالب: *${studentDisplayName}*\nكود المنصة: *${user?.loginCode || "—"}*\nأريد تفعيل اشتراك المنصة الشهري (200 جنيه) لفتح جميع الدروس.`;
    window.open(`https://wa.me/2${paymentNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تفعيل الاشتراك لفتح كل الدروس"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-2xl p-6 sm:p-7 text-right font-sans space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Brand Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#800B34]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 p-2 rounded-xl text-[#536681] hover:text-[#091B40] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] dark:bg-[#071737] text-[#2C70BF] dark:text-[#60A5FA] flex items-center justify-center border border-[#C5DCFA] dark:border-[#1E3A6E] shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF2FF] dark:bg-[#112F66] text-[#091B40] dark:text-[#EAF2FF] border border-[#C5DCFA] dark:border-[#1E4D94]">
            <Sparkles className="w-3 h-3 text-[#E9AD32]" />
            <span>محتوى مخصص للمشتركين فقط</span>
          </span>

          <h2 className="text-lg sm:text-xl font-black text-[#091B40] dark:text-white leading-tight mt-1">
            لازم تدفع 200 جنيه وترفع الإيصال لفتح كل الدروس
          </h2>

          {lessonTitle && (
            <p className="text-xs font-bold text-[#800B34] dark:text-[#E9AD32] bg-[#FAF6F7] dark:bg-[#071737] px-3 py-1 rounded-lg border border-[#800B34]/15 dark:border-[#E9AD32]/30">
              الدرس المطلوب: {lessonTitle} {unitTitle ? `• ${unitTitle}` : ""}
            </p>
          )}
        </div>

        {/* Notice Body */}
        <p className="text-xs sm:text-[13px] text-[#536681] dark:text-[#CBD5E1] leading-relaxed text-center px-2">
          لقد استمتعت بالدرس الأول مجاناً للتجربة. لفتح هذا الدرس وباقي دروس ووحدات المنهج بالكامل والامتحانات وبنك الأسئلة، يلزم سداد 200 جنيه ورفع صورة إيصال التحويل لتفعيل حسابك مباشرة.
        </p>

        {/* Payment Transfer Box */}
        <div className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#091B40] dark:text-white">
              طرق الدفع (فودافون كاش / إنستاباي):
            </span>
            <span className="text-xs font-extrabold text-[#800B34] dark:text-[#E9AD32] font-mono">
              200 ج شهرياً
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E]">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32]" />
              <span className="text-xs font-mono font-black text-[#091B40] dark:text-white tracking-wider" dir="ltr">
                {paymentNumber}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyNumber}
              className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#1E3A6E] hover:bg-[#F7F9FC] dark:hover:bg-[#1E3A6E] text-[11px] font-bold flex items-center gap-1 transition-colors text-[#091B40] dark:text-white"
            >
              {copiedNumber ? (
                <>
                  <Check className="w-3 h-3 text-[#17834B]" />
                  <span className="text-[#17834B]">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>نسخ الرقم</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Main Action: Go to Receipt Upload Screen */}
          <Link
            href="/subscription?renew=true"
            onClick={onClose}
            className="w-full min-h-[52px] rounded-xl bg-[#800B34] hover:bg-[#680829] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#800B34]/25 active:scale-[0.99] cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>التوجه لشاشة رفع الإيصال وتفعيل الحساب</span>
          </Link>

          {/* Secondary Action: Direct WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full min-h-[46px] rounded-xl bg-[#17834B] hover:bg-[#126B3D] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
          >
            <Send className="w-4 h-4" />
            <span>تأكيد وسداد عبر واتساب</span>
          </button>
        </div>

        {/* Cancel footer */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#536681] hover:text-[#091B40] dark:hover:text-white transition-colors"
          >
            إغلاق ومتابعة الدروس المتاحة
          </button>
        </div>
      </div>
    </div>
  );
}

