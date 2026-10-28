"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  FileCode,
  X,
  ChevronDown,
  Download,
  File,
} from "lucide-react";
import { QuestionType, QuestionDifficulty } from "@/lib/question-parser";

interface FileUploadSectionProps {
  // Summary props
  gradeLabel: string;
  isLanguageSchool: boolean;
  trackLabel?: string;
  subjectName?: string;
  unitTitle?: string;
  scopeLabel: string;
  lessonTitle?: string;
  questionType: QuestionType;
  difficulty: QuestionDifficulty | "MIXED";

  // File state
  fileName: string | null;
  fileSize: number | null;
  isParsing: boolean;
  parseError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onExtract: () => void;
  onDownloadSample: () => void;

  // Secondary modes
  inputMode: "file" | "paste" | "csv";
  onInputModeChange: (mode: "file" | "paste" | "csv") => void;
  pastedText: string;
  onPastedTextChange: (text: string) => void;
  onDirectTextParse: () => void;
  onCsvFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadSection({
  gradeLabel,
  isLanguageSchool,
  trackLabel,
  subjectName,
  unitTitle,
  scopeLabel,
  lessonTitle,
  questionType,
  difficulty,
  fileName,
  fileSize,
  isParsing,
  parseError,
  fileInputRef,
  onFileSelect,
  onFileRemove,
  onExtract,
  onDownloadSample,
  inputMode,
  onInputModeChange,
  pastedText,
  onPastedTextChange,
  onDirectTextParse,
  onCsvFileUpload,
}: FileUploadSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSecondaryModes, setShowSecondaryModes] = useState(false);

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFile = e.target.files?.[0];
    if (chosenFile) {
      onFileSelect(chosenFile);
    }
  };

  const isDocx = fileName?.toLowerCase().endsWith(".docx");
  const isPdf = fileName?.toLowerCase().endsWith(".pdf");

  const questionTypeArabicLabel =
    questionType === "MCQ"
      ? "اختيار من متعدد (MCQ)"
      : questionType === "TRUE_FALSE"
      ? "صح أو خطأ"
      : "أسئلة مقالية";

  const difficultyArabicLabel =
    difficulty === "EASY"
      ? "سهل"
      : difficulty === "MEDIUM"
      ? "متوسط"
      : difficulty === "HARD"
      ? "متقدم"
      : "متنوع";

  // Validation readiness
  const hasSubject = Boolean(subjectName);
  const hasUnit = Boolean(unitTitle);
  const hasFile = Boolean(fileName) || (inputMode === "paste" && pastedText.trim().length > 10);
  const canExtract = hasSubject && hasUnit && hasFile && !isParsing;

  return (
    <div className="space-y-4">
      {/* 1. Main File Dropzone & Summary */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#800020]/10 dark:bg-[#800020]/25 text-[#800020] dark:text-[#FB7185] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                رفع مستند الأسئلة
              </h2>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                يدعم ملفات Word (.docx) و PDF (.pdf) المنسقة
              </p>
            </div>
          </div>

          <button
            onClick={onDownloadSample}
            type="button"
            className="text-[12px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>نموذج استرشادي</span>
          </button>
        </div>

        {parseError && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-[13px] font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Primary Upload / File Summary Component */}
        {inputMode === "file" && (
          <>
            <input
              type="file"
              id="document-file-input"
              ref={fileInputRef}
              accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleInputChange}
              className="hidden"
            />

            {!fileName ? (
              // Empty Dropzone
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragOver
                    ? "border-[#800020] bg-[#800020]/5 scale-[0.99]"
                    : "border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 hover:border-[#800020] hover:bg-[#800020]/5"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-[#800020] dark:text-[#FB7185] flex items-center justify-center shadow-sm">
                  {isParsing ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#800020]" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <p className="text-[13px] font-bold text-slate-800 dark:text-white">
                    اسحب ملفك هنا أو اختر ملفًا من جهازك
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    الصيغ المعتمدة: Word (.docx) أو PDF (.pdf) • بحد أقصى 15 ميجابايت
                  </p>
                </div>
              </div>
            ) : (
              // Compact File Summary Card
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#800020]/10 dark:bg-[#800020]/25 text-[#800020] dark:text-[#FB7185] flex items-center justify-center shrink-0">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                        {fileName}
                      </p>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                        {isDocx ? "Word (.docx)" : isPdf ? "PDF (.pdf)" : "مستند"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatFileSize(fileSize)}</span>
                      <span>•</span>
                      <span className="text-[#059669] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        جاهز للاستخراج
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:border-[#800020] hover:text-[#800020] bg-white dark:bg-slate-800 transition-all cursor-pointer"
                  >
                    تغيير
                  </button>
                  <button
                    type="button"
                    onClick={onFileRemove}
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:border-red-200 flex items-center justify-center bg-white dark:bg-slate-800 transition-all cursor-pointer"
                    title="إزالة الملف"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Secondary Modes (Direct Paste or CSV) */}
        {inputMode === "paste" && (
          <div className="space-y-3">
            <textarea
              rows={6}
              dir={isLanguageSchool ? "ltr" : "rtl"}
              value={pastedText}
              onChange={(e) => onPastedTextChange(e.target.value)}
              placeholder={
                isLanguageSchool
                  ? "Paste your English formatted questions text here (e.g. Q1: Statement... A) Opt1 B) Opt2* Answer: B)..."
                  : "الصق نصوص الأسئلة المنسقة هنا (مثال: س1: ما هو المفهوم؟ أ) خيار 1 ب) خيار 2* الإجابة: ب)..."
              }
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[13px] font-mono focus:outline-none focus:border-[#800020]"
            />
          </div>
        )}

        {inputMode === "csv" && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={onCsvFileUpload}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#800020] file:text-white hover:file:bg-[#66001A]"
            />
          </div>
        )}

        {/* Toggle for other import modes */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowSecondaryModes((prev) => !prev)}
            className="text-[12px] font-bold text-slate-500 dark:text-slate-400 hover:text-[#800020] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>طرق استيراد أخرى (لصق نصوص مباشر / ملف CSV)</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showSecondaryModes ? "rotate-180" : ""}`}
            />
          </button>

          {showSecondaryModes && (
            <div className="mt-2.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => onInputModeChange("file")}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  inputMode === "file"
                    ? "bg-white dark:bg-[#1E293B] text-[#800020] shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>ملف Word / PDF</span>
              </button>
              <button
                type="button"
                onClick={() => onInputModeChange("paste")}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  inputMode === "paste"
                    ? "bg-white dark:bg-[#1E293B] text-[#800020] shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>لصق نصوص</span>
              </button>
              <button
                type="button"
                onClick={() => onInputModeChange("csv")}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  inputMode === "csv"
                    ? "bg-white dark:bg-[#1E293B] text-[#800020] shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Smart Live Import Summary Panel */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3.5">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800/80">
          ملخص الاستيراد المباشر
        </h3>

        <div className="space-y-2 text-[12px]">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>الصف والنظام:</span>
            <span className="font-bold text-slate-900 dark:text-white">{gradeLabel}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>فئة المدرسة:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {isLanguageSchool ? "لغات (English)" : "مدارس عربي"}
            </span>
          </div>

          {trackLabel && (
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>المسار:</span>
              <span className="font-bold text-slate-900 dark:text-white">{trackLabel}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>المادة المقررة:</span>
            {subjectName ? (
              <span className="font-bold text-[#800020] dark:text-[#FB7185] truncate max-w-[200px]">
                {subjectName}
              </span>
            ) : (
              <span className="font-bold text-amber-600 dark:text-amber-400">يرجى الاختيار</span>
            )}
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>الوحدة الدراسية:</span>
            {unitTitle ? (
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                {unitTitle}
              </span>
            ) : (
              <span className="font-bold text-amber-600 dark:text-amber-400">يرجى الاختيار</span>
            )}
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>نطاق الإلحاق:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {scopeLabel === "LESSON"
                ? lessonTitle || "درس محدد (يرجى الاختيار)"
                : "الوحدة الدراسية ككل"}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>نوع السؤال:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {questionTypeArabicLabel}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>مستوى الصعوبة:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {difficultyArabicLabel}
            </span>
          </div>
        </div>

        {/* Primary Extraction Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={inputMode === "paste" ? onDirectTextParse : onExtract}
            disabled={!canExtract}
            className="w-full h-11 rounded-xl bg-[#800020] hover:bg-[#66001A] disabled:opacity-50 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري استخراج الأسئلة من المستند...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>استخراج الأسئلة</span>
              </>
            )}
          </button>

          {!canExtract && !isParsing && (
            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
              {!hasFile
                ? "ارفع مستند الأسئلة أولاً لتتمكن من الاستخراج"
                : !hasSubject || !hasUnit
                ? "حدد المادة والوحدة الدراسية لتفعيل الاستخراج"
                : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
