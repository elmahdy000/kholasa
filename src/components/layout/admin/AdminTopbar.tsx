"use client";

import Link from "next/link";
import { type ElementType } from "react";
import { ChevronLeft, Search, Compass } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface ActivePageDetails {
  title: string;
  group: string;
  icon: ElementType;
}

interface AdminTopbarProps {
  activePage: ActivePageDetails;
  setIsCommandOpen: (v: boolean) => void;
}

export function AdminTopbar({ activePage, setIsCommandOpen }: AdminTopbarProps) {
  const ActiveIcon = activePage.icon;

  return (
    <header className="hidden md:flex items-center justify-between px-8 h-14 bg-white/80 dark:bg-[#0F172A]/80 border-b border-[#E2E8F0] dark:border-[#334155]/80 sticky top-0 z-30">
      {/* Breadcrumbs with active section icon */}
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-[#64748B] font-medium">لوحة الإدارة</span>
        <ChevronLeft className="w-3.5 h-3.5 text-[#64748B]" />
        <span className="text-[#64748B] font-medium">{activePage.group}</span>
        <ChevronLeft className="w-3.5 h-3.5 text-[#64748B]" />
        <div className="flex items-center gap-2 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          <ActiveIcon className="w-3.5 h-3.5 text-[#0F172A] dark:text-[#F8FAFC]" />
          <span>{activePage.title}</span>
        </div>
      </div>

      {/* Top Actions: Search trigger, Theme toggle, DB health, Student link */}
      <div className="flex items-center gap-3">
        {/* Quick Command Trigger */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[13px] text-[#64748B] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#64748B]" />
          <span>بحث سريع...</span>
          <kbd className="px-1.5 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#334155] text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            Ctrl+K
          </kbd>
        </button>

        {/* Professional Theme Switcher Dropdown */}
        <ThemeToggle variant="dropdown" />

        {/* PostgreSQL Connection Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md text-[13px] font-mono text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          <span>مساحة الإدارة</span>
        </div>

        {/* Switch to Student Interface */}
        <Link
          href="/dashboard"
          className="h-11 px-3 rounded-lg bg-[#334155] hover:bg-[#334155] dark:bg-[#F8FAFC] dark:hover:bg-white text-white dark:text-[#1E293B] text-[13px] font-semibold flex items-center gap-2 transition-all "
        >
          <Compass className="w-3.5 h-3.5" />
          <span>واجهة الطالب</span>
        </Link>
      </div>
    </header>
  );
}
