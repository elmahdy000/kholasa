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
    <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm mb-6">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D97706]/10 dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 flex items-center justify-center">
              <Lightning className="w-4 h-4" weight="fill" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#0F172A] dark:text-white block">
                تحدي اليوم السريع
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium block">
                {question.subject.name} {question.unit ? `• ${question.unit.title}` : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#D97706] dark:text-amber-400 bg-[#D97706]/10 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-[#D97706]/20 dark:border-amber-900/40 flex items-center gap-1">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.options.map((opt, optIdx) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle =
              "bg-[#F8FAFC] dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-[#0F172A] dark:text-slate-100 hover:border-indigo-400 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-800";

            if (isAnswered) {
              if (opt.isCorrect) {
                btnStyle =
                  "bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 dark:border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold";
              } else if (isSelected && !opt.isCorrect) {
                btnStyle =
                  "bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 dark:border-rose-400 text-rose-900 dark:text-rose-200 font-bold";
              } else {
                btnStyle =
                  "opacity-40 bg-[#F8FAFC] dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400";
              }
            } else if (isSelected) {
              btnStyle =
                "bg-indigo-50/80 dark:bg-indigo-950/50 border-2 border-[#4F46E5] dark:border-indigo-400 text-[#0F172A] dark:text-white shadow-2xs font-bold";
            }

            const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isAnswered}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`p-3.5 rounded-xl border text-xs sm:text-sm text-right flex items-center justify-between gap-3 transition-all ${btnStyle}`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[#4F46E5] dark:bg-indigo-500 text-white shadow-xs"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {arabicLetters[optIdx] || "•"}
                  </span>
                  <span>{opt.text}</span>
                </div>

                {isAnswered && opt.isCorrect && (
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" weight="fill" />
                )}
                {isAnswered && isSelected && !opt.isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" weight="fill" />
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
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
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
                    إجابة صحيحة ومتقنة! +20 XP لحسابك
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
                {hasSavedToday ? "تم تسجيل مشاركتك اليومية بنجاح." : ""}
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