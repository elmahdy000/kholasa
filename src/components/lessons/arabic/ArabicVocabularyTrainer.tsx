"use client";

import { useState, useMemo } from "react";
import {
  BookOpenCheck,
  Eye,
  EyeOff,
  HelpCircle,
  Scale,
  Search,
  Sparkles,
} from "lucide-react";
import type { ArabicWordCard } from "@/lib/arabic-curriculum";

interface ArabicVocabularyTrainerProps {
  cards: ArabicWordCard[];
  onPracticeQuestion?: (questionId: string) => void;
}

export function ArabicVocabularyTrainer({
  cards,
  onPracticeQuestion,
}: ArabicVocabularyTrainerProps) {
  const [quizMode, setQuizMode] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    const q = searchTerm.trim();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.word.includes(q) ||
        c.meaning.includes(q) ||
        (c.contextSentence && c.contextSentence.includes(q)) ||
        (c.nuanceDiff && c.nuanceDiff.includes(q))
    );
  }, [cards, searchTerm]);

  const toggleReveal = (idx: number) => {
    setRevealedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-black text-[#800B34] dark:text-[#E9AD32] flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32] shrink-0" />
            <span>المفردات والدلالة السياقية ({cards.length} مفردة من النص)</span>
          </h4>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            اضغط على وضع الاختبار لإخفاء المعاني واختبار فهمك للمعنى السياقي قبل فحص الإجابة
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setQuizMode((v) => !v);
            setRevealedCards({});
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 min-h-[40px] shrink-0 ${
            quizMode
              ? "bg-[#800B34] text-white"
              : "bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-[#091B40] dark:text-white hover:border-[#800B34]"
          }`}
        >
          {quizMode ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>إظهار كل المعاني</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>اختبر حفظك للمعاني</span>
            </>
          )}
        </button>
      </div>

      {cards.length > 6 && (
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بكلمة أو معنى أو فرق دلالي..."
            className="w-full pr-9 pl-3 py-2 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-medium text-[#091B40] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#800B34]"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((card, i) => {
          const isHidden = quizMode && !revealedCards[i];
          return (
            <div
              key={`${card.id || card.word}-${i}`}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-2xs flex flex-col justify-between gap-2.5 min-w-0"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-black text-[#800B34] dark:text-[#E9AD32] break-words">
                    {card.word}
                  </span>
                  {card.source && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F7F9FC] dark:bg-[#132C60] text-[#536681] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#1E3A6E] shrink-0">
                      {card.source}
                    </span>
                  )}
                </div>

                {card.contextSentence && (
                  <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1] italic leading-relaxed bg-slate-50 dark:bg-[#081633] px-2.5 py-1.5 rounded-lg">
                    «{card.contextSentence}»
                  </p>
                )}

                {isHidden ? (
                  <button
                    type="button"
                    onClick={() => toggleReveal(i)}
                    className="w-full mt-1 py-2 rounded-xl border border-dashed border-[#800B34]/40 text-xs font-extrabold text-[#800B34] dark:text-[#E9AD32] hover:bg-[#800B34]/5 min-h-[38px]"
                  >
                    اضغط لكشف المعنى السياقي
                  </button>
                ) : (
                  <div className="pt-1.5 border-t border-dashed border-[#E2E8F0] dark:border-[#1E3A6E] space-y-1.5">
                    <p className="text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-white leading-relaxed">
                      <span className="text-[#64748B] font-medium ml-1">المعنى في السياق:</span>
                      {card.meaning}
                    </p>
                    {card.explanationEgyptian && (
                      <p className="text-[11px] font-medium text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                        {card.explanationEgyptian}
                      </p>
                    )}
                    {card.nuanceDiff && (
                      <p className="text-[11px] font-bold text-[#091B40] dark:text-[#E9AD32] bg-[#F7F9FC] dark:bg-[#081633] border border-[#E2E8F0] dark:border-[#1E3A6E] p-2 rounded-lg flex items-start gap-1.5 leading-relaxed">
                        <Scale className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          <strong>الفرق الدلالي: </strong>
                          {card.nuanceDiff}
                        </span>
                      </p>
                    )}
                    {card.examTrick && (
                      <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-start gap-1">
                        <Sparkles className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{card.examTrick}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {card.linkedQuestionId && onPracticeQuestion && (
                <button
                  type="button"
                  onClick={() => onPracticeQuestion(card.linkedQuestionId!)}
                  className="text-[11px] font-extrabold text-[#800B34] dark:text-[#E9AD32] hover:underline flex items-center gap-1 pt-1 self-start"
                >
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>تدرب على سؤال لهذه المفردة ({card.linkedQuestionId})</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
