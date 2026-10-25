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
      <div className="p-12 text-center rounded-2xl bg-white border border-[#E8E9ED] space-y-3">
        <div className="w-12 h-12 rounded-xl bg-[#F7F8FA] border border-[#E8E9ED] text-[#64748B] flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#12263F]">
          لا توجد مواد دراسية مقررة حالياً
        </h3>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto">
          تأكد من اختيار صفك الدراسي ومسارك التعليمي من صفحة الإعدادات لتظهر لك المقررات المتاحة.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Global Error Notice if any */}
      {error && (
        <div className="p-4 rounded-xl bg-[#DC2626]/8 border border-[#DC2626]/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-bold text-[#DC2626]">
            {error}
          </p>
        </div>
      )}

      {/* Main Two-Column RTL Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Column: Settings Workspace (~70% on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 1. المادة الدراسية (Subject Selection) */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E9ED] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#800020]/8 text-[#800020] flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#12263F]">
                    1. المادة الدراسية
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    اختر المادة اللي حابب تتدرب على أسئلتها
                  </p>
                </div>
              </div>
              {currentSubject && (
                <span className="text-xs font-bold text-[#800020] bg-[#800020]/8 px-2.5 py-1 rounded-lg">
                  {currentSubject.name}
                </span>
              )}
            </div>

            {/* Compact Subject Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 pt-1">
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
                    className={`p-3.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "border-2 border-[#800020] bg-[#800020]/[0.03] shadow-xs"
                        : "border-[#E8E9ED] bg-white hover:border-[#800020]/40 hover:bg-[#F7F8FA]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.color || "#800020" }}
                      />
                      <div className="min-w-0">
                        <span
                          className={`text-xs sm:text-sm font-bold block truncate ${
                            isSelected ? "text-[#800020]" : "text-[#12263F]"
                          }`}
                        >
                          {s.name}
                        </span>
                        <span className="text-[11px] text-[#64748B] block truncate mt-0.5">
                          {s.units.length} فصول • {totalLessons} درس
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#800020] border-[#800020] text-white"
                          : "border-[#E8E9ED] bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. الوحدة والدروس (Unit & Lesson Scope) */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E9ED] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#800020]/8 text-[#800020] flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#12263F]">
                    2. نطاق الأسئلة والدروس
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    حدد إذا كان الامتحان شاملاً للمادة، لوحدة معينة، أو دروس محددة
                  </p>
                </div>
              </div>
            </div>

            {/* Segmented Control Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F7F8FA] rounded-xl border border-[#E8E9ED]">
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
                    className={`h-9 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-white text-[#800020] shadow-xs border border-[#E8E9ED]"
                        : "text-[#64748B] hover:text-[#12263F]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{scope.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scope = Full Subject */}
            {scopeType === "subject" && (
              <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E8E9ED] flex items-center gap-2.5 text-xs text-[#64748B]">
                <Info className="w-4 h-4 text-[#800020] shrink-0" />
                <span>
                  سيتم اختيار الأسئلة بتوزيع متوازن يغطي كافة وحدات وفصول مادة{" "}
                  <strong className="text-[#12263F]">
                    {currentSubject?.name}
                  </strong>{" "}
                  ({currentUnits.length} وحدات).
                </span>
              </div>
            )}

            {/* Scope = Unit */}
            {scopeType === "unit" && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-[#12263F] block">
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
                        className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? "border-2 border-[#800020] bg-[#800020]/[0.03] shadow-xs"
                            : "border-[#E8E9ED] bg-white hover:border-[#800020]/40 hover:bg-[#F7F8FA]"
                        }`}
                      >
                        <div className="min-w-0">
                          <span
                            className={`text-xs font-bold block truncate ${
                              isSelected ? "text-[#800020]" : "text-[#12263F]"
                            }`}
                          >
                            {u.title}
                          </span>
                          <span className="text-[11px] text-[#64748B] block mt-0.5">
                            {u.lessons.length} دروس
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#800020] border-[#800020] text-white"
                              : "border-[#E8E9ED] bg-white"
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
                          ? "bg-[#800020] text-white"
                          : "bg-[#F7F8FA] text-[#64748B] border border-[#E8E9ED] hover:text-[#12263F]"
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
                            ? "bg-[#800020] text-white"
                            : "bg-[#F7F8FA] text-[#64748B] border border-[#E8E9ED] hover:text-[#12263F]"
                        }`}
                      >
                        {u.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selection Action Bar */}
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#E8E9ED]/60 text-xs">
                  <span className="font-bold text-[#12263F]">
                    تم تحديد:{" "}
                    <span className="text-[#800020] font-mono">
                      {selectedLessonIds.length}
                    </span>{" "}
                    درس
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllLessonsInScope}
                      className="font-bold text-[#800020] hover:underline cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span className="text-[#E8E9ED]">•</span>
                    <button
                      type="button"
                      onClick={clearLessonsSelection}
                      className="text-[#64748B] hover:text-[#DC2626] cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                {/* Lessons Scrollable List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 bg-[#F7F8FA]/60 rounded-xl border border-[#E8E9ED]">
                  {displayedLessons.map((lesson) => {
                    const isChecked = selectedLessonIds.includes(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => toggleLesson(lesson.id)}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2.5 cursor-pointer ${
                          isChecked
                            ? "border-[#800020] bg-white shadow-xs"
                            : "border-[#E8E9ED] bg-white/70 hover:border-[#800020]/40"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? "bg-[#800020] border-[#800020] text-white"
                              : "border-[#E8E9ED] bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-xs font-bold block truncate ${
                              isChecked ? "text-[#800020]" : "text-[#12263F]"
                            }`}
                          >
                            {lesson.title}
                          </span>
                          <span className="text-[10px] text-[#64748B] block truncate">
                            {lesson.unitTitle}
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
            <section className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E9ED] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#800020]/8 text-[#800020] flex items-center justify-center font-bold">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#12263F]">
                    3. نوع الأسئلة
                  </h2>
                  <p className="text-xs text-[#64748B]">
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
                      className={`h-11 px-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? "border-2 border-[#800020] bg-[#800020]/[0.03] text-[#800020] font-bold shadow-xs"
                          : "border-[#E8E9ED] bg-white text-[#12263F] hover:border-[#800020]/40 hover:bg-[#F7F8FA]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span className="text-xs truncate">{t.label}</span>
                      </div>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#800020] border-[#800020] text-white"
                            : "border-[#E8E9ED] bg-white"
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
            <section className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E9ED] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#800020]/8 text-[#800020] flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#12263F]">
                    4. مستوى الصعوبة
                  </h2>
                  <p className="text-xs text-[#64748B]">
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
                      className={`h-11 px-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? "border-2 border-[#800020] bg-[#800020]/[0.03] text-[#800020] font-bold shadow-xs"
                          : "border-[#E8E9ED] bg-white text-[#12263F] hover:border-[#800020]/40 hover:bg-[#F7F8FA]"
                      }`}
                    >
                      <div className="truncate">
                        <span className="text-xs block font-bold leading-tight truncate">
                          {d.label}
                        </span>
                        <span className="text-[10px] text-[#64748B] block -mt-0.5">
                          {d.desc}
                        </span>
                      </div>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#800020] border-[#800020] text-white"
                            : "border-[#E8E9ED] bg-white"
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
            <section className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E9ED] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#800020]/8 text-[#800020] flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#12263F]">
                      5. عدد الأسئلة
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      اختر كمية الأسئلة للاختبار
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-[#64748B] bg-[#F7F8FA] px-2 py-0.5 rounded-md border border-[#E8E9ED]">
                  {isCounting ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>فحص...</span>
                    </span>
                  ) : (
                    <span>المتاح: {availableCount ?? 0}</span>
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
                            ? "bg-[#800020] border-[#800020] text-white font-bold shadow-xs"
                            : "bg-white border-[#E8E9ED] text-[#12263F] hover:border-[#800020]/40 hover:bg-[#F7F8FA]"
                        }`}
                      >
                        <span className="text-sm font-extrabold font-mono leading-none">
                          {num}
                        </span>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            isSelected ? "text-white/80" : "text-[#64748B]"
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
                    <p className="text-[11px] text-[#D97706] font-medium leading-relaxed">
                      * متاح {availableCount} أسئلة فقط بالمعايير الحالية؛ سيتم تضمين أقصى عدد متاح.
                    </p>
                  )}
              </div>
            </section>

            {/* 6. نظام الاختبار (Exam Mode) */}
            <section className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E9ED] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#800020]/8 text-[#800020] flex items-center justify-center font-bold">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#12263F]">
                    6. نظام الاختبار
                  </h2>
                  <p className="text-xs text-[#64748B]">
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
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between min-h-[64px] cursor-pointer ${
                      mode === "PRACTICE"
                        ? "border-2 border-[#800020] bg-[#800020]/[0.03] shadow-xs"
                        : "border-[#E8E9ED] bg-white hover:border-[#800020]/40 hover:bg-[#F7F8FA]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-bold ${
                          mode === "PRACTICE" ? "text-[#800020]" : "text-[#12263F]"
                        }`}
                      >
                        وضع التدريب
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          mode === "PRACTICE"
                            ? "bg-[#800020] border-[#800020] text-white"
                            : "border-[#E8E9ED] bg-white"
                        }`}
                      >
                        {mode === "PRACTICE" && (
                          <Check className="w-2 h-2 stroke-[3]" />
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#64748B] leading-tight">
                      تصحيح وتفسير بعد كل سؤال
                    </span>
                  </button>

                  {/* وضع الامتحان */}
                  <button
                    type="button"
                    onClick={() => setMode("EXAM")}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between min-h-[64px] cursor-pointer ${
                      mode === "EXAM"
                        ? "border-2 border-[#800020] bg-[#800020]/[0.03] shadow-xs"
                        : "border-[#E8E9ED] bg-white hover:border-[#800020]/40 hover:bg-[#F7F8FA]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-bold ${
                          mode === "EXAM" ? "text-[#800020]" : "text-[#12263F]"
                        }`}
                      >
                        وضع الامتحان
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          mode === "EXAM"
                            ? "bg-[#800020] border-[#800020] text-white"
                            : "border-[#E8E9ED] bg-white"
                        }`}
                      >
                        {mode === "EXAM" && <Check className="w-2 h-2 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#64748B] leading-tight">
                      حل الكل ثم النتيجة والتعليل
                    </span>
                  </button>
                </div>

                {/* Duration selector if Exam mode */}
                {mode === "EXAM" && (
                  <div className="pt-2 border-t border-[#E8E9ED] flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#800020]" />
                      <span>المدة:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[15, 20, 30, 45].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDurationMinutes(mins)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            durationMinutes === mins
                              ? "bg-[#800020] text-white"
                              : "bg-[#F7F8FA] border border-[#E8E9ED] text-[#12263F] hover:border-[#800020]"
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
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E9ED] shadow-xs space-y-4">
            {/* Header & Status Indicator */}
            <div className="space-y-1 pb-3 border-b border-[#E8E9ED]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-extrabold text-[#12263F] tracking-tight">
                  {isReady ? "امتحانك جاهز" : "ملخص امتحانك"}
                </h3>
                {isCounting ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded-full">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>فحص...</span>
                  </span>
                ) : isReady ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] bg-[#059669]/10 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                    <span>جاهز للبدء</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-full">
                    <span>غير مكتمل</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B]">
                {isReady
                  ? "جميع المعايير متوفرة ومجهزة للبدء فوراً"
                  : "حدد تفضيلاتك وتأكد من توفر الأسئلة للبدء"}
              </p>
            </div>

            {/* Neatly Aligned Specification Rows */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#E8E9ED]/50">
                <span className="text-[#64748B]">المادة:</span>
                <span className="font-bold text-[#12263F] flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentSubject?.color || "#800020" }}
                  />
                  <span>{currentSubject?.name || "غير محدد"}</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E8E9ED]/50">
                <span className="text-[#64748B]">النطاق:</span>
                <span className="font-bold text-[#12263F] truncate max-w-[170px]">
                  {scopeLabel}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E8E9ED]/50">
                <span className="text-[#64748B]">نوع الأسئلة:</span>
                <span className="font-bold text-[#12263F]">
                  {questionTypeLabel}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E8E9ED]/50">
                <span className="text-[#64748B]">الصعوبة:</span>
                <span className="font-bold text-[#12263F]">
                  {difficultyLabel}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E8E9ED]/50">
                <span className="text-[#64748B]">عدد الأسئلة:</span>
                <span className="font-mono font-extrabold text-[#800020]">
                  {effectiveCount} سؤال
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#64748B]">نظام الاختبار:</span>
                <span className="font-bold text-[#12263F]">
                  {mode === "PRACTICE"
                    ? "تدريب (شرح فوري)"
                    : `امتحان (${durationMinutes} دقيقة)`}
                </span>
              </div>
            </div>

            {/* Live Available Matching Questions Box */}
            <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E8E9ED] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] block">
                  الأسئلة المتطابقة
                </span>
                <span className="text-xs text-[#12263F] font-semibold block mt-0.5">
                  في بنك الأسئلة المعتمد
                </span>
              </div>
              <div className="flex items-baseline gap-1 text-[#800020]">
                {isCounting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#800020]" />
                ) : (
                  <span className="text-xl font-extrabold font-mono">
                    {availableCount ?? 0}
                  </span>
                )}
                <span className="text-xs font-normal text-[#64748B]">سؤال</span>
              </div>
            </div>

            {/* Warnings or Zero Availability Note */}
            {availableCount === 0 && !isCounting && (
              <div className="p-3 rounded-xl bg-[#DC2626]/8 border border-[#DC2626]/20 flex items-start gap-2 text-xs text-[#DC2626] font-medium leading-relaxed">
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
              className="w-full h-12 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] disabled:bg-[#E8E9ED] disabled:text-[#94A3B8] disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:opacity-90 cursor-pointer"
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
            <p className="text-[11px] text-center text-[#64748B] pt-1">
              تصحيح فوري ونموذجي مع التفسير الكامل
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
