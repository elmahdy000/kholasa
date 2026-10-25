"use client";
import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#0F172A]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-[#FAF7F8] dark:bg-[#1E293B] border border-[#F0E6E8] dark:border-[#334155] p-8 sm:p-12 lg:p-16 text-center shadow-xs"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-[24px] sm:text-[32px] font-bold text-[#1A0A10] dark:text-white leading-tight">
              مستعد تخلي مذاكرتك أسهل؟
            </h2>
            <p className="text-base text-[#735C63] dark:text-[#94A3B8] font-content leading-relaxed max-w-xl mx-auto">
              ابدأ بالشرح، راجع الزتونة، واختبر فهمك في كل درس. الخلاصة مصممة عشان تفهم أسرع وتذاكر أذكى.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="h-12 px-8 rounded-lg bg-[#800020] hover:bg-[#66001A] text-white text-sm font-bold flex items-center gap-2 transition-colors shadow-sm hover:shadow-md"
              >
                <span>ابدأ مجانًا</span>
                <ArrowLeft className="w-4 h-4" weight="bold" />
              </Link>
            </div>
            <p className="text-[13px] text-[#735C63] dark:text-[#94A3B8] font-medium pt-2">
              لا يتطلب بطاقة ائتمان • إلغاء في أي وقت
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}