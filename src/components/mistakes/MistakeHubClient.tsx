"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";

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
  const router = useRouter();
  const [mistakes, setMistakes] = useState<MistakeItem[]>(initialMistakes);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);

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

  const handleGenerateExamFromMistakes = async () => {
    const targetMistakes = filteredMistakes.filter((m) => !m.isResolved);
    if (targetMistakes.length === 0) return;

    setIsGeneratingExam(true);
    try {
      const res = await fetch("/api/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "امتحان معالجة الأخطاء: مراجعة وتثبيت نقاط الضعف",
          mode: "PRACTICE",
          durationMinutes: Math.max(10, Math.min(60, targetMistakes.length * 2)),
          questionIds: targetMistakes.map((m) => m.questionId),
          subjectId: selectedSubjectId !== "all" ? selectedSubjectId : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.examId && data.attemptId) {
        router.push(`/exams/${data.examId}?attemptId=${data.attemptId}`);
      } else {
        alert(data.error || "تعذر تجهيز الامتحان، حاول مرة أخرى.");
        setIsGeneratingExam(false);
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.");
      setIsGeneratingExam(false);
    }
  };

  const actionableUnresolvedCount = filteredMistakes.filter((m) => !m.isResolved).length;

  return (
    <div className="space-y-6">
      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 block tracking-tight">
              {unresolvedCount}
            </span>
            <span className="text-xs font-bold text-[#475569] dark:text-zinc-400">
              أسئلة محتاجة تتظبّط
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 block tracking-tight">
              {resolvedCount}
            </span>
            <span className="text-xs font-bold text-[#475569] dark:text-zinc-400">
              أسئلة قفلتها وظبّطتها
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#4F46E5] dark:text-indigo-400 block tracking-tight">
              {masteryPercentage}%
            </span>
            <span className="text-xs font-bold text-[#475569] dark:text-zinc-400">
              نسبة التمكّن والتثبيت
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Exam Banner when there are unresolved mistakes */}
      {actionableUnresolvedCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-l from-indigo-50 to-white dark:from-zinc-950 dark:to-zinc-950 border border-indigo-200/80 dark:border-indigo-900/50 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-ping" />
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                عاوز تتدرب عليهم في امتحان عملي مجمع؟
              </h3>
            </div>
            <p className="text-xs text-[#475569] dark:text-zinc-400">
              هنعملك امتحان فوري بـ {actionableUnresolvedCount} أسئلة اللي لسه ما قفلتهمش عشان تثبتهم فوراً.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateExamFromMistakes}
            disabled={isGeneratingExam}
            className="h-10 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 disabled:opacity-50 interactive-tap shrink-0"
          >
            {isGeneratingExam ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>بنجهّز الامتحان...</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-4 h-4" />
                <span>ابدأ امتحان من غلطاتي ({actionableUnresolvedCount})</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
          <button
            onClick={() => setFilterStatus("unresolved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === "unresolved"
                ? "bg-rose-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            بحاجة لمراجعة ({unresolvedCount})
          </button>
          <button
            onClick={() => setFilterStatus("resolved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === "resolved"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            تم إتقانها ({resolvedCount})
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === "all"
                ? "bg-white dark:bg-zinc-900 text-[#0F172A] dark:text-white shadow-2xs border border-slate-200/80 dark:border-zinc-800/80"
                : "text-slate-600 dark:text-zinc-400 hover:text-[#0F172A] dark:hover:text-white"
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
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
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
                    : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-300 text-[11px] font-bold border border-indigo-200/50 dark:border-indigo-800/50">
                      <BidiStatement as="span" text={q.subject.name} />
                    </span>
                    {mistake.wrongCount > 1 && (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-[10px] font-bold border border-rose-200/50 dark:border-rose-900/50">
                        اتكرر الغلط {mistake.wrongCount} مرات
                      </span>
                    )}
                    {mistake.isResolved && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-800/50">
                        <Check className="w-3 h-3" />
                        <span>اتقنتها خلاص</span>
                      </span>
                    )}
                  </div>

                  {relatedLesson && (
                    <Link
                      href={`/lessons/${relatedLesson.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink min-w-0 max-w-full sm:max-w-md group"
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                      <span className="truncate">
                        شرح الدرس: <BidiStatement as="span" text={relatedLesson.title} />
                      </span>
                      <ArrowLeft className="w-3 h-3 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                    </Link>
                  )}
                </div>

                {/* Statement */}
                <BidiStatement
                  as="h3"
                  text={q.statement}
                  className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-relaxed font-content"
                />

                {/* Inline Options to Retake */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    جرب تحلها تاني دلوقتي وافهم الصح عشان متغلطش فيها:
                  </span>
                  {q.options.map((opt, optIdx) => {
                    const isSelected =
                      answerState?.selectedOptionId === opt.id;
                    const isChecked = !!answerState?.result;

                    let rowStyle =
                      "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-[#0F172A] dark:text-zinc-200 hover:border-slate-300";

                    if (isChecked) {
                      if (opt.isCorrect) {
                        rowStyle =
                          "bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold";
                      } else if (isSelected && !opt.isCorrect) {
                        rowStyle =
                          "bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-600 text-rose-900 dark:text-rose-200 font-bold";
                      }
                    }

                    const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleRetakeAnswer(q.id, opt.id)}
                        className={`w-full p-3.5 sm:p-4 rounded-xl border text-right text-xs sm:text-sm font-medium flex items-start sm:items-center justify-between gap-3 transition-colors ${rowStyle}`}
                      >
                        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 sm:mt-0 border border-slate-200/60 dark:border-zinc-800/60">
                            {arabicLetters[optIdx] || opt.order}
                          </span>
                          <div className="min-w-0 flex-1 leading-relaxed">
                            <BidiStatement as="span" text={opt.text} />
                          </div>
                        </div>

                        {isChecked && (
                          <div className="shrink-0">
                            {opt.isCorrect ? (
                              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>صح! برافو عليك</span>
                              </span>
                            ) : isSelected ? (
                              <span className="text-rose-600 dark:text-rose-400 text-xs font-bold">
                                مش صحيحة
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
                    <p className="text-xs text-[#0F172A] dark:text-zinc-200 leading-relaxed font-medium">
                      {q.explanation.correctReason}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
            رائع! لا توجد أخطاء في هذا التحديد
          </h3>
          <p className="text-xs text-[#475569] dark:text-zinc-400">
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
