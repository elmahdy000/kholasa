"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { List, X } from "@phosphor-icons/react";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "المميزات", href: "#features" },
    { label: "إزاي تذاكر؟", href: "#how-it-works" },
    { label: "جرّب بنفسك", href: "#demo" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-slate-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-bold text-base">
            خ
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-base text-[#0F172A] dark:text-white leading-tight block">
              الخلاصة
            </span>
            <span className="text-[10px] text-[#4F46E5] font-medium block -mt-0.5">
              EL KHOLASA
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#4F46E5] dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-bold transition-colors"
          >
            ابدأ مجانًا
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
          aria-label="القائمة"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" weight="bold" />
          ) : (
            <List className="w-6 h-6" weight="bold" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 mt-4 border-t border-[#E2E8F0] dark:border-slate-800 space-y-2">
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 rounded-lg text-sm font-medium text-center text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-slate-700 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="block w-full px-4 py-3 rounded-lg text-sm font-bold text-center text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-colors"
                >
                  ابدأ مجانًا
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}