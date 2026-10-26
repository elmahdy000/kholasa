"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Layers,
  HelpCircle,
  SlidersHorizontal,
  Timer,
  Clock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Check,
  Info,
  CheckCircle2,
  ListChecks,
  CheckSquare,
  FileText,
  Shuffle,
  BookmarkCheck,
  Target,
  Sparkle,
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
  const [activeUnitLessonTab, setActiveUnitLessonTab] = useState<string>("ALL");

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
  const currentUnits = useMemo(() => currentSubject?.units || [], [currentSubject]);
  const effectiveUnitId = selectedUnitId || (currentUnits[0]?.id ?? "");
  const activeUnit = currentUnits.find((u) => u.id === effectiveUnitId);

  // When changing subjects, reset unit and lessons safely
  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const sub = subjects.find((s) => s.id === subjectId);
    setSelectedUnitId(sub?.units?.[0]?.id || "");
    setSelectedLessonIds([]);
    setActiveUnitLessonTab("ALL");
  };

  // Live Query matching questions count from DB
  useEffect(() => {
    let isCancelled = false;

    async function checkCount() {
      if (!selectedSubjectId) {
        setAvailableCount(0);
        return;
      }

      // If user chose custom lessons but hasn't selected any, available count is 0
      if (scopeType === "lessons" && selectedLessonIds.length === 0) {
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

  const selectAllLessonsInScope = () => {
    if (activeUnitLessonTab === "ALL") {
      const allIds = currentUnits.flatMap((u) => u.lessons.map((l) => l.id));
      setSelectedLessonIds(Array.from(new Set(allIds)));
    } else {
      const targetUnit = currentUnits.find((u) => u.id === activeUnitLessonTab);
      if (targetUnit) {
        const unitLessonIds = targetUnit.lessons.map((l) => l.id);
        setSelectedLessonIds((prev) => Array.from(new Set([...prev, ...unitLessonIds])));
      }
    }
  };

  const clearLessonsSelection = () => {
    setSelectedLessonIds([]);
  };

  // Lessons to display in lesson selector based on unit tab
  const displayedLessons = useMemo(() => {
    if (activeUnitLessonTab === "ALL") {
      return currentUnits.flatMap((u) =>
        u.lessons.map((l) => ({ ...l, unitTitle: u.title }))
      );
    }
    const unit = currentUnits.find((u) => u.id === activeUnitLessonTab);
    return unit ? unit.lessons.map((l) => ({ ...l, unitTitle: unit.title })) : [];
  }, [currentUnits, activeUnitLessonTab]);

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
      ? "متوسط (تطبيق)"
      : "متقدم (تحليل)";

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

  const hasValidScope =
    scopeType !== "lessons" || selectedLessonIds.length > 0;

  const isReady =
    Boolean(selectedSubjectId) &&
    hasValidScope &&
    !isCounting &&
    availableCount !== null &&
    availableCount > 0;

  if (subjects.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] space-y-3">
        <div className="w-12 h-12 rounded-xl bg-[#F7F8FA] dark:bg-[#132945] border border-[#E8E9ED] dark:border-[#22364F] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#12263F] dark:text-[#F5F7FB]">
          لا توجد مواد دراسية مقررة حالياً
        </h3>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
          تأكد من اختيار صفك الدراسي ومسارك التعليمي من صفحة الإعدادات لتظهر لك المقررات المتاحة.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Global Error Notice if any */}
      {error && (
        <div className="p-4 rounded-xl bg-[#DC2626]/8 dark:bg-[#DC2626]/15 border border-[#DC2626]/20 dark:border-[#DC2626]/40 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#DC2626] dark:text-[#F87171] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-bold text-[#DC2626] dark:text-[#F87171]">
            {error}
          </p>
        </div>
      )}

      {/* Main Two-Column RTL Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Column: Settings Workspace (~70% on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 1. المادة الدراسية (Subject Selection) */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
                    1. المادة الدراسية
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    اختر المادة اللي حابب تتدرب على أسئلتها
                  </p>
                </div>
              </div>
              {currentSubject && (
                <span className="hidden sm:inline-flex text-xs font-bold text-[#800020] dark:text-[#F5F7FB] bg-[#800020]/8 dark:bg-[#A30D36]/20 border border-transparent dark:border-[#A30D36]/40 px-2.5 py-1 rounded-lg shrink-0">
                  <bdi>{currentSubject.name}</bdi>
                </span>
              )}
            </div>

            {/* Subject Cards Grid with Adaptive Layout & Zero Truncation */}
            <div className="subject-grid w-full pt-1">
              {subjects.map((s) => {
                const isSelected = selectedSubjectId === s.id;
                const totalLessons = s.units.reduce(
                  (sum, u) => sum + u.lessons.length,
                  0
                );

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSubject(s.id)}
                    className={`subject-card w-full h-full p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 shadow-xs"
                        : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5 w-full">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                          style={{ backgroundColor: s.color || "#800020" }}
                        />
                        <div className="min-w-0 flex-1">
                          <span
                            className={`subject-title text-xs sm:text-sm font-bold block ${
                              isSelected
                                ? "text-[#800020] dark:text-[#F5F7FB]"
                                : "text-[#12263F] dark:text-[#C8D2E0]"
                            }`}
                          >
                            <bdi>{s.name}</bdi>
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                            : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E8E9ED]/60 dark:border-[#22364F]/60 w-full flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <span>{s.units.length} فصول</span>
                      <span className="opacity-40">•</span>
                      <span>{totalLessons} درس</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. الوحدة والدروس (Unit & Lesson Scope) */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
                    2. نطاق الأسئلة والدروس
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    حدد إذا كان الامتحان شاملاً للمادة، لوحدة معينة، أو دروس محددة
                  </p>
                </div>
              </div>
            </div>

            {/* Segmented Control Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-[#F7F8FA] dark:bg-[#0D1B2E] rounded-xl border border-[#E8E9ED] dark:border-[#22364F]">
              {[
                { id: "subject", label: "كامل المادة", icon: BookOpen },
                { id: "unit", label: "وحدة محددة", icon: Layers },
                { id: "lessons", label: "دروس مخصصة", icon: ListChecks },
              ].map((scope) => {
                const isSelected = scopeType === scope.id;
                const Icon = scope.icon;
                return (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setScopeType(scope.id as any)}
                    className={`min-h-9 h-auto py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-[#132945] text-[#800020] dark:text-[#F5F7FB] shadow-xs border border-[#E8E9ED] dark:border-[#2D4563]"
                        : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#12263F] dark:hover:text-[#F5F7FB]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="selection-label">{scope.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scope = Full Subject */}
            {scopeType === "subject" && (
              <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0D1B2E] border border-[#E8E9ED] dark:border-[#22364F] flex items-center gap-2.5 text-xs text-[#64748B] dark:text-[#C8D2E0] leading-relaxed">
                <Info className="w-4 h-4 text-[#800020] dark:text-[#E59A18] shrink-0" />
                <span>
                  سيتم اختيار الأسئلة بتوزيع متوازن يغطي كافة وحدات وفصول مادة{" "}
                  <strong className="text-[#12263F] dark:text-[#F5F7FB]">
                    <bdi>{currentSubject?.name}</bdi>
                  </strong>{" "}
                  ({currentUnits.length} وحدات).
                </span>
              </div>
            )}

            {/* Scope = Unit */}
            {scopeType === "unit" && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-[#12263F] dark:text-[#F5F7FB] block">
                  اختر الوحدة المطلوبة:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentUnits.map((u) => {
                    const isSelected = effectiveUnitId === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedUnitId(u.id)}
                        className={`p-3 rounded-xl border text-right transition-all flex items-start justify-between gap-2.5 cursor-pointer h-auto min-w-0 ${
                          isSelected
                            ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 shadow-xs"
                            : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <span
                            className={`unit-title text-xs font-bold block ${
                              isSelected
                                ? "text-[#800020] dark:text-[#F5F7FB]"
                                : "text-[#12263F] dark:text-[#C8D2E0]"
                            }`}
                          >
                            <bdi>{u.title}</bdi>
                          </span>
                          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mt-1 leading-normal">
                            {u.lessons.length} دروس
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                              : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
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
              <div className="space-y-3 pt-1">
                {/* Unit filter tabs if multiple units */}
                {currentUnits.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setActiveUnitLessonTab("ALL")}
                      className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                        activeUnitLessonTab === "ALL"
                          ? "bg-[#800020] dark:bg-[#A30D36] text-white"
                          : "bg-[#F7F8FA] dark:bg-[#0D1B2E] text-[#64748B] dark:text-[#94A3B8] border border-[#E8E9ED] dark:border-[#22364F] hover:text-[#12263F] dark:hover:text-[#F5F7FB]"
                      }`}
                    >
                      كل الوحدات
                    </button>
                    {currentUnits.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setActiveUnitLessonTab(u.id)}
                        className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                          activeUnitLessonTab === u.id
                            ? "bg-[#800020] dark:bg-[#A30D36] text-white"
                            : "bg-[#F7F8FA] dark:bg-[#0D1B2E] text-[#64748B] dark:text-[#94A3B8] border border-[#E8E9ED] dark:border-[#22364F] hover:text-[#12263F] dark:hover:text-[#F5F7FB]"
                        }`}
                      >
                        <bdi>{u.title}</bdi>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selection Action Bar */}
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#E8E9ED]/60 dark:border-[#22364F] text-xs">
                  <span className="font-bold text-[#12263F] dark:text-[#F5F7FB]">
                    تم تحديد:{" "}
                    <span className="text-[#800020] dark:text-[#E59A18] font-mono">
                      {selectedLessonIds.length}
                    </span>{" "}
                    درس
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllLessonsInScope}
                      className="font-bold text-[#800020] dark:text-[#E59A18] hover:underline cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span className="text-[#E8E9ED] dark:text-[#22364F]">•</span>
                    <button
                      type="button"
                      onClick={clearLessonsSelection}
                      className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#F87171] cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                {/* Lessons Scrollable List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1 bg-[#F7F8FA]/60 dark:bg-[#0D1B2E] rounded-xl border border-[#E8E9ED] dark:border-[#22364F]">
                  {displayedLessons.map((lesson) => {
                    const isChecked = selectedLessonIds.includes(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => toggleLesson(lesson.id)}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer h-auto min-w-0 ${
                          isChecked
                            ? "border-[#800020] dark:border-[#A30D36] bg-white dark:bg-[#132945] shadow-xs"
                            : "border-[#E8E9ED] dark:border-[#22364F] bg-white/70 dark:bg-[#10233A] hover:border-[#800020]/40 dark:hover:border-[#2D4563]"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                            isChecked
                              ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                              : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E]"
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`lesson-title text-xs font-bold block ${
                              isChecked
                                ? "text-[#800020] dark:text-[#F5F7FB]"
                                : "text-[#12263F] dark:text-[#C8D2E0]"
                            }`}
                          >
                            <bdi>{lesson.title}</bdi>
                          </span>
                          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block mt-1 leading-normal">
                            <bdi>{lesson.unitTitle}</bdi>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Compact 2x2 Grid for Sections 3, 4, 5, 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 3. نوع الأسئلة (Question Types) */}
            <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
                    3. نوع الأسئلة
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    اختر نمط ونوعية الأسئلة
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { id: "MCQ", label: "اختيار من متعدد", icon: ListChecks },
                  { id: "TRUE_FALSE", label: "صح أم خطأ", icon: CheckSquare },
                  { id: "ESSAY", label: "أسئلة مقالية", icon: FileText },
                  { id: "ALL", label: "مختلط (الكل)", icon: Shuffle },
                ].map((t) => {
                  const isSelected = questionType === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setQuestionType(t.id as any)}
                      className={`min-h-[44px] h-auto p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 text-[#800020] dark:text-[#F5F7FB] font-bold shadow-xs"
                          : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] text-[#12263F] dark:text-[#C8D2E0] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span className="selection-label text-xs font-bold leading-snug">
                          {t.label}
                        </span>
                      </div>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                            : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
                        }`}
                      >
                        {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 4. مستوى الصعوبة (Difficulty) */}
            <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
                    4. مستوى الصعوبة
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    حدد درجة التحدي المناسبة لمستواك
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { id: "EASY", label: "سهل", desc: "تأسيسي" },
                  { id: "MEDIUM", label: "متوسط", desc: "تطبيق" },
                  { id: "HARD", label: "متقدم", desc: "تحليل" },
                  { id: "ALL", label: "جميع المستويات", desc: "متدرج" },
                ].map((d) => {
                  const isSelected = difficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id as any)}
                      className={`min-h-[44px] h-auto p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 text-[#800020] dark:text-[#F5F7FB] font-bold shadow-xs"
                          : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] text-[#12263F] dark:text-[#C8D2E0] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="selection-label text-xs block font-bold leading-tight">
                          {d.label}
                        </span>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                          {d.desc}
                        </span>
                      </div>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                            : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
                        }`}
                      >
                        {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 5. عدد الأسئلة (Question Count) */}
            <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
                      5. عدد الأسئلة
                    </h2>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      اختر كمية الأسئلة للاختبار
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] bg-[#F7F8FA] dark:bg-[#0D1B2E] px-2 py-0.5 rounded-md border border-[#E8E9ED] dark:border-[#22364F]">
                  {isCounting ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>فحص...</span>
                    </span>
                  ) : (
                    <span>المتاح: <strong className="text-[#800020] dark:text-[#E59A18] font-mono">{availableCount ?? 0}</strong></span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((num) => {
                    const isSelected = questionCount === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuestionCount(num)}
                        className={`h-11 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white font-bold shadow-xs"
                            : "bg-white dark:bg-[#0D1B2E] border-[#E8E9ED] dark:border-[#22364F] text-[#12263F] dark:text-[#C8D2E0] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
                        }`}
                      >
                        <span className="text-sm font-extrabold font-mono leading-none">
                          {num}
                        </span>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            isSelected ? "text-white/80" : "text-[#64748B] dark:text-[#94A3B8]"
                          }`}
                        >
                          أسئلة
                        </span>
                      </button>
                    );
                  })}
                </div>

                {availableCount !== null &&
                  availableCount < questionCount &&
                  availableCount > 0 && (
                    <p className="text-[11px] text-[#D97706] dark:text-[#E59A18] font-medium leading-relaxed">
                      * متاح {availableCount} أسئلة فقط بالمعايير الحالية؛ سيتم تضمين أقصى عدد متاح.
                    </p>
                  )}
              </div>
            </section>

            {/* 6. نظام الاختبار (Exam Mode) */}
            <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#800020]/8 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#F5F7FB] flex items-center justify-center font-bold">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#12263F] dark:text-[#F5F7FB]">
                    6. نظام الاختبار
                  </h2>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    تدريب ذاتي أم محاكاة امتحان
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {/* وضع التدريب */}
                  <button
                    type="button"
                    onClick={() => setMode("PRACTICE")}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between min-h-[64px] h-auto cursor-pointer ${
                      mode === "PRACTICE"
                        ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 shadow-xs"
                        : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`selection-label text-xs font-bold ${
                          mode === "PRACTICE"
                            ? "text-[#800020] dark:text-[#F5F7FB]"
                            : "text-[#12263F] dark:text-[#C8D2E0]"
                        }`}
                      >
                        وضع التدريب
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          mode === "PRACTICE"
                            ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                            : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
                        }`}
                      >
                        {mode === "PRACTICE" && (
                          <Check className="w-2 h-2 stroke-[3]" />
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-normal mt-1">
                      تصحيح وتفسير بعد كل سؤال
                    </span>
                  </button>

                  {/* وضع الامتحان */}
                  <button
                    type="button"
                    onClick={() => setMode("EXAM")}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between min-h-[64px] h-auto cursor-pointer ${
                      mode === "EXAM"
                        ? "border-2 border-[#800020] dark:border-[#A30D36] bg-[#800020]/[0.03] dark:bg-[#A30D36]/15 shadow-xs"
                        : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#0D1B2E] hover:border-[#800020]/40 dark:hover:border-[#2D4563] hover:bg-[#F7F8FA] dark:hover:bg-[#132945]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`selection-label text-xs font-bold ${
                          mode === "EXAM"
                            ? "text-[#800020] dark:text-[#F5F7FB]"
                            : "text-[#12263F] dark:text-[#C8D2E0]"
                        }`}
                      >
                        وضع الامتحان
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          mode === "EXAM"
                            ? "bg-[#800020] dark:bg-[#A30D36] border-[#800020] dark:border-[#A30D36] text-white"
                            : "border-[#E8E9ED] dark:border-[#22364F] bg-white dark:bg-[#10233A]"
                        }`}
                      >
                        {mode === "EXAM" && <Check className="w-2 h-2 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-normal mt-1">
                      حل الكل ثم النتيجة والتعليل
                    </span>
                  </button>
                </div>

                {/* Duration selector if Exam mode */}
                {mode === "EXAM" && (
                  <div className="pt-2 border-t border-[#E8E9ED] dark:border-[#22364F] flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#800020] dark:text-[#E59A18]" />
                      <span>المدة:</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {[15, 20, 30, 45].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDurationMinutes(mins)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            durationMinutes === mins
                              ? "bg-[#800020] dark:bg-[#A30D36] text-white"
                              : "bg-[#F7F8FA] dark:bg-[#0D1B2E] border border-[#E8E9ED] dark:border-[#22364F] text-[#12263F] dark:text-[#C8D2E0] hover:border-[#800020] dark:hover:border-[#2D4563]"
                          }`}
                        >
                          {mins}د
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Left Column: Live Exam Summary Panel (~30% on desktop, sticky) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#10233A] border border-[#E8E9ED] dark:border-[#22364F] shadow-xs space-y-4">
            {/* Header & Status Indicator */}
            <div className="space-y-1 pb-3 border-b border-[#E8E9ED] dark:border-[#22364F]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-extrabold text-[#12263F] dark:text-[#F5F7FB] tracking-tight">
                  {isReady ? "امتحانك جاهز" : "ملخص امتحانك"}
                </h3>
                {isCounting ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] dark:text-[#E59A18] bg-[#D97706]/10 dark:bg-[#E59A18]/15 px-2 py-0.5 rounded-full border border-transparent dark:border-[#E59A18]/30">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>فحص...</span>
                  </span>
                ) : isReady ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] dark:text-[#34D399] bg-[#059669]/10 dark:bg-[#34D399]/15 px-2.5 py-0.5 rounded-full border border-transparent dark:border-[#34D399]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-[#34D399] animate-pulse" />
                    <span>جاهز للبدء</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] bg-[#F7F8FA] dark:bg-[#132945] px-2 py-0.5 rounded-full border border-[#E8E9ED] dark:border-[#22364F]">
                    <span>غير مكتمل</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {isReady
                  ? "جميع المعايير متوفرة ومجهزة للبدء فوراً"
                  : "حدد تفضيلاتك وتأكد من توفر الأسئلة للبدء"}
              </p>
            </div>

            {/* Neatly Aligned Specification Rows */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-3 py-1.5 border-b border-[#E8E9ED]/50 dark:border-[#22364F]/60">
                <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">المادة:</span>
                <span className="font-bold text-[#12263F] dark:text-[#F5F7FB] flex items-center gap-1.5 text-left break-words">
                  <span
                    className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: currentSubject?.color || "#800020" }}
                  />
                  <bdi>{currentSubject?.name || "غير محدد"}</bdi>
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 py-1.5 border-b border-[#E8E9ED]/50 dark:border-[#22364F]/60">
                <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">النطاق:</span>
                <span className="font-bold text-[#12263F] dark:text-[#F5F7FB] text-left break-words leading-relaxed">
                  <bdi>{scopeLabel}</bdi>
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 py-1.5 border-b border-[#E8E9ED]/50 dark:border-[#22364F]/60">
                <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">نوع الأسئلة:</span>
                <span className="font-bold text-[#12263F] dark:text-[#F5F7FB] text-left break-words">
                  {questionTypeLabel}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 py-1.5 border-b border-[#E8E9ED]/50 dark:border-[#22364F]/60">
                <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">الصعوبة:</span>
                <span className="font-bold text-[#12263F] dark:text-[#F5F7FB] text-left break-words">
                  {difficultyLabel}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#E8E9ED]/50 dark:border-[#22364F]/60">
                <span className="text-[#64748B] dark:text-[#94A3B8]">عدد الأسئلة:</span>
                <span className="font-mono font-extrabold text-[#800020] dark:text-[#E59A18]">
                  {effectiveCount} سؤال
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 py-1.5">
                <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">نظام الاختبار:</span>
                <span className="font-bold text-[#12263F] dark:text-[#F5F7FB] text-left break-words">
                  {mode === "PRACTICE"
                    ? "تدريب (شرح فوري)"
                    : `امتحان (${durationMinutes} دقيقة)`}
                </span>
              </div>
            </div>

            {/* Live Available Matching Questions Box */}
            <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0D1B2E] border border-[#E8E9ED] dark:border-[#22364F] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] block">
                  الأسئلة المتطابقة
                </span>
                <span className="text-xs text-[#12263F] dark:text-[#F5F7FB] font-semibold block mt-0.5">
                  في بنك الأسئلة المعتمد
                </span>
              </div>
              <div className="flex items-baseline gap-1 text-[#800020] dark:text-[#E59A18]">
                {isCounting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#800020] dark:text-[#E59A18]" />
                ) : (
                  <span className="text-xl font-extrabold font-mono">
                    {availableCount ?? 0}
                  </span>
                )}
                <span className="text-xs font-normal text-[#64748B] dark:text-[#94A3B8]">سؤال</span>
              </div>
            </div>

            {/* Warnings or Zero Availability Note */}
            {availableCount === 0 && !isCounting && (
              <div className="p-3 rounded-xl bg-[#E59A18]/10 dark:bg-[#E59A18]/15 border border-[#E59A18]/30 dark:border-[#E59A18]/40 flex items-start gap-2 text-xs text-[#D97706] dark:text-[#E59A18] font-medium leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {scopeType === "lessons" && selectedLessonIds.length === 0
                    ? "يرجى تحديد درس واحد على الأقل للمتابعة."
                    : "لا توجد أسئلة تطابق كافة المعايير المحددة، جرب تغيير نوع الأسئلة أو توسيع النطاق."}
                </span>
              </div>
            )}

            {/* Primary Start Action */}
            <button
              type="submit"
              disabled={!isReady || isSubmitting}
              className="w-full h-12 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] dark:bg-[#A30D36] dark:hover:bg-[#BD123F] disabled:bg-[#E8E9ED] dark:disabled:bg-[#132945] disabled:text-[#94A3B8] dark:disabled:text-[#64748B] disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:opacity-90 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>بنجهّزلك الامتحان ثواني...</span>
                </>
              ) : (
                <>
                  <span>ابدأ الامتحان الآن</span>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </>
              )}
            </button>

            {/* Micro reassurance copy */}
            <p className="text-[11px] text-center text-[#64748B] dark:text-[#94A3B8] pt-1">
              تصحيح فوري ونموذجي مع التفسير الكامل
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
