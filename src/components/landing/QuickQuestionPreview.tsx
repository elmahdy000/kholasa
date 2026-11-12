"use client";

import { useState } from "react";
import { ArrowUp, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import type {
  LandingGradeItem,
  LandingSampleQuestionBucket,
} from "@/components/landing/types";
import type { StudySchoolCategory } from "@/lib/study-preferences";
import { RealQuestionChallenge } from "@/components/landing/RealQuestionChallenge";

interface QuickQuestionPreviewProps {
  grades: LandingGradeItem[];
  sampleQuestionsByBucket: LandingSampleQuestionBucket[];
  selectedGradeId: string | null;
  selectedCategory: StudySchoolCategory | null;
}

export function QuickQuestionPreview({
  grades,
  sampleQuestionsByBucket,
  selectedGradeId,
  selectedCategory,
}: QuickQuestionPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeGrade = grades.find((g) => g.id === selectedGradeId) || null;
  const isSelectionComplete = Boolean(activeGrade && selectedCategory);

  const matchingSample = isSelectionComplete
    ? sampleQuestionsByBucket.find(
        (b) => b.gradeId === activeGrade!.id && b.schoolCategory === selectedCategory
      )?.highlight || null
    : null;

  const categoryLabel =
    selectedCategory === "LANGUAGES"
      ? "مدارس لغات"
      : selectedCategory === "ARABIC"
        ? "مدارس عربي"
        : "";

  return (
    <section
      id="try-question"
      className="py-8 sm:py-10 bg-white dark:bg-[#0F172A] border-b border-[#E8E9ED] dark:border-[#334155] scroll-mt-20"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-right">
        <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F7F9FC] dark:bg-[#1E293B] p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#800B34] dark:text-[#FB7185]">
                <HelpCircle className="w-4 h-4" />
                <span>تجربة اختيارية سريعة</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#091B40] dark:text-white">
                جرّب سؤال من المنهج
              </h2>
              <p className="text-xs sm:text-sm text-[#536681] dark:text-[#94A3B8]">
                {isSelectionComplete
                  ? `سؤال واحد سريع من ${activeGrade!.name} (${categoryLabel}) علشان تشوف التفسير العلمي بنفسك.`
                  : "اختار الصف ونوع المدرسة من فوق الأول لو حابب تجرب سؤال سريع من منهجك."}
              </p>
            </div>

            {isSelectionComplete ? (
              matchingSample ? (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  aria-expanded={isExpanded}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-[#091B40] hover:bg-[#12263F] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <span>{isExpanded ? "إخفاء السؤال" : "اعرض سؤال تجريبي"}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  لا يتوفر سؤال معاينة لهذا المسار حالياً
                </span>
              )
            ) : (
              <a
                href="#hero-selector"
                className="min-h-[44px] px-4 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-bold text-[#091B40] dark:text-white inline-flex items-center gap-1.5 hover:border-[#800B34] transition-colors shrink-0 self-start sm:self-auto"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>اختار الصف من فوق</span>
              </a>
            )}
          </div>

          {isSelectionComplete && isExpanded && matchingSample && (
            <div className="rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-4 sm:p-5">
              <RealQuestionChallenge
                key={`${matchingSample.lessonId}-${matchingSample.question.id}`}
                lessonId={matchingSample.lessonId}
                lessonTitle={matchingSample.lessonTitle}
                unitTitle={matchingSample.unitTitle}
                question={matchingSample.question}
                isLanguages={matchingSample.schoolCategory === "LANGUAGES"}
                compact
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

