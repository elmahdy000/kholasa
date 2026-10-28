"use client";

import {
  BookOpen,
  MagnifyingGlass,
  X,
  Check,
  Copy,
} from "@phosphor-icons/react";
import { Definition } from "../types";

interface LessonDefinitionsSectionProps {
  definitions: Definition[];
  filteredDefinitions: Definition[];
  definitionSearch: string;
  copiedDefinition: string | null;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onCopyDefinition: (term: string, meaning: string) => void;
}

export function LessonDefinitionsSection({
  definitions,
  filteredDefinitions,
  definitionSearch,
  copiedDefinition,
  onSearchChange,
  onClearSearch,
  onCopyDefinition,
}: LessonDefinitionsSectionProps) {
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
                المحطة الثانية
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                2. التعريفات والمصطلحات المهمة
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              قاموس المصطلحات والمفاهيم العلمية الأساسية مع إمكانية البحث والنسخ السريع
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#059669]/40 transition-all flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0]/60 dark:border-[#334155]/60 pb-2.5">
                    <span className="font-bold text-[14px] sm:text-[15px] text-[#059669] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#059669]" />
                      <span>{item.term}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onCopyDefinition(item.term, item.meaning)}
                      className={`p-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1 transition-all ${
                        isCopied
                          ? "bg-[#059669] text-white"
                          : "text-[#64748B] dark:text-[#94A3B8] hover:bg-[#059669]/10 hover:text-[#059669]"
                      }`}
                      title="نسخ المصطلح والتعريف"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" weight="bold" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" weight="bold" />
                          <span className="hidden sm:inline">نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[13px] sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed font-content">
                    {item.meaning}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-[#64748B] rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
          لا توجد تعريفات تطابق بحثك حالياً...
        </div>
      )}
    </div>
  );
}
