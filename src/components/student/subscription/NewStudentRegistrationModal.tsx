"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Globe,
  GraduationCap,
  Loader2,
  LogIn,
  ShieldCheck,
  Smartphone,
  User,
  Wallet,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  ARABIC_CENTERS,
  LANGUAGES_CENTERS,
  OTHER_CENTER_NAME,
} from "@/lib/centers";
import { getOrCreateDeviceId } from "@/lib/device";
import {
  formatGradeShortLabel,
  readStudyPreferencesClient,
  saveStudyPreferencesClient,
} from "@/lib/study-preferences";
import { normalizeDigits } from "@/lib/validation/auth";
import {
  PAYMENT_METHODS,
  SUBSCRIPTION_BENEFITS,
  SUBSCRIPTION_PRICE_EGP,
} from "./payment-methods";

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
  existingStudent?: RegisteredSubscriptionStudent | null;
  onRegistered: (student: RegisteredSubscriptionStudent) => void;
}

type RegStep = 1 | 2 | 3;

const REG_DRAFT_STORAGE_KEY = "kholasa_sub_reg_draft_v1";

interface RegistrationDraft {
  step: RegStep;
  name: string;
  phone: string;
  schoolCategory: "ARABIC" | "LANGUAGES";
  gradeId: string;
  trackId: string;
  studyMode: "ONLINE" | "OFFLINE";
  selectedCenter: string;
  customCenter: string;
}

function resolveInitialDraft(
  existingStudent: RegisteredSubscriptionStudent | null | undefined,
  initialSchoolCategory: "ARABIC" | "LANGUAGES",
  defaultGradeId: string
): RegistrationDraft {
  const defaultCat: "ARABIC" | "LANGUAGES" =
    existingStudent?.schoolCategory === "LANGUAGES"
      ? "LANGUAGES"
      : existingStudent?.schoolCategory === "ARABIC"
        ? "ARABIC"
        : initialSchoolCategory;

  const baseCenters =
    defaultCat === "LANGUAGES" ? LANGUAGES_CENTERS : ARABIC_CENTERS;
  const fallbackCenter = baseCenters[0]?.name || OTHER_CENTER_NAME;

  if (existingStudent && existingStudent.id) {
    const knownCenter = existingStudent.centerName
      ? baseCenters.some((c) => c.name === existingStudent.centerName)
      : false;
    return {
      step: 1,
      name: existingStudent.name || "",
      phone: existingStudent.phone || "",
      schoolCategory: defaultCat,
      gradeId: existingStudent.gradeId || defaultGradeId,
      trackId: existingStudent.trackId || "",
      studyMode: existingStudent.studyMode === "OFFLINE" ? "OFFLINE" : "ONLINE",
      selectedCenter: existingStudent.centerName
        ? knownCenter
          ? existingStudent.centerName
          : OTHER_CENTER_NAME
        : fallbackCenter,
      customCenter:
        existingStudent.centerName && !knownCenter
          ? existingStudent.centerName
          : "",
    };
  }

  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(REG_DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<RegistrationDraft>;
        const cat =
          parsed.schoolCategory === "LANGUAGES" || parsed.schoolCategory === "ARABIC"
            ? parsed.schoolCategory
            : defaultCat;
        const centersForCat = cat === "LANGUAGES" ? LANGUAGES_CENTERS : ARABIC_CENTERS;
        return {
          step: parsed.step === 2 || parsed.step === 3 ? parsed.step : 1,
          name: typeof parsed.name === "string" ? parsed.name : "",
          phone: typeof parsed.phone === "string" ? parsed.phone : "",
          schoolCategory: cat,
          gradeId:
            typeof parsed.gradeId === "string" && parsed.gradeId
              ? parsed.gradeId
              : defaultGradeId,
          trackId: typeof parsed.trackId === "string" ? parsed.trackId : "",
          studyMode: parsed.studyMode === "OFFLINE" ? "OFFLINE" : "ONLINE",
          selectedCenter:
            typeof parsed.selectedCenter === "string" && parsed.selectedCenter
              ? parsed.selectedCenter
              : centersForCat[0]?.name || OTHER_CENTER_NAME,
          customCenter:
            typeof parsed.customCenter === "string" ? parsed.customCenter : "",
        };
      }
    } catch {
      // ignore storage errors
    }

    const landingPrefs = readStudyPreferencesClient();
    if (landingPrefs.schoolCategory || landingPrefs.gradeId) {
      const cat = landingPrefs.schoolCategory ?? defaultCat;
      const centersForCat = cat === "LANGUAGES" ? LANGUAGES_CENTERS : ARABIC_CENTERS;
      return {
        step: 1,
        name: "",
        phone: "",
        schoolCategory: cat,
        gradeId: landingPrefs.gradeId || defaultGradeId,
        trackId: "",
        studyMode: "ONLINE",
        selectedCenter: centersForCat[0]?.name || OTHER_CENTER_NAME,
        customCenter: "",
      };
    }
  }

  return {
    step: 1,
    name: "",
    phone: "",
    schoolCategory: defaultCat,
    gradeId: defaultGradeId,
    trackId: "",
    studyMode: "ONLINE",
    selectedCenter: fallbackCenter,
    customCenter: "",
  };
}

