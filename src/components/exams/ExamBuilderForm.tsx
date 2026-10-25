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
    initialUnitId || (subjects[0]?.units?.[0]?.id ?? "")
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
  const effectiveUnitId = selectedUnitId || (currentUnits[0]?.id ?? "");
  const activeUnit = currentUnits.find((u) => u.id === effectiveUnitId);

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

        if (scopeType === "unit" && effectiveUnitId) {
          params.set("unitId", effectiveUnitId);
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
    effectiveUnitId,
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
          unitId: scopeType === "unit" ? effectiveUnitId : undefined,
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
        <div className="p-4 rounded-xl bg-[#DC2626]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#F87171]/40 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-1" />
          <p className="text-[13px] sm:text-sm font-bold text-[#DC2626] dark:text-[#F87171]">
            {error}
          </p>
        </div>
      )}

      {/* 1. المادة الدراسية */}
      <section className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                1. المادة الدراسية
              </h2>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                اختار المادة اللي عاوز تتمرن عليها وتراجعها
              </p>
            </div>
          </div>
          {currentSubject && (
            <span className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185]">
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
                className={`p-4 rounded-xl border text-right transition-colors flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] dark:border-[#E11D48] text-[#0F172A] dark:text-white "
                    : "bg-white dark:bg-[#1E293B]/80 border-[#E2E8F0] dark:border-[#334155]/80 text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0] dark:hover:border-[#64748B]"
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: s.color || "#800020" }}
                  />
                  <div className="truncate">
                    <span className="text-[13px] sm:text-sm font-bold block truncate">
                      {s.name}
                    </span>
                    <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block">
                      {s.units.length} وحدات دراسية
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-[#800020] dark:bg-[#E11D48] border-[#800020] dark:border-[#E11D48] text-white"
                      : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]"
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
      <section className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                2. الوحدة والدروس
              </h2>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                حدد لو عاوز امتحان شامل على المادة كلها أو وحدة أو دروس معينة
              </p>
            </div>
          </div>
        </div>

        {/* Scope Type Selector Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
          {([
            { id: "subject", label: "كامل المادة" },
            { id: "unit", label: "وحدة محددة" },
            { id: "lessons", label: "دروس مخصصة" },
          ] as const).map((scope) => (
            <button
              key={scope.id}
              type="button"
              onClick={() => setScopeType(scope.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-[13px] font-bold transition-colors ${
                scopeType === scope.id
                  ? "bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white "
                  : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]"
              }`}
            >
              {scope.label}
            </button>
          ))}
        </div>

        {/* Scope = Unit */}
        {scopeType === "unit" && (
          <div className="pt-1 space-y-2">
            <label className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block">
              اختر الوحدة الدراسية:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentUnits.map((u) => {
                const isSelected = effectiveUnitId === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUnitId(u.id)}
                    className={`p-3 rounded-xl border text-right transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] dark:border-[#E11D48] text-[#0F172A] dark:text-white "
                        : "bg-white dark:bg-[#1E293B]/80 border-[#E2E8F0] dark:border-[#334155]/80 text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0] dark:hover:border-[#64748B]"
                    }`}
                  >
                    <div className="truncate">
                      <span className="text-[13px] font-bold block truncate">
                        {u.title}
                      </span>
                      <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block">
                        {u.lessons.length} دروس
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#800020] dark:bg-[#E11D48] border-[#800020] dark:border-[#E11D48] text-white"
                          : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]"
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
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  حدد الدروس المستهدفة
                </span>
                <span className="text-[13px] text-[#800020] dark:text-[#FB7185] font-bold bg-[#800020]/10 dark:bg-[#1E293B] px-2 py-1 rounded">
                  ({selectedLessonIds.length} دروس مختارة)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <button
                  type="button"
                  onClick={selectAllLessonsInActiveUnit}
                  className="text-[13px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline"
                >
                  تحديد دروس الوحدة الحالية
                </button>
                <span className="text-[#94A3B8]">•</span>
                <button
                  type="button"
                  onClick={clearLessonsSelection}
                  className="text-[13px] text-[#64748B] dark:text-[#94A3B8] hover:underline"
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
                      className={`p-3 rounded-xl border text-right transition-colors flex items-start sm:items-center gap-3 ${
                        isChecked
                          ? "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] text-[#0F172A] dark:text-white"
                          : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-1 sm:mt-0 transition-colors ${
                          isChecked
                            ? "bg-[#800020] border-[#800020] text-white"
                            : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <span className="text-[13px] font-bold block truncate">
                          {lesson.title}
                        </span>
                        <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block truncate">
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
        <section className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-bold">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                3. نوع الأسئلة
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] pr-9">
              اختار شكل ونمط الأسئلة اللي تحب تتدرب عليها
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {([
              { id: "MCQ", label: "اختيار من متعدد" },
              { id: "TRUE_FALSE", label: "صح أم خطأ" },
              { id: "ESSAY", label: "أسئلة مقالية" },
              { id: "ALL", label: "مختلط (كل الأنواع)" },
            ] as const).map((t) => {
              const isSelected = questionType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setQuestionType(t.id)}
                  className={`h-12 px-4 rounded-xl border text-right transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] dark:border-[#E11D48] text-[#0F172A] dark:text-white  font-bold"
                      : "bg-white dark:bg-[#1E293B]/80 border-[#E2E8F0] dark:border-[#334155]/80 text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0] dark:hover:border-[#64748B] font-medium"
                  }`}
                >
                  <span className="text-[13px] truncate">{t.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#800020] dark:bg-[#E11D48] border-[#800020] dark:border-[#E11D48] text-white"
                        : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]"
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
        <section className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                4. مستوى الصعوبة
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] pr-9">
              اختار مستوى الصعوبة اللي يناسب مستواك ومرحلتك
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {([
              { id: "ALL", label: "جميع المستويات" },
              { id: "EASY", label: "سهل (تأسيسي)" },
              { id: "MEDIUM", label: "متوسط (تطبيق)" },
              { id: "HARD", label: "متقدم (تحليل)" },
            ] as const).map((d) => {
              const isSelected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`h-12 px-4 rounded-xl border text-right transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] dark:border-[#E11D48] text-[#0F172A] dark:text-white  font-bold"
                      : "bg-white dark:bg-[#1E293B]/80 border-[#E2E8F0] dark:border-[#334155]/80 text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0] dark:hover:border-[#64748B] font-medium"
                  }`}
                >
                  <span className="text-[13px] truncate">{d.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#800020] dark:bg-[#E11D48] border-[#800020] dark:border-[#E11D48] text-white"
                        : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]"
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
        <section className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                  5. عدد الأسئلة
                </h2>
              </div>
              {/* Live Count Status */}
              <div className="flex items-center gap-2 text-[13px]">
                {isCounting ? (
                  <span className="text-[13px] text-[#94A3B8] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>جارٍ الفحص...</span>
                  </span>
                ) : (
                  <span className="text-[13px] font-bold text-[#64748B] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#1E293B] px-2 py-1 rounded-md">
                    المتاح: {availableCount ?? 0} سؤال
                  </span>
                )}
              </div>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] pr-9">
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
                        ? "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] dark:border-[#E11D48] text-[#800020] dark:text-[#FB7185] font-bold "
                        : "bg-white dark:bg-[#1E293B]/80 border-[#E2E8F0] dark:border-[#334155]/80 text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0] dark:hover:border-[#64748B] font-medium"
                    }`}
                  >
                    <span className="text-sm font-bold">{num}</span>
                    <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] -mt-1">أسئلة</span>
                  </button>
                );
              })}
            </div>

            {/* Availability Notice */}
            {availableCount !== null && availableCount < questionCount && availableCount > 0 && (
              <div className="p-3 rounded-lg bg-[#D97706]/10 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#FBBF24]/40 flex items-start gap-2 text-[13px] text-[#D97706] dark:text-[#FBBF24] font-medium leading-relaxed">
                <Info className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-1" />
                <span>
                  موجود في بنك الأسئلة {availableCount} أسئلة بس تطابق اختياراتك، هنعملك الامتحان بـ {availableCount} أسئلة.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 6. نظام الاختبار */}
        <section className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155]  space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#800020]/10 dark:bg-[#1E293B] text-[#800020] dark:text-[#FB7185] flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                6. نظام الاختبار
              </h2>
            </div>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] pr-9">
              اختار تدريب بشرح فوري ولا محاكاة امتحان حقيقي بوقت
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* وضع التدريب */}
            <button
              type="button"
              onClick={() => setMode("PRACTICE")}
              className={`p-4 rounded-xl border text-right transition-colors flex flex-col justify-between min-h-[82px] ${
                mode === "PRACTICE"
                  ? "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] dark:border-[#E11D48] text-[#0F172A] dark:text-white "
                  : "bg-white dark:bg-[#1E293B]/80 border-[#E2E8F0] dark:border-[#334155]/80 text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0] dark:hover:border-[#64748B]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[13px] font-bold">وضع التدريب</span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    mode === "PRACTICE"
                      ? "bg-[#800020] dark:bg-[#E11D48] border-[#800020] dark:border-[#E11D48] text-white"
                      : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]"
                  }`}
                >
                  {mode === "PRACTICE" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>
              <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-snug">
                تصحيح وتفسير فوري بعد كل سؤال
              </span>
            </button>

            {/* وضع الامتحان */}
            <button
              type="button"
              onClick={() => setMode("EXAM")}
              className={`p-4 rounded-xl border text-right transition-colors flex flex-col justify-between min-h-[82px] ${
                mode === "EXAM"
                  ? "bg-[#800020]/10 dark:bg-[#1E293B] border-2 border-[#800020] dark:border-[#E11D48] text-[#0F172A] dark:text-white "
                  : "bg-white dark:bg-[#1E293B]/80 border-[#E2E8F0] dark:border-[#334155]/80 text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#E2E8F0] dark:hover:border-[#64748B]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[13px] font-bold">وضع الامتحان</span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    mode === "EXAM"
                      ? "bg-[#800020] dark:bg-[#E11D48] border-[#800020] dark:border-[#E11D48] text-white"
                      : "border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B]"
                  }`}
                >
                  {mode === "EXAM" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>
              <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-snug">
                الدرجة والتفسير الكامل بعد ما تسلّم
              </span>
            </button>
          </div>

          {/* Exam duration if Exam mode */}
          {mode === "EXAM" && (
            <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between gap-2 text-[13px]">
              <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#800020]" />
                <span>المدة الزمنية:</span>
              </span>
              <div className="flex items-center gap-2">
                {[15, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`px-3 py-1 rounded-md text-[13px] font-bold border transition-colors ${
                      durationMinutes === mins
                        ? "bg-[#800020] text-white border-[#800020]"
                        : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
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
      <section className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-sm space-y-5">
        <div className="space-y-1 border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
            ملخص إعدادات الاختبار
          </h3>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
            نظرة سريعة على اختياراتك قبل ما تبدأ الحل
          </p>
        </div>

        {/* Badges Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[13px]">
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0]/80 dark:border-[#334155] space-y-1">
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block">المادة</span>
            <span className="font-bold text-[#0F172A] dark:text-white block truncate">
              {currentSubject?.name || "غير محدد"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0]/80 dark:border-[#334155] space-y-1">
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block">الدروس / النطاق</span>
            <span className="font-bold text-[#0F172A] dark:text-white block truncate">
              {scopeLabel}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0]/80 dark:border-[#334155] space-y-1">
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block">نوع الأسئلة</span>
            <span className="font-bold text-[#0F172A] dark:text-white block truncate">
              {questionTypeLabel}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0]/80 dark:border-[#334155] space-y-1">
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block">الصعوبة</span>
            <span className="font-bold text-[#0F172A] dark:text-white block truncate">
              {difficultyLabel}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0]/80 dark:border-[#334155] space-y-1">
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block">عدد الأسئلة</span>
            <span className="font-bold text-[#800020] dark:text-[#FB7185] block truncate">
              {effectiveCount} أسئلة
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0]/80 dark:border-[#334155] space-y-1">
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] block">نظام الاختبار</span>
            <span className="font-bold text-[#0F172A] dark:text-white block truncate">
              {mode === "PRACTICE" ? "وضع التدريب" : `امتحان (${durationMinutes}د)`}
            </span>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
            {availableCount === 0 ? (
              <span className="text-[#DC2626] dark:text-[#F87171] font-bold flex items-center gap-2">
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
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#800020] hover:bg-[#66001A] dark:bg-[#E11D48] dark:hover:bg-[#BE123C] text-white font-bold text-sm  flex items-center justify-center gap-2 transition-all active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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
