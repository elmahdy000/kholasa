"use client";

import { useState, useRef, useMemo } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  Trash2,
  Edit3,
  Layers,
  Search,
  Filter,
  ShieldCheck,
  Copy,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
  Plus,
} from "lucide-react";
import type { UnitInfo } from "./types";
import type {
  ParsedQuestion,
  QuestionType,
  QuestionDifficulty,
  QuestionReviewStatus,
} from "@/lib/question-parser";

interface QuestionImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  unitInfo: UnitInfo;
  onImportSuccess: () => void;
}

export function QuestionImportWizard({
  isOpen,
  onClose,
  lessonId,
  unitInfo,
  onImportSuccess,
}: QuestionImportWizardProps) {
  // Stepper state: 1 = Settings, 2 = Upload & Analyze, 3 = Full Review, 4 = Final Commit
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Stage 1: Settings
  const [allowedTypes, setAllowedTypes] = useState<QuestionType[]>([
    "MCQ",
    "TRUE_FALSE",
    "ESSAY",
  ]);
  const [strategy, setStrategy] = useState<"AUTO" | "MANUAL_REVIEW" | "FORCED">("AUTO");
  const [forcedDifficulty, setForcedDifficulty] = useState<QuestionDifficulty>("MEDIUM");

  // Stage 2: Upload / Paste
  const [inputMode, setInputMode] = useState<"FILE" | "PASTE">("FILE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stage 3: Staged Questions (Temporary Staging Area)
  const [stagedQuestions, setStagedQuestions] = useState<ParsedQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | QuestionReviewStatus | "DUPLICATES">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | QuestionType>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | QuestionDifficulty>("ALL");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Stage 4: Commit State
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [commitSuccess, setCommitSuccess] = useState(false);

  // Reset or close modal
  const handleClose = () => {
    if (stagedQuestions.length > 0 && !commitSuccess) {
      if (!confirm("هل تريد إغلاق معالج الاستيراد؟ سيتم فقد أي تعديلات قيد المراجعة لم يتم حفظها.")) {
        return;
      }
    }
    // Reset state
    setCurrentStep(1);
    setSelectedFile(null);
    setPasteText("");
    setStagedQuestions([]);
    setAnalysisError(null);
    setCommitError(null);
    setCommitSuccess(false);
    onClose();
  };

  // Toggle allowed type in settings
  const toggleAllowedType = (type: QuestionType) => {
    setAllowedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Stage 2: Process file or text into staging
  const handleStartAnalysis = async () => {
    setAnalysisError(null);

    if (inputMode === "FILE" && !selectedFile) {
      setAnalysisError("يرجى اختيار ملف Word (.docx) أو PDF أولاً");
      return;
    }
    if (inputMode === "PASTE" && !pasteText.trim()) {
      setAnalysisError("يرجى لصق نص الأسئلة أولاً");
      return;
    }

    setIsAnalyzing(true);
    try {
      let res: Response;
      if (inputMode === "FILE" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("strategy", strategy);
        formData.append("allowedTypes", JSON.stringify(allowedTypes));
        if (strategy === "FORCED") {
          formData.append("difficulty", forcedDifficulty);
        }
        if (unitInfo.schoolCategory) {
          formData.append("schoolCategory", unitInfo.schoolCategory);
        }

        res = await fetch("/api/admin/questions/parse-docx", {
          method: "POST",
          body: formData,
        });
      } else {
        const payload = {
          text: pasteText.trim(),
          strategy,
          allowedTypes,
          difficulty: strategy === "FORCED" ? forcedDifficulty : undefined,
          schoolCategory: unitInfo.schoolCategory,
        };
        res = await fetch("/api/admin/questions/parse-docx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تحليل الملف أو النصوص المستوردة.");
      }

      const questions: ParsedQuestion[] = data.questions || [];
      if (questions.length === 0) {
        throw new Error("لم يتم العثور على أي أسئلة صالحة في المستند. يرجى مراجعة التنسيق والترقيم.");
      }

      // Check against allowed types: mark unallowed types as EXCLUDED with reason
      const processed: ParsedQuestion[] = questions.map((q) => {
        let currentStatus: QuestionReviewStatus = q.reviewStatus || "PENDING";
        const validationNotes = [...(q.validationNotes || [])];

        if (!allowedTypes.includes(q.type)) {
          currentStatus = "EXCLUDED";
          validationNotes.push(`تم استبعاد السؤال لأن نوعه (${q.type}) غير مدرج في إعدادات الاستيراد`);
        }

        return {
          ...q,
          reviewStatus: currentStatus,
          validationNotes,
        };
      });

      setStagedQuestions(processed);
      if (processed.length > 0) {
        setExpandedQuestionId(processed[0].id);
      }
      setCurrentStep(3); // Move to Stage 3: Full Review
    } catch (err: any) {
      setAnalysisError(err.message || "حدث خطأ غير متوقع أثناء معالجة المستند.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Stage 3: Question update helper
  const updateStagedQuestion = (id: string, updates: Partial<ParsedQuestion>) => {
    setStagedQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const updated = { ...q, ...updates };

        // Re-validate validity
        let isValid = true;
        const notes: string[] = [];

        if (!updated.statement.trim()) {
          isValid = false;
          notes.push("نص السؤال لا يمكن أن يكون فارغاً");
        }

        if (updated.type === "MCQ") {
          const filled = updated.options.filter((o) => o.text.trim().length > 0);
          if (filled.length < 2) {
            isValid = false;
            notes.push("يجب توفر خيارين على الأقل لسؤال الاختيار من متعدد");
          }
          if (!updated.options.some((o) => o.isCorrect)) {
            isValid = false;
            notes.push("لم يتم تحديد إجابة صحيحة");
          }
        } else if (updated.type === "TRUE_FALSE") {
          if (!updated.options.some((o) => o.isCorrect)) {
            isValid = false;
            notes.push("يرجى تحديد الإجابة (صواب أم خطأ)");
          }
        }

        updated.isValid = isValid;
        updated.validationNotes = notes;

        // Auto update status if currently needs changes but became valid
        if (isValid && updated.reviewStatus === "NEEDS_CHANGES") {
          updated.reviewStatus = "APPROVED";
        } else if (!isValid && updated.reviewStatus === "APPROVED") {
          updated.reviewStatus = "NEEDS_CHANGES";
        }

        return updated;
      })
    );
  };

  // Toggle option correct state
  const handleToggleOptionCorrect = (questionId: string, optionIndex: number) => {
    const target = stagedQuestions.find((q) => q.id === questionId);
    if (!target) return;

    const newOptions = target.options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === optionIndex,
    }));

    updateStagedQuestion(questionId, { options: newOptions });
  };

  // Edit option text
  const handleOptionTextChange = (questionId: string, optionIndex: number, text: string) => {
    const target = stagedQuestions.find((q) => q.id === questionId);
    if (!target) return;

    const newOptions = [...target.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], text };
    updateStagedQuestion(questionId, { options: newOptions });
  };

  // Add new option to MCQ
  const handleAddOption = (questionId: string) => {
    const target = stagedQuestions.find((q) => q.id === questionId);
    if (!target) return;

    const newOptions = [
      ...target.options,
      { text: "", isCorrect: false },
    ];
    updateStagedQuestion(questionId, { options: newOptions });
  };

  // Remove option from MCQ
  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    const target = stagedQuestions.find((q) => q.id === questionId);
    if (!target || target.options.length <= 2) return;

    const newOptions = target.options.filter((_, idx) => idx !== optionIndex);
    // If we removed the correct option, ensure first one is marked if any
    if (target.options[optionIndex]?.isCorrect && newOptions.length > 0) {
      newOptions[0].isCorrect = true;
    }
    updateStagedQuestion(questionId, { options: newOptions });
  };

  // Bulk actions on staged questions
  const handleBulkApproveValid = () => {
    setStagedQuestions((prev) =>
      prev.map((q) => {
        if (q.isValid && q.reviewStatus !== "EXCLUDED") {
          return { ...q, reviewStatus: "APPROVED" };
        }
        return q;
      })
    );
  };

  const handleBulkExcludeIncomplete = () => {
    setStagedQuestions((prev) =>
      prev.map((q) => {
        if (!q.isValid) {
          return { ...q, reviewStatus: "EXCLUDED" };
        }
        return q;
      })
    );
  };

  const handleBulkSetDifficulty = (diff: QuestionDifficulty) => {
    setStagedQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        difficulty: diff,
        difficultyReason: "تم التعيين يدوياً عبر المراجعة الجماعية",
      }))
    );
  };

  // Filtered staged questions
  const filteredStagedQuestions = useMemo(() => {
    return stagedQuestions.filter((q) => {
      // Search
      if (
        searchQuery.trim() &&
        !q.statement.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ) {
        return false;
      }

      // Status
      if (statusFilter === "DUPLICATES") {
        if (!q.isDuplicate) return false;
      } else if (statusFilter !== "ALL" && q.reviewStatus !== statusFilter) {
        return false;
      }

      // Type
      if (typeFilter !== "ALL" && q.type !== typeFilter) return false;

      // Difficulty
      if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) return false;

      return true;
    });
  }, [stagedQuestions, searchQuery, statusFilter, typeFilter, difficultyFilter]);

  // Stage 4 Metrics
  const stats = useMemo(() => {
    const total = stagedQuestions.length;
    const approved = stagedQuestions.filter((q) => q.reviewStatus === "APPROVED").length;
    const needsChanges = stagedQuestions.filter((q) => q.reviewStatus === "NEEDS_CHANGES").length;
    const pending = stagedQuestions.filter((q) => q.reviewStatus === "PENDING").length;
    const excluded = stagedQuestions.filter((q) => q.reviewStatus === "EXCLUDED").length;
    const duplicates = stagedQuestions.filter((q) => q.isDuplicate).length;
    const invalid = stagedQuestions.filter((q) => !q.isValid && q.reviewStatus !== "EXCLUDED").length;

    const mcq = stagedQuestions.filter((q) => q.type === "MCQ" && q.reviewStatus === "APPROVED").length;
    const trueFalse = stagedQuestions.filter((q) => q.type === "TRUE_FALSE" && q.reviewStatus === "APPROVED").length;
    const essay = stagedQuestions.filter((q) => q.type === "ESSAY" && q.reviewStatus === "APPROVED").length;

    const easy = stagedQuestions.filter((q) => q.difficulty === "EASY" && q.reviewStatus === "APPROVED").length;
    const medium = stagedQuestions.filter((q) => q.difficulty === "MEDIUM" && q.reviewStatus === "APPROVED").length;
    const hard = stagedQuestions.filter((q) => q.difficulty === "HARD" && q.reviewStatus === "APPROVED").length;

    const canCommit = approved > 0 && invalid === 0 && needsChanges === 0;

    return {
      total,
      approved,
      needsChanges,
      pending,
      excluded,
      duplicates,
      invalid,
      mcq,
      trueFalse,
      essay,
      easy,
      medium,
      hard,
      canCommit,
    };
  }, [stagedQuestions]);

  // Final Commit action
  const handleFinalCommit = async () => {
    if (!unitInfo.subjectId) {
      setCommitError("تعذر تحديد المادة الدراسية المرتبطة بهذا الدرس");
      return;
    }

    const approvedQuestions = stagedQuestions.filter((q) => q.reviewStatus === "APPROVED");
    if (approvedQuestions.length === 0) {
      setCommitError("لم يتم اعتماد أي أسئلة بعد للحفظ النهائي");
      return;
    }

    setIsCommitting(true);
    setCommitError(null);

    try {
      const payload = {
        batchMeta: {
          fileName: selectedFile?.name || "استيراد مباشر",
          fileType: selectedFile?.name?.toLowerCase().endsWith(".pdf") ? "PDF" : "DOCX",
          schoolCategory: unitInfo.schoolCategory,
          gradeId: unitInfo.gradeId,
          subjectId: unitInfo.subjectId,
          unitId: unitInfo.unitId,
          lessonId: lessonId,
        },
        questions: approvedQuestions.map((q) => ({
          statement: q.statement.trim(),
          type: q.type,
          difficulty: q.difficulty,
          schoolCategory: unitInfo.schoolCategory,
          subjectId: unitInfo.subjectId,
          unitId: unitInfo.unitId,
          lessonId: lessonId,
          options: q.options || [],
          concept: q.concept || "تفسير الحل",
          correctReason: q.correctReason || undefined,
          modelAnswer: q.modelAnswer || undefined,
          points: q.points || (q.type === "ESSAY" ? 10 : 1),
        })),
      };

      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ الأسئلة في بنك الدرس");
      }

      setCommitSuccess(true);
      setTimeout(() => {
        onImportSuccess();
        handleClose();
      }, 1500);
    } catch (err: any) {
      setCommitError(err.message || "حدث خطأ غير متوقع أثناء الحفظ");
    } finally {
      setIsCommitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans text-right animate-fadeIn"
    >
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-[92vh] max-h-[920px] overflow-hidden">
        {/* ─────────────────────────────────────────────────────────────
            HEADER & 4-STAGE STEPPER (NAVY & BURGUNDY ACCENTS)
        ───────────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <span>معالج استيراد ومراجعة الأسئلة</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-mono font-bold border border-blue-200/60 dark:border-blue-900">
                    Smart Staging Flow
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unitInfo.gradeName || "الثانوية العامة"} &bull; {unitInfo.subjectName} &bull; {unitInfo.unitTitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {/* Step 1 */}
            <div
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                currentStep === 1
                  ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-xs"
                  : currentStep > 1
                  ? "border-emerald-300 bg-emerald-50/40 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"
                  : "border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50/50 dark:bg-slate-900/50"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  currentStep > 1
                    ? "bg-emerald-600 text-white"
                    : currentStep === 1
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                }`}
              >
                {currentStep > 1 ? <Check className="w-3 h-3" /> : "1"}
              </div>
              <span className="truncate">1. إعدادات الاستيراد</span>
            </div>

            {/* Step 2 */}
            <div
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                currentStep === 2
                  ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-xs"
                  : currentStep > 2
                  ? "border-emerald-300 bg-emerald-50/40 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"
                  : "border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50/50 dark:bg-slate-900/50"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  currentStep > 2
                    ? "bg-emerald-600 text-white"
                    : currentStep === 2
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                }`}
              >
                {currentStep > 2 ? <Check className="w-3 h-3" /> : "2"}
              </div>
              <span className="truncate">2. الرفع والتحليل</span>
            </div>

            {/* Step 3 */}
            <div
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                currentStep === 3
                  ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-xs"
                  : currentStep > 3
                  ? "border-emerald-300 bg-emerald-50/40 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"
                  : "border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50/50 dark:bg-slate-900/50"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  currentStep > 3
                    ? "bg-emerald-600 text-white"
                    : currentStep === 3
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                }`}
              >
                {currentStep > 3 ? <Check className="w-3 h-3" /> : "3"}
              </div>
              <span className="truncate">3. مراجعة الأسئلة ({stagedQuestions.length})</span>
            </div>

            {/* Step 4 */}
            <div
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                currentStep === 4
                  ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50/50 dark:bg-slate-900/50"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  currentStep === 4
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                }`}
              >
                4
              </div>
              <span className="truncate">4. الاعتماد النهائي</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            BODY CONTENT BY STEP
        ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {/* ════════════════════════════════════════════════════════════
              STAGE 1: IMPORT SETTINGS & ACADEMIC CONTEXT
          ════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Academic Context Badge Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>السياق الأكاديمي المعتمد من قاعدة البيانات:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">الصف الدراسي</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {unitInfo.gradeName || "الصف الأول الثانوي"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">نوع المدرسة</span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      {unitInfo.schoolCategory === "LANGUAGES" ? "مدارس لغات (English)" : "مدارس عربي"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">المادة</span>
                    <span className="font-bold text-slate-900 dark:text-white">{unitInfo.subjectName}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">الوحدة والدرس</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate block">
                      {unitInfo.unitTitle}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    النزاهة الأكاديمية: يتم عزل أسئلة مدارس العربي عن مدارس اللغات تماماً لضمان عدم تداخل المناهج والمصطلحات.
                  </span>
                </p>
              </div>

              {/* 1. Allowed Types */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  1. حدد أنواع الأسئلة المسموح باستيرادها من الملف:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* MCQ */}
                  <div
                    onClick={() => toggleAllowedType("MCQ")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      allowedTypes.includes("MCQ")
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🎯</span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          allowedTypes.includes("MCQ") ? "bg-blue-600 text-white" : "border border-slate-300"
                        }`}
                      >
                        {allowedTypes.includes("MCQ") && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">اختيار من متعدد (MCQ)</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        خيارات متعددة (أ، ب، ج، د) مع تحديد إجابة صحيحة واحدة أو أكثر.
                      </p>
                    </div>
                  </div>

                  {/* True / False */}
                  <div
                    onClick={() => toggleAllowedType("TRUE_FALSE")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      allowedTypes.includes("TRUE_FALSE")
                        ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">⚖️</span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          allowedTypes.includes("TRUE_FALSE") ? "bg-purple-600 text-white" : "border border-slate-300"
                        }`}
                      >
                        {allowedTypes.includes("TRUE_FALSE") && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">صح أم خطأ (True / False)</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        عبارات تقييمية مع تحديد (صواب) أو (خطأ) وتفسير السبب.
                      </p>
                    </div>
                  </div>

                  {/* Essay */}
                  <div
                    onClick={() => toggleAllowedType("ESSAY")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      allowedTypes.includes("ESSAY")
                        ? "border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">📝</span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          allowedTypes.includes("ESSAY") ? "bg-amber-600 text-white" : "border border-slate-300"
                        }`}
                      >
                        {allowedTypes.includes("ESSAY") && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">أسئلة مقالية (Essay)</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        أسئلة علل، اشرح، ما النتائج مع نموذج إجابة وروبـريك.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Difficulty Strategy */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  2. حدد استراتيجية تصنيف مستوى الصعوبة:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option A: Auto AI / Bloom */}
                  <div
                    onClick={() => setStrategy("AUTO")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                      strategy === "AUTO"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>تصنيف معرفي تلقائي (موصى به)</span>
                      </span>
                      <input
                        type="radio"
                        checked={strategy === "AUTO"}
                        onChange={() => setStrategy("AUTO")}
                        className="accent-blue-600"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      يحلل المحتوى وفق مستويات بلوم (تذكر = سهل، تطبيق = متوسط، تركيب وتحليل = صعب) دون الاعتماد على طول النص.
                    </p>
                  </div>

                  {/* Option B: Manual Review */}
                  <div
                    onClick={() => setStrategy("MANUAL_REVIEW")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                      strategy === "MANUAL_REVIEW"
                        ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-600 flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4" />
                        <span>مراجعة يدوية لكل سؤال</span>
                      </span>
                      <input
                        type="radio"
                        checked={strategy === "MANUAL_REVIEW"}
                        onChange={() => setStrategy("MANUAL_REVIEW")}
                        className="accent-purple-600"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      تظل الصعوبة غير مؤكدة ويُطلب من المسؤول تحديد صعوبة كل سؤال في مرحلة المراجعة قبل الاعتماد.
                    </p>
                  </div>

                  {/* Option C: Forced Level */}
                  <div
                    onClick={() => setStrategy("FORCED")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                      strategy === "FORCED"
                        ? "border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        <span>مستوى موحد للملف بالكامل</span>
                      </span>
                      <input
                        type="radio"
                        checked={strategy === "FORCED"}
                        onChange={() => setStrategy("FORCED")}
                        className="accent-amber-600"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      فرض مستوى صعوبة واحد (مثل: امتحان للمتفوقين صعب) على جميع الأسئلة المستوردة.
                    </p>
                  </div>
                </div>

                {strategy === "FORCED" && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 flex items-center gap-4">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      اختر المستوى الموحد:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setForcedDifficulty("EASY")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          forcedDifficulty === "EASY"
                            ? "bg-emerald-600 text-white"
                            : "bg-white border text-slate-600"
                        }`}
                      >
                        🟢 سهل
                      </button>
                      <button
                        type="button"
                        onClick={() => setForcedDifficulty("MEDIUM")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          forcedDifficulty === "MEDIUM"
                            ? "bg-amber-600 text-white"
                            : "bg-white border text-slate-600"
                        }`}
                      >
                        🟡 متوسط
                      </button>
                      <button
                        type="button"
                        onClick={() => setForcedDifficulty("HARD")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          forcedDifficulty === "HARD"
                            ? "bg-red-600 text-white"
                            : "bg-white border text-slate-600"
                        }`}
                      >
                        🔴 صعب
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STAGE 2: FILE UPLOAD OR TEXT PASTE & AUTO ANALYSIS
          ════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Mode Switcher */}
              <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center">
                <button
                  type="button"
                  onClick={() => setInputMode("FILE")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inputMode === "FILE"
                      ? "bg-white dark:bg-[#0F172A] text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>رفع مستند Word (.docx) أو PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("PASTE")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inputMode === "PASTE"
                      ? "bg-white dark:bg-[#0F172A] text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>لصق نصوص الأسئلة مباشرة</span>
                </button>
              </div>

              {analysisError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {inputMode === "FILE" ? (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".docx,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setAnalysisError(null);
                      }
                    }}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
                      selectedFile
                        ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                        : "border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/50"
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
                        selectedFile
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-50 dark:bg-blue-950/40 text-blue-600"
                      }`}
                    >
                      {selectedFile ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedFile ? selectedFile.name : "اضغط هنا لاختيار ملف Word (.docx) أو PDF"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {selectedFile
                          ? `الحجم: ${(selectedFile.size / 1024 / 1024).toFixed(2)} ميجابايت — اضغط للتغيير`
                          : "يدعم المستندات التي تحتوي على أسئلة مرقمة مع الخيارات ونموذج الإجابة"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Template Quick Actions Banner */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>الصيغة النموذجية المعتمدة (مع التفسير لتوضيح أخطاء الطالب):</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const templateEn = `Question 1: ما المقصود بالذكاء الاصطناعي (AI)؟\n\nA) مجال يهدف إلى تطوير أنظمة حاسوبية تستطيع تنفيذ مهام تتطلب عادةً ذكاءً بشريًا\nB) نظام مخصص لتخزين الملفات فقط\nC) وسيلة لتوصيل أجهزة الحاسب بالإنترنت فقط\nD) برنامج يستخدم لإنشاء الصور فقط\n\nCorrect Answer: A\n\nExplanation: الذكاء الاصطناعي مجال يضم أنظمة حاسوبية تستطيع تنفيذ مهام مثل التعلم والتنبؤ والتعرف وتوليد المحتوى واتخاذ القرارات أو دعمها.`;
                            setPasteText(templateEn);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer transition-all shadow-xs"
                        >
                          إدراج مثال (A, B, C, D)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const templateAr = `سؤال 1: ما المقصود بالذكاء الاصطناعي (AI)؟\n\nأ) مجال يهدف إلى تطوير أنظمة حاسوبية تستطيع تنفيذ مهام تتطلب عادةً ذكاءً بشريًا\nب) نظام مخصص لتخزين الملفات فقط\nج) وسيلة لتوصيل أجهزة الحاسب بالإنترنت فقط\nد) برنامج يستخدم لإنشاء الصور فقط\n\nالإجابة الصحيحة: أ\n\nالتفسير: الذكاء الاصطناعي مجال يضم أنظمة حاسوبية تستطيع تنفيذ مهام مثل التعلم والتنبؤ والتعرف وتوليد المحتوى واتخاذ القرارات أو دعمها.`;
                            setPasteText(templateAr);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-all shadow-xs"
                        >
                          إدراج مثال (أ، ب، ج، د)
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                      عند تضمين <code>Correct Answer</code> و <code>Explanation</code> (أو <code>الإجابة الصحيحة</code> و <code>التفسير</code>)، يقوم النظام تلقائياً بربط الإجابة النموذجية وشرح الحل، بحيث عندما يحل الطالب السؤال ويخطئ، يُعرض له الخيار الخاطئ باللون الأحمر مع الخيار الصحيح بالأخضر والتفسير الكامل لتصحيح المفهوم فوراً.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-900 dark:text-white block">
                      الصق نص الأسئلة بالكامل هنا:
                    </label>
                    <textarea
                      rows={12}
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder={`Question 1: ما المقصود بالذكاء الاصطناعي (AI)؟\n\nA) مجال يهدف إلى تطوير أنظمة حاسوبية تستطيع تنفيذ مهام تتطلب عادةً ذكاءً بشريًا\nB) نظام مخصص لتخزين الملفات فقط\nC) وسيلة لتوصيل أجهزة الحاسب بالإنترنت فقط\nD) برنامج يستخدم لإنشاء الصور فقط\n\nCorrect Answer: A\n\nExplanation: الذكاء الاصطناعي مجال يضم أنظمة حاسوبية تستطيع تنفيذ مهام مثل التعلم والتنبؤ والتعرف وتوليد المحتوى واتخاذ القرارات أو دعمها.`}
                      className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white leading-relaxed resize-none outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Safety notice */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 text-blue-900 dark:text-blue-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>ملاحظة أمان:</strong> لن يتم حفظ أي سؤال في بنك الأسئلة النهائي في هذه المرحلة. ستنتقل الأسئلة أولاً إلى منطقة المراجعة المؤقتة (Staging Area).
                </span>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STAGE 3: FULL QUESTION REVIEW (STAGING AREA)
          ════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Header Actions & Filters */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-800 space-y-3">
                {/* Search & Bulk Operations */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث في نصوص الأسئلة المستخرجة..."
                      className="w-full pr-9 pl-4 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleBulkApproveValid}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>اعتماد جميع الأسئلة الصالحة</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBulkExcludeIncomplete}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                      <span>استبعاد الأسئلة الناقصة</span>
                    </button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-400">الحالة:</span>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("ALL")}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                        statusFilter === "ALL"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                          : "text-slate-600 hover:bg-black/5"
                      }`}
                    >
                      الكل ({stagedQuestions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("APPROVED")}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                        statusFilter === "APPROVED"
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      معتمد ({stagedQuestions.filter((q) => q.reviewStatus === "APPROVED").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("NEEDS_CHANGES")}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                        statusFilter === "NEEDS_CHANGES"
                          ? "bg-amber-600 text-white"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      يحتاج مراجعة ({stagedQuestions.filter((q) => q.reviewStatus === "NEEDS_CHANGES").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("EXCLUDED")}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                        statusFilter === "EXCLUDED"
                          ? "bg-red-600 text-white"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      مستبعد ({stagedQuestions.filter((q) => q.reviewStatus === "EXCLUDED").length})
                    </button>
                    {stats.duplicates > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("DUPLICATES")}
                        className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                          statusFilter === "DUPLICATES"
                            ? "bg-purple-600 text-white"
                            : "bg-purple-50 text-purple-800"
                        }`}
                      >
                        ⚠️ مكرر ({stats.duplicates})
                      </button>
                    )}
                  </div>

                  {/* Type Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400">النوع:</span>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                    >
                      <option value="ALL">جميع الأنواع</option>
                      <option value="MCQ">اختيار من متعدد</option>
                      <option value="TRUE_FALSE">صح وخطأ</option>
                      <option value="ESSAY">مقالي</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Staged Cards List */}
              <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredStagedQuestions.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    لا توجد أسئلة تطابق الفلتر المحدد
                  </div>
                ) : (
                  filteredStagedQuestions.map((q, idx) => {
                    const isExpanded = expandedQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        className={`rounded-2xl border transition-all ${
                          q.reviewStatus === "APPROVED"
                            ? "border-emerald-300 dark:border-emerald-800 bg-white dark:bg-[#0F172A]"
                            : q.reviewStatus === "EXCLUDED"
                            ? "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 opacity-60"
                            : q.reviewStatus === "NEEDS_CHANGES"
                            ? "border-amber-400 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/20"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]"
                        } shadow-2xs overflow-hidden`}
                      >
                        {/* Card Header Bar */}
                        <div className="p-4 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              #{idx + 1}
                            </span>

                            {/* Type Selector inline */}
                            <select
                              value={q.type}
                              onChange={(e) =>
                                updateStagedQuestion(q.id, {
                                  type: e.target.value as QuestionType,
                                })
                              }
                              className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] outline-none"
                            >
                              <option value="MCQ">🎯 اختيار من متعدد</option>
                              <option value="TRUE_FALSE">⚖️ صح وخطأ</option>
                              <option value="ESSAY">📝 مقالي</option>
                            </select>

                            {/* Difficulty Selector inline */}
                            <select
                              value={q.difficulty}
                              onChange={(e) =>
                                updateStagedQuestion(q.id, {
                                  difficulty: e.target.value as QuestionDifficulty,
                                  difficultyReason: "تم تعديل الصعوبة يدوياً أثناء المراجعة",
                                })
                              }
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none ${
                                q.difficulty === "EASY"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : q.difficulty === "HARD"
                                  ? "bg-red-50 text-red-800 border-red-300"
                                  : "bg-amber-50 text-amber-800 border-amber-300"
                              }`}
                            >
                              <option value="EASY">🟢 سهل</option>
                              <option value="MEDIUM">🟡 متوسط</option>
                              <option value="HARD">🔴 صعب</option>
                            </select>

                            {/* Cognitive Reason Badge */}
                            {q.difficultyReason && (
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 max-w-[220px] truncate"
                                title={q.difficultyReason}
                              >
                                {q.difficultyReason}
                              </span>
                            )}

                            {/* Duplicate Warning */}
                            {q.isDuplicate && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold border border-purple-200">
                                ⚠️ اشتباه تكرار
                              </span>
                            )}
                          </div>

                          {/* Status Toggle Buttons */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateStagedQuestion(q.id, {
                                  reviewStatus:
                                    q.reviewStatus === "APPROVED" ? "PENDING" : "APPROVED",
                                })
                              }
                              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                q.reviewStatus === "APPROVED"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{q.reviewStatus === "APPROVED" ? "معتمد" : "اعتماد"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateStagedQuestion(q.id, {
                                  reviewStatus:
                                    q.reviewStatus === "EXCLUDED" ? "PENDING" : "EXCLUDED",
                                })
                              }
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                                q.reviewStatus === "EXCLUDED"
                                  ? "bg-red-600 text-white"
                                  : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                              }`}
                              title="استبعاد السؤال"
                            >
                              {q.reviewStatus === "EXCLUDED" ? "مستبعد" : "استبعاد"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedQuestionId(isExpanded ? null : q.id)
                              }
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Card Body (Full Statement, No Clipping) */}
                        <div className="p-4 space-y-3">
                          {/* Validation Warnings */}
                          {q.validationNotes && q.validationNotes.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>{q.validationNotes.join(" &bull; ")}</span>
                            </div>
                          )}

                          {/* Statement editable */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 block">
                              نص السؤال:
                            </label>
                            <textarea
                              rows={2}
                              value={q.statement}
                              onChange={(e) =>
                                updateStagedQuestion(q.id, { statement: e.target.value })
                              }
                              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white leading-relaxed resize-y outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Options Section for MCQ & True/False */}
                          {q.type !== "ESSAY" && (
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-500">
                                  الخيارات (اضغط على الدائرة الخضراء لتحديد الإجابة الصحيحة):
                                </label>
                                {q.type === "MCQ" && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(q.id)}
                                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>إضافة خيار</span>
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                                      opt.isCorrect
                                        ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleToggleOptionCorrect(q.id, optIdx)}
                                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold cursor-pointer transition-all ${
                                        opt.isCorrect
                                          ? "bg-emerald-600 text-white shadow-xs"
                                          : "border border-slate-300 hover:border-emerald-500 text-slate-400"
                                      }`}
                                      title={opt.isCorrect ? "الإجابة الصحيحة" : "اجعلها إجابة صحيحة"}
                                    >
                                      {opt.isCorrect ? (
                                        <Check className="w-3.5 h-3.5" />
                                      ) : (
                                        String.fromCharCode(65 + optIdx)
                                      )}
                                    </button>

                                    <input
                                      type="text"
                                      value={opt.text}
                                      onChange={(e) =>
                                        handleOptionTextChange(q.id, optIdx, e.target.value)
                                      }
                                      className="flex-1 bg-transparent border-none text-xs font-bold outline-none"
                                    />

                                    {q.type === "MCQ" && q.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(q.id, optIdx)}
                                        className="text-slate-400 hover:text-red-500 p-1"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Explanation preview if present when collapsed */}
                          {!isExpanded && q.correctReason && (
                            <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 text-[11px] text-blue-900 dark:text-blue-300 flex items-start gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <div className="line-clamp-2">
                                <span className="font-bold">التفسير التعليمي للطالب: </span>
                                {q.correctReason}
                              </div>
                            </div>
                          )}

                          {/* Expanded fields: Explanation & Rubric */}
                          {isExpanded && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                              {q.type === "ESSAY" && (
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>نموذج الإجابة للسؤال المقالي:</span>
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={q.modelAnswer || ""}
                                    onChange={(e) =>
                                      updateStagedQuestion(q.id, { modelAnswer: e.target.value })
                                    }
                                    placeholder="اكتب خطوات الحل أو الإجابة النموذجية..."
                                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed resize-y outline-none focus:border-amber-500"
                                  />
                                </div>
                              )}

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>تفسير الإجابة وشرح الحل للطالب:</span>
                                </label>
                                <textarea
                                  rows={2}
                                  value={q.correctReason || ""}
                                  onChange={(e) =>
                                    updateStagedQuestion(q.id, { correctReason: e.target.value })
                                  }
                                  placeholder="التفسير العلمي للإجابة..."
                                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed resize-y outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STAGE 4: FINAL REVIEW & COMMIT SUMMARY
          ════════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <div className="max-w-3xl mx-auto space-y-6">
              {commitError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>{commitError}</span>
                </div>
              )}

              {commitSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>تم اعتماد وحفظ الأسئلة بنجاح في بنك أسئلة الدرس! جارٍ التحديث...</span>
                </div>
              )}

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-500 block font-bold">إجمالي المستخرج</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {stats.total}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-bold">
                    معتمد وجاهز للحفظ
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                    {stats.approved}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 block font-bold">
                    يحتاج مراجعة
                  </span>
                  <span className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300">
                    {stats.needsChanges}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800 space-y-1">
                  <span className="text-[11px] text-red-700 dark:text-red-300 block font-bold">
                    مستبعد
                  </span>
                  <span className="text-xl font-bold font-mono text-red-700 dark:text-red-300">
                    {stats.excluded}
                  </span>
                </div>
              </div>

              {/* Breakdown by Type and Difficulty */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>توزيع الأسئلة المعتمدة للدرس:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* By Type */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">حسب النوع:</span>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span>🎯 اختيار من متعدد (MCQ)</span>
                      <span className="font-bold font-mono">{stats.mcq}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span>⚖️ صح أم خطأ</span>
                      <span className="font-bold font-mono">{stats.trueFalse}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>📝 أسئلة مقالية</span>
                      <span className="font-bold font-mono">{stats.essay}</span>
                    </div>
                  </div>

                  {/* By Difficulty */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      حسب مستوى الصعوبة:
                    </span>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span>🟢 سهل (تذكر ومفاهيم)</span>
                      <span className="font-bold font-mono text-emerald-600">{stats.easy}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span>🟡 متوسط (فهم وتطبيق)</span>
                      <span className="font-bold font-mono text-amber-600">{stats.medium}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>🔴 صعب (مهارات عليا)</span>
                      <span className="font-bold font-mono text-red-600">{stats.hard}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Gate Warning */}
              {!stats.canCommit && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>تنبيه ضبط الجودة: هناك أسئلة بحاجة لمراجعة أو لم يتم اعتمادها بعد</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-slate-600 dark:text-slate-400">
                    لا يمكن حفظ الأسئلة التي تفتقد بيانات إلزامية أو إجابات صحيحة مطلوبة. يمكنك العودة للمرحلة السابقة لتعديلها، أو الضغط على الزر أدناه لاستبعاد غير المكتمل والاعتماد الفوري.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleBulkExcludeIncomplete();
                      handleBulkApproveValid();
                    }}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    استبعاد غير المكتمل واعتماد الباقي تلقائياً ⚡
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            FOOTER ACTION BUTTONS
        ───────────────────────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                disabled={isAnalyzing || isCommitting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCommitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              إلغاء
            </button>

            {currentStep === 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>متابعة للرفع والتحليل</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ التحليل الذكي للأسئلة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>بدء استخراج وتحليل الأسئلة</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                disabled={stagedQuestions.length === 0}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <span>متابعة لملخص الاعتماد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                onClick={handleFinalCommit}
                disabled={isCommitting || !stats.canCommit || commitSuccess}
                className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                {isCommitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ الحفظ والاعتماد في بنك الدرس...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد وحفظ الأسئلة في البنك ({stats.approved})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
