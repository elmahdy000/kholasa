"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lightning,
  CheckCircle,
  XCircle,
  Fire,
  Sparkle,
  ArrowLeft,
} from "@phosphor-icons/react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface Option {
  id: string;
  text: string;
  order?: number;
}

interface DailyQuestion {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  subject: { id: string; name: string };
  unit?: { id: string; title: string } | null;
  options: Option[];
}

interface RevealedAnswer {
  isCorrect?: boolean;
  correctOptionId?: string;
  explanation?: { concept: string; correctReason: string } | null;
  options?: { id: string; text?: string; isCorrect?: boolean }[];
}

interface DailyChallengeCardProps {
  question: DailyQuestion | null;
  isTodayAlreadyCompleted?: boolean;
}

export function DailyChallengeCard({
  question,
  isTodayAlreadyCompleted = false,
}: DailyChallengeCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealed, setRevealed] = useState<RevealedAnswer | null>(null);
  const [streakEarned, setStreakEarned] = useState<number | null>(null);

  if (!question) {
    return null;
  }

  const handleSubmit = async () => {
    if (!selectedOptionId || isAnswered || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/questions/${question.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId, isDailyChallenge: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر التحقق من الإجابة");
      }

      setRevealed(data);
      setIsCorrect(Boolean(data.isCorrect));
      setIsAnswered(true);

      if (typeof data.streakDays === "number") {
        setStreakEarned(data.streakDays);
        window.dispatchEvent(
          new CustomEvent("kholasa_streak_updated", {
            detail: { streakDays: data.streakDays, isTodayCompleted: true },
          })
        );
      }
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "تعذر التحقق من الإجابة، تأكد من الاتصال وجرب مرة أخرى."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const correctOption =
    revealed?.options?.find((o) => o.id === revealed.correctOptionId) ??
    question.options.find((o) => o.id === revealed?.correctOptionId);

  return (
    <div
      id="daily-challenge-card"
      className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-5 sm:p-6 shadow-sm mb-6 transition-all scroll-mt-24"
    >
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-lg bg-[#D97706]/10 dark:bg-[#1E293B] text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
              <Lightning className="w-4 h-4" weight="fill" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block">
                تحدي اليوم السريع
              </span>
              <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium block">
                <BidiStatement as="span" text={question.subject.name} /> {question.unit ? `• ${question.unit.title}` : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTodayAlreadyCompleted ? (
              <span className="text-[12px] font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 px-3 py-1 rounded-md border border-[#059669]/30 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                <span>حضور اليوم مسجل</span>
              </span>
            ) : (
              <span className="text-[13px] font-bold text-[#D97706] dark:text-[#FBBF24] bg-[#D97706]/10 dark:bg-[#1E293B] px-3 py-1 rounded-md border border-[#D97706]/20 dark:border-[#FBBF24]/40 flex items-center gap-1">
                <Fire className="w-3.5 h-3.5 text-[#D97706]" weight="fill" />
                <span>سؤال اليوم</span>
              </span>
            )}
          </div>
        </div>

        {/* Question Statement */}
        <div className="text-right">
          <BidiStatement
            as="p"
            text={question.statement}
            className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-content"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt, optIdx) => {
            const isSelected = selectedOptionId === opt.id;
            const isOptCorrect = revealed?.correctOptionId === opt.id;
            let btnStyle =
              "bg-[#F8FAFC] dark:bg-[#1E293B]/80 border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#800020] dark:hover:border-[#E11D48]/60 hover:bg-white dark:hover:bg-[#1E293B]";

            if (isAnswered) {
              if (isOptCorrect) {
                btnStyle =
                  "bg-[#059669]/10 dark:bg-[#1E293B] border-2 border-[#059669] dark:border-[#34D399] text-[#059669] dark:text-[#34D399] font-bold";
              } else if (isSelected && !isOptCorrect) {
                btnStyle =
                  "bg-[#DC2626]/10 dark:bg-[#1E293B] border-2 border-[#DC2626] dark:border-[#F87171] text-[#DC2626] dark:text-[#F87171] font-bold";
              } else {
                btnStyle =
                  "opacity-40 bg-[#F8FAFC] dark:bg-[#1E293B]/40 border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8]";
              }
            } else if (isSelected) {
              btnStyle =
                "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] dark:border-[#E11D48] text-[#0F172A] dark:text-white  font-bold";
            }

            const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isAnswered}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`p-4 sm:p-4 rounded-xl border text-[13px] sm:text-sm text-right flex items-start sm:items-center justify-between gap-3 transition-all ${btnStyle}`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[13px] font-mono font-bold shrink-0 mt-1 sm:mt-0 transition-colors ${
                      isSelected
                        ? "bg-[#800020] dark:bg-[#E11D48] text-white "
                        : "bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
                    }`}
                  >
                    {arabicLetters[optIdx] || "•"}
                  </span>
                  <div className="min-w-0 flex-1 leading-relaxed">
                    <BidiStatement as="span" text={opt.text} />
                  </div>
                </div>

                {isAnswered && isOptCorrect && (
                  <CheckCircle className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0 mt-1 sm:mt-0" weight="fill" />
                )}
                {isAnswered && isSelected && !isOptCorrect && (
                  <XCircle className="w-4 h-4 text-[#DC2626] dark:text-[#F87171] shrink-0 mt-1 sm:mt-0" weight="fill" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action / Result Feedback */}
        {!isAnswered ? (
          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={handleSubmit}
              disabled={!selectedOptionId || isSubmitting}
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#800020] hover:bg-[#66001A] dark:bg-[#E11D48] dark:hover:bg-[#BE123C] disabled:opacity-40 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all  active:opacity-80"
            >
              <Sparkle className="w-4 h-4" weight="bold" />
              <span>{isSubmitting ? "بنراجع إجابتك..." : "أكّد إجابتك"}</span>
            </button>
          </div>
        ) : (
          <div className="pt-3 space-y-3">
            {isCorrect ? (
              <div className="p-4 rounded-xl bg-[#059669]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/60 dark:border-[#34D399]/60 text-right flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#059669] dark:text-[#34D399] shrink-0 mt-1" weight="fill" />
                <div className="space-y-1">
                  <span className="text-[13px] font-bold text-[#059669] dark:text-[#34D399] block">
                    صح يا بطل! برافو عليك
                  </span>
                  {revealed?.explanation?.correctReason && (
                    <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-content leading-relaxed">
                      {revealed.explanation.correctReason}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/60 dark:border-[#F87171]/60 text-right flex items-start gap-3">
                <XCircle className="w-5 h-5 text-[#DC2626] dark:text-[#F87171] shrink-0 mt-1" weight="fill" />
                <div className="space-y-1">
                  <span className="text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] block">
                    ولا يهمك، المهم نتعلم! الإجابة الصح هي: {correctOption?.text}
                  </span>
                  {revealed?.explanation?.correctReason && (
                    <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-content leading-relaxed">
                      {revealed.explanation.correctReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {streakEarned !== null && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#F59E0B]/15 to-[#D97706]/20 border border-[#F59E0B]/40 flex items-center justify-between gap-3 text-right">
                <div className="flex items-center gap-2">
                  <Fire className="w-5 h-5 text-[#D97706] dark:text-[#FBBF24] shrink-0" weight="fill" />
                  <span className="text-[13px] font-bold text-[#D97706] dark:text-[#FBBF24]">
                    شعلتك متوهجة الآن! أصبحت {streakEarned} أيام متتالية 🔥
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D97706] text-white shrink-0">
                  +1 يوم
                </span>
              </div>
            )}

            {/* Lesson link or Mistake link */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[13px]">
              <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                {isAnswered ? "تم تسجيل إجابتك وتثبيت حضورك اليومي بنجاح." : ""}
              </span>
              <Link
                href="/exams/builder"
                className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1"
              >
                <span>تدرب على مزيد من الأسئلة في بنك الاختبارات</span>
                <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}