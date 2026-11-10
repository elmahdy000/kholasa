"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Edit3,
  HelpCircle,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  ARABIC_ORIGIN_LABELS,
  ARABIC_SKILL_LABELS,
  type ArabicQuestionOriginEnum,
  type ArabicSkillCategory,
} from "@/lib/arabic-curriculum";
import type {
  ArabicEditorQuestionRecord,
  ArabicNormalizedSection,
} from "./types";

const CHOICE_LETTERS = ["أ", "ب", "ج", "د", "هـ", "و"];

const TYPE_LABELS: Record<"MCQ" | "TRUE_FALSE" | "ESSAY", string> = {
  MCQ: "اختيار من متعدد",
  TRUE_FALSE: "صواب / خطأ",
  ESSAY: "سؤال مقالي / تعبير / قراءة",
};

const DIFFICULTY_LABELS: Record<"EASY" | "MEDIUM" | "HARD", string> = {
  EASY: "سهل",
  MEDIUM: "متوسط",
  HARD: "متقدم",
};

interface QuestionDraftForm {
  questionId?: string;
  externalKey: string;
  statement: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sectionAnchorId: string;
  skillCategory: string;
  origin: string;
  concept: string;
  correctReason: string;
  examTrick: string;
  modelAnswer: string;
  points: number;
  sourceId: string;
  pagesText: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  inPracticeStage: boolean;
  inFinalAssessment: boolean;
}

interface ArabicQuestionsTabProps {
  lessonId: string;
  sections: ArabicNormalizedSection[];
  questions: ArabicEditorQuestionRecord[];
  practiceQuestionIds: string[];
  finalQuestionIds: string[];
  onQuestionSaved: (
    saved: ArabicEditorQuestionRecord,
    membership?: { externalKey: string; inPractice: boolean; inFinal: boolean }
  ) => void;
  onQuestionDeleted: (questionId: string, externalKey: string | null) => void;
}

