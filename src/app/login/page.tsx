"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  KeyRound,
  GraduationCap,
  Shield,
  CheckCircle2,
  Globe,
  Building2,
  MapPin,
  Sparkles,
  School,
  Check,
  UserCheck,
  Flame,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { WhatsAppSupportLinks } from "@/components/ui/WhatsAppSupportLinks";
import { LoginErrorBanner } from "@/components/auth/LoginErrorBanner";
import { getOrCreateDeviceId } from "@/lib/device";
import {
  AUTHORIZED_CENTERS,
  LANGUAGES_CENTERS,
  ARABIC_CENTERS,
  OTHER_CENTER_NAME,
  ALL_CENTER_NAMES,
} from "@/lib/centers";
import { formatStudentGreeting } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<"code" | "credentials">("code");

  // Code login state
  const [studentCode, setStudentCode] = useState("");
  const [studyMode, setStudyMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [selectedCenter, setSelectedCenter] = useState<string>("سنتر رافال عربي");
  const [customCenter, setCustomCenter] = useState<string>("");

  // Code Auto-Lookup State
  const [detectedStudent, setDetectedStudent] = useState<{
    found: boolean;
    name?: string | null;
    schoolCategory?: "ARABIC" | "LANGUAGES";
    studyMode?: "ONLINE" | "OFFLINE";
    centerName?: string | null;
  } | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Credentials login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoFilledNotice, setAutoFilledNotice] = useState<string | null>(null);

  // Read ?code=... from URL for 1-click WhatsApp credentials links and restore saved mode
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get("code") || params.get("loginCode");
      if (urlCode && urlCode.trim()) {
        const clean = urlCode.trim().toUpperCase();
        setStudentCode(clean);
        setLoginMode("code");
        setAutoFilledNotice("تم استرجاع وتعبئة كود الدخول الخاص بك تلقائياً.");
      }

      // Restore saved studyMode and center (with corruption guard)
      const savedMode = localStorage.getItem("kholasa_study_mode");
      if (savedMode === "ONLINE" || savedMode === "OFFLINE") {
        setStudyMode(savedMode);
      }
      const savedCenter = localStorage.getItem("kholasa_selected_center");
      if (savedCenter && !savedCenter.includes("?")) {
        if (ALL_CENTER_NAMES.includes(savedCenter)) {
          setSelectedCenter(savedCenter);
        } else {
          setSelectedCenter(OTHER_CENTER_NAME);
          setCustomCenter(savedCenter);
        }
      } else if (savedCenter) {
        try {
          localStorage.removeItem("kholasa_selected_center");
        } catch { }
        setSelectedCenter(ALL_CENTER_NAMES[0] || "سنتر رافال عربي");
        setCustomCenter("");
      }
    } catch {
      // Ignore URL / localStorage parsing errors
    }
  }, []);

  // Real-time lookup for student code (debounced)
  useEffect(() => {
    const cleanCode = studentCode.trim().toUpperCase();
    if (cleanCode.length < 4) {
      setDetectedStudent(null);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setIsLookingUp(true);
        const res = await fetch(`/api/auth/lookup-code?code=${encodeURIComponent(cleanCode)}`);
        const data = await res.json();
        if (!isMounted) return;

        if (data.found && data.user) {
          setDetectedStudent({
            found: true,
            name: data.user.name,
            schoolCategory: data.user.schoolCategory,
            studyMode: data.user.studyMode,
            centerName: data.user.centerName,
          });

          // Auto-align attendance mode if student has an existing center recorded
          if (data.user.centerName && data.user.studyMode === "OFFLINE") {
            setStudyMode("OFFLINE");
            if (ALL_CENTER_NAMES.includes(data.user.centerName)) {
              setSelectedCenter(data.user.centerName);
            } else {
              setSelectedCenter(OTHER_CENTER_NAME);
              setCustomCenter(data.user.centerName);
            }
          } else if (data.user.schoolCategory === "LANGUAGES") {
            // Suggest first languages center if currently an Arabic center was selected
            if (ARABIC_CENTERS.some((c) => c.name === selectedCenter)) {
              setSelectedCenter(LANGUAGES_CENTERS[0].name);
            }
          } else if (data.user.schoolCategory === "ARABIC") {
            // Suggest first arabic center if currently a Languages center was selected
            if (LANGUAGES_CENTERS.some((c) => c.name === selectedCenter)) {
              setSelectedCenter(ARABIC_CENTERS[0].name);
            }
          }
        } else {
          setDetectedStudent({ found: false });
        }
      } catch {
        // Silently ignore lookup failure; full verification runs on submit
      } finally {
        if (isMounted) setIsLookingUp(false);
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [studentCode]);

  const handleApplyDemoAccount = (code: "DEMO-EN" | "DEMO-AR") => {
    setError(null);
    setStudentCode(code);
    setLoginMode("code");

    if (code === "DEMO-EN") {
      setStudyMode("OFFLINE");
      setSelectedCenter("سنتر إديوفيرس لغات");
      setAutoFilledNotice("تم تجهيز الحساب التجريبي (طالب لغات - تجريبي) بنجاح!");
    } else {
      setStudyMode("OFFLINE");
      setSelectedCenter("سنتر رافال عربي");
      setAutoFilledNotice("تم تجهيز الحساب التجريبي (طالب عربي - تجريبي) بنجاح!");
    }
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = studentCode.trim().toUpperCase();
    if (!cleanCode) {
      setError("يرجى إدخال كود الطالب");
      return;
    }

    const finalCenterName =
      studyMode === "OFFLINE"
        ? selectedCenter === OTHER_CENTER_NAME
          ? customCenter.trim()
          : selectedCenter
        : null;

    if (studyMode === "OFFLINE" && !finalCenterName) {
      setError("يرجى كتابة أو اختيار اسم السنتر التابع له");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          deviceId: getOrCreateDeviceId(),
          studyMode,
          centerName: finalCenterName || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("kholasa_study_mode", studyMode);
          if (studyMode === "OFFLINE" && finalCenterName) {
            localStorage.setItem("kholasa_selected_center", finalCenterName);
          }
        } catch {
          // Ignore localStorage errors
        }
      }

      if (["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"].includes(data.user?.role)) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          deviceId: getOrCreateDeviceId(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      if (["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"].includes(data.user?.role)) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#091B40] text-[#091B40] dark:text-[#F7F9FC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-right font-sans relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="w-full sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <BrandLogo
            href="/"
            variant="combined"
            size="lg"
            priority
            subtitleText="EL KHOLASA"
            className="mb-3"
          />
          <h2 className="text-xl sm:text-2xl font-black text-[#091B40] dark:text-white tracking-tight">
            {loginMode === "code" ? "تسجيل دخول الطالب" : "تسجيل دخول الإدارة والمعلمين"}
          </h2>
          <p className="mt-1 text-[13px] sm:text-sm text-[#536681] dark:text-[#94A3B8]">
            {loginMode === "code"
              ? "ادخل كود المنصة المعتمد للبدء وربط حسابك بجهازك"
              : "تسجيل الدخول بالبريد الإلكتروني أو الهاتف"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#0D214D] py-7 px-5 sm:px-8 border border-[#E2E8F0] dark:border-[#1E3A6E] rounded-3xl shadow-[0_8px_28px_rgba(9,27,64,0.07)]">
          {error && (
            <LoginErrorBanner key={error} error={error} studentCode={studentCode} />
          )}

          {/* MODE 1: STUDENT CODE LOGIN (DEFAULT) */}
          {loginMode === "code" ? (
            <form onSubmit={handleCodeLogin} className="space-y-5">
              {autoFilledNotice && (
                <div className="p-3.5 rounded-2xl bg-[#EAF2FF] dark:bg-[#112F66] border border-[#C5DCFA] dark:border-[#1E4D94] flex items-center gap-2.5 text-xs text-[#091B40] dark:text-[#EAF2FF] font-bold animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-[#2C70BF] shrink-0" />
                  <span>{autoFilledNotice}</span>
                </div>
              )}

              {/* Student Code Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="studentCode"
                    className="block text-[13px] sm:text-sm font-bold text-[#091B40] dark:text-[#F7F9FC]"
                  >
                    كود الطالب (Login Code)
                  </label>

                  {/* Auto-Detection Indicator */}
                  {isLookingUp ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#800B34] dark:text-[#E9AD32]">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>جارٍ التعرف على الكود...</span>
                    </span>
                  ) : detectedStudent?.found ? (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${detectedStudent.schoolCategory === "LANGUAGES"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                        }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>
                        {detectedStudent.schoolCategory === "LANGUAGES" ? "طالب لغات 🇬🇧" : "طالب عربي 🇪🇬"}
                      </span>
                    </span>
                  ) : null}
                </div>

                <div className="relative">
                  <input
                    id="studentCode"
                    type="text"
                    required
                    autoFocus
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                    placeholder="ادخل كود الدخول المعتمد..."
                    maxLength={15}
                    className="w-full h-12 pr-11 pl-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F7F9FC] dark:bg-[#071737] text-[#091B40] dark:text-white placeholder:text-[#94A3B8] text-base font-black font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#800B34] focus:border-transparent transition-all shadow-inner"
                    dir={studentCode ? "ltr" : "rtl"}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                    <KeyRound className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32]" />
                  </div>
                </div>

                {/* Personalized Welcome Banner if code is verified */}
                {detectedStudent?.found && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#EAF2FF] dark:bg-[#112F66] border border-[#C5DCFA] dark:border-[#1E4D94] flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#17834B] dark:text-[#34D399]" />
                      <span className="font-bold text-[#091B40] dark:text-white">
                        {formatStudentGreeting(detectedStudent.name)} 👋
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#536681] dark:text-[#CBD5E1]">
                      {detectedStudent.schoolCategory === "LANGUAGES"
                        ? "منهج اللغات المعتمد"
                        : "منهج المدارس العامة"}
                    </span>
                  </div>
                )}

                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#536681] dark:text-[#94A3B8]">
                  <Shield className="w-3.5 h-3.5 text-[#17834B] dark:text-[#34D399] shrink-0" />
                  <span>يقترن الحساب بجهازك الشخصي المعتمد تلقائياً (جهاز واحد فقط للحماية).</span>
                </div>
              </div>

              {/* Attendance Mode (Online vs Offline/Center) */}
              <div className="space-y-2 pt-1">
                <label className="block text-[12px] sm:text-[13px] font-bold text-[#091B40] dark:text-[#F7F9FC]">
                  نظام الحضور والدراسة
                </label>
                <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-[#F1F5F9] dark:bg-[#071737] rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A6E]">
                  <button
                    type="button"
                    onClick={() => setStudyMode("ONLINE")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border ${studyMode === "ONLINE"
                        ? "bg-white dark:bg-[#0D214D] text-[#800B34] dark:text-[#E9AD32] border-[#800B34]/30 dark:border-[#E9AD32]/40 shadow-sm"
                        : "border-transparent text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Globe className="w-4 h-4" />
                      <span>أونلاين فقط</span>
                      {studyMode === "ONLINE" && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] mt-0.5 opacity-80 font-medium">متابعة رقمية من المنزل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudyMode("OFFLINE")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border ${studyMode === "OFFLINE"
                        ? "bg-white dark:bg-[#0D214D] text-[#800B34] dark:text-[#E9AD32] border-[#800B34]/30 dark:border-[#E9AD32]/40 shadow-sm"
                        : "border-transparent text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                      <span>سنتر (أوفلاين)</span>
                      {studyMode === "OFFLINE" && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[10px] mt-0.5 opacity-80 font-medium">حضور وشيتات ومتابعة</span>
                  </button>
                </div>
              </div>

              {/* If Center / Offline is selected */}
              {studyMode === "OFFLINE" && (
                <div className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="centerSelect"
                      className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-[#F7F9FC]"
                    >
                      <Building2 className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32]" />
                      <span>اختر السنتر التابع له</span>
                    </label>

                    {detectedStudent?.schoolCategory ? (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${detectedStudent.schoolCategory === "LANGUAGES"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                          }`}
                      >
                        {detectedStudent.schoolCategory === "LANGUAGES"
                          ? "سناتر اللغات 🇬🇧"
                          : "سناتر العربي 🇪🇬"}
                      </span>
                    ) : null}
                  </div>

                  {/* Sleek, Non-Truncated Select */}
                  <div className="relative">
                    <select
                      id="centerSelect"
                      value={selectedCenter}
                      onChange={(e) => {
                        setSelectedCenter(e.target.value);
                        if (e.target.value !== OTHER_CENTER_NAME) {
                          setCustomCenter("");
                        }
                      }}
                      className="w-full h-12 pr-11 pl-10 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-white dark:bg-[#0D214D] text-xs sm:text-sm font-bold text-[#091B40] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800B34] transition-all appearance-none cursor-pointer shadow-inner"
                    >
                      {detectedStudent?.schoolCategory === "LANGUAGES" ? (
                        <>
                          <optgroup label="── سناتر مدارس اللغات (Languages) 🇬🇧 ──">
                            {LANGUAGES_CENTERS.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="── سناتر المدارس العامة (عربي) 🇪🇬 ──">
                            {ARABIC_CENTERS.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </optgroup>
                        </>
                      ) : (
                        <>
                          <optgroup label="── سناتر المدارس العامة (عربي) 🇪🇬 ──">
                            {ARABIC_CENTERS.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="── سناتر مدارس اللغات (Languages) 🇬🇧 ──">
                            {LANGUAGES_CENTERS.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </optgroup>
                        </>
                      )}
                      <optgroup label="── خيارات أخرى ──">
                        <option value={OTHER_CENTER_NAME}>سنتر آخر (أدخل اسم السنتر يدوياً)</option>
                      </optgroup>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#800B34] dark:text-[#E9AD32] pointer-events-none">
                      <School className="w-4 h-4" />
                    </div>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>

                  {/* If custom center is chosen */}
                  {selectedCenter === OTHER_CENTER_NAME && (
                    <div className="relative animate-in fade-in duration-150">
                      <input
                        type="text"
                        required
                        autoFocus
                        value={customCenter}
                        onChange={(e) => setCustomCenter(e.target.value)}
                        placeholder="اكتب اسم السنتر أو الفرع التابع له..."
                        className="w-full h-11 pr-10 pl-3 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-white dark:bg-[#0D214D] text-xs font-bold text-[#091B40] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#800B34]"
                      />
                      <MapPin className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32] absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  )}

                  <p className="text-[11px] text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                    يتم ربط حضورك ودرجاتك بالسنتر المعتمد لسهولة استلام الشيتات والتواصل مع ولي الأمر.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[52px] rounded-xl bg-[#800B34] hover:bg-[#680829] text-white font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 interactive-tap shadow-lg shadow-[#800B34]/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ التحقق وتوثيق الجهاز...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    <span>دخول إلى المنصة</span>
                  </>
                )}
              </button>

              {/* Demo Account Quick Access Card */}
              <div className="pt-2">
                <div className="p-3.5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#536681] dark:text-[#94A3B8]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#E9AD32]" />
                      <span>تجربة سريعة (جلسة مستقلة ومعزولة لك):</span>
                    </span>
                    <span className="text-[10px] text-[#17834B] dark:text-[#34D399] font-normal">
                      ضغطة واحدة للتجربة
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyDemoAccount("DEMO-EN")}
                      className="py-2 px-2 rounded-xl bg-white dark:bg-[#0D214D] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-[#E2E8F0] dark:border-[#1E3A6E] text-[11px] font-bold text-indigo-700 dark:text-indigo-300 text-center transition-all flex flex-col items-center gap-0.5 cursor-pointer"
                    >
                      <span>بكالوريا لغات 🇬🇧</span>
                      <span className="text-[9px] font-mono text-[#536681] dark:text-[#94A3B8]">DEMO-EN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyDemoAccount("DEMO-AR")}
                      className="py-2 px-2 rounded-xl bg-white dark:bg-[#0D214D] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-[#E2E8F0] dark:border-[#1E3A6E] text-[11px] font-bold text-emerald-700 dark:text-emerald-300 text-center transition-all flex flex-col items-center gap-0.5 cursor-pointer"
                    >
                      <span>بكالوريا عربي 🇪🇬</span>
                      <span className="text-[9px] font-mono text-[#536681] dark:text-[#94A3B8]">DEMO-AR</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* MODE 2: STAFF & CREDENTIALS LOGIN */
            <form onSubmit={handleCredentialsLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-[13px] sm:text-sm font-bold text-[#091B40] dark:text-[#F7F9FC] mb-2"
                >
                  البريد الإلكتروني أو رقم الهاتف
                </label>
                <div className="relative">
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@kholasa.app أو 01012345678"
                    className="w-full h-11 pr-11 pl-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F7F9FC] dark:bg-[#071737] text-[#091B40] dark:text-white placeholder:text-[#94A3B8] text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800B34] focus:border-transparent transition-all"
                    dir="ltr"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-[13px] sm:text-sm font-bold text-[#091B40] dark:text-[#F7F9FC]"
                  >
                    كلمة المرور
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[12px] font-bold text-[#800B34] dark:text-[#E9AD32] hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pr-11 pl-11 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-[#F7F9FC] dark:bg-[#071737] text-[#091B40] dark:text-white placeholder:text-[#94A3B8] text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800B34] focus:border-transparent transition-all"
                    dir="ltr"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#536681] dark:hover:text-[#94A3B8] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[50px] rounded-xl bg-[#800B34] hover:bg-[#680829] text-white font-bold text-[13px] sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 interactive-tap shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ تسجيل الدخول...</span>
                  </>
                ) : (
                  <span>دخول الإدارة</span>
                )}
              </button>
            </form>
          )}

          {/* Toggle Between Modes */}
          <div className="mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#1E3A6E] flex flex-col gap-3 text-center text-xs">
            {loginMode === "code" ? (
              <>
                <Link
                  href="/subscription"
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] dark:bg-[#142747] dark:hover:bg-[#1E3A6E] border border-[#BFDBFE] dark:border-[#2C70BF]/40 text-[#091B40] dark:text-[#F5F7FB] font-extrabold text-[13px] flex items-center justify-center gap-2 transition-colors"
                >
                  <span>طالب جديد وعاوز تشترك؟ سجّل بياناتك واشترك الآن</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setLoginMode("credentials");
                  }}
                  className="font-bold text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white transition-colors"
                >
                  دخول المعلمين والمشرفين (بكلمة المرور) ←
                </button>

                <div className="p-3.5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2">
                  <WhatsAppSupportLinks
                    variant="compact"
                    title="ليس لديك كود دخول أو واجهتك مشكلة؟ تواصل عبر واتساب:"
                    message="مرحباً، أحتاج مساعدة بخصوص كود الدخول لمنصة الخلاصة للبكالوريا"
                  />
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoginMode("code");
                }}
                className="font-bold text-[#800B34] dark:text-[#E9AD32] hover:underline"
              >
                ← العودة لتسجيل دخول الطالب بالكود
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[13px] font-bold text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
