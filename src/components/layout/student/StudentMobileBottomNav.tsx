"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedCount } from "@/components/ui/AnimatedCount";
import type { NavItem } from "./types";

interface StudentMobileBottomNavProps {
  items: NavItem[];
  pathname: string;
  mistakesCount?: number;
}

export function StudentMobileBottomNav({
  items,
  pathname,
  mistakesCount,
}: StudentMobileBottomNavProps) {
  // If actively solving an exam, hide bottom nav to avoid distraction
  const isSolvingExam =
    pathname.startsWith("/exams/") &&
    pathname !== "/exams/builder" &&
    !pathname.endsWith("/results");
  if (isSolvingExam) return null;

  return (
    <nav
      aria-label="شريط التنقل السفلي"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#081426]/95 backdrop-blur-xl border-t border-[#E8E9ED] dark:border-[#22364F] shadow-[0_-4px_24px_rgba(9,27,64,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)] px-2 pt-2 pb-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.35rem))]"
    >
      <div className="w-full max-w-lg mx-auto flex items-center justify-between">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/" &&
              (pathname.startsWith(item.href) ||
                (item.href === "/subjects" && pathname.startsWith("/lessons/"))));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-95 group text-center select-none"
              )}
            >
              <div
                className={cn(
                  "relative w-10 h-7.5 rounded-xl flex items-center justify-center transition-all duration-150 shrink-0",
                  isActive
                    ? "bg-[#800B34] text-white shadow-xs"
                    : item.isCenter
                    ? "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]/70 dark:bg-[#F0B843]/15 dark:text-[#F0B843] dark:border-transparent hover:bg-[#FEF3C7]"
                    : "text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#091B40] dark:group-hover:text-white"
                )}
              >
                {item.href === "/mistakes" && typeof mistakesCount === "number" && (
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`mobile-mistakes-${mistakesCount > 0 ? "active" : "zero"}`}
                      initial={{ scale: 0.65, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.65, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 24 }}
                      className={cn(
                        "absolute -top-1.5 -left-1.5 z-10 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black tabular-nums flex items-center justify-center shadow-xs border border-white dark:border-[#091B40]",
                        mistakesCount > 0
                          ? "bg-[#800B34] text-white"
                          : "bg-[#059669] text-white"
                      )}
                    >
                      <AnimatedCount value={mistakesCount} />
                    </motion.span>
                  </AnimatePresence>
                )}
                <Icon
                  className="w-4.5 h-4.5 shrink-0"
                  weight={isActive ? "fill" : "bold"}
                />
              </div>
              <span
                className={cn(
                  "text-[9.5px] sm:text-[11px] leading-[1.15] tracking-tight text-center line-clamp-2 max-w-full px-0.5 mt-0.5 block transition-colors",
                  isActive
                    ? "font-black text-[#800B34] dark:text-[#E9AD32]"
                    : "font-bold text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#091B40] dark:group-hover:text-white"
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
