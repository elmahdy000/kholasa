"use client";

import Link from "next/link";
import { type ElementType } from "react";
import { ChevronLeft, Search, Compass } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";

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
    <header className="hidden md:flex items-center justify-between px-6 lg:px-8 h-14 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#334155] sticky top-0 z-40 shadow-xs">
      {/* Breadcrumbs with active section icon */}
      <div className="flex items-center gap-2 text-[13px] min-w-0">
        <span className="text-[#64748B] dark:text-[#94A3B8] font-medium whitespace-nowrap">لوحة الإدارة</span>
        <ChevronLeft className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
        <span className="text-[#64748B] dark:text-[#94A3B8] font-medium whitespace-nowrap">{activePage.group}</span>
        <ChevronLeft className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
        <div className="flex items-center gap-1.5 font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
          <ActiveIcon className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185] shrink-0" />
          <span className="truncate">{activePage.title}</span>
        </div>
      </div>

      {/* Top Actions: Search trigger, Theme toggle, DB health, Student link */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Command Trigger */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/70 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[12px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
          <span>بحث سريع...</span>
          <kbd className="px-1.5 py-0.5 rounded-md bg-[#E2E8F0] dark:bg-[#334155] text-[10px] font-mono text-[#475569] dark:text-[#CBD5E1]">
            Ctrl+K
          </kbd>
        </button>

        {/* Professional Theme Switcher Dropdown */}
        <ThemeToggle variant="dropdown" />

        {/* Notifications */}
        <NotificationBell />

        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          <span>مساحة الإدارة</span>
        </div>

        {/* Switch to Student Interface */}
        <Link
          href="/dashboard"
          className="h-9 px-3 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>واجهة الطالب</span>
        </Link>
      </div>
    </header>
  );
}