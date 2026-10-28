"use client";

import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { ExamResult } from "./types";

interface GatekeeperResultPhaseProps {
  examResult: ExamResult;
  objectiveLabel: string;
  objectiveTotal: number;
}

export function GatekeeperResultPhase({
  examResult,
  objectiveLabel,
  objectiveTotal,
}: GatekeeperResultPhaseProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Score Header Card */}
      <div
        className={`p-6 rounded-xl text-center space-y-3 border ${
          examResult.percentage >= 70
            ? "bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399]/60"
            : "bg-[#D97706]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#FBBF24]/60"
        }`}
      >
        <div className="w-14 h-14 rounded-xl bg-white dark:bg-[#1E293B] shadow-sm flex items-center justify-center mx-auto text-[#059669]">
          {examResult.percentage === 100 ? (
            <Trophy className="w-11 h-11 text-[#D97706]" />
          ) : examResult.percentage >= 70 ? (
            <CheckCircle2 className="w-11 h-11 text-[#059669]" />
          ) : (
            <AlertCircle className="w-11 h-11 text-[#D97706]" />
          )}
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
            {examResult.percentage === 100
              ? "أداء ممتاز! أجبت على كل الأسئلة الموضوعية بشكل صحيح"
              : examResult.percentage >= 70
              ? "أداء متميز! أحسنت الاستذكار"
              : "محاولة جيدة! راجع أخطاءك الآن لترسخ في ذهنك"}
          </h3>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            {objectiveTotal > 0
              ? `نتيجتك: ${examResult.score} من أصل ${objectiveLabel} (${examResult.percentage}%)`
              : "تم تسليم إجاباتك المقالية، راجع النموذج أدناه."}
          </p>
        </div>

        {examResult.wrongCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] dark:text-[#F87171] text-[13px] font-bold">
            <span>
              عدد الأسئلة التي تحتاج مراجعة: {examResult.wrongCount} — تم حفظها
              في ركن «غلطاتي»
            </span>
          </div>
        )}
      </div>

      {/* Questions Breakdown List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-2">
          <h4 className="text-[13px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#800020]" />
            <span>تفاصيل إجاباتك وتحليل كل سؤال:</span>
          </h4>
          <span className="text-[13px] text-[#94A3B8] font-bold">
            {examResult.reviewedQuestions.length} أسئلة
          </span>
        </div>

        {examResult.reviewedQuestions.map((q, idx) => (
          <div
            key={q.id}
            className={`p-4 rounded-xl border transition-all space-y-3 ${
              q.isCorrect === true
                ? "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155]"
                : q.isCorrect === false
                ? "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#F87171]/60"
                : "bg-[#D97706]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#FBBF24]/60"
            }`}
          >
            {/* Question Header & Status */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#94A3B8]">
                  #{idx + 1}
                </span>
                <span className="text-[13px] font-bold text-[#64748B]">
                  {q.subjectName}
                </span>
              </div>

              {q.isCorrect === true ? (
                <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#34D399]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>إجابة صحيحة</span>
                </span>
              ) : q.isCorrect === false ? (
                <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] bg-[#DC2626]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#F87171]">
                  <XCircle className="w-3 h-3" />
                  <span>إجابة خاطئة</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#D97706] dark:text-[#FBBF24] bg-[#D97706]/10 dark:bg-[#1E293B] px-3 py-1 rounded-full border border-[#E2E8F0] dark:border-[#FBBF24]">
                  <AlertCircle className="w-3 h-3" />
                  <span>سؤال مقالي — راجع النموذج</span>
                </span>
              )}
            </div>

            {/* Statement */}
            <BidiStatement
              as="p"
              text={q.statement}
              className="text-[13px] sm:text-sm font-bold text-[#0F172A] dark:text-white leading-relaxed"
            />

            {/* Answers Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] pt-1">
              {/* What Student Answered */}
              <div
                className={`p-3 rounded-xl border ${
                  q.isCorrect === true
                    ? "bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399] text-[#059669] dark:text-[#34D399]"
                    : q.isCorrect === false
                    ? "bg-[#DC2626]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#F87171] text-[#DC2626] dark:text-[#F87171]"
                    : "bg-[#D97706]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#FBBF24] text-[#D97706] dark:text-[#FBBF24]"
                }`}
              >
                <span className="text-[13px] font-bold block text-[#94A3B8] mb-1">
                  إجابتك:
                </span>
                <span className="font-bold">{q.selectedAnswer}</span>
              </div>

              {/* Correct Answer */}
              <div className="p-3 rounded-xl border bg-[#059669]/10 dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#34D399] text-[#059669] dark:text-[#34D399]">
                <span className="text-[13px] font-bold block text-[#059669] dark:text-[#34D399] mb-1">
                  الإجابة النموذجية الصحيحة:
                </span>
                <span className="font-bold">{q.correctAnswer}</span>
              </div>
            </div>

            {/* Concept & Educational Explanation */}
            {(q.concept || q.correctReason) && (
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/80 border border-[#E2E8F0]/80 dark:border-[#334155] space-y-1 text-[13px]">
                <div className="flex items-center gap-2 text-[#800020] font-bold text-[13px]">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>التفسير التعليمي والمفهوم:</span>
                </div>
                {q.concept && (
                  <div className="text-[#64748B] dark:text-[#F8FAFC]">
                    <span className="font-bold">المفهوم: </span>
                    {q.concept}
                  </div>
                )}
                {q.correctReason && (
                  <p className="text-[#64748B] dark:text-[#94A3B8] leading-relaxed text-[13px]">
                    {q.correctReason}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
