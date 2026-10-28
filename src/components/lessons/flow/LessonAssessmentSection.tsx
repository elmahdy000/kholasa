"use client";

import {
  ChartLineUp,
  Sparkle,
  Check,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import { MasteryRatingType } from "../types";

interface LessonAssessmentSectionProps {
  objectivesList: string[];
  masteryRatings: Record<number, MasteryRatingType>;
  readinessPercentage: number;
  masteredCount: number;
  reviewCount: number;
  onRatingChange: (index: number, rating: MasteryRatingType) => void;
}

export function LessonAssessmentSection({
  objectivesList,
  masteryRatings,
  readinessPercentage,
  masteredCount,
  reviewCount,
  onRatingChange,
}: LessonAssessmentSectionProps) {
  const totalObjectives = objectivesList.length;

  return (
    <div id="section-assessments" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="p-6 rounded-2xl bg-[#4F46E5]/10 border border-[#4F46E5]/25 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ChartLineUp className="w-6 h-6" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F46E5] bg-[#4F46E5]/15 px-2 py-0.5 rounded-md">
                المحطة الخامسة
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                5. أسئلة تقييمات وقياس مدى التمكن
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              حدد مستوى إتقانك لكل مخرج تعليمي لتتعرف فوراً على مؤشر جاهزيتك للامتحان
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#4F46E5]/20 text-[#4F46E5] text-[13px] font-bold font-mono">
            {objectivesList.length} مخرج للتقييم
          </span>
        </div>
      </div>

      {/* Dynamic Readiness Gauge Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-[#4F46E5]" weight="fill" />
              <span>مؤشر الجاهزية اللحظي للاختبار</span>
            </h3>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              يتحدث تلقائياً مع كل تقييم تختاره بالأسفل
            </p>
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#4F46E5]">
              {readinessPercentage}%
            </span>
            <span className="text-[12px] font-bold text-[#64748B]">مستوى الإتقان</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
          <div
            className="h-full bg-[#4F46E5] transition-all duration-500 rounded-full"
            style={{ width: `${readinessPercentage}%` }}
          />
        </div>

        {/* Counters row */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[12px]">
          <div className="p-2.5 rounded-xl bg-[#059669]/10 border border-[#059669]/20 text-[#059669] font-bold">
            متقن تماماً: {masteredCount}
          </div>
          <div className="p-2.5 rounded-xl bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] font-bold">
            يحتاج مراجعة: {reviewCount}
          </div>
          <div className="p-2.5 rounded-xl bg-[#64748B]/10 border border-[#64748B]/20 text-[#64748B] dark:text-[#94A3B8] font-bold">
            غير محدد: {totalObjectives - masteredCount - reviewCount}
          </div>
        </div>
      </div>

      {/* Assessment Questions / Objectives List */}
      <div className="space-y-3">
        {objectivesList.map((obj, idx) => {
          const rating = masteryRatings[idx];

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="w-6 h-6 rounded-lg bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center font-mono font-bold text-[12px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="leading-relaxed">
                  <span className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white block font-content">
                    {obj}
                  </span>
                </div>
              </div>

              {/* 3 Interactive Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => onRatingChange(idx, "mastered")}
                  className={`px-3 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                    rating === "mastered"
                      ? "bg-[#059669] text-white shadow-sm"
                      : "bg-[#059669]/10 text-[#059669] hover:bg-[#059669]/20"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" weight="bold" />
                  <span>متقن تماماً</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRatingChange(idx, "review")}
                  className={`px-3 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                    rating === "review"
                      ? "bg-[#D97706] text-white shadow-sm"
                      : "bg-[#D97706]/10 text-[#D97706] hover:bg-[#D97706]/20"
                  }`}
                >
                  <WarningCircle className="w-3.5 h-3.5" weight="bold" />
                  <span>محتاج مراجعة</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRatingChange(idx, "unclear")}
                  className={`px-3 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                    rating === "unclear"
                      ? "bg-[#DC2626] text-white shadow-sm"
                      : "bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" weight="bold" />
                  <span>غير واضح</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
