"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  Search,
  PanelRightClose,
  PanelRightOpen,
  X,
  Compass,
  ExternalLink,
  LogOut,
} from "lucide-react";
import type { AdminNavGroup, AdminUser } from "./types";
import { getRoleArabicLabel } from "./navigation";

interface AdminSidebarProps {
  user: AdminUser;
  navigationGroups: AdminNavGroup[];
  isCollapsed: boolean;
  mobileMenuOpen: boolean;
  isLoggingOut: boolean;
  setIsCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  setMobileMenuOpen: (v: boolean) => void;
  setIsCommandOpen: (v: boolean) => void;
  onLogout: () => void;
}

export function AdminSidebar({
  user,
  navigationGroups,
  isCollapsed,
  mobileMenuOpen,
  isLoggingOut,
  setIsCollapsed,
  setMobileMenuOpen,
  setIsCommandOpen,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed md:sticky top-0 right-0 h-screen shrink-0 z-50 transition-all duration-200 ease-in-out border-l border-[#E2E8F0] dark:border-[#334155]/80 bg-white dark:bg-[#0F172A] flex flex-col justify-between overflow-y-auto no-scrollbar ${
        mobileMenuOpen ? "translate-x-0 w-72" : "translate-x-full md:translate-x-0"
      } ${isCollapsed ? "md:w-20" : "md:w-72"}`}
    >
      <div className="p-4 space-y-5">
        {/* Workspace / Brand Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <Link
            href="/admin"
            className="flex items-center gap-3 group min-w-0"
            title="لوحة الإدارة - منصة الخلاصة"
          >
            <BrandLogo variant="icon" size="sm" className="shrink-0" />
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[13px] text-[#0F172A] dark:text-[#F8FAFC] tracking-tight block truncate">
                    منصة الخلاصة
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-bold font-mono bg-[#800020]/10 text-[#800020] border border-[#800020]/20">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[#059669] flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                  <span>النظام متصل</span>
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle Button (Desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-2 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            title={isCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
          >
            {isCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
          </button>

          {/* Close Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-md text-[#64748B] hover:text-[#64748B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search / Command Button in Sidebar */}
        {!isCollapsed ? (
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-[#1E293B]/70 dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] text-[13px] flex items-center justify-between transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#0F172A] dark:group-hover:text-[#F8FAFC]" />
              <span>بحث سريع أو أمر...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#475569] text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] shadow-2xs">
              Ctrl+K
            </kbd>
          </button>
        ) : (
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full h-10 flex items-center justify-center rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
            title="بحث سريع (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Navigation Groups */}
        <nav className="space-y-5">
          {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <span className="px-3 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block pb-1">
                  {group.title}
                </span>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href ||
                      (item.href !== "/admin" &&
                        pathname.startsWith(item.href) &&
                        (item.href !== "/admin/questions" || pathname === "/admin/questions"));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={`group relative w-full h-10 px-3 rounded-xl text-[13px] font-medium flex items-center transition-all ${
                        isCollapsed ? "justify-center" : "gap-3"
                      } ${
                        isActive
                          ? "bg-[#800020] text-white font-semibold shadow-xs"
                          : "text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-[#64748B] group-hover:text-[#0F172A] dark:group-hover:text-[#F8FAFC]"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate flex-1 text-right leading-tight">
                          {item.label}
                        </span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white border-white/20"
                              : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer & Utilities */}
      <div className="p-3 border-t border-[#E2E8F0] dark:border-[#334155]/80 bg-[#F8FAFC]/50 dark:bg-[#0F172A]/40 space-y-2">
        {!isCollapsed ? (
          <Link
            href="/dashboard"
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#800020]/40 text-[13px] font-semibold flex items-center justify-between transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
              <span>معاينة تطبيق الطالب</span>
            </div>
            <ExternalLink className="w-3 h-3 text-[#64748B]" />
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="w-full h-10 rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#800020] transition-colors"
            title="معاينة تطبيق الطالب"
          >
            <Compass className="w-4 h-4" />
          </Link>
        )}

        {/* User Profile Capsule */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-2xs ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#800020] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {(user.name || "أ").charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 text-right">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block truncate leading-tight">
                  {user.name || "مشرف المنصة"}
                </span>
                <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] block truncate leading-none mt-1">
                  {getRoleArabicLabel(user.role)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle className="h-7 w-7" />
            {!isCollapsed && (
              <button
                onClick={onLogout}
                disabled={isLoggingOut}
                title="تسجيل الخروج"
                className="p-1 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
