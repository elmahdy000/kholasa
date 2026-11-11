"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  Building2,
  Globe,
  GraduationCap,
  Loader2,
  LogIn,
  ShieldCheck,
  Smartphone,
  User,
  UserPlus,
  X,
} from "lucide-react";
import {
  ARABIC_CENTERS,
  LANGUAGES_CENTERS,
  OTHER_CENTER_NAME,
} from "@/lib/centers";
import { getOrCreateDeviceId } from "@/lib/device";
import { normalizeDigits } from "@/lib/validation/auth";

export interface PublicTrackOption {
  id: string;
  name: string;
  code: string;
}

export interface PublicGradeOption {
  id: string;
  name: string;
  code: string;
  _count?: { subjects: number };
  tracks?: PublicTrackOption[];
}

export interface PublicSystemOption {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  grades: PublicGradeOption[];
}

export interface RegisteredSubscriptionStudent {
  id: string;
  name: string | null;
  phone: string | null;
  loginCode: string | null;
  schoolCategory: string | null;
  gradeId: string | null;
  systemId: string | null;
  trackId?: string | null;
  studyMode?: string | null;
  centerName?: string | null;
  subscriptionStatus: string;
}

interface NewStudentRegistrationModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialSystems?: PublicSystemOption[];
  initialSchoolCategory?: "ARABIC" | "LANGUAGES";
  onRegistered: (student: RegisteredSubscriptionStudent) => void;
}

