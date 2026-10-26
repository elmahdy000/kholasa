"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import { BrandLogo } from "@/components/ui/BrandLogo";

type Step = "REQUEST_OTP" | "VERIFY_OTP" | "NEW_PASSWORD" | "SUCCESS";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("REQUEST_OTP");
  const [identifier, setIdentifier] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  // 1. Send OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, type: "PASSWORD_RESET" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر إرسال رمز التحقق");
      }

      if (data.devCode) {
        setDevCodeHint(data.devCode);
        setOtpToken(data.devCode);
      }
      setStep("VERIFY_OTP");
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, token: otpToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "رمز التحقق غير صحيح");
      }

      setResetToken(data.resetToken);
      setStep("NEW_PASSWORD");
    } catch (err: any) {
      setError(err.message || "رمز التحقق غير صحيح");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تعيين كلمة المرور الجديدة");
      }

      setStep("SUCCESS");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء حفظ كلمة المرور");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-right font-sans relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
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
            استعادة كلمة المرور
          </h2>
          <p className="mt-1 text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            {step === "REQUEST_OTP" && "أدخل بريدك الإلكتروني أو رقم الهاتف المسجل لإرسال رمز التحقق"}
            {step === "VERIFY_OTP" && "أدخل رمز التحقق المكون من 6 أرقام"}
            {step === "NEW_PASSWORD" && "أنشئ كلمة مرور قوية جديدة لحسابك"}
            {step === "SUCCESS" && "تم تحديث كلمة المرور بنجاح!"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#0F172A] py-8 px-6 sm:px-8  border border-[#E2E8F0] dark:border-[#334155] rounded-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#F87171]/40 flex items-start gap-3 text-right animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-1" />
              <p className="text-[13px] sm:text-sm font-bold text-[#DC2626] dark:text-[#F87171]">
                {error}
              </p>
            </div>
          )}

          {/* STEP 1: REQUEST OTP */}
          {step === "REQUEST_OTP" && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
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
                    placeholder="student@kholasa.app أو 01012345678"
                    className="w-full h-11 pr-11 pl-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-all"
                    dir="ltr"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 interactive-tap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ الإرسال...</span>
                  </>
                ) : (
                  <>
                    <span>إرسال رمز التحقق</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === "VERIFY_OTP" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="otp"
                    className="block text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    رمز التحقق (OTP)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("REQUEST_OTP");
                      setError(null);
                    }}
                    className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>تغيير المعرف</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    required
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    placeholder="123456"
                    className="w-full h-12 pr-11 pl-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] text-lg font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-all"
                    dir="ltr"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </div>
                </div>

                {devCodeHint && (
                  <div className="mt-2 p-3 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#E11D48]/40 flex items-center justify-between text-[13px] text-[#800020] dark:text-[#FB7185]">
                    <span className="font-medium">رمز التحقق التجريبي:</span>
                    <span className="font-mono font-bold tracking-wider">{devCodeHint}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 interactive-tap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ التحقق...</span>
                  </>
                ) : (
                  <>
                    <span>تأكيد الرمز والمتابعة</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === "NEW_PASSWORD" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2"
                >
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] dark:hover:text-[#F8FAFC]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2"
                >
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pr-11 pl-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-all"
                    dir="ltr"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 interactive-tap mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ الحفظ...</span>
                  </>
                ) : (
                  <>
                    <span>تعيين كلمة المرور الجديدة</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === "SUCCESS" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#34D399] flex items-center justify-center mx-auto text-[#059669] dark:text-[#34D399]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                  تم تعيين كلمة المرور بنجاح!
                </h3>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                  يمكنك الآن تسجيل الدخول مباشرة بكلمة المرور الجديدة.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all interactive-tap"
              >
                <span>العودة لصفحة تسجيل الدخول</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Back to Login Link */}
          {step !== "SUCCESS" && (
            <div className="mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#1E293B] text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[13px] font-bold text-[#64748B] hover:text-[#800020] dark:text-[#94A3B8] dark:hover:text-[#FB7185] transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة إلى تسجيل الدخول</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
