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
import { useToast } from "@/components/ui/Toast";

interface LessonDefinitionsTabProps {
  definitions: DefinitionItem[];
  setDefinitions: React.Dispatch<React.SetStateAction<DefinitionItem[]>>;
  onAddDefinition: (term: string, meaning: string, translation?: string) => void;
  onRemoveDefinition: (index: number) => void;
  onUpdateDefinition: (index: number, term: string, meaning: string, translation?: string) => void;
}

function cleanTerm(t: string): string {
  return t
    .replace(/^\d+[\.\-\)]\s*/, "")
    .replace(/^[•\-\*]\s*/, "")
    .replace(/^\*\*(.+?)\*\*$/, "$1")
    .trim();
}

function cleanMeaning(m: string): string {
  let res = m.trim();
  if (res.startsWith('"') && res.endsWith('"') && res.length > 2) {
    res = res.slice(1, -1).trim();
  }
  return res;
}

export function parseDefinitionsText(text: string): DefinitionItem[] {
  if (!text || !text.trim()) return [];

  const raw = text.trim();

  // Helper to detect translation header lines (e.g. الترجمة:, الترجمة العربية:, Translation:, Arabic Translation:)
  const isTranslationHeader = (str: string) =>
    /^(?:(?:الترجمة\s*العربية|ترجمة\s*المصطلح|ترجمة\s*التعريف|الترجمة|Translation|Arabic\s*Translation)\s*[:：\-]?)/i.test(
      str.trim()
    );

  const extractTranslation = (str: string): string | null => {
    const match = str
      .trim()
      .match(
        /^(?:(?:الترجمة\s*العربية|ترجمة\s*المصطلح|ترجمة\s*التعريف|الترجمة|Translation|Arabic\s*Translation)\s*[:：\-]?)\s*(.+)$/i
      );
    return match ? match[1].trim() : null;
  };

  // Strategy 0: Direct JSON array pasted (with flexible translation key mappings)
  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsedJson = JSON.parse(raw);
      if (Array.isArray(parsedJson)) {
        const valid = parsedJson
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              (item.term || item.name || item.title) &&
              (item.meaning || item.definition || item.desc)
          )
          .map((item) => {
            const rawTrans =
              item.translation ||
              item.translationArabic ||
              item.arabicTranslation ||
              item.trans ||
              item.arabic ||
              item.meaningTranslation;
            return {
              term: cleanTerm(String(item.term || item.name || item.title)),
              meaning: cleanMeaning(String(item.meaning || item.definition || item.desc)),
              translation: rawTrans ? String(rawTrans).trim() : undefined,
            };
          });
        if (valid.length > 0) return valid;
      }
    } catch { }
  }

  const rawLines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Strategy 1: Smart Block & Multi-line Parsing with robust translation handling
  const results: DefinitionItem[] = [];
  let currentTerm = "";
  let currentMeaning = "";
  let currentTranslation = "";

  const commitCurrent = () => {
    if (currentTerm && currentMeaning) {
      results.push({
        term: cleanTerm(currentTerm),
        meaning: cleanMeaning(currentMeaning),
        translation: currentTranslation.trim() || undefined,
      });
      currentTerm = "";
      currentMeaning = "";
      currentTranslation = "";
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // Check if line is an explicit translation line
    const trans = extractTranslation(line);
    if (trans) {
      currentTranslation = trans;
      commitCurrent();
      continue;
    }

    // Check if line has inline translation via || or ::
    if (line.includes("||") || line.includes("::")) {
      commitCurrent();
      const delimiter = line.includes("||") ? "||" : "::";
      const parts = line.split(delimiter).map((p) => p.trim());
      if (parts.length >= 2) {
        let pTerm = parts[0];
        let pMeaning = parts[1];
        let pTrans = parts[2] || undefined;

        if (pTerm.includes(":")) {
          const cIdx = pTerm.indexOf(":");
          pMeaning = pTerm.slice(cIdx + 1).trim();
          pTerm = pTerm.slice(0, cIdx).trim();
          pTrans = parts[1];
        } else if (pTerm.includes(" - ")) {
          const dIdx = pTerm.indexOf(" - ");
          pMeaning = pTerm.slice(dIdx + 3).trim();
          pTerm = pTerm.slice(0, dIdx).trim();
          pTrans = parts[1];
        }

        results.push({
          term: cleanTerm(pTerm),
          meaning: cleanMeaning(pMeaning),
          translation: pTrans ? cleanMeaning(pTrans) : undefined,
        });
        continue;
      }
    }

    // Check if line has "Term: Meaning" on the same line
    const colonMatch = line.match(/^([^:\n]{2,80})\s*[:：]\s*(.+)$/);
    if (colonMatch && !isTranslationHeader(line)) {
      commitCurrent();

      const nextLine = rawLines[i + 1] || "";
      const nextTrans = extractTranslation(nextLine);

      if (nextTrans) {
        // Line is "Term: Meaning", and the very next line is its translation!
        currentTerm = colonMatch[1];
        currentMeaning = colonMatch[2];
        continue;
      } else {
        // Check if the meaning itself ends with an embedded "(الترجمة: ...)"
        let meaningText = colonMatch[2];
        let embeddedTrans: string | undefined = undefined;
        const inlineTransMatch = meaningText.match(
          /\((?:(?:الترجمة\s*العربية|الترجمة|ترجمة\s*المصطلح|Translation|Arabic\s*Translation)\s*[:：\-]?)\s*([^)]+)\)\s*$/i
        );
        if (inlineTransMatch) {
          embeddedTrans = inlineTransMatch[1].trim();
          meaningText = meaningText
            .replace(
              /\((?:(?:الترجمة\s*العربية|الترجمة|ترجمة\s*المصطلح|Translation|Arabic\s*Translation)\s*[:：\-]?)\s*([^)]+)\)\s*$/i,
              ""
            )
            .trim();
        }

        results.push({
          term: cleanTerm(colonMatch[1]),
          meaning: cleanMeaning(meaningText),
          translation: embeddedTrans,
        });
        continue;
      }
    }

    // Check if line has "Term - Meaning" on the same line
    const dashMatch = line.match(/^([^\-–—\n]{2,80})\s+[-–—]\s+(.+)$/);
    if (dashMatch && !isTranslationHeader(line)) {
      commitCurrent();

      const nextLine = rawLines[i + 1] || "";
      const nextTrans = extractTranslation(nextLine);

      if (nextTrans) {
        currentTerm = dashMatch[1];
        currentMeaning = dashMatch[2];
        continue;
      } else {
        results.push({
          term: cleanTerm(dashMatch[1]),
          meaning: cleanMeaning(dashMatch[2]),
          translation: undefined,
        });
        continue;
      }
    }

    // Fallback: Line is part of multi-line block (term line, or meaning line)
    if (!currentTerm) {
      currentTerm = line;
    } else if (!currentMeaning) {
      currentMeaning = line;
      const nextLine = rawLines[i + 1] || "";
      if (!isTranslationHeader(nextLine)) {
        commitCurrent();
      }
    } else {
      currentMeaning += " " + line;
    }
  }

  commitCurrent();

  if (results.length > 0) return results;

  return [];
}

