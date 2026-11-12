"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "جرّب المنهج", href: "/#curriculum-explorer" },
    { label: "إزاي بتتعلم؟", href: "/#features" },
    { label: "المواد الدراسية", href: "/subjects" },
    { label: "بنك الأسئلة", href: "/exams/builder" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#081426] border-b border-[#E8E9ED] dark:border-[#22364F] transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <BrandLogo
          href="/"
          variant="combined"
          size="md"
          priority
          glow={false}
          subtitleText="المنصة الذكية للبكالوريا المصرية"
        />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-[#536681] dark:text-[#C8D2E0] hover:text-[#091B40] dark:hover:text-[#F5F7FB] hover:bg-[#F7F9FC] dark:hover:bg-[#132945] transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions (Always visible on both Mobile & Desktop so students find login immediately) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          <Link
            href="/login"
            className="min-h-[42px] sm:min-h-[44px] px-3 sm:px-4 rounded-lg bg-[#800B34] hover:bg-[#680829] dark:bg-[#A30D36] dark:hover:bg-[#8E0B2F] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap"
          >
            <span>دخول الطالب</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Navigation Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-11 h-11 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] flex items-center justify-center text-[#12263F] dark:text-[#F5F7FB] hover:bg-[#F7F8FA] dark:hover:bg-[#132945] transition-colors cursor-pointer"
            aria-label="قائمة التصفح"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#081426] px-4 py-4 space-y-3 shadow-sm">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center min-h-[44px] px-3.5 rounded-lg text-sm font-semibold text-[#12263F] dark:text-[#F5F7FB] hover:bg-[#F7F8FA] dark:hover:bg-[#132945] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#E8E9ED] dark:border-[#22364F] grid grid-cols-1 gap-2">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full min-h-[44px] rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>دخول بكود الطالب</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/subscription"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full min-h-[44px] rounded-lg bg-[#091B40] hover:bg-[#1D4ED8] text-white text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>طالب جديد؟ سجل واشترك</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
