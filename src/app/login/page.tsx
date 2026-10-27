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
  Sparkles,
  GraduationCap,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { BrandLogo } from "@/components/ui/BrandLogo";

const DEMO_ACCOUNTS = [
  {
    title: "طالب (تانية بكالوريا - هندسة)",
    badge: "طالب ثانوي",
    identifier: "student@kholasa.app",
    password: "Student@123",
    icon: GraduationCap,
    iconBg: "bg-[#800020]/10 dark:bg-[#800020]/20",
    iconColor: "text-[#800020] dark:text-[#FB7185]",
    badgeStyle: "bg-[#800020]/10 text-[#800020] dark:text-[#FB7185]",
  },
  {
    title: "طالبة (أولى بكالوريا - عام)",
    badge: "طالبة ثانوي",
    identifier: "student.g10@kholasa.app",
    password: "Student@123",
    icon: UserCheck,
    iconBg: "bg-[#059669]/10 dark:bg-[#059669]/20",
    iconColor: "text-[#059669] dark:text-[#34D399]",
    badgeStyle: "bg-[#059669]/10 text-[#059669] dark:text-[#34D399]",
  },
  {
    title: "المشرف العام (لوحة الإدارة)",
    badge: "Admin",
    identifier: "admin@kholasa.app",
    password: "Admin@123",
    icon: ShieldCheck,
    iconBg: "bg-[#D97706]/10 dark:bg-[#D97706]/20",
    iconColor: "text-[#D97706] dark:text-[#FBBF24]",
    badgeStyle: "bg-[#D97706]/10 text-[#D97706] dark:text-[#FBBF24]",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDemoId, setLoadingDemoId] = useState<string | null>(null);
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
      setLoadingDemoId(null);
    }
  };

  const handleDemoLogin = (demoIdentifier: string, demoPass: string) => {
    setIdentifier(demoIdentifier);
    setPassword(demoPass);
    setLoadingDemoId(demoIdentifier);
    executeLogin(demoIdentifier, demoPass);
  };

  const fillFormOnly = (demoIdentifier: string, demoPass: string) => {
    setIdentifier(demoIdentifier);
    setPassword(demoPass);
    setError(null);
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
              {isLoading && !loadingDemoId ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ تسجيل الدخول...</span>
                </>
              ) : (
                <span>دخول</span>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts (حسابات تجريبية للمعاينة السريعة) */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24]" />
                <h3 className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  حسابات تجريبية (اضغط وجرب مباشرة ⚡)
                </h3>
              </div>
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                نقرة واحدة للدخول
              </span>
            </div>

            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isThisLoading = loadingDemoId === acc.identifier;
                const Icon = acc.icon;
                return (
                  <div
                    key={acc.identifier}
                    className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/60 hover:border-[#800020]/40 dark:hover:border-[#FB7185]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${acc.iconBg}`}
                      >
                        <Icon className={`w-4.5 h-4.5 ${acc.iconColor}`} />
                      </div>
                      <div className="min-w-0 text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            {acc.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${acc.badgeStyle}`}
                          >
                            {acc.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5">
                          <span dir="ltr">{acc.identifier}</span>
                          <span>•</span>
                          <span dir="ltr">{acc.password}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => fillFormOnly(acc.identifier, acc.password)}
                        className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white px-2 py-1 rounded-md border border-[#E2E8F0] dark:border-[#334155] hover:bg-white dark:hover:bg-[#1E293B] transition-colors"
                        title="تعبئة بيانات الحساب في الحقول أعلاه"
                      >
                        تعبئة فقط
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleDemoLogin(acc.identifier, acc.password)}
                        className="h-8 px-3 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 interactive-tap"
                      >
                        {isThisLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جارٍ الدخول...</span>
                          </>
                        ) : (
                          <>
                            <span>دخول فوري</span>
                            <span className="text-[11px]">⚡</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
