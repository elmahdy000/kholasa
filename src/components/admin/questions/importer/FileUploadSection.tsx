"use client";

import React from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

interface FileUploadSectionProps {
  inputMode: "file" | "paste" | "csv";
  onInputModeChange: (mode: "file" | "paste" | "csv") => void;
  isLanguageSchool: boolean;
  fileName: string | null;
  isParsing: boolean;
  parseError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pastedText: string;
  onPastedTextChange: (text: string) => void;
  onDirectTextParse: () => void;
  onCsvFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadSection({
  inputMode,
  onInputModeChange,
  isLanguageSchool,
  fileName,
  isParsing,
  parseError,
  fileInputRef,
  onFileUpload,
  pastedText,
  onPastedTextChange,
  onDirectTextParse,
  onCsvFileUpload,
}: FileUploadSectionProps) {
  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0]/90 dark:border-[#334155]/90 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#800020] text-white flex items-center justify-center text-[13px] font-bold shadow-sm">
            3
          </div>
          <h3 className="text-[14px] font-bold text-[#0F172A] dark:text-white">
            9. رفع ملف Word (.docx) أو PDF (.pdf)
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#0F172A] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onInputModeChange("file")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 ${
              inputMode === "file"
                ? "bg-white dark:bg-[#1E293B] text-[#800020] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[#800020]" />
            <span>ملف Word / PDF</span>
          </button>
          <button
            type="button"
            onClick={() => onInputModeChange("paste")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 ${
              inputMode === "paste"
                ? "bg-white dark:bg-[#1E293B] text-[#800020] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#800020]" />
            <span>لصق نصوص</span>
          </button>
          <button
            type="button"
            onClick={() => onInputModeChange("csv")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-2 ${
              inputMode === "csv"
                ? "bg-white dark:bg-[#1E293B] text-[#059669] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#059669]" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {parseError && (
        <div className="p-4 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#DC2626]/20 text-[13px] font-bold text-[#DC2626] dark:text-[#F87171] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Word & PDF Upload Zone */}
      {inputMode === "file" && (
        <div className="border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020] dark:hover:border-[#E11D48] rounded-xl p-8 sm:p-10 text-center transition-all bg-[#F8FAFC] dark:bg-[#0F172A]/40">
          <input
            type="file"
            id="document-file-input"
            ref={fileInputRef}
            accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={onFileUpload}
            className="hidden"
          />
          <label
            htmlFor="document-file-input"
            className="cursor-pointer flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-16 h-16 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center shadow-sm">
              {isParsing ? (
                <Loader2 className="w-9 h-9 animate-spin text-[#800020]" />
              ) : (
                <Upload className="w-9 h-9" />
              )}
            </div>
            <div>
              <span className="text-sm font-bold text-[#0F172A] dark:text-white block">
                {isParsing
                  ? "جاري تحليل واستخراج الأسئلة من المستند..."
                  : fileName
                  ? `تم اختيار الملف: ${fileName} (اضغط للتغيير)`
                  : "اسحب ملف Word (.docx) أو PDF (.pdf) هنا أو اضغط للتصفح"}
              </span>
              <span className="text-[12px] text-[#94A3B8] mt-1 block">
                {isLanguageSchool
                  ? "Language Schools: Preserves original English phrasing, formatting, choices, and explanations."
                  : "مدارس عربي: يحافظ على النصوص والتفسيرات العربية مع عزل المصطلحات الإنجليزية تلقائياً."}
              </span>
            </div>
          </label>
        </div>
      )}

      {/* Direct Paste Area */}
      {inputMode === "paste" && (
        <div className="space-y-3">
          <textarea
            rows={8}
            dir={isLanguageSchool ? "ltr" : "rtl"}
            value={pastedText}
            onChange={(e) => onPastedTextChange(e.target.value)}
            placeholder={
              isLanguageSchool
                ? "Paste question text here in English...\n\nExample:\nQ1: What is a Bit?\nA) Binary Digit*\nB) Byte\nC) Gigahertz\nAnswer: A\nExplanation: Basic binary storage unit."
                : "انسخ نصوص الأسئلة والصقها هنا...\n\nمثال:\nس1: ما هو البت؟\nأ) وحدة ثنائية*\nب) بايت\nج) جيجاهرتز\nالإجابة: أ\nالتفسير: أصغر وحدة تخزين في الحاسوب."
            }
            className="w-full p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[13px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
          />
          <button
            type="button"
            onClick={onDirectTextParse}
            disabled={!pastedText.trim() || isParsing}
            className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] disabled:opacity-50 text-white text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التحليل...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>استخراج الأسئلة من النص</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* CSV Zone */}
      {inputMode === "csv" && (
        <div className="border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] hover:border-[#059669] rounded-xl p-8 text-center transition-all bg-[#F8FAFC] dark:bg-[#0F172A]/40">
          <input
            type="file"
            id="csv-file-input"
            accept=".csv,text/csv"
            onChange={onCsvFileUpload}
            className="hidden"
          />
          <label
            htmlFor="csv-file-input"
            className="cursor-pointer flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-14 h-14 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#0F172A] dark:text-white block">
                {fileName ? fileName : "اضغط لاختيار ملف CSV"}
              </span>
              <span className="text-[12px] text-[#94A3B8] mt-1 block">
                يقبل ملفات CSV بتنسيق UTF-8
              </span>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
