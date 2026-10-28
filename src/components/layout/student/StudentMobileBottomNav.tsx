"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavItem } from "./types";

interface StudentMobileBottomNavProps {
  items: NavItem[];
  pathname: string;
}

export function StudentMobileBottomNav({ items, pathname }: StudentMobileBottomNavProps) {
  // If actively solving an exam, hide bottom nav to avoid distraction
  const isSolvingExam =
    pathname.startsWith("/exams/") &&
    pathname !== "/exams/builder" &&
    !pathname.endsWith("/results");
  if (isSolvingExam) return null;

  return (
    <nav
      aria-label="شريط التنقل السفلي"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#081426]/95 backdrop-blur-xl border-t border-[#E8E9ED] dark:border-[#22364F] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="w-full max-w-lg mx-auto flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 group text-center"
              )}
            >
              <div
                className={cn(
                  "w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-150",
                  isActive
                    ? "bg-[#800020] dark:bg-[#A30D36] text-white shadow-xs"
                    : item.isCenter
                    ? "bg-[#D97706]/10 text-[#D97706] dark:text-[#FBBF24] hover:bg-[#D97706]/20"
                    : "text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#12263F] dark:group-hover:text-[#F5F7FB] group-hover:bg-[#F7F8FA] dark:group-hover:bg-[#10233A]"
                )}
              >
                <Icon
                  className="w-4.5 h-4.5"
                  weight={isActive ? "fill" : "bold"}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-[11px] leading-tight tracking-tight text-center truncate w-full mt-1 transition-colors",
                  isActive
                    ? "font-extrabold text-[#800020] dark:text-[#FB7185]"
                    : "font-bold text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#12263F] dark:group-hover:text-[#F5F7FB]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