function getDynamicTrackLabel(
  track: PublicTrackOption,
  schoolCategory: "ARABIC" | "LANGUAGES"
): string {
  if (schoolCategory === "LANGUAGES") {
    if (track.code === "medical") return `${track.name} (لغات)`;
    if (track.code === "engineering") return `${track.name} (لغات)`;
    if (track.code === "business") return `${track.name} (لغات)`;
    if (track.code === "arts") return `${track.name} (لغات)`;
  }
  return track.name;
}

export function NewStudentRegistrationModal({
  isOpen,
  onClose,
  initialSystems,
  initialSchoolCategory = "ARABIC",
  existingStudent = null,
  onRegistered,
}: NewStudentRegistrationModalProps) {
  const [systems, setSystems] = useState<PublicSystemOption[]>(
    () => initialSystems ?? []
  );
  const [isLoadingSystems, setIsLoadingSystems] = useState(
    () => !initialSystems || initialSystems.length === 0
  );

  // All official non-test grades sorted cleanly
  const gradeOptions = useMemo(() => {
    return systems
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
  }, [systems]);

  const defaultGradeId = useMemo(() => {
    const withPublished = gradeOptions.find((g) => g.publishedCount > 0);
    return withPublished?.id || gradeOptions[0]?.id || "";
  }, [gradeOptions]);

  const initialDraft = useMemo(
    () => resolveInitialDraft(existingStudent, initialSchoolCategory, defaultGradeId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingStudent?.id]
  );

  const [step, setStep] = useState<RegStep>(initialDraft.step);
  const [name, setName] = useState(initialDraft.name);
  const [phone, setPhone] = useState(initialDraft.phone);
  const [schoolCategory, setSchoolCategory] = useState<"ARABIC" | "LANGUAGES">(
    initialDraft.schoolCategory
  );
  const [selectedGradeId, setSelectedGradeId] = useState<string>(initialDraft.gradeId);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(initialDraft.trackId);
  const [studyMode, setStudyMode] = useState<"ONLINE" | "OFFLINE">(initialDraft.studyMode);
  const [selectedCenter, setSelectedCenter] = useState<string>(initialDraft.selectedCenter);
  const [customCenter, setCustomCenter] = useState(initialDraft.customCenter);

  const [error, setError] = useState<string | null>(null);
  const [isConflictError, setIsConflictError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isEditingExisting = Boolean(existingStudent?.id);

  const effectiveGradeId = useMemo(() => {
    if (selectedGradeId && gradeOptions.some((g) => g.id === selectedGradeId)) {
      return selectedGradeId;
    }
    return defaultGradeId;
  }, [gradeOptions, selectedGradeId, defaultGradeId]);

  const activeGrade = useMemo(
    () => gradeOptions.find((g) => g.id === effectiveGradeId) || null,
    [gradeOptions, effectiveGradeId]
  );

  // Dynamic tracks for the currently selected grade & school category
  const dynamicTracks = useMemo(() => {
    const rawTracks = activeGrade?.tracks ?? [];
    return rawTracks.map((tr) => ({
      ...tr,
      displayName: getDynamicTrackLabel(tr, schoolCategory),
    }));
  }, [activeGrade, schoolCategory]);

  const effectiveTrackId = useMemo(() => {
    if (selectedTrackId && dynamicTracks.some((t) => t.id === selectedTrackId)) {
      return selectedTrackId;
    }
    return "";
  }, [dynamicTracks, selectedTrackId]);

  const availableCenters =
    schoolCategory === "LANGUAGES" ? LANGUAGES_CENTERS : ARABIC_CENTERS;

  // Persist registration draft smoothly in sessionStorage across back/reload
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload: RegistrationDraft = {
        step,
        name,
        phone,
        schoolCategory,
        gradeId: effectiveGradeId,
        trackId: effectiveTrackId,
        studyMode,
        selectedCenter,
        customCenter,
      };
      window.sessionStorage.setItem(REG_DRAFT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }, [
    step,
    name,
    phone,
    schoolCategory,
    effectiveGradeId,
    effectiveTrackId,
    studyMode,
    selectedCenter,
    customCenter,
  ]);

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

  const scrollBodyTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const keepFieldAboveKeyboard = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.currentTarget;
    setTimeout(() => {
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 150);
  };

  const handleCategoryChange = (cat: "ARABIC" | "LANGUAGES") => {
    setSchoolCategory(cat);
    const matchingCenters = cat === "LANGUAGES" ? LANGUAGES_CENTERS : ARABIC_CENTERS;
    setSelectedCenter(matchingCenters[0]?.name || OTHER_CENTER_NAME);
    setSelectedTrackId("");
    setError(null);
  };

  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedTrackId("");
    setError(null);
  };

  const validateStep1 = (): boolean => {
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      setError("يرجى كتابة اسم الطالب الثلاثي على الأقل.");
      return false;
    }
    const cleanPhone = normalizeDigits(phone);
    if (!/^01[0125]\d{8}$/.test(cleanPhone)) {
      setError(
        "يرجى إدخال رقم موبايل مصري صحيح مكون من 11 رقماً (يبدأ بـ 010 أو 011 أو 012 أو 015)."
      );
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!effectiveGradeId) {
      setError("يرجى اختيار الصف الدراسي أولاً.");
      return false;
    }
    if (studyMode === "OFFLINE") {
      const center =
        selectedCenter === OTHER_CENTER_NAME ? customCenter.trim() : selectedCenter;
      if (!center) {
        setError("يرجى اختيار أو كتابة اسم السنتر التعليمي.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    setError(null);
    setIsConflictError(false);

    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
      scrollBodyTop();
      return;
    }

    if (step === 2) {
      if (!validateStep2()) return;
      setStep(3);
      scrollBodyTop();
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setIsConflictError(false);
    if (step === 3) {
      setStep(2);
      scrollBodyTop();
    } else if (step === 2) {
      setStep(1);
      scrollBodyTop();
    }
  };

  const handleFinalSubmit = async () => {
    if (submittingRef.current || isSubmitting) return;

    setError(null);
    setIsConflictError(false);

    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!validateStep2()) {
      setStep(2);
      return;
    }

    const cleanPhone = normalizeDigits(phone);
    const resolvedCenterName =
      studyMode === "OFFLINE"
        ? selectedCenter === OTHER_CENTER_NAME
          ? customCenter.trim()
          : selectedCenter
        : null;

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch("/api/student/subscription/register", {
        method: isEditingExisting ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          schoolCategory,
          gradeId: effectiveGradeId,
          trackId: effectiveTrackId || null,
          studyMode,
          centerName: resolvedCenterName,
          deviceId: deviceId || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setIsConflictError(true);
          setStep(1);
        }
        throw new Error(
          data.error || "تعذر تسجيل بيانات الطالب، يرجى المحاولة مرة أخرى."
        );
      }

      if (!data.user) {
        throw new Error("تم حفظ الحساب ولكن تعذر استلام البيانات.");
      }

      saveStudyPreferencesClient(
        {
          gradeId: activeGrade?.id ?? null,
          gradeCode: activeGrade?.code ?? null,
          schoolCategory,
        },
        { syncUrl: false }
      );

      onRegistered(data.user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء التسجيل."
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const stepTitles: Record<RegStep, string> = {
    1: "بيانات الطالب الأساسية",
    2: "الصف والشعبة ونظام الدراسة",
    3: "قيمة الاشتراك وبيانات التحويل",
  };

  const activeTrackLabel =
    dynamicTracks.find((t) => t.id === effectiveTrackId)?.name ||
    "مسار عام (كل المواد المتاحة)";
  const activeGradeLabel = activeGrade
    ? formatGradeShortLabel(activeGrade.code, activeGrade.name)
    : "—";
  const resolvedCenterDisplay =
    studyMode === "OFFLINE"
      ? selectedCenter === OTHER_CENTER_NAME
        ? customCenter.trim() || "سنتر آخر"
        : selectedCenter
      : "أونلاين (من المنزل)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-student-reg-title"
      dir="rtl"
      className="fixed inset-0 z-[70] flex items-stretch sm:items-center justify-center p-0 sm:p-5 bg-[#091B40]/60 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={() => onClose?.()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-[100dvh] sm:h-auto sm:max-h-[90dvh] sm:max-w-[520px] rounded-none sm:rounded-2xl bg-[#F7F9FC] dark:bg-[#091B40] sm:bg-white sm:dark:bg-[#0D214D] sm:border sm:border-[#E2E8F0] sm:dark:border-[#1E3A6E] shadow-[0_24px_60px_rgba(9,27,64,0.28)] overflow-hidden text-right font-sans flex flex-col"
      >
        {/* 1. FIXED HEADER: Close Button + Brand + Step Indicator */}
        <header className="shrink-0 bg-white dark:bg-[#0D214D] border-b border-[#E2E8F0] dark:border-[#1E3A6E] px-4 py-3 sm:px-5 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <BrandLogo
                variant="combined"
                size="xs"
                showSubtitle={false}
                glow={false}
                priority
              />
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق نافذة التسجيل"
                className="min-w-[44px] min-h-[44px] -ml-1.5 inline-flex items-center justify-center rounded-xl text-[#536681] dark:text-[#94A3B8] hover:text-[#800B34] dark:hover:text-white hover:bg-[#F7F9FC] dark:hover:bg-[#1E3A6E] transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Step Indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <h2
                id="new-student-reg-title"
                className="font-black text-[#091B40] dark:text-white text-sm sm:text-[15px]"
              >
                {stepTitles[step]}
              </h2>
              <span className="font-bold text-[#800B34] dark:text-[#FB7185] shrink-0">
                الخطوة {step} من 3
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
              {([1, 2, 3] as const).map((idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-colors ${
                    idx <= step
                      ? "bg-[#800B34] dark:bg-[#FB7185]"
                      : "bg-[#E2E8F0] dark:bg-[#1E3A6E]"
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        {/* 2. SCROLLABLE CONTENT AREA (Single Focused Step per Screen) */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-5 pb-6"
        >
          <div className="bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] rounded-2xl p-4 sm:border-0 sm:p-0 sm:bg-transparent space-y-4">
            {error && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-[#450A0A]/40 border border-[#FECACA] dark:border-[#991B1B] text-xs sm:text-[13px] text-[#B91C1C] dark:text-[#FCA5A5] font-bold space-y-2"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {isConflictError && (
                  <Link
                    href="/login?callbackUrl=/subscription"
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-xl bg-[#091B40] text-white text-xs font-bold hover:bg-[#800B34] transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>الذهاب لتسجيل الدخول بكودك</span>
                  </Link>
                )}
              </div>
            )}

            {/* STEP 1: STUDENT NAME & MOBILE */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs sm:text-[13px] text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                  سجّل بياناتك في دقيقة عشان يطلعلك كود الطالب الخاص بيك قبل ما تحوّل قيمة الاشتراك.
                </p>

                <div className="space-y-1.5">
                  <label
                    htmlFor="sub-reg-name"
                    className="block text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-[#F7F9FC]"
                  >
                    اسم الطالب بالكامل <span className="text-[#800B34]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="sub-reg-name"
                      type="text"
                      required
                      value={name}
                      onFocus={keepFieldAboveKeyboard}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="مثال: أحمد محمود محمد"
                      maxLength={100}
                      className="w-full h-11 pr-10 pl-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F7F9FC] dark:bg-[#071737] text-sm font-semibold text-[#091B40] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#800B34] focus:border-transparent transition-all"
                    />
                    <User className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="sub-reg-phone"
                    className="block text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-[#F7F9FC]"
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
                      onFocus={keepFieldAboveKeyboard}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (error) setError(null);
                        if (isConflictError) setIsConflictError(false);
                      }}
                      placeholder="010XXXXXXXX"
                      maxLength={15}
                      className="w-full h-11 pr-10 pl-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F7F9FC] dark:bg-[#071737] text-sm font-mono font-bold text-[#091B40] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#800B34] focus:border-transparent transition-all"
                    />
                    <Smartphone className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-[#536681] dark:text-[#94A3B8]">
                    بنستخدمه لتوثيق حسابك ومطابقة إيصال الدفع مع الإدارة.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E3A6E] text-center">
                  <Link
                    href="/login?callbackUrl=/subscription"
                    className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3 text-xs font-bold text-[#800B34] dark:text-[#E9AD32] hover:underline"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>معاك كود طالب بالفعل؟ سجّل دخول من هنا</span>
                  </Link>
                </div>
              </div>
            )}

            {/* STEP 2: GRADE, SCHOOL CATEGORY, DYNAMIC TRACK, STUDY MODE (+ CONDITIONAL CENTER) */}
            {step === 2 && (
              <div className="space-y-4">
                {/* School Category */}
                <div className="space-y-1.5">
                  <span className="block text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-[#F7F9FC]">
                    نوع المدارس <span className="text-[#800B34]">*</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] dark:bg-[#071737] rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E]">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange("ARABIC")}
                      className={`min-h-[44px] px-2.5 py-2 rounded-lg transition-all border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer ${
                        schoolCategory === "ARABIC"
                          ? "bg-white dark:bg-[#0D214D] text-[#800B34] dark:text-[#E9AD32] border-[#800B34]/30 dark:border-[#E9AD32]/40 shadow-sm"
                          : "border-transparent text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>مدارس عربي</span>
                      {schoolCategory === "ARABIC" && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCategoryChange("LANGUAGES")}
                      className={`min-h-[44px] px-2.5 py-2 rounded-lg transition-all border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer ${
                        schoolCategory === "LANGUAGES"
                          ? "bg-white dark:bg-[#0D214D] text-[#800B34] dark:text-[#E9AD32] border-[#800B34]/30 dark:border-[#E9AD32]/40 shadow-sm"
                          : "border-transparent text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span>مدارس لغات</span>
                      {schoolCategory === "LANGUAGES" && (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Grade Selection */}
                <div className="space-y-1.5">
                  <span className="block text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-[#F7F9FC]">
                    الصف الدراسي <span className="text-[#800B34]">*</span>
                  </span>
                  {isLoadingSystems ? (
                    <div className="h-11 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F7F9FC] dark:bg-[#071737] px-3 flex items-center gap-2 text-xs text-[#536681]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري تحميل الصفوف الدراسية...</span>
                    </div>
                  ) : gradeOptions.length === 2 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {gradeOptions.map((g) => {
                        const isSelected = g.id === effectiveGradeId;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => handleGradeChange(g.id)}
                            className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#091B40] border-[#091B40] text-white dark:bg-[#800B34] dark:border-[#800B34]"
                                : "bg-[#F7F9FC] dark:bg-[#071737] border-[#E2E8F0] dark:border-[#1E3A6E] text-[#091B40] dark:text-slate-200 hover:border-[#800B34]"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                            <span>{formatGradeShortLabel(g.code, g.name)}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        id="sub-reg-grade"
                        value={effectiveGradeId}
                        disabled={gradeOptions.length === 0}
                        onFocus={keepFieldAboveKeyboard}
                        onChange={(e) => handleGradeChange(e.target.value)}
                        className="w-full h-11 pr-10 pl-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F7F9FC] dark:bg-[#071737] text-xs font-bold text-[#091B40] dark:text-white appearance-none"
                      >
                        {gradeOptions.map((g) => (
                          <option key={g.id} value={g.id}>
                            {formatGradeShortLabel(g.code, g.name)}
                          </option>
                        ))}
                      </select>
                      <GraduationCap className="w-4 h-4 text-[#800B34] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Dynamic Academic Track (Changes dynamically by Grade + School Category) */}
                {dynamicTracks.length > 0 ? (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="sub-reg-track"
                      className="block text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-[#F7F9FC]"
                    >
                      المسار الدراسي — {activeGradeLabel}{" "}
                      <span className="text-[#64748B] font-normal">(اختياري)</span>
                    </label>
                    <div className="relative">
                      <select
                        id="sub-reg-track"
                        value={effectiveTrackId}
                        onFocus={keepFieldAboveKeyboard}
                        onChange={(e) => setSelectedTrackId(e.target.value)}
                        className="w-full h-11 pr-4 pl-9 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F7F9FC] dark:bg-[#071737] text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800B34] appearance-none cursor-pointer"
                      >
                        <option value="">
                          {schoolCategory === "LANGUAGES"
                            ? "مسار عام (كل مواد اللغات المتاحة)"
                            : "مسار عام (كل مواد العربي المتاحة)"}
                        </option>
                        {dynamicTracks.map((tr) => (
                          <option key={tr.id} value={tr.id}>
                            {tr.displayName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] px-3 py-2 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] text-[#536681] dark:text-[#94A3B8]">
                    جميع مواد {activeGradeLabel || "هذا الصف"} (
                    {schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}) تفتح تلقائياً بدون تقسيم مسارات.
                  </p>
                )}

                {/* Study Mode (Online vs Center) */}
                <div className="space-y-1.5">
                  <span className="block text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-[#F7F9FC]">
                    نظام الدراسة <span className="text-[#800B34]">*</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] dark:bg-[#071737] rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E]">
                    <button
                      type="button"
                      onClick={() => setStudyMode("ONLINE")}
                      className={`min-h-[42px] px-2.5 py-2 rounded-lg transition-all border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer ${
                        studyMode === "ONLINE"
                          ? "bg-white dark:bg-[#0D214D] text-[#800B34] dark:text-[#E9AD32] border-[#800B34]/30 dark:border-[#E9AD32]/40 shadow-sm"
                          : "border-transparent text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span>أونلاين</span>
                      {studyMode === "ONLINE" && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudyMode("OFFLINE")}
                      className={`min-h-[42px] px-2.5 py-2 rounded-lg transition-all border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer ${
                        studyMode === "OFFLINE"
                          ? "bg-white dark:bg-[#0D214D] text-[#800B34] dark:text-[#E9AD32] border-[#800B34]/30 dark:border-[#E9AD32]/40 shadow-sm"
                          : "border-transparent text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span>طالب سنتر</span>
                      {studyMode === "OFFLINE" && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  </div>
                </div>

                {/* Center Selector — ONLY rendered when studyMode === "OFFLINE" */}
                {studyMode === "OFFLINE" && (
                  <div className="p-3 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2.5">
                    <label
                      htmlFor="sub-reg-center"
                      className="block text-xs font-bold text-[#091B40] dark:text-white"
                    >
                      اختر السنتر التابع له ({schoolCategory === "LANGUAGES" ? "لغات" : "عربي"})
                    </label>
                    <div className="relative">
                      <select
                        id="sub-reg-center"
                        value={selectedCenter}
                        onFocus={keepFieldAboveKeyboard}
                        onChange={(e) => {
                          setSelectedCenter(e.target.value);
                          if (e.target.value !== OTHER_CENTER_NAME) {
                            setCustomCenter("");
                          }
                        }}
                        className="w-full h-11 pr-4 pl-9 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-white dark:bg-[#0D214D] text-xs font-bold text-[#091B40] dark:text-white appearance-none cursor-pointer"
                      >
                        {availableCenters.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                        <option value={OTHER_CENTER_NAME}>{OTHER_CENTER_NAME}</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {selectedCenter === OTHER_CENTER_NAME && (
                      <input
                        type="text"
                        value={customCenter}
                        onFocus={keepFieldAboveKeyboard}
                        onChange={(e) => setCustomCenter(e.target.value)}
                        placeholder="اكتب اسم السنتر هنا..."
                        maxLength={100}
                        className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-white dark:bg-[#0D214D] text-xs font-bold text-[#091B40] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#800B34]"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: PRE-TRANSFER CLARITY (PRICE + RECIPIENT ACCOUNTS + RECEIPT REVIEW) */}
            {step === 3 && (
              <div className="space-y-3.5">
                {/* 1. Subscription Fee & Entity */}
                <div className="p-3.5 rounded-xl bg-[#091B40] text-white space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#CBD5E1]">
                      <Wallet className="w-4 h-4 text-[#FB7185]" />
                      <span>قيمة الاشتراك الشهري</span>
                    </span>
                    <span className="text-lg font-black text-white">
                      {SUBSCRIPTION_PRICE_EGP} ج.م
                    </span>
                  </div>
                  <p className="text-[11px] text-[#CBD5E1]">
                    الجهة المستلمة: <strong className="text-white">منصة الخلاصة للبكالوريا — إشراف د. محمود المهدي</strong>
                  </p>
                  <ul className="grid grid-cols-1 gap-1 pt-1 border-t border-white/10 text-[11px] text-[#CBD5E1]">
                    {SUBSCRIPTION_BENEFITS.slice(0, 3).map((b) => (
                      <li key={b} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Verified Transfer Channels Preview (Before Transferring) */}
                <div className="p-3 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2">
                  <span className="block text-xs font-bold text-[#091B40] dark:text-white">
                    أرقام ووسائل التحويل المعتمدة:
                  </span>
                  <div className="space-y-1.5">
                    {PAYMENT_METHODS.map((method) => (
                      <div
                        key={method.id}
                        className="p-2.5 rounded-lg bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] flex flex-col gap-1 text-xs"
                      >
                        <span className="font-bold text-[#091B40] dark:text-white">
                          {method.name}
                        </span>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#536681] dark:text-[#CBD5E1]">
                          {method.accounts.map((acc) => (
                            <span key={acc.key} dir="ltr" className="font-mono font-bold text-[#800B34] dark:text-[#FB7185]">
                              {acc.number}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. How Receipt Review & Activation Works */}
                <div className="p-3 rounded-xl bg-[#FAF6F7] dark:bg-[#1E1B2E] border border-[#800B34]/20 space-y-1.5 text-[11px] text-[#091B40] dark:text-slate-200">
                  <span className="block font-bold text-[#800B34] dark:text-[#FB7185]">
                    طريقة مراجعة الإيصال وتفعيل الحساب:
                  </span>
                  <p>1. عند المتابعة، سيظهر كود الطالب الخاص بك وأزرار نسخ أرقام التحويل.</p>
                  <p>2. بعد التحويل ترفع صورة الإيصال ورقم الموبايل المحوّل منه في الشاشة التالية.</p>
                  <p>3. تراجع الإدارة الإيصال وتفعّل الاشتراك على نفس الكود فوراً.</p>
                </div>

                {/* 4. Compact Saved Student Summary with 1-Tap Edit */}
                <div className="p-3 rounded-xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#091B40] dark:text-white">
                      ملخص بياناتك المحفوظة
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] font-bold text-[#800B34] dark:text-[#FB7185] hover:underline cursor-pointer"
                    >
                      تعديل البيانات
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[#536681] dark:text-[#94A3B8]">
                    <span className="truncate">الاسم: <strong className="text-[#091B40] dark:text-white">{name}</strong></span>
                    <span dir="ltr" className="text-right font-mono"><strong className="text-[#091B40] dark:text-white">{normalizeDigits(phone)}</strong></span>
                    <span>{activeGradeLabel} • {schoolCategory === "LANGUAGES" ? "لغات" : "عربي"}</span>
                    <span className="truncate">{activeTrackLabel}</span>
                    <span className="col-span-2 truncate">نظام الدراسة: <strong className="text-[#091B40] dark:text-white">{resolvedCenterDisplay}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. FIXED BOTTOM BAR: Always Visible Primary Continue Action */}
        <footer className="shrink-0 bg-white dark:bg-[#0D214D] border-t border-[#E2E8F0] dark:border-[#1E3A6E] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] flex items-center gap-2.5">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              className="min-h-[46px] px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F7F9FC] dark:bg-[#071737] text-[#091B40] dark:text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 hover:border-[#800B34] transition-colors shrink-0 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>السابق</span>
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex-1 min-h-[46px] px-4 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <span>
                {step === 1
                  ? "التالي: الصف والشعبة"
                  : "التالي: قيمة الاشتراك والدفع"}
              </span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting || isLoadingSystems}
              className="flex-1 min-h-[46px] px-4 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                  <span>
                    {isEditingExisting
                      ? "حفظ التعديلات والمتابعة للدفع"
                      : "تأكيد التسجيل والانتقال للدفع"}
                  </span>
                </>
              )}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
