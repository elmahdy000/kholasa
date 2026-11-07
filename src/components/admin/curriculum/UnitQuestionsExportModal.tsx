"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  FileJson,
  Layers,
  HelpCircle,
  CheckCircle2,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  Code2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Unit } from "./types";

interface UnitQuestionsExportModalProps {
  isOpen: boolean;
  unit: Unit | null;
  subjectName: string;
  onClose: () => void;
}

type QuestionTypeFilter = "ALL" | "MCQ" | "TRUE_FALSE" | "ESSAY";

interface ExportResponse {
  success: boolean;
  filename: string;
  data: {
    exportMetadata: {
      exportedAt: string;
      unit: {
        id: string;
        title: string;
        order: number;
        lessonsCount: number;
      };
      subject: {
        id?: string;
        name: string;
        grade?: string;
        system?: string;
      };
      filtersApplied: {
        type: string;
      };
      counts: {
        selectedTypeCount: number;
        breakdown: {
          ALL: number;
          MCQ: number;
          TRUE_FALSE: number;
          ESSAY: number;
        };
      };
    };
    questions: Array<{
      index: number;
      id: string;
      type: string;
      difficulty: string;
      statement: string;
      options: Array<{
        order: number;
        text: string;
        isCorrect: boolean;
      }>;
      explanation: {
        concept?: string;
        correctReason?: string;
      } | null;
      rubric?: {
        maxScore: number;
        modelAnswer: string;
      } | null;
    }>;
  };
}

