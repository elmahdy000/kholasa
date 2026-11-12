"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  BookOpen,
  Books,
  Crown,
  House,
  MagnifyingGlass,
  ShieldCheck,
  SpinnerGap,
  Target,
  User as UserIcon,
  X,
} from "@phosphor-icons/react";
import { isStaffRoleValue } from "@/lib/roles";
import type { SearchResult } from "./types";

interface StudentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string | null;
  mistakesCount?: number;
}

export interface QuickLinkEntry {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  badge?: string;
}

export function getStudentQuickLinks(
  userRole?: string | null,
  mistakesCount?: number
): QuickLinkEntry[] {
  const links: QuickLinkEntry[] = [
    {
      id: "dashboard",
      label: "لوحة الطالب الرئيسية",
      subtitle: "خطة اليوم ومتابعة مستواك",
      href: "/dashboard",
    },
    {
      id: "subjects",
      label: "المواد الدراسية",
      subtitle: "تصفح المقررات والوحدات والدروس",
      href: "/subjects",
    },
    {
      id: "exam-builder",
      label: "تجهيز امتحان مخصص",
      subtitle: "اختبر نفسك في وحدات أو دروس محددة",
      href: "/exams/builder",
    },
    {
      id: "exams",
      label: "الامتحانات وسجل النتائج",
      subtitle: "الاختبارات الجاهزة ونتائجك السابقة",
      href: "/exams",
    },
    {
      id: "mistakes",
      label: "مراجعة لأخطائي",
      subtitle: "بنك الأسئلة التي تحتاج تثبيت",
      href: "/mistakes",
      badge: typeof mistakesCount === "number" && mistakesCount > 0 ? String(mistakesCount) : undefined,
    },
    {
      id: "profile",
      label: "حسابي وبياناتي",
      subtitle: "الصف والمسار وإعدادات الحساب",
      href: "/profile",
    },
    {
      id: "subscription",
      label: "الاشتراك والتفعيل",
      subtitle: "تفعيل الاشتراك الشهري ورفع الإيصال",
      href: "/subscription",
    },
  ];

  if (isStaffRoleValue(userRole)) {
    links.push({
      id: "admin",
      label: "لوحة تحكم الإدارة",
      subtitle: "إدارة المناهج والطلاب والاشتراكات",
      href: "/admin",
    });
  }

  return links;
}

function QuickLinkIcon({ id }: { id: string }) {
  switch (id) {
    case "dashboard":
      return <House className="w-4 h-4" weight="bold" />;
    case "subjects":
      return <Books className="w-4 h-4" weight="bold" />;
    case "exam-builder":
    case "exams":
      return <Target className="w-4 h-4" weight="bold" />;
    case "mistakes":
      return <ArrowCounterClockwise className="w-4 h-4" weight="bold" />;
    case "profile":
      return <UserIcon className="w-4 h-4" weight="bold" />;
    case "subscription":
      return <Crown className="w-4 h-4" weight="bold" />;
    case "admin":
      return <ShieldCheck className="w-4 h-4" weight="bold" />;
    default:
      return <BookOpen className="w-4 h-4" weight="bold" />;
  }
}

