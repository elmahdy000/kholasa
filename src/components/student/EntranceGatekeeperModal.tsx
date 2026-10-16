"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Trophy,
  Loader2,
  Lock,
  Unlock,
  Lightbulb,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { BidiStatement } from "@/components/ui/BidiStatement";

interface Option {
  id: string;
  text: string;
  order: number;
}

interface QuestionItem {
  id: string;
  statement: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: string;
  subjectName: string;
  unitTitle?: string | null;
  options: Option[];
}

interface ReviewedQuestion {
  id: string;
  statement: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: string;
  subjectName: string;
  unitTitle?: string | null;
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  concept?: string | null;
  correctReason?: string | null;
  modelAnswer?: string | null;
}

interface ExamResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  wrongCount: number;
  unlockToken: string;
  reviewedQuestions: ReviewedQuestion[];
}

interface EntranceGatekeeperModalProps {
  userRole?: string;
  userId?: string;
}

export function EntranceGatekeeperModal({
  userRole = "STUDENT",
  userId,
}: EntranceGatekeeperModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Student Answers Map: questionId -> { selectedOptionId, essayText }
  const [answers, setAnswers] = useState<
    Record<string, { selectedOptionId?: string; essayText?: string }>
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  // Check if student has already unlocked the platform today
  useEffect(() => {
    // If user is admin or teacher, do not force gatekeeper exam
    if (userRole && userRole !== "STUDENT") {
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const storageKey = `kholasa_entrance_unlocked_${userId || "guest"}_${todayDate}`;
    const isUnlocked = localStorage.getItem(storageKey);

    if (isUnlocked) {
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch entrance questions
    fetchQuestions();
  }, [userRole, userId]);

  // Support voluntarily opening the exam from dashboard
  useEffect(() => {
    const handleReopen = () => {
      setExamResult(null);
      setCurrentStep(0);
      setAnswers({});
      setTimeSpent(0);
      fetchQuestions();
    };
    window.addEventListener("kholasa_open_entrance_exam", handleReopen);
    return () => window.removeEventListener("kholasa_open_entrance_exam", handleReopen);
  }, []);

  const isAlreadyUnlocked = () => {
    if (typeof window === "undefined") return false;
    const todayDate = new Date().toISOString().slice(0, 10);
    const storageKey = `kholasa_entrance_unlocked_${userId || "guest"}_${todayDate}`;
    return Boolean(localStorage.getItem(storageKey));
  };

  // Timer for time spent
  useEffect(() => {
    if (!isOpen || examResult) return;
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, examResult]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/student/daily-checkin");
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setIsOpen(true);
        } else {
          // No questions available, do not block student
          setIsOpen(false);
        }
      } else {
        setIsOpen(false);
      }
    } catch {
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: optionId,
      },
    }));
  };

  const handleEssayChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        essayText: text,
      },
    }));
  };

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    try {
      const payloadAnswers = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id]?.selectedOptionId,
        essayText: answers[q.id]?.essayText,
      }));

      const res = await fetch("/api/student/daily-checkin/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: payloadAnswers,
          timeSpentSeconds: timeSpent,
        }),
      });

      if (!res.ok) {
        throw new Error("فشل تسليم الاختبار");
      }

      const data: ExamResult = await res.json();
      setExamResult(data);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تصحيح الاختبار، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlockAndEnter = () => {
    const todayDate = new Date().toISOString().slice(0, 10);
    const storageKey = `kholasa_entrance_unlocked_${userId || "guest"}_${todayDate}`;
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
  };

  if (!isOpen || isLoading || questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111A2B] rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col text-right">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-[#14243D] text-white space-y-3 relative overflow-hidden">
          <div className="absolute -left-6 -top-6 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                  Daily Entrance Gatekeeper
                </span>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>تحدي الدخول اليومي للمنصة</span>
                  <span className="text-xs font-normal text-amber-300">⚡</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-bold text-indigo-100 flex items-center gap-1.5 border border-white/10">
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAlreadyUnlocked() ? "تحدي تنشيط إضافي" : "أجب لتفتح المنصة"}</span>
              </div>
              {isAlreadyUnlocked() && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  title="إغلاق النافذة"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-indigo-200/90 leading-relaxed">
            اختبار مدته 3 دقائق ينشط ذاكرتك بأهم الأفكار المتنوعة، ويتيح لك المنصة
            فور الانتهاء مع تحليل كامل لأخطائك.
          </p>

          {/* Stepper Progress Bar (Only during exam phase) */}
          {!examResult && (
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-200">
                <span>
                  السؤال {currentStep + 1} من {questions.length}
                </span>
                <span>
                  تمت إجابة {answeredCount} من {questions.length}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 flex-1 overflow-y-auto max-h-[65vh]">
          {/* Phase 1: Taking Exam */}
          {!examResult ? (
            <div className="space-y-5">
              {/* Question Category & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] text-xs font-black">
                    {currentQ.subjectName}
                  </span>
                  {currentQ.unitTitle && (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-500 text-[11px] font-bold">
                      {currentQ.unitTitle}
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                  {currentQ.type === "MCQ"
                    ? "اختيار من متعدد"
                    : currentQ.type === "TRUE_FALSE"
                    ? "صح أو خطأ"
                    : "سؤال مقالي"}
                </span>
              </div>

              {/* Statement */}
              <div className="py-1">
                <BidiStatement
                  as="h3"
                  text={currentQ.statement}
                  className="text-sm sm:text-base font-black text-[#14243D] dark:text-white leading-relaxed"
                />
              </div>

              {/* Options Section */}
              {/* MCQ Options */}
              {currentQ.type === "MCQ" && (
                <div className="space-y-2.5 pt-1">
                  {currentQ.options.map((opt, oIdx) => {
                    const isSelected =
                      answers[currentQ.id]?.selectedOptionId === opt.id;
                    const letters = ["أ", "ب", "ج", "د", "هـ"];

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                        className={`w-full p-3 sm:p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-[#4F46E5] text-[#14243D] dark:text-white shadow-xs"
                            : "bg-slate-50/60 dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-[#4F46E5] text-white"
                                : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                            }`}
                          >
                            {letters[oIdx] || oIdx + 1}
                          </span>
                          <BidiStatement
                            as="span"
                            text={opt.text}
                            className="text-xs sm:text-sm font-bold"
                          />
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-[#4F46E5] bg-[#4F46E5] text-white"
                              : "border-slate-300 dark:border-zinc-700 text-transparent"
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TRUE_FALSE Options */}
              {currentQ.type === "TRUE_FALSE" && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs text-slate-500 dark:text-zinc-400 block font-bold">
                    حدد صحة العبارة:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {currentQ.options.map((opt) => {
                      const isSelected =
                        answers[currentQ.id]?.selectedOptionId === opt.id;
                      const isTrue =
                        opt.text.includes("صح") || opt.text.includes("صواب");

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, opt.id)}
                          className={`p-4 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
                            isSelected
                              ? isTrue
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                                : "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20"
                              : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300"
                          }`}
                        >
                          {isTrue ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ESSAY Input */}
              {currentQ.type === "ESSAY" && (
                <div className="space-y-2 pt-1">
                  <label className="text-xs text-slate-500 dark:text-zinc-400 block font-bold">
                    اكتب إجابتك أو الفكرة الرئيسية باختصار:
                  </label>
                  <textarea
                    rows={4}
                    value={answers[currentQ.id]?.essayText || ""}
                    onChange={(e) =>
                      handleEssayChange(currentQ.id, e.target.value)
                    }
                    placeholder="اكتب هنا ما تتذكره من مفاهيم أو تعليلات... وسنعرض لك نموذج الإجابة والمفهوم لمقارنته فور التسليم."
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-[#14243D] dark:text-white focus:outline-none focus:border-[#4F46E5] leading-relaxed"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Phase 2: Detailed Results & Mistakes Breakdown ("وكمان عاوز الطالب يعرف غلطاته") */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Score Header Card */}
              <div
                className={`p-6 rounded-3xl text-center space-y-3 border ${
                  examResult.percentage >= 70
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60"
                    : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center mx-auto text-emerald-600">
                  {examResult.percentage === 100 ? (
                    <Trophy className="w-8 h-8 text-amber-500" />
                  ) : examResult.percentage >= 70 ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#14243D] dark:text-white">
                    {examResult.percentage === 100
                      ? "نتيجة أسطورية! إجابات مثالية بدون أي خطأ 🏆"
                      : examResult.percentage >= 70
                      ? "أداء متميز! أحسنت الاستذكار 👏"
                      : "محاولة جيدة! راجع أخطاءك الآن لترسخ في ذهنك 💡"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    نتيجتك: {examResult.score} من أصل {examResult.totalQuestions}{" "}
                    سؤال ({examResult.percentage}%)
                  </p>
                </div>

                {examResult.wrongCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold">
                    <span>
                      لديك {examResult.wrongCount} أسئلة بحاجة لمراجعة وتم حفظها
                      في "غلطاتي"
                    </span>
                  </div>
                )}
              </div>

              {/* Questions Breakdown List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black text-[#14243D] dark:text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                    <span>تفاصيل إجاباتك وتحليل كل سؤال:</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-bold">
                    {examResult.reviewedQuestions.length} أسئلة
                  </span>
                </div>

                {examResult.reviewedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      q.isCorrect
                        ? "bg-white dark:bg-[#111A2B] border-slate-200 dark:border-zinc-800"
                        : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
                    }`}
                  >
                    {/* Question Header & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">
                          #{idx + 1}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          {q.subjectName}
                        </span>
                      </div>

                      {q.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>إجابة صحيحة</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3 h-3" />
                          <span>إجابة خاطئة</span>
                        </span>
                      )}
                    </div>

                    {/* Statement */}
                    <BidiStatement
                      as="p"
                      text={q.statement}
                      className="text-xs sm:text-sm font-black text-[#14243D] dark:text-white leading-relaxed"
                    />

                    {/* Answers Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {/* What Student Answered */}
                      <div
                        className={`p-2.5 rounded-xl border ${
                          q.isCorrect
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                            : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                        }`}
                      >
                        <span className="text-[10px] font-bold block text-slate-400 mb-0.5">
                          إجابتك التي اخترتها:
                        </span>
                        <span className="font-bold">{q.selectedAnswer}</span>
                      </div>

                      {/* Correct Answer */}
                      <div className="p-2.5 rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100">
                        <span className="text-[10px] font-bold block text-emerald-600 dark:text-emerald-400 mb-0.5">
                          الإجابة النموذجية الصحيحة:
                        </span>
                        <span className="font-bold">{q.correctAnswer}</span>
                      </div>
                    </div>

                    {/* Concept & Educational Explanation */}
                    {(q.concept || q.correctReason) && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-[#4F46E5] font-black text-[11px]">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>التفسير التعليمي والمفهوم:</span>
                        </div>
                        {q.concept && (
                          <div className="text-slate-600 dark:text-zinc-300">
                            <span className="font-bold">المفهوم: </span>
                            {q.concept}
                          </div>
                        )}
                        {q.correctReason && (
                          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-[11px]">
                            {q.correctReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          {!examResult ? (
            <>
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 transition-all flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>

              {/* Next or Submit Button */}
              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep((prev) =>
                      Math.min(questions.length - 1, prev + 1)
                    )
                  }
                  className="h-10 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black shadow-md shadow-[#4F46E5]/25 flex items-center gap-1.5 transition-all"
                >
                  <span>السؤال التالي</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="h-10 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التصحيح والتحليل...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تسليم الاختبار ومعرفة النتيجة</span>
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            /* Button after viewing mistakes: Unlocks platform and enters */
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                🎉 تم فتح المنصة بنجاح لك لهذا اليوم
              </span>
              <button
                type="button"
                onClick={handleUnlockAndEnter}
                className="h-11 px-8 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#4338CA] hover:from-[#4338CA] hover:to-[#3730A3] text-white text-xs sm:text-sm font-black shadow-xl shadow-[#4F46E5]/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <Unlock className="w-4 h-4" />
                <span>دخول المنصة الآن والمتابعة للمذاكرة</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
