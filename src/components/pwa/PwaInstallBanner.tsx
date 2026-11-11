"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Download, X, Smartphone, Check } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallBanner() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently
    const dismissedAt = localStorage.getItem("kholasa_pwa_dismissed");
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show again for 7 days
      }
    }

    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("kholasa_pwa_dismissed", Date.now().toString());
  };

  const isFocusedStudyRoute =
    pathname?.startsWith("/mistakes") ||
    pathname?.startsWith("/lessons/") ||
    pathname?.startsWith("/exams/");
  if (!isVisible || isInstalled || isFocusedStudyRoute) return null;

  return (
    <aside
      aria-label="تثبيت تطبيق الخلاصة"
      className="fixed bottom-24 lg:bottom-5 start-4 end-4 md:start-6 md:end-auto md:w-88 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="p-4 rounded-2xl bg-white dark:bg-[#10233A] border-2 border-[#800B34]/20 dark:border-[#A30D36]/40 shadow-xl flex items-start gap-3.5 text-right font-sans">
        <BrandLogo variant="icon" size="sm" className="mt-0.5 shrink-0" />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
              تثبيت تطبيق الخلاصة
            </h4>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F5F7FB] transition-colors rounded-lg cursor-pointer"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            ثبّت التطبيق على شاشتك الرئيسية للوصول السريع ومراجعة الزتونة بدون إنترنت.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl bg-[#800B34] hover:bg-[#680829] dark:bg-[#A30D36] dark:hover:bg-[#BD123F] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت الآن</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F5F7FB] transition-colors cursor-pointer"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
