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
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F172A] border-2 border-amber-500/30 dark:border-amber-500/40 shadow-2xl p-6 sm:p-7 text-right font-sans space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#800020] to-rose-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Sparkles className="w-3 h-3" />
            <span>محتوى مخصص للمشتركين فقط</span>
          </span>

          <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white leading-tight mt-1">
            لازم تدفع 200 جنيه وترفع الإيصال لفتح كل الدروس
          </h2>

          {lessonTitle && (
            <p className="text-xs font-bold text-[#800020] dark:text-[#FB7185] bg-[#800020]/5 dark:bg-[#FB7185]/10 px-3 py-1 rounded-lg border border-[#800020]/15 dark:border-[#FB7185]/20">
              الدرس المطلوب: {lessonTitle} {unitTitle ? `• ${unitTitle}` : ""}
            </p>
          )}
        </div>

        {/* Notice Body */}
        <p className="text-xs sm:text-[13px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed text-center px-2">
          لقد استمتعت بالدرس الأول مجاناً للتجربة. لفتح هذا الدرس وباقي دروس ووحدات المنهج بالكامل والامتحانات وبنك الأسئلة، يلزم سداد 200 جنيه ورفع صورة إيصال التحويل لتفعيل حسابك مباشرة.
        </p>

        {/* Payment Transfer Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F172A] dark:text-white">
              طرق الدفع (فودافون كاش / إنستاباي):
            </span>
            <span className="text-xs font-extrabold text-[#800020] dark:text-[#FB7185] font-mono">
              200 ج شهرياً
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
              <span className="text-xs font-mono font-black text-[#0F172A] dark:text-white tracking-wider" dir="ltr">
                {paymentNumber}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyNumber}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              {copiedNumber ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">تم النسخ</span>
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
            href="/subscription"
            onClick={onClose}
            className="w-full h-12 rounded-2xl bg-[#800020] hover:bg-[#66001A] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#800020]/25 active:scale-[0.99]"
          >
            <Upload className="w-4 h-4" />
            <span>التوجه لشاشة رفع الإيصال الآن</span>
          </Link>

          {/* Secondary Action: Direct WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full h-11 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
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
            className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
          >
            إغلاق ومتابعة الدروس المتاحة
          </button>
        </div>
      </div>
    </div>
  );
}

