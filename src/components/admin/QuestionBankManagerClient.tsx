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
} from "lucide-react";

interface QuestionOption {
  id: string;
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Question Form State
  const [newSubjectId, setNewSubjectId] = useState<string>(
    subjects[0]?.id || ""
  );
  const [newUnitId, setNewUnitId] = useState<string>("");
  const [newStatement, setNewStatement] = useState("");
  const [newType, setNewType] = useState<"MCQ" | "TRUE_FALSE" | "ESSAY">("MCQ");
  const [newDifficulty, setNewDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    "MEDIUM"
  );
  const [newConcept, setNewConcept] = useState("");
  const [newCorrectReason, setNewCorrectReason] = useState("");
  const [newModelAnswer, setNewModelAnswer] = useState("");

  const [newOptions, setNewOptions] = useState([
    { text: "", isCorrect: true, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
  ]);

  const activeNewSubject = subjects.find((s) => s.id === newSubjectId);

  const filteredQuestions = questions.filter((q) => {
    if (selectedSubjectId !== "all" && q.subject.id !== selectedSubjectId)
      return false;
    if (selectedType !== "all" && q.type !== selectedType) return false;
    if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty)
      return false;
    return true;
  });

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

      // Add to local state
      const createdQ: Question = {
        ...data.question,
        subject: { id: newSubjectId, name: activeNewSubject?.name || "" },
        unit: activeNewSubject?.units.find((u) => u.id === newUnitId),
      };
      setQuestions([createdQ, ...questions]);
      setIsModalOpen(false);

      // Reset form
      setNewStatement("");
      setNewConcept("");
      setNewCorrectReason("");
      setNewModelAnswer("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ غير متوقع");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>تصفية:</span>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-[#14243D] dark:text-white"
          >
            <option value="all">كل المواد</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-[#14243D] dark:text-white"
          >
            <option value="all">كل الأنواع</option>
            <option value="MCQ">اختيار من متعدد</option>
            <option value="TRUE_FALSE">صح أو خطأ</option>
            <option value="ESSAY">مقالي</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-[#14243D] dark:text-white"
          >
            <option value="all">كل المستويات</option>
            <option value="EASY">سهل</option>
            <option value="MEDIUM">متوسط</option>
            <option value="HARD">متقدم</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/questions/import"
            className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#14243D] dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-[#6858EA]" />
            <span>استيراد ملف CSV</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-5 rounded-xl bg-[#6858EA] hover:bg-[#5444D8] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm shadow-[#6858EA]/20 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سؤال جديد</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#6858EA]">
                  #{idx + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#6858EA]/10 text-[#6858EA] text-[11px] font-bold">
                  {q.subject.name}
                </span>
                {q.unit && (
                  <span className="text-xs text-slate-400 font-bold">
                    • {q.unit.title}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {q.type === "MCQ"
                    ? "اختيار من متعدد"
                    : q.type === "TRUE_FALSE"
                    ? "صح أو خطأ"
                    : "مقالي"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                  {q.difficulty}
                </span>
              </div>
            </div>

            {/* Statement */}
            <h3 className="text-sm sm:text-base font-black text-[#14243D] dark:text-white leading-relaxed">
              {q.statement}
            </h3>

            {/* Options */}
            {q.options && q.options.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 ${
                      opt.isCorrect
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <span>{opt.text}</span>
                    {opt.isCorrect && (
                      <span className="text-[10px] font-black text-emerald-600">
                        (صحيح)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Explanation Preview */}
            {q.explanation && (
              <div className="p-3.5 rounded-2xl bg-[#6858EA]/5 border border-[#6858EA]/15 text-xs text-[#14243D] dark:text-slate-200 space-y-1">
                <span className="font-black text-[#6858EA] block">
                  المفهوم: {q.explanation.concept}
                </span>
                <p className="font-medium text-[11px] leading-relaxed">
                  {q.explanation.correctReason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#14243D] rounded-3xl p-6 sm:p-8 space-y-5 text-right shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black text-[#14243D] dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#6858EA]" />
                <span>إضافة سؤال جديد لبنك الأسئلة</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              {/* Subject & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    المادة الدراسية
                  </label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => {
                      setNewSubjectId(e.target.value);
                      const target = subjects.find(
                        (s) => s.id === e.target.value
                      );
                      setNewUnitId(target?.units[0]?.id || "");
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
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
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
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

              {/* Type & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    نوع السؤال
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
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
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                  >
                    <option value="EASY">سهل</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="HARD">متقدم</option>
                  </select>
                </div>
              </div>

              {/* Statement */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  نص السؤال الكامل
                </label>
                <textarea
                  required
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="اكتب صيغة السؤال بوضوح..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>

              {/* MCQ Options */}
              {newType === "MCQ" && (
                <div className="space-y-2 pt-1">
                  <span className="block text-xs font-bold text-slate-500">
                    الخيارات وتحديد الإجابة الصحيحة:
                  </span>
                  {newOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={opt.isCorrect}
                        onChange={() => {
                          setNewOptions((prev) =>
                            prev.map((o, i) => ({ ...o, isCorrect: i === idx }))
                          );
                        }}
                        className="w-4 h-4 text-[#6858EA]"
                      />
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewOptions((prev) =>
                            prev.map((o, i) =>
                              i === idx ? { ...o, text: val } : o
                            )
                          );
                        }}
                        placeholder={`الخيار ${idx + 1}`}
                        className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Concept & Explanation */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    المفهوم العلمي المرتبط بالسؤال
                  </label>
                  <input
                    type="text"
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value)}
                    placeholder="مثال: جمل التكرار for loop"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    تفسير الإجابة الصحيحة (يظهر للطالب عند المراجعة)
                  </label>
                  <textarea
                    value={newCorrectReason}
                    onChange={(e) => setNewCorrectReason(e.target.value)}
                    placeholder="اشرح لماذا هذا الخيار صحيح..."
                    rows={2}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-[#6858EA] hover:bg-[#5444D8] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>حفظ ونشر السؤال</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
