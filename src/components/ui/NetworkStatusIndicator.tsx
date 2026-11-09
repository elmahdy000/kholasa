"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function NetworkStatusIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial state check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !justReconnected) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="fixed top-3 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      {isOffline ? (
        <div className="pointer-events-auto px-4 py-2.5 rounded-2xl bg-[#091B40]/95 text-white border border-amber-500/40 shadow-xl backdrop-blur-md flex items-center gap-2.5 text-xs sm:text-sm font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>انقطع الاتصال بالإنترنت مؤقتاً.. لا تقلق، تقدمك وإجاباتك محفوظة بأمان على جهازك.</span>
        </div>
      ) : (
        <div className="pointer-events-auto px-4 py-2 rounded-2xl bg-emerald-700/95 text-white border border-emerald-400/30 shadow-lg backdrop-blur-md flex items-center gap-2 text-xs sm:text-sm font-bold">
          <Wifi className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>تمت استعادة الاتصال بالإنترنت بنجاح!</span>
        </div>
      )}
    </div>
  );
}

