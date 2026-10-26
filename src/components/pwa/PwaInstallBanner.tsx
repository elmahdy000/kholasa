"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallBanner() {
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
      setIsInstalled(true);
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

  if (!isVisible || isInstalled) return null;

  return (
    <aside
      aria-label="تثبيت تطبيق الخلاصة"
      className="fixed bottom-20 md:bottom-6 start-4 end-4 md:start-auto md:end-6 md:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="p-4 rounded-2xl bg-white dark:bg-[#10233A] border-2 border-[#800020]/20 dark:border-[#A30D36]/40 shadow-xl flex items-start gap-3.5 text-right font-sans">
        <div className="w-10 h-10 rounded-xl bg-[#800020] dark:bg-[#A30D36] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Smartphone className="w-5 h-5" />
        </div>

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
              className="px-3.5 py-1.5 rounded-xl bg-[#800020] hover:bg-[#66001A] dark:bg-[#A30D36] dark:hover:bg-[#BD123F] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
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
