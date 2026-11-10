"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  GitBranch,
  Layers,
  PenTool,
  Sparkles,
  Workflow,
} from "lucide-react";
import type { ArabicVisualization } from "./types";

interface ArabicSectionVisualizerProps {
  visualization?: ArabicVisualization | null;
}

const WRITING_KIND_LABELS: Record<string, string> = {
  summary: "التلخيص",
  argumentative_paragraph: "فقرة حجاجية",
  critical_article: "مقالة نقدية",
  interview: "مقابلة قصيرة",
};

export function ArabicSectionVisualizer({
  visualization,
}: ArabicSectionVisualizerProps) {
  const [hiddenMeanings, setHiddenMeanings] = useState<Record<number, boolean>>(
    {}
  );
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (!visualization || !visualization.type) return null;

  const { type } = visualization;

  if (type === "timeline" && Array.isArray(visualization.nodes)) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
        <p className="text-xs font-extrabold text-[#0F5132] dark:text-[#E9AD32] flex items-center gap-1.5">
          <Workflow className="w-4 h-4" />
          <span>تسلسل الأفكار الرئيسية</span>
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
          {visualization.nodes.map((node, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-white flex items-center gap-2 shadow-2xs">
                <span className="w-6 h-6 rounded-full bg-[#0F5132] text-white text-[11px] font-black flex items-center justify-center shrink-0 tabular-nums">
                  {i + 1}
                </span>
                <span>{node}</span>
              </div>
              {i < visualization.nodes!.length - 1 && (
                <ArrowLeft className="hidden sm:block w-4 h-4 text-[#800B34] dark:text-[#E9AD32] shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "comparison" && (visualization.left || visualization.right)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visualization.left && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/50 space-y-2.5">
            <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
              {visualization.left.title}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-[13px] font-medium text-emerald-950 dark:text-emerald-100 list-disc pr-4 leading-relaxed">
              {visualization.left.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {visualization.right && (
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/50 space-y-2.5">
            <h4 className="text-sm font-black text-rose-900 dark:text-rose-200">
              {visualization.right.title}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-[13px] font-medium text-rose-950 dark:text-rose-100 list-disc pr-4 leading-relaxed">
              {visualization.right.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (type === "two_cards" && Array.isArray(visualization.cards)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visualization.cards.map((card, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2.5"
          >
            <h4 className="text-sm font-black text-[#091B40] dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#800B34] dark:bg-[#E9AD32] shrink-0" />
              <span>{card.title}</span>
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-[13px] text-[#334155] dark:text-[#CBD5E1] font-medium pr-4 list-disc leading-relaxed">
              {(card.items || []).map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (type === "three_cards" && Array.isArray(visualization.cards)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {visualization.cards.map((card, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-1.5 shadow-2xs"
          >
            {card.label ? (
              <>
                <span className="text-[11px] font-bold text-[#800B34] dark:text-[#E9AD32] block">
                  {card.label}
                </span>
                <p className="text-sm font-black text-[#091B40] dark:text-white leading-relaxed">
                  {card.answer}
                </p>
              </>
            ) : (
              <>
                <h4 className="text-sm font-black text-[#091B40] dark:text-white">
                  {card.title}
                </h4>
                <ul className="space-y-1 text-xs text-[#334155] dark:text-[#CBD5E1] font-medium pr-4 list-disc leading-relaxed">
                  {(card.items || []).map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (type === "word_cards" && Array.isArray(visualization.cards)) {
    const allHidden = visualization.cards.every((_, i) => hiddenMeanings[i]);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-extrabold text-[#800B34] dark:text-[#E9AD32] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>بطاقات المفردات والدلالة السياقية ({visualization.cards.length})</span>
          </span>
          <button
            type="button"
            onClick={() => {
              const nextState: Record<number, boolean> = {};
              if (!allHidden) {
                visualization.cards!.forEach((_, idx) => {
                  nextState[idx] = true;
                });
              }
              setHiddenMeanings(nextState);
            }}
            className="min-h-[36px] px-3 py-1 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A6E] bg-white dark:bg-[#071737] text-xs font-bold text-[#091B40] dark:text-white inline-flex items-center gap-1.5 cursor-pointer hover:border-[#800B34]"
          >
            {allHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{allHidden ? "إظهار كل المعاني" : "اختبر نفسك (إخفاء المعاني)"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visualization.cards.map((card, i) => {
            const isHidden = Boolean(hiddenMeanings[i]);
            return (
              <div
                key={i}
                onClick={() =>
                  setHiddenMeanings((prev) => ({ ...prev, [i]: !prev[i] }))
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setHiddenMeanings((prev) => ({ ...prev, [i]: !prev[i] }));
                  }
                }}
                className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] hover:border-[#800B34]/60 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm sm:text-base font-black text-[#091B40] dark:text-white">
                    {card.word}
                  </span>
                  {card.source && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-[#536681] dark:text-[#94A3B8]">
                      {card.source}
                    </span>
                  )}
                </div>
                {isHidden ? (
                  <p className="text-xs font-bold text-[#800B34] dark:text-[#E9AD32]">
                    اضغط لعرض المعنى السياقي ←
                  </p>
                ) : (
                  <p className="text-xs sm:text-[13px] font-semibold text-[#17834B] dark:text-[#34D399] leading-relaxed">
                    {card.meaning}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "mind_map" && visualization.root) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-4">
        <div className="flex items-center justify-center">
          <div className="px-5 py-3 rounded-2xl bg-[#800B34] text-white text-sm font-black text-center shadow-sm flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#E9AD32] shrink-0" />
            <span>{visualization.root}</span>
          </div>
        </div>
        {Array.isArray(visualization.branches) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {visualization.branches.map((branch, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-white flex items-center gap-2.5"
              >
                <span className="w-6 h-6 rounded-lg bg-[#091B40] dark:bg-[#E9AD32] text-white dark:text-[#091B40] text-[11px] font-black flex items-center justify-center shrink-0 tabular-nums">
                  {idx + 1}
                </span>
                <span>{branch}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if ((type === "flow" || type === "workflow") && Array.isArray(visualization.steps)) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-3">
        <p className="text-xs font-extrabold text-[#091B40] dark:text-[#E9AD32] flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#800B34] dark:text-[#E9AD32]" />
          <span>خطوات التطبيق بالترتيب</span>
        </p>
        <div className="space-y-2">
          {visualization.steps.map((step, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] flex items-center gap-3 text-xs sm:text-[13px] font-bold text-[#091B40] dark:text-white"
            >
              <span className="w-6 h-6 rounded-full bg-[#800B34]/10 text-[#800B34] dark:bg-[#E9AD32]/20 dark:text-[#E9AD32] text-xs font-black flex items-center justify-center shrink-0 tabular-nums">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "strategy_cards" && Array.isArray(visualization.items)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visualization.items.map((item, i) => {
          const obj = typeof item === "string" ? { name: item, evidence: "" } : item;
          return (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-1.5"
            >
              <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#800B34]/10 text-[#800B34] dark:text-[#FB7185] text-xs font-black">
                {obj.name}
              </span>
              {obj.evidence && (
                <p className="text-xs sm:text-[13px] text-[#334155] dark:text-[#CBD5E1] font-medium leading-relaxed">
                  {obj.evidence}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (type === "worked_examples" && Array.isArray(visualization.examples)) {
    return (
      <div className="space-y-2.5">
        {visualization.examples.map((ex, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-1.5"
          >
            <p className="text-sm font-black text-[#091B40] dark:text-white leading-relaxed">
              &laquo;{ex.sentence}&raquo;
            </p>
            <p className="text-xs sm:text-[13px] font-bold text-[#17834B] dark:text-[#34D399] leading-relaxed">
              الإعراب والسبب: {ex.answer}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (type === "writing_recipe" && Array.isArray(visualization.tasks)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {visualization.tasks.map((task, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2.5"
          >
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#800B34] dark:text-[#E9AD32]">
                <PenTool className="w-3.5 h-3.5" />
                <span>{WRITING_KIND_LABELS[task.kind] || task.kind}</span>
              </span>
              <p className="text-xs font-bold text-[#091B40] dark:text-white">
                {task.requirement}
              </p>
            </div>
            <ul className="space-y-1 text-xs text-[#334155] dark:text-[#CBD5E1] font-medium pr-4 list-disc">
              {task.structure.map((part, j) => (
                <li key={j}>{part}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (type === "review_checklist" && Array.isArray(visualization.items)) {
    return (
      <div className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#071737] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2.5">
        <p className="text-xs font-extrabold text-[#091B40] dark:text-[#E9AD32]">
          قائمة مراجعة إتقان المهارات:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {visualization.items.map((item, i) => {
            const label = typeof item === "string" ? item : item.name || "";
            const isChecked = Boolean(checkedItems[i]);
            return (
              <button
                key={i}
                type="button"
                onClick={() =>
                  setCheckedItems((prev) => ({ ...prev, [i]: !prev[i] }))
                }
                className={`p-3 rounded-xl border text-right text-xs sm:text-[13px] font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  isChecked
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                    : "bg-white dark:bg-[#0D214D] border-[#E2E8F0] dark:border-[#1E3A6E] text-[#091B40] dark:text-white"
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    isChecked ? "text-emerald-600" : "text-[#94A3B8]"
                  }`}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
