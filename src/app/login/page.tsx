"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { getOrCreateDeviceId } from "@/lib/device";

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<"code" | "credentials">("code");

  // Code login state
  const [studentCode, setStudentCode] = useState("");
  const [studyMode, setStudyMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [selectedCenter, setSelectedCenter] = useState<string>("سنتر الأوائل");
  const [customCenter, setCustomCenter] = useState<string>("");

  const POPULAR_CENTERS = [
    "سنتر الأوائل",
    "سنتر النخبة",
    "سنتر رويال",
    "سنتر الأهرام",
    "سنتر فيوتشر",
    "سنتر المستقبل",
    "سنتر آخر (أدخل اسم السنتر)",
  ];

  // Credentials login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoFilledNotice, setAutoFilledNotice] = useState(false);

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
        setAutoFilledNotice(true);
      }

      // Restore saved studyMode and center
      const savedMode = localStorage.getItem("kholasa_study_mode");
      if (savedMode === "ONLINE" || savedMode === "OFFLINE") {
        setStudyMode(savedMode);
      }
      const savedCenter = localStorage.getItem("kholasa_selected_center");
      if (savedCenter) {
        if (POPULAR_CENTERS.includes(savedCenter)) {
          setSelectedCenter(savedCenter);
        } else {
          setSelectedCenter("سنتر آخر (أدخل اسم السنتر)");
          setCustomCenter(savedCenter);
        }
      }
    } catch {
      // Ignore URL / localStorage parsing errors
    }
  }, []);

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = studentCode.trim().toUpperCase();
    if (!cleanCode) {
      setError("يرجى إدخال كود الطالب");
      return;
    }

    const finalCenterName =
      studyMode === "OFFLINE"
        ? selectedCenter === "سنتر آخر (أدخل اسم السنتر)"
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-right font-sans relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      <div className="w-full sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo
            href="/"
            variant="combined"
            size="lg"
            priority
            subtitleText="EL KHOLASA"
            className="mb-4"
          />
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            {loginMode === "code" ? "تسجيل دخول الطالب" : "تسجيل دخول الإدارة والمعلمين"}
          </h2>
          <p className="mt-1 text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            {loginMode === "code"
              ? "ادخل كود المنصة الخاص بك للبدء مباشرة"
              : "تسجيل الدخول بالبريد الإلكتروني أو الهاتف"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#0F172A] py-8 px-6 sm:px-8 border border-[#E2E8F0] dark:border-[#334155] rounded-2xl shadow-sm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#DC2626]/20 dark:border-[#F87171]/40 flex items-start gap-3 text-right">
              <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <p className="text-[13px] sm:text-sm font-bold text-[#DC2626] dark:text-[#F87171] leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* MODE 1: STUDENT CODE LOGIN (DEFAULT) */}
          {loginMode === "code" ? (
            <form onSubmit={handleCodeLogin} className="space-y-5">
              {autoFilledNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تم استرجاع وتعبئة كود الدخول الخاص بك تلقائياً. اضغط "دخول" للمتابعة.</span>
                </div>
              )}
              <div>
                <label
                  htmlFor="studentCode"
                  className="block text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2"
                >
                  كود الطالب (Login Code)
                </label>
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
                    className="w-full h-12 pr-11 pl-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] text-base font-bold font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-all"
                    dir="ltr"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                    <KeyRound className="w-4 h-4 text-[#800020]" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>يقترن الحساب بجهازك الشخصي المعتمد تلقائياً (جهاز واحد فقط).</span>
                </div>
              </div>

              {/* Attendance Mode (Online vs Offline/Center) */}
              <div className="space-y-2 pt-1">
                <label className="block text-[12px] sm:text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  نظام الحضور والدراسة
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                  <button
                    type="button"
                    onClick={() => setStudyMode("ONLINE")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      studyMode === "ONLINE"
                        ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-rose-400 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
                        : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>🌐 أونلاين فقط</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudyMode("OFFLINE")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      studyMode === "OFFLINE"
                        ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-rose-400 shadow-sm border border-[#E2E8F0] dark:border-[#334155]"
                        : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>🏫 سنتر (أوفلاين)</span>
                  </button>
                </div>
              </div>

              {/* If Center / Offline is selected */}
              {studyMode === "OFFLINE" && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2.5 animate-in fade-in duration-200">
                  <label
                    htmlFor="centerSelect"
                    className="block text-xs font-bold text-amber-900 dark:text-amber-200"
                  >
                    اختر السنتر التابع له:
                  </label>
                  <select
                    id="centerSelect"
                    value={selectedCenter}
                    onChange={(e) => setSelectedCenter(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  >
                    {POPULAR_CENTERS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {selectedCenter === "سنتر آخر (أدخل اسم السنتر)" && (
                    <input
                      type="text"
                      required
                      value={customCenter}
                      onChange={(e) => setCustomCenter(e.target.value)}
                      placeholder="اكتب اسم السنتر التابع له..."
                      className="w-full h-9 px-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#800020]"
                    />
                  )}
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                    يتم ربط متابعتك ودرجاتك بالسنتر المعتمد لسهولة تواصل المساعد وولي الأمر.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 interactive-tap shadow-xs"
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
          <div className="mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-col gap-3 text-center text-xs">
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

                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] space-y-1.5">
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

        <div className="mt-6 text-center">
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
