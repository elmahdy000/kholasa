"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, BookOpen, Sparkles, ArrowRight } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#090E17] text-[#14243D] dark:text-[#F8FAFC] flex flex-col justify-between p-6 text-right font-sans" dir="rtl">
      {/* Top Header */}
      <header className="max-w-xl mx-auto w-full pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6858EA] to-[#11B7B4] flex items-center justify-center text-white font-black text-base shadow-sm">
            خ
          </div>
          <span className="font-black text-base text-[#14243D] dark:text-white">
            الخلاصة | PWA
          </span>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5" />
          <span>أنت غير متصل بالإنترنت</span>
        </span>
      </header>

      {/* Main Body */}
      <main className="max-w-md mx-auto w-full py-12 flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/15">
          <WifiOff className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#14243D] dark:text-white">
            لا يوجد اتصال بالإنترنت
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            تطبيق الخلاصة يعمل كـ PWA ويحفظ ملخصات "الزتونة" والدروس التي فتحتها مسبقاً تلقائياً في ذاكرة هاتفك.
          </p>
        </div>

        {/* Study Advice Box */}
        <div className="w-full p-4 rounded-2xl bg-white dark:bg-[#111A2B] border border-slate-200 dark:border-slate-800 text-right space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black text-[#6858EA]">
            <Sparkles className="w-4 h-4" />
            <span>نصيحة المذاكرة أوفلاين:</span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            استغل فترة انقطاع النت لمراجعة بطاقات المفاهيم الذهبية التي قرأتها اليوم بدون أي مشتتات أو إشعارات!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:flex-1 h-11 px-5 rounded-xl bg-[#6858EA] hover:bg-[#5444D8] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-[#6858EA]/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة الآن</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:flex-1 h-11 px-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#14243D] dark:text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <span>العودة للرئيسية</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[#64748B] dark:text-[#94A3B8] py-4">
        الخلاصة • افهمها صح.. هتفضل معاك
      </footer>
    </div>
  );
}