export function StudentSearchModal({
  isOpen,
  onClose,
  userRole,
  mistakesCount,
}: StudentSearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const quickLinks = useMemo(
    () => getStudentQuickLinks(userRole, mistakesCount),
    [userRole, mistakesCount]
  );

  const isTypingQuery = searchQuery.trim().length >= 2;

  // Fetch scoped quick suggestions when modal opens with empty/short query
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch("/api/search")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Search query debounce effect
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (searchQuery.trim().length < 2) {
      const resetTimer = setTimeout(() => {
        setSearchResults([]);
        setActiveIndex(0);
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
          setActiveIndex(0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  const navigableUrls = useMemo(() => {
    if (isTypingQuery) {
      return searchResults.map((r) => r.url);
    }
    return [
      ...quickLinks.map((q) => q.href),
      ...suggestions.map((s) => s.url),
    ];
  }, [isTypingQuery, searchResults, quickLinks, suggestions]);

  const navigateTo = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (navigableUrls.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % navigableUrls.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + navigableUrls.length) % navigableUrls.length);
    } else if (e.key === "Enter") {
      const targetUrl = navigableUrls[activeIndex];
      if (targetUrl) {
        e.preventDefault();
        navigateTo(targetUrl);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="البحث والوصول السريع في المنصة"
      dir="rtl"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-start justify-center p-3 sm:p-4 pt-12 sm:pt-20 transition-opacity"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#10233A] rounded-2xl border border-[#DFE6F0] dark:border-[#22364F] shadow-2xl overflow-hidden text-right"
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-[#DFE6F0] dark:border-[#22364F] flex items-center px-4 gap-2">
          <div className="text-[#64748B] dark:text-[#94A3B8] shrink-0">
            {isSearching ? (
              <SpinnerGap className="w-4 h-4 animate-spin text-[#830D3C] dark:text-[#FB7185]" weight="bold" />
            ) : (
              <MagnifyingGlass className="w-4 h-4" weight="bold" />
            )}
          </div>
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ابحث في الدروس، المفاهيم، القوانين، والمواد..."
            className="w-full h-13 px-1 bg-transparent text-sm font-medium text-[#0B1D42] dark:text-[#F5F7FB] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="مسح البحث"
              className="px-2 py-1 rounded-md text-xs font-bold text-[#64748B] hover:text-[#0B1D42] dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
            >
              مسح
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق البحث السريع"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0B1D42] dark:text-[#94A3B8] dark:hover:text-[#F5F7FB] hover:bg-[#F5F7FB] dark:hover:bg-[#132945] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" weight="bold" />
          </button>
        </div>

        {/* Results OR Quick Links + Scoped Suggestions */}
        <div className="max-h-[min(65vh,460px)] overflow-y-auto p-3 space-y-4">
          {isTypingQuery ? (
            searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((res, idx) => {
                  const isHighlighted = idx === activeIndex;
                  return (
                    <button
                      key={`${res.type}-${res.id}`}
                      type="button"
                      onClick={() => navigateTo(res.url)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full min-h-[44px] p-3 rounded-xl flex items-center justify-between gap-3 text-right transition-colors group cursor-pointer ${
                        isHighlighted
                          ? "bg-[#FDF2F4] dark:bg-[#142747] ring-1 ring-[#830D3C]/25"
                          : "hover:bg-[#F5F7FB] dark:hover:bg-[#132945]"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-[13px] font-bold text-[#0B1D42] dark:text-[#F5F7FB] block group-hover:text-[#830D3C] dark:group-hover:text-[#FDA4AF] transition-colors leading-snug break-words">
                          {res.title}
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-[#94A3B8] block mt-0.5 leading-snug break-words">
                          {res.subtitle}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-[#132945] text-[#64748B] dark:text-[#F5F7FB] border border-[#DFE6F0] dark:border-[#22364F] shrink-0">
                        {res.type === "LESSON"
                          ? "درس"
                          : res.type === "SUBJECT"
                          ? "مادة"
                          : "سؤال"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                {isSearching
                  ? "جاري البحث في منهجك..."
                  : `لم يتم العثور على نتائج مطابقة لـ "${searchQuery}"`}
              </div>
            )
          ) : (
            <>
              {/* Quick Platform Links */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold text-[#0B1D42] dark:text-white">
                    الروابط السريعة في المنصة
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    انتقال مباشر بنقرة واحدة
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickLinks.map((linkItem, idx) => {
                    const isHighlighted = idx === activeIndex;
                    return (
                      <button
                        key={linkItem.id}
                        type="button"
                        onClick={() => navigateTo(linkItem.href)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`min-h-[48px] p-2.5 rounded-xl border text-right flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                          isHighlighted
                            ? "bg-[#FDF2F4] dark:bg-[#142747] border-[#830D3C]/40"
                            : "bg-[#F5F7FB]/70 dark:bg-[#0D1B2E] border-[#DFE6F0] dark:border-[#22364F] hover:border-[#830D3C]/40 hover:bg-white dark:hover:bg-[#132945]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#132945] border border-[#DFE6F0] dark:border-[#22364F] text-[#830D3C] dark:text-[#FDA4AF] flex items-center justify-center shrink-0">
                            <QuickLinkIcon id={linkItem.id} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-extrabold text-[#0B1D42] dark:text-white block leading-snug truncate">
                              {linkItem.label}
                            </span>
                            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block leading-snug truncate">
                              {linkItem.subtitle}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {linkItem.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums bg-[#830D3C] text-white">
                              {linkItem.badge}
                            </span>
                          )}
                          <ArrowLeft className="w-3.5 h-3.5 text-[#64748B]" weight="bold" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scoped Real DB Subjects & Lessons */}
              {suggestions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#DFE6F0] dark:border-[#22364F]">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-extrabold text-[#0B1D42] dark:text-white">
                      موادك ودروسك في المنهج
                    </span>
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      أو اكتب أي كلمة للبحث
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {suggestions.map((sug, idx) => {
                      const combinedIdx = quickLinks.length + idx;
                      const isHighlighted = combinedIdx === activeIndex;
                      return (
                        <button
                          key={`${sug.type}-${sug.id}`}
                          type="button"
                          onClick={() => navigateTo(sug.url)}
                          onMouseEnter={() => setActiveIndex(combinedIdx)}
                          className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-right flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                            isHighlighted
                              ? "bg-[#FDF2F4] dark:bg-[#142747] border-[#830D3C]/40"
                              : "bg-white dark:bg-[#0D1B2E] border-[#DFE6F0] dark:border-[#22364F] hover:border-[#830D3C]/40"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#0B1D42] dark:text-white block leading-snug break-words">
                              {sug.title}
                            </span>
                            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block leading-snug truncate">
                              {sug.subtitle}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F7FB] dark:bg-[#132945] text-[#64748B] dark:text-[#CBD5E1] border border-[#DFE6F0] dark:border-[#22364F] shrink-0">
                            {sug.type === "SUBJECT" ? "مادة" : "درس"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Keyboard Footer */}
        <div className="px-4 py-2 border-t border-[#DFE6F0] dark:border-[#22364F] bg-[#F5F7FB]/80 dark:bg-[#0D1B2E] flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#132945] border border-[#DFE6F0] dark:border-[#22364F] text-[11px]">
                ↵
              </kbd>
              <span>للاختيار</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#132945] border border-[#DFE6F0] dark:border-[#22364F] text-[11px]">
                Esc
              </kbd>
              <span>للإغلاق</span>
            </span>
          </div>
          <span className="text-[#830D3C] dark:text-[#FDA4AF] font-bold">الخلاصة للبحث السريع</span>
        </div>
      </div>
    </div>
  );
}
