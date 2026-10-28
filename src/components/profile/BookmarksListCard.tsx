"use client";

import Link from "next/link";
import { Bookmark, ArrowLeft } from "lucide-react";
import type { BookmarkItem } from "./types";

interface BookmarksListCardProps {
  bookmarks: BookmarkItem[];
}

export function BookmarksListCard({ bookmarks }: BookmarksListCardProps) {
  return (
    <div className="p-6 sm:p-7 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
      <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-[#D97706] fill-[#D97706]" />
        <span>الدروس المحفوظة في المفضلة ({bookmarks.length})</span>
      </h2>

      {bookmarks.length > 0 ? (
        <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
          {bookmarks.map((b) => {
            if (!b.lesson) return null;
            return (
              <div
                key={b.id}
                className="py-4 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white">
                    {b.lesson.title}
                  </h3>
                  <span className="text-[13px] text-[#64748B] font-medium">
                    {b.lesson.unit.subject.name} • {b.lesson.unit.title}
                  </span>
                </div>
                <Link
                  href={`/lessons/${b.lesson.id}`}
                  className="h-11 px-3 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] hover:bg-[#800020]/10 dark:hover:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold flex items-center gap-1 transition-colors interactive-tap"
                >
                  <span>فتح الدرس</span>
                  <ArrowLeft className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] py-2">
          لم تقم بحفظ أي دروس في المفضلة بعد. اضغط على علامة "حفظ" داخل أي درس للوصول إليه سريعاً من هنا.
        </p>
      )}
    </div>
  );
}
