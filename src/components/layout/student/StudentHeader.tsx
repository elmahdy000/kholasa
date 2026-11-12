"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { List, MagnifyingGlass, Moon, Sun, X } from "@phosphor-icons/react";
import { cn, getCleanStudentName } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useTheme } from "@/components/theme/ThemeProvider";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import type { NavItem, StudentShellUser } from "./types";

import { AnimatePresence, motion } from "framer-motion";
import { AnimatedCount } from "@/components/ui/AnimatedCount";
import type { StudentMistakeDiagnosisSummary } from "@/lib/mistake-diagnosis";

interface StudentHeaderProps {
  navItems: NavItem[];
  pathname: string;
  user?: StudentShellUser | null;
  onOpenSearch: () => void;
  mistakesSummary?: StudentMistakeDiagnosisSummary;
}

export function StudentHeader({
  navItems,
  pathname,
  user,
  onOpenSearch,
  mistakesSummary,
}: StudentHeaderProps) {
  const isStudentViewer = Boolean(user) && (!user?.role || user.role === "STUDENT");
  const unresolvedMistakesCount = mistakesSummary?.unresolvedCount ?? 0;
  const topWeakness = mistakesSummary?.topWeakness ?? null;
  const mistakesNavItem = navItems.find((item) => item.href === "/mistakes");
  const MistakesNavIcon = mistakesNavItem?.icon;
  const mistakesTooltip = topWeakness
    ? `مراجعة لأخطائي (${unresolvedMistakesCount}) — أكتر نقطة محتاجة مراجعة: ${topWeakness.subjectName}${topWeakness.lessonTitle ? ` • ${topWeakness.lessonTitle}` : ""}`
    : unresolvedMistakesCount > 0
      ? `مراجعة لأخطائي (${unresolvedMistakesCount} سؤال محتاج مراجعة)`
      : "مراجعة لأخطائي — مفيش أخطاء مستنياك دلوقتي";
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#081426]/95 backdrop-blur-md border-b border-[#DFE6F0] dark:border-[#1E3352] transition-colors">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Brand */}
        <div className="shrink-0 min-w-0">
          <div className="sm:hidden">
            <BrandLogo
              href="/dashboard"
              variant="combined"
              size="sm"
              priority
              showSubtitle={false}
            />
          </div>
          <div className="hidden sm:block">
            <BrandLogo
              href="/dashboard"
              variant="combined"
              size="md"
              priority
              subtitleText="EL KHOLASA"
            />
          </div>
        </div>

        {/* Desktop Nav Links (hidden on mobile and tablet, displayed on lg+) */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden lg:flex items-center gap-1 bg-[#F5F7FB] dark:bg-[#0D1B2E] p-1 rounded-xl border border-[#DFE6F0] dark:border-[#1E3352]"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                (pathname.startsWith(`${item.href}/`) ||
                  (item.href === "/subjects" && pathname.startsWith("/lessons/"))));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-white dark:bg-[#0F1E36] text-[#830D3C] dark:text-[#F5F7FB] border border-[#DFE6F0] dark:border-[#1E3352] shadow-xs"
                    : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0B1D42] dark:hover:text-[#F5F7FB]"
                )}
              >
                <Icon
                  className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-[#830D3C] dark:text-[#E9AD32]" : "")}
                  weight={isActive ? "fill" : "bold"}
                />
                <span>{item.label}</span>
                {item.href === "/mistakes" && isStudentViewer && (
                  <AnimatePresence mode="wait">
                    {unresolvedMistakesCount > 0 ? (
                      <motion.span
                        key={`nav-mistakes-${unresolvedMistakesCount}`}
                        initial={{ scale: 0.72, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.72, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 460, damping: 24 }}
                        title={mistakesTooltip}
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black tabular-nums bg-[#830D3C] dark:bg-[#9E1043] text-white shadow-xs"
                      >
                        <AnimatedCount value={unresolvedMistakesCount} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="nav-mistakes-zero"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black tabular-nums bg-[#15803D]/12 text-[#15803D] dark:text-[#34D399]"
                        title={mistakesTooltip}
                      >
                        0 ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Widgets: Minimal Essential Set on Mobile + Secondary Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Search Button (⌘K) */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-10 h-10 sm:w-auto sm:h-10 sm:px-3 rounded-lg border border-[#DFE6F0] dark:border-[#22364F] bg-white dark:bg-[#10233A] text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:border-[#830D3C]/40 dark:hover:border-[#A30D36]/60 hover:text-[#0B1D42] dark:hover:text-[#F5F7FB] flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="بحث سريع (⌘K)"
            aria-label="بحث سريع"
          >
            <MagnifyingGlass className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" weight="bold" />
            <span className="hidden sm:inline text-xs">ابحث...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[11px] bg-[#F5F7FB] dark:bg-[#132945] text-[#64748B] dark:text-[#94A3B8] font-mono border border-[#DFE6F0] dark:border-[#22364F]">
              ⌘K
            </kbd>
          </button>

          {/* Notification Bell Widget */}
          <NotificationBell />

          {/* Dark Mode Toggle (Direct on lg+, inside accessible mobile menu below lg) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden lg:flex w-10 h-10 rounded-lg border border-[#DFE6F0] dark:border-[#22364F] bg-white dark:bg-[#10233A] items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#0B1D42] dark:hover:text-[#F5F7FB] hover:border-[#830D3C]/40 transition-colors cursor-pointer"
            title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#E59A18]" weight="bold" />
            ) : (
              <Moon className="w-4 h-4 text-[#830D3C]" weight="bold" />
            )}
          </button>

          {/* Student Profile Access */}
          <Link
            href="/profile"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center gap-2 p-1 sm:pl-2 rounded-lg hover:bg-[#F5F7FB] dark:hover:bg-[#132945] transition-colors border border-transparent hover:border-[#DFE6F0] dark:hover:border-[#22364F]"
            title="الملف الشخصي"
            aria-label="الملف الشخصي"
          >
            <div className="w-8 h-8 rounded-lg bg-[#830D3C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {(getCleanStudentName(user?.name) || "ط")[0]}
            </div>
            <div className="hidden lg:block text-right">
              <span className="text-xs font-bold text-[#0B1D42] dark:text-[#F5F7FB] block line-clamp-1 max-w-[90px]">
                {getCleanStudentName(user?.name) || "طالب"}
              </span>
            </div>
          </Link>

          {/* Accessible Secondary Actions Menu on Mobile / Tablet */}
          <div className="relative lg:hidden" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-header-secondary-menu"
              aria-label={mobileMenuOpen ? "إغلاق القائمة الإضافية" : "فتح القائمة الإضافية"}
              className="relative w-10 h-10 rounded-lg border border-[#DFE6F0] dark:border-[#22364F] bg-white dark:bg-[#10233A] flex items-center justify-center text-[#0B1D42] dark:text-[#F5F7FB] hover:border-[#830D3C]/50 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" weight="bold" />
              ) : (
                <List className="w-4 h-4" weight="bold" />
              )}
              {isStudentViewer && unresolvedMistakesCount > 0 && !mobileMenuOpen && (
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#830D3C] border-2 border-white dark:border-[#081426]" />
              )}
            </button>

            {mobileMenuOpen && (
              <div
                id="mobile-header-secondary-menu"
                role="menu"
                dir="rtl"
                className="absolute left-0 mt-2 w-60 rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#DFE6F0] dark:border-[#1E3352] shadow-[0_14px_34px_rgba(11,29,66,0.16)] p-2 space-y-1 z-50 text-right"
              >
                {isStudentViewer && MistakesNavIcon && (
                  <Link
                    href="/mistakes"
                    role="menuitem"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs font-bold text-[#0B1D42] dark:text-white hover:bg-[#F5F7FB] dark:hover:bg-[#142747] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <MistakesNavIcon className="w-4 h-4 text-[#830D3C] dark:text-[#FDA4AF]" weight="bold" />
                      <span>مراجعة لأخطائي</span>
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums text-white",
                        unresolvedMistakesCount > 0 ? "bg-[#830D3C]" : "bg-[#15803D]"
                      )}
                    >
                      {unresolvedMistakesCount}
                    </span>
                  </Link>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs font-bold text-[#0B1D42] dark:text-white hover:bg-[#F5F7FB] dark:hover:bg-[#142747] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {isDark ? (
                      <Sun className="w-4 h-4 text-[#E59A18]" weight="bold" />
                    ) : (
                      <Moon className="w-4 h-4 text-[#830D3C]" weight="bold" />
                    )}
                    <span>{isDark ? "الوضع الفاتح" : "الوضع الداكن"}</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
