"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, AlertCircle } from "lucide-react";
import {
  Subject,
  ExamBuilderFormProps,
  ScopeType,
  QuestionTypeOption,
  DifficultyOption,
  ExamMode,
} from "./builder/types";
import { SubjectSelectorSection } from "./builder/SubjectSelectorSection";
import { ScopeSelectorSection } from "./builder/ScopeSelectorSection";
import { QuestionFiltersSection } from "./builder/QuestionFiltersSection";
import { ExamConfigSection } from "./builder/ExamConfigSection";
import { ExamBuilderSummaryCard } from "./builder/ExamBuilderSummaryCard";

export type { Subject, ExamBuilderFormProps } from "./builder/types";

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
  const [scopeType, setScopeType] = useState<ScopeType>(
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
  const [questionType, setQuestionType] = useState<QuestionTypeOption>("ALL");

  // 4. Difficulty State
  const [difficulty, setDifficulty] = useState<DifficultyOption>("ALL");

  // 5. Question Count State
  const [questionCount, setQuestionCount] = useState<number>(10);

  // 6. Exam Mode State
  const [mode, setMode] = useState<ExamMode>("PRACTICE");
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
          <SubjectSelectorSection
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            currentSubject={currentSubject}
            onSelectSubject={handleSelectSubject}
          />

          <ScopeSelectorSection
            scopeType={scopeType}
            setScopeType={setScopeType}
            currentSubject={currentSubject}
            currentUnits={currentUnits}
            effectiveUnitId={effectiveUnitId}
            setSelectedUnitId={setSelectedUnitId}
            activeUnitLessonTab={activeUnitLessonTab}
            setActiveUnitLessonTab={setActiveUnitLessonTab}
            selectedLessonIds={selectedLessonIds}
            displayedLessons={displayedLessons}
            onToggleLesson={toggleLesson}
            onSelectAllLessons={selectAllLessonsInScope}
            onClearLessons={clearLessonsSelection}
          />

          <QuestionFiltersSection
            questionType={questionType}
            setQuestionType={setQuestionType}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />

          <ExamConfigSection
            questionCount={questionCount}
            setQuestionCount={setQuestionCount}
            availableCount={availableCount}
            isCounting={isCounting}
            mode={mode}
            setMode={setMode}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
          />
        </div>

        {/* Left Column: Live Exam Summary Panel */}
        <ExamBuilderSummaryCard
          isReady={isReady}
          isCounting={isCounting}
          isSubmitting={isSubmitting}
          currentSubject={currentSubject}
          scopeLabel={scopeLabel}
          questionTypeLabel={questionTypeLabel}
          difficultyLabel={difficultyLabel}
          effectiveCount={effectiveCount}
          mode={mode}
          durationMinutes={durationMinutes}
          availableCount={availableCount}
          scopeType={scopeType}
          selectedLessonIds={selectedLessonIds}
        />
      </div>
    </form>
  );
}
