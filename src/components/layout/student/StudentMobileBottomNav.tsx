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

function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/" || href === "/dashboard") return false;
  if (href === "/subjects" && (pathname.startsWith("/subjects/") || pathname.startsWith("/lessons/"))) {
    return true;
  }
  return pathname.startsWith(`${href}/`) || pathname === href;
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
      dir="rtl"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#081426]/95 backdrop-blur-xl border-t border-[#DFE6F0] dark:border-[#22364F] shadow-[0_-4px_20px_rgba(11,29,66,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.5)] px-2 pt-1.5 pb-[max(0.5rem,calc(env(safe-area-inset-bottom)+0.25rem))]"
    >
      <div className="w-full max-w-lg mx-auto grid grid-flow-col auto-cols-fr items-center gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "min-h-[48px] min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 group text-center select-none focus-visible:outline-2 focus-visible:outline-[#830D3C]"
              )}
            >
              <div
                className={cn(
                  "relative px-3.5 h-7 rounded-full flex items-center justify-center transition-all duration-150 shrink-0",
                  isActive
                    ? "bg-[#830D3C] text-white shadow-xs"
                    : "text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0B1D42] dark:group-hover:text-white"
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
                          ? "bg-[#830D3C] text-white"
                          : "bg-[#15803D] text-white"
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
                  "text-[11px] leading-tight tracking-tight text-center whitespace-nowrap max-w-full mt-1 block transition-colors",
                  isActive
                    ? "font-extrabold text-[#830D3C] dark:text-[#FDA4AF]"
                    : "font-semibold text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0B1D42] dark:group-hover:text-white"
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
