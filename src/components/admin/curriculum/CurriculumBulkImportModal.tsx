"use client";

import { useState, useMemo } from "react";
import {
  UploadCloud,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { parseCurriculumText, ParsedCurriculumUnit } from "@/lib/curriculum-parser";
import type { Subject } from "./types";

interface CurriculumBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: { id: string; name: string }[];
  initialSubjectId?: string;
  onSuccess: (subjectId: string, createdUnits: any[]) => void;
}

const SAMPLE_OUTLINE = `الوحدة الأولى: القوى والحركة
- كمية التحرك والقصور الذاتي
- قانون نيوتن الثاني
- الكتلة والوزن
- تطبيقات على قانون نيوتن الثاني

الوحدة الثانية: الحركة الدائرية
- العجلة المركزية
- القوة الجاذبة المركزية
- أنواع القوى الجاذبة المركزية
- تطبيقات عملية على الحركة الدائرية

الوحدة الثالثة: الجاذبية الكونية والحركة الدائرية
- قانون الجذب العام لنيوتن
- شدة مجال الجاذبية
- السرعة المدارية للأقمار الاصطناعية`;

export function CurriculumBulkImportModal({
  isOpen,
  onClose,
  subjects,
  initialSubjectId,
  onSuccess,
}: CurriculumBulkImportModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || ""
  );
  const [rawText, setRawText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live parsing
  const parseResult = useMemo(() => {
    if (!rawText.trim()) return null;
    return parseCurriculumText(rawText);
  }, [rawText]);

  if (!isOpen) return null;

  const handleLoadSample = () => {
    setRawText(SAMPLE_OUTLINE);
    setErrorMsg(null);
  };

  const handleClear = () => {
    setRawText("");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      setErrorMsg("يرجى اختيار المادة الدراسية أولاً");
      return;
    }

    if (!parseResult || parseResult.totalUnits === 0) {
      setErrorMsg("لم يتم التعرف على أي وحدات دراسية صالحة للاستيراد");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/curriculum/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          units: parseResult.units,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل استيراد هيكل المنهج");
      }

      onSuccess(selectedSubjectId, data.units);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSubjectName = subjects.find((s) => s.id === selectedSubjectId)?.name || "المادة";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 space-y-5 text-right shadow-sm border border-[#E2E8F0] dark:border-[#334155] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#800020]/20 flex items-center justify-center text-[#800020]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <span>استيراد هيكل الوحدات والدروس دفعة واحدة</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#800020]/10 text-[#800020]">
                  سريع وتلقائي
                </span>
              </h3>
              <p className="text-[12px] sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                الصق خطة المنهج وسيتم إنشاء الوحدات وترتيب الدروس في قاعدة البيانات فوراً
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] text-[13px] font-bold flex items-center gap-2 border border-[#DC2626]/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Subject Selector */}
          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-1.5">
              المادة الدراسية المستهدفة *
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Paste Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-bold text-[#64748B] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#800020]" />
                <span>نص هيكل المنهج (الوحدات والدروس) *</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-[12px] font-bold text-[#800020] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تعبئة بنموذج تجريبي</span>
                </button>
                {rawText && (
                  <>
                    <span className="text-[#CBD5E1]">|</span>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-[12px] font-bold text-[#94A3B8] hover:text-[#DC2626] cursor-pointer"
                    >
                      مسح
                    </button>
                  </>
                )}
              </div>
            </div>

            <textarea
              required
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`الوحدة الأولى: اسم الوحدة
- اسم الدرس الأول
- اسم الدرس الثاني

الوحدة الثانية: اسم الوحدة
- اسم الدرس الأول
- اسم الدرس الثاني`}
              className="w-full p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-mono leading-relaxed text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            />
            <p className="text-[12px] text-[#94A3B8] mt-1">
              * يدعم التنسيق التلقائي: أسطر الوحدات تبدأ بـ "الوحدة" أو "الفصل" أو "الباب"، والدروس تبدأ بشرطة (-) أو أرقام (1.) أو مسافة بادئة.
            </p>
          </div>

          {/* Real-time Parse Summary & Live Preview */}
          {parseResult && parseResult.totalUnits > 0 && (
            <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-bold text-[#0F172A] dark:text-white">
                    معاينة الهيكل المستخرج لـ {activeSubjectName}:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] border border-[#800020]/20 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>{parseResult.totalUnits} وحدات</span>
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{parseResult.totalLessons} درس</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tree preview list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {parseResult.units.map((unit, uIdx) => (
                  <div
                    key={uIdx}
                    className="p-3 rounded-lg bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#0F172A] dark:text-white">
                      <span className="w-5 h-5 rounded-md bg-[#800020]/10 text-[#800020] flex items-center justify-center text-[11px]">
                        {unit.order}
                      </span>
                      <span>{unit.title}</span>
                      <span className="text-[11px] font-normal text-[#94A3B8] mr-auto">
                        ({unit.lessons.length} درس)
                      </span>
                    </div>

                    {unit.lessons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pr-7">
                        {unit.lessons.map((lesson, lIdx) => (
                          <span
                            key={lIdx}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1]"
                          >
                            <span className="text-[10px] text-[#94A3B8]">{lIdx + 1}.</span>
                            <span>{lesson.title}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !parseResult || parseResult.totalUnits === 0}
              className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جارٍ استيراد الهيكل وحفظ الوحدات...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    تأكيد استيراد ({parseResult?.totalUnits || 0} وحدات و {parseResult?.totalLessons || 0} درس)
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
