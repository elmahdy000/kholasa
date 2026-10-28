"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MistakeItem, MistakeHubClientProps, ActiveAnswerState } from "./types";
import { MistakeAnalyticsBar } from "./MistakeAnalyticsBar";
import { MistakeExamBanner } from "./MistakeExamBanner";
import { MistakeFilterBar } from "./MistakeFilterBar";
import { MistakeCard } from "./MistakeCard";
import { MistakesEmptyState } from "./MistakesEmptyState";

export function MistakeHubClient({
  initialMistakes,
  subjects,
}: MistakeHubClientProps) {
  const router = useRouter();
  const [mistakes, setMistakes] = useState<MistakeItem[]>(initialMistakes);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Inline answering state for questions in mistake hub
  const [activeAnswers, setActiveAnswers] = useState<Record<string, ActiveAnswerState>>({});

  const filteredMistakes = mistakes.filter((m) => {
    if (selectedSubjectId !== "all" && m.question.subject.id !== selectedSubjectId) {
      return false;
    }
    if (filterStatus === "unresolved" && m.isResolved) return false;
    if (filterStatus === "resolved" && !m.isResolved) return false;
    return true;
  });

  const totalCount = mistakes.length;
  const resolvedCount = mistakes.filter((m) => m.isResolved).length;
  const unresolvedCount = totalCount - resolvedCount;
  const masteryPercentage =
    totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : null;

  const handleRetakeAnswer = async (questionId: string, optionId: string) => {
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

      const data = await res.json();
      const isCorrect = !!data.isCorrect;

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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateExamFromMistakes = async () => {
    const targetMistakes = filteredMistakes.filter((m) => !m.isResolved);
    if (targetMistakes.length === 0) return;

    setIsGeneratingExam(true);
    setGenerationError(null);
    try {
      const res = await fetch("/api/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "امتحان معالجة الأخطاء: مراجعة وتثبيت نقاط الضعف",
          mode: "PRACTICE",
          durationMinutes: Math.max(10, Math.min(60, targetMistakes.length * 2)),
          questionIds: targetMistakes.map((m) => m.questionId),
          subjectId: selectedSubjectId !== "all" ? selectedSubjectId : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.examId && data.attemptId) {
        router.push(`/exams/${data.examId}?attemptId=${data.attemptId}`);
      } else {
        setGenerationError(data.error || "تعذر تجهيز الامتحان، حاول مرة أخرى.");
        setIsGeneratingExam(false);
      }
    } catch (err) {
      console.error(err);
      setGenerationError("حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.");
      setIsGeneratingExam(false);
    }
  };

  const actionableUnresolvedCount = filteredMistakes.filter((m) => !m.isResolved).length;

  return (
    <div className="space-y-6">
      {/* Overview Analytics Bar */}
      <MistakeAnalyticsBar
        unresolvedCount={unresolvedCount}
        resolvedCount={resolvedCount}
        masteryPercentage={masteryPercentage}
      />

      {/* Generation Error Alert */}
      {generationError && (
        <div className="p-3.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] dark:text-[#F87171] text-xs font-bold flex items-center justify-between gap-3">
          <span>{generationError}</span>
          <button
            type="button"
            onClick={() => setGenerationError(null)}
            className="text-[11px] underline hover:no-underline"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Quick Exam Banner when there are unresolved mistakes */}
      <MistakeExamBanner
        actionableUnresolvedCount={actionableUnresolvedCount}
        isGeneratingExam={isGeneratingExam}
        onGenerateExam={handleGenerateExamFromMistakes}
      />

      {/* Filters Bar */}
      <MistakeFilterBar
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        unresolvedCount={unresolvedCount}
        resolvedCount={resolvedCount}
        totalCount={totalCount}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
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
            />
          ))}
        </div>
      ) : (
        <MistakesEmptyState />
      )}
    </div>
  );
}
