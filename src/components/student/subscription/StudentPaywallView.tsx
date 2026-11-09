"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import {
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
  Wallet,
  X,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { getCleanStudentName } from "@/lib/utils";
import { fetchWithRetry } from "@/lib/network";

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

/**
 * 3D Graduation Cap Vector Illustration (Matching Screenshot 2 Top-Right Banner)
 */
function GraduationCapIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient
          id="capGlow"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(60 50) rotate(90) scale(45 55)"
        >
          <stop stopColor="#2563EB" stopOpacity="0.25" />
          <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="capTopGrad" x1="20" y1="20" x2="100" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A8A" />
          <stop offset="0.5" stopColor="#0F2856" />
          <stop offset="1" stopColor="#0A1E48" />
        </linearGradient>
        <linearGradient id="capSkullGrad" x1="35" y1="50" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A8A" />
          <stop offset="1" stopColor="#091B40" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="60" y1="35" x2="95" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="0.4" stopColor="#E9AD32" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <filter id="capShadow" x="10" y="30" width="100" height="70" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#091B40" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Soft floor shadow */}
      <ellipse cx="60" cy="85" rx="36" ry="7" fill="url(#capGlow)" />
      {/* Cap Skull Base */}
      <path d="M38 52 C38 52 39 74 60 74 C81 74 82 52 82 52 Z" fill="url(#capSkullGrad)" filter="url(#capShadow)" />
      {/* Cap Diamond Top (Rhombus in 3D perspective) */}
      <polygon points="60,20 102,40 60,56 18,38" fill="url(#capTopGrad)" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.3" />
      {/* Center Button */}
      <ellipse cx="60" cy="38" rx="4" ry="2.5" fill="#E9AD32" stroke="#B45309" strokeWidth="0.8" />
      {/* Gold Tassel String */}
      <path d="M60 38 Q78 40 88 56 Q90 64 91 75" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tassel Bobble & Fringe */}
      <circle cx="91" cy="74" r="3.5" fill="#F59E0B" />
      <path d="M88 77 L94 77 L95 86 L87 86 Z" fill="url(#goldGrad)" />
    </svg>
  );
}

/**
 * 3D Payment Illustration (Matching Screenshot 2 Left Panel: Smartphone, Receipt, Card, Gold Coins)
 */
