import Link from "next/link";
import { MagnifyingGlass, House } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]"
    >
      <main className="w-full max-w-md text-center space-y-5 p-8 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] ">
        <div className="mx-auto w-14 h-14 rounded-xl bg-[#4F46E5]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#6366F1] text-[#4F46E5] dark:text-[#6366F1] flex items-center justify-center">
          <MagnifyingGlass className="w-7 h-7" weight="bold" aria-hidden="true" />
        </div>
        <p className="text-[28px] sm:text-4xl font-bold text-[#4F46E5] dark:text-[#6366F1]" dir="ltr">
          404
        </p>
        <div className="space-y-2">
          <h1 className="text-xl font-bold">الصفحة غير موجودة</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
            الرابط الذي طلبته غير متاح أو تم نقله.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="h-11 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
        >
          <House className="w-4 h-4" weight="bold" aria-hidden="true" />
          <span>العودة للرئيسية</span>
        </Link>
      </main>
    </div>
  );
}
