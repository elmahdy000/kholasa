"use client";

import { useState, useEffect } from "react";
import { HelpCircle, AlertCircle, CheckCircle2, X } from "lucide-react";
import type { Question, Subject, Grade } from "./types";
import { QuestionCurriculumSelector } from "./QuestionCurriculumSelector";
import { QuestionTypeOptionsEditor, type FormOption } from "./QuestionTypeOptionsEditor";
import { QuestionExplanationEditor } from "./QuestionExplanationEditor";
import { QuestionImageUploader } from "./QuestionImageUploader";

interface QuestionFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  editingQuestion?: Question | null;
  subjects: Subject[];
  grades?: Grade[];
  onClose: () => void;
  onSuccess: (question: Question) => void;
}

export function QuestionFormModal({
  isOpen,
  mode,
  editingQuestion,
  subjects,
  grades,
  onClose,
  onSuccess,
}: QuestionFormModalProps) {
  const g10Grade = grades?.find((g) => g.code === "bacc_g10");

  const [gradeId, setGradeId] = useState<string>(g10Grade?.id || "");
  const [schoolCategory, setSchoolCategory] = useState<"ARABIC" | "LANGUAGES">("ARABIC");
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || "");
  const [unitId, setUnitId] = useState<string>("");
  const [lessonId, setLessonId] = useState<string>("");
  const [statement, setStatement] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [type, setType] = useState<"MCQ" | "TRUE_FALSE" | "ESSAY">("MCQ");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [concept, setConcept] = useState("");
  const [correctReason, setCorrectReason] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [options, setOptions] = useState<FormOption[]>([
    { text: "", isCorrect: true, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
    { text: "", isCorrect: false, explanation: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === "edit" && editingQuestion) {
        setSubjectId(editingQuestion.subject.id);
        setUnitId(editingQuestion.unit?.id || "");
        setLessonId(editingQuestion.lessons?.[0]?.lesson?.id || "");
        setStatement(editingQuestion.statement);
        setImageUrl(editingQuestion.imageUrl || "");
        setType(editingQuestion.type as any);
        setDifficulty(editingQuestion.difficulty as any);
        setConcept(editingQuestion.explanation?.concept || "");
        setCorrectReason(editingQuestion.explanation?.correctReason || "");
        setModelAnswer(editingQuestion.rubric?.modelAnswer || "");
        setOptions(
          editingQuestion.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            explanation: o.explanation || "",
          }))
        );
      } else if (mode === "create") {
        setSubjectId(subjects[0]?.id || "");
        setUnitId("");
        setLessonId("");
        setStatement("");
        setImageUrl("");
        setType("MCQ");
        setDifficulty("MEDIUM");
        setConcept("");
        setCorrectReason("");
        setModelAnswer("");
        setOptions([
          { text: "", isCorrect: true, explanation: "" },
          { text: "", isCorrect: false, explanation: "" },
          { text: "", isCorrect: false, explanation: "" },
          { text: "", isCorrect: false, explanation: "" },
        ]);
      }
      setError(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [mode, editingQuestion, subjects]);

  if (!isOpen) return null;

  const activeSubject = subjects.find((s) => s.id === subjectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let optionsPayload: any[] = [];
      if (type === "MCQ") {
        optionsPayload = options.map((o, idx) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          order: idx + 1,
          explanation: o.explanation || undefined,
        }));
      } else if (type === "TRUE_FALSE") {
        optionsPayload = [
          { text: "صواب", isCorrect: options[0]?.isCorrect ?? true, order: 1 },
          { text: "خطأ", isCorrect: !(options[0]?.isCorrect ?? true), order: 2 },
        ];
      }

      const endpoint =
        mode === "edit" && editingQuestion
          ? `/api/admin/questions/${editingQuestion.id}`
          : "/api/admin/questions";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: statement.trim(),
          imageUrl: imageUrl.trim() || undefined,
          subjectId,
          unitId: unitId || undefined,
          lessonId: lessonId || undefined,
          type,
          difficulty,
          schoolCategory: activeSubject?.schoolCategory || schoolCategory,
          concept: concept.trim() || undefined,
          correctReason: correctReason.trim() || undefined,
          modelAnswer: type === "ESSAY" ? modelAnswer.trim() : undefined,
          options: type !== "ESSAY" ? optionsPayload : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر حفظ السؤال");
      }

      onSuccess(data.question);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء حفظ السؤال");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 space-y-5 text-right shadow-sm border border-[#E2E8F0] dark:border-[#334155] max-h-[90vh] overflow-y-auto font-sans">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#800020]" />
            <span>{mode === "edit" ? "تعديل السؤال" : "إضافة سؤال جديد إلى بنك الأسئلة"}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] text-[#DC2626] text-[13px] font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grade, School Category, Subject, Unit, Lesson */}
          <QuestionCurriculumSelector
            grades={grades}
            gradeId={gradeId}
            setGradeId={setGradeId}
            schoolCategory={schoolCategory}
            setSchoolCategory={setSchoolCategory}
            subjects={subjects}
            subjectId={subjectId}
            setSubjectId={setSubjectId}
            unitId={unitId}
            setUnitId={setUnitId}
            lessonId={lessonId}
            setLessonId={setLessonId}
          />

          {/* Statement */}
          <div>
            <label className="block text-[13px] font-bold text-[#64748B] mb-1">
              نص السؤال *
            </label>
            <textarea
              required
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="اكتب صيغة السؤال هنا بوضوح ودقة..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#800020]"
            />
          </div>

          {/* Question Image (Optional) */}
          <QuestionImageUploader
            imageUrl={imageUrl}
            onChange={setImageUrl}
          />

          {/* Type and Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                نوع السؤال *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
              >
                <option value="MCQ">اختيار من متعدد (MCQ)</option>
                <option value="TRUE_FALSE">صح أو خطأ</option>
                <option value="ESSAY">سؤال مقالي</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#64748B] mb-1">
                مستوى الصعوبة *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white"
              >
                <option value="EASY">سهل</option>
                <option value="MEDIUM">متوسط</option>
                <option value="HARD">متقدم</option>
              </select>
            </div>
          </div>

          {/* Question Type Options or Essay Rubric */}
          <QuestionTypeOptionsEditor
            type={type}
            options={options}
            setOptions={setOptions}
            modelAnswer={modelAnswer}
            setModelAnswer={setModelAnswer}
          />

          {/* Explanations */}
          <QuestionExplanationEditor
            concept={concept}
            setConcept={setConcept}
            correctReason={correctReason}
            setCorrectReason={setCorrectReason}
          />

          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جارٍ الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{mode === "edit" ? "حفظ التعديلات" : "إضافة السؤال"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
