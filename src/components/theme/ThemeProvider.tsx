"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

  // Helper to apply theme to document
  const applyTheme = (isDark: boolean, _currentTheme?: Theme) => {
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
  };

  useEffect(() => {
    // Read saved preference from localStorage
    let saved: Theme = "system";
    try {
      saved = (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "system";
    } catch {}

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemIsDark = mediaQuery.matches;
    const isDark = saved === "dark" || (saved === "system" && systemIsDark);

    applyTheme(isDark, saved);

    const timer = setTimeout(() => {
      setThemeState(saved);
      setResolvedTheme(isDark ? "dark" : "light");
    }, 0);

    // Listen for system changes when in 'system' mode
    const handleSystemChange = (e: MediaQueryListEvent) => {
      let currentSaved: Theme = "system";
      try {
        currentSaved = (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "system";
      } catch {}
      if (currentSaved === "system") {
        applyTheme(e.matches, "system");
        setResolvedTheme(e.matches ? "dark" : "light");
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
        setResolvedTheme(newIsDark ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener("change", handleSystemChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {}

    const mediaQuery = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const isDark =
      newTheme === "dark" || (newTheme === "system" && !!mediaQuery?.matches);
    applyTheme(isDark, newTheme);
    setResolvedTheme(isDark ? "dark" : "light");
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
