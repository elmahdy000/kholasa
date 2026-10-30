"use client";

import { useState, useRef } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  ClipboardList,
  Upload,
  Search,
  Sparkles,
  FileText,
  AlertCircle,
} from "lucide-react";
import type { DefinitionItem } from "./types";

interface LessonDefinitionsTabProps {
  definitions: DefinitionItem[];
  setDefinitions: React.Dispatch<React.SetStateAction<DefinitionItem[]>>;
  onAddDefinition: (term: string, meaning: string) => void;
  onRemoveDefinition: (index: number) => void;
  onUpdateDefinition: (index: number, term: string, meaning: string) => void;
}

export function LessonDefinitionsTab({
  definitions,
  setDefinitions,
  onAddDefinition,
  onRemoveDefinition,
  onUpdateDefinition,
}: LessonDefinitionsTabProps) {
  // Manual single input state
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");

  // Editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTerm, setEditTerm] = useState("");
  const [editMeaning, setEditMeaning] = useState("");

  // Bulk paste state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single Add handler
  const handleSingleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !meaning.trim()) return;
    onAddDefinition(term.trim(), meaning.trim());
    setTerm("");
    setMeaning("");
  };

  // Bulk Paste Parser
  const handleBulkParseAndAdd = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split("\n");
    const newItems: DefinitionItem[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Split by ":" or "-" or "="
      const match = line.match(/^([^:\-=\t]+)[:\-=\t](.+)$/);
      if (match && match[1] && match[2]) {
        const parsedTerm = match[1].trim();
        const parsedMeaning = match[2].trim();
        if (parsedTerm && parsedMeaning) {
          newItems.push({ term: parsedTerm, meaning: parsedMeaning });
        }
      } else {
        // Fallback: If line contains a comma or dash
        const parts = line.split(/[–—]/);
        if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
          newItems.push({ term: parts[0].trim(), meaning: parts.slice(1).join("–").trim() });
        }
      }
    }

    if (newItems.length > 0) {
      setDefinitions((prev) => [...prev, ...newItems]);
      setBulkText("");
      setShowBulkModal(false);
    } else {
      alert("يرجى لصق المصطلحات بالصيغة: المصطلح: التعريف في كل سطر");
    }
  };

  // Text File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Try JSON first
      try {
        const parsedJson = JSON.parse(content);
        if (Array.isArray(parsedJson)) {
          const valid = parsedJson
            .filter((item) => item && (item.term || item.name) && (item.meaning || item.definition))
            .map((item) => ({
              term: String(item.term || item.name).trim(),
              meaning: String(item.meaning || item.definition).trim(),
            }));
          if (valid.length > 0) {
            setDefinitions((prev) => [...prev, ...valid]);
            return;
          }
        }
      } catch {}

      // Fallback to text line parser
      setBulkText(content);
      setShowBulkModal(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Copy helper
  const handleCopy = (t: string, m: string) => {
    navigator.clipboard.writeText(`${t}: ${m}`);
    setCopiedTerm(t);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  const filtered = definitions.filter(
    (d) =>
      d.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                المفاهيم والمصطلحات والتعريفات المهمة
              </h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono font-bold border border-emerald-200 dark:border-emerald-800">
                {definitions.length} مصطلح
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              تظهر للطالب في تبويب مخصص كبطاقات سريعة للحفظ والمراجعة مع ميزة البحث والنسخ.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="h-10 px-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>لصق مجمع (Copy & Paste)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.json,.csv"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>رفع من ملف (.txt / .json)</span>
          </button>
        </div>
      </div>

      {/* Manual Single Add Form */}
      <form
        onSubmit={handleSingleAdd}
        className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs space-y-4"
      >
        <span className="text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#059669]" />
          <span>إضافة مصطلح جديد (يدوياً أو بالنسخ واللصق)</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              المصطلح / المفهوم أو القانون *
            </label>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="مثال: قانون أوم"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-white outline-none focus:border-[#059669]"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              التعريف، الشرح، أو نص القانون *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="مثال: تتناسب شدة التيار المار في موصل طردياً مع فرق الجهد بين طرفيه عند ثبوت درجة الحرارة."
                className="flex-1 h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs text-[#0F172A] dark:text-white outline-none focus:border-[#059669]"
              />
              <button
                type="submit"
                disabled={!term.trim() || !meaning.trim()}
                className="h-11 px-5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Definitions Cards List */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            قائمة المصطلحات المضافة للدرس ({filtered.length}):
          </span>

          {definitions.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في المصطلحات..."
                className="w-full h-9 pr-9 pl-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-xs text-[#0F172A] dark:text-white outline-none focus:border-[#059669]"
              />
            </div>
          )}
        </div>

        {definitions.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-2">
            <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto opacity-60" />
            <h5 className="text-xs font-bold text-[#0F172A] dark:text-white">
              لم تتم إضافة أي مصطلحات أو تعريفات لهذا الدرس بعد
            </h5>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              استخدم نموذج الإضافة أعلاه أو اضغط على "لصق مجمع" لإدخال التعريفات بنسخ ولصق سريع.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-xs font-bold text-[#94A3B8] rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
            لا توجد مصطلحات مطابقة للبحث
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((item, idx) => {
              const realIndex = definitions.indexOf(item);
              const isEditing = editingIndex === realIndex;

              return (
                <div
                  key={realIndex}
                  className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-2xs hover:border-[#059669]/40 transition-all flex flex-col justify-between gap-3"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTerm}
                        onChange={(e) => setEditTerm(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-[#059669] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold"
                      />
                      <textarea
                        value={editMeaning}
                        onChange={(e) => setEditMeaning(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 rounded-lg border border-[#059669] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs leading-relaxed resize-none"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (editTerm.trim() && editMeaning.trim()) {
                              onUpdateDefinition(realIndex, editTerm.trim(), editMeaning.trim());
                              setEditingIndex(null);
                            }
                          }}
                          className="px-3 py-1 rounded-md bg-[#059669] text-white text-[11px] font-bold cursor-pointer"
                        >
                          حفظ التعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="px-3 py-1 rounded-md border text-[11px] text-[#64748B] cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#059669] dark:text-[#34D399] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#059669]" />
                            {item.term}
                          </span>
                          <span className="text-[10px] font-mono text-[#94A3B8]">#{realIndex + 1}</span>
                        </div>
                        <p className="text-xs text-[#0F172A] dark:text-white leading-relaxed whitespace-pre-wrap">
                          {item.meaning}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] dark:border-[#1E293B]">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.term, item.meaning)}
                          className="text-[11px] font-bold text-[#64748B] hover:text-[#059669] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedTerm === item.term ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIndex(realIndex);
                              setEditTerm(item.term);
                              setEditMeaning(item.meaning);
                            }}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-[#64748B] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveDefinition(realIndex)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bulk Paste Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans text-right">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#059669]" />
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  لصق مجمع للمصطلحات والتعريفات (Smart Bulk Paste)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <span className="font-bold block">💡 طريقة الاستخدام:</span>
                <p>
                  انسخ تعريفاتك من أي ملف Word أو ملخص، والصقها هنا. اكتب في كل سطر:{" "}
                  <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono font-bold">
                    المصطلح: التعريف
                  </code>
                </p>
              </div>

              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={10}
                placeholder={`قانون أوم: تتناسب شدة التيار المار في موصل طردياً مع فرق الجهد عند ثبوت درجة الحرارة.\nالسرعة المتجهة: الإزاحة المقطوعة مقسومة على الزمن الكلي.\nالتسارع: معدل التغير في السرعة المتجهة بالنسبة للزمن.`}
                className="w-full p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-white leading-relaxed resize-none outline-none focus:border-[#059669]"
              />
            </div>

            <div className="p-4 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748B]">
                {bulkText.split("\n").filter((l) => l.trim().length > 0).length} سطر جاهز للتحويل
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#CBD5E1] dark:border-[#334155] text-xs font-bold text-[#64748B] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleBulkParseAndAdd}
                  disabled={!bulkText.trim()}
                  className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  تحويل وإضافة إلى البطاقات ⚡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
