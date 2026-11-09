"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Send,
  ArrowRight,
  Smartphone,
  CheckCheck,
} from "lucide-react";
import { formatStudentGreeting, getCleanStudentName } from "@/lib/utils";

interface StudentPaywallViewProps {
  user: {
    id: string;
    name?: string | null;
    loginCode?: string | null;
    phone?: string | null;
    schoolCategory?: string | null;
    subscriptionStatus?: string | null;
  };
  lessonTitle?: string;
  unitTitle?: string;
  examTitle?: string;
  isExam?: boolean;
}

export function StudentPaywallView({
  user,
  lessonTitle,
  unitTitle,
  examTitle,
  isExam = false,
}: StudentPaywallViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [senderPhone, setSenderPhone] = useState(user.phone || "");
  const [reference, setReference] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const paymentNumber = "01021482860"; // Vodafone Cash & InstaPay

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
      formData.append("receipt", file);
      if (senderPhone) formData.append("senderPhone", senderPhone);
      if (reference) formData.append("reference", reference);

      const res = await fetch("/api/student/subscription/receipt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل في رفع إيصال التحويل");
      }

      setUploadSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء رفع الإيصال");
    } finally {
      setIsUploading(false);
    }
  };

  const handleWhatsApp = () => {
    const studentDisplayName = getCleanStudentName(user.name) || "طالب المنصة";
    const text = `مرحباً بك يا مستر! 🌟\nأنا الطالب: *${studentDisplayName}*\nكود المنصة: *${user.loginCode || "—"}*\nقمت بسداد اشتراك المنصة الشهري (200 جنيه) وأريد تفعيل حسابي للوصول لكافة دروس المنهج.`;
    window.open(`https://wa.me/2${paymentNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F1E36] border border-[#E2E8F0] dark:border-[#1E3352] shadow-card text-right font-sans space-y-6 kholasa-signature-curve">
      {/* 1. Header with Lock Icon */}
      <div className="flex flex-col items-center text-center space-y-3 pt-2">
        <div className="w-16 h-16 rounded-2xl bg-[#EAF2FF] dark:bg-[#142747] text-[#2C70BF] dark:text-[#60A5FA] flex items-center justify-center border border-[#2C70BF]/30 shadow-xs">
          <Lock className="w-8 h-8 text-[#2C70BF] dark:text-[#60A5FA]" />
        </div>
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF2FF] text-[#2C70BF] dark:bg-[#142747] dark:text-[#60A5FA] border border-[#2C70BF]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E9AD32]" />
            <span>محتوى مخصص للمشتركين فقط</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#091B40] dark:text-white mt-2 leading-tight">
            لازم تدفع 200 جنيه وترفع الإيصال لفتح كل الدروس
          </h1>
          {(lessonTitle || examTitle) && (
            <p className="text-xs sm:text-sm font-bold text-[#800B34] dark:text-[#F0B843] mt-1">
              المحتوى المطلوب: {isExam ? examTitle : lessonTitle} {unitTitle ? `• (${unitTitle})` : ""}
            </p>
          )}
        </div>
      </div>

      {/* 2. Explanatory Notice (Ice Blue Surface) */}
      <div className="p-4 rounded-2xl bg-[#EAF2FF] dark:bg-[#142747] border border-[#2C70BF]/25 text-xs sm:text-sm text-[#091B40] dark:text-[#F8FAFC] leading-relaxed space-y-1.5">
        <p className="font-bold flex items-center gap-2 text-[#091B40] dark:text-white text-sm sm:text-base">
          <span>{formatStudentGreeting(user.name)} في منصة الخلاصة! 🎉</span>
        </p>
        <p className="text-[#536681] dark:text-[#CBD5E1]">
          لقد حصلت على الدرس الأول مجاناً للتجربة. للوصول إلى كافة دروس ووحدات المنهج، بنك الأسئلة والمفاهيم، الكبسولات الصوتية والزتونة، والامتحانات التفاعلية، يلزم سداد اشتراك المنصة الشهري (200 جنيه) ورفع صورة الإيصال أدناه.
        </p>
      </div>

      {/* 3. Pricing & Payment Details Box (Royal Burgundy & Signature Gold Accents) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F1E36] border-2 border-[#800B34]/20 dark:border-[#800B34]/40 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-[#1E3352]">
          <div>
            <span className="text-xs font-bold text-[#536681] dark:text-[#94A3B8] block">قيمة الاشتراك الشهري</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#800B34] dark:text-[#F0B843] font-mono">
                200
              </span>
              <span className="text-sm font-bold text-[#091B40] dark:text-white">جنيه مصري / شهرياً</span>
            </div>
          </div>
          <span className="self-start sm:self-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#800B34] text-white shadow-xs">
            شامل كل المنهج والمميزات
          </span>
        </div>

        {/* Feature Highlights with Signature Gold Checkmarks */}
        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#091B40] dark:text-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-[#E9AD32] shrink-0" />
            <span>جميع دروس ووحدات المنهج</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-[#E9AD32] shrink-0" />
            <span>بنك الأسئلة والتدريبات الذكية</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-[#E9AD32] shrink-0" />
            <span>ملخصات الزتونة والكبسولات</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-[#E9AD32] shrink-0" />
            <span>الامتحانات التفاعلية وقياس الإتقان</span>
          </div>
        </div>

        {/* Transfer Methods */}
        <div className="space-y-2.5 text-xs pt-2">
          <span className="font-bold text-[#091B40] dark:text-white block">
            طرق التحويل المعتمدة (فودافون كاش / إنستاباي / أي محفظة إلكترونية):
          </span>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F9FC] dark:bg-[#142747] border border-[#E2E8F0] dark:border-[#1E3352]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#800B34]/10 dark:bg-[#800B34]/30 flex items-center justify-center text-[#800B34] dark:text-[#F0B843]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#536681] dark:text-[#94A3B8] block">رقم التحويل المعتمد (فودافون كاش / إنستاباي):</span>
                <span className="text-base font-mono font-extrabold text-[#091B40] dark:text-white tracking-wider" dir="ltr">
                  {paymentNumber}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyNumber}
              className="h-10 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E3352] bg-white dark:bg-[#0F1E36] hover:bg-[#F7F9FC] dark:hover:bg-[#1E3352] text-xs font-bold text-[#091B40] dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedNumber ? (
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
        </div>
      </div>

      {/* 4. Upload Receipt Form or Status */}
      {uploadSuccess ? (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-[#17834B]/40 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-[#17834B] dark:text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-[#17834B] shrink-0" />
            <span>تم استلام إيصال التحويل بنجاح وهو قيد المراجعة! 🎉</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            يقوم فريق العمل بمراجعة إيصالك وتفعيل حسابك خلال دقائق. يمكنك أيضاً الضغط أدناه لإرسال الإيصال مباشرة للمساعد عبر واتساب للتفعيل اللحظي.
          </p>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full min-h-[50px] rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>تأكيد الإيصال والتفعيل الفوري عبر واتساب</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleUploadReceipt} className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-[#091B40] dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#2C70BF]" />
              <span>رفع إيصال الدفع للتفعيل (200 جنيه):</span>
            </h3>
            <p className="text-[11px] text-[#536681] dark:text-[#94A3B8]">
              التقط سكرين شوت أو صورة لإيصال التحويل وأرفقها هنا ليتم تفعيل حسابك مباشرة.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-[#C43D49]/30 text-xs text-[#C43D49] font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C43D49]" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Blue Upload Box */}
          <div className="border-2 border-dashed border-[#2C70BF]/40 hover:border-[#2C70BF] rounded-2xl p-6 text-center transition-colors bg-[#F7F9FC] dark:bg-[#081426]/60">
            <input
              type="file"
              id="receiptFile"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label htmlFor="receiptFile" className="cursor-pointer block space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] dark:bg-[#142747] text-[#2C70BF] flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs space-y-1">
                {file ? (
                  <span className="font-bold text-[#800B34] dark:text-[#F0B843] block truncate max-w-xs mx-auto text-sm">
                    تم اختيار: {file.name}
                  </span>
                ) : (
                  <>
                    <span className="font-bold text-[#2C70BF] hover:underline block text-sm">
                      انقر هنا لاختيار صورة إيصال التحويل
                    </span>
                    <span className="text-[11px] text-[#536681] dark:text-[#94A3B8] block">
                      JPG, PNG, WEBP أو PDF | بحد أقصى 20 ميجابايت
                    </span>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Form Fields: Height 48-52px, Radius 12px */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#091B40] dark:text-[#F8FAFC] mb-1">
                رقم الموبايل المحول منه:
              </label>
              <input
                type="text"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E3352] bg-white dark:bg-[#0F1E36] text-xs sm:text-sm font-mono text-[#091B40] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800B34]"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#091B40] dark:text-[#F8FAFC] mb-1">
                كود العملية / الرقم المرجعي (اختياري):
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="مثال: REF-987654"
                className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E3352] bg-white dark:bg-[#0F1E36] text-xs sm:text-sm font-mono text-[#091B40] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800B34]"
                dir="ltr"
              />
            </div>
          </div>

          {/* Primary Action Button: Royal Burgundy #800B34, Height 52px */}
          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full min-h-[52px] rounded-xl bg-[#800B34] hover:bg-[#680829] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري رفع وتوثيق الإيصال...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>إرسال إيصال الدفع للمراجعة (200 ج)</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* 5. Direct WhatsApp Alternative */}
      <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E3352] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="text-[#17834B] hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>تواصل مع الإدارة عبر واتساب للاستفسار أو السداد</span>
        </button>

        <Link
          href="/dashboard"
          className="text-[#536681] hover:text-[#091B40] dark:hover:text-white flex items-center gap-1 font-semibold"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة إلى لوحة التحكم والدرس التجريبي</span>
        </Link>
      </div>
    </div>
  );
}
