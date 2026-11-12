"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SUPPORT_WHATSAPP_NUMBERS, buildWhatsAppUrl } from "@/lib/contact";

const SUPPORT_MESSAGE = "مرحباً، محتاج مساعدة بخصوص منصة الخلاصة للبكالوريا";

export function SiteFooter() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const handleOpenSupport = () => {
    setIsSupportOpen(true);
    if (typeof document !== "undefined") {
      document
        .getElementById("footer-support")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  return (
    <footer
      dir="rtl"
      className="bg-[#091B40] text-white py-7 sm:py-8 border-t border-white/10 text-right"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-7">
        {/* Main Horizontal Grid on Desktop / Stacked with 2-col Links on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* 1. Compact Brand Identity */}
          <div className="lg:col-span-3 pb-6 lg:pb-0 border-b border-white/10 lg:border-b-0 space-y-2">
            <BrandLogo
              href="/"
              variant="combined"
              size="sm"
              surfaceTheme="dark"
              glow={false}
              subtitleText="ذاكر، افهم، اختبر نفسك."
            />
          </div>

          {/* 2. Two Balanced Link Columns (2-col side by side on mobile AND desktop) */}
          <div className="lg:col-span-5 pb-6 lg:pb-0 border-b border-white/10 lg:border-b-0 grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#800B34] inline-block shrink-0" />
                <span>المنصة</span>
              </h4>
              <nav className="flex flex-col" aria-label="روابط المنصة الأساسية">
                <Link
                  href="/subjects"
                  className="min-h-[44px] flex items-center text-sm text-[#CBD5E1] hover:text-white transition-colors"
                >
                  المواد والدروس
                </Link>
                <Link
                  href="/exams/builder"
                  className="min-h-[44px] flex items-center text-sm text-[#CBD5E1] hover:text-white transition-colors"
                >
                  التدريبات والاختبارات
                </Link>
                <Link
                  href="/mistakes"
                  className="min-h-[44px] flex items-center text-sm text-[#CBD5E1] hover:text-white transition-colors"
                >
                  ركن غلطاتي
                </Link>
              </nav>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#800B34] inline-block shrink-0" />
                <span>حساب الطالب</span>
              </h4>
              <nav className="flex flex-col" aria-label="روابط حساب الطالب">
                <Link
                  href="/login"
                  className="min-h-[44px] flex items-center text-sm text-[#CBD5E1] hover:text-white transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/subscription"
                  className="min-h-[44px] flex items-center text-sm text-[#CBD5E1] hover:text-white transition-colors"
                >
                  إنشاء حساب
                </Link>
                <button
                  type="button"
                  onClick={handleOpenSupport}
                  className="min-h-[44px] flex items-center text-sm text-[#CBD5E1] hover:text-white transition-colors text-right cursor-pointer"
                >
                  المساعدة والدعم
                </button>
              </nav>
            </div>
          </div>

          {/* 3. Expandable WhatsApp Support Menu (All 3 Numbers Preserved Cleanly) */}
          <div id="footer-support" className="lg:col-span-4 space-y-2.5">
            <h4 className="text-sm font-bold text-white">محتاج مساعدة؟</h4>

            <button
              type="button"
              onClick={() => setIsSupportOpen((prev) => !prev)}
              aria-expanded={isSupportOpen}
              aria-controls="footer-whatsapp-list"
              className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                isSupportOpen
                  ? "bg-[#800B34] border-[#800B34] text-white"
                  : "bg-white/[0.04] border-white/15 hover:border-[#800B34] text-white"
              }`}
            >
              <span className="inline-flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>تواصل مع الدعم عبر واتساب</span>
              </span>
              {isSupportOpen ? (
                <ChevronDown className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronLeft className="w-4 h-4 shrink-0" />
              )}
            </button>

            {isSupportOpen ? (
              <div
                id="footer-whatsapp-list"
                className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 pt-1"
              >
                {SUPPORT_WHATSAPP_NUMBERS.map((num, idx) => (
                  <a
                    key={num.intl}
                    href={buildWhatsAppUrl(num.intl, SUPPORT_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-3.5 py-2 rounded-lg bg-white/[0.06] hover:bg-[#17834B] border border-white/15 hover:border-[#17834B] text-white text-xs font-bold flex items-center justify-between gap-2 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1.5 text-[#CBD5E1]">
                      <MessageCircle className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                      <span>واتساب {idx + 1}</span>
                    </span>
                    <span dir="ltr" className="font-sans tabular-nums text-white">
                      {num.local}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                اضغط لاختيار أي من أرقام الدعم الثلاثة عبر واتساب.
              </p>
            )}
          </div>
        </div>

        {/* 4. Compact Legal & Copyright Footer Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col items-center text-center gap-2 text-xs text-[#94A3B8]">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link
              href="/privacy"
              className="min-h-[44px] px-2 inline-flex items-center hover:text-white transition-colors"
            >
              سياسة الخصوصية
            </Link>
            <span aria-hidden="true" className="text-white/25">
              |
            </span>
            <Link
              href="/terms"
              className="min-h-[44px] px-2 inline-flex items-center hover:text-white transition-colors"
            >
              شروط الاستخدام
            </Link>
          </div>

          <p className="text-[#CBD5E1]">
            © {new Date().getFullYear()} EL KHOLASA — جميع الحقوق محفوظة
          </p>
          <p className="font-semibold text-[#94A3B8] font-sans">Dr/Elmahdy</p>
        </div>
      </div>
    </footer>
  );
}
