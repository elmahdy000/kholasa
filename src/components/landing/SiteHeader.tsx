"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Trophy, Menu, X, BookOpen, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "المميزات", href: "/#features" },
    { label: "الزتونة الذهبية", href: "/#demo" },
    { label: "المقارنة", href: "/#comparison" },
    { label: "لوحة المتصدرين", href: "/leaderboard" },
    { label: "الأسئلة الشائعة", href: "/#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-11 h-11 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white font-bold text-xl  group-hover:bg-[#4338CA] transition-colors">
            خ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl text-[#0F172A] dark:text-white leading-tight block">
                الخلاصة
              </span>
              <span className="text-[13px] font-bold px-2 py-1 rounded-md bg-[#4F46E5]/10 dark:bg-[#1E293B] text-[#4F46E5] dark:text-[#6366F1] border border-[#E2E8F0]/60 dark:border-[#6366F1]">
                PWA
              </span>
            </div>
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-bold block -mt-1">
              افهمها صح.. هتفضل معاك
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-xl text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#334155]/60 transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/admin"
            className="px-3 py-2 rounded-xl text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
          >
            الإدارة
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-[13px] font-bold text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:border-[#4F46E5]  transition-all"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/dashboard"
            className="h-11 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition-colors active:opacity-80"
          >
            <span>دخول المنصة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Buttons */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="sm:hidden">
            <ThemeToggle />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-11 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
            aria-label="القائمة"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] dark:border-[#334155] bg-white/95 dark:bg-[#0F172A]/95  p-5 space-y-3 animate-in fade-in slide-in-from-top-2">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 rounded-xl text-[13px] font-bold text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] grid grid-cols-2 gap-2">
            <Link
              href="/login"
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-center flex items-center justify-center text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/dashboard"
              className="h-11 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[13px] font-bold text-center flex items-center justify-center gap-1 shadow-sm"
            >
              <span>دخول المنصة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}