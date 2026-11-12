"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUp,
  BookOpen,
  CheckSquare,
  Code2,
  Cpu,
  Layers,
} from "lucide-react";
import type { LandingGradeItem, LandingSubjectItem } from "@/components/landing/types";
import type { StudySchoolCategory } from "@/lib/study-preferences";

interface SubjectsShowcaseProps {
  subjects?: LandingSubjectItem[];
  grades?: LandingGradeItem[];
  selectedGradeId: string | null;
  selectedCategory: StudySchoolCategory | null;
}

export function SubjectsShowcase({
  subjects = [],
  grades = [],
  selectedGradeId,
  selectedCategory,
}: SubjectsShowcaseProps) {
  const activeGrade = grades.find((g) => g.id === selectedGradeId) || null;
  const isSelectionComplete = Boolean(activeGrade && selectedCategory);

  const filteredSubjects = isSelectionComplete
    ? subjects.filter(
        (sub) =>
          sub.gradeId === activeGrade!.id &&
          (sub.isCommonCategory || sub.schoolCategory === selectedCategory)
      )
    : [];

  const categoryLabel =
    selectedCategory === "LANGUAGES"
      ? "مدارس لغات"
      : selectedCategory === "ARABIC"
        ? "مدارس عربي"
        : "";

  const subjectsIndexHref = isSelectionComplete
    ? `/subjects?grade=${encodeURIComponent(activeGrade!.code)}&category=${encodeURIComponent(selectedCategory!)}`
    : "/subjects";

  const gridColsClass =
    filteredSubjects.length === 1
      ? "grid-cols-1 max-w-xl"
      : filteredSubjects.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="subjects-section"
      className="py-10 sm:py-14 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155] scroll-mt-20"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 text-right">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8E9ED] dark:border-[#334155]">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#091B40] dark:text-white leading-snug">
              {isSelectionComplete
                ? `المواد الدراسية — ${activeGrade!.name} (${categoryLabel})`
                : "المواد الدراسية المتاحة حسب اختيارك"}
            </h2>
            <p className="text-sm sm:text-[15px] text-[#536681] dark:text-[#94A3B8] leading-relaxed">
              {isSelectionComplete
                ? "كل المواد التالية منشورة فعلياً على المنصة بوحداتها ودروسها وأسئلتها المعتمدة."
                : "بعد ما تختار الصف ونوع المدرسة من فوق، هتظهر لك هنا المواد المتاحة لصفك ومسارك مباشرة."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
            {isSelectionComplete && (
              <a
                href="#hero-selector"
                className="min-h-[44px] px-3.5 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#536681] dark:text-[#94A3B8] hover:text-[#091B40] dark:hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>تغيير الصف أو المسار</span>
              </a>
            )}
            <Link
              href={subjectsIndexHref}
              className="min-h-[44px] px-4 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-xs sm:text-sm font-bold text-[#091B40] dark:text-white inline-flex items-center gap-2 hover:border-[#800B34] hover:text-[#800B34] dark:hover:border-[#FB7185] dark:hover:text-[#FB7185] transition-colors"
            >
              <span>عرض فهرس المواد</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Guided Empty / Unselected State vs Real Filtered DB Subjects */}
        {!isSelectionComplete ? (
          <div className="p-6 sm:p-8 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-dashed border-[#CBD5E1] dark:border-[#334155] text-center space-y-3">
            <div className="w-11 h-11 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#091B40] dark:text-white">
              اختار صفك ونوع المدرسة الأول
            </h3>
            <p className="text-xs sm:text-sm text-[#536681] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              علشان ما نتوهكش بمناهج مش بتاعتك، حدد سنتك الدراسية (أولى أو تانية بكالوريا) ومدرستك (عربي أو لغات) من المربع اللي فوق.
            </p>
            <div className="pt-1">
              <a
                href="#hero-selector"
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
                <span>اختيار الصف ونوع المدرسة</span>
              </a>
            </div>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-6 sm:p-8 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-center space-y-2.5">
            <h3 className="text-base sm:text-lg font-bold text-[#091B40] dark:text-white">
              لا توجد مواد منشورة حالياً لـ {activeGrade!.name} ({categoryLabel})
            </h3>
            <p className="text-xs sm:text-sm text-[#536681] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              بنعرض فقط المواد المفعّلة والمعتمدة من قاعدة البيانات — وجاري استكمال إضافة باقي المواد لهذا المسار قريباً.
            </p>
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${gridColsClass}`}>
            {filteredSubjects.map((sub) => {
              const isLanguages = sub.schoolCategory === "LANGUAGES";
              const Icon = isLanguages ? Code2 : Cpu;
              const subCategoryLabel = sub.isCommonCategory
                ? "عامة لكل المسارات"
                : isLanguages
                  ? "مدارس لغات"
                  : "مدارس عربي";

              return (
                <div
                  key={sub.id}
                  className="p-5 sm:p-6 rounded-xl bg-[#F7F9FC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between gap-5"
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
                        {subCategoryLabel}
                      </span>
                    </div>

                    {sub.description && (
                      <p className="text-sm text-[#536681] dark:text-[#94A3B8] leading-relaxed">
                        {sub.description}
                      </p>
                    )}

                    {/* Published Units Preview */}
                    {sub.units.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs font-bold text-[#091B40] dark:text-white block">
                          الوحدات المتاحة:
                        </span>
                        <ul
                          dir={isLanguages ? "ltr" : "rtl"}
                          className={`space-y-1 ${isLanguages ? "text-left" : "text-right"}`}
                        >
                          {sub.units.slice(0, 4).map((u) => {
                            const lessonsTotal = u.lessonsCount ?? u.lessons.length;
                            return (
                              <li
                                key={u.id}
                                className="text-xs text-[#536681] dark:text-[#94A3B8] flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80"
                              >
                                <span className="truncate font-medium text-[#091B40] dark:text-slate-200">
                                  {u.title}
                                </span>
                                <span className="text-[11px] font-sans tabular-nums text-[#64748B] dark:text-[#94A3B8] shrink-0">
                                  {lessonsTotal} دروس
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Verified DB Counts & Direct Subject Entry */}
                  <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[#536681] dark:text-[#94A3B8]">
                      <span className="inline-flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#800B34] dark:text-[#FB7185]" />
                        <span>
                          {sub.publishedUnitsCount} وحدات • {sub.publishedLessonsCount} درس
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-bold text-[#091B40] dark:text-white font-sans tabular-nums">
                        <CheckSquare className="w-3.5 h-3.5 text-[#059669]" />
                        <span>{new Intl.NumberFormat("en-US").format(sub.publishedQuestionsCount)} سؤال</span>
                      </span>
                    </div>

                    <Link
                      href={`/subjects/${sub.id}`}
                      className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-[#800B34] hover:bg-[#680829] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>ادخل المادة</span>
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
