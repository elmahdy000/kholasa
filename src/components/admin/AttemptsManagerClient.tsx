"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Search,
  Filter,
  Eye,
  X,
  Sparkles,
  BookOpen,
  User,
  ChevronDown,
  Check,
  AlertCircle,
  FileText,
} from "lucide-react";

interface Answer {
  id: string;
  selectedOptionId?: string | null;
  essayText?: string | null;
  isCorrect?: boolean | null;
  score?: number | null;
  timeSpentSeconds: number;
  question: {
    id: string;
    statement: string;
    type: "MCQ" | "TRUE_FALSE" | "ESSAY";
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
    }[];
    explanation?: {
      concept: string;
      correctReason: string;
    } | null;
    rubric?: {
      modelAnswer: string;
      maxScore: number;
    } | null;
  };
}

interface Attempt {
  id: string;
  title: string;
  mode: "PRACTICE" | "EXAM";
  score: number;
  percentage: number;
  timeSpentSeconds: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string | null;
  user: {
    id: string;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  exam?: {
    id: string;
    title: string;
    durationMinutes: number;
    subject: {
      name: string;
      color?: string | null;
    };
  } | null;
  answers?: Answer[];
  _count?: {
    answers: number;
  };
}

interface AttemptsManagerClientProps {
  initialAttempts: Attempt[];
  subjects: { id: string; name: string }[];
}

export function AttemptsManagerClient({
  initialAttempts,
  subjects,
}: AttemptsManagerClientProps) {
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts);
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [inspectModal, setInspectModal] = useState<{
    isOpen: boolean;
    attempt?: Attempt;
    loadingDetails: boolean;
  }>({ isOpen: false, loadingDetails: false });

  const [savingGradeId, setSavingGradeId] = useState<string | null>(null);

  const handleOpenInspect = async (attempt: Attempt) => {
    setInspectModal({ isOpen: true, attempt, loadingDetails: true });

    try {
      const res = await fetch(`/api/admin/attempts?id=${attempt.id}`);
      const data = await res.json();
      if (data.attempt) {
        setInspectModal({
          isOpen: true,
          attempt: data.attempt,
          loadingDetails: false,
        });
      }
    } catch (err) {
      console.error("Failed to load attempt details:", err);
      setInspectModal((prev) => ({ ...prev, loadingDetails: false }));
    }
  };

