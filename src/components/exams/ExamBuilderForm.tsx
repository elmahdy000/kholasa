"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  BookOpen,
  Layers,
  HelpCircle,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  order: number;
}

interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Subject {
  id: string;
  name: string;
  color?: string | null;
  units: Unit[];
}

interface ExamBuilderFormProps {
  subjects: Subject[];
  initialSubjectId?: string;
  initialUnitId?: string;
  initialLessonId?: string;
}

export function ExamBuilderForm({
  subjects,
  initialSubjectId,
  initialUnitId,
  initialLessonId,
}: ExamBuilderFormProps) {
  const router = useRouter();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || (subjects.length > 0 ? subjects[0].id : "")
  );

  const [scopeType, setScopeType] = useState<"subject" | "unit" | "lessons">(
    initialLessonId ? "lessons" : initialUnitId ? "unit" : "subject"
  );

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    initialUnitId || ""
  );

  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>(
    initialLessonId ? [initialLessonId] : []
  );

  const [questionType, setQuestionType] = useState<
    "ALL" | "MCQ" | "TRUE_FALSE" | "ESSAY"
  >("ALL");

  const [difficulty, setDifficulty] = useState<
    "ALL" | "EASY" | "MEDIUM" | "HARD"
  >("ALL");

  const [questionCount, setQuestionCount] = useState<number>(10);
  const [mode, setMode] = useState<"PRACTICE" | "EXAM">("PRACTICE");
  const [durationMinutes, setDurationMinutes] = useState<number>(20);

  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active subject & units
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentUnits = currentSubject?.units || [];
  const activeUnit = currentUnits.find((u) => u.id === selectedUnitId);

  // Auto-set default unit if not selected
  useEffect(() => {
    if (currentUnits.length > 0 && !selectedUnitId) {
      setSelectedUnitId(currentUnits[0].id);
    }
  }, [currentUnits, selectedUnitId]);

  // Live Query matching questions count
  useEffect(() => {
    let isCancelled = false;

    async function checkCount() {
      if (!selectedSubjectId) {
        setAvailableCount(0);
        return;
      }

      setIsCounting(true);
      try {
        const params = new URLSearchParams();
        params.set("subjectId", selectedSubjectId);

        if (scopeType === "unit" && selectedUnitId) {
          params.set("unitId", selectedUnitId);
        } else if (scopeType === "lessons" && selectedLessonIds.length > 0) {
          params.set("lessonIds", selectedLessonIds.join(","));
        }

        if (questionType !== "ALL") params.set("type", questionType);
        if (difficulty !== "ALL") params.set("difficulty", difficulty);

        const res = await fetch(`/api/exams/builder/stats?${params.toString()}`);
        if (res.ok && !isCancelled) {
          const data = await res.json();
          setAvailableCount(data.count ?? 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) setIsCounting(false);
      }
    }

    checkCount();
    return () => {
      isCancelled = true;
    };
  }, [
    selectedSubjectId,
    scopeType,
    selectedUnitId,
    selectedLessonIds,
    questionType,
    difficulty,
  ]);

  const toggleLesson = (lessonId: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (availableCount === 0) {
      setError("لا توجد أسئلة مطابقة لاختياراتك الحالية، يرجى توسيع نطاق التحديد");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          unitId: scopeType === "unit" ? selectedUnitId : undefined,
          lessonIds: scopeType === "lessons" ? selectedLessonIds : undefined,
          type: questionType,
          difficulty,
          questionCount,
          mode,
          durationMinutes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذر إنشاء الامتحان");
      }

      router.push(`/exams/${data.examId}?attemptId=${data.attemptId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ غير متوقع أثناء إعداد الاختبار");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* 1. Subject Selector */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 space-y-4">
        <label className="text-sm font-black text-[#14243D] dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#6858EA]" />
          <span>1. اختر المادة الدراسية</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSelectedSubjectId(s.id);
                setSelectedUnitId(s.units[0]?.id || "");
                setSelectedLessonIds([]);
              }}
              className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                selectedSubjectId === s.id
                  ? "bg-[#6858EA]/10 border-[#6858EA] shadow-md shadow-[#6858EA]/20 font-black text-[#6858EA]"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#14243D] dark:text-slate-200 hover:border-slate-300"
              }`}
            >
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: s.color || "#6858EA" }}
              />
              <span className="text-xs sm:text-sm font-black truncate">
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Scope Selector */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 space-y-4">
        <label className="text-sm font-black text-[#14243D] dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#11B7B4]" />
          <span>2. نطاق الاختبار</span>
        </label>

        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setScopeType("subject")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              scopeType === "subject"
                ? "bg-white dark:bg-slate-800 text-[#14243D] dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            كامل المادة
          </button>
          <button
            type="button"
            onClick={() => setScopeType("unit")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              scopeType === "unit"
                ? "bg-white dark:bg-slate-800 text-[#14243D] dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            وحدة محددة
          </button>
          <button
            type="button"
            onClick={() => setScopeType("lessons")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              scopeType === "lessons"
                ? "bg-white dark:bg-slate-800 text-[#14243D] dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            دروس مخصصة
          </button>
        </div>

        {/* If Scope = Unit */}
        {scopeType === "unit" && (
          <div className="pt-2">
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-bold text-[#14243D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6858EA]"
            >
              {currentUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* If Scope = Lessons */}
        {scopeType === "lessons" && (
          <div className="pt-2 space-y-3">
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              حدد الدروس التي ترغب في تضمين أسئلتها:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
              {currentUnits.flatMap((u) =>
                u.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => toggleLesson(lesson.id)}
                    className={`p-3 rounded-xl border text-right text-xs font-bold flex items-center gap-2.5 transition-all ${
                      selectedLessonIds.includes(lesson.id)
                        ? "bg-[#6858EA]/10 border-[#6858EA] text-[#6858EA]"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#14243D] dark:text-slate-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        selectedLessonIds.includes(lesson.id)
                          ? "bg-[#6858EA] border-[#6858EA] text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {selectedLessonIds.includes(lesson.id) && (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Question Type & Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Type */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <label className="text-sm font-black text-[#14243D] dark:text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#6858EA]" />
            <span>3. نوع الأسئلة</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "ALL", label: "كل الأنواع (مختلط)" },
              { id: "MCQ", label: "اختيار من متعدد" },
              { id: "TRUE_FALSE", label: "صح أو خطأ" },
              { id: "ESSAY", label: "أسئلة مقالية" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setQuestionType(t.id as any)}
                className={`p-3 rounded-xl border text-center text-xs font-black transition-all ${
                  questionType === t.id
                    ? "bg-[#6858EA] text-white border-[#6858EA] shadow-xs"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#14243D] dark:text-slate-200 hover:border-slate-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <label className="text-sm font-black text-[#14243D] dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>4. مستوى الصعوبة</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "ALL", label: "جميع المستويات" },
              { id: "EASY", label: "سهل (تأسيسي)" },
              { id: "MEDIUM", label: "متوسط (فهم وتطبيق)" },
              { id: "HARD", label: "متقدم (تحليل واستنتاج)" },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id as any)}
                className={`p-3 rounded-xl border text-center text-xs font-black transition-all ${
                  difficulty === d.id
                    ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#14243D] dark:text-slate-200 hover:border-slate-300"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Question Count & Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Count */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <label className="text-sm font-black text-[#14243D] dark:text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#11B7B4]" />
            <span>5. عدد الأسئلة</span>
          </label>
          <div className="flex items-center gap-2">
            {[5, 10, 15, 20].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setQuestionCount(num)}
                className={`flex-1 py-2.5 rounded-xl border text-center text-xs font-black transition-all ${
                  questionCount === num
                    ? "bg-[#11B7B4] text-white border-[#11B7B4] shadow-xs"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#14243D] dark:text-slate-200"
                }`}
              >
                {num} أسئلة
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#14243D]/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <label className="text-sm font-black text-[#14243D] dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#6858EA]" />
            <span>6. نظام الاختبار</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("PRACTICE")}
              className={`p-3 rounded-xl border text-right transition-all ${
                mode === "PRACTICE"
                  ? "bg-[#6858EA]/10 border-[#6858EA] text-[#6858EA] font-black"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#14243D] dark:text-slate-200"
              }`}
            >
              <span className="block text-xs font-black">وضع التدريب</span>
              <span className="block text-[10px] text-slate-500 font-normal">
                شرح فوري وتفسير بعد كل سؤال
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode("EXAM")}
              className={`p-3 rounded-xl border text-right transition-all ${
                mode === "EXAM"
                  ? "bg-[#14243D] dark:bg-white text-white dark:text-[#14243D] font-black"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#14243D] dark:text-slate-200"
              }`}
            >
              <span className="block text-xs font-black">وضع الامتحان</span>
              <span className="block text-[10px] text-slate-500 font-normal">
                مؤقت زمني ونتيجة نهائية شاملة
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Live Match Summary & Submit Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#14243D] to-[#1E3A8A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-indigo-950/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span>الأسئلة المتوفرة في بنك الأسئلة:</span>
            {isCounting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/30">
                {availableCount ?? 0} سؤال متطابق
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 mt-1">
            سيتم اختيار {Math.min(questionCount, availableCount || 0)} أسئلة فريدة عشوائياً بدون تكرار
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (availableCount !== null && availableCount === 0)}
          className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#6858EA] to-[#5444D8] hover:from-[#5444D8] hover:to-[#4333C4] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#6858EA]/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جارٍ تجهيز الامتحان...</span>
            </>
          ) : (
            <>
              <span>ابدأ الاختبار الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
