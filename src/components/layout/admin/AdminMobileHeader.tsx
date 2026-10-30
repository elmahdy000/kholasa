"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Search, Menu, X } from "lucide-react";

interface AdminMobileHeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  setIsCommandOpen: (v: boolean) => void;
}

export function AdminMobileHeader({
  mobileMenuOpen,
  setMobileMenuOpen,
  setIsCommandOpen,
}: AdminMobileHeaderProps) {
  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <BrandLogo variant="icon" size="xs" />
          <div>
            <span className="font-bold text-[13px] text-[#0F172A] dark:text-[#F8FAFC] block leading-tight">
              الخلاصة
            </span>
            <span className="text-[11px] font-mono text-[#64748B] leading-none">
              لوحة الإدارة
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="h-11 w-11" />
          <button
            onClick={() => setIsCommandOpen(true)}
            aria-label="البحث في خدمات الإدارة"
            className="min-h-11 min-w-11 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
            aria-label="القائمة"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
