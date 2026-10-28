"use client";

import Link from "next/link";
import { MagnifyingGlass, Moon, Sun } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { NavItem, StudentShellUser } from "./types";

interface StudentHeaderProps {
  navItems: NavItem[];
  pathname: string;
  user?: StudentShellUser | null;
  onOpenSearch: () => void;
}

export function StudentHeader({
  navItems,
  pathname,
  user,
  onOpenSearch,
}: StudentHeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#081426]/95 backdrop-blur-md border-b border-[#E8E9ED] dark:border-[#22364F] transition-colors">
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

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F7F8FA] dark:bg-[#0D1B2E] p-1 rounded-xl border border-[#E8E9ED] dark:border-[#22364F]">
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
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all",
                  isActive
                    ? "bg-white dark:bg-[#10233A] text-[#800020] dark:text-[#F5F7FB] border border-[#E8E9ED] dark:border-[#2D4563] shadow-xs"
                    : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F5F7FB]"
                )}
              >
                <Icon
                  className={cn("w-3.5 h-3.5", isActive ? "text-[#800020] dark:text-[#A30D36]" : "")}
                  weight={isActive ? "fill" : "bold"}
                />
                <span>{item.label}</span>
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
            className="w-9 h-9 sm:w-auto sm:h-10 sm:px-3 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A] text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:border-[#800020]/40 dark:hover:border-[#A30D36]/60 hover:text-[#12263F] dark:hover:text-[#F5F7FB] flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="بحث سريع (⌘K)"
            aria-label="بحث سريع"
          >
            <MagnifyingGlass className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" weight="bold" />
            <span className="hidden sm:inline text-xs">ابحث...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[11px] bg-[#F7F8FA] dark:bg-[#132945] text-[#64748B] dark:text-[#94A3B8] font-mono border border-[#E8E9ED] dark:border-[#22364F]">
              ⌘K
            </kbd>
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F5F7FB] hover:border-[#800020]/40 dark:hover:border-[#A30D36]/60 transition-colors cursor-pointer"
            title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#E59A18]" weight="bold" />
            ) : (
              <Moon className="w-4 h-4 text-[#800020]" weight="bold" />
            )}
          </button>

          {/* User Profile Avatar */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 sm:pl-2 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#132945] transition-colors border border-transparent hover:border-[#E8E9ED] dark:hover:border-[#22364F]"
            title="الملف الشخصي"
          >
            <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name ? user.name[0] : "ط"}
            </div>
            <div className="hidden lg:block text-right">
              <span className="text-xs font-bold text-[#12263F] dark:text-[#F5F7FB] block line-clamp-1 max-w-[90px]">
                {user?.name || "طالب"}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
