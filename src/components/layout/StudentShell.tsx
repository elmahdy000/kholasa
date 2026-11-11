"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, RotateCcw } from "lucide-react";
import { EntranceGatekeeperModal } from "@/components/student/EntranceGatekeeperModal";
import { isAnyDemoCode } from "@/lib/demo-shared";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import type { StudentShellProps, StudentShellUser } from "./student/types";
import { GUEST_NAV_ITEMS, STUDENT_NAV_ITEMS } from "./student/navigation";
import { StudentMobileBottomNav } from "./student/StudentMobileBottomNav";
import { StudentHeader } from "./student/StudentHeader";
import { StudentFooter } from "./student/StudentFooter";
import { StudentSearchModal } from "./student/StudentSearchModal";
import { RealtimeSyncBridge } from "@/lib/realtime-client";
import { useStudentMistakesSummary } from "@/hooks/useStudentMistakesSummary";

interface StudentShellContextType {
  isInsideShell: boolean;
  user?: StudentShellUser | null;
}

export const StudentShellContext = createContext<StudentShellContextType>({
  isInsideShell: false,
  user: null,
});

export function useStudentShell() {
  return useContext(StudentShellContext);
}

export function StudentShell({ children, user: propUser }: StudentShellProps) {
  const parentContext = useContext(StudentShellContext);
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const resolvedUser = propUser !== undefined ? propUser : parentContext.user;
  const isStudentViewer =
    !parentContext.isInsideShell &&
    Boolean(resolvedUser) &&
    (!resolvedUser?.role || resolvedUser.role === "STUDENT");
  const { summary: mistakesSummary } = useStudentMistakesSummary(isStudentViewer);

  // Keyboard shortcut Ctrl+K / Cmd+K and Esc
  useEffect(() => {
    if (parentContext.isInsideShell) return;
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
  }, [parentContext.isInsideShell]);

  // If already wrapped in an outer persistent StudentShell (from AppShell),
  // do not duplicate the header, main container, footer, or bottom navigation.
  if (parentContext.isInsideShell) {
    return <>{children}</>;
  }

  const user = resolvedUser;

  // When browsing as a guest / visitor
  if (!user) {
    return (
      <StudentShellContext.Provider value={{ isInsideShell: true, user: null }}>
        <div className="min-h-screen flex flex-col bg-[#F7F9FC] dark:bg-[#081426] text-[#091B40] dark:text-[#F5F7FB]">
          <SiteHeader />
          <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28 lg:pb-12">
            {children}
          </main>
          <SiteFooter />
          <StudentMobileBottomNav items={GUEST_NAV_ITEMS} pathname={pathname} />
        </div>
      </StudentShellContext.Provider>
    );
  }

  const isDemoSession = Boolean(user && isAnyDemoCode(user.loginCode));

  const handleRestartDemoSession = async () => {
    if (isResettingDemo) return;
    setIsResettingDemo(true);
    try {
      try {
        sessionStorage.removeItem("kholasa_daily_dismissed");
      } catch {}
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsResettingDemo(false);
    }
  };

  return (
    <StudentShellContext.Provider value={{ isInsideShell: true, user }}>
      <RealtimeSyncBridge />
      <div className="min-h-screen flex flex-col bg-[#F7F9FC] dark:bg-[#081426] text-[#091B40] dark:text-[#F5F7FB]">
        {/* Desktop & Tablet Top Navbar */}
        <StudentHeader
          navItems={STUDENT_NAV_ITEMS}
          pathname={pathname}
          user={user}
          onOpenSearch={() => setIsSearchOpen(true)}
          mistakesSummary={mistakesSummary}
        />

        {/* Isolated Demo Session Notice Banner */}
        {isDemoSession && (
          <div className="bg-[#EAF2FF] dark:bg-[#10233A] border-b border-[#C5DCFA] dark:border-[#22364F] px-4 py-2 text-right" dir="rtl">
            <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#091B40] dark:text-[#EAF2FF] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0" />
                <span>
                  أنت تتصفح داخل <strong className="font-black">جلسة تجريبية مستقلة خاصة بك</strong> — نتائجك وسجل «مراجعة لأخطائي» معزولان تماماً عن باقي الزوار.
                </span>
              </div>
              <button
                type="button"
                onClick={handleRestartDemoSession}
                disabled={isResettingDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-[#091B40] border border-[#C5DCFA] dark:border-[#22364F] text-[#800B34] dark:text-[#E9AD32] font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResettingDemo ? "animate-spin" : ""}`} />
                <span>{isResettingDemo ? "جارٍ إعادة الضبط..." : "تصفير الجلسة أو التبديل"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-32 lg:pb-12 w-full">
          {children}
        </main>

        {/* Student Shell Footer */}
        <StudentFooter />

        {/* Mobile Floating Dock Navigation */}
        <StudentMobileBottomNav
          items={STUDENT_NAV_ITEMS}
          pathname={pathname}
          mistakesCount={isStudentViewer ? mistakesSummary.unresolvedCount : undefined}
        />

        {/* Global Search Modal */}
        <StudentSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        {/* Mandatory Entrance Gatekeeper Exam for Students */}
        <EntranceGatekeeperModal userRole={user?.role} userId={user?.id} />
      </div>
    </StudentShellContext.Provider>
  );
}