export function UnitQuestionsExportModal({
  isOpen,
  unit,
  subjectName,
  onClose,
}: UnitQuestionsExportModalProps) {
  const [selectedType, setSelectedType] = useState<QuestionTypeFilter>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exportData, setExportData] = useState<ExportResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  // Fetch export data whenever modal opens or selected type changes
  const fetchQuestions = useCallback(
    async (type: QuestionTypeFilter) => {
      if (!unit) return;
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(
          `/api/admin/units/${unit.id}/export-questions?type=${type}`
        );
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "فشل تحميل أسئلة الوحدة");
        }

        setExportData(data);
      } catch (err: any) {
        console.error("Export fetch error:", err);
        setErrorMsg(err.message || "حدث خطأ أثناء جلب أسئلة الوحدة");
      } finally {
        setIsLoading(false);
      }
    },
    [unit]
  );

  useEffect(() => {
    if (isOpen && unit) {
      setSelectedType("ALL");
      setCopied(false);
      setShowJsonPreview(false);
      fetchQuestions("ALL");
    } else {
      setExportData(null);
    }
  }, [isOpen, unit, fetchQuestions]);

  const handleTypeChange = (newType: QuestionTypeFilter) => {
    setSelectedType(newType);
    setCopied(false);
    fetchQuestions(newType);
  };

  // Direct Browser Download of the JSON file
  const handleDownload = () => {
    if (!exportData || !unit) return;

    const jsonString = JSON.stringify(exportData.data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportData.filename || `${unit.title}_questions.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy Formatted JSON to clipboard
  const handleCopy = async () => {
    if (!exportData) return;

    try {
      const jsonString = JSON.stringify(exportData.data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  if (!isOpen || !unit) return null;

  const breakdown = exportData?.data?.exportMetadata?.counts?.breakdown || {
    ALL: 0,
    MCQ: 0,
    TRUE_FALSE: 0,
    ESSAY: 0,
  };

  const totalQuestions = breakdown.ALL;
  const currentCount =
    selectedType === "ALL"
      ? breakdown.ALL
      : breakdown[selectedType] || 0;

  const typeCards: Array<{
    id: QuestionTypeFilter;
    label: string;
    sublabel: string;
    icon: any;
    count: number;
    color: string;
  }> = [
    {
      id: "ALL",
      label: "جميع أنواع الأسئلة",
      sublabel: "تصدير شامل لجميع الأسئلة",
      icon: Layers,
      count: breakdown.ALL,
      color: "text-[#800020] dark:text-[#FB7185] bg-[#800020]/10 border-[#800020]/25",
    },
    {
      id: "MCQ",
      label: "اختيار من متعدد (MCQ)",
      sublabel: "أسئلة الخيارات المتعددة فقط",
      icon: HelpCircle,
      count: breakdown.MCQ,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25",
    },
    {
      id: "TRUE_FALSE",
      label: "صح أم خطأ (True / False)",
      sublabel: "أسئلة الصواب والخطأ فقط",
      icon: CheckCircle2,
      count: breakdown.TRUE_FALSE,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    },
    {
      id: "ESSAY",
      label: "أسئلة مقالية (Essay)",
      sublabel: "الأسئلة المقالية ونموذج الإجابة",
      icon: FileText,
      count: breakdown.ESSAY,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/25",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs font-sans text-right animate-in fade-in duration-150"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#1E293B]/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <FileJson className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  تصدير أسئلة الوحدة (JSON)
                </span>
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                  • مقارنة ومراجعة
                </span>
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white leading-tight break-words mt-1">
                {unit.title}
              </h3>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-tight mt-0.5">
                المادة: <span className="font-semibold text-[#0F172A] dark:text-slate-200">{subjectName}</span>
                {unit.lessons.length > 0 && ` • (${unit.lessons.length} دروس)`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="إغلاق (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Explanation Alert */}
          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-[#0F172A] dark:text-slate-200 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">
                تصدير مهيأ للمقارنة الدقيقة (Clean Diffable JSON):
              </p>
              <p className="text-[#64748B] dark:text-slate-300">
                يتم تصدير الأسئلة بترتيب أكاديمي ثابت ومفتاح موحد لكل سؤال (نص السؤال، الخيارات مع الإجابة الصحيحة، التفسير التعليمي، ونموذج إجابة المقالي) لتسهيل المقارنة (Diff) بين النسخ أو المراجعة الخارجية.
              </p>
            </div>
          </div>

          {/* Question Type Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[#0F172A] dark:text-white flex items-center justify-between">
              <span>اختر نوع الأسئلة المراد تصديرها:</span>
              <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                إجمالي أسئلة الوحدة: {totalQuestions}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {typeCards.map((card) => {
                const isSelected = selectedType === card.id;
                const Icon = card.icon;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleTypeChange(card.id)}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start justify-between gap-3 cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-[#059669]/10 border-[#059669] ring-2 ring-[#059669]/20 shadow-xs"
                        : "bg-white dark:bg-[#1E293B]/70 border-[#E2E8F0] dark:border-[#334155] hover:border-[#059669]/40"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${card.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-xs font-bold block leading-tight ${
                            isSelected
                              ? "text-[#059669] dark:text-[#34D399]"
                              : "text-[#0F172A] dark:text-white"
                          }`}
                        >
                          {card.label}
                        </span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-tight block mt-0.5">
                          {card.sublabel}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                        isSelected
                          ? "bg-[#059669] text-white border-[#059669]"
                          : card.count > 0
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          : "bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-dashed border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {card.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status / Loading / Empty */}
          {isLoading && (
            <div className="p-8 rounded-xl bg-slate-50 dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155] text-center flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#059669]" />
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                جاري استخراج وتجهيز أسئلة الوحدة بصيغة JSON...
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-700 dark:text-red-300 flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isLoading && currentCount === 0 && !errorMsg && (
            <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                لا توجد أسئلة مسجلة من هذا النوع ({selectedType}) في هذه الوحدة حتى الآن.
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                يمكنك اختيار نوع آخر، أو استيراد أسئلة جديدة لهذه الوحدة عبر زر "أسئلة الوحدة".
              </p>
            </div>
          )}

          {/* Live JSON Preview Toggle */}
          {!isLoading && currentCount > 0 && exportData && (
            <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowJsonPreview((prev) => !prev)}
                className="w-full px-4 py-2.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>معاينة بنية ملف الـ JSON المصدّر ({currentCount} سؤال)</span>
                </div>
                {showJsonPreview ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showJsonPreview && (
                <div className="p-3 border-t border-[#E2E8F0] dark:border-[#334155] bg-slate-900 text-slate-100 text-xs font-mono max-h-56 overflow-y-auto scrollbar-thin text-left dir-ltr">
                  <pre className="whitespace-pre-wrap leading-relaxed break-all">
                    {JSON.stringify(
                      {
                        exportMetadata: exportData.data.exportMetadata,
                        questionsSample: exportData.data.questions.slice(0, 2),
                        note:
                          exportData.data.questions.length > 2
                            ? `... plus ${exportData.data.questions.length - 2} more questions`
                            : undefined,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#1E293B]/70">
          <div className="text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2">
            <span>الملف المصدّر:</span>
            <span className="font-mono font-bold text-[#0F172A] dark:text-white max-w-[220px] truncate" dir="ltr">
              {exportData?.filename || `${unit.title}_questions.json`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={isLoading || currentCount === 0 || !exportData}
              className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#334155] text-[#0F172A] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="نسخ محتوى الـ JSON للحافظة للمقارنة الفورية"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#64748B]" />
                  <span>نسخ JSON</span>
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isLoading || currentCount === 0 || !exportData}
              className="h-10 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف JSON ({currentCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
