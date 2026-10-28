"use client";

import Link from "next/link";
import type { RecentExamItem } from "./types";

interface RecentExamsListProps {
  recentExams: RecentExamItem[];
}

export function RecentExamsList({ recentExams }: RecentExamsListProps) {
  if (recentExams.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-[#12263F] dark:text-[#F8FAFC]">
          آخر نتائج الاختبارات
        </h2>
        <Link
          href="/exams/builder"
          className="text-xs sm:text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline"
        >
          ابدأ اختبار جديد
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {recentExams.map((exam) => (
          <Link
            key={exam.id}
            href={`/exams/${exam.id}/results`}
            className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] hover:border-[#800020]/40 dark:hover:border-[#E11D48]/60 transition-colors flex items-center justify-between"
          >
            <div>
              <h3 className="text-xs sm:text-[13px] font-bold text-[#12263F] dark:text-[#F8FAFC] line-clamp-1">
                {exam.title}
              </h3>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {exam.totalQuestions} أسئلة
              </span>
            </div>
            <div className="text-left">
              <span
                className={`text-sm font-bold font-mono ${
                  exam.percentage >= 80
                    ? "text-[#059669] dark:text-[#34D399]"
                    : exam.percentage >= 50
                    ? "text-[#D97706] dark:text-[#FBBF24]"
                    : "text-[#DC2626] dark:text-[#F87171]"
                }`}
              >
                {exam.percentage}%
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
