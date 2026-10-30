"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function StudentFooter() {
  return (
    <footer className="mt-auto border-t border-[#E8E9ED] dark:border-[#22364F] bg-[#F7F8FA] dark:bg-[#0D1B2E] pt-8 pb-28 lg:pb-8 text-right text-xs text-[#64748B] dark:text-[#94A3B8]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <BrandLogo
          href="/dashboard"
          variant="combined"
          size="sm"
          subtitleText="EL KHOLASA — افهمها صح"
        />

        <div className="hidden sm:flex flex-wrap items-center justify-center gap-5 font-medium">
          <Link href="/dashboard" className="hover:text-[#800020] dark:hover:text-[#A30D36] transition-colors">
            الرئيسية
          </Link>
          <Link href="/subjects" className="hover:text-[#800020] dark:hover:text-[#A30D36] transition-colors">
            المواد الدراسية
          </Link>
          <Link href="/exams/builder" className="hover:text-[#800020] dark:hover:text-[#A30D36] transition-colors">
            بنك الأسئلة
          </Link>
          <Link href="/mistakes" className="hover:text-[#800020] dark:hover:text-[#A30D36] transition-colors">
            ركن غلطاتي
          </Link>
          <Link href="/profile" className="hover:text-[#800020] dark:hover:text-[#A30D36] transition-colors">
            حسابي
          </Link>
        </div>

        <p className="text-[11px] text-center sm:text-right">
          © {new Date().getFullYear()} الخلاصة — جميع الحقوق محفوظة لطلابنا
        </p>
      </div>
    </footer>
  );
}
