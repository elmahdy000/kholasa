"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Send,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  Building2,
  Globe,
} from "lucide-react";

interface StudentPaywallViewProps {
  user: {
    id: string;
    name?: string | null;
    loginCode?: string | null;
    phone?: string | null;
    schoolCategory?: string | null;
    subscriptionStatus?: string | null;
    paymentReceiptUrl?: string | null;
  };
  lessonTitle?: string;
  unitTitle?: string;
  isExam?: boolean;
  examTitle?: string;
}

export function StudentPaywallView({
  user,
  lessonTitle,
  unitTitle,
  isExam = false,
  examTitle,
}: StudentPaywallViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [senderPhone, setSenderPhone] = useState(user.phone || "");
  const [reference, setReference] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(
    user.subscriptionStatus === "PENDING_VERIFICATION"
  );
  const [error, setError] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const paymentNumber = "01021482860"; // Official Vodafone Cash & InstaPay line

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("يرجى اختيار صورة إيصال التحويل أولاً");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (senderPhone.trim()) formData.append("senderPhone", senderPhone.trim());
      if (reference.trim()) formData.append("reference", reference.trim());

      const res = await fetch("/api/student/subscription/receipt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل رفع الإيصال");
      }

      setUploadSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء رفع الإيصال");
    } finally {
      setIsUploading(false);
    }
  };

  const handleWhatsApp = () => {
    const text = `مرحباً بك يا مستر! 🌟\nأنا الطالب: *${user.name || "طالب"}*\nكود المنصة: *${user.loginCode || "—"}*\nقمت بسداد اشتراك المنصة الشهري (200 جنيه) وأريد تفعيل حسابي للوصول لكافة دروس المنهج.`;
    window.open(`https://wa.me/2${paymentNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xl text-right font-sans space-y-6">
      {/* 1. Header with Lock Icon */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>محتوى مخصص للمشتركين فقط</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white mt-2">
            {isExam ? examTitle : lessonTitle}
          </h1>
          {unitTitle && (
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              التابعة لـ: {unitTitle}
            </p>
          )}
        </div>
      </div>

      {/* 2. Explanatory Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed space-y-2">
        <p className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          <span>أهلاً بك يا {user.name || "بطل"} في منصة الخلاصة! 🎉</span>
        </p>
        <p>
          لقد استمتعت بالدرس الأول مجاناً للتجربة. للوصول إلى كافة دروس المنهج، بنك الأسئلة والمفاهيم، الكبسولات الصوتية، والامتحانات التفاعلية، يلزم تفعيل اشتراك المنصة الشهري.
        </p>
      </div>

      {/* 3. Pricing & Payment Details Box */}
      <div className="p-5 rounded-2xl bg-linear-to-br from-[#800020]/5 via-white to-amber-500/5 dark:from-[#800020]/20 dark:via-[#0F172A] dark:to-amber-500/10 border-2 border-[#800020]/20 dark:border-[#FB7185]/30 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase text-[#64748B] block">قيمة الاشتراك الشهري</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold text-[#800020] dark:text-[#FB7185] font-mono">
                200
              </span>
              <span className="text-sm font-bold text-[#0F172A] dark:text-white">جنيه مصري / شهرياً</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#800020] text-white">
            شامل كل المنهج
          </span>
        </div>

        {/* Transfer Methods */}
        <div className="space-y-2.5 text-xs">
          <span className="font-bold text-[#0F172A] dark:text-white block">
            طرق التحويل المعتمدة (فودافون كاش / إنستاباي / أي محفظة إلكترونية):
          </span>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-[#800020] dark:text-[#FB7185]" />
              <div>
                <span className="text-[11px] text-[#64748B] block">رقم التحويل المعتمد (فودافون كاش / إنستاباي):</span>
                <span className="text-sm font-mono font-extrabold text-[#0F172A] dark:text-white tracking-wider" dir="ltr">
                  {paymentNumber}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyNumber}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copiedNumber ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرقم</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Upload Receipt Form or Status */}
      {uploadSuccess ? (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>تم استلام إيصال التحويل بنجاح وهو قيد المراجعة! 🎉</span>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
            يقوم فريق العمل بمراجعة إيصالك وتفعيل حسابك خلال دقائق. يمكنك أيضاً الضغط أدناه لإرسال الإيصال مباشرة للمساعد عبر واتساب للتفعيل اللحظي.
          </p>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>تأكيد الإيصال والتفعيل الفوري عبر واتساب</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleUploadReceipt} className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
              <span>رفع إيصال الدفع للتفعيل (200 جنيه):</span>
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              التقط سكرين شوت أو صورة لإيصال التحويل وأرفقها هنا ليتم تفعيل حسابك مباشرة.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* File Picker */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#800020] dark:hover:border-[#FB7185] rounded-2xl p-5 text-center transition-colors bg-slate-50/50 dark:bg-[#1E293B]/20">
            <input
              type="file"
              id="receiptFile"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label htmlFor="receiptFile" className="cursor-pointer block space-y-2">
              <Upload className="w-7 h-7 mx-auto text-slate-400" />
              <div className="text-xs">
                {file ? (
                  <span className="font-bold text-[#800020] dark:text-[#FB7185] block truncate max-w-xs mx-auto">
                    تم اختيار: {file.name}
                  </span>
                ) : (
                  <>
                    <span className="font-bold text-[#800020] dark:text-[#FB7185] block">
                      انقر هنا لاختيار صورة إيصال التحويل
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      JPG, PNG, WEBP أو PDF (الحد الأقصى 20 ميجابايت)
                    </span>
                  </>
                )}
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                رقم الموبايل المحول منه:
              </label>
              <input
                type="text"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-xs font-mono focus:outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                كود العملية / الرقم المرجعي (اختياري):
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="مثال: REF-987654"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-xs font-mono focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full h-12 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري رفع وتوثيق الإيصال...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>رفع إيصال الدفع وتفعيل الحساب (200 ج)</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* 5. Direct WhatsApp Alternative */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="text-[#25D366] hover:underline font-bold flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>تواصل مع الإدارة عبر واتساب للاستفسار أو السداد</span>
        </button>

        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-medium"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة إلى لوحة التحكم والدرس التجريبي</span>
        </Link>
      </div>
    </div>
  );
}
