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
      <div className="p-4 sm:p-6 rounded-2xl bg-[#EAF2FF]/70 dark:bg-[#142747]/70 border border-[#BFDBFE] dark:border-[#1E3A6E] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#091B40] dark:bg-[#2C70BF] text-white flex items-center justify-center shrink-0 shadow-sm">
            <ChartLineUp className="w-6 h-6" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8] dark:text-[#93C5FD] bg-[#2C70BF]/12 dark:bg-[#2C70BF]/25 px-2 py-0.5 rounded-md">
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
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0F1E36] border border-[#BFDBFE] dark:border-[#1E3A6E] text-[#1D4ED8] dark:text-[#93C5FD] text-[13px] font-bold font-mono">
            {objectivesList.length} مخرج للتقييم
          </span>
        </div>
      </div>

      {/* Dynamic Readiness Gauge Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#E2E8F0] dark:border-[#1E3352] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-[#2C70BF] dark:text-[#60A5FA]" weight="fill" />
              <span>مؤشر الجاهزية اللحظي للاختبار</span>
            </h3>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              يتحدث تلقائياً مع كل تقييم تختاره بالأسفل
            </p>
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1D4ED8] dark:text-[#60A5FA]">
              {readinessPercentage}%
            </span>
            <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8]">مستوى الإتقان</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-[#F8FAFC] dark:bg-[#142747] border border-[#E2E8F0] dark:border-[#1E3352] overflow-hidden">
          <div
            className="h-full bg-[#2C70BF] dark:bg-[#60A5FA] transition-all duration-500 rounded-full"
            style={{ width: `${readinessPercentage}%` }}
          />
        </div>

        {/* Counters row */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[12px]">
          <div className="p-2.5 rounded-xl bg-[#059669]/10 border border-[#059669]/20 text-[#059669] dark:text-[#34D399] font-bold">
            متقن تماماً: {masteredCount}
          </div>
          <div className="p-2.5 rounded-xl bg-[#FFFBEB] dark:bg-[#F0B843]/15 border border-[#FDE68A] dark:border-[#F0B843]/30 text-[#92400E] dark:text-[#F0B843] font-bold">
            يحتاج مراجعة: {reviewCount}
          </div>
          <div className="p-2.5 rounded-xl bg-[#64748B]/10 border border-[#64748B]/20 text-[#536681] dark:text-[#CBD5E1] font-bold">
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
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#E2E8F0] dark:border-[#1E3352] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="w-6 h-6 rounded-lg bg-[#EAF2FF] dark:bg-[#142747] text-[#1D4ED8] dark:text-[#93C5FD] flex items-center justify-center font-mono font-bold text-[12px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="leading-relaxed">
                  <span className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white block font-content">
                    {obj}
                  </span>
                </div>
              </div>

              {/* 3 Interactive Buttons */}
              <div className="grid grid-cols-3 sm:flex items-center gap-1.5 shrink-0 w-full md:w-auto">
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
                      ? "bg-[#B45309] text-white shadow-sm"
                      : "bg-[#FFFBEB] dark:bg-[#F0B843]/15 text-[#92400E] dark:text-[#F0B843] hover:bg-[#FEF3C7]"
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
