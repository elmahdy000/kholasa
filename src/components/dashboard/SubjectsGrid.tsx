"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Target } from "@phosphor-icons/react";
import type { SubjectItem } from "./types";
import { fadeInUp, staggerContainer } from "./types";

interface SubjectsGridProps {
  subjects: SubjectItem[];
}

export function SubjectsGrid({ subjects }: SubjectsGridProps) {
  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-[#12263F] dark:text-[#F8FAFC]">
            موادك الدراسية
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F3F4F6] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
            {subjects.length} مواد
          </span>
        </div>
        <Link
          href="/subjects"
          className="text-xs sm:text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1"
        >
          <span>عرض كل المواد</span>
          <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
        </Link>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
      >
        {subjects.map((subj) => {
          const progress = subj.progressPercent ?? 0;
          const completed = subj.completedLessons ?? 0;

          return (
            <motion.div key={subj.id} variants={fadeInUp}>
              <div className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-all flex flex-col justify-between space-y-4 h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
                      style={{ backgroundColor: subj.color || "#800020" }}
                    >
                      {subj.name[0]}
                    </div>
                    <span className="text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] bg-[#F3F4F6] dark:bg-[#1E293B] px-2.5 py-0.5 rounded-md border border-[#E5E7EB] dark:border-[#334155]">
                      {subj.unitsCount} وحدات
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#12263F] dark:text-[#F8FAFC] group-hover:text-[#800020] dark:group-hover:text-[#FB7185] transition-colors leading-snug">
                      {subj.name}
                    </h3>
                    {subj.description && (
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
                        {subj.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">
                      <span>
                        {completed} من {subj.totalLessons} دروس مكتملة
                      </span>
                      <span className="font-bold text-[#12263F] dark:text-[#F8FAFC]">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#F3F4F6] dark:bg-[#334155] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#800020] dark:bg-[#E11D48] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#334155] flex items-center justify-between text-xs">
                  <Link
                    href={`/exams/builder?subjectId=${subj.id}`}
                    className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F8FAFC] flex items-center gap-1 font-medium"
                  >
                    <Target className="w-3.5 h-3.5 text-[#D97706]" weight="fill" />
                    <span>اختبار سريع</span>
                  </Link>

                  <Link
                    href={`/subjects/${subj.id}`}
                    className="text-[#800020] dark:text-[#FB7185] font-bold flex items-center gap-1"
                  >
                    <span>فتح المادة</span>
                    <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
