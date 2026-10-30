"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { rawNavigationGroups } from "./admin/navigation";
import { AdminMobileHeader } from "./admin/AdminMobileHeader";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminTopbar } from "./admin/AdminTopbar";
import { AdminCommandPalette } from "./admin/AdminCommandPalette";
import type { AdminShellProps } from "./admin/types";

export type { AdminShellProps, AdminUser } from "./admin/types";

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter groups according to user role
  const navigationGroups = rawNavigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.allowedRoles.includes(user.role)),
    }))
    .filter((group) => group.items.length > 0);

  // Flat items list for Command Palette search
  const allNavItems = navigationGroups.flatMap((g) => g.items);

  // Active page title calculation for breadcrumbs
  const getActivePageDetails = () => {
    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (item.exact ? pathname === item.href : pathname.startsWith(item.href)) {
          if (item.href === "/admin/questions" && pathname !== "/admin/questions") {
            continue;
          }
          return { title: item.label, group: group.title, icon: item.icon };
        }
      }
    }
    return { title: "لوحة التحكم", group: "الإدارة", icon: LayoutDashboard };
  };

  const activePage = getActivePageDetails();

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout failed");
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
      setLogoutError("تعذر تسجيل الخروج. حاول مرة أخرى.");
    }
  };

  // Filter commands for Command Palette
  const filteredCommands = allNavItems.filter(
    (item) =>
      item.label.includes(commandQuery) ||
      item.href.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-sans text-right antialiased selection:bg-[#334155] selection:text-white flex flex-col md:flex-row"
      dir="rtl"
    >
      {/* 1. Mobile Top Header */}
      <AdminMobileHeader
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setIsCommandOpen={setIsCommandOpen}
      />

      {/* 2. Standout Vercel-Style Admin Sidebar */}
      <AdminSidebar
        user={user}
        navigationGroups={navigationGroups}
        isCollapsed={isCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        isLoggingOut={isLoggingOut}
        setIsCollapsed={setIsCollapsed}
        setMobileMenuOpen={setMobileMenuOpen}
        setIsCommandOpen={setIsCommandOpen}
        onLogout={handleLogout}
      />

      {/* 3. Main Content Workspace & Desktop Topbar */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          activePage={activePage}
          setIsCommandOpen={setIsCommandOpen}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {logoutError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{logoutError}</p>}
          {children}
        </main>
      </div>

      {/* 4. Command Palette Modal (Cmd+K / Ctrl+K) */}
      <AdminCommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        commandQuery={commandQuery}
        setCommandQuery={setCommandQuery}
        filteredCommands={filteredCommands}
        allowedHrefs={allNavItems.map((item) => item.href)}
      />
    </div>
  );
}
