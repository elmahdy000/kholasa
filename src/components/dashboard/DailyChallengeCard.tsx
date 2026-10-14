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
import { BidiStatement } from "@/components/ui/BidiStatement";

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
    <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm mb-6">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lightning className="w-4 h-4" weight="fill" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                تحدي اليوم السريع
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block">
                <BidiStatement as="span" text={question.subject.name} /> {question.unit ? `• ${question.unit.title}` : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-500/20 dark:border-amber-900/40 flex items-center gap-1">
              <Fire className="w-3.5 h-3.5" weight="fill" />
              <span>+20 XP مكافأة</span>
            </span>
          </div>
        </div>

        {/* Question Statement */}
        <div className="text-right">
          <BidiStatement
            as="p"
            text={question.statement}
            className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed font-content"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.options.map((opt, optIdx) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle =
              "bg-[#F8FAFC] dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 hover:border-indigo-400 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900";

            if (isAnswered) {
              if (opt.isCorrect) {
                btnStyle =
                  "bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 dark:border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold";
              } else if (isSelected && !opt.isCorrect) {
                btnStyle =
                  "bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 dark:border-rose-400 text-rose-900 dark:text-rose-200 font-bold";
              } else {
                btnStyle =
                  "opacity-40 bg-[#F8FAFC] dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500";
              }
            } else if (isSelected) {
              btnStyle =
                "bg-indigo-50/80 dark:bg-indigo-950/50 border-2 border-[#4F46E5] dark:border-indigo-500 text-zinc-900 dark:text-white shadow-2xs font-bold";
            }

            const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isAnswered}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm text-right flex items-start sm:items-center justify-between gap-3 transition-all ${btnStyle}`}
              >
                <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 sm:mt-0 transition-colors ${
                      isSelected
                        ? "bg-[#4F46E5] dark:bg-indigo-500 text-white shadow-xs"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {arabicLetters[optIdx] || "•"}
                  </span>
                  <div className="min-w-0 flex-1 leading-relaxed">
                    <BidiStatement as="span" text={opt.text} />
                  </div>
                </div>

                {isAnswered && opt.isCorrect && (
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" weight="fill" />
                )}
                {isAnswered && isSelected && !opt.isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 sm:mt-0" weight="fill" />
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
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95"
            >
              <Sparkle className="w-4 h-4" weight="bold" />
              <span>أكّد إجابتك واكسب XP</span>
            </button>
          </div>
        ) : (
          <div className="pt-3 space-y-3">
            {isCorrect ? (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-right flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" weight="fill" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">
                    صح يا بطل! برافو عليك (+20 XP لحسابك)
                  </span>
                  {question.explanation?.correctReason && (
                    <p className="text-xs text-zinc-900 dark:text-zinc-300 font-content leading-relaxed">
                      {question.explanation.correctReason}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60 text-right flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" weight="fill" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">
                    ولا يهمك، المهم نتعلم! الإجابة الصح هي: {correctOption?.text}
                  </span>
                  {question.explanation?.correctReason && (
                    <p className="text-xs text-zinc-900 dark:text-zinc-300 font-content leading-relaxed">
                      {question.explanation.correctReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Lesson link or Mistake link */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
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