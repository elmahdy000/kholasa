"use client";

import { useState } from "react";
import { BookOpenCheck, Plus, Search, Trash2 } from "lucide-react";
import type {
  ArabicEditorQuestionRecord,
  ArabicVocabularyItem,
} from "./types";

interface ArabicVocabularyTabProps {
  items: ArabicVocabularyItem[];
  questions: ArabicEditorQuestionRecord[];
  onChangeItems: (next: ArabicVocabularyItem[]) => void;
}

export function ArabicVocabularyTab({
  items,
  questions,
  onChangeItems,
}: ArabicVocabularyTabProps) {
  const [search, setSearch] = useState("");

  const filtered = items.filter((it) => {
    const q = search.trim();
    if (!q) return true;
    return it.word.includes(q) || it.meaning.includes(q);
  });

  const updateItem = (id: string, patch: Partial<ArabicVocabularyItem>) => {
    onChangeItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const addWord = () => {
    onChangeItems([
      {
        id: `vocab-${Date.now().toString(36)}`,
        word: "",
        meaning: "",
        contextSentence: "",
        explanationEgyptian: "",
        nuanceDiff: "",
        examTrick: "",
        linkedQuestionId: "",
        source: "",
      },
      ...items,
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-[#FBF8F1] dark:bg-[#1E293B] border border-[#E5DEC9] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-[#0F2744] dark:text-white flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-[#0F5132]" />
            <span>المفردات والدلالة السياقية المستخلصة من المنهج ({items.length})</span>
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            تعديل الكلمات ومعانيها السياقية والفرق الدلالي وتركة السؤال والربط بالسؤال التدريبي دون استعارة حقول البرمجة.
          </p>
        </div>

        <button
          type="button"
          onClick={addWord}
          className="px-3.5 py-2 rounded-xl bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-extrabold flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة مفردة</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بكلمة أو معنى سياقي..."
          className="w-full pr-9 pl-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-[#0F5132] dark:text-emerald-300 tabular-nums">
                المفردة #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => onChangeItems(items.filter((x) => x.id !== item.id))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                title="حذف المفردة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  الكلمة *
                </label>
                <input
                  type="text"
                  value={item.word}
                  onChange={(e) => updateItem(item.id, { word: e.target.value })}
                  placeholder="مثال: مستعصية"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-black"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  المعنى في السياق *
                </label>
                <input
                  type="text"
                  value={item.meaning}
                  onChange={(e) => updateItem(item.id, { meaning: e.target.value })}
                  placeholder="مثال: صعبة الشفاء والعلاج"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  المصدر (كتاب/تقييم)
                </label>
                <input
                  type="text"
                  value={item.source || ""}
                  onChange={(e) => updateItem(item.id, { source: e.target.value })}
                  placeholder="مثال: الكتاب ص12 / التقييم ص4"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  الجملة من النص
                </label>
                <input
                  type="text"
                  value={item.contextSentence || ""}
                  onChange={(e) =>
                    updateItem(item.id, { contextSentence: e.target.value })
                  }
                  placeholder="مثال: علاج أمراض مستعصية"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  الفرق بينها وبين المعاني المتشابهة
                </label>
                <input
                  type="text"
                  value={item.nuanceDiff || ""}
                  onChange={(e) => updateItem(item.id, { nuanceDiff: e.target.value })}
                  placeholder="مثال: تختلف عن «مزمنة» التي تدل على طول المدة فقط"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] mb-1">
                  الشرح بالمصري
                </label>
                <textarea
                  rows={2}
                  value={item.explanationEgyptian || ""}
                  onChange={(e) =>
                    updateItem(item.id, { explanationEgyptian: e.target.value })
                  }
                  placeholder="شرح مبسط للفرق في السياق..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs leading-relaxed"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#475569] mb-1">
                    تركة السؤال
                  </label>
                  <input
                    type="text"
                    value={item.examTrick || ""}
                    onChange={(e) => updateItem(item.id, { examTrick: e.target.value })}
                    placeholder="تنبيه الاختيارات المضللة في الامتحان..."
                    className="w-full px-3 py-1.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#475569] mb-1">
                    السؤال التدريبي المرتبط بها
                  </label>
                  <select
                    value={item.linkedQuestionId || ""}
                    onChange={(e) =>
                      updateItem(item.id, { linkedQuestionId: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-xs"
                  >
                    <option value="">بدون ربط بسؤال محدد</option>
                    {questions.map((q) => {
                      const code = q.externalKey || q.id;
                      return (
                        <option key={q.id} value={code}>
                          {code}: {q.statement.slice(0, 65)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

