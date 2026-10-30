"use client";

import { useState } from "react";
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
} from "lucide-react";

import { BrandLogo } from "@/components/ui/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeLogin = async (id: string, pass: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      // Check role to direct appropriately
      if (["TEACHER", "EDITOR", "ADMIN", "SUPER_ADMIN"].includes(data.user?.role)) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ أثناء تسجيل الدخول");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin(identifier, password);
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
            تسجيل الدخول إلى حسابك
          </h2>
          <p className="mt-1 text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            افهمها صح.. هتفضل معاك طول السنة
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#0F172A] py-8 px-6 sm:px-8  border border-[#E2E8F0] dark:border-[#334155] rounded-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#F87171]/40 flex items-start gap-3 text-right">
              <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-1" />
              <p className="text-[13px] sm:text-sm font-bold text-[#DC2626] dark:text-[#F87171]">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline"
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
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white font-bold text-[13px] sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 interactive-tap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ تسجيل الدخول...</span>
                </>
              ) : (
                <span>دخول</span>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-[13px] text-[#64748B] dark:text-[#94A3B8]">
            <span>ليس لديك حساب بعد؟ </span>
            <Link
              href="/register"
              className="font-bold text-[#800020] dark:text-[#FB7185] hover:underline"
            >
              سجّل حسابك الآن مجاناً
            </Link>
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
