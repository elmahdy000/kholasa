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
import { formatGradeShortLabel } from "@/lib/study-preferences";
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
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-[0_24px_60px_rgba(9,27,64,0.28)] overflow-hidden text-right font-sans max-h-[92vh] flex flex-col"
      >
        {/* Brand Navy + Crimson Top Accent Bar */}
        <div className="h-1.5 w-full bg-[#091B40] flex">
          <div className="w-1/3 h-full bg-[#800B34]" />
        </div>

        {/* Header */}
        <div className="px-4 pt-3.5 pb-3 sm:px-5 sm:pt-4 sm:pb-3.5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-start justify-between gap-3 shrink-0 bg-[#F7F9FC]/60 dark:bg-[#081426]">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#800B34]/10 border border-[#800B34]/20 text-[#800B34] dark:text-[#FB7185] text-[11px] sm:text-xs font-bold">
              <UserPlus className="w-3.5 h-3.5" />
              <span>خطوة قبل تحويل المبلغ ورفع الإيصال</span>
            </span>
            <h2
              id="new-student-reg-title"
              className="text-lg sm:text-xl font-black text-[#091B40] dark:text-white leading-snug"
            >
              تسجيل طالب جديد قبل الدفع
            </h2>
            <p className="text-xs sm:text-[13px] text-[#536681] dark:text-[#94A3B8] leading-relaxed">
              سجّل بياناتك الأول عشان يطلعلك كود حسابك الخاص، وبعدها تظهرلك أرقام التحويل ورفع الإيصال.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق نافذة التسجيل"
              className="min-w-[44px] min-h-[44px] -mt-1 -ml-2 inline-flex items-center justify-center rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:text-[#800B34] dark:hover:text-white hover:bg-white dark:hover:bg-[#1E293B] transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="p-4 sm:p-5 space-y-3 overflow-y-auto"
        >
          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-[#FEF2F2] dark:bg-[#450A0A]/40 border border-[#FECACA] dark:border-[#991B1B] text-xs sm:text-[13px] text-[#B91C1C] dark:text-[#FCA5A5] font-bold space-y-2"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {isConflictError && (
                <div>
                  <Link
                    href="/login?callbackUrl=/subscription"
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-[#091B40] text-white text-xs font-bold hover:bg-[#800B34] transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>الذهاب لتسجيل الدخول بكودك</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label
              htmlFor="sub-reg-name"
              className="block text-[13px] font-bold text-[#091B40] dark:text-white"
            >
              اسم الطالب بالكامل <span className="text-[#800B34]">*</span>
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
                className="w-full min-h-[44px] h-11 px-3.5 pr-10 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] text-sm text-[#091B40] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#800B34] focus:ring-2 focus:ring-[#800B34]/15 transition-all"
              />
              <User className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label
              htmlFor="sub-reg-phone"
              className="block text-[13px] font-bold text-[#091B40] dark:text-white"
            >
              رقم الموبايل (واتساب) <span className="text-[#800B34]">*</span>
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
                className="w-full min-h-[44px] h-11 px-3.5 pr-10 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] text-sm font-mono text-[#091B40] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#800B34] focus:ring-2 focus:ring-[#800B34]/15 transition-all"
              />
              <Smartphone className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-[#536681] dark:text-[#94A3B8]">
              هنستخدمه لتوثيق حسابك ومطابقة إيصال الدفع مع الإدارة.
            </p>
          </div>

          {/* School Category: Arabic vs Languages */}
          <div className="space-y-1.5">
            <span className="block text-[13px] font-bold text-[#091B40] dark:text-white">
              الشعبة / نوع المدارس <span className="text-[#800B34]">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleCategoryChange("ARABIC")}
                className={`min-h-[44px] px-3 py-2 rounded-lg border text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  schoolCategory === "ARABIC"
                    ? "border-[#091B40] bg-[#091B40] text-white dark:bg-[#800B34] dark:border-[#800B34]"
                    : "border-[#E2E8F0] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] text-[#091B40] dark:text-slate-200 hover:border-[#800B34]/60"
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>بكالوريا عربي</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange("LANGUAGES")}
                className={`min-h-[44px] px-3 py-2 rounded-lg border text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  schoolCategory === "LANGUAGES"
                    ? "border-[#091B40] bg-[#091B40] text-white dark:bg-[#800B34] dark:border-[#800B34]"
                    : "border-[#E2E8F0] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] text-[#091B40] dark:text-slate-200 hover:border-[#800B34]/60"
                }`}
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span>بكالوريا لغات</span>
              </button>
            </div>
          </div>

          {/* Grade Selector */}
          <div className="space-y-1">
            <label
              htmlFor="sub-reg-grade"
              className="block text-[13px] font-bold text-[#091B40] dark:text-white"
            >
              الصف الدراسي <span className="text-[#800B34]">*</span>
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
                className="w-full min-h-[44px] h-11 px-3.5 pr-10 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] text-[13px] font-bold text-[#091B40] dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#800B34] focus:ring-2 focus:ring-[#800B34]/15 transition-all disabled:opacity-60"
              >
                {isLoadingSystems ? (
                  <option value="">جاري تحميل الصفوف الدراسية...</option>
                ) : gradeOptions.length === 0 ? (
                  <option value="">لا توجد صفوف متاحة حالياً</option>
                ) : (
                  gradeOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                      {formatGradeShortLabel(g.code, g.name)}
                    </option>
                  ))
                )}
              </select>
              <GraduationCap className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Track Selector if Grade has Academic Tracks */}
          {activeGrade?.tracks && activeGrade.tracks.length > 0 && (
            <div className="space-y-1">
              <label
                htmlFor="sub-reg-track"
                className="block text-[13px] font-bold text-[#091B40] dark:text-white"
              >
                المسار / التخصص{" "}
                <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">(اختياري)</span>
              </label>
              <select
                id="sub-reg-track"
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value)}
                className="w-full min-h-[44px] h-11 px-3.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] text-[13px] font-bold text-[#091B40] dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#800B34] focus:ring-2 focus:ring-[#800B34]/15 transition-all"
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
          <div className="space-y-1.5">
            <span className="block text-[13px] font-bold text-[#091B40] dark:text-white">
              طريقة المذاكرة
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStudyMode("ONLINE")}
                className={`min-h-[44px] px-3 py-2 rounded-lg border text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  studyMode === "ONLINE"
                    ? "border-[#091B40] bg-[#091B40] text-white dark:bg-[#800B34] dark:border-[#800B34]"
                    : "border-[#E2E8F0] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] text-[#091B40] dark:text-slate-200 hover:border-[#800B34]/60"
                }`}
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span>أونلاين</span>
              </button>
              <button
                type="button"
                onClick={() => setStudyMode("OFFLINE")}
                className={`min-h-[44px] px-3 py-2 rounded-lg border text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  studyMode === "OFFLINE"
                    ? "border-[#091B40] bg-[#091B40] text-white dark:bg-[#800B34] dark:border-[#800B34]"
                    : "border-[#E2E8F0] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] text-[#091B40] dark:text-slate-200 hover:border-[#800B34]/60"
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>طالب سنتر</span>
              </button>
            </div>

            {studyMode === "OFFLINE" && (
              <div className="space-y-2 pt-1">
                <select
                  aria-label="اختيار السنتر التعليمي"
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="w-full min-h-[44px] h-11 px-3.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] text-[13px] font-bold text-[#091B40] dark:text-white focus:outline-none focus:border-[#800B34]"
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
                    className="w-full min-h-[44px] h-11 px-3.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] text-[13px] text-[#091B40] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800B34]"
                  />
                )}
              </div>
            )}
          </div>

          {/* Primary Submit Action (EL KHOLASA Crimson Identity) */}
          <button
            type="submit"
            disabled={isSubmitting || isLoadingSystems}
            className="w-full min-h-[48px] px-5 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white font-black text-sm sm:text-[15px] flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري تسجيل بياناتك...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4.5 h-4.5 text-white shrink-0" />
                <span>تسجيل الطالب والمتابعة للدفع</span>
              </>
            )}
          </button>

          {/* Existing Student Link */}
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] text-center">
            <Link
              href="/login?callbackUrl=/subscription"
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-[#E2E8F0] hover:text-[#800B34] dark:hover:text-[#FB7185] transition-colors"
            >
              <LogIn className="w-4 h-4 text-[#800B34] dark:text-[#FB7185]" />
              <span>معاك كود طالب بالفعل؟ سجّل دخول من هنا</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

