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
  Fire,
  X,
  SpinnerGap,
  Trophy,
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
      setSearchResults([]);
      return;
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100">
      {/* Desktop & Tablet Top Navbar (Vercel / Replit Style) */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
              خ
            </div>
            <div>
              <span className="font-bold text-sm text-[#0F172A] dark:text-white leading-tight block">
                الخلاصة
              </span>
              <span className="text-[10px] text-slate-400 font-mono block -mt-0.5 tracking-wider">
                EL KHOLASA
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Vercel-style clean segmented tabs) */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
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
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs border border-zinc-200/80 dark:border-zinc-700/80"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#4F46E5] dark:text-indigo-400" : "")} weight={isActive ? "fill" : "bold"} />
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
              className="h-8.5 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2 transition-all shadow-2xs"
            >
              <MagnifyingGlass className="w-3.5 h-3.5 text-zinc-400" weight="bold" />
              <span className="hidden sm:inline text-xs">ابحث...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono border border-zinc-200/60 dark:border-zinc-700/60">
                ⌘K
              </kbd>
            </button>

            {/* Daily Streak Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50 text-[#D97706] dark:text-amber-400 text-xs font-bold">
              <Fire className="w-3.5 h-3.5 text-amber-500" weight="fill" />
              <span>5 أيام</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8.5 h-8.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-2xs"
              title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" weight="bold" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-600" weight="bold" />
              )}
            </button>

            {/* User Profile Avatar */}
            <Link
              href="/profile"
              className="flex items-center gap-2 p-0.5 pl-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            >
              <div className="w-7.5 h-7.5 rounded-md bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {user?.name ? user.name[0] : "ط"}
              </div>
              <div className="hidden lg:block text-right">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block line-clamp-1 max-w-[90px]">
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
        className="md:hidden fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl sm:rounded-3xl shadow-[0_12px_36px_-6px_rgba(15,23,42,0.18)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.8)] px-1.5 py-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] flex items-center justify-around ring-1 ring-black/[0.04] dark:ring-white/[0.08]"
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
                className="flex-1 flex flex-col items-center justify-center relative -mt-5 group active:scale-95 transition-transform"
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all border-2",
                    isActive
                      ? "bg-[#4F46E5] text-white border-white dark:border-zinc-950 shadow-indigo-500/40 scale-105"
                      : "bg-[#4F46E5] text-white border-white dark:border-zinc-950 shadow-indigo-500/25 group-hover:scale-105"
                  )}
                >
                  <Icon className="w-5 h-5 text-white" weight="fill" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-black leading-tight tracking-tight text-center mt-1 truncate max-w-[64px]",
                    isActive
                      ? "text-[#4F46E5] dark:text-indigo-400 font-black"
                      : "text-zinc-600 dark:text-zinc-400 font-bold"
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
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all active:scale-95",
                isActive
                  ? "text-[#4F46E5] dark:text-indigo-400 font-bold"
                  : "text-zinc-500 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <div
                className={cn(
                  "w-8.5 h-7 rounded-lg flex items-center justify-center transition-colors relative",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50"
                    : "hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60"
                )}
              >
                <Icon
                  className="w-4.5 h-4.5"
                  weight={isActive ? "fill" : "bold"}
                />
              </div>
              <span className="text-[10px] font-bold leading-tight tracking-tight text-center truncate max-w-[60px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] dark:bg-indigo-400 -mt-0.5" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Global Search Modal (Vercel cmdk style) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 transition-opacity">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-right">
            {/* Search Input Bar */}
            <div className="relative border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4">
              <div className="text-zinc-400 shrink-0">
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
                className="w-full h-13 pr-3 pl-8 bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
                    className="w-full p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/80 flex items-center justify-between text-right transition-colors group"
                  >
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block group-hover:text-[#4F46E5] transition-colors">
                        {res.title}
                      </span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        {res.subtitle}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                      {res.type === "LESSON"
                        ? "درس"
                        : res.type === "SUBJECT"
                        ? "مادة"
                        : "سؤال"}
                    </span>
                  </button>
                ))
              ) : searchQuery.trim().length >= 2 ? (
                <div className="p-8 text-center text-xs text-zinc-500 font-medium">
                  لم يتم العثور على نتائج مطابقة لـ "{searchQuery}"
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-400">
                  ابدأ بكتابة اسم الدرس أو القانون للبحث الفوري...
                </div>
              )}
            </div>

            {/* Vercel cmdk Footer */}
            <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px]">↵</kbd>
                  <span>للاختيار</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px]">Esc</kbd>
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