export function NewStudentRegistrationModal({
  isOpen,
  onClose,
  initialSystems,
  initialSchoolCategory = "ARABIC",
  onRegistered,
}: NewStudentRegistrationModalProps) {
  const [systems, setSystems] = useState<PublicSystemOption[]>(
    () => initialSystems ?? []
  );
  const [isLoadingSystems, setIsLoadingSystems] = useState(
    () => !initialSystems || initialSystems.length === 0
  );

  // Compute flattened selectable grades cleanly (preferring grades that have published subjects)
  const gradeOptions = useMemo(() => {
    const allGrades = systems
      .filter((s) => !s.code?.startsWith("test_"))
      .flatMap((s) =>
        s.grades
          .filter((g) => !g.code?.startsWith("test_"))
          .map((g) => ({
            ...g,
            systemId: s.id,
            systemName: s.name,
            publishedCount: g._count?.subjects ?? 0,
          }))
      );
    const withPublished = allGrades.filter((g) => g.publishedCount > 0);
    return withPublished.length > 0 ? withPublished : allGrades;
  }, [systems]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolCategory, setSchoolCategory] = useState<"ARABIC" | "LANGUAGES">(
    initialSchoolCategory
  );
  const [selectedGradeId, setSelectedGradeId] = useState<string>(
    () => gradeOptions[0]?.id || ""
  );
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [studyMode, setStudyMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [selectedCenter, setSelectedCenter] = useState<string>(() =>
    initialSchoolCategory === "LANGUAGES"
      ? LANGUAGES_CENTERS[0]?.name || OTHER_CENTER_NAME
      : ARABIC_CENTERS[0]?.name || OTHER_CENTER_NAME
  );
  const [customCenter, setCustomCenter] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isConflictError, setIsConflictError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const effectiveGradeId = useMemo(() => {
    if (selectedGradeId && gradeOptions.some((g) => g.id === selectedGradeId)) {
      return selectedGradeId;
    }
    return gradeOptions[0]?.id || "";
  }, [gradeOptions, selectedGradeId]);

  const activeGrade = useMemo(
    () => gradeOptions.find((g) => g.id === effectiveGradeId) || null,
    [gradeOptions, effectiveGradeId]
  );

  const availableCenters =
    schoolCategory === "LANGUAGES" ? LANGUAGES_CENTERS : ARABIC_CENTERS;

  // Lazy load public systems only if server didn't provide them
  useEffect(() => {
    if (!isOpen || systems.length > 0) return;

    let cancelled = false;
    fetch("/api/systems")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data?.systems)) {
          setSystems(data.systems);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setIsLoadingSystems(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, systems.length]);

  // Close with Escape key when dismissible
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: "ARABIC" | "LANGUAGES") => {
    setSchoolCategory(cat);
    const matchingCenters = cat === "LANGUAGES" ? LANGUAGES_CENTERS : ARABIC_CENTERS;
    setSelectedCenter(matchingCenters[0]?.name || OTHER_CENTER_NAME);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || isSubmitting) return;

    setError(null);
    setIsConflictError(false);

    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      setError("يرجى كتابة اسم الطالب الثلاثي على الأقل.");
      return;
    }

    const cleanPhone = normalizeDigits(phone);
    if (!/^01[0125]\d{8}$/.test(cleanPhone)) {
      setError(
        "يرجى إدخال رقم موبايل مصري صحيح مكون من 11 رقماً (يبدأ بـ 010 أو 011 أو 012 أو 015)."
      );
      return;
    }

    if (!effectiveGradeId) {
      setError("يرجى اختيار الصف الدراسي أولاً.");
      return;
    }

    const resolvedCenterName =
      studyMode === "OFFLINE"
        ? selectedCenter === OTHER_CENTER_NAME
          ? customCenter.trim()
          : selectedCenter
        : null;

    if (studyMode === "OFFLINE" && !resolvedCenterName) {
      setError("يرجى اختيار أو كتابة اسم السنتر التعليمي.");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch("/api/student/subscription/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: cleanPhone,
          schoolCategory,
          gradeId: effectiveGradeId,
          trackId: selectedTrackId || null,
          studyMode,
          centerName: resolvedCenterName,
          deviceId: deviceId || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setIsConflictError(true);
        }
        throw new Error(
          data.error || "تعذر تسجيل بيانات الطالب، يرجى المحاولة مرة أخرى."
        );
      }

      if (!data.user) {
        throw new Error("تم إنشاء الحساب ولكن تعذر استلام البيانات.");
      }

      onRegistered(data.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ غير متوقع أثناء التسجيل."
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-student-reg-title"
      dir="rtl"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-[#091B40]/60 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={() => onClose?.()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_24px_60px_rgba(9,27,64,0.28)] overflow-hidden text-right font-sans max-h-[92vh] flex flex-col"
      >
        {/* Top Navy + Gold Fintech Accent Bar */}
        <div className="h-1.5 w-full bg-[#091B40] flex">
          <div className="w-1/3 h-full bg-[#E9AD32]" />
        </div>

        {/* Header */}
        <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4 border-b border-[#E2E8F0] flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[12px] font-bold">
              <UserPlus className="w-3.5 h-3.5" />
              <span>خطوة قبل تحويل المبلغ ورفع الإيصال</span>
            </span>
            <h2
              id="new-student-reg-title"
              className="text-[18px] sm:text-[20px] font-black text-[#091B40] leading-snug"
            >
              تسجيل طالب جديد قبل الدفع
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#475569] leading-relaxed">
              سجّل بياناتك الأول عشان يطلعلك كود حسابك الخاص، وبعدها تظهرلك أرقام التحويل ورفع الإيصال.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق نافذة التسجيل"
              className="min-w-[44px] min-h-[44px] -mt-1 -ml-2 inline-flex items-center justify-center rounded-xl text-[#64748B] hover:text-[#091B40] hover:bg-[#F8FAFC] transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto"
        >
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] sm:text-[14px] text-[#B91C1C] font-bold space-y-2"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-[#DC2626] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {isConflictError && (
                <div>
                  <Link
                    href="/login?callbackUrl=/subscription"
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-[#091B40] text-white text-[13px] font-bold hover:bg-[#1D4ED8] transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>الذهاب لتسجيل الدخول بكودك</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="sub-reg-name"
              className="block text-[14px] font-bold text-[#091B40]"
            >
              اسم الطالب بالكامل <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <input
                id="sub-reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="مثال: أحمد محمود محمد"
                maxLength={100}
                className="w-full min-h-[44px] h-11 sm:h-12 px-4 pr-11 rounded-xl border border-[#CBD5E1] bg-white text-[15px] text-[#091B40] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all"
              />
              <User className="w-4.5 h-4.5 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label
              htmlFor="sub-reg-phone"
              className="block text-[14px] font-bold text-[#091B40]"
            >
              رقم الموبايل (واتساب) <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <input
                id="sub-reg-phone"
                type="tel"
                inputMode="numeric"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError(null);
                  if (isConflictError) setIsConflictError(false);
                }}
                placeholder="010XXXXXXXX"
                maxLength={15}
                className="w-full min-h-[44px] h-11 sm:h-12 px-4 pr-11 rounded-xl border border-[#CBD5E1] bg-white text-[15px] font-mono text-[#091B40] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all"
              />
              <Smartphone className="w-4.5 h-4.5 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[12px] text-[#64748B]">
              هنستخدمه لتوثيق حسابك ومطابقة إيصال الدفع مع الإدارة.
            </p>
          </div>

          {/* School Category: Arabic vs Languages */}
          <div className="space-y-1.5">
            <span className="block text-[14px] font-bold text-[#091B40]">
              الشعبة / نوع المدارس <span className="text-[#DC2626]">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleCategoryChange("ARABIC")}
                className={`min-h-[48px] px-3 py-2.5 rounded-xl border text-[14px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  schoolCategory === "ARABIC"
                    ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#091B40] ring-2 ring-[#1D4ED8]/20"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#94A3B8]"
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                <span>بكالوريا عربي</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange("LANGUAGES")}
                className={`min-h-[48px] px-3 py-2.5 rounded-xl border text-[14px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  schoolCategory === "LANGUAGES"
                    ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#091B40] ring-2 ring-[#1D4ED8]/20"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#94A3B8]"
                }`}
              >
                <Globe className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                <span>بكالوريا لغات</span>
              </button>
            </div>
          </div>

          {/* Grade Selector */}
          <div className="space-y-1.5">
            <label
              htmlFor="sub-reg-grade"
              className="block text-[14px] font-bold text-[#091B40]"
            >
              الصف الدراسي <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <select
                id="sub-reg-grade"
                value={effectiveGradeId}
                disabled={isLoadingSystems || gradeOptions.length === 0}
                onChange={(e) => {
                  setSelectedGradeId(e.target.value);
                  setSelectedTrackId("");
                }}
                className="w-full min-h-[44px] h-11 sm:h-12 px-4 pr-11 rounded-xl border border-[#CBD5E1] bg-white text-[14px] font-bold text-[#091B40] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all disabled:opacity-60"
              >
                {isLoadingSystems ? (
                  <option value="">جاري تحميل الصفوف الدراسية...</option>
                ) : gradeOptions.length === 0 ? (
                  <option value="">لا توجد صفوف متاحة حالياً</option>
                ) : (
                  gradeOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))
                )}
              </select>
              <GraduationCap className="w-4.5 h-4.5 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Track Selector if Grade has Academic Tracks */}
          {activeGrade?.tracks && activeGrade.tracks.length > 0 && (
            <div className="space-y-1.5">
              <label
                htmlFor="sub-reg-track"
                className="block text-[14px] font-bold text-[#091B40]"
              >
                المسار / التخصص{" "}
                <span className="text-[#64748B] font-normal">(اختياري)</span>
              </label>
              <select
                id="sub-reg-track"
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value)}
                className="w-full min-h-[44px] h-11 sm:h-12 px-4 rounded-xl border border-[#CBD5E1] bg-white text-[14px] font-bold text-[#091B40] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all"
              >
                <option value="">مسار عام (كل المواد المتاحة للصف)</option>
                {activeGrade.tracks.map((tr) => (
                  <option key={tr.id} value={tr.id}>
                    {tr.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Study Mode (Online vs Center) */}
          <div className="space-y-2">
            <span className="block text-[14px] font-bold text-[#091B40]">
              طريقة المذاكرة
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStudyMode("ONLINE")}
                className={`min-h-[44px] px-3 py-2 rounded-xl border text-[13px] sm:text-[14px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  studyMode === "ONLINE"
                    ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#091B40] ring-2 ring-[#1D4ED8]/20"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#94A3B8]"
                }`}
              >
                <Globe className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                <span>أونلاين</span>
              </button>
              <button
                type="button"
                onClick={() => setStudyMode("OFFLINE")}
                className={`min-h-[44px] px-3 py-2 rounded-xl border text-[13px] sm:text-[14px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  studyMode === "OFFLINE"
                    ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#091B40] ring-2 ring-[#1D4ED8]/20"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#94A3B8]"
                }`}
              >
                <Building2 className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                <span>طالب سنتر</span>
              </button>
            </div>

            {studyMode === "OFFLINE" && (
              <div className="space-y-2 pt-1">
                <select
                  aria-label="اختيار السنتر التعليمي"
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="w-full min-h-[44px] h-11 px-3.5 rounded-xl border border-[#CBD5E1] bg-white text-[14px] font-bold text-[#091B40] focus:outline-none focus:border-[#1D4ED8]"
                >
                  {availableCenters.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value={OTHER_CENTER_NAME}>{OTHER_CENTER_NAME}</option>
                </select>

                {selectedCenter === OTHER_CENTER_NAME && (
                  <input
                    type="text"
                    value={customCenter}
                    onChange={(e) => setCustomCenter(e.target.value)}
                    placeholder="اكتب اسم السنتر هنا..."
                    maxLength={100}
                    className="w-full min-h-[44px] h-11 px-3.5 rounded-xl border border-[#CBD5E1] bg-white text-[14px] text-[#091B40] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8]"
                  />
                )}
              </div>
            )}
          </div>

          {/* Primary Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting || isLoadingSystems}
            className="w-full min-h-[50px] px-5 rounded-xl bg-[#091B40] hover:bg-[#1D4ED8] text-white font-black text-[15px] flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>جاري تسجيل بياناتك...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-[#E9AD32]" />
                <span>تسجيل الطالب والمتابعة للدفع</span>
              </>
            )}
          </button>

          {/* Existing Student Link */}
          <div className="pt-2 border-t border-[#E2E8F0] text-center">
            <Link
              href="/login?callbackUrl=/subscription"
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 text-[13px] font-bold text-[#1D4ED8] hover:underline"
            >
              <LogIn className="w-4 h-4" />
              <span>معاك كود طالب بالفعل؟ سجّل دخول من هنا</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

