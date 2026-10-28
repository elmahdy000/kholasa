"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, X, SpinnerGap } from "@phosphor-icons/react";
import type { SearchResult } from "./types";

interface StudentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentSearchModal({ isOpen, onClose }: StudentSearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search query debounce effect
  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 pt-16 sm:pt-24 transition-opacity">
      <div className="w-full max-w-xl bg-white dark:bg-[#10233A] rounded-xl border border-[#E8E9ED] dark:border-[#22364F] shadow-lg overflow-hidden text-right">
        {/* Search Input Bar */}
        <div className="relative border-b border-[#E8E9ED] dark:border-[#22364F] flex items-center px-4">
          <div className="text-[#64748B] dark:text-[#94A3B8] shrink-0">
            {isSearching ? (
              <SpinnerGap className="w-4 h-4 animate-spin text-[#800020] dark:text-[#FB7185]" weight="bold" />
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
            className="w-full h-13 pr-3 pl-8 bg-transparent text-sm font-medium text-[#12263F] dark:text-[#F5F7FB] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#64748B] hover:text-[#12263F] dark:text-[#94A3B8] dark:hover:text-[#F5F7FB] hover:bg-[#F7F8FA] dark:hover:bg-[#132945] transition-colors cursor-pointer"
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
                type="button"
                onClick={() => {
                  onClose();
                  router.push(res.url);
                }}
                className="w-full p-3 rounded-xl hover:bg-[#F7F8FA] dark:hover:bg-[#132945] flex items-center justify-between text-right transition-colors group cursor-pointer"
              >
                <div>
                  <span className="text-[13px] font-bold text-[#12263F] dark:text-[#F5F7FB] block group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors">
                    {res.title}
                  </span>
                  <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block mt-1">
                    {res.subtitle}
                  </span>
                </div>
                <span className="px-2 py-1 rounded text-[13px] font-mono font-bold bg-[#F7F8FA] dark:bg-[#132945] text-[#64748B] dark:text-[#F5F7FB] border border-[#E8E9ED] dark:border-[#22364F]">
                  {res.type === "LESSON"
                    ? "درس"
                    : res.type === "SUBJECT"
                    ? "مادة"
                    : "سؤال"}
                </span>
              </button>
            ))
          ) : searchQuery.trim().length >= 2 ? (
            <div className="p-8 text-center text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium">
              لم يتم العثور على نتائج مطابقة لـ "{searchQuery}"
            </div>
          ) : (
            <div className="p-6 text-center text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              ابدأ بكتابة اسم الدرس أو القانون للبحث الفوري...
            </div>
          )}
        </div>

        {/* Vercel cmdk Footer */}
        <div className="px-4 py-2 border-t border-[#E8E9ED] dark:border-[#22364F] bg-[#F7F8FA]/80 dark:bg-[#0D1B2E] flex items-center justify-between text-[13px] text-[#64748B] dark:text-[#94A3B8] font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-white dark:bg-[#132945] border border-[#E8E9ED] dark:border-[#22364F] text-[13px]">↵</kbd>
              <span>للاختيار</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-white dark:bg-[#132945] border border-[#E8E9ED] dark:border-[#22364F] text-[13px]">Esc</kbd>
              <span>للإغلاق</span>
            </span>
          </div>
          <span className="text-[#800020] dark:text-[#FB7185] font-bold">الخلاصة للبحث السريع</span>
        </div>
      </div>
    </div>
  );
}
