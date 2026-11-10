"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Clock, ShieldAlert, Smartphone } from "lucide-react";
import { WhatsAppSupportLinks } from "@/components/ui/WhatsAppSupportLinks";

interface LoginErrorBannerProps {
  error: string;
  studentCode?: string;
}

type ErrorKind = "rate_limit" | "device_limit" | "suspended" | "generic";

function classifyLoginError(error: string): {
  kind: ErrorKind;
  initialSeconds: number;
} {
  if (
    error.includes("إيقاف المحاولات مؤقتاً") ||
    error.includes("محاولات متكررة") ||
    error.includes("حاول لاحقاً")
  ) {
    const secMatch = /(\d+)\s*ثانية/.exec(error);
    const minMatch = /(\d+)\s*دقيقة/.exec(error);
    const initialSeconds = secMatch
      ? Number(secMatch[1])
      : minMatch
      ? Number(minMatch[1]) * 60
      : 60;
    return { kind: "rate_limit", initialSeconds };
  }

  if (error.includes("الحد الأقصى") || error.includes("مقترن بـ")) {
    return { kind: "device_limit", initialSeconds: 0 };
  }

  if (error.includes("معلق") || error.includes("بانتظار التفعيل")) {
    return { kind: "suspended", initialSeconds: 0 };
  }

  return { kind: "generic", initialSeconds: 0 };
}

function formatCountdownClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function LoginErrorBanner({ error, studentCode }: LoginErrorBannerProps) {
  const { kind, initialSeconds } = useMemo(() => classifyLoginError(error), [error]);
  const [countdown, setCountdown] = useState(initialSeconds);

  useEffect(() => {
    if (kind !== "rate_limit" || countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [kind, countdown]);

  const codeSuffix = studentCode?.trim() ? ` (كود الطالب: ${studentCode.trim()})` : "";

  if (kind === "rate_limit") {
    return (
      <div
        role="alert"
        className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/60 space-y-3 text-right animate-in fade-in"
      >
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <p className="text-[13px] sm:text-sm font-black text-amber-900 dark:text-amber-200">
              تهدئة أمنية مؤقتة — حسابك سليم وغير معطّل
            </p>
            <p className="text-xs sm:text-[13px] font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
              {error}
            </p>
            <div className="pt-1">
              {countdown > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/50 border border-amber-300/80 dark:border-amber-700 text-xs font-bold text-amber-900 dark:text-amber-100 font-sans tabular-nums">
                  <Clock className="w-3.5 h-3.5" />
                  <span>يمكنك المحاولة مجدداً بعد: {formatCountdownClock(countdown)}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  انتهت مدة الانتظار — اضغط &laquo;دخول إلى المنصة&raquo; الآن
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/50">
          <WhatsAppSupportLinks
            variant="compact"
            title="نسيت كود الدخول أو تحتاج للتأكد منه؟"
            message={`مرحباً، واجهت إيقافاً مؤقتاً أثناء محاولة الدخول وأريد التأكد من كودي${codeSuffix}`}
          />
        </div>
      </div>
    );
  }

  if (kind === "device_limit") {
    return (
      <div
        role="alert"
        className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/60 space-y-3 text-right animate-in fade-in"
      >
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="text-[13px] sm:text-sm font-black text-amber-950 dark:text-amber-100">
              الحساب مقترن بجهاز آخر
            </p>
            <p className="text-xs sm:text-[13px] font-semibold text-amber-800 dark:text-amber-200 leading-relaxed">
              {error}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/50">
          <WhatsAppSupportLinks
            variant="compact"
            title="تواصل مع الإدارة لفك ربط الجهاز القديم فوراً:"
            message={`مرحباً، حسابي وصل للحد الأقصى للأجهزة وأحتاج فك ربط الجهاز القديم${codeSuffix}`}
          />
        </div>
      </div>
    );
  }

  if (kind === "suspended") {
    return (
      <div
        role="alert"
        className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-3 text-right animate-in fade-in"
      >
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="text-[13px] sm:text-sm font-black text-rose-800 dark:text-rose-200">
              الحساب معلق أو بانتظار التفعيل
            </p>
            <p className="text-xs sm:text-[13px] font-semibold text-rose-700 dark:text-rose-300 leading-relaxed">
              {error}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-rose-500/20">
          <WhatsAppSupportLinks
            variant="compact"
            title="تواصل مع المساعد لتفعيل الحساب:"
            message={`مرحباً، حسابي معلق أو بانتظار التفعيل على منصة الخلاصة${codeSuffix}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-right animate-in fade-in"
    >
      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      <p className="text-[13px] sm:text-sm font-bold text-rose-700 dark:text-rose-300 leading-relaxed">
        {error}
      </p>
    </div>
  );
}

