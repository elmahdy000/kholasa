"use client";

import Link from "next/link";
import { ArrowLeft, BookOpenCheck, CheckCircle2, LayoutDashboard } from "lucide-react";
import type { LandingContinueItem } from "@/components/landing/types";

interface ContinueStudyingSectionProps {
  items: LandingContinueItem[];
}

export function ContinueStudyingSection({ items }: ContinueStudyingSectionProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      id="continue-studying"
      className="py-8 sm:py-10 bg-[#F7F9FC] dark:bg-[#081426] border-b border-[#E8E9ED] dark:border-[#22364F]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-right">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#091B40] dark:text-white flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-[#800B34] dark:text-[#FB7185]" />
              <span>كمّل مذاكرتك</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#536681] dark:text-[#94A3B8]">
              آخر دروس وصلت لها — كمل من مكان ما وقفت على طول.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="min-h-[42px] px-4 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-bold text-[#091B40] dark:text-white inline-flex items-center gap-1.5 hover:border-[#800B34] transition-colors self-start sm:self-auto"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#800B34] dark:text-[#FB7185]" />
            <span>لوحة الطالب</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const pct = Math.min(100, Math.max(0, Math.round(item.progressPercent)));
            return (
              <div
                key={item.lessonId}
                className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <span className="text-[#800B34] dark:text-[#FB7185]">
                      {item.subjectName} • {item.unitTitle}
                    </span>
                    {item.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[#059669] dark:text-[#34D399]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>مكتمل</span>
                      </span>
                    ) : (
                      <span className="font-sans tabular-nums text-[#091B40] dark:text-slate-200">
                        {pct}%
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#091B40] dark:text-white leading-snug">
                    {item.lessonTitle}
                  </h3>

                  <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#800B34] dark:bg-[#FB7185] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/lessons/${item.lessonId}`}
                  className="min-h-[42px] px-4 py-2 rounded-lg bg-[#091B40] hover:bg-[#12263F] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>{item.isCompleted ? "مراجعة الدرس" : "كمّل الدرس"}</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

