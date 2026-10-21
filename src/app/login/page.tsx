"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Shield,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      // Check role to direct appropriately
      if (data.user?.role === "ADMIN") {
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

  const handleFillDemo = (type: "student" | "admin") => {
    if (type === "student") {
      setIdentifier("student@kholasa.app");
      setPassword("12345678");
    } else {
      setIdentifier("admin@kholasa.app");
      setPassword("12345678");
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#09090B] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-right font-sans relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-95 mb-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-2xs group-hover:bg-[#4338CA] transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white block">
                الخُلاصة
              </span>
              <span className="text-[10px] font-mono font-medium text-[#4F46E5] dark:text-indigo-400 block tracking-wider">
                EL KHOLASA
              </span>
            </div>
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            تسجيل الدخول إلى حسابك
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            افهمها صح.. هتفضل معاك طول السنة
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-950 py-8 px-6 sm:px-8 shadow-xs border border-slate-200 dark:border-zinc-800 rounded-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3 text-right">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs sm:text-sm font-bold text-[#0F172A] dark:text-zinc-200 mb-1.5"
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
                  className="w-full h-11 pr-11 pl-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[#0F172A] dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                  dir="ltr"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-bold text-[#0F172A] dark:text-zinc-200"
                >
                  كلمة المرور
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline"
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
                  className="w-full h-11 pr-11 pl-11 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[#0F172A] dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                  dir="ltr"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
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
              className="w-full h-11 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 interactive-tap"
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

          {/* Quick Demo Section */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
            <p className="text-xs font-bold text-center text-[#64748B] dark:text-[#94A3B8] mb-3">
              جرّب الحسابات الجاهزة بنقرة واحدة:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleFillDemo("student")}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 hover:border-[#4F46E5] text-right flex items-center gap-2 transition-colors interactive-tap"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="block text-xs font-bold text-[#0F172A] dark:text-white truncate">
                    حساب طالب
                  </span>
                  <span className="block text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate">
                    طالب مجتهد
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo("admin")}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 hover:border-[#4F46E5] text-right flex items-center gap-2 transition-colors interactive-tap"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-900 text-[#0F172A] dark:text-zinc-200 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="block text-xs font-bold text-[#0F172A] dark:text-white truncate">
                    حساب مسؤول
                  </span>
                  <span className="block text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate">
                    لوحة الإدارة
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span>ليس لديك حساب بعد؟ </span>
            <Link
              href="/register"
              className="font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline"
            >
              سجّل حسابك الآن مجاناً
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
