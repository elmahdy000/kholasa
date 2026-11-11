"use client";

import Link from "next/link";
import { MagnifyingGlass, Moon, Sun } from "@phosphor-icons/react";
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
    ? `مراجعة لأخطائي (${unresolvedMistakesCount}) — أكثر نقطة محتاجة مراجعة: ${topWeakness.subjectName}${topWeakness.lessonTitle ? ` • ${topWeakness.lessonTitle}` : ""}`
    : unresolvedMistakesCount > 0
      ? `مراجعة لأخطائي (${unresolvedMistakesCount} سؤال في انتظار المراجعة)`
      : "مراجعة لأخطائي — ممتاز! لا توجد أخطاء معلقة الآن";
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#081426]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E3352] transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
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
        <nav className="hidden lg:flex items-center gap-1 bg-[#F7F9FC] dark:bg-[#0D1B2E] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#1E3352]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-white dark:bg-[#0F1E36] text-[#800B34] dark:text-[#F5F7FB] border border-[#E2E8F0] dark:border-[#1E3352] shadow-xs"
                    : "text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-[#F5F7FB]"
                )}
              >
                <Icon
                  className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-[#800B34] dark:text-[#E9AD32]" : "")}
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
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black tabular-nums bg-[#DC2626] text-white shadow-xs"
                      >
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                        </span>
                        <AnimatedCount value={unresolvedMistakesCount} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="nav-mistakes-zero"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black tabular-nums bg-[#059669]/12 text-[#059669] dark:text-[#34D399]"
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

        {/* Right Action Widgets */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Search Button (⌘K) */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-9 h-9 sm:w-auto sm:h-10 sm:px-3 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A] text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:border-[#800B34]/40 dark:hover:border-[#A30D36]/60 hover:text-[#12263F] dark:hover:text-[#F5F7FB] flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="بحث سريع (⌘K)"
            aria-label="بحث سريع"
          >
            <MagnifyingGlass className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" weight="bold" />
            <span className="hidden sm:inline text-xs">ابحث...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[11px] bg-[#F7F8FA] dark:bg-[#132945] text-[#64748B] dark:text-[#94A3B8] font-mono border border-[#E8E9ED] dark:border-[#22364F]">
              ⌘K
            </kbd>
          </button>

          {/* Compact Live Mistakes Counter Chip (Mobile/Tablet Header) */}
          {isStudentViewer && (
            <Link
              href="/mistakes"
              title={mistakesTooltip}
              aria-label={`مراجعة لأخطائي: ${unresolvedMistakesCount}`}
              className={cn(
                "lg:hidden inline-flex items-center gap-1.5 h-8 px-2 sm:px-2.5 rounded-lg border text-[11px] font-black transition-all shrink-0",
                unresolvedMistakesCount > 0
                  ? "bg-[#FEF2F2] dark:bg-[#DC2626]/15 border-[#FECACA] dark:border-[#DC2626]/35 text-[#B91C1C] dark:text-[#FCA5A5] hover:border-[#DC2626]"
                  : "bg-[#ECFDF5] dark:bg-[#059669]/15 border-[#A7F3D0] dark:border-[#059669]/35 text-[#047857] dark:text-[#34D399]"
              )}
            >
              {unresolvedMistakesCount > 0 ? (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]" />
                </span>
              ) : (
                MistakesNavIcon && <MistakesNavIcon className="w-3.5 h-3.5 shrink-0" weight="bold" />
              )}
              <span className="hidden sm:inline">مراجعة لأخطائي</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] tabular-nums font-black leading-none",
                  unresolvedMistakesCount > 0
                    ? "bg-[#DC2626] text-white"
                    : "bg-[#059669] text-white"
                )}
              >
                <AnimatedCount value={unresolvedMistakesCount} />
              </span>
            </Link>
          )}

          {/* Notification Bell Widget */}
          <NotificationBell />

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F5F7FB] hover:border-[#800B34]/40 dark:hover:border-[#A30D36]/60 transition-colors cursor-pointer"
            title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#E59A18]" weight="bold" />
            ) : (
              <Moon className="w-4 h-4 text-[#800B34]" weight="bold" />
            )}
          </button>

          {/* User Profile Avatar */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 sm:pl-2 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#132945] transition-colors border border-transparent hover:border-[#E8E9ED] dark:hover:border-[#22364F]"
            title="الملف الشخصي"
          >
            <div className="w-8 h-8 rounded-lg bg-[#800B34] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {(getCleanStudentName(user?.name) || "ط")[0]}
            </div>
            <div className="hidden lg:block text-right">
              <span className="text-xs font-bold text-[#12263F] dark:text-[#F5F7FB] block line-clamp-1 max-w-[90px]">
                {getCleanStudentName(user?.name) || "طالب"}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
