"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lightning,
  CheckCircle,
  XCircle,
  Fire,
  Sparkle,
  ArrowLeft,
} from "@phosphor-icons/react";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string | null;
}

interface DailyQuestion {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  subject: { id: string; name: string };
  unit?: { id: string; title: string } | null;
  options: Option[];
  explanation?: {
    concept: string;
    correctReason: string;
  } | null;
}

interface DailyChallengeCardProps {
  question: DailyQuestion | null;
}

export function DailyChallengeCard({ question }: DailyChallengeCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasSavedToday, setHasSavedToday] = useState(false);

  useEffect(() => {
    if (!question) return;
    const todayKey = `kholasa_daily_q_${new Date().toISOString().slice(0, 10)}`;
    const saved = localStorage.getItem(todayKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.questionId === question.id) {
          setSelectedOptionId(parsed.selectedOptionId);
          setIsAnswered(true);
          setIsCorrect(parsed.isCorrect);
          setHasSavedToday(true);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [question]);

  if (!question) {
    return null;
  }

  const handleSubmit = () => {
    if (!selectedOptionId || isAnswered) return;

    const chosen = question.options.find((o) => o.id === selectedOptionId);
    const correct = !!chosen?.isCorrect;

    setIsAnswered(true);
    setIsCorrect(correct);
    setHasSavedToday(true);

    const todayKey = `kholasa_daily_q_${new Date().toISOString().slice(0, 10)}`;
    localStorage.setItem(
      todayKey,
      JSON.stringify({
        questionId: question.id,
        selectedOptionId,
        isCorrect: correct,
      })
    );
  };

  const correctOption = question.options.find((o) => o.isCorrect);

  return (
    <div className="rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 p-5 sm:p-6">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D97706]/10 text-[#D97706] flex items-center justify-center">
              <Lightning className="w-4 h-4" weight="fill" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#0F172A] dark:text-white block">
                تحدي اليوم السريع ⚡
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium block">
                {question.subject.name} {question.unit ? `• ${question.unit.title}` : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#D97706] bg-[#D97706]/10 px-2.5 py-1 rounded-md border border-[#D97706]/20 flex items-center gap-1">
              <Fire className="w-3.5 h-3.5" weight="fill" />
              <span>+20 XP مكافأة</span>
            </span>
          </div>
        </div>

        {/* Question Statement */}
        <div className="text-right">
          <p className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed font-content">
            {question.statement}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle =
              "bg-[#F8FAFC] dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white hover:border-[#4F46E5]";

            if (isAnswered) {
              if (opt.isCorrect) {
                btnStyle =
                  "bg-[#059669]/10 border-[#059669]/30 text-[#059669] font-bold";
              } else if (isSelected && !opt.isCorrect) {
                btnStyle =
                  "bg-[#DC2626]/10 border-[#DC2626]/30 text-[#DC2626] font-bold";
              } else {
                btnStyle =
                  "opacity-50 bg-[#F8FAFC] dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-700 text-[#64748B]";
              }
            } else if (isSelected) {
              btnStyle =
                "bg-[#4F46E5]/5 border-[#4F46E5] text-[#4F46E5] font-bold";
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isAnswered}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`p-3 rounded-lg border text-xs sm:text-sm text-right flex items-center justify-between gap-3 transition-colors ${btnStyle}`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isSelected
                        ? "bg-[#4F46E5] text-white"
                        : "bg-[#E2E8F0] dark:bg-slate-700 text-[#64748B]"
                    }`}
                  >
                    {isAnswered && opt.isCorrect ? "✓" : isAnswered && isSelected ? "✗" : "•"}
                  </span>
                  <span>{opt.text}</span>
                </div>

                {isAnswered && opt.isCorrect && (
                  <CheckCircle className="w-4 h-4 text-[#059669] shrink-0" weight="fill" />
                )}
                {isAnswered && isSelected && !opt.isCorrect && (
                  <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" weight="fill" />
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
              disabled={!selectedOptionId}
              className="h-10 px-6 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Sparkle className="w-4 h-4" weight="bold" />
              <span>تأكيد الإجابة وربح XP</span>
            </button>
          </div>
        ) : (
          <div className="pt-3 space-y-3">
            {isCorrect ? (
              <div className="p-3.5 rounded-lg bg-[#059669]/10 border border-[#059669]/20 text-right flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" weight="fill" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#059669] block">
                    إجابة عبقرية! 🎉 +20 XP لحسابك
                  </span>
                  {question.explanation?.correctReason && (
                    <p className="text-xs text-[#0F172A] dark:text-slate-300 font-content">
                      {question.explanation.correctReason}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 text-right flex items-start gap-3">
                <XCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" weight="fill" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#DC2626] block">
                    فرصة للتعلم! الإجابة الصحيحة هي: {correctOption?.text}
                  </span>
                  {question.explanation?.correctReason && (
                    <p className="text-xs text-[#0F172A] dark:text-slate-300 font-content">
                      {question.explanation.correctReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Lesson link or Mistake link */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                {hasSavedToday ? "تم تسجيل مشاركتك اليومية بنجاح 🌟" : ""}
              </span>
              <Link
                href="/exams/builder"
                className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
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