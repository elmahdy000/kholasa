"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MistakeItem, MistakeHubClientProps, ActiveAnswerState } from "./types";
import { MistakeAnalyticsBar } from "./MistakeAnalyticsBar";
import { MistakeExamBanner } from "./MistakeExamBanner";
import {
  MistakeFilterBar,
  type MistakeQuestionTypeFilter,
} from "./MistakeFilterBar";
import { MistakeCard } from "./MistakeCard";
import { MistakesEmptyState } from "./MistakesEmptyState";

export function MistakeHubClient({
  initialMistakes,
  subjects,
}: MistakeHubClientProps) {
  const router = useRouter();
  const [mistakes, setMistakes] = useState<MistakeItem[]>(initialMistakes);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "unresolved" | "resolved">(
    "unresolved"
  );
  const [typeFilter, setTypeFilter] = useState<MistakeQuestionTypeFilter>("ALL");
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Inline answering & recently updated cards keep visible confirmation briefly during session
  const [activeAnswers, setActiveAnswers] = useState<Record<string, ActiveAnswerState>>({});
  const [recentlyChangedIds, setRecentlyChangedIds] = useState<Set<string>>(new Set());

  const subjectScopedMistakes = useMemo(
    () =>
      selectedSubjectId === "all"
        ? mistakes
        : mistakes.filter((m) => m.question.subject.id === selectedSubjectId),
    [mistakes, selectedSubjectId]
  );

  const totalCount = subjectScopedMistakes.length;
  const resolvedCount = subjectScopedMistakes.filter((m) => m.isResolved).length;
  const unresolvedCount = totalCount - resolvedCount;
  const essayCount = subjectScopedMistakes.filter((m) => m.question.type === "ESSAY").length;
  const objectiveCount = totalCount - essayCount;
  const masteryPercentage =
    totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : null;

  const filteredMistakes = subjectScopedMistakes.filter((m) => {
    const isEssay = m.question.type === "ESSAY" || !m.question.options?.length;
    if (typeFilter === "ESSAY" && !isEssay) return false;
    if (typeFilter === "OBJECTIVE" && isEssay) return false;

    const keepVisible =
      Boolean(activeAnswers[m.questionId]) || recentlyChangedIds.has(m.questionId);
    if (filterStatus === "unresolved" && m.isResolved && !keepVisible) return false;
    if (filterStatus === "resolved" && !m.isResolved && !keepVisible) return false;
    return true;
  });

  const handleRetakeAnswer = async (questionId: string, optionId: string) => {
    setActionError(null);
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

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "تعذر التحقق من الإجابة، حاول مرة أخرى.");
      }

      const isCorrect = Boolean(data.isCorrect);

      setActiveAnswers((prev) => ({
        ...prev,
        [questionId]: {
          selectedOptionId: optionId,
          isChecking: false,
          result: { isCorrect },
        },
      }));

      if (isCorrect) {
        setMistakes((prev) =>
          prev.map((m) =>
            m.questionId === questionId ? { ...m, isResolved: true } : m
          )
        );
      } else {
        setMistakes((prev) =>
          prev.map((m) =>
            m.questionId === questionId
              ? { ...m, isResolved: false, wrongCount: m.wrongCount + 1 }
              : m
          )
        );
      }
    } catch (err) {
      setActiveAnswers((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
      setActionError(
        err instanceof Error ? err.message : "حدث خطأ في الاتصال، حاول مرة أخرى."
      );
    }
  };

  const handleResolveMistake = async (questionId: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolve: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "تعذر حفظ الحالة، حاول مرة أخرى.");
      }

      setRecentlyChangedIds((prev) => new Set(prev).add(questionId));
      setMistakes((prev) =>
        prev.map((m) =>
          m.questionId === questionId ? { ...m, isResolved: true } : m
        )
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "تعذر تحديث حالة السؤال."
      );
    }
  };

  const handleReopenMistake = async (questionId: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markForReview: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "تعذر إعادة السؤال لقائمة المراجعة.");
      }

      setRecentlyChangedIds((prev) => new Set(prev).add(questionId));
      setActiveAnswers((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
      setMistakes((prev) =>
        prev.map((m) =>
          m.questionId === questionId ? { ...m, isResolved: false } : m
        )
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "تعذر تحديث حالة السؤال."
      );
    }
  };

  const handleGenerateExamFromMistakes = async () => {
    const targetMistakes = subjectScopedMistakes
      .filter((m) => {
        if (m.isResolved) return false;
        const isEssay = m.question.type === "ESSAY" || !m.question.options?.length;
        if (typeFilter === "ESSAY" && !isEssay) return false;
        if (typeFilter === "OBJECTIVE" && isEssay) return false;
        return true;
      })
      .slice(0, 50);

    if (targetMistakes.length === 0) return;

    const distinctSubjectIds = Array.from(
      new Set(targetMistakes.map((m) => m.question.subject?.id).filter(Boolean))
    );

    if (selectedSubjectId === "all" && distinctSubjectIds.length > 1) {
      setActionError(
        "أخطاؤك موزعة على أكثر من مادة. حدد المادة من الفلتر فوق عشان نجهّز لك امتحان مركز عليها."
      );
      return;
    }

    const examSubjectId =
      selectedSubjectId !== "all" ? selectedSubjectId : distinctSubjectIds[0];

    setIsGeneratingExam(true);
    setActionError(null);
    try {
      const res = await fetch("/api/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `امتحان مراجعة الأخطاء (${targetMistakes.length} أسئلة)`,
          mode: "PRACTICE",
          durationMinutes: Math.max(10, Math.min(60, targetMistakes.length * 2)),
          questionIds: targetMistakes.map((m) => m.questionId),
          subjectId: examSubjectId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.examId && data.attemptId) {
        router.push(`/exams/${data.examId}?attemptId=${data.attemptId}`);
      } else {
        setActionError(data.error || "تعذر تجهيز الامتحان، حاول مرة أخرى.");
        setIsGeneratingExam(false);
      }
    } catch {
      setActionError("حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.");
      setIsGeneratingExam(false);
    }
  };

  const actionableUnresolvedCount = subjectScopedMistakes.filter((m) => {
    if (m.isResolved) return false;
    const isEssay = m.question.type === "ESSAY" || !m.question.options?.length;
    if (typeFilter === "ESSAY" && !isEssay) return false;
    if (typeFilter === "OBJECTIVE" && isEssay) return false;
    return true;
  }).length;

  return (
    <div className="space-y-6">
      {/* Overview Analytics Bar */}
      <MistakeAnalyticsBar
        unresolvedCount={unresolvedCount}
        resolvedCount={resolvedCount}
        masteryPercentage={masteryPercentage}
      />

      {/* Error Alert */}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/25 text-[#DC2626] dark:text-[#F87171] text-xs font-bold flex items-center justify-between gap-3">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-[11px] underline hover:no-underline cursor-pointer shrink-0"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Quick Exam Banner */}
      <MistakeExamBanner
        actionableUnresolvedCount={Math.min(50, actionableUnresolvedCount)}
        isGeneratingExam={isGeneratingExam}
        onGenerateExam={handleGenerateExamFromMistakes}
      />

      {/* Filters Bar */}
      <MistakeFilterBar
        filterStatus={filterStatus}
        setFilterStatus={(s) => {
          setFilterStatus(s);
          setRecentlyChangedIds(new Set());
        }}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        unresolvedCount={unresolvedCount}
        resolvedCount={resolvedCount}
        totalCount={totalCount}
        essayCount={essayCount}
        objectiveCount={objectiveCount}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={(id) => {
          setSelectedSubjectId(id);
          setRecentlyChangedIds(new Set());
        }}
        subjects={subjects}
      />

      {/* Mistakes List or Empty State */}
      {filteredMistakes.length > 0 ? (
        <div className="space-y-4">
          {filteredMistakes.map((mistake) => (
            <MistakeCard
              key={mistake.id}
              mistake={mistake}
              answerState={activeAnswers[mistake.question.id]}
              onRetakeAnswer={handleRetakeAnswer}
              onResolveMistake={handleResolveMistake}
              onReopenMistake={handleReopenMistake}
            />
          ))}
        </div>
      ) : (
        <MistakesEmptyState />
      )}
    </div>
  );
}
