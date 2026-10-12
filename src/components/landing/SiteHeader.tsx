"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Trophy, Menu, X, BookOpen, Zap } from "lucide-react";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "المميزات", href: "#features" },
    { label: "الزتونة الذهبية", href: "#demo" },
    { label: "المقارنة", href: "#comparison" },
    { label: "لوحة المتصدرين", href: "/leaderboard" },
    { label: "الأسئلة الشائعة", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:bg-[#4338CA] transition-colors">
            خ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl text-[#0F172A] dark:text-white leading-tight block">
                الخلاصة
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                PWA
              </span>
            </div>
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold block -mt-0.5">
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
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/admin"
            className="px-3 py-2 rounded-xl text-xs font-bold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
          >
            الإدارة
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#0F172A] dark:text-white border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E] hover:border-[#4F46E5] shadow-xs transition-all"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/dashboard"
            className="h-10 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors active:scale-95"
          >
            <span>دخول المنصة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="القائمة"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl p-5 space-y-3 animate-in fade-in slide-in-from-top-2">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-xs font-bold text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
            <Link
              href="/login"
              className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-center flex items-center justify-center text-[#0F172A] dark:text-white hover:bg-slate-50 transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/dashboard"
              className="h-10 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold text-center flex items-center justify-center gap-1 shadow-sm"
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