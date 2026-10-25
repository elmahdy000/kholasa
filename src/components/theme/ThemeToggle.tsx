"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Laptop } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ThemeToggleProps {
  className?: string;
  variant?: "button" | "dropdown";
}

export function ThemeToggle({ className = "", variant = "button" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  if (variant === "dropdown") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]/90 hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-medium flex items-center gap-2 transition-colors cursor-pointer "
          title="تغيير المظهر (داكن / فاتح / تلقائي)"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="w-3.5 h-3.5 text-[#4F46E5]" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-[#D97706]" />
          )}
          <span className="hidden sm:inline">
            {theme === "system" ? "تلقائي" : theme === "dark" ? "داكن" : "فاتح"}
          </span>
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-36 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-sm py-1 z-50 text-right animate-in fade-in duration-100">
            <button
              onClick={() => {
                setTheme("light");
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-[13px] flex items-center gap-2 transition-colors cursor-pointer ${
                theme === "light"
                  ? "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50"
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-[#D97706]" />
              <span>فاتح (Light)</span>
            </button>

            <button
              onClick={() => {
                setTheme("dark");
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-[13px] flex items-center gap-2 transition-colors cursor-pointer ${
                theme === "dark"
                  ? "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50"
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>داكن (Dark)</span>
            </button>

            <button
              onClick={() => {
                setTheme("system");
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-[13px] flex items-center gap-2 transition-colors cursor-pointer ${
                theme === "system"
                  ? "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50"
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-[#64748B]" />
              <span>تلقائي مع النظام</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`h-11 w-11 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center transition-all cursor-pointer  group ${className}`}
      title={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      aria-label="تغيير المظهر"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#D97706]" />
      ) : (
        <Moon className="w-4 h-4 text-[#4F46E5]" />
      )}
    </button>
  );
}
