"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "kholasa_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  // Helper to apply theme to document
  const applyTheme = (isDark: boolean, currentTheme: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
    setResolvedTheme(isDark ? "dark" : "light");
  };

  useEffect(() => {
    // Read saved preference from localStorage
    let saved: Theme = "system";
    try {
      saved = (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "system";
    } catch (_) {}
    setThemeState(saved);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemIsDark = mediaQuery.matches;
    const isDark = saved === "dark" || (saved === "system" && systemIsDark);

    applyTheme(isDark, saved);
    setMounted(true);

    // Listen for system changes when in 'system' mode
    const handleSystemChange = (e: MediaQueryListEvent) => {
      let currentSaved: Theme = "system";
      try {
        currentSaved = (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "system";
      } catch (_) {}
      if (currentSaved === "system") {
        applyTheme(e.matches, "system");
      }
    };

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) {
        const newTheme = (e.newValue as Theme) || "system";
        setThemeState(newTheme);
        const newIsDark =
          newTheme === "dark" || (newTheme === "system" && mediaQuery.matches);
        applyTheme(newIsDark, newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (_) {}

    const mediaQuery = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const isDark =
      newTheme === "dark" || (newTheme === "system" && !!mediaQuery?.matches);
    applyTheme(isDark, newTheme);
  };

  const toggleTheme = () => {
    // If currently resolved to dark, switch to light, else to dark
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isDark: resolvedTheme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      theme: "system" as Theme,
      resolvedTheme: "dark" as "dark" | "light",
      setTheme: () => {},
      toggleTheme: () => {},
      isDark: true,
    };
  }
  return context;
}
