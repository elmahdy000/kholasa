"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Layers,
  HelpCircle,
  Sparkles,
  GraduationCap,
  Zap,
  Clock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Check,
  Info,
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

  // 1. Subject State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || (subjects.length > 0 ? subjects[0].id : "")
  );

  // 2. Scope & Lessons State
  const [scopeType, setScopeType] = useState<"subject" | "unit" | "lessons">(
    initialLessonId ? "lessons" : initialUnitId ? "unit" : "subject"
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    initialUnitId || ""
  );
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>(
    initialLessonId ? [initialLessonId] : []
  );

  // 3. Question Type State
  const [questionType, setQuestionType] = useState<
    "ALL" | "MCQ" | "TRUE_FALSE" | "ESSAY"
  >("ALL");

  // 4. Difficulty State
  const [difficulty, setDifficulty] = useState<
    "ALL" | "EASY" | "MEDIUM" | "HARD"
  >("ALL");

  // 5. Question Count State
  const [questionCount, setQuestionCount] = useState<number>(10);

  // 6. Exam Mode State
  const [mode, setMode] = useState<"PRACTICE" | "EXAM">("PRACTICE");
  const [durationMinutes, setDurationMinutes] = useState<number>(20);

  // Stats & Submission State
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active Subject & Units
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentUnits = currentSubject?.units || [];
  const activeUnit = currentUnits.find((u) => u.id === selectedUnitId);

  // Auto-select first unit if none selected
  useEffect(() => {
    if (currentUnits.length > 0 && !selectedUnitId) {
      setSelectedUnitId(currentUnits[0].id);
    }
  }, [currentUnits, selectedUnitId]);

  // Live Query matching questions count from DB
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

  const selectAllLessonsInActiveUnit = () => {
    if (!activeUnit) return;
    const unitLessonIds = activeUnit.lessons.map((l) => l.id);
    setSelectedLessonIds((prev) => Array.from(new Set([...prev, ...unitLessonIds])));
  };

  const clearLessonsSelection = () => {
    setSelectedLessonIds([]);
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
          questionCount: Math.min(questionCount, availableCount || questionCount),
          mode,
          durationMinutes: mode === "EXAM" ? durationMinutes : 20,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذر إنشاء الاختبار");
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

  // Helper text mappings for summary
  const questionTypeLabel =
    questionType === "ALL"
      ? "مختلط (كل الأنواع)"
      : questionType === "MCQ"
      ? "اختيار من متعدد"
      : questionType === "TRUE_FALSE"
      ? "صح أو خطأ"
      : "أسئلة مقالية";

  const difficultyLabel =
    difficulty === "ALL"
      ? "جميع المستويات"
      : difficulty === "EASY"
      ? "سهل (تأسيسي)"
      : difficulty === "MEDIUM"
      ? "متوسط (فهم وتطبيق)"
      : "متقدم (تحليل واستنتاج)";

  const scopeLabel =
    scopeType === "subject"
      ? "كامل المادة"
      : scopeType === "unit"
      ? activeUnit?.title || "وحدة محددة"
      : selectedLessonIds.length > 0
      ? `${selectedLessonIds.length} دروس مختارة`
      : "لم تحدد دروساً بعد";

  const effectiveCount =
    availableCount !== null
      ? Math.min(questionCount, availableCount)
      : questionCount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* 1. المادة الدراسية */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                1. المادة الدراسية
              </h2>
              <p className="text-[11px] text-[#475569] dark:text-slate-400">
                اختار المادة اللي عاوز تتمرن عليها وتراجعها
              </p>
            </div>
          </div>
          {currentSubject && (
            <span className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400">
              {currentSubject.name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((s) => {
            const isSelected = selectedSubjectId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedSubjectId(s.id);
                  setSelectedUnitId(s.units[0]?.id || "");
                  setSelectedLessonIds([]);
                }}
                className={`p-3.5 rounded-xl border text-right transition-colors flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-indigo-50/70 dark:bg-indigo-950/50 border-2 border-[#4F46E5] dark:border-indigo-400 text-[#0F172A] dark:text-white shadow-2xs"
                    : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-[#0F172A] dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: s.color || "#4F46E5" }}
                  />
                  <div className="truncate">
                    <span className="text-xs sm:text-sm font-bold block truncate">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-[#475569] dark:text-slate-400 block">
                      {s.units.length} وحدات دراسية
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#4F46E5] dark:bg-indigo-500 border-[#4F46E5] dark:border-indigo-500 text-white"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. الوحدة والدروس */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                2. الوحدة والدروس
              </h2>
              <p className="text-[11px] text-[#475569] dark:text-slate-400">
                حدد لو عاوز امتحان شامل على المادة كلها أو وحدة أو دروس معينة
              </p>
            </div>
          </div>
        </div>

        {/* Scope Type Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          {[
            { id: "subject", label: "كامل المادة" },
            { id: "unit", label: "وحدة محددة" },
            { id: "lessons", label: "دروس مخصصة" },
          ].map((scope) => (
            <button
              key={scope.id}
              type="button"
              onClick={() => setScopeType(scope.id as any)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                scopeType === scope.id
                  ? "bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white shadow-2xs"
                  : "text-[#475569] dark:text-slate-400 hover:text-[#0F172A]"
              }`}
            >
              {scope.label}
            </button>
          ))}
        </div>

        {/* Scope = Unit */}
        {scopeType === "unit" && (
          <div className="pt-1 space-y-2">
            <label className="text-xs font-bold text-[#0F172A] dark:text-slate-200 block">
              اختر الوحدة الدراسية:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentUnits.map((u) => {
                const isSelected = selectedUnitId === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUnitId(u.id)}
                    className={`p-3 rounded-xl border text-right transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-indigo-50/70 dark:bg-indigo-950/50 border-2 border-[#4F46E5] dark:border-indigo-400 text-[#0F172A] dark:text-white shadow-2xs"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-[#0F172A] dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500"
                    }`}
                  >
                    <div className="truncate">
                      <span className="text-xs font-bold block truncate">
                        {u.title}
                      </span>
                      <span className="text-[10px] text-[#475569] dark:text-slate-400 block">
                        {u.lessons.length} دروس
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#4F46E5] dark:bg-indigo-500 border-[#4F46E5] dark:border-indigo-500 text-white"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Scope = Lessons */}
        {scopeType === "lessons" && (
          <div className="pt-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200">
                  حدد الدروس المستهدفة
                </span>
                <span className="text-[11px] text-[#4F46E5] dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                  ({selectedLessonIds.length} دروس مختارة)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllLessonsInActiveUnit}
                  className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline"
                >
                  تحديد دروس الوحدة الحالية
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={clearLessonsSelection}
                  className="text-xs text-[#475569] dark:text-slate-400 hover:underline"
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
              {currentUnits.flatMap((u) =>
                u.lessons.map((lesson) => {
                  const isChecked = selectedLessonIds.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => toggleLesson(lesson.id)}
                      className={`p-2.5 rounded-xl border text-right transition-colors flex items-start sm:items-center gap-3 ${
                        isChecked
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-2 border-[#4F46E5] text-[#0F172A] dark:text-white"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors ${
                          isChecked
                            ? "bg-[#4F46E5] border-[#4F46E5] text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold block truncate">
                          {lesson.title}
                        </span>
                        <span className="text-[10px] text-[#475569] dark:text-slate-400 block truncate">
                          {u.title}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </section>

      {/* Grid: 3. نوع الأسئلة & 4. مستوى الصعوبة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3. نوع الأسئلة */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center font-bold">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                3. نوع الأسئلة
              </h2>
            </div>
            <p className="text-[11px] text-[#475569] dark:text-slate-400 pr-9">
              اختار شكل ونمط الأسئلة اللي تحب تتدرب عليها
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {[
              { id: "MCQ", label: "اختيار من متعدد" },
              { id: "TRUE_FALSE", label: "صح أم خطأ" },
              { id: "ESSAY", label: "أسئلة مقالية" },
              { id: "ALL", label: "مختلط (كل الأنواع)" },
            ].map((t) => {
              const isSelected = questionType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setQuestionType(t.id as any)}
                  className={`h-12 px-3.5 rounded-xl border text-right transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-indigo-50/70 dark:bg-indigo-950/50 border-2 border-[#4F46E5] dark:border-indigo-400 text-[#0F172A] dark:text-white shadow-2xs font-bold"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-[#0F172A] dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500 font-medium"
                  }`}
                >
                  <span className="text-xs truncate">{t.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#4F46E5] dark:bg-indigo-500 border-[#4F46E5] dark:border-indigo-500 text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. مستوى الصعوبة */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                4. مستوى الصعوبة
              </h2>
            </div>
            <p className="text-[11px] text-[#475569] dark:text-slate-400 pr-9">
              اختار مستوى الصعوبة اللي يناسب مستواك ومرحلتك
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {[
              { id: "ALL", label: "جميع المستويات" },
              { id: "EASY", label: "سهل (تأسيسي)" },
              { id: "MEDIUM", label: "متوسط (تطبيق)" },
              { id: "HARD", label: "متقدم (تحليل)" },
            ].map((d) => {
              const isSelected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id as any)}
                  className={`h-12 px-3.5 rounded-xl border text-right transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-indigo-50/70 dark:bg-indigo-950/50 border-2 border-[#4F46E5] dark:border-indigo-400 text-[#0F172A] dark:text-white shadow-2xs font-bold"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-[#0F172A] dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500 font-medium"
                  }`}
                >
                  <span className="text-xs truncate">{d.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#4F46E5] dark:bg-indigo-500 border-[#4F46E5] dark:border-indigo-500 text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Grid: 5. عدد الأسئلة & 6. نظام الاختبار */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 5. عدد الأسئلة */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                  5. عدد الأسئلة
                </h2>
              </div>
              {/* Live Count Status */}
              <div className="flex items-center gap-1.5 text-xs">
                {isCounting ? (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>جارٍ الفحص...</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#475569] dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    المتاح: {availableCount ?? 0} سؤال
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#475569] dark:text-slate-400 pr-9">
              حدد عدد الأسئلة اللي ناوي تحلها دلوقتي
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((num) => {
                const isSelected = questionCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`h-12 rounded-xl border text-center transition-colors flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-indigo-50/70 dark:bg-indigo-950/50 border-2 border-[#4F46E5] dark:border-indigo-400 text-[#4F46E5] dark:text-indigo-300 font-bold shadow-2xs"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-[#0F172A] dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500 font-medium"
                    }`}
                  >
                    <span className="text-sm font-bold">{num}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">أسئلة</span>
                  </button>
                );
              })}
            </div>

            {/* Availability Notice */}
            {availableCount !== null && availableCount < questionCount && availableCount > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  موجود في بنك الأسئلة {availableCount} أسئلة بس تطابق اختياراتك، هنعملك الامتحان بـ {availableCount} أسئلة.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 6. نظام الاختبار */}
        <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                6. نظام الاختبار
              </h2>
            </div>
            <p className="text-[11px] text-[#475569] dark:text-slate-400 pr-9">
              اختار تدريب بشرح فوري ولا محاكاة امتحان حقيقي بوقت
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* وضع التدريب */}
            <button
              type="button"
              onClick={() => setMode("PRACTICE")}
              className={`p-3.5 rounded-xl border text-right transition-colors flex flex-col justify-between min-h-[82px] ${
                mode === "PRACTICE"
                  ? "bg-indigo-50/70 dark:bg-indigo-950/50 border-2 border-[#4F46E5] dark:border-indigo-400 text-[#0F172A] dark:text-white shadow-2xs"
                  : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-[#0F172A] dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold">وضع التدريب</span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    mode === "PRACTICE"
                      ? "bg-[#4F46E5] dark:bg-indigo-500 border-[#4F46E5] dark:border-indigo-500 text-white"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  {mode === "PRACTICE" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>
              <span className="text-[11px] text-[#475569] dark:text-slate-400 leading-snug">
                تصحيح وتفسير فوري بعد كل سؤال
              </span>
            </button>

            {/* وضع الامتحان */}
            <button
              type="button"
              onClick={() => setMode("EXAM")}
              className={`p-3.5 rounded-xl border text-right transition-colors flex flex-col justify-between min-h-[82px] ${
                mode === "EXAM"
                  ? "bg-indigo-50/70 dark:bg-indigo-950/50 border-2 border-[#4F46E5] dark:border-indigo-400 text-[#0F172A] dark:text-white shadow-2xs"
                  : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-[#0F172A] dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold">وضع الامتحان</span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    mode === "EXAM"
                      ? "bg-[#4F46E5] dark:bg-indigo-500 border-[#4F46E5] dark:border-indigo-500 text-white"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  {mode === "EXAM" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>
              <span className="text-[11px] text-[#475569] dark:text-slate-400 leading-snug">
                الدرجة والتفسير الكامل بعد ما تسلّم
              </span>
            </button>
          </div>

          {/* Exam duration if Exam mode */}
          {mode === "EXAM" && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>المدة الزمنية:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {[15, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                      durationMinutes === mins
                        ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {mins} د
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 7. ملخص إعدادات الاختبار وإجراء البدء */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
            ملخص إعدادات الاختبار
          </h3>
          <p className="text-[11px] text-[#475569] dark:text-slate-400">
            نظرة سريعة على اختياراتك قبل ما تبدأ الحل
          </p>
        </div>

        {/* Badges Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-[#475569] dark:text-slate-400 block">المادة</span>
            <span className="font-bold text-[#0F172A] dark:text-white block truncate">
              {currentSubject?.name || "غير محدد"}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-[#475569] dark:text-slate-400 block">الدروس / النطاق</span>
            <span className="font-bold text-[#0F172A] dark:text-white block truncate">
              {scopeLabel}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-[#475569] dark:text-slate-400 block">نوع الأسئلة</span>
            <span className="font-bold text-[#0F172A] dark:text-white block truncate">
              {questionTypeLabel}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-[#475569] dark:text-slate-400 block">الصعوبة</span>
            <span className="font-bold text-[#0F172A] dark:text-white block truncate">
              {difficultyLabel}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-[#475569] dark:text-slate-400 block">عدد الأسئلة</span>
            <span className="font-bold text-[#4F46E5] dark:text-indigo-400 block truncate">
              {effectiveCount} أسئلة
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-[#475569] dark:text-slate-400 block">نظام الاختبار</span>
            <span className="font-bold text-[#0F172A] dark:text-white block truncate">
              {mode === "PRACTICE" ? "وضع التدريب" : `امتحان (${durationMinutes}د)`}
            </span>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#475569] dark:text-slate-400">
            {availableCount === 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>مفيش أسئلة مطابقة لاختياراتك الحالية، وسّع نطاق التحديد عشان يفتح زرار البدء.</span>
              </span>
            ) : (
              <span>
                هنجهّزلك {effectiveCount} أسئلة مختارة بعناية عشان تبدأ تحل على طول.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (availableCount !== null && availableCount === 0)}
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-sm shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>بنجهّزلك الامتحان ثواني...</span>
              </>
            ) : (
              <>
                <span>يلا نبدأ الامتحان</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </section>
    </form>
  );
}
