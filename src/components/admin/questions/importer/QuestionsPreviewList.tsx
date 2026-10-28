"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Check,
  Edit3,
  X,
  Search,
  BookOpen,
  Filter,
  CheckSquare,
  Square,
  ArrowRight,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";
import { ParsedQuestion } from "@/lib/question-parser";

interface QuestionsPreviewListProps {
  questions: ParsedQuestion[];
  selectedQuestionIds: Set<string>;
  isLanguageSchool: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  onCommit: () => void;
  onBackToUpload: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onToggleSelect: (id: string) => void;
  onUpdateQuestion: (updated: ParsedQuestion) => void;
  revalidateQuestion: (q: ParsedQuestion) => ParsedQuestion;
}

export function QuestionsPreviewList({
  questions,
  selectedQuestionIds,
  isLanguageSchool,
  isSubmitting,
  submitError,
  onCommit,
  onBackToUpload,
  onSelectAll,
  onDeselectAll,
  onToggleSelect,
  onUpdateQuestion,
  revalidateQuestion,
}: QuestionsPreviewListProps) {
  const [filterMode, setFilterMode] = useState<"ALL" | "READY" | "NEEDS_REVIEW">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Edit buffer state
  const [editStatement, setEditStatement] = useState("");
  const [editOptions, setEditOptions] = useState<{ text: string; isCorrect: boolean }[]>([]);
  const [editExplanation, setEditExplanation] = useState("");
  const [editModelAnswer, setEditModelAnswer] = useState("");

  const validQuestions = questions.filter((q) => q.isValid);
  const invalidQuestions = questions.filter((q) => !q.isValid);
  const readyToImportQuestions = questions.filter(
    (q) => q.isValid && selectedQuestionIds.has(q.id)
  );

  const filteredQuestions = questions.filter((q) => {
    if (filterMode === "READY" && !q.isValid) return false;
    if (filterMode === "NEEDS_REVIEW" && q.isValid) return false;
    if (searchQuery.trim()) {
      const matchStatement = q.statement.toLowerCase().includes(searchQuery.toLowerCase());
      const matchOption = q.options?.some((o) =>
        o.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (!matchStatement && !matchOption) return false;
    }
    return true;
  });

  const startEditing = (q: ParsedQuestion) => {
    setEditingQuestionId(q.id);
    setEditStatement(q.statement);
    setEditOptions(q.options.map((o) => ({ ...o })));
    setEditExplanation(q.correctReason || "");
    setEditModelAnswer(q.modelAnswer || "");
  };

  const cancelEditing = () => {
    setEditingQuestionId(null);
  };

  const saveEditing = (original: ParsedQuestion) => {
    const updated: ParsedQuestion = {
      ...original,
      statement: editStatement.trim(),
      options: editOptions.map((o) => ({ ...o, text: o.text.trim() })),
      modelAnswer: editModelAnswer.trim() || undefined,
      correctReason: editExplanation.trim() || undefined,
    };

    const revalidated = revalidateQuestion(updated);
    onUpdateQuestion(revalidated);
    setEditingQuestionId(null);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar with Return Button and Main Save CTA */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <button
              type="button"
              onClick={onBackToUpload}
              className="text-[12px] font-bold text-slate-500 hover:text-[#800020] dark:hover:text-[#FB7185] flex items-center gap-1.5 mb-2 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لخيارات المنهج ورفع ملف آخر</span>
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>مراجعة الأسئلة المستخرجة</span>
              <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#FB7185]">
                {questions.length} سؤال
              </span>
            </h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
              راجع الأسئلة وخياراتها وتأكد من اكتمال الإجابات قبل اعتماد الحفظ في بنك الأسئلة
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onCommit}
              disabled={readyToImportQuestions.length === 0 || isSubmitting}
              className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] disabled:opacity-50 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ في البنك...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>حفظ {readyToImportQuestions.length} سؤال في بنك الأسئلة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {submitError && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-[13px] font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* 2. Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
              إجمالي المستخرج
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">
              {questions.length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
              جاهز للاستيراد
            </span>
            <span className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 block">
              {validQuestions.length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/60">
            <span className="text-[11px] font-bold text-red-700 dark:text-red-400 block">
              يتطلب تدقيق
            </span>
            <span className="text-xl font-bold text-red-800 dark:text-red-300 mt-0.5 block">
              {invalidQuestions.length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#800020]/5 dark:bg-[#800020]/15 border border-[#800020]/20">
            <span className="text-[11px] font-bold text-[#800020] dark:text-[#FB7185] block">
              محدد للحفظ
            </span>
            <span className="text-xl font-bold text-[#800020] dark:text-[#FB7185] mt-0.5 block">
              {readyToImportQuestions.length}
            </span>
          </div>
        </div>

        {/* 3. Filters and Search Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 w-fit">
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className={`h-8 px-3 rounded-lg text-[12px] font-bold transition-all ${
                filterMode === "ALL"
                  ? "bg-[#800020] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              الكل ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("READY")}
              className={`h-8 px-3 rounded-lg text-[12px] font-bold transition-all ${
                filterMode === "READY"
                  ? "bg-[#800020] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              الجاهزة ({validQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("NEEDS_REVIEW")}
              className={`h-8 px-3 rounded-lg text-[12px] font-bold transition-all ${
                filterMode === "NEEDS_REVIEW"
                  ? "bg-[#800020] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              تحتاج تدقيق ({invalidQuestions.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في نصوص الأسئلة..."
                className="w-full h-9 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[12px] focus:outline-none focus:border-[#800020]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onSelectAll}
                className="text-[12px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline cursor-pointer"
              >
                تحديد الكل
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={onDeselectAll}
                className="text-[12px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Questions List */}
      <div className="space-y-3.5">
        {filteredQuestions.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
            لا توجد أسئلة تطابق معايير الفلترة أو البحث الحالية
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isSelected = selectedQuestionIds.has(q.id);
            const isEditing = editingQuestionId === q.id;

            return (
              <div
                key={q.id}
                dir={isLanguageSchool ? "ltr" : "rtl"}
                className={`p-5 rounded-2xl bg-white dark:bg-[#1E293B] border transition-all ${
                  !q.isValid
                    ? "border-red-300 dark:border-red-800/80 bg-red-50/20"
                    : isSelected
                    ? "border-[#800020]/40 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 opacity-80"
                }`}
              >
                {/* Question Header Row */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleSelect(q.id)}
                      className="cursor-pointer text-slate-500 hover:text-[#800020] transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#800020]" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        #{idx + 1}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {q.type === "MCQ"
                          ? "MCQ"
                          : q.type === "TRUE_FALSE"
                          ? "صح/خطأ"
                          : "مقالي"}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
                        {q.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {q.isValid ? (
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        جاهز
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        يحتاج تعديل
                      </span>
                    )}

                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => startEditing(q)}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:text-[#800020] hover:border-[#800020] flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Validation Notes (if any) */}
                {!q.isValid && q.validationNotes && q.validationNotes.length > 0 && (
                  <div className="mb-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-[12px] text-red-700 dark:text-red-300 space-y-1">
                    {q.validationNotes.map((note, nIdx) => (
                      <div key={nIdx} className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Normal View Mode */}
                {!isEditing ? (
                  <div className="space-y-3">
                    {/* Full Statement */}
                    <div className="text-[14px] font-bold text-slate-900 dark:text-white leading-relaxed">
                      <BidiStatement text={q.statement} />
                    </div>

                    {/* MCQ Options Preview */}
                    {q.type === "MCQ" && q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border text-[13px] flex items-center justify-between gap-2 transition-colors ${
                              opt.isCorrect
                                ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 font-bold text-emerald-900 dark:text-emerald-200"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span className="flex-1">
                              <BidiStatement text={opt.text} />
                            </span>
                            {opt.isCorrect && (
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                <Check className="w-3 h-3" />
                                الإجابة الصحيحة
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True/False Options Preview */}
                    {q.type === "TRUE_FALSE" && q.options && q.options.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`px-3 py-1.5 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${
                              opt.isCorrect
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500"
                            }`}
                          >
                            <span>{opt.text}</span>
                            {opt.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Essay Model Answer Preview */}
                    {q.type === "ESSAY" && q.modelAnswer && (
                      <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-[13px]">
                        <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                          الإجابة النموذجية المعتمدة:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {q.modelAnswer}
                        </p>
                      </div>
                    )}

                    {/* Scientific Explanation / Concept */}
                    {q.correctReason && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[12px] text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                          التفسير العلمي:
                        </span>
                        <span>{q.correctReason}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  // Inline Edit Mode
                  <div className="space-y-3.5 pt-1">
                    <div>
                      <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        نص السؤال
                      </label>
                      <textarea
                        rows={3}
                        value={editStatement}
                        onChange={(e) => setEditStatement(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] font-bold focus:outline-none focus:border-[#800020]"
                      />
                    </div>

                    {/* Edit MCQ or True/False Options */}
                    {editOptions.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block">
                          الخيارات (انقر على الزر لتحديد الإجابة الصحيحة)
                        </label>
                        <div className="space-y-1.5">
                          {editOptions.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditOptions((prev) =>
                                    prev.map((o, idx) => ({
                                      ...o,
                                      isCorrect: idx === oIdx,
                                    }))
                                  );
                                }}
                                className={`h-9 px-3 rounded-xl border text-[12px] font-bold transition-all shrink-0 ${
                                  opt.isCorrect
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                                }`}
                              >
                                {opt.isCorrect ? "صحيح ✓" : "تحديد كإجابة"}
                              </button>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const nextVal = e.target.value;
                                  setEditOptions((prev) =>
                                    prev.map((o, idx) =>
                                      idx === oIdx ? { ...o, text: nextVal } : o
                                    )
                                  );
                                }}
                                className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] focus:outline-none focus:border-[#800020]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Edit Essay Model Answer */}
                    {q.type === "ESSAY" && (
                      <div>
                        <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          الإجابة النموذجية
                        </label>
                        <textarea
                          rows={2}
                          value={editModelAnswer}
                          onChange={(e) => setEditModelAnswer(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] focus:outline-none focus:border-[#800020]"
                        />
                      </div>
                    )}

                    {/* Edit Explanation */}
                    <div>
                      <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        التفسير العلمي
                      </label>
                      <input
                        type="text"
                        value={editExplanation}
                        onChange={(e) => setEditExplanation(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[13px] focus:outline-none focus:border-[#800020]"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-[12px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEditing(q)}
                        className="h-8 px-4 rounded-lg bg-[#800020] text-white text-[12px] font-bold hover:bg-[#66001A] shadow-sm"
                      >
                        حفظ التعديلات
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Save Bar on Desktop / Mobile bottom if questions ready */}
      {readyToImportQuestions.length > 0 && (
        <div className="sticky bottom-6 z-20 p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#800020]/30 shadow-xl flex items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                جاهز لاعتماد {readyToImportQuestions.length} سؤال
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                سيتم إلحاق الأسئلة بالتسلسل المعتمد دون تكرار أو حذف للأسئلة السابقة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCommit}
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl bg-[#800020] hover:bg-[#66001A] disabled:opacity-50 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>حفظ الأسئلة في بنك الأسئلة</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
