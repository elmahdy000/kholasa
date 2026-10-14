"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Filter,
  CheckCircle2,
  X,
  Lightbulb,
  Sparkles,
  Loader2,
  AlertCircle,
  BookOpen,
  Upload,
  Search,
  Edit2,
  Trash2,
  Check,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface QuestionOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
  explanation?: string | null;
}

interface QuestionExplanation {
  concept: string;
  correctReason: string;
}

interface EssayRubric {
  modelAnswer: string;
  maxScore: number;
}

interface Question {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  subject: { id: string; name: string };
  unit?: { id: string; title: string } | null;
  options: QuestionOption[];
  explanation?: QuestionExplanation | null;
  rubric?: EssayRubric | null;
}

interface Subject {
  id: string;
  name: string;
  units: { id: string; title: string }[];
}

interface QuestionBankManagerClientProps {
  initialQuestions: Question[];
  subjects: Subject[];
}

export function QuestionBankManagerClient({
  initialQuestions,
  subjects,
}: QuestionBankManagerClientProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Question Form State
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || "");
  const [newUnitId, setNewUnitId] = useState<string>("");
  const [newStatement, setNewStatement] = useState("");
  const [newType, setNewType] = useState<"MCQ" | "TRUE_FALSE" | "ESSAY">("MCQ");
  const [newDifficulty, setNewDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [newConcept, setNewConcept] = useState("");
  const [newCorrectReason, setNewCorrectReason] = useState("");
  const [newModelAnswer, setNewModelAnswer] = useState("");
  const [newOptions, setNewOptions] = useState([
    { text: "", isCorrect: true, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
  ]);

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editUnitId, setEditUnitId] = useState("");
  const [editStatement, setEditStatement] = useState("");
  const [editType, setEditType] = useState<"MCQ" | "TRUE_FALSE" | "ESSAY">("MCQ");
  const [editDifficulty, setEditDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [editConcept, setEditConcept] = useState("");
  const [editCorrectReason, setEditCorrectReason] = useState("");
  const [editModelAnswer, setEditModelAnswer] = useState("");
  const [editOptions, setEditOptions] = useState<
    { text: string; isCorrect: boolean; explanation?: string }[]
  >([]);

  const activeNewSubject = subjects.find((s) => s.id === newSubjectId);
  const activeEditSubject = subjects.find((s) => s.id === editSubjectId);

  // Open Edit Modal
  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setEditSubjectId(q.subject.id);
    setEditUnitId(q.unit?.id || "");
    setEditStatement(q.statement);
    setEditType(q.type as any);
    setEditDifficulty(q.difficulty as any);
    setEditConcept(q.explanation?.concept || "");
    setEditCorrectReason(q.explanation?.correctReason || "");
    setEditModelAnswer(q.rubric?.modelAnswer || "");
    setEditOptions(
      q.options.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
        explanation: o.explanation || "",
      }))
    );
  };

  // Delete Question
  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال نهائياً من بنك الأسئلة؟")) return;

    try {
      const res = await fetch(`/api/admin/questions/${qId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
      } else {
        alert("تعذر حذف السؤال");
      }
    } catch {
      alert("حدث خطأ أثناء حذف السؤال");
    }
  };

  // Handle Update Question
  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: editStatement.trim(),
          subjectId: editSubjectId,
          unitId: editUnitId || undefined,
          type: editType,
          difficulty: editDifficulty,
          concept: editConcept.trim() || undefined,
          correctReason: editCorrectReason.trim() || undefined,
          modelAnswer: editType === "ESSAY" ? editModelAnswer.trim() : undefined,
          options: editType !== "ESSAY" ? editOptions : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تحديث السؤال");
      }

      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQuestion.id ? data.question : q))
      );
      setEditingQuestion(null);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء التحديث");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create Question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let optionsPayload: any[] = [];
      if (newType === "MCQ") {
        optionsPayload = newOptions.map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          explanation: o.explanation,
        }));
      } else if (newType === "TRUE_FALSE") {
        optionsPayload = [
          {
            text: "صواب",
            isCorrect: newOptions[0].isCorrect,
            explanation: newOptions[0].explanation,
          },
          {
            text: "خطأ",
            isCorrect: !newOptions[0].isCorrect,
            explanation: newOptions[1].explanation,
          },
        ];
      }

      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: newStatement,
          subjectId: newSubjectId,
          unitId: newUnitId || undefined,
          type: newType,
          difficulty: newDifficulty,
          concept: newConcept || undefined,
          correctReason: newCorrectReason || undefined,
          modelAnswer: newType === "ESSAY" ? newModelAnswer : undefined,
          options: optionsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر إضافة السؤال");
      }

      const createdQ: Question = {
        ...data.question,
        subject: { id: newSubjectId, name: activeNewSubject?.name || "" },
        unit: activeNewSubject?.units.find((u) => u.id === newUnitId),
      };

      setQuestions([createdQ, ...questions]);
      setIsCreateOpen(false);

      // Reset
      setNewStatement("");
      setNewConcept("");
      setNewCorrectReason("");
      setNewModelAnswer("");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء السؤال");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered list
  const filteredQuestions = questions.filter((q) => {
    if (selectedSubjectId !== "all" && q.subject.id !== selectedSubjectId)
      return false;
    if (selectedType !== "all" && q.type !== selectedType) return false;
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty)
      return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchStatement = q.statement.toLowerCase().includes(query);
      const matchConcept = q.explanation?.concept?.toLowerCase().includes(query);
      if (!matchStatement && !matchConcept) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Filters */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث في نص السؤال أو المفهوم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-9 pl-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل المواد الدراسية</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل أنواع الأسئلة</option>
            <option value="MCQ">اختيار من متعدد (MCQ)</option>
            <option value="TRUE_FALSE">صح أو خطأ</option>
            <option value="ESSAY">سؤال مقالي</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل الصعوبات</option>
            <option value="EASY">سهل</option>
            <option value="MEDIUM">متوسط</option>
            <option value="HARD">متقدم</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/questions/import"
            className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-700 text-[#0F172A] dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-500" />
            <span>استيراد ملف CSV</span>
          </Link>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سؤال جديد</span>
          </button>
        </div>
      </div>

      {/* Questions Counter Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
        <span>عرض {filteredQuestions.length} سؤال من إجمالي {questions.length}</span>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs space-y-4"
          >
            {/* Top Bar with Badges and Edit/Delete Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-indigo-600">
                  #{idx + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-black">
                  {q.subject.name}
                </span>
                {q.unit && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 text-[11px] font-bold">
                    {q.unit.title}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 text-[10px] font-bold text-slate-500">
                  {q.type === "MCQ"
                    ? "اختيار من متعدد"
                    : q.type === "TRUE_FALSE"
                    ? "صح أو خطأ"
                    : "مقالي"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                    q.difficulty === "EASY"
                      ? "bg-emerald-50 text-emerald-600"
                      : q.difficulty === "MEDIUM"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {q.difficulty === "EASY"
                    ? "سهل"
                    : q.difficulty === "MEDIUM"
                    ? "متوسط"
                    : "متقدم"}
                </span>
              </div>

              {/* Action Buttons: Edit and Delete */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(q)}
                  className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="h-8 px-2.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="حذف السؤال"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Question Statement */}
            <div className="text-sm sm:text-base font-black text-[#0F172A] dark:text-white leading-relaxed">
              <BidiStatement as="div" text={q.statement} />
            </div>

            {/* Options */}
            {q.options && q.options.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={opt.id || oIdx}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 ${
                      opt.isCorrect
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-black"
                        : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300"
                    }`}
                  >
                    <BidiStatement as="span" text={opt.text} />
                    {opt.isCorrect && (
                      <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        الإجابة الصحيحة
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Rubric for Essay */}
            {q.type === "ESSAY" && q.rubric && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 text-xs space-y-1">
                <span className="font-black text-indigo-600 block">
                  نموذج الإجابة الاسترشادي (Rubric):
                </span>
                <p className="font-medium text-[11px] leading-relaxed text-slate-700 dark:text-zinc-300">
                  {q.rubric.modelAnswer}
                </p>
              </div>
            )}

            {/* Explanation Preview */}
            {q.explanation && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 text-xs text-[#0F172A] dark:text-zinc-200 space-y-1">
                <span className="font-black text-indigo-600 dark:text-indigo-400 block">
                  المفهوم الأساسي: {q.explanation.concept}
                </span>
                <p className="font-medium text-[11px] leading-relaxed text-slate-600 dark:text-zinc-400">
                  {q.explanation.correctReason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CREATE QUESTION MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-3xl p-6 sm:p-8 space-y-5 text-right shadow-2xl border border-slate-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <h3 className="text-base font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>إضافة سؤال جديد لبنك الأسئلة</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    المادة الدراسية *
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => {
                      setNewSubjectId(e.target.value);
                      const target = subjects.find((s) => s.id === e.target.value);
                      setNewUnitId(target?.units[0]?.id || "");
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    الوحدة الدراسية
                  </label>
                  <select
                    value={newUnitId}
                    onChange={(e) => setNewUnitId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  >
                    <option value="">بدون وحدة محددة</option>
                    {activeNewSubject?.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    نوع السؤال
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  >
                    <option value="MCQ">اختيار من متعدد (MCQ)</option>
                    <option value="TRUE_FALSE">صح أو خطأ</option>
                    <option value="ESSAY">سؤال مقالي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    مستوى الصعوبة
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  >
                    <option value="EASY">سهل</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="HARD">متقدم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  نص السؤال *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="اكتب نص السؤال بدقة هنا..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-medium"
                />
              </div>

              {/* Options Form for MCQ */}
              {newType === "MCQ" && (
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-700 dark:text-zinc-300">
                    خيارات الإجابة (حدد الإجابة الصحيحة بالدائرة الخضراء):
                  </label>
                  {newOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newOptions.map((o, idx) => ({
                            ...o,
                            isCorrect: idx === i,
                          }));
                          setNewOptions(updated);
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          opt.isCorrect
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 hover:border-slate-400"
                        }`}
                      >
                        {opt.isCorrect && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <input
                        type="text"
                        required
                        placeholder={`الخيار ${i + 1}`}
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[i].text = e.target.value;
                          setNewOptions(updated);
                        }}
                        className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Options Form for True/False */}
              {newType === "TRUE_FALSE" && (
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 dark:text-zinc-300">
                    الإجابة الصحيحة:
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="radio"
                        name="tf_new"
                        checked={newOptions[0].isCorrect}
                        onChange={() => {
                          const updated = [...newOptions];
                          updated[0].isCorrect = true;
                          setNewOptions(updated);
                        }}
                      />
                      <span>صواب (صح)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="radio"
                        name="tf_new"
                        checked={!newOptions[0].isCorrect}
                        onChange={() => {
                          const updated = [...newOptions];
                          updated[0].isCorrect = false;
                          setNewOptions(updated);
                        }}
                      />
                      <span>خطأ</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Essay Model Answer */}
              {newType === "ESSAY" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    نموذج الإجابة الاسترشادي (Rubric Model Answer)
                  </label>
                  <textarea
                    rows={3}
                    value={newModelAnswer}
                    onChange={(e) => setNewModelAnswer(e.target.value)}
                    placeholder="اكتب الإجابة النموذجية المعتمدة لتقييم إجابة الطالب..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-medium"
                  />
                </div>
              )}

              {/* Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    المفهوم الأساسي للسؤال
                  </label>
                  <input
                    type="text"
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value)}
                    placeholder="مثال: قانون أوم للدوائر المغلقة"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    تفسير الإجابة الصحيحة
                  </label>
                  <input
                    type="text"
                    value={newCorrectReason}
                    onChange={(e) => setNewCorrectReason(e.target.value)}
                    placeholder="سبب اختيار هذه الإجابة وتوضيح الفكرة..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الإضافة..." : "حفظ السؤال"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-3xl p-6 sm:p-8 space-y-5 text-right shadow-2xl border border-slate-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <h3 className="text-base font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <span>تعديل بيانات السؤال</span>
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    المادة الدراسية
                  </label>
                  <select
                    value={editSubjectId}
                    onChange={(e) => {
                      setEditSubjectId(e.target.value);
                      const target = subjects.find((s) => s.id === e.target.value);
                      setEditUnitId(target?.units[0]?.id || "");
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    الوحدة الدراسية
                  </label>
                  <select
                    value={editUnitId}
                    onChange={(e) => setEditUnitId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  >
                    <option value="">بدون وحدة محددة</option>
                    {activeEditSubject?.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    نوع السؤال
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  >
                    <option value="MCQ">اختيار من متعدد (MCQ)</option>
                    <option value="TRUE_FALSE">صح أو خطأ</option>
                    <option value="ESSAY">سؤال مقالي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    مستوى الصعوبة
                  </label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  >
                    <option value="EASY">سهل</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="HARD">متقدم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  نص السؤال *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editStatement}
                  onChange={(e) => setEditStatement(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-medium"
                />
              </div>

              {/* Edit Options */}
              {editType === "MCQ" && (
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-700 dark:text-zinc-300">
                    خيارات الإجابة:
                  </label>
                  {editOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editOptions.map((o, idx) => ({
                            ...o,
                            isCorrect: idx === i,
                          }));
                          setEditOptions(updated);
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          opt.isCorrect
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 hover:border-slate-400"
                        }`}
                      >
                        {opt.isCorrect && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...editOptions];
                          updated[i].text = e.target.value;
                          setEditOptions(updated);
                        }}
                        className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Edit Essay Model Answer */}
              {editType === "ESSAY" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    نموذج الإجابة الاسترشادي (Rubric)
                  </label>
                  <textarea
                    rows={3}
                    value={editModelAnswer}
                    onChange={(e) => setEditModelAnswer(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-medium"
                  />
                </div>
              )}

              {/* Edit Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    المفهوم الأساسي للسؤال
                  </label>
                  <input
                    type="text"
                    value={editConcept}
                    onChange={(e) => setEditConcept(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    تفسير الإجابة الصحيحة
                  </label>
                  <input
                    type="text"
                    value={editCorrectReason}
                    onChange={(e) => setEditCorrectReason(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "تحديث السؤال"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
