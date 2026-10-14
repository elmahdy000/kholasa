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
          className="h-8.5 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          title="تغيير المظهر (داكن / فاتح / تلقائي)"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="hidden sm:inline">
            {theme === "system" ? "تلقائي" : theme === "dark" ? "داكن" : "فاتح"}
          </span>
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1.5 w-36 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1 z-50 text-right animate-in fade-in duration-100">
            <button
              onClick={() => {
                setTheme("light");
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                theme === "light"
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>فاتح (Light)</span>
            </button>

            <button
              onClick={() => {
                setTheme("dark");
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                theme === "dark"
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>داكن (Dark)</span>
            </button>

            <button
              onClick={() => {
                setTheme("system");
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                theme === "system"
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-zinc-400" />
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
      className={`h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-all cursor-pointer shadow-xs group ${className}`}
      title={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      aria-label="تغيير المظهر"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-200" />
      )}
    </button>
  );
}
