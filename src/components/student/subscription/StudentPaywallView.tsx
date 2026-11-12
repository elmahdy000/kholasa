"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Info,
  Loader2,
  LogIn,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Upload,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import {
  NewStudentRegistrationModal,
  type PublicSystemOption,
  type RegisteredSubscriptionStudent,
} from "./NewStudentRegistrationModal";
import { getCleanStudentName } from "@/lib/utils";
import { isAnyDemoCode } from "@/lib/demo-shared";
import { fetchWithRetry } from "@/lib/network";
import { WhatsAppSupportLinks } from "@/components/ui/WhatsAppSupportLinks";
import {
  ACCEPTED_RECEIPT_TYPES,
  compressReceiptImageIfNeeded,
  MAX_RECEIPT_SIZE_BYTES,
  normalizeDigits,
  PAYMENT_METHODS,
  type PaymentMethodId,
  SUBSCRIPTION_PRICE_EGP,
  validateSenderPhone,
} from "./payment-methods";
import {
  type PaymentFlowStep,
  PaymentProgressStepper,
} from "./PaymentProgressStepper";
import { SubscriptionOrderSummary } from "./SubscriptionOrderSummary";

interface StudentPaywallViewProps {
  user?: {
    id: string;
    name?: string | null;
    loginCode?: string | null;
    phone?: string | null;
    schoolCategory?: string | null;
    gradeId?: string | null;
    systemId?: string | null;
    trackId?: string | null;
    studyMode?: string | null;
    centerName?: string | null;
    subscriptionStatus?: string | null;
  } | null;
  initialSystems?: PublicSystemOption[];
  lessonTitle?: string;
  unitTitle?: string;
  examTitle?: string;
  isExam?: boolean;
}

const JUST_REGISTERED_STORAGE_KEY = "kholasa_just_registered_uid";
const subscribeNoop = () => () => {};
const getRegisteredUidSnapshot = (): string | null => {
  try {
    return window.sessionStorage.getItem(JUST_REGISTERED_STORAGE_KEY);
  } catch {
    return null;
  }
};
const getRegisteredUidServerSnapshot = (): string | null => null;

