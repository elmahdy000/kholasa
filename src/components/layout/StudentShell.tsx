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

interface StudentShellProps {
  children: React.ReactNode;
  user?: {
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

export function StudentShell({ children, user }: StudentShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Dark Mode State
  const [isDark, setIsDark] = useState(false);

  // Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Check saved theme
  useEffect(() => {
    const saved = localStorage.getItem("kholasa_theme");
    if (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("kholasa_theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("kholasa_theme", "dark");
      setIsDark(true);
    }
  };

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
    { label: "المتصدرون", href: "/leaderboard", icon: Trophy },
    { label: "حسابي", href: "/profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Desktop & Tablet Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-bold text-base">
              خ
            </div>
            <div>
              <span className="font-bold text-base text-[#0F172A] dark:text-white leading-tight block">
                الخلاصة
              </span>
              <span className="text-[10px] text-[#4F46E5] font-medium block -mt-0.5">
                EL KHOLASA
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
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
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#4F46E5] text-white"
                      : "text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="w-4 h-4" weight={isActive ? "fill" : "regular"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="h-10 px-3 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-xs font-medium text-[#64748B] dark:text-slate-400 hover:border-[#4F46E5] flex items-center gap-2 transition-colors"
            >
              <MagnifyingGlass className="w-4 h-4 text-[#4F46E5]" weight="bold" />
              <span className="hidden sm:inline">ابحث...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#E2E8F0] dark:bg-slate-800 text-[#64748B] font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Daily Streak Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] text-xs font-bold">
              <Fire className="w-4 h-4" weight="fill" />
              <span>5 أيام</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-lg border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
              title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#D97706]" weight="bold" />
              ) : (
                <Moon className="w-4 h-4" weight="bold" />
              )}
            </button>

            {/* User Avatar */}
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1 pl-3 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-[#E2E8F0] dark:hover:border-slate-700"
            >
              <div className="w-8 h-8 rounded-lg bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name[0] : "ط"}
              </div>
              <div className="hidden lg:block text-right">
                <span className="text-xs font-bold text-[#0F172A] dark:text-white block line-clamp-1 max-w-[100px]">
                  {user?.name || "طالب متميز"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-12 w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#0F172A] border-t border-[#E2E8F0] dark:border-slate-800 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors",
                isActive
                  ? "text-[#4F46E5] font-bold"
                  : "text-[#64748B] dark:text-slate-400 font-medium hover:text-[#0F172A]"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  isActive ? "bg-[#4F46E5]/10" : ""
                )}
              >
                <Icon className="w-5 h-5" weight={isActive ? "fill" : "regular"} />
              </div>
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-16 sm:pt-24">
          <div className="w-full max-w-xl bg-white dark:bg-[#1E293B] rounded-xl p-4 border border-[#E2E8F0] dark:border-slate-700 space-y-4 text-right">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الدروس، المفاهيم، المواد..."
                className="w-full h-12 pr-11 pl-11 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 text-sm font-medium text-[#0F172A] dark:text-white placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4F46E5]">
                {isSearching ? (
                  <SpinnerGap className="w-4 h-4 animate-spin" weight="bold" />
                ) : (
                  <MagnifyingGlass className="w-4 h-4" weight="bold" />
                )}
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((res) => (
                  <button
                    key={`${res.type}-${res.id}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push(res.url);
                    }}
                    className="w-full p-3 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800 flex items-center justify-between text-right transition-colors"
                  >
                    <div>
                      <span className="text-sm font-bold text-[#0F172A] dark:text-white block">
                        {res.title}
                      </span>
                      <span className="text-xs text-[#64748B] block mt-0.5">
                        {res.subtitle}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4F46E5]/10 text-[#4F46E5]">
                      {res.type === "LESSON"
                        ? "درس"
                        : res.type === "SUBJECT"
                        ? "مادة"
                        : "سؤال"}
                    </span>
                  </button>
                ))
              ) : searchQuery.trim().length >= 2 ? (
                <div className="p-8 text-center text-sm text-[#64748B]">
                  لم نجد نتائج مطابقة لـ "{searchQuery}"
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-[#64748B]">
                  اكتب كلمتين على الأقل لبدء البحث
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}