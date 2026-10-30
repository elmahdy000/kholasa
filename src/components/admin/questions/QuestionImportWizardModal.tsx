"use client";

import { useState, useRef, useMemo, useEffect } from "react";
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
  X,
  FileSpreadsheet,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import type { Subject, Grade } from "./types";
import {
  ParsedQuestion,
  QuestionType,
  QuestionDifficulty,
  QuestionReviewStatus,
  parseQuestionsFromText,
  formatModelAnswer,
} from "@/lib/question-parser";

export type ImportTargetType = "ALL" | "MCQ" | "TRUE_FALSE" | "ESSAY";

interface QuestionImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  grades?: Grade[];
  initialSubjectId?: string;
  initialType?: ImportTargetType;
  onSuccess: () => void;
}

export function QuestionImportWizardModal({
  isOpen,
  onClose,
  subjects,
  grades = [],
  initialSubjectId,
  initialType = "ALL",
  onSuccess,
}: QuestionImportWizardModalProps) {
  // Stepper: 1 = Settings, 2 = Upload, 3 = Staging Review, 4 = Final Commit
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Dedicated Target Type Mode (Separated Logic per Type)
  const [targetType, setTargetType] = useState<ImportTargetType>(initialType);

  // Stage 1: Target Curriculum & Classification Mode
  const defaultGrade =
    grades.find((g) => g.code === "bacc_g11") ||
    grades.find((g) => g.code === "bacc_g10") ||
    grades[0];
  const [selectedGradeId, setSelectedGradeId] = useState<string>(defaultGrade?.id || "");
  const [selectedSchoolCategory, setSelectedSchoolCategory] = useState<"ARABIC" | "LANGUAGES">("ARABIC");

  // Eligible subjects filtered by Grade & School Category
  const eligibleSubjects = useMemo(() => {
    return subjects.filter((s) => {
      if (selectedGradeId && s.gradeId && s.gradeId !== selectedGradeId) return false;
      if (s.schoolCategory && s.schoolCategory !== selectedSchoolCategory) return false;
      return true;
    });
  }, [subjects, selectedGradeId, selectedSchoolCategory]);

  const defaultSubjectId =
    initialSubjectId && eligibleSubjects.some((s) => s.id === initialSubjectId)
      ? initialSubjectId
      : eligibleSubjects[0]?.id || "";
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(defaultSubjectId);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  const [allowedTypes, setAllowedTypes] = useState<QuestionType[]>([
    "MCQ",
    "TRUE_FALSE",
    "ESSAY",
  ]);
  const [strategy, setStrategy] = useState<"AUTO" | "MANUAL_REVIEW" | "FORCED">("AUTO");
  const [forcedDifficulty, setForcedDifficulty] = useState<QuestionDifficulty>("MEDIUM");

  // Stage 2: File Upload / Direct Paste
  const [inputMode, setInputMode] = useState<"FILE" | "PASTE">("FILE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stage 3: Staged Questions (Temporary Staging Area)
  const [stagedQuestions, setStagedQuestions] = useState<ParsedQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | QuestionReviewStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | QuestionType>("ALL");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [approvedQuestionIds, setApprovedQuestionIds] = useState<Set<string>>(new Set());

  // Stage 4: Final Commit
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [committedCount, setCommittedCount] = useState(0);
  const [skippedDuplicates, setSkippedDuplicates] = useState(0);

  // Synchronize targetType and allowedTypes whenever modal opens or initialType changes
  useEffect(() => {
    if (isOpen) {
      const mode = initialType || "ALL";
      setTargetType(mode);
      if (mode === "MCQ") {
        setAllowedTypes(["MCQ"]);
        setTypeFilter("MCQ");
      } else if (mode === "TRUE_FALSE") {
        setAllowedTypes(["TRUE_FALSE"]);
        setTypeFilter("TRUE_FALSE");
      } else if (mode === "ESSAY") {
        setAllowedTypes(["ESSAY"]);
        setTypeFilter("ESSAY");
      } else {
        setAllowedTypes(["MCQ", "TRUE_FALSE", "ESSAY"]);
        setTypeFilter("ALL");
      }
    }
  }, [isOpen, initialType]);

  const selectTargetType = (type: ImportTargetType) => {
    setTargetType(type);
    if (type === "MCQ") {
      setAllowedTypes(["MCQ"]);
      setTypeFilter("MCQ");
    } else if (type === "TRUE_FALSE") {
      setAllowedTypes(["TRUE_FALSE"]);
      setTypeFilter("TRUE_FALSE");
    } else if (type === "ESSAY") {
      setAllowedTypes(["ESSAY"]);
      setTypeFilter("ESSAY");
    } else {
      setAllowedTypes(["MCQ", "TRUE_FALSE", "ESSAY"]);
      setTypeFilter("ALL");
    }
  };

  // Helper to quickly set True/False answer
  const handleSetTrueFalseAnswer = (qId: string, answer: "TRUE" | "FALSE") => {
    const isTrue = answer === "TRUE";
    const options = [
      { text: "صواب", isCorrect: isTrue, order: 1 },
      { text: "خطأ", isCorrect: !isTrue, order: 2 },
    ];
    setStagedQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return revalidateQuestion({ ...q, options });
      })
    );
  };

  if (!isOpen) return null;

  // Toggle allowed question types in Step 1
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

  // Revalidate question helper
  const revalidateQuestion = (q: ParsedQuestion): ParsedQuestion => {
    const notes: string[] = [];
    let isValid = true;

    if (!q.statement || q.statement.trim().length < 3) {
      isValid = false;
      notes.push("نص السؤال قصير جداً أو غير مكتمل");
    }

    if (q.type === "MCQ") {
      if (!q.options || q.options.length < 2) {
        isValid = false;
        notes.push("السؤال الاختياري يتطلب خيارين على الأقل");
      } else if (!q.options.some((o) => o.isCorrect)) {
        isValid = false;
        notes.push("لم يتم تحديد الإجابة الصحيحة");
      }
    } else if (q.type === "TRUE_FALSE") {
      if (!q.options || !q.options.some((o) => o.isCorrect)) {
        isValid = false;
        notes.push("يرجى تحديد ما إذا كانت العبارة صواب أو خطأ");
      }
    }

    let reviewStatus: QuestionReviewStatus = isValid ? "APPROVED" : "NEEDS_CHANGES";
    if (strategy === "MANUAL_REVIEW") {
      reviewStatus = "NEEDS_CHANGES";
    }

    return { ...q, isValid, reviewStatus, validationNotes: notes };
  };

  // Handle Start Extraction to Staging (Step 2 -> Step 3)
  const handleStartExtraction = async () => {
    setAnalysisError(null);

    if (inputMode === "FILE" && !selectedFile) {
      setAnalysisError("يرجى اختيار ملف Word (.docx) أو PDF أولاً.");
      return;
    }

    if (inputMode === "PASTE" && !pasteText.trim()) {
      setAnalysisError("يرجى لصق نص الأسئلة في المربع المخصص.");
      return;
    }

    setIsAnalyzing(true);

    try {
      let rawQuestions: ParsedQuestion[] = [];

      if (inputMode === "FILE" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("schoolCategory", selectedSchoolCategory);
        formData.append("strategy", strategy);
        formData.append("forcedDifficulty", forcedDifficulty);
        if (targetType !== "ALL") {
          formData.append("type", targetType);
        }
        formData.append("allowedTypes", JSON.stringify(allowedTypes));

        const res = await fetch("/api/admin/questions/parse-docx", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "فشل قراءة وتحليل المستند");
        }

        rawQuestions = data.questions || [];
      } else {
        // Direct Text Parse using API with forcedType support
        const payload = {
          text: pasteText.trim(),
          strategy,
          allowedTypes,
          type: targetType !== "ALL" ? targetType : undefined,
          difficulty: strategy === "FORCED" ? forcedDifficulty : undefined,
          schoolCategory: selectedSchoolCategory,
        };
        const res = await fetch("/api/admin/questions/parse-docx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "فشل قراءة وتحليل نصوص الأسئلة");
        }

        rawQuestions = data.questions || [];
      }

      if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error("لم يتم العثور على أي أسئلة صالحة في المحتوى المرفوع.");
      }

      // Filter by allowed types if specified
      const filteredByType = rawQuestions.filter((q) =>
        allowedTypes.includes(q.type)
      );

      // Revalidate each question and apply strategy
      const processed = filteredByType.map((q) => {
        let diff = q.difficulty;
        if (strategy === "FORCED") {
          diff = forcedDifficulty;
        }
        return revalidateQuestion({ ...q, difficulty: diff });
      });

      setStagedQuestions(processed);
      // Auto-approve valid questions by default
      const validIds = new Set(processed.filter((q) => q.isValid).map((q) => q.id));
      setApprovedQuestionIds(validIds);

      // Move to Step 3
      setCurrentStep(3);
    } catch (err: any) {
      setAnalysisError(err.message || "حدث خطأ أثناء استخراج الأسئلة من المستند");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle approval of a single question in Step 3
  const handleToggleApprove = (id: string) => {
    setApprovedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle all valid questions in Step 3
  const handleToggleSelectAllValid = () => {
    const validIds = stagedQuestions.filter((q) => q.isValid).map((q) => q.id);
    const allValidSelected = validIds.every((id) => approvedQuestionIds.has(id));

    if (allValidSelected) {
      setApprovedQuestionIds(new Set());
    } else {
      setApprovedQuestionIds(new Set(validIds));
    }
  };

  // Update a staged question
  const handleUpdateStagedQuestion = (updated: ParsedQuestion) => {
    const revalidated = revalidateQuestion(updated);
    setStagedQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? revalidated : q))
    );
  };

  // Remove a staged question
  const handleRemoveStagedQuestion = (id: string) => {
    setStagedQuestions((prev) => prev.filter((q) => q.id !== id));
    setApprovedQuestionIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Commit Approved Questions to Database (Step 4)
  const handleCommitToBank = async () => {
    setCommitError(null);
    setIsCommitting(true);

    try {
      const approvedList = stagedQuestions.filter((q) => approvedQuestionIds.has(q.id));
      if (approvedList.length === 0) {
        throw new Error("لم يتم تحديد أي أسئلة معتمدة للحفظ في بنك الأسئلة.");
      }

      const payload = {
        batchMeta: {
          subjectId: selectedSubjectId,
          unitId: selectedUnitId || undefined,
          lessonId: selectedLessonId || undefined,
          gradeId: selectedGradeId,
          schoolCategory: selectedSchoolCategory,
          fileName: selectedFile?.name || "استيراد نصوص ذكي",
          fileType: selectedFile ? selectedFile.name.split(".").pop() || "docx" : "text",
        },
        questions: approvedList.map((q) => ({
          statement: q.statement,
          type: q.type,
          difficulty: q.difficulty,
          schoolCategory: selectedSchoolCategory,
          subjectId: selectedSubjectId,
          unitId: selectedUnitId || undefined,
          lessonId: selectedLessonId || undefined,
          concept: q.concept || undefined,
          correctReason: q.correctReason || undefined,
          modelAnswer: q.modelAnswer || undefined,
          points: q.points || 10,
          options: q.options.map((opt, idx) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: idx + 1,
            explanation: opt.explanation || undefined,
          })),
        })),
      };

      const res = await fetch("/api/admin/questions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل اعتماد الأسئلة في قاعدة البيانات");
      }

      setCommittedCount(data.importedCount ?? approvedList.length);
      setSkippedDuplicates(data.skippedDuplicates ?? 0);
      setCommitSuccess(true);
      onSuccess();
    } catch (err: any) {
      setCommitError(err.message || "حدث خطأ أثناء حفظ الأسئلة");
    } finally {
      setIsCommitting(false);
    }
  };

  // Filtered staged questions for Stage 3 view
  const visibleStagedQuestions = useMemo(() => {
    return stagedQuestions.filter((q) => {
      if (statusFilter !== "ALL" && q.reviewStatus !== statusFilter) return false;
      if (typeFilter !== "ALL" && q.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchStatement = q.statement.toLowerCase().includes(query);
        const matchOption = q.options?.some((o) => o.text.toLowerCase().includes(query));
        const matchReason = q.correctReason?.toLowerCase().includes(query);
        if (!matchStatement && !matchOption && !matchReason) return false;
      }
      return true;
    });
  }, [stagedQuestions, statusFilter, typeFilter, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-4xl bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-[#334155] max-h-[92vh] flex flex-col overflow-hidden text-right">
        {/* Header with 4-Step Stepper */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] shrink-0">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#800020]/10 dark:bg-[#800020]/20 flex items-center justify-center text-[#800020] dark:text-[#FB7185]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                  معالج استيراد الأسئلة الذكي — بنك الأسئلة
                </h3>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  استيراد 4 مراحل مع منطقة عمل مؤقتة وتدقيق كامل قبل الاعتماد
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dedicated Target Mode Segmented Control (Mode Isolation) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] mb-2.5">
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] px-2">
              وضع الاستيراد:
            </span>
            <button
              type="button"
              onClick={() => selectTargetType("ALL")}
              className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                targetType === "ALL"
                  ? "bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-xs"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
              }`}
            >
              ✨ استيراد شامل لكافة الأنواع
            </button>
            <button
              type="button"
              onClick={() => selectTargetType("MCQ")}
              className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                targetType === "MCQ"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
              }`}
            >
              🎯 وضع اختيار من متعدد فقط
            </button>
            <button
              type="button"
              onClick={() => selectTargetType("TRUE_FALSE")}
              className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                targetType === "TRUE_FALSE"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
              }`}
            >
              ⚖️ وضع صواب وخطأ فقط
            </button>
            <button
              type="button"
              onClick={() => selectTargetType("ESSAY")}
              className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                targetType === "ESSAY"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
              }`}
            >
              📝 وضع الأسئلة المقالية فقط
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { num: 1, title: "1. الإعدادات والتصنيف" },
              { num: 2, title: "2. رفع المستند والاستخراج" },
              { num: 3, title: "3. مراجعة وتدقيق الأسئلة" },
              { num: 4, title: "4. الاعتماد النهائي" },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div
                  key={step.num}
                  className={`px-2.5 py-1.5 rounded-lg border text-center transition-colors ${
                    isActive
                      ? "bg-[#800020] text-white border-[#800020] font-bold"
                      : isPast
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold"
                      : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155]"
                  }`}
                >
                  <span className="text-[11px] sm:text-[12px] truncate block">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body - Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* STEP 1: Settings & Classification */}
          {currentStep === 1 && (
            <div className="space-y-5">
              {/* Focus Mode Banner */}
              {targetType !== "ALL" && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                    targetType === "ESSAY"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                      : targetType === "MCQ"
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200"
                      : "bg-purple-500/10 border-purple-500/30 text-purple-900 dark:text-purple-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 shrink-0" />
                    <div>
                      <h4 className="text-[13px] font-bold">
                        {targetType === "ESSAY" && "أنت الآن في وضع استيراد الأسئلة المقالية المنفصل"}
                        {targetType === "MCQ" && "أنت الآن في وضع استيراد اختيار من متعدد (MCQ) المنفصل"}
                        {targetType === "TRUE_FALSE" && "أنت الآن في وضع استيراد صواب وخطأ المنفصل"}
                      </h4>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        {targetType === "ESSAY" &&
                          "يتم استخراج نص السؤال، الإجابة النموذجية (عناصر الإجابة)، والتفسير والدرجة بصورة منفصلة دون تداخل مع خيارات MCQ."}
                        {targetType === "MCQ" &&
                          "يتم استخراج نصوص الأسئلة مع الخيارات (أ، ب، ج، د) أو (A, B, C, D) وتحديد البديل الصحيح بدقة."}
                        {targetType === "TRUE_FALSE" &&
                          "يتم استخراج العبارات وتعيين خياري (صواب / خطأ) تلقائياً مع توفير أزرار تحكم سريعة."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectTargetType("ALL")}
                    className="text-[11px] font-bold underline shrink-0 hover:opacity-80 cursor-pointer"
                  >
                    التبديل إلى استيراد شامل
                  </button>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-4">
                <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#800020]" />
                  <span>تحديد المنهج والمكان الأكاديمي للأسئلة</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#64748B] mb-1">
                      الصف الدراسي *
                    </label>
                    <select
                      value={selectedGradeId}
                      onChange={(e) => {
                        setSelectedGradeId(e.target.value);
                        setSelectedSubjectId("");
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white"
                    >
                      {grades.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#64748B] mb-1">
                      نوع المدرسة *
                    </label>
                    <select
                      value={selectedSchoolCategory}
                      onChange={(e) => {
                        setSelectedSchoolCategory(e.target.value as "ARABIC" | "LANGUAGES");
                        setSelectedSubjectId("");
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white"
                    >
                      <option value="ARABIC">مدارس عربي (عربي)</option>
                      <option value="LANGUAGES">مدارس لغات (Languages)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#64748B] mb-1">
                      المادة الدراسية *
                    </label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => {
                        setSelectedSubjectId(e.target.value);
                        setSelectedUnitId("");
                        setSelectedLessonId("");
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white"
                    >
                      {eligibleSubjects.length === 0 ? (
                        <option value="">لا توجد مواد مطابقة للفلتر</option>
                      ) : (
                        eligibleSubjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#64748B] mb-1">
                      الوحدة الدراسية (اختياري)
                    </label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => {
                        setSelectedUnitId(e.target.value);
                        setSelectedLessonId("");
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white"
                    >
                      <option value="">بدون وحدة محددة</option>
                      {activeSubject?.units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#64748B] mb-1">
                      الدرس المرتبط (اختياري)
                    </label>
                    <select
                      value={selectedLessonId}
                      onChange={(e) => setSelectedLessonId(e.target.value)}
                      disabled={!selectedUnitId}
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white disabled:opacity-50"
                    >
                      <option value="">بدون درس محدد</option>
                      {activeSubject?.units
                        .find((u) => u.id === selectedUnitId)
                        ?.lessons?.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Allowed Question Types */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                <label className="block text-[13px] font-bold text-[#0F172A] dark:text-white">
                  أنواع الأسئلة المراد استيرادها:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "MCQ" as QuestionType, title: "اختيار من متعدد (MCQ)" },
                    { id: "TRUE_FALSE" as QuestionType, title: "صح أو خطأ (True / False)" },
                    { id: "ESSAY" as QuestionType, title: "أسئلة مقالية (Essay)" },
                  ].map((t) => {
                    const isSelected = allowedTypes.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleAllowedType(t.id)}
                        className={`p-3 rounded-xl border text-[13px] font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#800020]/10 border-[#800020] text-[#800020] dark:text-[#FB7185]"
                            : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                        }`}
                      >
                        <span>{t.title}</span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected
                              ? "bg-[#800020] border-[#800020] text-white"
                              : "border-[#CBD5E1]"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Classification Strategy */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                <label className="block text-[13px] font-bold text-[#0F172A] dark:text-white">
                  آلية تصنيف وتحديد مستوى الصعوبة:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "AUTO" as const,
                      title: "تلقائي ذكي (مستحسن)",
                      desc: "تحليل صيغة السؤال والأفعال لتحديد الصعوبة",
                    },
                    {
                      id: "MANUAL_REVIEW" as const,
                      title: "مراجعة يدوية",
                      desc: "تتطلب اعتماد الصعوبة في منطقة العمل",
                    },
                    {
                      id: "FORCED" as const,
                      title: "مستوى موحد",
                      desc: "تطبيق صعوبة موحدة على كل المستند",
                    },
                  ].map((s) => {
                    const isSelected = strategy === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStrategy(s.id)}
                        className={`p-3 rounded-xl border text-right cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#800020]/10 border-[#800020] text-[#800020] dark:text-[#FB7185]"
                            : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                        }`}
                      >
                        <span className="text-[13px] font-bold block">{s.title}</span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                          {s.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {strategy === "FORCED" && (
                  <div className="pt-2">
                    <label className="block text-[12px] font-bold text-[#64748B] mb-1">
                      اختر المستوى الموحد:
                    </label>
                    <select
                      value={forcedDifficulty}
                      onChange={(e) => setForcedDifficulty(e.target.value as QuestionDifficulty)}
                      className="w-full sm:w-60 h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] font-bold text-[#0F172A] dark:text-white"
                    >
                      <option value="EASY">سهل (Easy)</option>
                      <option value="MEDIUM">متوسط (Medium)</option>
                      <option value="HARD">متقدم (Hard)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Upload File / Paste Text */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInputMode("FILE")}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
                      inputMode === "FILE"
                        ? "bg-[#800020] text-white"
                        : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    رفع ملف Word / PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("PASTE")}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
                      inputMode === "PASTE"
                        ? "bg-[#800020] text-white"
                        : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    لصق نصوص الأسئلة مباشرة
                  </button>
                </div>

                <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  المادة: <strong className="text-[#0F172A] dark:text-white">{activeSubject?.name}</strong>
                </span>
              </div>

              {analysisError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[13px] font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {inputMode === "FILE" ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-[#CBD5E1] dark:border-[#475569] rounded-2xl text-center bg-[#F8FAFC] dark:bg-[#1E293B]/40 hover:border-[#800020] cursor-pointer transition-colors space-y-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        setAnalysisError(null);
                      }
                    }}
                  />
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#800020] dark:text-[#FB7185]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-[14px] font-bold text-[#0F172A] dark:text-white">
                      {selectedFile ? selectedFile.name : "اضغط لاختيار ملف Word (.docx) أو PDF (.pdf)"}
                    </h5>
                    <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                      يدعم أسئلة الاختيار من متعدد والصواب والخطأ والأسئلة المقالية
                    </p>
                  </div>
                  {selectedFile && (
                    <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-bold">
                      تم اختيار الملف ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-[#64748B]">
                      {targetType === "ESSAY"
                        ? "الصق الأسئلة المقالية (سؤال + إجابة نموذجية + تفسير):"
                        : targetType === "TRUE_FALSE"
                        ? "الصق أسئلة الصواب والخطأ (عبارة + صواب/خطأ + تفسير):"
                        : targetType === "MCQ"
                        ? "الصق أسئلة الاختيار من متعدد مع الخيارات:"
                        : "الصق الأسئلة بالتنسيق المدعوم:"}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Essay templates */}
                      {(targetType === "ESSAY" || targetType === "ALL") && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setPasteText(`[مقالي] [سهل] س1: كيف تطورت تكنولوجيا المعلومات في الفترة من الأربعينيات إلى الستينيات؟

الإجابة النموذجية: ظهرت الحواسيب الإلكترونية مثل ENIAC، وكانت تستخدم الصمامات المفرغة، واستُخدمت أساسًا في الأغراض العسكرية والحسابات العلمية.

التفسير: كانت الحواسيب الأولى كبيرة الحجم، وكان استخدامها يتركز في العمليات الحسابية والعلمية والعسكرية.

المفهوم: بداية ظهور الحواسيب الإلكترونية.
الدرجة: 10

[مقالي] [متوسط] س2: اذكر المراحل الخمس الرئيسية لتطور تكنولوجيا المعلومات.

الإجابة النموذجية:
1. الأربعينيات إلى الستينيات: ظهور الحواسيب الإلكترونية الأولى والصمامات المفرغة.
2. السبعينيات: ظهور المعالجات الدقيقة والحواسيب الشخصية.
3. الثمانينيات: انتشار الشبكات المحلية والأنظمة المدمجة.
4. التسعينيات: انطلاق شبكة الإنترنت والويب.
5. القرن الحادي والعشرون: الحوسبة السحابية والهواتف الذكية والذكاء الاصطناعي.

التفسير: يركز التطور على التدرج من الصمامات المفرغة إلى الذكاء الاصطناعي والحوسبة السحابية.

المفهوم: مراحل تطور تكنولوجيا المعلومات.`);
                            }}
                            className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            + إدراج مثال مقالي (س1، س2)
                          </button>
                        </>
                      )}

                      {/* True/False template */}
                      {(targetType === "TRUE_FALSE" || targetType === "ALL") && (
                        <button
                          type="button"
                          onClick={() => {
                            setPasteText(`1. تعتبر الصمامات المفرغة من مكونات الجيل الأول للحواسيب.
الإجابة: صواب
التفسير: استخدمت الحواسيب الأولى في الأربعينيات والخمسينيات الصمامات المفرغة في معالجة البيانات.

2. ظهرت الحواسيب الشخصية في فترة الأربعينيات.
الإجابة: خطأ
التفسير: ظهرت الحواسيب الشخصية في السبعينيات مع اختراع المعالجات الدقيقة.`);
                          }}
                          className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
                        >
                          + إدراج مثال صواب وخطأ
                        </button>
                      )}

                      {/* MCQ templates */}
                      {(targetType === "MCQ" || targetType === "ALL") && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setPasteText(`Question 1: ما المقصود بالذكاء الاصطناعي (AI)؟

A) مجال يهدف إلى تطوير أنظمة حاسوبية تستطيع تنفيذ مهام تتطلب عادةً ذكاءً بشريًا
B) نظام مخصص لتخزين الملفات فقط
C) وسيلة لتوصيل أجهزة الحاسب بالإنترنت فقط
D) برنامج يستخدم لإنشاء الصور فقط

Correct Answer: A

Explanation: الذكاء الاصطناعي مجال يضم أنظمة حاسوبية تستطيع تنفيذ مهام مثل التعلم والتنبؤ والتعرف وتوليد المحتوى واتخاذ القرارات أو دعمها.`);
                            }}
                            className="text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            + إدراج مثال MCQ (A, B, C, D)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPasteText(`1. ما هي عاصمة جمهورية مصر العربية؟
*أ) القاهرة
ب) الإسكندرية
ج) الأقصر
د) أسوان
التفسير: القاهرة هي العاصمة السياسية الرسمية.`);
                            }}
                            className="text-[11px] font-bold text-[#800020] hover:underline cursor-pointer"
                          >
                            + إدراج مثال MCQ (أ، ب، ج، د)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <textarea
                    rows={10}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={
                      targetType === "ESSAY"
                        ? "الصق الأسئلة المقالية مع الإجابة النموذجية والتفسير هنا..."
                        : targetType === "TRUE_FALSE"
                        ? "الصق عبارات الصواب والخطأ هنا..."
                        : "الصق نصوص الأسئلة هنا..."
                    }
                    className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Staging Review & Verification */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-bold text-[#0F172A] dark:text-white">
                    الأسئلة المستخرجة في منطقة العمل: {stagedQuestions.length}
                  </span>
                  <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    معتمد: {approvedQuestionIds.size}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSelectAllValid}
                  className="text-[12px] font-bold text-[#800020] hover:underline cursor-pointer"
                >
                  تحديد / إلغاء تحديد كل الأسئلة الجاهزة
                </button>
              </div>

              {/* Filters for Staging Area */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث في الأسئلة المستخرجة..."
                    className="w-full h-9 pr-9 pl-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[12px] font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[12px] font-bold text-[#0F172A] dark:text-white"
                >
                  <option value="ALL">كل الحالات ({stagedQuestions.length})</option>
                  <option value="APPROVED">جاهز للاعتماد</option>
                  <option value="NEEDS_CHANGES">يحتاج تدقيق</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[12px] font-bold text-[#0F172A] dark:text-white"
                >
                  <option value="ALL">كل الأنواع</option>
                  <option value="MCQ">اختيار من متعدد</option>
                  <option value="TRUE_FALSE">صح أو خطأ</option>
                  <option value="ESSAY">مقالي</option>
                </select>
              </div>

              {/* Staged Questions List */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {visibleStagedQuestions.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-[#CBD5E1] text-center text-[#94A3B8] text-[13px] font-bold">
                    لا توجد أسئلة تطابق معايير الفلترة
                  </div>
                ) : (
                  visibleStagedQuestions.map((q, idx) => {
                    const isApproved = approvedQuestionIds.has(q.id);
                    const isExpanded = expandedQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        className={`p-3.5 rounded-xl border transition-colors ${
                          isApproved
                            ? "bg-emerald-50/20 border-emerald-300 dark:border-emerald-800"
                            : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155]"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isApproved}
                            onChange={() => handleToggleApprove(q.id)}
                            className="w-4 h-4 mt-1 accent-[#800020] rounded cursor-pointer"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[12px] font-bold text-[#800020]">
                                  #{idx + 1}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F1F5F9] text-[#475569]">
                                  {q.type === "MCQ" ? "اختيار من متعدد" : q.type === "TRUE_FALSE" ? "صح وخطأ" : "مقالي"}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  {q.difficulty}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    q.isValid
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                                >
                                  {q.isValid ? "صالح للاعتماد" : "يحتاج مراجعة"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                                  className="text-[11px] font-bold text-[#800020] hover:underline cursor-pointer"
                                >
                                  {isExpanded ? "طي" : "تعديل / معاينة"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStagedQuestion(q.id)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="text-[13px] font-bold text-[#0F172A] dark:text-white leading-relaxed">
                              <BidiStatement text={q.statement} />
                            </div>

                            {/* Prominent Model Answer Box for Essay Questions */}
                            {q.type === "ESSAY" && (
                              <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>الإجابة النموذجية (عناصر الحل المقالي):</span>
                                  </span>
                                  <span className="text-[10px] font-bold bg-amber-200/50 dark:bg-amber-800/50 px-2 py-0.5 rounded text-amber-800 dark:text-amber-300">
                                    {q.points || 10} درجات
                                  </span>
                                </div>
                                <div className="text-[12px] whitespace-pre-line leading-relaxed font-medium">
                                  {q.modelAnswer || (
                                    <span className="text-amber-600/70 italic">
                                      لم يتم استخراج إجابة نموذجية تلقائياً (يمكن كتابتها عبر زر التعديل)
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* True / False Instant Quick Pickers */}
                            {q.type === "TRUE_FALSE" && (
                              <div className="mt-2.5 flex items-center gap-2">
                                <span className="text-[11px] font-bold text-[#64748B]">الإجابة المعتمدة:</span>
                                {(() => {
                                  const isTrue = q.options?.find(
                                    (o) =>
                                      o.text.trim() === "صواب" ||
                                      o.text.trim() === "صح" ||
                                      o.text.toLowerCase() === "true"
                                  )?.isCorrect;
                                  const isFalse = q.options?.find(
                                    (o) =>
                                      o.text.trim() === "خطأ" ||
                                      o.text.toLowerCase() === "false"
                                  )?.isCorrect;
                                  return (
                                    <div className="inline-flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleSetTrueFalseAnswer(q.id, "TRUE")}
                                        className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                                          isTrue
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                            : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:border-emerald-500"
                                        }`}
                                      >
                                        ✓ صواب (True)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSetTrueFalseAnswer(q.id, "FALSE")}
                                        className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                                          isFalse
                                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                            : "bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] hover:border-rose-500"
                                        }`}
                                      >
                                        ✗ خطأ (False)
                                      </button>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {/* MCQ Options Display */}
                            {q.type === "MCQ" && q.options && q.options.length > 0 && !isExpanded && (
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {q.options.map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center justify-between ${
                                      opt.isCorrect
                                        ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 font-bold text-emerald-800 dark:text-emerald-300"
                                        : "bg-[#F8FAFC] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"
                                    }`}
                                  >
                                    <span>{opt.text}</span>
                                    {opt.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Scientific Explanation if exists */}
                            {q.correctReason && !isExpanded && (
                              <div className="mt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#0F172A] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
                                <strong className="text-[#0F172A] dark:text-white">التفسير: </strong>
                                {q.correctReason}
                              </div>
                            )}

                            {/* Validation Warning Notes */}
                            {q.validationNotes && q.validationNotes.length > 0 && (
                              <div className="mt-1.5 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>{q.validationNotes.join(" • ")}</span>
                              </div>
                            )}

                            {/* Expanded In-place Editor */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#334155] space-y-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                                    تعديل نص السؤال:
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={q.statement}
                                    onChange={(e) =>
                                      handleUpdateStagedQuestion({ ...q, statement: e.target.value })
                                    }
                                    className="w-full p-2.5 rounded-lg border border-[#E2E8F0] text-[12px] font-bold"
                                  />
                                </div>

                                {/* Essay Editor Fields */}
                                {q.type === "ESSAY" && (
                                  <>
                                    <div>
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <label className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                                          الإجابة النموذجية (عناصر الحل المقالي الكامل):
                                        </label>
                                        {q.modelAnswer && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleUpdateStagedQuestion({
                                                ...q,
                                                modelAnswer: formatModelAnswer(q.modelAnswer || ""),
                                              })
                                            }
                                            title="إعادة تنظيم وترتيب النقاط تلقائياً لتظهر كل نقطة في سطر منفصل"
                                            className="text-[10px] font-bold text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100 bg-amber-200/70 hover:bg-amber-300/80 dark:bg-amber-900/40 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700 transition-colors flex items-center gap-1 cursor-pointer"
                                          >
                                            <Sparkles className="w-3 h-3 text-amber-600" />
                                            <span>ترتيب النقاط أسطر تحت بعض</span>
                                          </button>
                                        )}
                                      </div>
                                      <textarea
                                        rows={5}
                                        value={q.modelAnswer || ""}
                                        onChange={(e) =>
                                          handleUpdateStagedQuestion({ ...q, modelAnswer: e.target.value })
                                        }
                                        placeholder="اكتب عناصر الإجابة والخطوات النموذجية بالتفصيل (ستظهر كل نقطة في سطر مستقل)..."
                                        className="w-full p-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/30 text-[12px] font-medium leading-relaxed whitespace-pre-wrap font-sans"
                                      />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                                          درجة السؤال:
                                        </label>
                                        <input
                                          type="number"
                                          value={q.points || 10}
                                          onChange={(e) =>
                                            handleUpdateStagedQuestion({
                                              ...q,
                                              points: Number(e.target.value) || 10,
                                            })
                                          }
                                          className="w-full h-8 px-2.5 rounded-lg border border-[#E2E8F0] text-[12px] font-bold"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                                          المفهوم المرتبط (اختياري):
                                        </label>
                                        <input
                                          type="text"
                                          value={q.concept || ""}
                                          onChange={(e) =>
                                            handleUpdateStagedQuestion({ ...q, concept: e.target.value })
                                          }
                                          placeholder="اسم المفهوم أو الجزئية..."
                                          className="w-full h-8 px-2.5 rounded-lg border border-[#E2E8F0] text-[12px]"
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* True/False Editor Fields */}
                                {q.type === "TRUE_FALSE" && (
                                  <div>
                                    <label className="block text-[11px] font-bold text-[#64748B] mb-1.5">
                                      الإجابة الصحيحة للعبارة:
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleSetTrueFalseAnswer(q.id, "TRUE")}
                                        className={`px-4 py-1.5 rounded-lg text-[12px] font-bold border transition-colors cursor-pointer ${
                                          q.options?.find((o) => o.text === "صواب")?.isCorrect
                                            ? "bg-emerald-600 text-white border-emerald-600"
                                            : "bg-white border-[#E2E8F0] text-[#64748B]"
                                        }`}
                                      >
                                        ✓ العبارة صواب (True)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSetTrueFalseAnswer(q.id, "FALSE")}
                                        className={`px-4 py-1.5 rounded-lg text-[12px] font-bold border transition-colors cursor-pointer ${
                                          q.options?.find((o) => o.text === "خطأ")?.isCorrect
                                            ? "bg-rose-600 text-white border-rose-600"
                                            : "bg-white border-[#E2E8F0] text-[#64748B]"
                                        }`}
                                      >
                                        ✗ العبارة خطأ (False)
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* MCQ Editor Options */}
                                {q.type === "MCQ" && q.options && q.options.length > 0 && (
                                  <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-[#64748B] block">
                                      خيارات الإجابة (حدد الصحيحة):
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {q.options.map((opt, oIdx) => (
                                        <div
                                          key={oIdx}
                                          className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-[12px] ${
                                            opt.isCorrect
                                              ? "bg-emerald-50 border-emerald-300 font-bold"
                                              : "bg-white border-[#E2E8F0]"
                                          }`}
                                        >
                                          <input
                                            type="text"
                                            value={opt.text}
                                            onChange={(e) => {
                                              const nextOpts = [...q.options];
                                              nextOpts[oIdx].text = e.target.value;
                                              handleUpdateStagedQuestion({ ...q, options: nextOpts });
                                            }}
                                            className="flex-1 bg-transparent focus:outline-none"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const nextOpts = q.options.map((o, i) => ({
                                                ...o,
                                                isCorrect: i === oIdx,
                                              }));
                                              handleUpdateStagedQuestion({ ...q, options: nextOpts });
                                            }}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                              opt.isCorrect
                                                ? "bg-emerald-600 text-white"
                                                : "bg-[#F1F5F9] text-[#64748B]"
                                            }`}
                                          >
                                            {opt.isCorrect ? "صحيحة" : "اجعلها صحيحة"}
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Explanation */}
                                <div>
                                  <label className="block text-[11px] font-bold text-[#64748B] mb-1">
                                    التفسير العلمي:
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={q.correctReason || ""}
                                    onChange={(e) =>
                                      handleUpdateStagedQuestion({ ...q, correctReason: e.target.value })
                                    }
                                    placeholder="التفسير الذي يوضح للطالب سبب صحة الإجابة..."
                                    className="w-full p-2 rounded-lg border border-[#E2E8F0] text-[12px]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Final Approval & Commit Summary */}
          {currentStep === 4 && (
            <div className="space-y-5 text-center py-4">
              {commitSuccess ? (
                <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                    تم اعتماد وحفظ {committedCount} سؤالاً بنجاح في بنك الأسئلة!
                  </h4>
                  <p className="text-[13px] text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                    تم ربط الأسئلة بالمادة والمنهج وحفظ التفسيرات وخيارات الإجابة بدقة.
                  </p>
                  {skippedDuplicates > 0 && (
                    <p className="text-[13px] font-bold text-amber-700 dark:text-amber-300 max-w-md mx-auto">
                      تم تخطي {skippedDuplicates} سؤال مكرر موجود مسبقاً في بنك المادة.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-10 px-6 rounded-xl bg-emerald-700 text-white text-[13px] font-bold hover:bg-emerald-800 cursor-pointer transition-colors"
                  >
                    إغلاق المعالج والعودة للبنك
                  </button>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] space-y-4 text-right">
                  <h4 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#800020]" />
                    <span>ملخص الأسئلة المعتمدة للحفظ النهائي</span>
                  </h4>

                  {commitError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-[13px] font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{commitError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
                      <span className="text-[20px] font-bold text-[#800020] block">
                        {approvedQuestionIds.size}
                      </span>
                      <span className="text-[11px] font-bold text-[#64748B]">إجمالي المعتمد</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
                      <span className="text-[20px] font-bold text-[#0F172A] dark:text-white block">
                        {stagedQuestions.filter((q) => approvedQuestionIds.has(q.id) && q.type === "MCQ").length}
                      </span>
                      <span className="text-[11px] font-bold text-[#64748B]">اختيار من متعدد</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
                      <span className="text-[20px] font-bold text-[#0F172A] dark:text-white block">
                        {stagedQuestions.filter((q) => approvedQuestionIds.has(q.id) && q.type === "TRUE_FALSE").length}
                      </span>
                      <span className="text-[11px] font-bold text-[#64748B]">صح أو خطأ</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]">
                      <span className="text-[20px] font-bold text-[#0F172A] dark:text-white block">
                        {stagedQuestions.filter((q) => approvedQuestionIds.has(q.id) && q.type === "ESSAY").length}
                      </span>
                      <span className="text-[11px] font-bold text-[#64748B]">مقالي</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-1 text-[12px]">
                    <span className="font-bold text-[#0F172A] dark:text-white block">
                      الوجهة الأكاديمية:
                    </span>
                    <p className="text-[#64748B]">
                      المادة: {activeSubject?.name} • الفئة: {selectedSchoolCategory === "ARABIC" ? "مدارس عربي" : "مدارس لغات"}
                      {selectedUnitId ? ` • الوحدة: ${activeSubject?.units.find((u) => u.id === selectedUnitId)?.title}` : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && !commitSuccess && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="h-10 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer transition-colors"
              >
                السابق
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer transition-colors"
            >
              إلغاء
            </button>

            {currentStep === 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!selectedSubjectId}
                className="h-10 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
              >
                <span>المتابعة لرفع الملف</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleStartExtraction}
                disabled={isAnalyzing}
                className="h-10 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ استخراج الأسئلة للمنطقة المؤقتة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>استخراج الأسئلة لمنطقة العمل</span>
                  </>
                )}
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                disabled={approvedQuestionIds.size === 0}
                className="h-10 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
              >
                <span>متابعة لاعتماد ({approvedQuestionIds.size}) سؤال</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {currentStep === 4 && !commitSuccess && (
              <button
                type="button"
                onClick={handleCommitToBank}
                disabled={isCommitting || approvedQuestionIds.size === 0}
                className="h-10 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
              >
                {isCommitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ اعتماد الأسئلة في البنك...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد وحفظ الأسئلة في بنك الأسئلة الآن</span>
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
