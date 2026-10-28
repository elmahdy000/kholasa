"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { EntranceGatekeeperModal } from "@/components/student/EntranceGatekeeperModal";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import type { StudentShellProps } from "./student/types";
import { GUEST_NAV_ITEMS, STUDENT_NAV_ITEMS } from "./student/navigation";
import { StudentMobileBottomNav } from "./student/StudentMobileBottomNav";
import { StudentHeader } from "./student/StudentHeader";
import { StudentFooter } from "./student/StudentFooter";
import { StudentSearchModal } from "./student/StudentSearchModal";

export function StudentShell({ children, user }: StudentShellProps) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // When browsing as a guest / visitor
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#081426] text-[#12263F] dark:text-[#F5F7FB]">
        <SiteHeader />
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28 md:pb-12">
          {children}
        </main>
        <SiteFooter />
        <StudentMobileBottomNav items={GUEST_NAV_ITEMS} pathname={pathname} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#081426] text-[#12263F] dark:text-[#F5F7FB]">
      {/* Desktop & Tablet Top Navbar */}
      <StudentHeader
        navItems={STUDENT_NAV_ITEMS}
        pathname={pathname}
        user={user}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-28 md:pb-12 w-full">
        {children}
      </main>

      {/* Student Shell Footer */}
      <StudentFooter />

      {/* Mobile Floating Dock Navigation */}
      <StudentMobileBottomNav items={STUDENT_NAV_ITEMS} pathname={pathname} />

      {/* Global Search Modal */}
      <StudentSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mandatory Entrance Gatekeeper Exam for Students */}
      <EntranceGatekeeperModal userRole={user?.role} userId={user?.id} />
    </div>
  );
}