function PaymentIllustration3D({ className = "w-full max-w-[260px] mx-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 260" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="phoneBody" x1="50" y1="30" x2="190" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="0.5" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="phoneScreen" x1="65" y1="40" x2="175" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#DBEAFE" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="30" y1="160" x2="160" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="0.7" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#0F2856" />
        </linearGradient>
        <linearGradient id="goldCoinTop" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FDE68A" />
          <stop offset="0.6" stopColor="#E9AD32" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="goldCoinSide" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#D97706" />
          <stop offset="1" stopColor="#92400E" />
        </linearGradient>
        <filter id="illusShadow" x="10" y="20" width="260" height="235" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#091B40" floodOpacity="0.12" />
        </filter>
      </defs>

      <g filter="url(#illusShadow)">
        {/* Soft background glow */}
        <circle cx="120" cy="140" r="75" fill="#EAF2FF" fillOpacity="0.7" />

        {/* Smartphone body (tilted slightly) */}
        <rect x="75" y="45" width="115" height="185" rx="22" fill="url(#phoneBody)" />
        <rect x="80" y="50" width="105" height="175" rx="18" fill="url(#phoneScreen)" />
        {/* Phone speaker notch */}
        <rect x="117" y="56" width="32" height="4" rx="2" fill="#94A3B8" />

        {/* White Receipt Sliding Out */}
        <g>
          <path d="M92 68 L172 68 L172 165 C172 165 155 160 132 165 C109 170 92 165 92 165 Z" fill="#FFFFFF" />
          {/* Green Checkmark Circle on Receipt */}
          <circle cx="132" cy="98" r="15" fill="#17834B" />
          <path d="M125 98 L130 103 L139 94" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Receipt Lines */}
          <rect x="106" y="122" width="52" height="4" rx="2" fill="#E2E8F0" />
          <rect x="112" y="132" width="40" height="3" rx="1.5" fill="#CBD5E1" />
          <rect x="118" y="141" width="28" height="3" rx="1.5" fill="#E2E8F0" />
        </g>

        {/* Blue Credit Card in front */}
        <g transform="rotate(-10 35 170)">
          <rect x="35" y="165" width="112" height="68" rx="10" fill="url(#cardGrad)" stroke="#93C5FD" strokeWidth="1" strokeOpacity="0.4" />
          {/* Chip */}
          <rect x="47" y="180" width="16" height="12" rx="3" fill="url(#goldCoinTop)" />
          {/* Contactless waves */}
          <path d="M115 180 A6 6 0 0 1 115 192" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M120 176 A11 11 0 0 1 120 196" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
          {/* Card subtle text bars */}
          <rect x="47" y="206" width="34" height="4" rx="2" fill="#FFFFFF" opacity="0.6" />
          <rect x="47" y="214" width="48" height="3" rx="1.5" fill="#FFFFFF" opacity="0.4" />
        </g>

        {/* Stack of Gold Coins (Front right) */}
        {/* Coin 1 */}
        <g transform="translate(132, 206)">
          <path d="M0 8 C0 3.5 16 0 35 0 C54 0 70 3.5 70 8 L70 16 C70 20.5 54 24 35 24 C16 24 0 20.5 0 16 Z" fill="url(#goldCoinSide)" />
          <ellipse cx="35" cy="8" rx="35" ry="8" fill="url(#goldCoinTop)" stroke="#FDE68A" strokeWidth="0.8" />
        </g>
        {/* Coin 2 */}
        <g transform="translate(132, 196)">
          <path d="M0 8 C0 3.5 16 0 35 0 C54 0 70 3.5 70 8 L70 16 C70 20.5 54 24 35 24 C16 24 0 20.5 0 16 Z" fill="url(#goldCoinSide)" />
          <ellipse cx="35" cy="8" rx="35" ry="8" fill="url(#goldCoinTop)" stroke="#FDE68A" strokeWidth="0.8" />
        </g>
        {/* Coin 3 */}
        <g transform="translate(132, 186)">
          <path d="M0 8 C0 3.5 16 0 35 0 C54 0 70 3.5 70 8 L70 16 C70 20.5 54 24 35 24 C16 24 0 20.5 0 16 Z" fill="url(#goldCoinSide)" />
          <ellipse cx="35" cy="8" rx="35" ry="8" fill="url(#goldCoinTop)" stroke="#FDE68A" strokeWidth="0.8" />
          <ellipse cx="35" cy="8" rx="28" ry="6" fill="none" stroke="#D97706" strokeWidth="0.8" opacity="0.7" />
        </g>
      </g>
    </svg>
  );
}