  const handleGradeEssay = async (
    answerId: string,
    score: number,
    isCorrect: boolean,
    attemptId: string
  ) => {
    setSavingGradeId(answerId);
    try {
      const res = await fetch("/api/admin/attempts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerId,
          score,
          isCorrect,
          attemptId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local attempt in modal and list
      if (data.updatedAttempt) {
        setInspectModal((prev) => {
          if (!prev.attempt) return prev;
          const updatedAnswers = prev.attempt.answers?.map((ans) =>
            ans.id === answerId ? { ...ans, score, isCorrect } : ans
          );
          return {
            ...prev,
            attempt: {
              ...prev.attempt,
              score: data.updatedAttempt.score,
              percentage: data.updatedAttempt.percentage,
              answers: updatedAnswers,
            },
          };
        });

        setAttempts((prev) =>
          prev.map((a) =>
            a.id === attemptId
              ? {
                  ...a,
                  score: data.updatedAttempt.score,
                  percentage: data.updatedAttempt.percentage,
                }
              : a
          )
        );
      }
    } catch (err: any) {
      alert(err.message || "فشل تحديث الدرجة");
    } finally {
      setSavingGradeId(null);
    }
  };

  const filteredAttempts = attempts.filter((att) => {
    const matchesSearch =
      (att.user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.user.phone || "").includes(searchQuery) ||
      (att.exam?.title || att.title).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMode =
      modeFilter === "all" ||
      (modeFilter === "PRACTICE" && att.mode === "PRACTICE") ||
      (modeFilter === "EXAM" && att.mode === "EXAM");

    return matchesSearch && matchesMode;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            <span>سجل محاولات الطلاب والتصحيح</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            متابعة إجابات الطلاب في الوقت الفعلي، مراجعة الأسئلة المقالية وتصحيحها واعتماد النتائج
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Mode filter pills */}
        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: "كافة المحاولات" },
            { id: "EXAM", label: "الامتحانات الرسمية" },
            { id: "PRACTICE", label: "التدريبات الحرة" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setModeFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                modeFilter === pill.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطالب، الهاتف، أو الامتحان..."
            className="w-full h-8 pr-8 pl-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none"
          />
        </div>
      </div>

      {/* Attempts Table (Vercel Style) */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">الطالب</th>
                <th className="py-3 px-4">الامتحان / المادة</th>
                <th className="py-3 px-4">النوع</th>
                <th className="py-3 px-4">النتيجة</th>
                <th className="py-3 px-4">الوقت المستغرق</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    لا توجد محاولات مسجلة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((att) => (
                  <tr
                    key={att.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    {/* Student */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300">
                          {(att.user.name || "ط").charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                            {att.user.name || "طالب"}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 block">
                            {att.user.phone || att.user.email || "بدون هاتف"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Exam / Subject */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 block truncate max-w-xs">
                          {att.exam?.title || att.title}
                        </span>
                        {att.exam?.subject && (
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: att.exam.subject.color || "#4F46E5",
                              }}
                            />
                            <span>{att.exam.subject.name}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Mode */}
                    <td className="py-3.5 px-4 font-mono">
                      {att.mode === "EXAM" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                          امتحان رسمي
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                          تدريب حر
                        </span>
                      )}
                    </td>

                    {/* Score / Percentage */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            att.percentage >= 85
                              ? "text-emerald-500"
                              : att.percentage >= 50
                              ? "text-amber-500"
                              : "text-red-500"
                          }`}
                        >
                          {att.percentage}%
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          ({att.score} نقطة)
                        </span>
                      </div>
                    </td>

                    {/* Time Spent */}
                    <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">
                      {Math.floor(att.timeSpentSeconds / 60)}د {att.timeSpentSeconds % 60}ث
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                      {new Date(att.startedAt).toLocaleDateString("ar-EG")}
                    </td>

                    {/* Inspect button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenInspect(att)}
                        className="h-7 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors mx-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>مراجعة الإجابات</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect and Grade Modal */}
      {inspectModal.isOpen && inspectModal.attempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[90vh] rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50 dark:bg-zinc-900/50">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>تفاصيل محاولة: {inspectModal.attempt.user.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {inspectModal.attempt.percentage}%
                  </span>
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono block mt-0.5">
                  {inspectModal.attempt.exam?.title || inspectModal.attempt.title}
                </span>
              </div>

              <button
                onClick={() =>
                  setInspectModal({ isOpen: false, loadingDetails: false })
                }
                className="p-1 rounded text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content / Answers List */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {inspectModal.loadingDetails ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  جاري تحميل الإجابات والتفسيرات الأكاديمية...
                </div>
              ) : inspectModal.attempt.answers &&
                inspectModal.attempt.answers.length > 0 ? (
                inspectModal.attempt.answers.map((ans, idx) => {
                  const q = ans.question;
                  const isMCQ = q.type === "MCQ" || q.type === "TRUE_FALSE";
                  const isEssay = q.type === "ESSAY";

                  return (
                    <div
                      key={ans.id}
                      className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-3"
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-zinc-400">
                            سؤال {idx + 1} ({q.type})
                          </span>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                            {q.statement}
                          </p>
                        </div>

                        {ans.isCorrect === true ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 font-bold shrink-0">
                            إجابة صحيحة
                          </span>
                        ) : ans.isCorrect === false ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-500 font-bold shrink-0">
                            إجابة خاطئة
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-500 font-bold shrink-0">
                            بانتظار التصحيح
                          </span>
                        )}
                      </div>

                      {/* MCQ Choices view */}
                      {isMCQ && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt) => {
                            const isSelected = ans.selectedOptionId === opt.id;
                            const isCorrectOpt = opt.isCorrect;

                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded text-xs border flex items-center justify-between ${
                                  isCorrectOpt
                                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400 font-semibold"
                                    : isSelected
                                    ? "border-red-500/60 bg-red-500/10 text-red-400"
                                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                                }`}
                              >
                                <span>{opt.text}</span>
                                {isCorrectOpt && (
                                  <span className="text-[10px] font-mono">
                                    ✓ الإجابة النموذجية
                                  </span>
                                )}
                                {isSelected && !isCorrectOpt && (
                                  <span className="text-[10px] font-mono">
                                    ✗ اختيار الطالب
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Essay Question view & manual grading */}
                      {isEssay && (
                        <div className="space-y-3 pt-1">
                          {/* Student Answer */}
                          <div className="p-3 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <span className="text-[10px] font-mono text-zinc-400 block mb-1">
                              إجابة الطالب المقالية:
                            </span>
                            <p className="text-xs text-zinc-900 dark:text-zinc-100 font-medium whitespace-pre-wrap">
                              {ans.essayText || "لم يقم الطالب بكتابة إجابة"}
                            </p>
                          </div>

                          {/* Model Answer from rubric */}
                          {q.rubric && (
                            <div className="p-3 rounded bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/40 text-xs">
                              <span className="text-[10px] font-mono text-indigo-500 block mb-1">
                                الإجابة النموذجية (معيار التصحيح):
                              </span>
                              <p className="text-zinc-700 dark:text-zinc-300">
                                {q.rubric.modelAnswer}
                              </p>
                            </div>
                          )}

                          {/* Manual Grading Action Bar */}
                          <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              تصحيح هذا السؤال:
                            </span>
                            <button
                              onClick={() =>
                                handleGradeEssay(
                                  ans.id,
                                  q.rubric?.maxScore || 10,
                                  true,
                                  inspectModal.attempt!.id
                                )
                              }
                              disabled={savingGradeId === ans.id}
                              className="h-7 px-3 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>اعتماد إجابة صحيحة (درجة كاملة)</span>
                            </button>
                            <button
                              onClick={() =>
                                handleGradeEssay(
                                  ans.id,
                                  0,
                                  false,
                                  inspectModal.attempt!.id
                                )
                              }
                              disabled={savingGradeId === ans.id}
                              className="h-7 px-3 rounded text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>إجابة خاطئة (0 درجة)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Academic explanation if available */}
                      {q.explanation && (
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-100/60 dark:bg-zinc-900/40 p-2.5 rounded border border-zinc-200/50 dark:border-zinc-800/50">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-0.5">
                            المفهوم التعليمي: {q.explanation.concept}
                          </span>
                          <span>{q.explanation.correctReason}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">
                  لا توجد إجابات مسجلة لهذه المحاولة.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-end">
              <button
                onClick={() =>
                  setInspectModal({ isOpen: false, loadingDetails: false })
                }
                className="h-8 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
