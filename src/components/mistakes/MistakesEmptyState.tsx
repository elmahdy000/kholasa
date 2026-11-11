"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export function MistakesEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="p-10 sm:p-12 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-center space-y-3"
    >
      <div className="w-12 h-12 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] text-[#059669] flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
        مفيش أسئلة في الفلتر ده دلوقتي
      </h3>
      <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
        كمّل حل امتحانات وتدريبات، وأي سؤال تقف فيه هينزل هنا لوحده عشان ترجعله بعدين.
      </p>
      <Link
        href="/exams"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#800B34] hover:bg-[#680829] text-white text-[13px] font-bold transition-all active:opacity-80"
      >
        <span>روح على الامتحانات</span>
        <ArrowLeft className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}
