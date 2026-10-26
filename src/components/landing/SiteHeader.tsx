"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "المميزات", href: "/#features" },
    { label: "كبسولة الزتونة", href: "/#demo" },
    { label: "إزاي تذاكر؟", href: "/#how-it-works" },
    { label: "المواد الدراسية", href: "/subjects" },
    { label: "بنك الأسئلة", href: "/exams/builder" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#081426]/95 backdrop-blur-md border-b border-[#E8E9ED] dark:border-[#22364F] transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[76px] flex items-center justify-between gap-4">
        {/* Brand Logo (Right-aligned in RTL) */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-[#800020] dark:bg-[#A30D36] flex items-center justify-center text-white font-bold text-lg group-hover:bg-[#66001A] dark:group-hover:bg-[#BD123F] transition-colors shadow-xs">
            خ
          </div>
          <div className="text-right">
            <span className="font-extrabold text-xl text-[#12263F] dark:text-[#F5F7FB] leading-tight block tracking-tight">
              الخلاصة
            </span>
            <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium block -mt-0.5">
              افهمها صح.. هتفضل معاك
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-[#64748B] dark:text-[#C8D2E0] hover:text-[#12263F] dark:hover:text-[#F5F7FB] hover:bg-[#F7F8FA] dark:hover:bg-[#132945] transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/admin"
            className="px-3 py-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F5F7FB] transition-colors"
          >
            الإدارة
          </Link>

          <Link
            href="/login"
            className="h-10 px-4 rounded-xl text-sm font-semibold text-[#12263F] dark:text-[#F5F7FB] border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A] hover:bg-[#F7F8FA] hover:border-[#800020] hover:text-[#800020] dark:hover:bg-[#132945] dark:hover:border-[#A30D36] dark:hover:text-white transition-colors shadow-xs flex items-center justify-center"
          >
            تسجيل الدخول
          </Link>

          <Link
            href="/register"
            className="h-10 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] dark:bg-[#A30D36] dark:hover:bg-[#BD123F] text-white text-sm font-bold flex items-center gap-2 transition-all shadow-xs active:scale-[0.99]"
          >
            <span>ابدأ مجانًا</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="sm:hidden">
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 rounded-xl border border-[#E8E9ED] dark:border-[#22364F] flex items-center justify-center text-[#12263F] dark:text-[#F5F7FB] hover:bg-[#F7F8FA] dark:hover:bg-[#132945] transition-colors cursor-pointer"
            aria-label="قائمة التصفح"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#081426] px-4 py-5 space-y-4 shadow-md animate-in fade-in slide-in-from-top-2">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#12263F] dark:text-[#F5F7FB] hover:bg-[#F7F8FA] dark:hover:bg-[#132945] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F7F8FA] dark:hover:bg-[#132945] transition-colors"
            >
              بوابة الإدارة
            </Link>
          </nav>

          <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#22364F] grid grid-cols-2 gap-2.5">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-10 rounded-xl border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A] text-sm font-semibold text-center flex items-center justify-center text-[#12263F] dark:text-[#F5F7FB] hover:bg-[#F7F8FA] hover:text-[#800020] hover:border-[#800020] dark:hover:bg-[#132945] dark:hover:text-white dark:hover:border-[#A30D36] active:scale-[0.99] transition-colors shadow-xs"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-10 rounded-xl bg-[#800020] hover:bg-[#66001A] dark:bg-[#A30D36] dark:hover:bg-[#BD123F] text-white text-sm font-bold text-center flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>ابدأ مجانًا</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}