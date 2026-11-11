"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowCounterClockwise,
  CheckCircle,
  Crosshair,
  TrendUp,
  WarningCircle,
} from "@phosphor-icons/react";
import { AnimatedCount } from "@/components/ui/AnimatedCount";
import type {
  MistakeWeaknessBucket,
  StudentMistakeDiagnosisSummary,
} from "@/lib/mistake-diagnosis";

interface DashboardMistakesSpotlightProps {
  summary: StudentMistakeDiagnosisSummary;
}

function buildMistakeTargetHref(bucket: MistakeWeaknessBucket | null): string {
  if (!bucket) return "/mistakes";
  const params = new URLSearchParams();
  if (bucket.subjectId) {
    params.set("subjectId", bucket.subjectId);
  }
  if (bucket.lessonId) {
    params.set("lessonId", bucket.lessonId);
  }
  const qs = params.toString();
  return qs ? `/mistakes?${qs}` : "/mistakes";
}

export function DashboardMistakesSpotlight({
  summary,
}: DashboardMistakesSpotlightProps) {
  const { unresolvedCount, resolvedCount, topWeakness, breakdown } = summary;
  const totalCount = unresolvedCount + resolvedCount;
  const hasUnresolved = unresolvedCount > 0;
  const resolutionRate =
    totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;
  const primaryHref = buildMistakeTargetHref(topWeakness);
  const topBuckets = breakdown.slice(0, 3);

  return (
    <motion.section
      aria-label="عداد مراجعة لأخطائي وتشخيص نقاط الضعف"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border p-4 sm:p-6 transition-colors ${
        hasUnresolved
          ? "bg-linear-to-bl from-white via-[#FFFDFD] to-[#FEF2F2]/75 dark:from-[#0F172A] dark:via-[#111C33] dark:to-[#291322]/70 border-[#FECACA] dark:border-[#7F1D1D]/60 shadow-xs"
          : "bg-linear-to-bl from-white via-[#FAFFFD] to-[#ECFDF5]/80 dark:from-[#0F172A] dark:via-[#111C33] dark:to-[#0C2920]/70 border-[#A7F3D0] dark:border-[#065F46]/60 shadow-xs"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
        {/* Counter Badge + Primary Diagnosis */}
        <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
            className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center border shadow-xs ${
              hasUnresolved
                ? "bg-[#800B34] border-[#610827] text-white"
                : "bg-[#059669] border-[#047857] text-white"
            }`}
          >
            {hasUnresolved && (
              <span className="absolute top-1.5 left-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9AD32] opacity-85" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E9AD32]" />
              </span>
            )}
            <span className="text-2xl sm:text-3xl font-black tabular-nums leading-none">
              <AnimatedCount value={unresolvedCount} />
            </span>
            <span className="text-[10px] font-bold opacity-90 mt-1">
              {hasUnresolved ? "في المراجعة" : "متقن ✓"}
            </span>
          </motion.div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                  hasUnresolved
                    ? "bg-[#800B34]/10 dark:bg-[#E11D48]/15 text-[#800B34] dark:text-[#FB7185]"
                    : "bg-[#059669]/12 dark:bg-[#34D399]/15 text-[#047857] dark:text-[#34D399]"
                }`}
              >
                <ArrowCounterClockwise className="w-3.5 h-3.5" weight="bold" />
                <span>عداد مراجعة لأخطائي</span>
              </span>

              {totalCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                  <TrendUp className="w-3.5 h-3.5 text-[#059669]" weight="bold" />
                  نسبة المعالجة: {resolutionRate}%
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-black text-[#091B40] dark:text-[#F8FAFC] leading-snug">
              {hasUnresolved && topWeakness
                ? `تركيز أخطائك حالياً في: ${topWeakness.subjectName}${
                    topWeakness.lessonTitle
                      ? ` — ${topWeakness.lessonTitle}`
                      : topWeakness.unitTitle
                        ? ` — ${topWeakness.unitTitle}`
                        : ""
                  }`
                : hasUnresolved
                  ? `عندك ${unresolvedCount} سؤال محتاجين مراجعة لأخطائي`
                  : resolvedCount > 0
                    ? `ممتاز! عالجت كل أخطائك (${resolvedCount} سؤال)`
                    : "لسه مفيش أخطاء مسجلة حتى الآن"}
            </h2>

            <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              {hasUnresolved && topWeakness ? (
                <>
                  عندك{" "}
                  <span className="font-black text-[#800B34] dark:text-[#FB7185] tabular-nums">
                    {topWeakness.count}
                  </span>{" "}
                  {topWeakness.count === 1 ? "سؤال" : "أسئلة"} في النقطة دي (اتكرر الخطأ{" "}
                  <span className="font-bold text-[#091B40] dark:text-[#E2E8F0] tabular-nums">
                    {topWeakness.totalWrongs}
                  </span>{" "}
                  مرة). ابدأ بيها الأول علشان تعلي مستواك أسرع.
                </>
              ) : resolvedCount > 0 ? (
                "كل خطأ عالجته اتحول لنقطة قوة. تقدر تراجع الأسئلة المتقنة تاني في أي وقت قبل الامتحان."
              ) : (
                "أول ما تغلط في أي سؤال أو تمرين، العداد ده هيتجمع أوتوماتيك ويعرفك إيه الدرس اللي محتاج تركيز."
              )}
            </p>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-2.5 shrink-0">
          <Link
            href={primaryHref}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-xs active:scale-[0.98] ${
              hasUnresolved
                ? "bg-[#800B34] hover:bg-[#610827] text-white"
                : "bg-[#091B40] hover:bg-[#12263F] dark:bg-[#E9AD32] dark:hover:bg-[#D99D24] text-white dark:text-[#091B40]"
            }`}
          >
            {hasUnresolved ? (
              <Crosshair className="w-4 h-4 shrink-0" weight="bold" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" weight="bold" />
            )}
            <span>
              {hasUnresolved && topWeakness
                ? "عالج أضعف نقطة دلوقتي"
                : "افتح مراجعة لأخطائي"}
            </span>
            <ArrowLeft className="w-4 h-4 shrink-0" weight="bold" />
          </Link>

          {totalCount > 0 && (
            <div className="w-full sm:w-44 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                <span>أُتقن: {resolvedCount}</span>
                <span>الإجمالي: {totalCount}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${resolutionRate}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-[#059669]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown Diagnosis Pills ("فين المشكلة عندك؟") */}
      {hasUnresolved && topBuckets.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E5E7EB]/80 dark:border-[#334155]/70 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#091B40] dark:text-[#F8FAFC]">
              <WarningCircle
                className="w-4 h-4 text-[#DC2626] dark:text-[#F87171] shrink-0"
                weight="bold"
              />
              تشخيص المشكلة — فين أخطائك متركزة؟
            </span>
            <Link
              href="/mistakes"
              className="text-[11px] font-bold text-[#800B34] dark:text-[#E9AD32] hover:underline shrink-0"
            >
              عرض كل التشخيص ({breakdown.length})
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {topBuckets.map((bucket, idx) => {
              const sharePercent =
                unresolvedCount > 0
                  ? Math.max(8, Math.round((bucket.count / unresolvedCount) * 100))
                  : 0;
              return (
                <motion.div
                  key={`${bucket.subjectId}-${bucket.lessonId ?? "unit"}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * idx, duration: 0.25 }}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    href={buildMistakeTargetHref(bucket)}
                    className="block p-3 rounded-xl bg-white/90 dark:bg-[#0F172A]/90 border border-[#E5E7EB] dark:border-[#334155] hover:border-[#800B34]/50 dark:hover:border-[#E9AD32]/60 transition-all group min-w-0"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] truncate">
                        <span className="w-4 h-4 rounded-md bg-[#800B34]/10 dark:bg-[#E11D48]/20 text-[#800B34] dark:text-[#FB7185] text-[10px] font-black inline-flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{bucket.subjectName}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums bg-[#DC2626]/10 dark:bg-[#DC2626]/20 text-[#B91C1C] dark:text-[#FCA5A5] shrink-0">
                        {bucket.count} سؤال
                      </span>
                    </div>

                    <p className="text-xs font-black text-[#091B40] dark:text-[#F8FAFC] truncate group-hover:text-[#800B34] dark:group-hover:text-[#E9AD32] transition-colors">
                      {bucket.lessonTitle || bucket.unitTitle || "مراجعة عامة في المادة"}
                    </p>

                    <div className="mt-2 h-1 w-full rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#800B34] dark:bg-[#E9AD32] transition-all duration-500"
                        style={{ width: `${Math.min(100, sharePercent)}%` }}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.section>
  );
}