export function LessonDefinitionsTab({
  // Toast notification
  definitions,
  setDefinitions,
  onAddDefinition,
  onRemoveDefinition,
  onUpdateDefinition,
}: LessonDefinitionsTabProps) {
  const { toast } = useToast();

  // Manual single input state
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [translation, setTranslation] = useState("");

  // Editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTerm, setEditTerm] = useState("");
  const [editMeaning, setEditMeaning] = useState("");
  const [editTranslation, setEditTranslation] = useState("");

  // Bulk paste state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single Add handler
  const handleSingleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !meaning.trim()) return;
    onAddDefinition(term.trim(), meaning.trim(), translation.trim() || undefined);
    setTerm("");
    setMeaning("");
    setTranslation("");
  };

  // Bulk Paste Parser
  const handleBulkParseAndAdd = () => {
    if (!bulkText.trim()) return;

    const newItems = parseDefinitionsText(bulkText);

    if (newItems.length > 0) {
      if (replaceExisting) {
        setDefinitions(newItems);
        toast.success(`تم استبدال المصطلحات وإضافة ${newItems.length} مصطلح بنجاح`);
      } else {
        setDefinitions((prev) => [...prev, ...newItems]);
        toast.success(`تمت إضافة ${newItems.length} مصطلح بنجاح`);
      }
      setBulkText("");
      setShowBulkModal(false);
      setReplaceExisting(false);
    } else {
      toast.warning("لم نتمكن من استخراج أي مصطلحات. يرجى التأكد من التنسيق (المصطلح: التعريف أو كل مصطلح في فقرة).");
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
              translation: item.translation ? String(item.translation).trim() : undefined,
            }));
          if (valid.length > 0) {
            setDefinitions((prev) => [...prev, ...valid]);
            toast.success(`تم استيراد ${valid.length} مصطلح من ملف JSON بنجاح`);
            return;
          }
        }
      } catch { }

      // Try smart text parser directly
      const parsed = parseDefinitionsText(content);
      if (parsed.length > 0) {
        setDefinitions((prev) => [...prev, ...parsed]);
        toast.success(`تم استيراد ${parsed.length} مصطلح من الملف بنجاح`);
        return;
      }

      // Fallback to text line parser modal
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
              placeholder="مثال: Algorithm أو خوارزمية"
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold text-[#0F172A] dark:text-white outline-none focus:border-[#059669]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              التعريف، الشرح، أو نص القانون *
            </label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="نص التعريف باللغة الإنجليزية أو العربية..."
              className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs text-[#0F172A] dark:text-white outline-none focus:border-[#059669]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
              الترجمة العربية للتعريف (اختياري - لمدارس اللغات)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                dir="rtl"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="الترجمة العربية التي تظهر عند الطلب..."
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
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`هل أنت متأكد من رغبتك في حذف جميع المصطلحات (${definitions.length} مصطلح)؟`)) {
                    setDefinitions([]);
                    toast.info("تم حذف جميع المصطلحات بنجاح");
                  }
                }}
                className="h-9 px-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/70 dark:bg-red-950/20 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الكل ({definitions.length})</span>
              </button>

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
                        placeholder="المصطلح..."
                        className="w-full h-9 px-3 rounded-lg border border-[#059669] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-bold"
                      />
                      <textarea
                        value={editMeaning}
                        onChange={(e) => setEditMeaning(e.target.value)}
                        placeholder="التعريف..."
                        rows={2}
                        className="w-full p-2.5 rounded-lg border border-[#059669] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs leading-relaxed resize-none"
                      />
                      <input
                        type="text"
                        dir="rtl"
                        value={editTranslation}
                        onChange={(e) => setEditTranslation(e.target.value)}
                        placeholder="الترجمة العربية (اختياري)..."
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-[#1E293B] text-xs"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (editTerm.trim() && editMeaning.trim()) {
                              onUpdateDefinition(realIndex, editTerm.trim(), editMeaning.trim(), editTranslation.trim() || undefined);
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
                        <p className="text-xs text-[#0F172A] dark:text-white leading-relaxed whitespace-pre-wrap font-content">
                          {item.meaning}
                        </p>
                        {item.translation && (
                          <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-right" dir="rtl">
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">الترجمة العربية:</span>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium font-content">
                              {item.translation}
                            </p>
                          </div>
                        )}
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
                              setEditTranslation(item.translation || "");
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
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1.5 leading-relaxed">
                <span className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>الصيغ المدعومة بذكاء تلقائياً:</span>
                </span>
                <p>
                  1. <b>سطر واحد:</b> <code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono font-bold">المصطلح: التعريف || الترجمة العربية</code>
                </p>
                <p>
                  2. <b>فقرات متعددة (ChatGPT / Word):</b> اسم المصطلح في سطر، والشرح في سطر، والترجمة في سطر يبدأ بـ <code className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono font-bold">الترجمة: ...</code> (يتم تجاهل الترقيم وعناوين الأقسام تلقائياً).
                </p>
              </div>

              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={11}
                placeholder={`مثال 1 (سطر واحد):\nMoore's Law: Transistors double every 2 years. || يتضاعف عدد الترانزستورات كل عامين.\nCloud Computing: IT delivered over the Internet. || الحوسبة السحابية.\n\nأو مثال 2 (فقرات):\n1. Moore's Law\nThe empirical observation that transistors double every two years.\nالترجمة: الملاحظة التجريبية التي تنص على تضاعف الترانزستورات كل سنتين.`}
                className="w-full p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs font-mono text-[#0F172A] dark:text-white leading-relaxed resize-none outline-none focus:border-[#059669]"
              />

              {definitions.length > 0 && (
                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={replaceExisting}
                      onChange={(e) => setReplaceExisting(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>استبدال المصطلحات الموجودة حالياً ({definitions.length} مصطلح) بالبيانات الجديدة</span>
                  </label>
                </div>
              )}
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