export function StudentPaywallView({
  user,
  lessonTitle,
  unitTitle,
  examTitle,
  isExam = false,
}: StudentPaywallViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [senderPhone, setSenderPhone] = useState(user.phone || "");
  const [reference, setReference] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const paymentNumber = "01021482860"; // Vodafone Cash & InstaPay

  const studentDisplayName = getCleanStudentName(user?.name);
  const welcomeGreeting = studentDisplayName
    ? `أهلاً بك يا ${studentDisplayName} في منصة الخلاصة! 🎉`
    : "أهلاً بيك في منصة الخلاصة! 🎉";

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2200);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const maxSizeBytes = 20 * 1024 * 1024; // 20 MB
    if (selectedFile.size > maxSizeBytes) {
      setError("حجم الملف يتجاوز الحد الأقصى المسموح به (20 ميجابايت).");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("صيغة الملف غير مدعومة. يرجى اختيار ملف JPG أو PNG أو WEBP أو PDF.");
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("يرجى اختيار صورة إيصال التحويل أولاً.");
      return;
    }

    if (!senderPhone.trim()) {
      setError("يرجى إدخال رقم الموبايل المحول منه لربط العملية بحسابك.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Compress image client-side before uploading (turns 8MB photos into ~200KB instantly)
      let uploadFile = file;
      if (file.type.startsWith("image/") && file.size > 400 * 1024) {
        uploadFile = await new Promise<File>((resolve) => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            URL.revokeObjectURL(url);
            const maxDim = 1600;
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(file);
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (!blob || blob.size >= file.size) return resolve(file);
                resolve(
                  new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  })
                );
              },
              "image/jpeg",
              0.82
            );
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(file);
          };
          img.src = url;
        });
      }

      const formData = new FormData();
      formData.append("receipt", uploadFile);
      formData.append("file", uploadFile);
      formData.append("senderPhone", senderPhone.trim());
      if (reference.trim()) formData.append("reference", reference.trim());

      const res = await fetchWithRetry("/api/student/subscription/receipt", {
        timeoutMs: 35000,
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
    const text = `مرحباً بك يا مستر! 🌟\nأنا الطالب: *${studentDisplayName || "طالب المنصة"}*\nكود المنصة: *${user.loginCode || "—"}*\nقمت بسداد اشتراك المنصة الشهري (200 جنيه) وأريد تفعيل حسابي للوصول لكافة دروس المنهج.`;
    window.open(`https://wa.me/2${paymentNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto space-y-3.5 sm:space-y-5 px-0 sm:px-2 py-1 sm:py-4 text-right font-sans">
      {/* ========================================================================= */}
      {/* SECTION A: COMPACT WELCOME BANNER                                         */}
      {/* ========================================================================= */}
      <div className="bg-[#EAF2FF] border border-[#D0E2FF] rounded-2xl sm:rounded-[20px] p-3.5 sm:p-5 lg:p-6 flex items-center justify-between gap-3 sm:gap-5 relative overflow-hidden shadow-2xs">
        {/* Welcome Text */}
        <div className="space-y-1 flex-1 text-right">
          <h1 className="text-[17px] sm:text-[20px] lg:text-[24px] font-extrabold text-[#091B40] leading-snug tracking-tight">
            {welcomeGreeting}
          </h1>
          <p className="text-[12.5px] sm:text-[14px] lg:text-[15px] text-[#475569] leading-relaxed max-w-2xl">
            لقد استمتعت بالدرس الأول مجاناً للتجربة. للوصول إلى كافة دروس المنهج، بنك الأسئلة والمفاهيم، الكبسولات الصوتية، والامتحانات التفاعلية، يلزم تفعيل اشتراك المنصة الشهري.
          </p>
          {(lessonTitle || examTitle) && (
            <p className="text-xs font-bold text-[#800B34] pt-0.5">
              المحتوى المطلوب: {isExam ? examTitle : lessonTitle} {unitTitle ? `• (${unitTitle})` : ""}
            </p>
          )}
        </div>

        {/* Small Graduation Cap beside text on mobile, larger on desktop */}
        <div className="shrink-0 flex items-center justify-center">
          <GraduationCapIcon className="w-12 h-12 sm:w-16 sm:h-16 lg:w-22 lg:h-22 drop-shadow-2xs" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION B: MAIN SUBSCRIPTION CARD                                        */}
      {/* Mobile: Summary (Price + Badge + 2-Col Benefits) -> Payment Info -> Upload -> Form */}
      {/* Desktop: Split 70% Right Form / 30% Left Benefits with 3D Illustration   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E2E8F0] shadow-[0_8px_30px_rgba(9,27,64,0.06)] relative overflow-hidden">
        {/* --------------------------------------------------------------------- */}
        {/* MOBILE ONLY: Price + "شامل كل المنهج" Badge + 4 Benefits (2-Col Grid)   */}
        {/* --------------------------------------------------------------------- */}
        <div className="block lg:hidden p-4 sm:p-5 border-b border-[#E2E8F0] bg-gradient-to-b from-[#FFFDF9] to-[#FFFFFF]">
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Monthly Subscription Price */}
            <div>
              <span className="text-[11px] font-bold text-[#64748B] block">
                قيمة الاشتراك الشهري
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[28px] sm:text-[34px] font-black text-[#800B34] font-mono leading-none">
                  200
                </span>
                <span className="text-[14px] sm:text-[15px] font-bold text-[#091B40]">
                  جنيه / شهرياً
                </span>
              </div>
            </div>

            {/* Badge: شامل كل المنهج */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#800B34] text-white text-[12px] font-bold shadow-2xs shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E9AD32]" />
              <span>شامل كل المنهج</span>
            </div>
          </div>

          {/* 4 Benefits in Compact 2-Column Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F1F5F9]">
            <div className="flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-[#091B40]">
              <CheckCheck className="w-4 h-4 text-[#E9AD32] shrink-0" strokeWidth={2.5} />
              <span>جميع الدروس</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-[#091B40]">
              <CheckCheck className="w-4 h-4 text-[#E9AD32] shrink-0" strokeWidth={2.5} />
              <span>بنك الأسئلة</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-[#091B40]">
              <CheckCheck className="w-4 h-4 text-[#E9AD32] shrink-0" strokeWidth={2.5} />
              <span>الكبسولات الصوتية</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-[#091B40]">
              <CheckCheck className="w-4 h-4 text-[#E9AD32] shrink-0" strokeWidth={2.5} />
              <span>الامتحانات التفاعلية</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* --------------------------------------------------------------------- */}
          {/* RIGHT AREA IN RTL (70% on Desktop, 100% on Mobile): PAYMENT FORM      */}
          {/* --------------------------------------------------------------------- */}
          <div className="w-full lg:w-[70%] p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-white">
            {/* Desktop Only: Row 1: Monthly Price & Wallet Icon */}
            <div className="hidden lg:flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="space-y-0.5">
                <span className="text-[13px] font-bold text-[#64748B] block">
                  قيمة الاشتراك الشهري
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[34px] sm:text-[40px] font-black text-[#800B34] font-mono leading-none">
                    200
                  </span>
                  <span className="text-[16px] sm:text-[17px] font-bold text-[#091B40]">
                    جنيه مصري / شهرياً
                  </span>
                </div>
              </div>

              <div className="w-12 h-12 rounded-xl border border-[#E2E8F0] flex items-center justify-center text-[#800B34] shadow-2xs">
                <Wallet className="w-6 h-6" strokeWidth={1.8} />
              </div>
            </div>

            {/* Row 2: Payment Methods Notice */}
            <div className="flex items-center gap-2 text-[13.5px] sm:text-[15px] font-bold text-[#091B40]">
              <Wallet className="w-4 h-4 text-[#800B34] shrink-0" />
              <span>طرق التحويل المعتمدة (فودافون كاش / إنستاباي / أي محفظة إلكترونية):</span>
            </div>

            {/* Row 3: Official Payment Phone Number Box */}
            <div className="rounded-xl sm:rounded-2xl border border-[#E2E8F0] bg-[#FAF8F5]/50 sm:bg-white p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FAF6F7] text-[#800B34] flex items-center justify-center shrink-0">
                  <Smartphone className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-[12px] text-[#536681] block truncate">
                    رقم التحويل المعتمد (فودافون كاش / إنستاباي):
                  </span>
                  <span className="text-[17px] sm:text-[20px] font-black font-mono text-[#091B40] tracking-wider block" dir="ltr">
                    {paymentNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyNumber}
                className="h-10 px-3 sm:px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F7F9FC] text-[12px] sm:text-[13px] font-bold text-[#091B40] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0 active:scale-98 min-h-[44px]"
              >
                {copiedNumber ? (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#17834B]" />
                    <span className="text-[#17834B]">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#536681]" />
                    <span>نسخ الرقم</span>
                  </>
                )}
              </button>
            </div>

            {/* Row 4: Receipt Upload Form & Status */}
            {uploadSuccess ? (
              <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 border-2 border-[#17834B]/40 space-y-3.5 animate-in fade-in">
                <div className="flex items-center gap-3 text-[#17834B] font-bold text-base">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <span>تم استلام إيصال التحويل بنجاح وهو قيد المراجعة الفورية! 🎉</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  يقوم فريق العمل بمراجعة إيصالك وتفعيل حسابك خلال دقائق معدودة. لتسريع عملية التفعيل بشكل لحظي، يمكنك أيضاً إرسال صورة الإيصال للمساعد عبر واتساب.
                </p>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full min-h-[48px] sm:min-h-[50px] rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>تأكيد الإيصال والتفعيل اللحظي عبر واتساب</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleUploadReceipt} className="space-y-4 sm:space-y-5">
                {/* Upload Title & Instructions */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[14px] sm:text-[16px] font-bold text-[#091B40]">
                    <Upload className="w-4 h-4 text-[#800B34]" />
                    <span>رفع إيصال الدفع للتفعيل (200 جنيه):</span>
                  </div>
                  <p className="text-[12px] sm:text-[13px] text-[#536681]">
                    التقط سكرين شوت أو صورة لإيصال التحويل وارفعها هنا ليتم تفعيل حسابك مباشرة.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-[#C43D49]/30 text-xs sm:text-sm text-[#C43D49] font-bold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#C43D49]" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Upload Dropzone (Dashed Action-Blue Box) */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const dropped = e.dataTransfer.files?.[0];
                    if (dropped) validateAndSetFile(dropped);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-7 text-center transition-all cursor-pointer relative ${
                    isDragging
                      ? "border-[#2C70BF] bg-[#EAF2FF]"
                      : file
                      ? "border-[#17834B]/50 bg-[#F4FBF7]"
                      : "border-[#93C5FD] hover:border-[#2C70BF] bg-[#F8FAFD]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="receiptFileInput"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {file ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-center gap-2 text-[#17834B]">
                        {file.type === "application/pdf" ? (
                          <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
                        ) : (
                          <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                        )}
                        <span className="font-extrabold text-[14px] sm:text-[16px] max-w-[200px] sm:max-w-sm truncate">
                          {file.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#536681] block font-mono">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <div className="flex items-center justify-center gap-2.5 pt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-bold text-[#091B40] hover:bg-[#F7F9FC]"
                        >
                          تغيير الملف
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>إزالة</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#EAF2FF] text-[#2C70BF] flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[14px] sm:text-[16px] font-extrabold text-[#800B34] block">
                          انقر هنا لاختيار صورة إيصال التحويل
                        </span>
                        <span className="text-[11.5px] sm:text-[12px] text-[#64748B] block font-medium">
                          JPG, PNG, WEBP أو PDF | بحد أقصى 20 ميجابايت
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Fields: Sender Phone & Optional Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-0.5">
                  <div>
                    <label className="block text-[13px] font-bold text-[#091B40] mb-1">
                      رقم الموبايل المحول منه <span className="text-[#800B34]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        maxLength={15}
                        className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] bg-white text-sm font-mono text-[#091B40] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#800B34] focus:outline-none transition-all shadow-2xs"
                        dir="ltr"
                      />
                      <Smartphone className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#091B40] mb-1">
                      كود العملية / الرقم المرجعي (اختياري):
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="مثال: REF-987654"
                      maxLength={30}
                      className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] bg-white text-sm font-mono text-[#091B40] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#800B34] focus:outline-none transition-all shadow-2xs"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Explanatory feedback banner when submit button is disabled */}
                {(!file || !senderPhone.trim()) && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[12.5px] font-semibold text-amber-900 flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {!file && !senderPhone.trim()
                        ? "يرجى اختيار صورة الإيصال وإدخال رقم الموبايل المحول منه لتفعيل الإرسال."
                        : !file
                        ? "يرجى اختيار صورة أو ملف إيصال التحويل لتفعيل الإرسال."
                        : "يرجى إدخال رقم الموبايل المحول منه لتفعيل الإرسال."}
                    </span>
                  </div>
                )}

                {/* Primary Full-Width Burgundy Action Button */}
                <button
                  type="submit"
                  disabled={isUploading || !file || !senderPhone.trim()}
                  className="w-full min-h-[50px] sm:min-h-[56px] rounded-xl bg-[#800B34] hover:bg-[#680829] text-white font-black text-[15px] sm:text-[16px] flex items-center justify-center gap-2.5 transition-all shadow-md shadow-[#800B34]/25 disabled:opacity-45 disabled:bg-[#800B34]/60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري إرسال الإيصال للمراجعة...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4.5 h-4.5" strokeWidth={2.2} />
                      <span>إرسال إيصال الدفع للمراجعة</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* DESKTOP ONLY: LEFT AREA IN RTL (30%): SUBSCRIPTION BENEFITS          */}
          {/* --------------------------------------------------------------------- */}
          <div className="hidden lg:flex lg:w-[30%] p-6 sm:p-7 flex-col justify-between relative bg-gradient-to-b from-[#FFFDF9] via-[#FFFFFF] to-[#F7F9FC] border-r border-[#E2E8F0]">
            <div>
              {/* Badge: شامل كل المنهج */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#800B34] text-white text-[13px] font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#E9AD32]" />
                <span>شامل كل المنهج</span>
              </div>

              {/* Four Subscription Benefits with Signature Gold Checkmarks */}
              <ul className="space-y-4 my-6 sm:my-8">
                <li className="flex items-center gap-2.5 text-[15px] font-bold text-[#091B40]">
                  <CheckCheck className="w-5 h-5 text-[#E9AD32] shrink-0" strokeWidth={2.5} />
                  <span>جميع الدروس</span>
                </li>
                <li className="flex items-center gap-2.5 text-[15px] font-bold text-[#091B40]">
                  <CheckCheck className="w-5 h-5 text-[#E9AD32] shrink-0" strokeWidth={2.5} />
                  <span>بنك الأسئلة</span>
                </li>
                <li className="flex items-center gap-2.5 text-[15px] font-bold text-[#091B40]">
                  <CheckCheck className="w-5 h-5 text-[#E9AD32] shrink-0" strokeWidth={2.5} />
                  <span>الكبسولات الصوتية</span>
                </li>
                <li className="flex items-center gap-2.5 text-[15px] font-bold text-[#091B40]">
                  <CheckCheck className="w-5 h-5 text-[#E9AD32] shrink-0" strokeWidth={2.5} />
                  <span>الامتحانات التفاعلية</span>
                </li>
              </ul>
            </div>

            {/* 3D Payment Theme Illustration (Desktop Only) */}
            <div className="pt-2 pb-1 flex justify-center">
              <PaymentIllustration3D className="w-full max-w-[250px]" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION C: COMPACT FOOTER LINKS                                          */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 pt-1 text-[13px] font-bold">
        {/* WhatsApp Link */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="text-[#17834B] hover:underline flex items-center gap-1.5 cursor-pointer py-1 min-h-[44px]"
        >
          <Send className="w-4 h-4" />
          <span>تواصل مع الإدارة عبر واتساب للاستفسار أو السداد</span>
        </button>

        {/* Back Link */}
        <Link
          href="/dashboard"
          className="text-[#536681] hover:text-[#091B40] flex items-center gap-1.5 transition-colors py-1 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>العودة إلى لوحة التحكم والدرس التجريبي</span>
        </Link>
      </div>
    </div>
  );
}
