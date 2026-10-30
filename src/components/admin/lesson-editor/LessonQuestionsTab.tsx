"use client";

import { useState } from "react";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  FileText,
  AlertCircle,
  Sparkles,
  Loader2,
  Check,
  Info,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Layers,
  Search,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";
import type { LessonQuestionItem, UnitInfo, LessonQuestionOption } from "./types";
import { QuestionImportWizard } from "./QuestionImportWizard";

interface LessonQuestionsTabProps {
  lessonId: string;
  unitInfo: UnitInfo;
  questions: LessonQuestionItem[];
  setQuestions: React.Dispatch<React.SetStateAction<LessonQuestionItem[]>>;
  isLoadingQuestions: boolean;
  onRefreshQuestions: () => void;
}

export function LessonQuestionsTab({
  lessonId,
  unitInfo,
  questions,
  setQuestions,
  isLoadingQuestions,
  onRefreshQuestions,
}: LessonQuestionsTabProps) {
  // Modal states
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");

  // Inline editing question ID
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    statement: string;
    type: "MCQ" | "TRUE_FALSE" | "ESSAY";
    difficulty: "EASY" | "MEDIUM" | "HARD";
    options: LessonQuestionOption[];
    correctReason: string;
    modelAnswer: string;
  } | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Single Question Add Form State
  const [newStatement, setNewStatement] = useState("");
  const [newType, setNewType] = useState<"MCQ" | "TRUE_FALSE" | "ESSAY">("MCQ");
  const [newDifficulty, setNewDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [newOptions, setNewOptions] = useState<LessonQuestionOption[]>([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [newTfAnswer, setNewTfAnswer] = useState<boolean>(true);
  const [newExplanation, setNewExplanation] = useState("");
  const [newModelAnswer, setNewModelAnswer] = useState("");
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [addErrorMsg, setAddErrorMsg] = useState<string | null>(null);

  // Expanded cards (by default all open or toggled)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Template sample text for teachers
  const sampleTemplateText = `[سهل] [اختياري]
1. ما هي عاصمة جمهورية مصر العربية؟
*أ) القاهرة
ب) الإسكندرية
ج) الأقصر
د) أسوان
التفسير: القاهرة هي العاصمة السياسية الرسمية لمصر.

---

[متوسط] [صح وخطأ]
2. تقع مدينة الإسكندرية على ساحل البحر الأحمر. (خطأ)
التفسير: تقع الإسكندرية على ساحل البحر الأبيض المتوسط.

---

[صعب] [مقالي]
3. علل: تنوع الأقاليم المناخية في جمهورية مصر العربية؟
نموذج الإجابة: يرجع ذلك لاتساع مساحة مصر وتنوع مظاهر السطح من مرتفعات وسهول وتأثير الموقع الجغرافي بالنسبة للمسطحات المائية.`;

  const handleCopySample = () => {
    navigator.clipboard.writeText(sampleTemplateText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const toggleCardExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  // Open Add Single Question Modal
  const openNewQuestionModal = () => {
    setNewStatement("");
    setNewType("MCQ");
    setNewDifficulty("MEDIUM");
    setNewOptions([
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setNewTfAnswer(true);
    setNewExplanation("");
    setNewModelAnswer("");
    setAddErrorMsg(null);
    setShowAddModal(true);
  };

  // Save Single Question
  const handleSaveSingleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatement.trim()) {
      setAddErrorMsg("نص السؤال مطلوب");
      return;
    }
    if (!unitInfo.subjectId) {
      setAddErrorMsg("تعذر تحديد المادة الدراسية المرتبطة بهذا الدرس");
      return;
    }

    setIsSubmittingNew(true);
    setAddErrorMsg(null);

    try {
      let finalOptions: any[] = [];
      if (newType === "MCQ") {
        const filled = newOptions.filter((o) => o.text.trim().length > 0);
        if (filled.length < 2) {
          throw new Error("يجب كتابة خيارين على الأقل لسؤال الاختيار من متعدد");
        }
        if (!newOptions.some((o) => o.isCorrect)) {
          throw new Error("يرجى تحديد الإجابة الصحيحة بالضغط على الدائرة الخضراء");
        }
        finalOptions = newOptions.map((o, idx) => ({
          text: o.text.trim() || `الخيار ${idx + 1}`,
          isCorrect: o.isCorrect,
          order: idx,
        }));
      } else if (newType === "TRUE_FALSE") {
        finalOptions = [
          { text: "صواب", isCorrect: newTfAnswer === true, order: 0 },
          { text: "خطأ", isCorrect: newTfAnswer === false, order: 1 },
        ];
      }

      const payload = {
        statement: newStatement.trim(),
        type: newType,
        difficulty: newDifficulty,
        subjectId: unitInfo.subjectId,
        unitId: unitInfo.unitId || undefined,
        lessonId: lessonId,
        options: finalOptions,
        concept: newExplanation.trim() ? "شرح الحل" : undefined,
        correctReason: newExplanation.trim() || undefined,
        modelAnswer: newType === "ESSAY" ? newModelAnswer.trim() || undefined : undefined,
      };

      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ السؤال");
      }

      setShowAddModal(false);
      onRefreshQuestions();
    } catch (err: any) {
      setAddErrorMsg(err.message || "حدث خطأ أثناء حفظ السؤال");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Start inline editing of an existing question
  const startEditingQuestion = (q: LessonQuestionItem) => {
    setEditingQuestionId(q.id);
    setEditError(null);
    setEditForm({
      statement: q.statement,
      type: q.type,
      difficulty: q.difficulty,
      options: q.options ? JSON.parse(JSON.stringify(q.options)) : [],
      correctReason: q.explanation?.correctReason || "",
      modelAnswer: (q as any).rubric?.modelAnswer || "",
    });
  };

  const cancelEditingQuestion = () => {
    setEditingQuestionId(null);
    setEditForm(null);
    setEditError(null);
  };

  // Save inline edit
  const handleSaveInlineEdit = async (questionId: string) => {
    if (!editForm) return;
    if (!editForm.statement.trim()) {
      setEditError("نص السؤال لا يمكن أن يكون فارغاً");
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const payload: any = {
        statement: editForm.statement.trim(),
        type: editForm.type,
        difficulty: editForm.difficulty,
        options: editForm.options,
        concept: editForm.correctReason.trim() ? "شرح الحل" : undefined,
        correctReason: editForm.correctReason.trim() || undefined,
        modelAnswer: editForm.type === "ESSAY" ? editForm.modelAnswer.trim() || undefined : undefined,
      };

      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ التعديلات");
      }

      // Update local state
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === questionId
            ? {
                ...item,
                statement: editForm.statement.trim(),
                type: editForm.type,
                difficulty: editForm.difficulty,
                options: editForm.options,
                explanation: editForm.correctReason.trim()
                  ? { concept: "شرح الحل", correctReason: editForm.correctReason.trim() }
                  : null,
                rubric: editForm.type === "ESSAY" && editForm.modelAnswer.trim()
                  ? { modelAnswer: editForm.modelAnswer.trim() }
                  : undefined,
              }
            : item
        )
      );

      setEditingQuestionId(null);
      setEditForm(null);
    } catch (err: any) {
      setEditError(err.message || "حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال من بنك أسئلة الدرس نهائياً؟")) return;
    setDeletingId(questionId);

    try {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "فشل حذف السؤال");
      }
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حذف السؤال");
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics
  const totalCount = questions.length;
  const mcqCount = questions.filter((q) => q.type === "MCQ").length;
  const tfCount = questions.filter((q) => q.type === "TRUE_FALSE").length;
  const essayCount = questions.filter((q) => q.type === "ESSAY").length;
  const easyCount = questions.filter((q) => q.difficulty === "EASY").length;
  const medCount = questions.filter((q) => q.difficulty === "MEDIUM").length;
  const hardCount = questions.filter((q) => q.difficulty === "HARD").length;

  // Filtered
  const filtered = questions.filter((q) => {
    if (searchQuery.trim() && !q.statement.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
      return false;
    }
    if (typeFilter !== "ALL" && q.type !== typeFilter) return false;
    if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  return (
    <div dir="rtl" className="space-y-6 text-right font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP HERO & CONTROL TOOLBAR (NAVY & BURGUNDY ACCENTS)
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-sm border border-slate-700">
            <HelpCircle className="w-7 h-7 text-blue-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
                بنك أسئلة وتدريبات الدرس
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold border border-slate-300 dark:border-slate-700">
                {totalCount} سؤالاً مسجلاً
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold border border-blue-200/60">
                {unitInfo.schoolCategory === "LANGUAGES" ? "Languages Track" : "مسار عربي"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              إدارة بنك الأسئلة للدرس مع دعم استيراد Word الذكي، المراجعة قبل الاعتماد، وتحديد مستويات الصعوبة بدقة.
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={openNewQuestionModal}
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة سؤال</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportWizard(true)}
            className="h-10 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>معالج استيراد Word (Wizard 4 مراحل)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="دليل التنسيق والصعوبة"
          >
            <Info className="w-4 h-4 text-blue-600" />
            <span>دليل التنسيق</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. KPI METRICS CARDS (TOTAL, TYPES, DIFFICULTIES)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-center space-y-0.5 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-bold block">إجمالي الأسئلة</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {totalCount}
          </span>
        </div>

        {/* MCQ */}
        <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-center space-y-0.5 shadow-2xs">
          <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold block">
            🎯 اختيار من متعدد
          </span>
          <span className="text-xl font-bold font-mono text-blue-800 dark:text-blue-200">
            {mcqCount}
          </span>
        </div>

        {/* True/False */}
        <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-center space-y-0.5 shadow-2xs">
          <span className="text-[11px] text-purple-700 dark:text-purple-300 font-bold block">
            ⚖️ صح أم خطأ
          </span>
          <span className="text-xl font-bold font-mono text-purple-800 dark:text-purple-200">
            {tfCount}
          </span>
        </div>

        {/* Essay */}
        <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-center space-y-0.5 shadow-2xs">
          <span className="text-[11px] text-amber-700 dark:text-amber-300 font-bold block">
            📝 مقالي
          </span>
          <span className="text-xl font-bold font-mono text-amber-800 dark:text-amber-200">
            {essayCount}
          </span>
        </div>

        {/* Easy */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-center space-y-0.5 shadow-2xs">
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold block">
            🟢 سهل
          </span>
          <span className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-200">
            {easyCount}
          </span>
        </div>

        {/* Hard / Med */}
        <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-center space-y-0.5 shadow-2xs">
          <span className="text-[11px] text-rose-700 dark:text-rose-300 font-bold block">
            🔴 صعب ({hardCount}) / 🟡 ({medCount})
          </span>
          <span className="text-xl font-bold font-mono text-rose-800 dark:text-rose-200">
            {hardCount + medCount}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH & FILTER BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في نص السؤال..."
            className="w-full pr-9 pl-4 py-1.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">النوع:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            >
              <option value="ALL">الكل ({totalCount})</option>
              <option value="MCQ">اختيار من متعدد ({mcqCount})</option>
              <option value="TRUE_FALSE">صح وخطأ ({tfCount})</option>
              <option value="ESSAY">مقالي ({essayCount})</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">الصعوبة:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
            >
              <option value="ALL">جميع المستويات</option>
              <option value="EASY">سهل ({easyCount})</option>
              <option value="MEDIUM">متوسط ({medCount})</option>
              <option value="HARD">صعب ({hardCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. QUESTIONS LIST / EXPANDABLE / EDITABLE CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {isLoadingQuestions ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-bold text-slate-500">جارٍ جلب وتحديث أسئلة الدرس...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 mx-auto flex items-center justify-center">
              <HelpCircle className="w-8 h-8 opacity-70" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                لا توجد أسئلة مسجلة في هذا التصنيف بعد
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                استخدم معالج استيراد Word الذكي لرفع الأسئلة ومراجعتها قبل الحفظ، أو أضف سؤالاً يدوياً الآن.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={openNewQuestionModal}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سؤال يدوياً</span>
              </button>
              <button
                type="button"
                onClick={() => setShowImportWizard(true)}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>معالج استيراد Word</span>
              </button>
            </div>
          </div>
        ) : (
          filtered.map((q, idx) => {
            const isDeleting = deletingId === q.id;
            const isEditing = editingQuestionId === q.id;
            const isExpanded = expandedCards[q.id] !== false; // expanded by default

            if (isEditing && editForm) {
              // ─────────────────────────────────────────────
              // INLINE EDITING CARD
              // ─────────────────────────────────────────────
              return (
                <div
                  key={q.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border-2 border-blue-500 shadow-md space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4" />
                      <span>تعديل السؤال #{idx + 1}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelEditingQuestion}
                        className="px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveInlineEdit(q.id)}
                        disabled={isSavingEdit}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isSavingEdit ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>حفظ التعديل</span>
                      </button>
                    </div>
                  </div>

                  {editError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold">
                      {editError}
                    </div>
                  )}

                  {/* Type and Difficulty Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">نوع السؤال:</label>
                      <select
                        value={editForm.type}
                        onChange={(e) =>
                          setEditForm({ ...editForm, type: e.target.value as any })
                        }
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs font-bold outline-none"
                      >
                        <option value="MCQ">🎯 اختيار من متعدد</option>
                        <option value="TRUE_FALSE">⚖️ صح أم خطأ</option>
                        <option value="ESSAY">📝 مقالي</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500">مستوى الصعوبة:</label>
                      <select
                        value={editForm.difficulty}
                        onChange={(e) =>
                          setEditForm({ ...editForm, difficulty: e.target.value as any })
                        }
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs font-bold outline-none"
                      >
                        <option value="EASY">🟢 سهل</option>
                        <option value="MEDIUM">🟡 متوسط</option>
                        <option value="HARD">🔴 صعب</option>
                      </select>
                    </div>
                  </div>

                  {/* Statement input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">نص السؤال:</label>
                    <textarea
                      rows={3}
                      value={editForm.statement}
                      onChange={(e) => setEditForm({ ...editForm, statement: e.target.value })}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-xs font-bold text-slate-900 dark:text-white leading-relaxed resize-y outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Options for MCQ / True-False */}
                  {editForm.type !== "ESSAY" && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 block">
                        الخيارات (انقر على الدائرة لتحديد الإجابة الصحيحة):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {editForm.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                              opt.isCorrect
                                ? "bg-emerald-50/70 border-emerald-400 text-emerald-900"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = editForm.options.map((o, idx) => ({
                                  ...o,
                                  isCorrect: idx === oIdx,
                                }));
                                setEditForm({ ...editForm, options: newOpts });
                              }}
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold cursor-pointer ${
                                opt.isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "border border-slate-300 text-slate-400"
                              }`}
                            >
                              {opt.isCorrect ? <Check className="w-3.5 h-3.5" /> : String.fromCharCode(65 + oIdx)}
                            </button>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const newOpts = [...editForm.options];
                                newOpts[oIdx] = { ...newOpts[oIdx], text: e.target.value };
                                setEditForm({ ...editForm, options: newOpts });
                              }}
                              className="flex-1 bg-transparent border-none text-xs font-bold outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explanation / Model Answer */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">
                      {editForm.type === "ESSAY" ? "نموذج الإجابة للسؤال المقالي:" : "تفسير وشرح الحل:"}
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.type === "ESSAY" ? editForm.modelAnswer : editForm.correctReason}
                      onChange={(e) => {
                        if (editForm.type === "ESSAY") {
                          setEditForm({ ...editForm, modelAnswer: e.target.value });
                        } else {
                          setEditForm({ ...editForm, correctReason: e.target.value });
                        }
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-xs outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>
                </div>
              );
            }

            // ─────────────────────────────────────────────
            // REGULAR DISPLAY CARD (EXPANDABLE & FULL TEXT)
            // ─────────────────────────────────────────────
            return (
              <div
                key={q.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      #{idx + 1}
                    </span>

                    {/* Type Badge */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        q.type === "MCQ"
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          : q.type === "TRUE_FALSE"
                          ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {q.type === "MCQ"
                        ? "🎯 اختيار من متعدد"
                        : q.type === "TRUE_FALSE"
                        ? "⚖️ صح أم خطأ"
                        : "📝 سؤال مقالي"}
                    </span>

                    {/* Difficulty Badge */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                        q.difficulty === "EASY"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                          : q.difficulty === "MEDIUM"
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200"
                          : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200"
                      }`}
                    >
                      {q.difficulty === "EASY"
                        ? "🟢 سهل"
                        : q.difficulty === "MEDIUM"
                        ? "🟡 متوسط"
                        : "🔴 صعب"}
                    </span>
                  </div>

                  {/* Actions: Edit, Delete, Expand */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEditingQuestion(q)}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      disabled={isDeleting}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer disabled:opacity-50"
                      title="حذف السؤال"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCardExpand(q.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={isExpanded ? "طي السؤال" : "توسيع السؤال"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Question Statement (NEVER truncated, full text, break-words) */}
                <div className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap break-words">
                  {q.statement}
                </div>

                {/* Expanded Details: Options, Explanations, Rubric */}
                {isExpanded && (
                  <div className="space-y-3 pt-1">
                    {/* Options for MCQ / True-False */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 transition-all ${
                              opt.isCorrect
                                ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold"
                                : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                opt.isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {opt.isCorrect ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                String.fromCharCode(65 + optIdx)
                              )}
                            </span>
                            <span className="break-words leading-relaxed">{opt.text}</span>
                            {opt.isCorrect && (
                              <span className="mr-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/10 text-emerald-700 font-bold shrink-0">
                                إجابة صحيحة
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation?.correctReason && (
                      <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>توضيح وتفسير الإجابة الصحيحة:</span>
                        </span>
                        <p className="leading-relaxed whitespace-pre-wrap break-words">
                          {q.explanation.correctReason}
                        </p>
                      </div>
                    )}

                    {/* Essay Rubric */}
                    {(q as any).rubric?.modelAnswer && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                          <span>نموذج الإجابة للسؤال المقالي:</span>
                        </span>
                        <p className="leading-relaxed whitespace-pre-wrap break-words">
                          {(q as any).rubric.modelAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: ADD SINGLE QUESTION
      ───────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans text-right">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    إضافة سؤال تدريبي جديد
                  </h4>
                  <p className="text-[11px] text-slate-500">{unitInfo.unitTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSingleQuestion} className="flex-1 overflow-y-auto p-6 space-y-5">
              {addErrorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addErrorMsg}</span>
                </div>
              )}

              {/* Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  1. نوع السؤال *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewType("MCQ")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newType === "MCQ"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <span>🎯</span>
                    <span>اختيار من متعدد</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("TRUE_FALSE")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newType === "TRUE_FALSE"
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <span>⚖️</span>
                    <span>صح أم خطأ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("ESSAY")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newType === "ESSAY"
                        ? "border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <span>📝</span>
                    <span>سؤال مقالي</span>
                  </button>
                </div>
              </div>

              {/* Difficulty Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  2. مستوى الصعوبة *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewDifficulty("EASY")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newDifficulty === "EASY"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>🟢</span>
                    <span>سهل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDifficulty("MEDIUM")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newDifficulty === "MEDIUM"
                        ? "border-amber-500 bg-amber-50 text-amber-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>🟡</span>
                    <span>متوسط</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDifficulty("HARD")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newDifficulty === "HARD"
                        ? "border-red-500 bg-red-50 text-red-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>🔴</span>
                    <span>صعب</span>
                  </button>
                </div>
              </div>

              {/* Statement */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  3. نص السؤال *
                </label>
                <textarea
                  rows={3}
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="اكتب صيغة السؤال هنا..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white leading-relaxed resize-none outline-none focus:border-blue-500"
                />
              </div>

              {/* Options for MCQ */}
              {newType === "MCQ" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    4. خيارات الإجابة (اضغط على الدائرة لتحديد الخيار الصحيح) *
                  </label>
                  <div className="space-y-2">
                    {newOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewOptions(
                              newOptions.map((o, oIdx) => ({
                                ...o,
                                isCorrect: oIdx === idx,
                              }))
                            );
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold cursor-pointer transition-all ${
                            opt.isCorrect
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "border border-slate-300 hover:border-emerald-500 text-slate-400"
                          }`}
                        >
                          {opt.isCorrect ? <Check className="w-4 h-4" /> : String.fromCharCode(65 + idx)}
                        </button>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const updated = [...newOptions];
                            updated[idx].text = e.target.value;
                            setNewOptions(updated);
                          }}
                          placeholder={`الخيار ${idx + 1}`}
                          className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Options for True/False */}
              {newType === "TRUE_FALSE" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    4. حدد الإجابة الصحيحة للعبارة *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewTfAnswer(true)}
                      className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                        newTfAnswer === true
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>✔️ صواب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTfAnswer(false)}
                      className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                        newTfAnswer === false
                          ? "border-red-600 bg-red-50 text-red-700 shadow-xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>❌ خطأ</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Model Answer for Essay */}
              {newType === "ESSAY" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    4. نموذج الإجابة وتوزيع الدرجات
                  </label>
                  <textarea
                    rows={3}
                    value={newModelAnswer}
                    onChange={(e) => setNewModelAnswer(e.target.value)}
                    placeholder="اكتب الحل النموذجي والنقاط المطلوبة..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  5. توضيح وتفسير الإجابة (يظهر للطالب بعد الحل)
                </label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="لماذا هذه هي الإجابة الصحيحة؟..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmittingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>حفظ السؤال في الدرس</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: IMPORT WIZARD (4-STAGE FULL REVIEW WORKFLOW)
      ───────────────────────────────────────────────────────────── */}
      <QuestionImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        lessonId={lessonId}
        unitInfo={unitInfo}
        onImportSuccess={() => {
          onRefreshQuestions();
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: FORMATTING & DIFFICULTY GUIDE
      ───────────────────────────────────────────────────────────── */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans text-right">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    دليل تنسيق الأسئلة ومستويات الصعوبة
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    كيف يكتشف النظام أنواع الأسئلة والصعوبة تلقائياً عند الرفع
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border space-y-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  1. تحديد مستوى الصعوبة
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  اكتب وسم الصعوبة في بداية السؤال بين معقوفين <code>[ ]</code>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    <code>[سهل]</code> لأسئلة التذكر والمفاهيم 🟢
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 font-bold border border-amber-200">
                    <code>[متوسط]</code> لأسئلة الفهم والتطبيق 🟡
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-800 font-bold border border-red-200">
                    <code>[صعب]</code> لأسئلة المهارات العليا 🔴
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border space-y-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  2. أنواع الأسئلة والإجابات
                </h5>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                  <li>
                    <strong>🎯 اختيار من متعدد:</strong> رتب الخيارات كـ <code>أ) ب) ج) د)</code> وضع نجمة <code>*</code> أمام الخيار الصحيح.
                  </li>
                  <li>
                    <strong>⚖️ صح أم خطأ:</strong> اكتب في نهاية العبارة <code>(صح)</code> أو <code>(خطأ)</code>.
                  </li>
                  <li>
                    <strong>📝 مقالي:</strong> ابدأ السؤال بكلمات مثل <code>علل:</code>، <code>ما النتائج:</code> واكتب تحته <code>نموذج الإجابة: ...</code>
                  </li>
                </ul>
              </div>

              {/* Sample Template Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">نموذج جاهز للنسخ:</span>
                  <button
                    type="button"
                    onClick={handleCopySample}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1.5 cursor-pointer bg-blue-50 px-3 py-1 rounded-lg"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copySuccess ? "تم النسخ بنجاح!" : "نسخ النموذج"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {sampleTemplateText}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                فهمت، حسناً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
