"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FileText,
  Layers,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { QuestionWordImporter } from "@/components/admin/QuestionWordImporter";

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
  lessons?: { lesson: { id: string; title: string } }[] | null;
  options: QuestionOption[];
  explanation?: QuestionExplanation | null;
  rubric?: EssayRubric | null;
}

interface Subject {
  id: string;
  name: string;
  units: {
    id: string;
    title: string;
    lessons?: { id: string; title: string }[];
  }[];
}

interface QuestionBankManagerClientProps {
  initialQuestions: Question[];
  subjects: Subject[];
}

export function QuestionBankManagerClient({
  initialQuestions,
  subjects,
}: QuestionBankManagerClientProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Word Import Modal State
  const [isWordImportOpen, setIsWordImportOpen] = useState(false);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Question Form State
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || "");
  const [newUnitId, setNewUnitId] = useState<string>("");
  const [newLessonId, setNewLessonId] = useState<string>("");
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
  const [editLessonId, setEditLessonId] = useState("");
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
    setEditLessonId(q.lessons?.[0]?.lesson?.id || "");
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
          lessonId: editLessonId || undefined,
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
          lessonId: newLessonId || undefined,
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
      setNewLessonId("");
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
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80  flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث في نص السؤال أو المفهوم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pr-9 pl-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800020]"
            />
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
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
            className="h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل أنواع الأسئلة</option>
            <option value="MCQ">اختيار من متعدد (MCQ)</option>
            <option value="TRUE_FALSE">صح أو خطأ</option>
            <option value="ESSAY">سؤال مقالي</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
          >
            <option value="all">كل الصعوبات</option>
            <option value="EASY">سهل</option>
            <option value="MEDIUM">متوسط</option>
            <option value="HARD">متقدم</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsWordImportOpen(true)}
            className="h-11 px-4 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] hover:bg-[#800020]/10 dark:hover:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold flex items-center justify-center gap-2 border border-[#E2E8F0] dark:border-[#E11D48] transition-colors "
          >
            <FileText className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
            <span>استيراد ملف وورد (.docx)</span>
          </button>

          <Link
            href="/admin/questions/import"
            className="h-11 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-[#800020]" />
            <span>استيراد شامل / CSV</span>
          </Link>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-colors active:opacity-80"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سؤال جديد</span>
          </button>
        </div>
      </div>

      {/* Questions Counter Header */}
      <div className="flex items-center justify-between text-[13px] font-bold text-[#64748B] px-1">
        <span>عرض {filteredQuestions.length} سؤال من إجمالي {questions.length}</span>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0]/80 dark:border-[#334155]/80  space-y-4"
          >
            {/* Top Bar with Badges and Edit/Delete Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#334155]/80 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-[#800020]">
                  #{idx + 1}
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold">
                  {q.subject.name}
                </span>
                {q.unit && (
                  <span className="px-3 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#F8FAFC] text-[13px] font-bold">
                    {q.unit.title}
                  </span>
                )}
                {q.lessons && q.lessons.length > 0 && q.lessons[0].lesson && (
                  <span className="px-3 py-1 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] text-[13px] font-bold border border-[#E2E8F0]/50 dark:border-[#E11D48]/50">
                    درس: {q.lessons[0].lesson.title}
                  </span>
                )}
                <span className="px-2 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#64748B]">
                  {q.type === "MCQ"
                    ? "اختيار من متعدد"
                    : q.type === "TRUE_FALSE"
                    ? "صح أو خطأ"
                    : "مقالي"}
                </span>
                <span
                  className={`px-2 py-1 rounded-lg text-[13px] font-bold ${
                    q.difficulty === "EASY"
                      ? "bg-[#059669]/10 text-[#059669]"
                      : q.difficulty === "MEDIUM"
                      ? "bg-[#D97706]/10 text-[#D97706]"
                      : "bg-[#DC2626]/10 text-[#DC2626]"
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(q)}
                  className="h-11 px-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#1E293B] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-bold flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#800020]" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="h-11 px-3 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#DC2626]/10 dark:hover:bg-[#1E293B] transition-colors"
                  title="حذف السؤال"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Question Statement */}
            <div className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed">
              <BidiStatement as="div" text={q.statement} />
            </div>

            {/* Options */}
            {q.options && q.options.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={opt.id || oIdx}
                    className={`p-3 rounded-xl border text-[13px] font-bold flex items-center justify-between gap-2 ${
                      opt.isCorrect
                        ? "bg-[#059669]/10 dark:bg-[#1E293B] border-[#059669]/50 text-[#059669] dark:text-[#34D399] font-bold"
                        : "bg-[#F8FAFC] dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#F8FAFC]"
                    }`}
                  >
                    <BidiStatement as="span" text={opt.text} />
                    {opt.isCorrect && (
                      <span className="text-[13px] font-bold text-[#059669] flex items-center gap-1">
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
              <div className="p-4 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/50 text-[13px] space-y-1">
                <span className="font-bold text-[#800020] block">
                  نموذج الإجابة الاسترشادي (Rubric):
                </span>
                <p className="font-medium text-[13px] leading-relaxed text-[#0F172A] dark:text-[#F8FAFC]">
                  {q.rubric.modelAnswer}
                </p>
              </div>
            )}

            {/* Explanation Preview */}
            {q.explanation && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0]/60 dark:border-[#334155]/60 text-[13px] text-[#0F172A] dark:text-[#F8FAFC] space-y-1">
                <span className="font-bold text-[#800020] dark:text-[#FB7185] block">
                  المفهوم الأساسي: {q.explanation.concept}
                </span>
                <p className="font-medium text-[13px] leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                  {q.explanation.correctReason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CREATE QUESTION MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 space-y-5 text-right shadow-sm border border-[#E2E8F0] dark:border-[#334155] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#800020]" />
                <span>إضافة سؤال جديد لبنك الأسئلة</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-11 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] text-[13px] font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    المادة الدراسية *
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => {
                      setNewSubjectId(e.target.value);
                      const target = subjects.find((s) => s.id === e.target.value);
                      setNewUnitId(target?.units[0]?.id || "");
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    الوحدة الدراسية
                  </label>
                  <select
                    value={newUnitId}
                    onChange={(e) => {
                      setNewUnitId(e.target.value);
                      setNewLessonId("");
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="">بدون وحدة محددة</option>
                    {activeNewSubject?.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    الدرس المستهدف (اختياري)
                  </label>
                  <select
                    value={newLessonId}
                    onChange={(e) => setNewLessonId(e.target.value)}
                    disabled={!newUnitId}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold disabled:opacity-50"
                  >
                    <option value="">بدون درس محدد (عام للوحدة)</option>
                    {activeNewSubject?.units
                      .find((u) => u.id === newUnitId)
                      ?.lessons?.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    نوع السؤال
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="MCQ">اختيار من متعدد (MCQ)</option>
                    <option value="TRUE_FALSE">صح أو خطأ</option>
                    <option value="ESSAY">سؤال مقالي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    مستوى الصعوبة
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="EASY">سهل</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="HARD">متقدم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                  نص السؤال *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="اكتب نص السؤال بدقة هنا..."
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium"
                />
              </div>

              {/* Options Form for MCQ */}
              {newType === "MCQ" && (
                <div className="space-y-3">
                  <label className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
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
                            ? "bg-[#059669] border-[#059669] text-white"
                            : "border-[#E2E8F0] hover:border-[#E2E8F0]"
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
                        className="flex-1 h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Options Form for True/False */}
              {newType === "TRUE_FALSE" && (
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    الإجابة الصحيحة:
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] font-bold">
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
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] font-bold">
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
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    نموذج الإجابة الاسترشادي (Rubric Model Answer)
                  </label>
                  <textarea
                    rows={3}
                    value={newModelAnswer}
                    onChange={(e) => setNewModelAnswer(e.target.value)}
                    placeholder="اكتب الإجابة النموذجية المعتمدة لتقييم إجابة الطالب..."
                    className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium"
                  />
                </div>
              )}

              {/* Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    المفهوم الأساسي للسؤال
                  </label>
                  <input
                    type="text"
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value)}
                    placeholder="مثال: قانون أوم للدوائر المغلقة"
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    تفسير الإجابة الصحيحة
                  </label>
                  <input
                    type="text"
                    value={newCorrectReason}
                    onChange={(e) => setNewCorrectReason(e.target.value)}
                    placeholder="سبب اختيار هذه الإجابة وتوضيح الفكرة..."
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 space-y-5 text-right shadow-sm border border-[#E2E8F0] dark:border-[#334155] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#800020]" />
                <span>تعديل بيانات السؤال</span>
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="w-11 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B]"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] text-[13px] font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    المادة الدراسية
                  </label>
                  <select
                    value={editSubjectId}
                    onChange={(e) => {
                      setEditSubjectId(e.target.value);
                      const target = subjects.find((s) => s.id === e.target.value);
                      setEditUnitId(target?.units[0]?.id || "");
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    الوحدة الدراسية
                  </label>
                  <select
                    value={editUnitId}
                    onChange={(e) => {
                      setEditUnitId(e.target.value);
                      setEditLessonId("");
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="">بدون وحدة محددة</option>
                    {activeEditSubject?.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    الدرس المستهدف (اختياري)
                  </label>
                  <select
                    value={editLessonId}
                    onChange={(e) => setEditLessonId(e.target.value)}
                    disabled={!editUnitId}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold disabled:opacity-50"
                  >
                    <option value="">بدون درس محدد (عام للوحدة)</option>
                    {activeEditSubject?.units
                      .find((u) => u.id === editUnitId)
                      ?.lessons?.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    نوع السؤال
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="MCQ">اختيار من متعدد (MCQ)</option>
                    <option value="TRUE_FALSE">صح أو خطأ</option>
                    <option value="ESSAY">سؤال مقالي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    مستوى الصعوبة
                  </label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  >
                    <option value="EASY">سهل</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="HARD">متقدم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                  نص السؤال *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editStatement}
                  onChange={(e) => setEditStatement(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium"
                />
              </div>

              {/* Edit Options */}
              {editType === "MCQ" && (
                <div className="space-y-3">
                  <label className="block text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
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
                            ? "bg-[#059669] border-[#059669] text-white"
                            : "border-[#E2E8F0] hover:border-[#E2E8F0]"
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
                        className="flex-1 h-11 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Edit Essay Model Answer */}
              {editType === "ESSAY" && (
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    نموذج الإجابة الاسترشادي (Rubric)
                  </label>
                  <textarea
                    rows={3}
                    value={editModelAnswer}
                    onChange={(e) => setEditModelAnswer(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-medium"
                  />
                </div>
              )}

              {/* Edit Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    المفهوم الأساسي للسؤال
                  </label>
                  <input
                    type="text"
                    value={editConcept}
                    onChange={(e) => setEditConcept(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                    تفسير الإجابة الصحيحة
                  </label>
                  <input
                    type="text"
                    value={editCorrectReason}
                    onChange={(e) => setEditCorrectReason(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "تحديث السؤال"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORD IMPORT MODAL */}
      {isWordImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-5 shadow-sm relative">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center ">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
                    استيراد الأسئلة من ملف وورد (.docx)
                  </h2>
                  <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                    استخراج فوري للأسئلة مع شاشة معاينة تفاعلية وتعديل كامل قبل الحفظ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWordImportOpen(false)}
                className="w-11 h-11 rounded-full bg-[#F8FAFC] hover:bg-[#E2E8F0] dark:bg-[#334155] dark:hover:bg-[#1E293B] flex items-center justify-center text-[#64748B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <QuestionWordImporter
              subjects={subjects as any}
              isModal={true}
              onSuccess={() => {
                setIsWordImportOpen(false);
                router.refresh();
                fetch("/api/admin/questions")
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.questions) setQuestions(data.questions);
                  })
                  .catch(() => {});
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