export function StudentPaywallView({
  user = null,
  initialSystems,
  lessonTitle,
  unitTitle,
  examTitle,
  isExam = false,
}: StudentPaywallViewProps) {
  const router = useRouter();
  const [registeredUser, setRegisteredUser] =
    useState<RegisteredSubscriptionStudent | null>(null);
  const activeUser = registeredUser ?? user ?? null;
  const isDemoAccount = Boolean(activeUser && isAnyDemoCode(activeUser.loginCode));
  const needsStudentRegistration = !activeUser || isDemoAccount;

  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(
    () => needsStudentRegistration
  );
  const [justRegisteredCode, setJustRegisteredCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const storedRegisteredUid = useSyncExternalStore(
    subscribeNoop,
    getRegisteredUidSnapshot,
    getRegisteredUidServerSnapshot
  );
  const displayedRegisteredCode =
    justRegisteredCode ??
    (activeUser &&
    !isDemoAccount &&
    activeUser.loginCode &&
    storedRegisteredUid === activeUser.id
      ? activeUser.loginCode
      : null);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("instapay");
  const [hasInteractedWithTransfer, setHasInteractedWithTransfer] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [senderPhone, setSenderPhone] = useState(user?.phone || "");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [reference, setReference] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [serverResponseMessage, setServerResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const submittingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const studentDisplayName = getCleanStudentName(activeUser?.name);
  const isAlreadyPending =
    activeUser?.subscriptionStatus === "PENDING_VERIFICATION" && !uploadSuccess;

  const activeMethodConfig =
    PAYMENT_METHODS.find((m) => m.id === selectedMethod) ?? PAYMENT_METHODS[0];

  const phoneValidationError = validateSenderPhone(senderPhone);
  const isPhoneValid = phoneValidationError === null;
  const isSubmitDisabled =
    needsStudentRegistration || isUploading || !file || !isPhoneValid;

  const currentStep: PaymentFlowStep =
    uploadSuccess || isAlreadyPending
      ? 3
      : !needsStudentRegistration &&
          (hasInteractedWithTransfer || Boolean(file) || Boolean(senderPhone.trim()))
      ? 2
      : 1;

  const whatsappMessage = `مرحباً فريق الدعم!\nأنا الطالب: *${
    studentDisplayName || "طالب المنصة"
  }*\nكود المنصة: *${
    activeUser?.loginCode || "—"
  }*\nقمت بتحويل اشتراك المنصة الشهري (${SUBSCRIPTION_PRICE_EGP} جنيه مصري) وأرغب في متابعة مراجعة إيصال الدفع.`;

  const disabledReasonText = (() => {
    if (needsStudentRegistration) {
      return "سجّل بياناتك كطالب جديد الأول عشان يطلعلك كود الطالب الخاص بيك قبل رفع الإيصال.";
    }
    if (isUploading) return "جاري رفع الإيصال وإرساله للمراجعة، يرجى الانتظار...";
    if (!file && !senderPhone.trim()) {
      return "لإتمام التأكيد: ارفع صورة إيصال التحويل وأدخل رقم الموبايل المحوّل منه.";
    }
    if (!file) {
      return "لإتمام التأكيد: يرجى رفع صورة أو ملف PDF لإيصال التحويل.";
    }
    if (!senderPhone.trim()) {
      return "لإتمام التأكيد: يرجى إدخال رقم الموبايل المحوّل منه.";
    }
    if (phoneValidationError) {
      return phoneValidationError;
    }
    return null;
  })();

  const handleRegistrationSuccess = (student: RegisteredSubscriptionStudent) => {
    try {
      window.sessionStorage.setItem(JUST_REGISTERED_STORAGE_KEY, student.id);
    } catch {
      // ignore sessionStorage restrictions
    }
    setRegisteredUser(student);
    if (student.phone) {
      setSenderPhone(student.phone);
    }
    setJustRegisteredCode(student.loginCode);
    setShowRegisterModal(false);
    setError(null);
    router.refresh();
  };

  const handleCopyLoginCode = async () => {
    if (!displayedRegisteredCode) return;
    try {
      await navigator.clipboard.writeText(displayedRegisteredCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleCopyAccount = async (num: string, key: string) => {
    if (needsStudentRegistration) {
      setShowRegisterModal(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(num);
      setCopiedKey(key);
      setHasInteractedWithTransfer(true);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2500);
    } catch {
      setError("تعذر النسخ التلقائي — يرجى نسخ الرقم يدوياً.");
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size === 0) {
      setError("الملف المختار فارغ، يرجى اختيار صورة أو ملف صحيح.");
      return;
    }
    if (selectedFile.size > MAX_RECEIPT_SIZE_BYTES) {
      setError("حجم الملف يتجاوز الحد الأقصى المسموح به (20 ميجابايت).");
      return;
    }
    const isAllowed = (ACCEPTED_RECEIPT_TYPES as readonly string[]).includes(
      selectedFile.type
    );
    if (!isAllowed) {
      setError("صيغة الملف غير مدعومة. الصيغ المقبولة: JPG أو PNG أو WEBP أو PDF.");
      return;
    }

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    setFile(selectedFile);
    setHasInteractedWithTransfer(true);
    if (selectedFile.type.startsWith("image/")) {
      setFilePreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsStudentRegistration) {
      setShowRegisterModal(true);
      return;
    }
    if (submittingRef.current || isUploading) return;

    setPhoneTouched(true);
    setError(null);

    if (!file) {
      setError("يرجى إرفاق صورة أو ملف إيصال التحويل أولاً.");
      return;
    }

    const phoneErr = validateSenderPhone(senderPhone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }

    submittingRef.current = true;
    setIsUploading(true);

    try {
      const normalizedPhone = normalizeDigits(senderPhone);
      const uploadFile = await compressReceiptImageIfNeeded(file);

      const formData = new FormData();
      formData.append("receipt", uploadFile);
      formData.append("file", uploadFile);
      formData.append("senderPhone", normalizedPhone);
      if (reference.trim()) {
        formData.append("reference", reference.trim());
      }

      const res = await fetchWithRetry("/api/student/subscription/receipt", {
        timeoutMs: 35000,
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "تعذر إرسال إيصال الدفع، يرجى المحاولة مرة أخرى.");
      }

      try {
        window.sessionStorage.removeItem(JUST_REGISTERED_STORAGE_KEY);
      } catch {
        // ignore
      }
      setServerResponseMessage(
        typeof data.message === "string"
          ? data.message
          : "تم استلام إيصال الدفع بنجاح وهو الآن قيد المراجعة."
      );
      setUploadSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ غير متوقع أثناء إرسال الإيصال، يرجى المحاولة مرة أخرى."
      );
    } finally {
      submittingRef.current = false;
      setIsUploading(false);
    }
  };

  const handleResetToUploadAnother = () => {
    setUploadSuccess(false);
    setServerResponseMessage(null);
    setError(null);
    handleRemoveFile();
  };

  return (
    <div
      dir="rtl"
      className="w-full max-w-[1050px] mx-auto space-y-6 py-2 sm:py-4 text-right font-sans"
    >
      {/* 1. Compact Header & Context */}
      <header className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-[0_2px_12px_rgba(9,27,64,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[13px] font-bold text-[#1D4ED8]">
            <ShieldCheck className="w-4 h-4 text-[#D49B24]" />
            <span>بوابة تفعيل الاشتراك الشهري — منصة الخلاصة</span>
          </div>
          <h1 className="text-[20px] sm:text-[24px] font-black text-[#091B40] leading-snug tracking-tight">
            {studentDisplayName
              ? `تأكيد دفع الاشتراك — ${studentDisplayName}`
              : "تأكيد دفع الاشتراك وتفعيل الحساب"}
          </h1>
          <p className="text-[14px] text-[#475569] leading-relaxed max-w-2xl">
            حوّل قيمة الاشتراك الشهري عبر وسيلة الدفع المناسبة لك، ثم ارفع صورة الإيصال ليقوم فريق الإدارة بمراجعته وتفعيل حسابك.
          </p>
          {(lessonTitle || examTitle) && (
            <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[13px] font-bold text-[#1E3A8A]">
              <span>المحتوى المطلوب فتحه:</span>
              <span>{isExam ? examTitle : lessonTitle}</span>
              {unitTitle && <span className="text-[#475569]">• {unitTitle}</span>}
            </div>
          )}
        </div>

        <Link
          href={activeUser ? "/dashboard" : "/"}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[14px] font-bold text-[#091B40] transition-colors shrink-0 self-start sm:self-center"
        >
          <ArrowLeft className="w-4 h-4 text-[#475569]" />
          <span>{activeUser ? "العودة للوحة التحكم" : "العودة للصفحة الرئيسية"}</span>
        </Link>
      </header>

      {/* 2. Compact Horizontal Progress Indicator (Reflects Real Backend Flow) */}
      <PaymentProgressStepper currentStep={currentStep} />

      {/* Mobile & Tablet Compact Amount Card (Single Column Experience) */}
      <SubscriptionOrderSummary
        studentName={studentDisplayName}
        loginCode={activeUser?.loginCode}
        whatsappMessage={whatsappMessage}
        compactMobileOnly
      />

      {/* Registration Gate Banner when Unauthenticated / Demo Account */}
      {needsStudentRegistration && (
        <div
          role="note"
          className="rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[14px] text-[#091B40]"
        >
          <div className="flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-black text-[#091B40]">
                {isDemoAccount
                  ? "سجّل حسابك الدائم قبل تحويل المبلغ ورفع الإيصال"
                  : "سجّل بياناتك كطالب جديد قبل تحويل المبلغ"}
              </p>
              <p className="text-[#475569] leading-relaxed">
                قبل ما تحوّل المبلغ أو ترفع إيصال التحويل، لازم تسجل اسمك ورقمك عشان يطلعلك كود الطالب الخاص بيك ونربط الإيصال بحسابك مباشرة.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="min-h-[44px] px-4 rounded-xl bg-[#091B40] hover:bg-[#1D4ED8] text-white text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#E9AD32]" />
              <span>تسجيل طالب جديد</span>
            </button>
            <Link
              href="/login?callbackUrl=/subscription"
              className="min-h-[44px] px-3.5 rounded-xl border border-[#BFDBFE] bg-white hover:bg-[#F8FAFC] text-[#091B40] text-[13px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogIn className="w-4 h-4 text-[#1D4ED8]" />
              <span>معاك كود؟ ادخل</span>
            </Link>
          </div>
        </div>
      )}

      {/* Newly Registered Student Confirmation + Login Code Card */}
      {displayedRegisteredCode && !needsStudentRegistration && (
        <div
          role="status"
          className="rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#091B40]"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[15px] font-black text-[#065F46]">
                تم تسجيل حسابك بنجاح! كود الدخول الخاص بيك جاهز
              </p>
              <p className="text-[13px] sm:text-[14px] text-[#047857] leading-relaxed">
                احفظ الكود ده عشان تدخل بيه على المنصة في أي وقت، ودلوقتي حوّل مبلغ الاشتراك (200 جنيه) وارفع إيصال الدفع في الخطوتين تحت.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-white border border-[#A7F3D0] rounded-xl px-3.5 py-2">
              <span className="text-[12px] font-bold text-[#475569]">كودك:</span>
              <span
                className="text-[18px] font-black font-mono tracking-wider text-[#091B40]"
                dir="ltr"
              >
                {displayedRegisteredCode}
              </span>
              <button
                type="button"
                onClick={handleCopyLoginCode}
                className="min-h-[38px] px-2.5 rounded-lg bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] text-[12px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>اتنسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>

            {activeUser?.subscriptionStatus !== "ACTIVE" && (
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="min-h-[42px] px-3.5 rounded-xl border border-[#A7F3D0] bg-white hover:bg-[#F0FDF4] text-[#065F46] text-[12px] font-bold inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                تعديل بيانات التسجيل
              </button>
            )}
          </div>
        </div>
      )}

      {/* Allow pre-activation students returning later to review/edit saved registration without losing data */}
      {!displayedRegisteredCode &&
        !needsStudentRegistration &&
        activeUser?.subscriptionStatus !== "ACTIVE" && (
          <div className="rounded-2xl bg-[#F7F9FC] border border-[#E2E8F0] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-[#475569]">
              مسجّل باسم <strong className="text-[#091B40]">{studentDisplayName || activeUser?.name}</strong>
              {activeUser?.loginCode ? (
                <span> • كودك: <strong dir="ltr" className="font-mono text-[#091B40]">{activeUser.loginCode}</strong></span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="min-h-[38px] px-3 rounded-lg border border-[#CBD5E1] bg-white hover:border-[#800B34] text-[#091B40] font-bold transition-colors cursor-pointer"
            >
              تعديل بيانات التسجيل
            </button>
          </div>
        )}

      {/* Existing Pending Verification Banner */}
      {isAlreadyPending && (
        <div
          role="status"
          className="rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] p-4 sm:p-5 flex items-start gap-3 text-[14px] text-[#091B40]"
        >
          <Clock className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold text-[#1E3A8A]">
              لديك إيصال دفع مرفوع مسبقاً وهو قيد المراجعة حالياً
            </p>
            <p className="text-[#334155] leading-relaxed">
              حالة حسابك الآن بانتظار تأكيد الإدارة. إذا أردت استبدال الصورة أو إرسال إيصال جديد، يمكنك رفعه من النموذج أدناه.
            </p>
          </div>
        </div>
      )}

      {/* 3. Main Responsive Payment Grid (8 cols form / 4 cols desktop summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Payment Confirmation Area */}
        <div className="lg:col-span-8 space-y-6">
          {uploadSuccess ? (
            /* Successful Backend Submission State (Honest Pending Verification) */
            <section
              aria-live="polite"
              className="bg-white rounded-2xl border border-[#CBD5E1] p-6 sm:p-8 shadow-[0_4px_20px_rgba(9,27,64,0.05)] space-y-5"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF8EC] border border-[#E9AD32]/40 text-[#92620A] text-[12px] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>قيد مراجعة الإدارة</span>
                  </span>
                  <h2 className="text-[19px] sm:text-[21px] font-black text-[#091B40]">
                    تم استلام إيصال الدفع بنجاح
                  </h2>
                  <p className="text-[14px] text-[#334155] leading-relaxed">
                    {serverResponseMessage ||
                      "تم رفع صورة الإيصال وربطها بحسابك بنجاح."}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-[14px] text-[#334155] space-y-1.5">
                <p className="font-bold text-[#091B40]">ماذا يحدث الآن؟</p>
                <p className="leading-relaxed">
                  يقوم فريق الدعم بمراجعة التحويل وتأكيده قبل تفعيل الاشتراك رسمياً. لن يُفتح المحتوى إلا بعد اعتماد الإيصال من الإدارة، ويمكنك متابعة حالة التفعيل مباشرة أو مراسلتنا عبر واتساب للتسريع:
                </p>
              </div>

              <WhatsAppSupportLinks variant="buttons" message={whatsappMessage} />

              <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetToUploadAnother}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[14px] font-bold text-[#091B40] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#475569]" />
                  <span>رفع إيصال آخر أو تعديل الصورة</span>
                </button>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl bg-[#091B40] hover:bg-[#1E3A8A] text-white text-[14px] font-bold transition-colors"
                >
                  <span>العودة إلى لوحة التحكم</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </section>
          ) : (
            <form onSubmit={handleSubmitReceipt} noValidate className="space-y-6">
              {/* STEP 1 CARD: Payment Method Selector & Details */}
              <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-[0_4px_20px_rgba(9,27,64,0.04)] space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[16px] sm:text-[18px] font-black text-[#091B40]">
                    <Wallet className="w-5 h-5 text-[#1D4ED8] shrink-0" />
                    <h2>1. اختر وسيلة التحويل المعتمدة</h2>
                  </div>
                  <p className="text-[14px] text-[#475569]">
                    اختر الوسيلة التي ستستخدمها للتحويل لعرض بيانات الحساب المطلوبة فقط.
                  </p>
                </div>

                {/* Method Selector Tabs */}
                <div
                  role="radiogroup"
                  aria-label="طرق الدفع المتاحة"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`min-h-[68px] p-3.5 sm:p-4 rounded-xl border text-right transition-all flex items-start justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? "border-[#1D4ED8] bg-[#EFF6FF]/65 ring-2 ring-[#1D4ED8]/20"
                            : "border-[#E2E8F0] bg-white hover:border-[#94A3B8] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-[15px] font-extrabold text-[#091B40]">
                              {method.name}
                            </span>
                            {method.badge && (
                              <span className="px-2 py-0.5 rounded-md bg-[#FEF8EC] border border-[#E9AD32]/40 text-[#92620A] text-[11px] font-bold">
                                {method.badge}
                              </span>
                            )}
                          </div>
                          <span className="block text-[13px] text-[#475569] leading-snug">
                            {method.subtitle}
                          </span>
                        </div>

                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
                              : "border-[#CBD5E1] bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Payment Method Details (Gated Behind Student Registration First) */}
                <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 sm:p-5 space-y-4">
                  <p className="text-[14px] text-[#334155] leading-relaxed">
                    {activeMethodConfig.instructions}
                  </p>

                  {needsStudentRegistration ? (
                    <div className="rounded-xl bg-white border border-dashed border-[#CBD5E1] p-5 text-center space-y-3">
                      <p className="text-[14px] font-bold text-[#091B40]">
                        سجّل بياناتك كطالب جديد الأول عشان تظهر أرقام التحويل وتبدأ الدفع
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowRegisterModal(true)}
                        className="min-h-[44px] px-5 rounded-xl bg-[#091B40] hover:bg-[#1D4ED8] text-white text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-[#E9AD32]" />
                        <span>تسجيل طالب جديد الآن</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeMethodConfig.accounts.map((acc) => {
                        const isCopied = copiedKey === acc.key;
                        return (
                          <div
                            key={acc.key}
                            className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1 min-w-0">
                              <span className="text-[13px] font-bold text-[#475569] block">
                                {acc.label}
                              </span>
                              <span
                                className="text-[20px] sm:text-[22px] font-black font-mono tabular-nums text-[#091B40] tracking-wider block"
                                dir="ltr"
                              >
                                {acc.number}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopyAccount(acc.number, acc.key)}
                              className={`min-h-[44px] px-4 rounded-xl border text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 w-full sm:w-auto ${
                                isCopied
                                  ? "border-[#059669] bg-[#ECFDF5] text-[#059669]"
                                  : "border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-[#1D4ED8] text-[#091B40]"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-4 h-4 shrink-0" />
                                  <span>تم النسخ بنجاح</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 shrink-0 text-[#1D4ED8]" />
                                  <span>نسخ الرقم</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* STEP 2 CARD: Receipt Upload & Transaction Info */}
              <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-[0_4px_20px_rgba(9,27,64,0.04)] space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[16px] sm:text-[18px] font-black text-[#091B40]">
                    <Upload className="w-5 h-5 text-[#1D4ED8] shrink-0" />
                    <h2>2. رفع إيصال التحويل وبيانات العملية</h2>
                  </div>
                  <p className="text-[14px] text-[#475569]">
                    أرفق لقطة شاشة أو ملف PDF واضح يوضح مبلغ التحويل ({SUBSCRIPTION_PRICE_EGP} جنيه) ورقم المرسل.
                  </p>
                </div>

                {/* Global Form / Upload Error Banner */}
                {error && (
                  <div
                    role="alert"
                    className="p-3.5 sm:p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[14px] text-[#B91C1C] font-bold flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#DC2626]" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Receipt Upload Dropzone with Preview */}
                <input
                  ref={fileInputRef}
                  type="file"
                  id="receiptFileInput"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {filePreviewUrl ? (
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#CBD5E1] bg-white shrink-0">
                            <img
                              src={filePreviewUrl}
                              alt="معاينة إيصال التحويل"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] flex items-center justify-center shrink-0">
                            <FileText className="w-7 h-7" />
                          </div>
                        )}

                        <div className="min-w-0 space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#059669] text-[12px] font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>تم إرفاق الإيصال بنجاح</span>
                          </span>
                          <p className="text-[14px] font-extrabold text-[#091B40] truncate">
                            {file.name}
                          </p>
                          <p className="text-[13px] font-mono text-[#64748B]" dir="ltr">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 sm:flex-initial min-h-[44px] px-4 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[14px] font-bold text-[#091B40] transition-colors cursor-pointer"
                        >
                          تغيير الملف
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="min-h-[44px] px-3.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[14px] font-bold text-[#B91C1C] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          aria-label="إزالة الملف المختار"
                        >
                          <X className="w-4 h-4" />
                          <span>إزالة</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (needsStudentRegistration) {
                          setShowRegisterModal(true);
                          return;
                        }
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!needsStudentRegistration) setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (needsStudentRegistration) {
                        setShowRegisterModal(true);
                        return;
                      }
                      const dropped = e.dataTransfer.files?.[0];
                      if (dropped) validateAndSetFile(dropped);
                    }}
                    onClick={() => {
                      if (needsStudentRegistration) {
                        setShowRegisterModal(true);
                        return;
                      }
                      fileInputRef.current?.click();
                    }}
                    className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all cursor-pointer select-none min-h-[168px] flex flex-col items-center justify-center gap-3 ${
                      isDragging
                        ? "border-[#1D4ED8] bg-[#EFF6FF]"
                        : "border-[#CBD5E1] hover:border-[#1D4ED8] bg-[#F8FAFC] hover:bg-[#EFF6FF]/40"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] flex items-center justify-center">
                      <Upload className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[15px] sm:text-[16px] font-extrabold text-[#091B40]">
                        اضغط لاختيار صورة الإيصال أو اسحب الملف وأفلته هنا
                      </p>
                      <p className="text-[13px] text-[#475569]">
                        يدعم JPG وPNG وWEBP وPDF بحد أقصى 20 ميجابايت
                      </p>
                    </div>
                  </div>
                )}

                {/* Transaction Information Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="senderPhoneInput"
                      className="block text-[14px] font-bold text-[#091B40]"
                    >
                      رقم الموبايل المحوّل منه <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="senderPhoneInput"
                        type="tel"
                        inputMode="numeric"
                        required
                        value={senderPhone}
                        onChange={(e) => {
                          setSenderPhone(e.target.value);
                          if (!phoneTouched) setPhoneTouched(true);
                          if (error) setError(null);
                        }}
                        onBlur={() => setPhoneTouched(true)}
                        placeholder="010XXXXXXXX"
                        maxLength={15}
                        dir="ltr"
                        aria-invalid={phoneTouched && !isPhoneValid}
                        aria-describedby="senderPhoneHint"
                        className={`w-full min-h-[48px] h-12 px-4 pr-11 rounded-xl border bg-white text-[15px] font-mono text-[#091B40] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 transition-all ${
                          phoneTouched && !isPhoneValid
                            ? "border-[#DC2626] focus:ring-[#DC2626]/25"
                            : "border-[#CBD5E1] focus:border-[#1D4ED8] focus:ring-[#1D4ED8]/20"
                        }`}
                      />
                      <Smartphone className="w-4.5 h-4.5 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {phoneTouched && phoneValidationError ? (
                      <p id="senderPhoneHint" className="text-[13px] font-semibold text-[#DC2626]">
                        {phoneValidationError}
                      </p>
                    ) : (
                      <p id="senderPhoneHint" className="text-[13px] text-[#64748B]">
                        أدخل نفس الرقم الذي أرسلت منه التحويل (11 رقماً).
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="referenceInput"
                      className="block text-[14px] font-bold text-[#091B40]"
                    >
                      كود العملية / الرقم المرجعي{" "}
                      <span className="text-[#64748B] font-normal">(اختياري)</span>
                    </label>
                    <input
                      id="referenceInput"
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="REF-987654"
                      maxLength={30}
                      dir="ltr"
                      className="w-full min-h-[48px] h-12 px-4 rounded-xl border border-[#CBD5E1] bg-white text-[15px] font-mono text-[#091B40] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all"
                    />
                    <p className="text-[13px] text-[#64748B]">
                      الرقم الظاهر في رسالة تأكيد التحويل إن وُجد.
                    </p>
                  </div>
                </div>

                {/* Clear Explanation Why CTA is Disabled */}
                {disabledReasonText && (
                  <div className="px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] text-[#475569] flex items-start gap-2.5">
                    <Info className="w-4.5 h-4.5 text-[#1D4ED8] shrink-0 mt-0.5" />
                    <span>{disabledReasonText}</span>
                  </div>
                )}

                {/* Primary Navy/Royal Blue Confirmation CTA (Zero Pink Tint!) */}
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`w-full min-h-[52px] px-6 rounded-xl font-black text-[16px] flex items-center justify-center gap-2.5 transition-all ${
                    isSubmitDisabled
                      ? "bg-[#E2E8F0] text-[#475569] cursor-not-allowed border border-[#CBD5E1]"
                      : "bg-[#091B40] hover:bg-[#1D4ED8] text-white shadow-sm cursor-pointer active:scale-[0.99]"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري إرسال إيصال الدفع للمراجعة...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-[#E9AD32]" />
                      <span>تأكيد وإرسال إيصال الدفع للمراجعة</span>
                    </>
                  )}
                </button>
              </section>
            </form>
          )}
        </div>

        {/* Order Summary Column: Full Card on Desktop Right/Left Sidebar; Rendered Below Form on Mobile for Benefits/Support */}
        <div className="lg:col-span-4">
          <SubscriptionOrderSummary
            studentName={studentDisplayName}
            loginCode={activeUser?.loginCode}
            whatsappMessage={whatsappMessage}
          />
        </div>
      </div>

      {/* New Student Registration Modal (Fullscreen sheet on mobile / medium modal on desktop) */}
      <NewStudentRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        initialSystems={initialSystems}
        initialSchoolCategory={
          activeUser?.schoolCategory === "LANGUAGES" ? "LANGUAGES" : "ARABIC"
        }
        existingStudent={
          !needsStudentRegistration && activeUser
            ? {
                id: activeUser.id,
                name: activeUser.name ?? null,
                phone: activeUser.phone ?? null,
                loginCode: activeUser.loginCode ?? null,
                schoolCategory: activeUser.schoolCategory ?? null,
                gradeId: activeUser.gradeId ?? null,
                systemId: activeUser.systemId ?? null,
                trackId: activeUser.trackId ?? null,
                studyMode: activeUser.studyMode ?? null,
                centerName: activeUser.centerName ?? null,
                subscriptionStatus: activeUser.subscriptionStatus ?? "TRIAL",
              }
            : null
        }
        onRegistered={handleRegistrationSuccess}
      />
    </div>
  );
}
