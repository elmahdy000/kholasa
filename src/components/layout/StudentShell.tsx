"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  Books,
  Lightning,
  ArrowCounterClockwise,
  User as UserIcon,
  Moon,
  Sun,
  MagnifyingGlass,
  X,
  SpinnerGap,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { EntranceGatekeeperModal } from "@/components/student/EntranceGatekeeperModal";

interface StudentShellProps {
  children: React.ReactNode;
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string;
  } | null;
}

interface SearchResult {
  type: "LESSON" | "SUBJECT" | "QUESTION";
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

import { useTheme } from "@/components/theme/ThemeProvider";

export function StudentShell({ children, user }: StudentShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Unified Dark Mode State from ThemeProvider
  const { isDark, toggleTheme } = useTheme();

  // Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Keyboard shortcut Ctrl+K
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

  // Search query effect
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      const resetTimer = setTimeout(() => {
        setSearchResults([]);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navItems = [
    { label: "الرئيسية", href: "/dashboard", icon: House },
    { label: "المواد", href: "/subjects", icon: Books },
    { label: "اختبر نفسك", href: "/exams/builder", icon: Lightning },
    { label: "غلطاتي", href: "/mistakes", icon: ArrowCounterClockwise },
    { label: "حسابي", href: "/profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Desktop & Tablet Top Navbar (Vercel / Replit Style) */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#0F172A]/80  border-b border-[#E2E8F0]/80 dark:border-[#334155]/80 transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm  group- transition-transform">
              خ
            </div>
            <div>
              <span className="font-bold text-sm text-[#0F172A] dark:text-white leading-tight block">
                الخلاصة
              </span>
              <span className="text-[13px] text-[#94A3B8] font-mono block -mt-1 tracking-wider">
                EL KHOLASA
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Vercel-style clean segmented tabs) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F8FAFC]/80 dark:bg-[#1E293B]/80 p-1 rounded-xl border border-[#E2E8F0]/80 dark:border-[#334155]/80">
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
                      ? "bg-white dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC]  border border-[#E2E8F0]/80 dark:border-[#334155]"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#4F46E5] dark:text-[#6366F1]" : "")} weight={isActive ? "fill" : "bold"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2">
            {/* Quick Search Button (⌘K) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:border-[#4F46E5]/40 dark:hover:border-[#4F46E5]/60 hover:text-[#0F172A] dark:hover:text-[#F8FAFC] flex items-center gap-2 transition-all "
            >
              <MagnifyingGlass className="w-3.5 h-3.5 text-[#64748B]" weight="bold" />
              <span className="hidden sm:inline text-[13px]">ابحث...</span>
              <kbd className="hidden sm:inline-block px-2 py-1 rounded text-[13px] bg-[#F8FAFC] dark:bg-[#334155] text-[#64748B] font-mono border border-[#E2E8F0]/60 dark:border-[#334155]">
                ⌘K
              </kbd>
            </button>

            {/* Daily Streak Pill: removed until real check-in data is wired */}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-11 h-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:border-[#4F46E5]/40 dark:hover:border-[#4F46E5]/60 transition-colors "
              title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-[#D97706]" weight="bold" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#4F46E5]" weight="bold" />
              )}
            </button>

            {/* User Profile Avatar */}
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors border border-transparent hover:border-[#E2E8F0] dark:hover:border-[#4F46E5]/60"
            >
              <div className="w-7.5 h-7.5 rounded-md bg-[#4F46E5] text-white flex items-center justify-center font-bold text-[13px] ">
                {user?.name ? user.name[0] : "ط"}
              </div>
              <div className="hidden lg:block text-right">
                <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block line-clamp-1 max-w-[90px]">
                  {user?.name || "طالب"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area - Ergonomic bottom padding */}
      <main className="flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-32 md:pb-16 w-full">
        {children}
      </main>

      {/* Mobile & Tablet Floating Dock Navigation - Distinctive, Modern & Ergonomic */}
      <nav
        aria-label="شريط التنقل السفلي"
        className="md:hidden fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] z-40 bg-white/95 dark:bg-[#0F172A]/95  border border-[#E2E8F0]/90 dark:border-[#334155]/90 rounded-xl shadow-sm px-2 py-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] flex items-center justify-around ring-1 ring-black/[0.04] dark:ring-white/[0.08]"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isCenter = item.href === "/exams/builder";

          if (isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center relative -mt-5 group active:opacity-80 transition-transform"
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-all border-2",
                    isActive
                      ? "bg-[#4F46E5] text-white border-white dark:border-[#0F172A] shadow-sm "
                      : "bg-[#4F46E5] text-white border-white dark:border-[#0F172A] shadow-sm group-"
                  )}
                >
                  <Icon className="w-5 h-5 text-white" weight="fill" />
                </div>
                <span
                  className={cn(
                    "text-[13px] font-bold leading-tight tracking-tight text-center mt-1 truncate max-w-[64px]",
                    isActive
                      ? "text-[#4F46E5] dark:text-[#6366F1] font-bold"
                      : "text-[#64748B] dark:text-[#94A3B8] font-bold"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all active:opacity-80",
                isActive
                  ? "text-[#4F46E5] dark:text-[#6366F1] font-bold"
                  : "text-[#64748B] dark:text-[#94A3B8] font-medium hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
              )}
            >
              <div
                className={cn(
                  "w-8.5 h-7 rounded-lg flex items-center justify-center transition-colors relative",
                  isActive
                    ? "bg-[#4F46E5]/10 dark:bg-[#1E293B] text-[#4F46E5] dark:text-[#6366F1] border border-[#E2E8F0]/50 dark:border-[#6366F1]/50"
                    : "hover:bg-[#F8FAFC]/70 dark:hover:bg-[#334155]/60"
                )}
              >
                <Icon
                  className="w-4.5 h-4.5"
                  weight={isActive ? "fill" : "bold"}
                />
              </div>
              <span className="text-[13px] font-bold leading-tight tracking-tight text-center truncate max-w-[60px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] dark:bg-[#6366F1] -mt-1" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Global Search Modal (Vercel cmdk style) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60  flex items-start justify-center p-4 pt-16 sm:pt-24 transition-opacity">
          <div className="w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-sm overflow-hidden text-right">
            {/* Search Input Bar */}
            <div className="relative border-b border-[#E2E8F0] dark:border-[#334155] flex items-center px-4">
              <div className="text-[#64748B] shrink-0">
                {isSearching ? (
                  <SpinnerGap className="w-4 h-4 animate-spin text-[#4F46E5]" weight="bold" />
                ) : (
                  <MagnifyingGlass className="w-4 h-4" weight="bold" />
                )}
              </div>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الدروس، المفاهيم، القوانين، والمواد..."
                className="w-full h-13 pr-3 pl-8 bg-transparent text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((res) => (
                  <button
                    key={`${res.type}-${res.id}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push(res.url);
                    }}
                    className="w-full p-3 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/80 flex items-center justify-between text-right transition-colors group"
                  >
                    <div>
                      <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block group-hover:text-[#4F46E5] transition-colors">
                        {res.title}
                      </span>
                      <span className="text-[13px] text-[#64748B] block mt-1">
                        {res.subtitle}
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded text-[13px] font-mono font-bold bg-[#F8FAFC] dark:bg-[#334155] text-[#64748B] dark:text-[#F8FAFC] border border-[#E2E8F0]/60 dark:border-[#334155]">
                      {res.type === "LESSON"
                        ? "درس"
                        : res.type === "SUBJECT"
                        ? "مادة"
                        : "سؤال"}
                    </span>
                  </button>
                ))
              ) : searchQuery.trim().length >= 2 ? (
                <div className="p-8 text-center text-[13px] text-[#64748B] font-medium">
                  لم يتم العثور على نتائج مطابقة لـ "{searchQuery}"
                </div>
              ) : (
                <div className="p-6 text-center text-[13px] text-[#64748B]">
                  ابدأ بكتابة اسم الدرس أو القانون للبحث الفوري...
                </div>
              )}
            </div>

            {/* Vercel cmdk Footer */}
            <div className="px-4 py-2 border-t border-[#E2E8F0] dark:border-[#334155]/80 bg-[#F8FAFC]/70 dark:bg-[#1E293B]/60 flex items-center justify-between text-[13px] text-[#64748B] font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-[13px]">↵</kbd>
                  <span>للاختيار</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-[13px]">Esc</kbd>
                  <span>للإغلاق</span>
                </span>
              </div>
              <span>الخلاصة للبحث السريع</span>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Entrance Gatekeeper Exam for Students */}
      <EntranceGatekeeperModal userRole={user?.role} userId={user?.id} />
    </div>
  );
}