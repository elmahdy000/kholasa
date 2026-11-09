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
  AlertCircle,
  Loader2,
  KeyRound,
  MessageCircle,
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
} from "lucide-react";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { getOrCreateDeviceId } from "@/lib/device";
import {
  AUTHORIZED_CENTERS,
  LANGUAGES_CENTERS,
  ARABIC_CENTERS,
  OTHER_CENTER_NAME,
  ALL_CENTER_NAMES,
} from "@/lib/centers";

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<"code" | "credentials">("code");

  // Code login state
  const [studentCode, setStudentCode] = useState("");
  const [studyMode, setStudyMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [selectedCenter, setSelectedCenter] = useState<string>("سنتر إديوفيرس لغات");
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

      // Restore saved studyMode and center
      const savedMode = localStorage.getItem("kholasa_study_mode");
      if (savedMode === "ONLINE" || savedMode === "OFFLINE") {
        setStudyMode(savedMode);
      }
      const savedCenter = localStorage.getItem("kholasa_selected_center");
      if (savedCenter) {
        if (ALL_CENTER_NAMES.includes(savedCenter)) {
          setSelectedCenter(savedCenter);
        } else {
          setSelectedCenter(OTHER_CENTER_NAME);
          setCustomCenter(savedCenter);
        }
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

  const handleApplyDemoAccount = (code: "DEMO-EN" | "DEMO-AR" | "DEMO-PRO") => {
    setError(null);
    setStudentCode(code);
    setLoginMode("code");

    if (code === "DEMO-EN") {
      setStudyMode("OFFLINE");
      setSelectedCenter("سنتر إديوفيرس لغات");
      setAutoFilledNotice("تم تجهيز الحساب التجريبي (طالب لغات - تجريبي) بنجاح!");
    } else if (code === "DEMO-AR") {
      setStudyMode("OFFLINE");
      setSelectedCenter("سنتر رافال عربي");
      setAutoFilledNotice("تم تجهيز الحساب التجريبي (طالب عربي - تجريبي) بنجاح!");
    } else {
      setStudyMode("ONLINE");
      setSelectedCenter("سنتر إديوفيرس لغات");
      setAutoFilledNotice("تم تجهيز الحساب التجريبي (اشتراك كامل مفعل) بنجاح!");
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-right font-sans relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />

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
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            {loginMode === "code" ? "تسجيل دخول الطالب" : "تسجيل دخول الإدارة والمعلمين"}
          </h2>
          <p className="mt-1 text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            {loginMode === "code"
              ? "ادخل كود المنصة المعتمد للبدء وربط حسابك بجهازك"
              : "تسجيل الدخول بالبريد الإلكتروني أو الهاتف"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#111C35] py-7 px-5 sm:px-8 border border-[#E2E8F0] dark:border-[#1E293B] rounded-3xl shadow-xl shadow-slate-900/5">
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-right animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[13px] sm:text-sm font-bold text-rose-700 dark:text-rose-300 leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* MODE 1: STUDENT CODE LOGIN (DEFAULT) */}
          {loginMode === "code" ? (
            <form onSubmit={handleCodeLogin} className="space-y-5">
              {autoFilledNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{autoFilledNotice}</span>
                </div>
              )}

              {/* Student Code Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="studentCode"
                    className="block text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    كود الطالب (Login Code)
                  </label>

                  {/* Auto-Detection Indicator */}
                  {isLookingUp ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#800020] dark:text-rose-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>جارٍ التعرف على الكود...</span>
                    </span>
                  ) : detectedStudent?.found ? (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                        detectedStudent.schoolCategory === "LANGUAGES"
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
                    placeholder="مثال: J9KFQY"
                    maxLength={15}
                    className="w-full h-12 pr-11 pl-4 rounded-2xl border border-[#E2E8F0] dark:border-[#27344D] bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] text-base font-black font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#800020] dark:focus:ring-rose-500 focus:border-transparent transition-all shadow-inner"
                    dir={studentCode ? "ltr" : "rtl"}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                    <KeyRound className="w-4 h-4 text-[#800020] dark:text-rose-400" />
                  </div>
                </div>

                {/* Personalized Welcome Banner if code is verified */}
                {detectedStudent?.found && detectedStudent.name && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-[#0F172A] dark:text-white">
                        أهلاً بك يا {detectedStudent.name} 👋
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {detectedStudent.schoolCategory === "LANGUAGES"
                        ? "منهج اللغات المعتمد"
                        : "منهج المدارس العامة"}
                    </span>
                  </div>
                )}

                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>يقترن الحساب بجهازك الشخصي المعتمد تلقائياً (جهاز واحد فقط للحماية).</span>
                </div>
              </div>

              {/* Attendance Mode (Online vs Offline/Center) */}
              <div className="space-y-2 pt-1">
                <label className="block text-[12px] sm:text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  نظام الحضور والدراسة
                </label>
                <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-[#F1F5F9] dark:bg-[#0B1120] rounded-2xl border border-[#E2E8F0] dark:border-[#27344D]">
                  <button
                    type="button"
                    onClick={() => setStudyMode("ONLINE")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border ${
                      studyMode === "ONLINE"
                        ? "bg-white dark:bg-[#1E293B] text-[#800020] dark:text-rose-400 border-[#800020]/20 dark:border-rose-500/40 shadow-sm"
                        : "border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
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
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border ${
                      studyMode === "OFFLINE"
                        ? "bg-white dark:bg-[#1E293B] text-[#800020] dark:text-rose-400 border-[#800020]/20 dark:border-rose-500/40 shadow-sm"
                        : "border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
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
                <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="centerSelect"
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-950 dark:text-amber-200"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#800020] dark:text-amber-400" />
                      <span>اختر السنتر التابع له:</span>
                    </label>

                    {detectedStudent?.schoolCategory && (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        {detectedStudent.schoolCategory === "LANGUAGES" ? "سناتر اللغات" : "سناتر العربي"}
                      </span>
                    )}
                  </div>

                  {/* Quick Click Badges for detected or top centers */}
                  <div className="flex flex-wrap gap-1.5">
                    {(detectedStudent?.schoolCategory === "LANGUAGES"
                      ? LANGUAGES_CENTERS
                      : detectedStudent?.schoolCategory === "ARABIC"
                      ? ARABIC_CENTERS
                      : AUTHORIZED_CENTERS
                    ).map((c) => {
                      const isSelected = selectedCenter === c.name;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCenter(c.name)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1 ${
                            isSelected
                              ? "bg-[#800020] text-white border-[#800020] shadow-xs"
                              : "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020]"
                          }`}
                        >
                          <School className="w-3 h-3" />
                          <span>{c.name}</span>
                          <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-300"}`}>
                            {c.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Categorized Dropdown Selector */}
                  <select
                    id="centerSelect"
                    value={selectedCenter}
                    onChange={(e) => setSelectedCenter(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  >
                    <optgroup label="── سناتر مدارس اللغات (Languages) 🇬🇧 ──">
                      {LANGUAGES_CENTERS.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.badge})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="── سناتر المدارس العامة (عربي) 🇪🇬 ──">
                      {ARABIC_CENTERS.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.badge})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="── خيارات أخرى ──">
                      <option value={OTHER_CENTER_NAME}>{OTHER_CENTER_NAME}</option>
                    </optgroup>
                  </select>

                  {/* If custom center is chosen */}
                  {selectedCenter === OTHER_CENTER_NAME && (
                    <div className="relative animate-in fade-in">
                      <input
                        type="text"
                        required
                        value={customCenter}
                        onChange={(e) => setCustomCenter(e.target.value)}
                        placeholder="اكتب اسم السنتر أو الفرع التابع له..."
                        className="w-full h-10 pr-9 pl-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#800020]"
                      />
                      <MapPin className="w-3.5 h-3.5 text-amber-600 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  )}

                  <p className="text-[11px] text-amber-800 dark:text-amber-300/90 font-medium leading-relaxed">
                    يتم ربط حضورك ودرجاتك بالسنتر المعتمد لسهولة استلام الشيتات والتواصل مع ولي الأمر.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-[#800020] hover:bg-[#66001A] text-white font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 interactive-tap shadow-lg shadow-[#800020]/20"
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
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>حسابات تجريبية للمعاينة السريعة:</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                      ضغطة واحدة للتجربة
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyDemoAccount("DEMO-EN")}
                      className="py-2 px-2 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-[#E2E8F0] dark:border-slate-700 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 text-center transition-all flex flex-col items-center gap-0.5"
                    >
                      <span>طالب لغات 🇬🇧</span>
                      <span className="text-[9px] font-mono text-[#64748B] dark:text-[#94A3B8]">DEMO-EN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyDemoAccount("DEMO-AR")}
                      className="py-2 px-2 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-[#E2E8F0] dark:border-slate-700 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 text-center transition-all flex flex-col items-center gap-0.5"
                    >
                      <span>طالب عربي 🇪🇬</span>
                      <span className="text-[9px] font-mono text-[#64748B] dark:text-[#94A3B8]">DEMO-AR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyDemoAccount("DEMO-PRO")}
                      className="py-2 px-2 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-[#E2E8F0] dark:border-slate-700 text-[11px] font-bold text-amber-700 dark:text-amber-300 text-center transition-all flex flex-col items-center gap-0.5"
                    >
                      <span>حساب مفعل ⭐</span>
                      <span className="text-[9px] font-mono text-[#64748B] dark:text-[#94A3B8]">DEMO-PRO</span>
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
                  className="block text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2"
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
                    className="w-full h-11 pr-11 pl-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-all"
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
                    className="block text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    كلمة المرور
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[12px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline"
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
                    className="w-full h-11 pr-11 pl-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-all"
                    dir="ltr"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] dark:hover:text-[#94A3B8] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white font-bold text-[13px] sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 interactive-tap shadow-xs"
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
          <div className="mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#1E293B] flex flex-col gap-3 text-center text-xs">
            {loginMode === "code" ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setLoginMode("credentials");
                  }}
                  className="font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                >
                  دخول المعلمين والمشرفين (بكلمة المرور) ←
                </button>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] space-y-1.5">
                  <span className="block font-bold text-[#0F172A] dark:text-white text-[11px]">
                    ليس لديك كود دخول أو واجهتك مشكلة؟
                  </span>
                  <a
                    href="https://wa.me/201021482860?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%83%D9%88%D8%AF%20%D8%A7%D9%84%D8%AF%D8%AE%D9%88%D9%84%20%D9%84%D9%85%D9%86%D8%B5%D8%A9%20%D8%A7%D9%84%D8%AE%D9%84%D8%A7%D8%B5%D8%A9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>تواصل مع المساعد عبر واتساب</span>
                  </a>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoginMode("code");
                }}
                className="font-bold text-[#800020] dark:text-[#FB7185] hover:underline"
              >
                ← العودة لتسجيل دخول الطالب بالكود
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
