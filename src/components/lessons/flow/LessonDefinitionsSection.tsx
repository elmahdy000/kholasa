"use client";

import { useState } from "react";
import {
  BookOpen,
  MagnifyingGlass,
  X,
  Check,
  Copy,
  Cards,
  Translate,
} from "@phosphor-icons/react";
import { Definition } from "../types";
import { TranslationToggle } from "@/components/ui/TranslationToggle";
import { FormattedDefinitionView } from "@/components/ui/FormattedDefinitionView";
import { splitExplanation } from "@/components/ui/QuestionExplanationBox";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface LessonDefinitionsSectionProps {
  definitions: Definition[];
  filteredDefinitions: Definition[];
  definitionSearch: string;
  copiedDefinition: string | null;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onCopyDefinition: (term: string, meaning: string) => void;
  onStartFlashcards?: () => void;
}

export function LessonDefinitionsSection({
  definitions,
  filteredDefinitions,
  definitionSearch,
  copiedDefinition,
  onSearchChange,
  onClearSearch,
  onCopyDefinition,
  onStartFlashcards,
}: LessonDefinitionsSectionProps) {
  const [translatedMap, setTranslatedMap] = useState<Record<number, boolean>>({});
  const [isAllTranslated, setIsAllTranslated] = useState(false);

  const toggleTranslation = (idx: number) => {
    setTranslatedMap((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleAll = () => {
    const nextState = !isAllTranslated;
    setIsAllTranslated(nextState);
    const newMap: Record<number, boolean> = {};
    definitions.forEach((_, idx) => {
      newMap[idx] = nextState;
    });
    setTranslatedMap(newMap);
  };

  const hasAnyTranslation = definitions.some((d) => {
    if (d.translation && d.translation.trim().length > 0) return true;
    const s = splitExplanation(d.meaning);
    return Boolean(s.translation && s.translation.trim().length > 0);
  });

  return (
    <div id="section-definitions" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="p-6 rounded-2xl bg-[#059669]/10 border border-[#059669]/25 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-sm">
            <BookOpen className="w-6 h-6" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669] bg-[#059669]/15 px-2 py-0.5 rounded-md">
                قاموس المفاهيم
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                التعريفات والمصطلحات المهمة
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              أهم المفاهيم اللي محتاج تفهمها وتحفظها كويس، تقدر تبحث فيهم وتترجم أو تنسخ أي تعريف بضغطة واحدة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasAnyTranslation && (
            <button
              type="button"
              onClick={toggleAll}
              className={`px-3 py-1.5 rounded-xl border text-[13px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAllTranslated
                  ? "bg-[#059669] text-white border-[#059669] shadow-xs"
                  : "bg-white dark:bg-[#1E293B] border-[#059669]/30 text-[#059669] hover:bg-[#059669]/10"
              }`}
              title={isAllTranslated ? "إخفاء كل الترجمات" : "عرض ترجمة جميع المصطلحات"}
            >
              <Translate className="w-4 h-4" />
              <span>{isAllTranslated ? "إخفاء كل الترجمات" : "ترجمة جميع المصطلحات"}</span>
            </button>
          )}

          {onStartFlashcards && (
            <button
              type="button"
              onClick={onStartFlashcards}
              className="px-3.5 py-2 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              title="سمّع لنفسك مفاهيم ومصطلحات الدرس بالكروت"
            >
              <Cards className="w-4 h-4" weight="bold" />
              <span>تسميع الدرس</span>
            </button>
          )}
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#059669]/20 text-[#059669] text-[13px] font-bold font-mono">
            {definitions.length} مصطلح أساسي
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#64748B]">
          <MagnifyingGlass className="w-4 h-4" weight="bold" />
        </div>
        <input
          type="text"
          value={definitionSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث بالاسم أو المعنى داخل مصطلحات الدرس..."
          className="w-full pr-10 pl-4 py-3 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[13px] sm:text-sm text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#059669] transition-colors"
        />
        {definitionSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
          >
            <X className="w-4 h-4" weight="bold" />
          </button>
        )}
      </div>

      {/* Definitions Grid */}
      {filteredDefinitions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDefinitions.map((item, idx) => {
            const isCopied = copiedDefinition === item.term;
            const split = splitExplanation(item.meaning);
            const cleanMeaning = item.translation
              ? item.meaning
              : split.translation
              ? split.primary
              : item.meaning;
            const effectiveTranslation = (item.translation || split.translation || "").trim();
            const hasTranslation = effectiveTranslation.length > 0;
            const isTranslated = isAllTranslated || Boolean(translatedMap[idx]);

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#059669]/40 transition-all flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2 border-b border-[#E2E8F0]/60 dark:border-[#334155]/60 pb-2.5">
                    <div className="font-bold text-[14px] sm:text-[15px] text-[#059669] flex items-start gap-2 min-w-0 flex-1 leading-snug break-words">
                      <span className="w-2 h-2 rounded-full bg-[#059669] shrink-0 mt-1.5" />
                      <BidiStatement as="span" text={item.term} className="break-words" />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasTranslation && (
                        <TranslationToggle
                          size="xs"
                          isTranslated={isTranslated}
                          onToggle={() => toggleTranslation(idx)}
                        />
                      )}
                      <button
                        onClick={() => onCopyDefinition(item.term, cleanMeaning)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#059669] hover:bg-[#059669]/10 transition-colors"
                        title="نسخ المصطلح والتعريف"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-[#059669]" weight="bold" />
                        ) : (
                          <Copy className="w-4 h-4" weight="bold" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Definition Body with Formatted Points / Paragraphs */}
                  <FormattedDefinitionView
                    text={cleanMeaning}
                    variant="card"
                    colorScheme="emerald"
                  />

                  {/* Collapsible Arabic Translation */}
                  {isTranslated && hasTranslation && (
                    <div
                      dir="rtl"
                      className="mt-3 p-3 sm:p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-800/40 text-right animate-in fade-in slide-in-from-top-1 duration-200 space-y-1.5 shadow-2xs"
                    >
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 inline-block">
                        الترجمة العربية للتعريف
                      </span>
                      <FormattedDefinitionView
                        text={effectiveTranslation}
                        variant="translation"
                        colorScheme="emerald"
                        forceDir="rtl"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
            {definitionSearch
              ? `لا توجد نتائج مطابقة لبحثك عن "${definitionSearch}"`
              : "لا توجد تعريفات مضافة لهذا الدرس حتى الآن"}
          </p>
        </div>
      )}
    </div>
  );
}
