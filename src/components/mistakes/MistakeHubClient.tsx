"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Filter,
  Check,
  Lightbulb,
  ArrowLeft,
  Sparkles,
  Trophy,
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

interface Question {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  subject: { id: string; name: string };
  unit?: { id: string; title: string } | null;
  options: QuestionOption[];
  explanation?: QuestionExplanation | null;
  lessons: { lesson: { id: string; title: string } }[];
}

interface MistakeItem {
  id: string;
  questionId: string;
  wrongCount: number;
  isResolved: boolean;
  lastAttemptAt: Date | string;
  question: Question;
}

interface MistakeHubClientProps {
  initialMistakes: MistakeItem[];
  subjects: { id: string; name: string }[];
}

export function MistakeHubClient({
  initialMistakes,
  subjects,
}: MistakeHubClientProps) {
  const [mistakes, setMistakes] = useState<MistakeItem[]>(initialMistakes);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "unresolved" | "resolved">("unresolved");

  // Inline answering state for questions in mistake hub
  const [activeAnswers, setActiveAnswers] = useState<
    Record<
      string,
      {
        selectedOptionId: string;
        isChecking: boolean;
        result?: { isCorrect: boolean };
      }
    >
  >({});

  const filteredMistakes = mistakes.filter((m) => {
    if (selectedSubjectId !== "all" && m.question.subject.id !== selectedSubjectId) {
      return false;
    }
    if (filterStatus === "unresolved" && m.isResolved) return false;
    if (filterStatus === "resolved" && !m.isResolved) return false;
    return true;
  });

  const totalCount = mistakes.length;
  const resolvedCount = mistakes.filter((m) => m.isResolved).length;
  const unresolvedCount = totalCount - resolvedCount;
  const masteryPercentage = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

  const handleRetakeAnswer = async (questionId: string, optionId: string) => {
    setActiveAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selectedOptionId: optionId,
        isChecking: true,
      },
    }));

    try {
      const res = await fetch(`/api/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId: optionId }),
      });

      const data = await res.json();
      const isCorrect = !!data.isCorrect;

      setActiveAnswers((prev) => ({
        ...prev,
        [questionId]: {
          selectedOptionId: optionId,
          isChecking: false,
          result: { isCorrect },
        },
      }));

      if (isCorrect) {
        // Mark mistake as resolved locally
        setMistakes((prev) =>
          prev.map((m) =>
            m.questionId === questionId ? { ...m, isResolved: true } : m
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 block tracking-tight">
              {unresolvedCount}
            </span>
            <span className="text-xs font-bold text-[#475569] dark:text-slate-400">
              أخطاء تحتاج لتصحيح
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 block tracking-tight">
              {resolvedCount}
            </span>
            <span className="text-xs font-bold text-[#475569] dark:text-slate-400">
              أخطاء تم التغلب عليها
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#4F46E5] dark:text-indigo-400 block tracking-tight">
              {masteryPercentage}%
            </span>
            <span className="text-xs font-bold text-[#475569] dark:text-slate-400">
              نسبة التعافي والإتقان
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setFilterStatus("unresolved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === "unresolved"
                ? "bg-rose-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            بحاجة لمراجعة ({unresolvedCount})
          </button>
          <button
            onClick={() => setFilterStatus("resolved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === "resolved"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            تم إتقانها ({resolvedCount})
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === "all"
                ? "bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white shadow-2xs border border-slate-200/80 dark:border-slate-700/80"
                : "text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            الكل ({totalCount})
          </button>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          >
            <option value="all">جميع المواد</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mistakes List */}
      {filteredMistakes.length > 0 ? (
        <div className="space-y-4">
          {filteredMistakes.map((mistake) => {
            const q = mistake.question;
            const relatedLesson = q.lessons[0]?.lesson;
            const answerState = activeAnswers[q.id];

            return (
              <div
                key={mistake.id}
                className={`p-6 sm:p-7 rounded-2xl border shadow-2xs space-y-4 transition-all ${
                  mistake.isResolved
                    ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40"
                    : "bg-white dark:bg-[#131B2E] border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-300 text-[11px] font-bold border border-indigo-200/50 dark:border-indigo-800/50">
                      {q.subject.name}
                    </span>
                    {mistake.wrongCount > 1 && (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-[10px] font-bold border border-rose-200/50 dark:border-rose-900/50">
                        تكرر الخطأ {mistake.wrongCount} مرات
                      </span>
                    )}
                    {mistake.isResolved && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-800/50">
                        <Check className="w-3 h-3" />
                        <span>تم الإتقان والتصحيح</span>
                      </span>
                    )}
                  </div>

                  {relatedLesson && (
                    <Link
                      href={`/lessons/${relatedLesson.id}`}
                      className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>شرح الدرس: {relatedLesson.title}</span>
                      <ArrowLeft className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {/* Statement */}
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed">
                  {q.statement}
                </h3>

                {/* Inline Options to Retake */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">
                    أعد المحاولة لاختيار الإجابة الصحيحة وتثبيت المفهوم:
                  </span>
                  {q.options.map((opt) => {
                    const isSelected =
                      answerState?.selectedOptionId === opt.id;
                    const isChecked = !!answerState?.result;

                    let rowStyle =
                      "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-slate-200 hover:border-slate-300";

                    if (isChecked) {
                      if (opt.isCorrect) {
                        rowStyle =
                          "bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold";
                      } else if (isSelected && !opt.isCorrect) {
                        rowStyle =
                          "bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-600 text-rose-900 dark:text-rose-200 font-bold";
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleRetakeAnswer(q.id, opt.id)}
                        className={`w-full p-3.5 rounded-xl border text-right text-xs sm:text-sm font-medium flex items-center justify-between gap-3 transition-colors ${rowStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                            {opt.order}
                          </span>
                          <span>{opt.text}</span>
                        </div>

                        {isChecked && (
                          <div>
                            {opt.isCorrect ? (
                              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>صحيح! أحسنت</span>
                              </span>
                            ) : isSelected ? (
                              <span className="text-rose-600 dark:text-rose-400 text-xs font-bold">
                                غير صحيح
                              </span>
                            ) : null}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-1.5 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] dark:text-amber-400">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>المفهوم: {q.explanation.concept}</span>
                    </div>
                    <p className="text-xs text-[#0F172A] dark:text-slate-200 leading-relaxed font-medium">
                      {q.explanation.correctReason}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
            رائع! لا توجد أخطاء في هذا التحديد
          </h3>
          <p className="text-xs text-[#475569] dark:text-slate-400">
            استمر في خوض الامتحانات وحل التدريبات لاكتشاف المزيد وتثبيت حفظك وفهمك.
          </p>
          <Link
            href="/exams"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all active:scale-95 shadow-2xs"
          >
            <span>انتقل إلى الامتحانات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
