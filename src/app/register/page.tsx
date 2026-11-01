"use client";

import Link from "next/link";
import {
  ArrowRight,
  KeyRound,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  Headphones,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-right font-sans relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      <div className="w-full sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
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
            الانضمام إلى منصة الخلاصة
          </h2>
          <p className="mt-1 text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            نظام الدخول المعتمد بكود الطالب الشخصي
          </p>
        </div>

        {/* Informational Card */}
        <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-8 border border-[#E2E8F0] dark:border-[#334155] rounded-2xl shadow-sm space-y-6">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <KeyRound className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold mb-1">التسجيل عبر المساعد أو الإدارة فقط</p>
              <p className="text-xs opacity-90">
                للحفاظ على جودة الخدمة وربط الأجهزة المعتمدة، يتم إصدار كود دخول فريد لكل طالب من خلال فريق العمل مباشرة دون الحاجة لملء استمارات تسجيل.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              خطوات الحصول على كود المنصة والبدء:
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155]">
                <div className="w-6 h-6 rounded-full bg-[#800020] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span className="font-bold text-[#0F172A] dark:text-white block">
                    تواصل مع المساعد أو الإدارة
                  </span>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    أرسل اسمك وبيانات صفك الدراسي عبر الواتساب لتفعيل اشتراكك.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155]">
                <div className="w-6 h-6 rounded-full bg-[#800020] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span className="font-bold text-[#0F172A] dark:text-white block">
                    استلم كود الدخول الخاص بك (Login Code)
                  </span>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    ستحصل على كود فوري مخصص لك (مثال: <code className="font-mono font-bold text-[#800020] dark:text-[#FB7185]">J9KFQY</code>).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155]">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <span className="font-bold text-[#0F172A] dark:text-white block">
                    سجّل الدخول فوراً بدون كلمة مرور
                  </span>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    ادخل الكود في صفحة الدخول، وسيتم توثيق جهازك والبدء في المذاكرة والامتحانات مباشرة.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <a
              href="https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%AD%D8%B5%D9%88%D9%84%20%D8%B9%D9%84%D9%89%20%D9%83%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D9%85%D9%86%D8%B5%D8%A9%20%D8%A7%D9%84%D8%AE%D9%84%D8%A7%D8%B5%D8%A9"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>تواصل مع المساعد عبر واتساب للحصول على الكود</span>
            </a>

            <Link
              href="/login"
              className="w-full h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>معك كود بالفعل؟ ادخل إلى حسابك الآن</span>
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
