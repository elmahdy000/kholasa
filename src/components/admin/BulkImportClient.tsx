"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, ArrowRight } from "lucide-react";
import type { BulkImportClientProps, ParsedQuestion } from "./bulk-import/types";
import { handleDownloadSample, parseCSV } from "./bulk-import/csv-parser";
import { ScopeSelector } from "./bulk-import/ScopeSelector";
import { ImportModeTabs } from "./bulk-import/ImportModeTabs";
import { ParsedQuestionsPreview } from "./bulk-import/ParsedQuestionsPreview";
import { ImportSuccessBanner } from "./bulk-import/ImportSuccessBanner";

export type { BulkImportClientProps, Subject, ParsedQuestion } from "./bulk-import/types";

export function BulkImportClient({ subjects }: BulkImportClientProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ""
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pastedText, setPastedText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSubmitError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseCSV(content, selectedSubjectId, selectedUnitId);
        setParsedQuestions(parsed);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handlePasteParse = () => {
    setSubmitError(null);
    if (!pastedText.trim()) return;
    const parsed = parseCSV(pastedText, selectedSubjectId, selectedUnitId);
    setParsedQuestions(parsed);
  };

  const handleCommitImport = async () => {
    const validQuestions = parsedQuestions.filter((q) => q.isValid);
    if (validQuestions.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = validQuestions.map((q) => ({
        ...q,
        subjectId: selectedSubjectId,
        unitId: selectedUnitId || undefined,
      }));

      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل استيراد الأسئلة");
      }

      setSubmitSuccess(data.importedCount);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("حدث خطأ غير متوقع");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
        <div>
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-2 text-[13px] font-bold text-[#64748B] hover:text-[#800020] mb-2 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لبنك الأسئلة</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
            استيراد الأسئلة الجماعي (Bulk Import CSV)
          </h1>
          <p className="text-[13px] sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
            ارفع ملف CSV يحتوي على مئات الأسئلة دفعة واحدة مع المعاينة والتحقق اللحظي من الأخطاء
          </p>
        </div>

        {/* Download Sample Button */}
        <button
          onClick={handleDownloadSample}
          className="h-11 px-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#0F172A] dark:text-white hover:border-[#800020] flex items-center gap-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-[#800020]" />
          <span>تحميل قالب CSV الاسترشادي</span>
        </button>
      </div>

      {/* Success Notification */}
      {submitSuccess !== null ? (
        <ImportSuccessBanner
          submitSuccess={submitSuccess}
          onReset={() => {
            setSubmitSuccess(null);
            setParsedQuestions([]);
            setPastedText("");
            setFileName(null);
          }}
        />
      ) : (
        <>
          {/* Target Subject & Unit Selector */}
          <ScopeSelector
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            setSelectedSubjectId={setSelectedSubjectId}
            selectedUnitId={selectedUnitId}
            setSelectedUnitId={setSelectedUnitId}
          />

          {/* Import Modes: File Upload or Direct Paste */}
          <ImportModeTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            fileName={fileName}
            onFileUpload={handleFileUpload}
            pastedText={pastedText}
            setPastedText={setPastedText}
            onPasteParse={handlePasteParse}
          />

          {/* Parsed Preview Table & Actions */}
          <ParsedQuestionsPreview
            parsedQuestions={parsedQuestions}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onCommitImport={handleCommitImport}
          />
        </>
      )}
    </div>
  );
}