export function ArabicQuestionsTab({
  lessonId,
  sections,
  questions,
  practiceQuestionIds,
  finalQuestionIds,
  onQuestionSaved,
  onQuestionDeleted,
}: ArabicQuestionsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [scopeFilter, setScopeFilter] = useState<string>("ALL");
  const [sectionFilter, setSectionFilter] = useState<string>("ALL");

  const [editingDraft, setEditingDraft] = useState<QuestionDraftForm | null>(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const practiceSet = useMemo(() => new Set(practiceQuestionIds), [practiceQuestionIds]);
  const finalSet = useMemo(() => new Set(finalQuestionIds), [finalQuestionIds]);

  const filteredQuestions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return questions.filter((q) => {
      if (typeFilter !== "ALL" && q.type !== typeFilter) return false;

      const anchor = q.explanation?.section?.anchorId || "";
      if (sectionFilter !== "ALL" && anchor !== sectionFilter) return false;

      const key = q.externalKey || q.id;
      if (scopeFilter === "PRACTICE" && !practiceSet.has(key)) return false;
      if (scopeFilter === "FINAL" && !finalSet.has(key)) return false;

      if (query) {
        const hay = `${q.statement} ${q.externalKey || ""} ${q.id} ${
          q.explanation?.correctReason || ""
        }`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      return true;
    });
  }, [questions, searchTerm, typeFilter, scopeFilter, sectionFilter, practiceSet, finalSet]);

  const openEditModal = (q: ArabicEditorQuestionRecord) => {
    const key = q.externalKey || q.id;
    const firstRef = Array.isArray(q.sourceReferences) && q.sourceReferences.length > 0
      ? q.sourceReferences[0]
      : null;

    setQuestionError(null);
    setEditingDraft({
      questionId: q.id,
      externalKey: q.externalKey || "",
      statement: q.statement,
      type: q.type,
      difficulty: q.difficulty,
      sectionAnchorId: q.explanation?.section?.anchorId || sections[0]?.id || "u1-l1-s01",
      skillCategory: q.skillCategory || "general",
      origin: q.origin || "KHOLASA_ORIGINAL",
      concept: q.explanation?.concept || "",
      correctReason: q.explanation?.correctReason || "",
      examTrick: q.explanation?.examTrick || "",
      modelAnswer: q.rubric?.modelAnswer || "",
      points: q.rubric?.maxScore || 2,
      sourceId: firstRef?.sourceId || "student_book",
      pagesText: firstRef?.pages ? firstRef.pages.join(", ") : "",
      options:
        q.options.length > 0
          ? q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))
          : q.type === "TRUE_FALSE"
          ? [
              { text: "صواب", isCorrect: true },
              { text: "خطأ", isCorrect: false },
            ]
          : q.type === "MCQ"
          ? [
              { text: "", isCorrect: true },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
            ]
          : [],
      inPracticeStage: practiceSet.has(key),
      inFinalAssessment: finalSet.has(key),
    });
  };

  const openCreateModal = () => {
    setQuestionError(null);
    const nextNum = questions.length + 1;
    const suggestedKey = `L1Q${String(nextNum).padStart(3, "0")}`;
    setEditingDraft({
      externalKey: suggestedKey,
      statement: "",
      type: "MCQ",
      difficulty: "MEDIUM",
      sectionAnchorId: sections[0]?.id || "u1-l1-s01",
      skillCategory: "reading_comprehension",
      origin: "KHOLASA_ORIGINAL",
      concept: "",
      correctReason: "",
      examTrick: "",
      modelAnswer: "",
      points: 2,
      sourceId: "student_book",
      pagesText: "",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      inPracticeStage: true,
      inFinalAssessment: false,
    });
  };

  const handleChangeDraftType = (nextType: "MCQ" | "TRUE_FALSE" | "ESSAY") => {
    if (!editingDraft) return;
    if (nextType === "TRUE_FALSE") {
      setEditingDraft({
        ...editingDraft,
        type: nextType,
        options: [
          { text: "صواب", isCorrect: true },
          { text: "خطأ", isCorrect: false },
        ],
      });
    } else if (nextType === "MCQ") {
      const existing = editingDraft.options.filter((o) => o.text.trim().length > 0);
      setEditingDraft({
        ...editingDraft,
        type: nextType,
        options:
          existing.length >= 2
            ? existing
            : [
                { text: "", isCorrect: true },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
              ],
      });
    } else {
      setEditingDraft({
        ...editingDraft,
        type: nextType,
        options: [],
      });
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDraft) return;

    if (!editingDraft.statement.trim()) {
      setQuestionError("يرجى كتابة نص السؤال.");
      return;
    }

    const cleanOptions =
      editingDraft.type === "ESSAY"
        ? undefined
        : editingDraft.options.filter((o) => o.text.trim().length > 0);

    if (cleanOptions && (cleanOptions.length < 2 || !cleanOptions.some((o) => o.isCorrect))) {
      setQuestionError("الأسئلة الموضوعية تتطلب خيارين على الأقل وتحديد الإجابة الصحيحة.");
      return;
    }

    const parsedPages = editingDraft.pagesText
      .split(/[,،\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);

    setIsSavingQuestion(true);
    setQuestionError(null);

    try {
      const res = await fetch(`/api/admin/arabic-lessons/${lessonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: editingDraft.questionId || undefined,
          externalKey: editingDraft.externalKey.trim() || undefined,
          statement: editingDraft.statement.trim(),
          type: editingDraft.type,
          difficulty: editingDraft.difficulty,
          sectionAnchorId: editingDraft.sectionAnchorId,
          skillCategory: editingDraft.skillCategory,
          origin: editingDraft.origin,
          concept: editingDraft.concept.trim() || undefined,
          correctReason: editingDraft.correctReason.trim() || undefined,
          examTrick: editingDraft.examTrick.trim() || null,
          modelAnswer:
            editingDraft.type === "ESSAY"
              ? editingDraft.modelAnswer.trim() || ""
              : undefined,
          points: editingDraft.points,
          sourceReferences:
            parsedPages.length > 0
              ? [{ sourceId: editingDraft.sourceId, pages: parsedPages }]
              : undefined,
          options: cleanOptions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ السؤال");
      }

      const savedQuestion: ArabicEditorQuestionRecord = data.question;
      const membershipKey = savedQuestion.externalKey || editingDraft.externalKey.trim() || savedQuestion.id;

      onQuestionSaved(savedQuestion, {
        externalKey: membershipKey,
        inPractice: editingDraft.inPracticeStage,
        inFinal: editingDraft.inFinalAssessment,
      });

      setEditingDraft(null);
    } catch (err) {
      setQuestionError(err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء الحفظ");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (q: ArabicEditorQuestionRecord) => {
    setDeletingId(q.id);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/questions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [q.id] }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "فشل حذف السؤال");
      }
      onQuestionDeleted(q.id, q.externalKey);
      setConfirmDeleteId(null);
    } catch (err) {
      setQuestionError(err instanceof Error ? err.message : "تعذر حذف السؤال");
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => {
    const mcq = questions.filter((q) => q.type === "MCQ").length;
    const tf = questions.filter((q) => q.type === "TRUE_FALSE").length;
    const essay = questions.filter((q) => q.type === "ESSAY").length;
    return { total: questions.length, mcq, tf, essay };
  }, [questions]);

  return (
    <div className="space-y-4">
      {/* Header & Summary */}
      <div className="p-4 rounded-2xl bg-[#FBF8F1] dark:bg-[#071737] border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-[#0F5132] dark:text-emerald-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>بنك أسئلة وتدريبات الدرس ({stats.total} سؤال محفوظ المعرّف)</span>
          </h3>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold text-[#475569] dark:text-[#CBD5E1]">
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#0D214D] border border-slate-200 dark:border-[#1E3A6E]">
              اختيار من متعدد: {stats.mcq}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#0D214D] border border-slate-200 dark:border-[#1E3A6E]">
              صواب / خطأ: {stats.tf}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#0D214D] border border-slate-200 dark:border-[#1E3A6E]">
              مقالي / قراءة / تعبير: {stats.essay}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-[#0F5132] dark:text-emerald-200">
              حل واتعلم: {practiceQuestionIds.length}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200">
              اختبر نفسك: {finalQuestionIds.length}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 min-h-[40px] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سؤال جديد للدرس</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بنص السؤال أو المعرّف L1Q..."
            className="w-full pr-9 pl-3 py-2 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-medium text-[#091B40] dark:text-white"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-bold text-[#091B40] dark:text-white"
        >
          <option value="ALL">كل أنواع الأسئلة ({stats.total})</option>
          <option value="MCQ">اختيار من متعدد ({stats.mcq})</option>
          <option value="TRUE_FALSE">صواب / خطأ ({stats.tf})</option>
          <option value="ESSAY">مقالي / قراءة / تعبير ({stats.essay})</option>
        </select>

        <select
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-bold text-[#091B40] dark:text-white"
        >
          <option value="ALL">كل مراحل الأسئلة</option>
          <option value="PRACTICE">ضمن حل واتعلم ({practiceQuestionIds.length})</option>
          <option value="FINAL">ضمن اختبر نفسك ({finalQuestionIds.length})</option>
        </select>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] text-xs font-bold text-[#091B40] dark:text-white"
        >
          <option value="ALL">كل أقسام الدرس (17)</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.order}. {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Question List */}
      <div className="space-y-2.5">
        {filteredQuestions.map((q, idx) => {
          const key = q.externalKey || q.id;
          const inPractice = practiceSet.has(key);
          const inFinal = finalSet.has(key);
          const firstRef = Array.isArray(q.sourceReferences) ? q.sourceReferences[0] : null;
          const correctOptIdx = q.options.findIndex((o) => o.isCorrect);

          return (
            <div
              key={q.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0D214D] border border-[#E2E8F0] dark:border-[#1E3A6E] space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black">
                  <span className="px-2 py-0.5 rounded-md bg-[#0F2744] text-white tabular-nums">
                    #{idx + 1} • {q.externalKey || "بدون رمز"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#132C60] text-slate-600 dark:text-slate-300 font-mono">
                    ID: {q.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-[#0F5132] dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900">
                    {TYPE_LABELS[q.type]}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200">
                    {DIFFICULTY_LABELS[q.difficulty]}
                  </span>
                  {q.skillCategory && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200">
                      {ARABIC_SKILL_LABELS[q.skillCategory as ArabicSkillCategory] || q.skillCategory}
                    </span>
                  )}
                  {inPractice && (
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200">
                      حل واتعلم
                    </span>
                  )}
                  {inFinal && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-950 dark:text-amber-100">
                      اختبر نفسك
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(q)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0F5132] dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold inline-flex items-center gap-1 hover:bg-emerald-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>

                  {confirmDeleteId === q.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={deletingId === q.id}
                        onClick={() => handleDeleteQuestion(q)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold"
                      >
                        {deletingId === q.id ? "..." : "تأكيد الحذف"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(q.id)}
                      className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="حذف السؤال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm font-bold text-[#091B40] dark:text-white leading-relaxed whitespace-pre-line">
                {q.statement}
              </p>

              {q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={opt.id}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                        opt.isCorrect
                          ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-[#0F5132] dark:text-emerald-200 font-bold"
                          : "bg-slate-50 dark:bg-[#081633] border-slate-200 dark:border-[#1E3A6E] text-[#334155] dark:text-[#CBD5E1]"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-white dark:bg-[#0D214D] border border-current/20 flex items-center justify-center text-[10px] font-black shrink-0">
                        {CHOICE_LETTERS[optIdx] || optIdx + 1}
                      </span>
                      <span className="break-words">{opt.text}</span>
                      {optIdx === correctOptIdx && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-auto shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {q.type === "ESSAY" && q.rubric?.modelAnswer && (
                <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-100">
                  <strong className="font-black">الإجابة النموذجية: </strong>
                  {q.rubric.modelAnswer}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748B] dark:text-[#94A3B8] pt-1 border-t border-slate-100 dark:border-[#1E3A6E]">
                {q.explanation?.section && (
                  <span>القسم: {q.explanation.section.title}</span>
                )}
                {firstRef && firstRef.pages?.length > 0 && (
                  <span>
                    المصدر: {firstRef.sourceId === "assessments" ? "التقييمات الرسمية" : "كتاب الوزارة"} (ص{" "}
                    {firstRef.pages.join("، ")})
                  </span>
                )}
                {q.explanation?.examTrick && (
                  <span className="text-amber-800 dark:text-amber-300 font-bold inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    تركة: {q.explanation.examTrick}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-[#081633] border border-dashed border-slate-300 dark:border-[#1E3A6E] text-xs font-bold text-[#64748B]">
            لا توجد أسئلة مطابقة للتصفية الحالية.
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {editingDraft && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          dir="rtl"
        >
          <form
            onSubmit={handleSaveDraft}
            className="w-full max-w-2xl bg-white dark:bg-[#0D214D] rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A6E] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            <div className="p-4 bg-[#0F5132] text-white flex items-center justify-between gap-2 shrink-0">
              <div>
                <h4 className="text-sm font-black">
                  {editingDraft.questionId
                    ? `تعديل السؤال (${editingDraft.externalKey || editingDraft.questionId})`
                    : "إضافة سؤال جديد للغة العربية"}
                </h4>
                {editingDraft.questionId && (
                  <p className="text-[11px] text-emerald-100 font-mono">
                    يتم الحفاظ على معرّف قاعدة البيانات: {editingDraft.questionId}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setEditingDraft(null)}
                className="p-1.5 rounded-lg hover:bg-white/15"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              {questionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                  {questionError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className="space-y-1">
                  <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">رمز السؤال (Key)</span>
                  <input
                    type="text"
                    value={editingDraft.externalKey}
                    onChange={(e) =>
                      setEditingDraft({ ...editingDraft, externalKey: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737] font-mono"
                    dir="ltr"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">نوع السؤال</span>
                  <select
                    value={editingDraft.type}
                    onChange={(e) =>
                      handleChangeDraftType(e.target.value as "MCQ" | "TRUE_FALSE" | "ESSAY")
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737] font-bold"
                  >
                    <option value="MCQ">اختيار من متعدد</option>
                    <option value="TRUE_FALSE">صواب / خطأ</option>
                    <option value="ESSAY">مقالي / قراءة / تعبير</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">مستوى الصعوبة</span>
                  <select
                    value={editingDraft.difficulty}
                    onChange={(e) =>
                      setEditingDraft({
                        ...editingDraft,
                        difficulty: e.target.value as "EASY" | "MEDIUM" | "HARD",
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737] font-bold"
                  >
                    <option value="EASY">سهل</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="HARD">متقدم</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1">
                <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">نص السؤال / التدريب</span>
                <textarea
                  rows={3}
                  value={editingDraft.statement}
                  onChange={(e) =>
                    setEditingDraft({ ...editingDraft, statement: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737] font-medium leading-relaxed"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className="space-y-1">
                  <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">القسم المرتبط</span>
                  <select
                    value={editingDraft.sectionAnchorId}
                    onChange={(e) =>
                      setEditingDraft({ ...editingDraft, sectionAnchorId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737] font-bold"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.order}. {s.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">المهارة اللغوية</span>
                  <select
                    value={editingDraft.skillCategory}
                    onChange={(e) =>
                      setEditingDraft({ ...editingDraft, skillCategory: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737] font-bold"
                  >
                    {Object.entries(ARABIC_SKILL_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">المصدر التعليمي</span>
                  <select
                    value={editingDraft.origin}
                    onChange={(e) =>
                      setEditingDraft({ ...editingDraft, origin: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737] font-bold"
                  >
                    {Object.entries(ARABIC_ORIGIN_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                    <option value="OFFICIAL_BOOK">الكتاب المدرسي</option>
                    <option value="OFFICIAL_ASSESSMENT">التقييمات الرسمية</option>
                    <option value="KHOLASA_ORIGINAL">إعداد الخلاصة</option>
                  </select>
                </label>
              </div>

              {/* Options or Essay Rubric */}
              {editingDraft.type === "ESSAY" ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <label className="sm:col-span-3 space-y-1">
                    <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">الإجابة النموذجية للمقالي</span>
                    <textarea
                      rows={3}
                      value={editingDraft.modelAnswer}
                      onChange={(e) =>
                        setEditingDraft({ ...editingDraft, modelAnswer: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737]"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">الدرجة القصوى</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={editingDraft.points}
                      onChange={(e) =>
                        setEditingDraft({ ...editingDraft, points: Number(e.target.value) || 2 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737]"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-[#071737] border border-slate-200 dark:border-[#1E3A6E]">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0F5132] dark:text-emerald-300">
                      الاختيارات (حدّد الإجابة الصحيحة)
                    </span>
                    {editingDraft.type === "MCQ" && editingDraft.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingDraft({
                            ...editingDraft,
                            options: [...editingDraft.options, { text: "", isCorrect: false }],
                          })
                        }
                        className="text-[11px] font-bold text-[#0F5132] hover:underline"
                      >
                        + إضافة اختيار
                      </button>
                    )}
                  </div>
                  {editingDraft.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="arabic-correct-option"
                        checked={opt.isCorrect}
                        onChange={() =>
                          setEditingDraft({
                            ...editingDraft,
                            options: editingDraft.options.map((o, i) => ({
                              ...o,
                              isCorrect: i === idx,
                            })),
                          })
                        }
                      />
                      <span className="w-6 h-6 rounded-lg bg-[#0F5132] text-white font-black flex items-center justify-center shrink-0">
                        {CHOICE_LETTERS[idx] || idx + 1}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) =>
                          setEditingDraft({
                            ...editingDraft,
                            options: editingDraft.options.map((o, i) =>
                              i === idx ? { ...o, text: e.target.value } : o
                            ),
                          })
                        }
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#0D214D]"
                        placeholder={`نص الاختيار (${CHOICE_LETTERS[idx] || idx + 1})`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="space-y-1">
                  <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">الشرح والتعليل التربوي</span>
                  <textarea
                    rows={2}
                    value={editingDraft.correctReason}
                    onChange={(e) =>
                      setEditingDraft({ ...editingDraft, correctReason: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737]"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">تركة السؤال في الامتحان</span>
                  <textarea
                    rows={2}
                    value={editingDraft.examTrick}
                    onChange={(e) =>
                      setEditingDraft({ ...editingDraft, examTrick: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="space-y-1">
                  <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">مرجع المصدر</span>
                  <select
                    value={editingDraft.sourceId}
                    onChange={(e) =>
                      setEditingDraft({ ...editingDraft, sourceId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737] font-bold"
                  >
                    <option value="student_book">كتاب الطالب الرسمي</option>
                    <option value="assessments">كراسة التقييمات الأسبوعية والشهرية</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="font-bold text-[#475569] dark:text-[#CBD5E1]">أرقام الصفحات (مفصولة بفاصلة)</span>
                  <input
                    type="text"
                    value={editingDraft.pagesText}
                    onChange={(e) =>
                      setEditingDraft({ ...editingDraft, pagesText: e.target.value })
                    }
                    placeholder="مثال: 12, 13"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#1E3A6E] bg-white dark:bg-[#071737]"
                    dir="ltr"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="inline-flex items-center gap-2 font-bold">
                  <input
                    type="checkbox"
                    checked={editingDraft.inPracticeStage}
                    onChange={(e) =>
                      setEditingDraft({ ...editingDraft, inPracticeStage: e.target.checked })
                    }
                  />
                  <span>عرض في مرحلة «حل واتعلم»</span>
                </label>
                <label className="inline-flex items-center gap-2 font-bold">
                  <input
                    type="checkbox"
                    checked={editingDraft.inFinalAssessment}
                    onChange={(e) =>
                      setEditingDraft({ ...editingDraft, inFinalAssessment: e.target.checked })
                    }
                  />
                  <span>تضمين في «اختبر نفسك» (الاختبار النهائي)</span>
                </label>
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-200 dark:border-[#1E3A6E] bg-slate-50 dark:bg-[#071737] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingDraft(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-[#1E3A6E] text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSavingQuestion}
                className="px-5 py-2 rounded-xl bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-extrabold inline-flex items-center gap-1.5"
              >
                {isSavingQuestion && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingDraft.questionId ? "حفظ تعديل السؤال" : "إضافة السؤال"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

