"use client";

import { useState, useEffect } from "react";
import { HelpCircle, AlertCircle, CheckCircle2, X } from "lucide-react";
import type { Question, Subject, Grade } from "./types";
import { QuestionCurriculumSelector } from "./QuestionCurriculumSelector";
import { QuestionTypeOptionsEditor, type FormOption } from "./QuestionTypeOptionsEditor";
import { QuestionExplanationEditor } from "./QuestionExplanationEditor";
import { QuestionImageUploader } from "./QuestionImageUploader";

interface QuestionDrawerProps {
  isOpen: boolean;
  mode: "create" | "edit";
  editingQuestion?: Question | null;
  subjects: Subject[];
  grades?: Grade[];
  onClose: () => void;
  onSuccess: (question: Question) => void;
}

export function QuestionDrawer({
  isOpen,
  mode,
  editingQuestion,
  subjects,
  grades,
  onClose,
  onSuccess,
}: QuestionDrawerProps) {
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
    if (mode === "edit" && editingQuestion) {
      setSubjectId(editingQuestion.subject.id);
      const subCat = editingQuestion.schoolCategory || editingQuestion.subject.schoolCategory || "ARABIC";
      setSchoolCategory(subCat);
      if (editingQuestion.subject.gradeId) {
        setGradeId(editingQuestion.subject.gradeId);
      }
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
        editingQuestion.options && editingQuestion.options.length > 0
          ? editingQuestion.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              explanation: o.explanation || "",
            }))
          : [
              { text: "", isCorrect: true, explanation: "" },
              { text: "", isCorrect: false, explanation: "" },
              { text: "", isCorrect: false, explanation: "" },
              { text: "", isCorrect: false, explanation: "" },
            ]
      );
    } else if (mode === "create") {
      const firstSubject = subjects[0];
      setSubjectId(firstSubject?.id || "");
      setSchoolCategory(firstSubject?.schoolCategory || "ARABIC");
      if (firstSubject?.gradeId) {
        setGradeId(firstSubject.gradeId);
      }
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
  }, [mode, editingQuestion, subjects, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeSubject = subjects.find((s) => s.id === subjectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let optionsPayload: any[] = [];
      if (type === "MCQ") {
        const filledOptions = options.filter((o) => o.text.trim().length > 0);
        if (filledOptions.length < 2) {
          throw new Error("سؤال الاختيار من متعدد يحتاج خيارين على الأقل");
        }
        if (filledOptions.filter((o) => o.isCorrect).length !== 1) {
          throw new Error("يرجى تحديد إجابة صحيحة واحدة من بين الخيارات المكتوبة");
        }
        optionsPayload = filledOptions.map((o, idx) => ({
          text: o.text.trim(),
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
          imageUrl: imageUrl.trim() || null,
          subjectId,
          unitId: unitId || null,
          lessonId: lessonId || null,
          type,
          difficulty,
          concept: concept.trim() || undefined,
          correctReason: correctReason.trim(),
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
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 sm:pl-16">
        <div className="w-screen max-w-2xl bg-white dark:bg-[#0F172A] shadow-2xl flex flex-col border-l border-[#E2E8F0] dark:border-[#334155] text-right">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-3 bg-white dark:bg-[#0F172A] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#800020]/10 dark:bg-[#800020]/20 flex items-center justify-center text-[#800020] dark:text-[#FB7185]">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                  {mode === "edit" ? "تعديل السؤال" : "إضافة سؤال جديد"}
                </h3>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  تحديد المنهج، نص السؤال، الخيارات، والتفسيرات العلمية
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content - Scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[13px] font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Curriculum Hierarchy Selector */}
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
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-[#0F172A] dark:text-white">
                  نص السؤال *
                </label>
                <textarea
                  required
                  rows={4}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="اكتب صيغة السؤال هنا بدقة (يدعم التنسيقات والرموز واللغات المختلفة)..."
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[13px] font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#800020] transition-colors"
                />
              </div>

              {/* Diagram / Image Uploader */}
              <QuestionImageUploader
                imageUrl={imageUrl}
                onChange={setImageUrl}
              />

              {/* Type and Difficulty Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8]">
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

                <div className="space-y-1.5">
                  <label className="block text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8]">
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

              {/* Options or Essay Rubric Editor */}
              <QuestionTypeOptionsEditor
                type={type}
                options={options}
                setOptions={setOptions}
                modelAnswer={modelAnswer}
                setModelAnswer={setModelAnswer}
              />

              {/* Educational Explanation Editor */}
              <QuestionExplanationEditor
                concept={concept}
                setConcept={setConcept}
                correctReason={correctReason}
                setCorrectReason={setCorrectReason}
              />
            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-4 sm:p-5 border-t border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جارٍ الحفظ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{mode === "edit" ? "حفظ التعديلات" : "إضافة السؤال للبنك"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
