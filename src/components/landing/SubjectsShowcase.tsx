"use client";

import Link from "next/link";
import { BookOpen, Code2, Cpu, ArrowLeft, Layers, CheckSquare } from "lucide-react";
import type { LandingSubjectItem } from "@/components/landing/types";

interface SubjectsShowcaseProps {
  subjects?: LandingSubjectItem[];
}

export function SubjectsShowcase({ subjects = [] }: SubjectsShowcaseProps) {
  if (subjects.length === 0) {
    return null;
  }

  // Balanced grid with zero empty orphan columns
  const gridColsClass =
    subjects.length === 1
      ? "grid-cols-1 max-w-xl"
      : subjects.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-right">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E8E9ED] dark:border-[#334155]">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#091B40] dark:text-white leading-snug">
              المناهج المتاحة حالياً على المنصة
            </h2>
            <p className="text-sm sm:text-[15px] text-[#536681] dark:text-[#94A3B8] leading-relaxed">
              فصل كامل بين مدارس العربي ومدارس اللغات — كل منهج بوحداته ودروسه وبنك أسئلته المعتمد.
            </p>
          </div>

          <Link
            href="/subjects"
            className="min-h-[44px] px-4 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-xs sm:text-sm font-bold text-[#091B40] dark:text-white inline-flex items-center gap-2 hover:border-[#800B34] hover:text-[#800B34] dark:hover:border-[#FB7185] dark:hover:text-[#FB7185] transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>عرض فهرس المواد الكامل</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Balanced Subjects Grid */}
        <div className={`grid gap-4 sm:gap-6 ${gridColsClass}`}>
          {subjects.map((sub) => {
            const isLanguages = sub.schoolCategory === "LANGUAGES";
            const Icon = isLanguages ? Code2 : Cpu;
            const categoryLabel = isLanguages ? "مدارس اللغات" : "المدارس العربية";

            return (
              <div
                key={sub.id}
                className="p-6 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: sub.color || "#800B34" }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-[#091B40] dark:text-white leading-tight">
                          {sub.name}
                        </h3>
                        <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                          {sub.gradeName}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-[#091B40] dark:text-slate-200 px-2.5 py-1 rounded-md bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shrink-0">
                      {categoryLabel}
                    </span>
                  </div>

                  {sub.description && (
                    <p className="text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                      {sub.description}
                    </p>
                  )}

                  {/* Actual Published Units Preview */}
                  {sub.units.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-bold text-[#091B40] dark:text-white block">
                        الوحدات المنشورة:
                      </span>
                      <ul
                        dir={isLanguages ? "ltr" : "rtl"}
                        className={`space-y-1 ${isLanguages ? "text-left" : "text-right"}`}
                      >
                        {sub.units.map((u) => (
                          <li
                            key={u.id}
                            className="text-xs text-[#536681] dark:text-[#94A3B8] flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80"
                          >
                            <span className="truncate font-medium text-[#091B40] dark:text-slate-200">
                              {u.title}
                            </span>
                            <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] shrink-0">
                              {u.lessons.length} دروس
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Verified Counts & Direct Entry */}
                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[#536681] dark:text-[#94A3B8]">
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#800B34] dark:text-[#FB7185]" />
                      <span>
                        {sub.publishedUnitsCount} وحدات • {sub.publishedLessonsCount} درساً منشوراً
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#091B40] dark:text-white font-mono">
                      <CheckSquare className="w-3.5 h-3.5 text-[#059669]" />
                      <span>{sub.publishedQuestionsCount} سؤال منشور</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Link
                      href={`/subjects/${sub.id}`}
                      className="min-h-[44px] px-3.5 py-2 rounded-lg bg-[#091B40] hover:bg-[#12263F] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>تصفح الوحدات والدروس</span>
                    </Link>
                    <Link
                      href={`/exams/builder?subjectId=${sub.id}`}
                      className="min-h-[44px] px-3.5 py-2 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#800B34] text-[#091B40] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>اختبر نفسك في المادة</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
