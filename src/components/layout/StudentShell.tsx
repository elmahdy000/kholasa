"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  Books,
  Target,
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
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

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

  // When browsing as a guest / visitor (e.g. from landing page to /subjects)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#081426] text-[#12263F] dark:text-[#F5F7FB]">
        <SiteHeader />
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const navItems = [
    { label: "الرئيسية", href: "/dashboard", icon: House },
    { label: "المواد", href: "/subjects", icon: Books },
    { label: "اختبر نفسك", href: "/exams/builder", icon: Target },
    { label: "غلطاتي", href: "/mistakes", icon: ArrowCounterClockwise },
    { label: "حسابي", href: "/profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#081426] text-[#1A0A10] dark:text-[#F5F7FB]">
      {/* Desktop & Tablet Top Navbar (Vercel / Replit Style) */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#081426]/95 backdrop-blur-md border-b border-[#E8E9ED] dark:border-[#22364F] transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-[#800020] dark:bg-[#A30D36] text-white flex items-center justify-center font-bold text-base group-hover:bg-[#66001A] dark:group-hover:bg-[#BD123F] transition-colors shadow-xs">
              خ
            </div>
            <div>
              <span className="font-bold text-sm text-[#12263F] dark:text-[#F5F7FB] leading-tight block">
                الخلاصة
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono block -mt-1 tracking-wider">
                EL KHOLASA
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Vercel-style clean segmented tabs) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F7F8FA] dark:bg-[#0D1B2E] p-1 rounded-xl border border-[#E8E9ED] dark:border-[#22364F]">
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
                      ? "bg-white dark:bg-[#10233A] text-[#800020] dark:text-[#F5F7FB] border border-[#E8E9ED] dark:border-[#2D4563] shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F5F7FB]"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#800020] dark:text-[#A30D36]" : "")} weight={isActive ? "fill" : "bold"} />
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
              className="h-10 px-3 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A] text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:border-[#800020]/40 dark:hover:border-[#A30D36]/60 hover:text-[#12263F] dark:hover:text-[#F5F7FB] flex items-center gap-2 transition-all cursor-pointer"
            >
              <MagnifyingGlass className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" weight="bold" />
              <span className="hidden sm:inline text-xs">ابحث...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[11px] bg-[#F7F8FA] dark:bg-[#132945] text-[#64748B] dark:text-[#94A3B8] font-mono border border-[#E8E9ED] dark:border-[#22364F]">
                ⌘K
              </kbd>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg border border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F5F7FB] hover:border-[#800020]/40 dark:hover:border-[#A30D36]/60 transition-colors cursor-pointer"
              title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#E59A18]" weight="bold" />
              ) : (
                <Moon className="w-4 h-4 text-[#800020]" weight="bold" />
              )}
            </button>

            {/* User Profile Avatar */}
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#132945] transition-colors border border-transparent hover:border-[#E8E9ED] dark:hover:border-[#22364F]"
            >
              <div className="w-8 h-8 rounded-lg bg-[#800020] dark:bg-[#A30D36] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name ? user.name[0] : "ط"}
              </div>
              <div className="hidden lg:block text-right">
                <span className="text-xs font-bold text-[#12263F] dark:text-[#F5F7FB] block line-clamp-1 max-w-[90px]">
                  {user?.name || "طالب"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-32 md:pb-16 w-full">
        {children}
      </main>

      {/* Student Shell Footer */}
      <footer className="mt-auto border-t border-[#E8E9ED] dark:border-[#22364F] bg-[#F7F8FA] dark:bg-[#0D1B2E] py-8 text-right text-xs text-[#64748B] dark:text-[#94A3B8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#800020] dark:bg-[#A30D36] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              خ
            </div>
            <div className="text-right">
              <span className="font-bold text-sm text-[#12263F] dark:text-[#F5F7FB] block leading-tight">
                الخلاصة | EL KHOLASA
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block">
                افهمها صح.. هتفضل معاك
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 font-medium">
            <Link href="/dashboard" className="hover:text-[#800020] dark:hover:text-[#A30D36] transition-colors">
              الرئيسية
            </Link>
            <Link href="/subjects" className="hover:text-[#800020] dark:hover:text-[#A30D36] transition-colors">
              المواد الدراسية
            </Link>
            <Link href="/exams/builder" className="hover:text-[#800020] dark:hover:text-[#A30D36] transition-colors">
              بنك الأسئلة
            </Link>
            <Link href="/mistakes" className="hover:text-[#800020] dark:hover:text-[#A30D36] transition-colors">
              ركن غلطاتي
            </Link>
            <Link href="/profile" className="hover:text-[#800020] dark:hover:text-[#A30D36] transition-colors">
              حسابي
            </Link>
          </div>

          <p className="text-[11px]">
            © {new Date().getFullYear()} الخلاصة — جميع الحقوق محفوظة لطلابنا
          </p>
        </div>
      </footer>

      {/* Mobile & Tablet Floating Dock Navigation - Distinctive, Modern & Ergonomic */}
      <nav
        aria-label="شريط التنقل السفلي"
        className="md:hidden fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] z-40 bg-white/95 dark:bg-[#0D1B2E]/95 border border-[#F0E6E8] dark:border-[#22364F] rounded-xl shadow-md px-2 py-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] flex items-center justify-around ring-1 ring-black/[0.04] dark:ring-white/[0.05]"
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
                      ? "bg-[#800020] dark:bg-[#A30D36] text-white border-white dark:border-[#081426] shadow-md ring-2 ring-[#800020]/20 dark:ring-[#A30D36]/30"
                      : "bg-[#800020] dark:bg-[#A30D36] text-white border-white dark:border-[#081426] shadow-sm hover:bg-[#66001A] dark:hover:bg-[#BD123F]"
                  )}
                >
                  <Icon className="w-5 h-5 text-white" weight="fill" />
                </div>
                <span
                  className={cn(
                    "text-[11px] sm:text-xs font-bold leading-tight tracking-tight text-center mt-1 whitespace-nowrap",
                    isActive
                      ? "text-[#800020] dark:text-[#A30D36] font-bold"
                      : "text-[#735C63] dark:text-[#94A3B8] font-bold"
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
                  ? "text-[#800020] dark:text-[#A30D36] font-bold"
                  : "text-[#735C63] dark:text-[#94A3B8] font-medium hover:text-[#1A0A10] dark:hover:text-[#F5F7FB]"
              )}
            >
              <div
                className={cn(
                  "w-8.5 h-7 rounded-lg flex items-center justify-center transition-colors relative",
                  isActive
                    ? "bg-[#800020]/10 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] border border-[#800020]/20 dark:border-[#A30D36]/60"
                    : "hover:bg-[#FAF7F8] dark:hover:bg-[#132945]"
                )}
              >
                <Icon
                  className="w-4.5 h-4.5"
                  weight={isActive ? "fill" : "bold"}
                />
              </div>
              <span className="text-[11px] sm:text-xs font-bold leading-tight tracking-tight text-center whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#800020] dark:bg-[#A30D36] -mt-1" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Global Search Modal (Vercel cmdk style) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 pt-16 sm:pt-24 transition-opacity">
          <div className="w-full max-w-xl bg-white dark:bg-[#10233A] rounded-xl border border-[#F0E6E8] dark:border-[#22364F] shadow-lg overflow-hidden text-right">
            {/* Search Input Bar */}
            <div className="relative border-b border-[#F0E6E8] dark:border-[#22364F] flex items-center px-4">
              <div className="text-[#735C63] dark:text-[#94A3B8] shrink-0">
                {isSearching ? (
                  <SpinnerGap className="w-4 h-4 animate-spin text-[#800020] dark:text-[#A30D36]" weight="bold" />
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
                className="w-full h-13 pr-3 pl-8 bg-transparent text-sm font-medium text-[#1A0A10] dark:text-[#F5F7FB] placeholder:text-[#735C63] dark:placeholder:text-[#94A3B8] focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-[#735C63] hover:text-[#1A0A10] dark:text-[#94A3B8] dark:hover:text-[#F5F7FB] hover:bg-[#FAF7F8] dark:hover:bg-[#132945] transition-colors cursor-pointer"
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
                    className="w-full p-3 rounded-xl hover:bg-[#FAF7F8] dark:hover:bg-[#132945] flex items-center justify-between text-right transition-colors group cursor-pointer"
                  >
                    <div>
                      <span className="text-[13px] font-bold text-[#1A0A10] dark:text-[#F5F7FB] block group-hover:text-[#800020] dark:group-hover:text-[#A30D36] transition-colors">
                        {res.title}
                      </span>
                      <span className="text-[13px] text-[#735C63] dark:text-[#94A3B8] block mt-1">
                        {res.subtitle}
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded text-[13px] font-mono font-bold bg-[#FAF7F8] dark:bg-[#132945] text-[#735C63] dark:text-[#F5F7FB] border border-[#F0E6E8] dark:border-[#22364F]">
                      {res.type === "LESSON"
                        ? "درس"
                        : res.type === "SUBJECT"
                        ? "مادة"
                        : "سؤال"}
                    </span>
                  </button>
                ))
              ) : searchQuery.trim().length >= 2 ? (
                <div className="p-8 text-center text-[13px] text-[#735C63] dark:text-[#94A3B8] font-medium">
                  لم يتم العثور على نتائج مطابقة لـ "{searchQuery}"
                </div>
              ) : (
                <div className="p-6 text-center text-[13px] text-[#735C63] dark:text-[#94A3B8]">
                  ابدأ بكتابة اسم الدرس أو القانون للبحث الفوري...
                </div>
              )}
            </div>

            {/* Vercel cmdk Footer */}
            <div className="px-4 py-2 border-t border-[#F0E6E8] dark:border-[#22364F] bg-[#FAF7F8]/80 dark:bg-[#0D1B2E] flex items-center justify-between text-[13px] text-[#735C63] dark:text-[#94A3B8] font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-[#132945] border border-[#F0E6E8] dark:border-[#22364F] text-[13px]">↵</kbd>
                  <span>للاختيار</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-[#132945] border border-[#F0E6E8] dark:border-[#22364F] text-[13px]">Esc</kbd>
                  <span>للإغلاق</span>
                </span>
              </div>
              <span className="text-[#800020] dark:text-[#A30D36] font-bold">الخلاصة للبحث السريع</span>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Entrance Gatekeeper Exam for Students */}
      <EntranceGatekeeperModal userRole={user?.role} userId={user?.id} />
    </div>
  );
}