"use client";
import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#09090B]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-[#F8FAFC] dark:bg-zinc-950 border border-[#E2E8F0] dark:border-zinc-800 p-8 sm:p-12 lg:p-16 text-center"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-[24px] sm:text-[32px] font-bold text-[#0F172A] dark:text-white leading-tight">
              مستعد تخلي مذاكرتك أسهل؟
            </h2>
            <p className="text-base text-[#64748B] dark:text-zinc-400 font-content leading-relaxed max-w-xl mx-auto">
              ابدأ بالشرح، راجع الزتونة، واختبر فهمك في كل درس. الخلاصة مصممة عشان تفهم أسرع وتذاكر أذكى.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="h-12 px-8 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <span>ابدأ مجانًا</span>
                <ArrowLeft className="w-4 h-4" weight="bold" />
              </Link>
            </div>
            <p className="text-xs text-[#64748B] dark:text-zinc-500 font-medium pt-2">
              لا يتطلب بطاقة ائتمان • إلغاء في أي وقت
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}