"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, BookOpen, Sparkles, ArrowRight } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#09090B] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between p-6 text-right font-sans relative" dir="rtl">
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-xl mx-auto w-full pt-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white font-bold text-sm shadow-2xs">
            خ
          </div>
          <span className="font-bold text-sm text-[#0F172A] dark:text-white">
            الخلاصة | PWA
          </span>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5" />
          <span>أنت غير متصل بالإنترنت</span>
        </span>
      </header>

      {/* Main Body */}
      <main className="max-w-md mx-auto w-full py-12 flex flex-col items-center text-center space-y-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            لا يوجد اتصال بالإنترنت
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            تطبيق الخلاصة يعمل كـ PWA ويحفظ ملخصات "الزتونة" والدروس التي فتحتها مسبقاً تلقائياً في ذاكرة هاتفك.
          </p>
        </div>

        {/* Study Advice Box */}
        <div className="w-full p-4 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 text-right space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#4F46E5] dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span>نصيحة المذاكرة أوفلاين:</span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            استغل فترة انقطاع النت لمراجعة بطاقات المفاهيم الذهبية التي قرأتها اليوم بدون أي مشتتات أو إشعارات!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:flex-1 h-10 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors interactive-tap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة الآن</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:flex-1 h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors interactive-tap"
          >
            <span>العودة للرئيسية</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[#64748B] dark:text-[#94A3B8] py-4 relative z-10">
        الخلاصة • افهمها صح.. هتفضل معاك
      </footer>
    </div>
  );
}
