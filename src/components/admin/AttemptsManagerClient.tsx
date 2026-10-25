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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#0F172A] dark:text-[#F8FAFC]" />
            <span>سجل محاولات الطلاب والتصحيح</span>
          </h1>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            متابعة إجابات الطلاب في الوقت الفعلي، مراجعة الأسئلة المقالية وتصحيحها واعتماد النتائج
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Mode filter pills */}
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "كافة المحاولات" },
            { id: "EXAM", label: "الامتحانات الرسمية" },
            { id: "PRACTICE", label: "التدريبات الحرة" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setModeFilter(pill.id)}
              className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                modeFilter === pill.id
                  ? "bg-[#334155] text-white dark:bg-[#F8FAFC] dark:text-[#1E293B] font-semibold"
                  : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطالب، الهاتف، أو الامتحان..."
            className="w-full h-11 pr-8 pl-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] outline-none"
          />
        </div>
      </div>

      {/* Attempts Table (Vercel Style) */}
      <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] overflow-hidden ">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/50 text-[#64748B] font-mono text-[13px] uppercase tracking-wider">
                <th className="py-3 px-4">الطالب</th>
                <th className="py-3 px-4">الامتحان / المادة</th>
                <th className="py-3 px-4">النوع</th>
                <th className="py-3 px-4">النتيجة</th>
                <th className="py-3 px-4">الوقت المستغرق</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]/80">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B]">
                    لا توجد محاولات مسجلة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((att) => (
                  <tr
                    key={att.id}
                    className="hover:bg-[#F8FAFC]/80 dark:hover:bg-[#1E293B]/40 transition-colors"
                  >
                    {/* Student */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#F8FAFC] dark:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center font-bold text-[13px] text-[#0F172A] dark:text-[#F8FAFC]">
                          {(att.user.name || "ط").charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">
                            {att.user.name || "طالب"}
                          </span>
                          <span className="text-[13px] font-mono text-[#64748B] block">
                            {att.user.phone || att.user.email || "بدون هاتف"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Exam / Subject */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block truncate max-w-xs">
                          {att.exam?.title || att.title}
                        </span>
                        {att.exam?.subject && (
                          <span className="text-[13px] text-[#64748B] flex items-center gap-1 mt-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: att.exam.subject.color || "#800020",
                              }}
                            />
                            <span>{att.exam.subject.name}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Mode */}
                    <td className="py-4 px-4 font-mono">
                      {att.mode === "EXAM" ? (
                        <span className="px-2 py-1 rounded text-[13px] font-semibold bg-[#800020]/10 text-[#800020] border border-[#800020]/20">
                          امتحان رسمي
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[13px] font-semibold bg-[#64748B] text-[#64748B] border border-[#94A3B8]/20">
                          تدريب حر
                        </span>
                      )}
                    </td>

                    {/* Score / Percentage */}
                    <td className="py-4 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            att.percentage >= 85
                              ? "text-[#059669]"
                              : att.percentage >= 50
                              ? "text-[#D97706]"
                              : "text-[#DC2626]"
                          }`}
                        >
                          {att.percentage}%
                        </span>
                        <span className="text-[13px] text-[#64748B]">
                          ({att.score} نقطة)
                        </span>
                      </div>
                    </td>

                    {/* Time Spent */}
                    <td className="py-4 px-4 font-mono text-[#64748B] text-[13px]">
                      {Math.floor(att.timeSpentSeconds / 60)}د {att.timeSpentSeconds % 60}ث
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 font-mono text-[#64748B] text-[13px]">
                      {new Date(att.startedAt).toLocaleDateString("ar-EG")}
                    </td>

                    {/* Inspect button */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleOpenInspect(att)}
                        className="h-7 px-3 rounded-md border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-medium flex items-center gap-2 transition-colors mx-auto cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 ">
          <div className="w-full max-w-3xl max-h-[90vh] rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-sm flex flex-col overflow-hidden text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] dark:border-[#334155] shrink-0 bg-[#F8FAFC] dark:bg-[#1E293B]/50">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                  <span>تفاصيل محاولة: {inspectModal.attempt.user.name}</span>
                  <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC]">
                    {inspectModal.attempt.percentage}%
                  </span>
                </h3>
                <span className="text-[13px] text-[#64748B] font-mono block mt-1">
                  {inspectModal.attempt.exam?.title || inspectModal.attempt.title}
                </span>
              </div>

              <button
                onClick={() =>
                  setInspectModal({ isOpen: false, loadingDetails: false })
                }
                className="p-1 rounded text-[#64748B] hover:text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content / Answers List */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {inspectModal.loadingDetails ? (
                <div className="py-12 text-center text-[13px] text-[#64748B]">
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
                      className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC]/50 dark:bg-[#1E293B]/20 space-y-3"
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[13px] font-mono text-[#64748B]">
                            سؤال {idx + 1} ({q.type})
                          </span>
                          <p className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                            {q.statement}
                          </p>
                        </div>

                        {ans.isCorrect === true ? (
                          <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#059669]/10 text-[#059669] font-bold shrink-0">
                            إجابة صحيحة
                          </span>
                        ) : ans.isCorrect === false ? (
                          <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#DC2626]/10 text-[#DC2626] font-bold shrink-0">
                            إجابة خاطئة
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-[13px] font-mono bg-[#D97706]/10 text-[#D97706] font-bold shrink-0">
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
                                className={`p-3 rounded text-[13px] border flex items-center justify-between ${
                                  isCorrectOpt
                                    ? "border-[#059669]/60 bg-[#059669]/10 text-[#059669] font-semibold"
                                    : isSelected
                                    ? "border-[#DC2626]/60 bg-[#DC2626]/10 text-[#DC2626]"
                                    : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]"
                                }`}
                              >
                                <span>{opt.text}</span>
                                {isCorrectOpt && (
                                  <span className="text-[13px] font-mono">
                                    الإجابة النموذجية
                                  </span>
                                )}
                                {isSelected && !isCorrectOpt && (
                                  <span className="text-[13px] font-mono">
                                    اختيار الطالب
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
                          <div className="p-3 rounded bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
                            <span className="text-[13px] font-mono text-[#64748B] block mb-1">
                              إجابة الطالب المقالية:
                            </span>
                            <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-medium whitespace-pre-wrap">
                              {ans.essayText || "لم يقم الطالب بكتابة إجابة"}
                            </p>
                          </div>

                          {/* Model Answer from rubric */}
                          {q.rubric && (
                            <div className="p-3 rounded bg-[#800020]/10 dark:bg-[#1E293B] border border-[#E2E8F0]/50 dark:border-[#E11D48]/40 text-[13px]">
                              <span className="text-[13px] font-mono text-[#800020] block mb-1">
                                الإجابة النموذجية (معيار التصحيح):
                              </span>
                              <p className="text-[#0F172A] dark:text-[#F8FAFC]">
                                {q.rubric.modelAnswer}
                              </p>
                            </div>
                          )}

                          {/* Manual Grading Action Bar */}
                          <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                            <span className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
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
                              className="h-7 px-3 rounded text-[13px] font-semibold bg-[#059669] hover:bg-[#047857] text-white flex items-center gap-1 transition-colors cursor-pointer"
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
                              className="h-7 px-3 rounded text-[13px] font-semibold bg-[#DC2626] hover:bg-[#B91C1C] text-white flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>إجابة خاطئة (0 درجة)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Academic explanation if available */}
                      {q.explanation && (
                        <div className="text-[13px] text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC]/60 dark:bg-[#1E293B]/40 p-3 rounded border border-[#E2E8F0]/50 dark:border-[#334155]/50">
                          <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                            المفهوم التعليمي: {q.explanation.concept}
                          </span>
                          <span>{q.explanation.correctReason}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[13px] text-[#64748B]">
                  لا توجد إجابات مسجلة لهذه المحاولة.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/50 flex items-center justify-end">
              <button
                onClick={() =>
                  setInspectModal({ isOpen: false, loadingDetails: false })
                }
                className="h-11 px-4 rounded-md bg-[#334155] dark:bg-[#F8FAFC] text-white dark:text-[#1E293B] text-[13px] font-semibold"
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
