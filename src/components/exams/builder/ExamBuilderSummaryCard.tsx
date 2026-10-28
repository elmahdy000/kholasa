"use client";

import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Subject, ExamMode, ScopeType } from "./types";

interface ExamBuilderSummaryCardProps {
  isReady: boolean;
  isCounting: boolean;
  isSubmitting: boolean;
  currentSubject?: Subject;
  scopeLabel: string;
  questionTypeLabel: string;
  difficultyLabel: string;
  effectiveCount: number;
  mode: ExamMode;
  durationMinutes: number;
  availableCount: number | null;
  scopeType: ScopeType;
  selectedLessonIds: string[];
}

export function ExamBuilderSummaryCard({
  isReady,
  isCounting,
  isSubmitting,
  currentSubject,
  scopeLabel,
  questionTypeLabel,
  difficultyLabel,
  effectiveCount,
  mode,
  durationMinutes,
  availableCount,
  scopeType,
  selectedLessonIds,
}: ExamBuilderSummaryCardProps) {
  return (
    <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-4">
        {/* Header & Status Indicator */}
        <div className="space-y-1 pb-3 border-b border-[#E8E9ED] dark:border-[#22364F]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-extrabold text-[#12263F] dark:text-[#F5F7FB] tracking-tight">
              {isReady ? "امتحانك جاهز" : "ملخص امتحانك"}
            </h3>
            {isCounting ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] dark:text-[#E59A18] bg-[#D97706]/10 dark:bg-[#E59A18]/15 px-2 py-0.5 rounded-full border border-transparent dark:border-[#E59A18]/30">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>فحص...</span>
              </span>
            ) : isReady ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#34D399]/15 px-2.5 py-0.5 rounded-full border border-transparent dark:border-[#34D399]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-[#34D399] animate-pulse" />
                <span>جاهز للبدء</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] bg-[#F7F8FA] dark:bg-[#132945] px-2 py-0.5 rounded-full border border-[#E8E9ED] dark:border-[#22364F]">
                <span>غير مكتمل</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {isReady
              ? "جميع المعايير متوفرة ومجهزة للبدء فوراً"
              : "حدد تفضيلاتك وتأكد من توفر الأسئلة للبدء"}
          </p>
        </div>

        {/* Neatly Aligned Specification Rows */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-start justify-between gap-3 py-1.5 border-b border-[#E8E9ED]/50 dark:border-[#22364F]/60">
            <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">المادة:</span>
            <span className="font-bold text-[#12263F] dark:text-[#F5F7FB] flex items-center gap-1.5 text-left break-words">
              <span
                className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: currentSubject?.color || "#800020" }}
              />
              <bdi>{currentSubject?.name || "غير محدد"}</bdi>
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 py-1.5 border-b border-[#E8E9ED]/50 dark:border-[#22364F]/60">
            <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">النطاق:</span>
            <span className="font-bold text-[#12263F] dark:text-[#F5F7FB] text-left break-words leading-relaxed">
              <bdi>{scopeLabel}</bdi>
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 py-1.5 border-b border-[#E8E9ED]/50 dark:border-[#22364F]/60">
            <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">نوع الأسئلة:</span>
            <span className="font-bold text-[#12263F] dark:text-[#F5F7FB] text-left break-words">
              {questionTypeLabel}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 py-1.5 border-b border-[#E8E9ED]/50 dark:border-[#22364F]/60">
            <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">الصعوبة:</span>
            <span className="font-bold text-[#12263F] dark:text-[#F5F7FB] text-left break-words">
              {difficultyLabel}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#E8E9ED]/50 dark:border-[#22364F]/60">
            <span className="text-[#64748B] dark:text-[#94A3B8]">عدد الأسئلة:</span>
            <span className="font-mono font-extrabold text-[#800020] dark:text-[#E59A18]">
              {effectiveCount} سؤال
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 py-1.5">
            <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">نظام الاختبار:</span>
            <span className="font-bold text-[#12263F] dark:text-[#F5F7FB] text-left break-words">
              {mode === "PRACTICE"
                ? "تدريب (شرح فوري)"
                : `امتحان (${durationMinutes} دقيقة)`}
            </span>
          </div>
        </div>

        {/* Live Available Matching Questions Box */}
        <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0D1B2E] border border-[#E8E9ED] dark:border-[#22364F] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
              الأسئلة المتطابقة
            </span>
            <span className="text-xs text-[#12263F] dark:text-[#F5F7FB] font-semibold block mt-0.5">
              في بنك الأسئلة المعتمد
            </span>
          </div>
          <div className="flex items-baseline gap-1 text-[#800020] dark:text-[#E59A18]">
            {isCounting ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#800020] dark:text-[#E59A18]" />
            ) : (
              <span className="text-xl font-extrabold font-mono">
                {availableCount ?? 0}
              </span>
            )}
            <span className="text-xs font-normal text-[#64748B] dark:text-[#94A3B8]">سؤال</span>
          </div>
        </div>

        {/* Warnings or Zero Availability Note */}
        {availableCount === 0 && !isCounting && (
          <div className="p-3 rounded-xl bg-[#E59A18]/10 dark:bg-[#E59A18]/15 border border-[#E59A18]/30 dark:border-[#E59A18]/40 flex items-start gap-2 text-xs text-[#D97706] dark:text-[#E59A18] font-medium leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {scopeType === "lessons" && selectedLessonIds.length === 0
                ? "يرجى تحديد درس واحد على الأقل للمتابعة."
                : "لا توجد أسئلة تطابق كافة المعايير المحددة، جرب تغيير نوع الأسئلة أو توسيع النطاق."}
            </span>
          </div>
        )}

        {/* Primary Start Action */}
        <button
          type="submit"
          disabled={!isReady || isSubmitting}
          className="w-full h-12 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] dark:bg-[#A30D36] dark:hover:bg-[#BD123F] disabled:bg-[#E8E9ED] dark:disabled:bg-[#132945] disabled:text-[#94A3B8] dark:disabled:text-[#64748B] disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:opacity-90 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>بنجهّزلك الامتحان ثواني...</span>
            </>
          ) : (
            <>
              <span>ابدأ الامتحان الآن</span>
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </>
          )}
        </button>

        {/* Micro reassurance copy */}
        <p className="text-[11px] text-center text-[#64748B] dark:text-[#94A3B8] pt-1">
          تصحيح فوري ونموذجي مع التفسير الكامل
        </p>
      </div>
    </div>
  );
}
