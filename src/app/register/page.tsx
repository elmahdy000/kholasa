"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, LogIn } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { WhatsAppSupportLinks } from "@/components/ui/WhatsAppSupportLinks";

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
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
            الانضمام إلى منصة الخلاصة للبكالوريا
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
            <h3 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
              خطوات الحصول على كود المنصة والبدء:
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155]">
                <div className="w-6 h-6 rounded-full bg-[#800B34] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
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
                <div className="w-6 h-6 rounded-full bg-[#800B34] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span className="font-bold text-[#0F172A] dark:text-white block">
                    استلم كود الدخول الخاص بك (Login Code)
                  </span>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    ستحصل على كود فوري مخصص لك (مثال: <code className="font-mono font-bold text-[#800B34] dark:text-[#FB7185]">J9KFQY</code>).
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
          <div className="space-y-4 pt-2">
            <Link
              href="/subscription"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#091B40] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>طالب جديد؟ سجّل بياناتك واشترك أونلاين الآن</span>
            </Link>

            <WhatsAppSupportLinks
              variant="buttons"
              title="تواصل مع المساعد عبر واتساب للحصول على الكود:"
              message="مرحباً، أريد الحصول على كود الاشتراك في منصة الخلاصة للبكالوريا"
            />

            <Link
              href="/login"
              className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
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
