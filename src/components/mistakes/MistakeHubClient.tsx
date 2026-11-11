"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Crosshair, Flame, Sparkles, X } from "lucide-react";
import { buildMistakeDiagnosisBreakdown } from "@/lib/mistake-diagnosis";
import { dispatchMistakesUpdatedClientEvent } from "@/lib/realtime-client";
import { ConfettiCanvas } from "@/components/ui/ConfettiCanvas";
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
  initialSubjectId = "all",
  initialLessonId = null,
}: MistakeHubClientProps) {
  const router = useRouter();
  const [mistakes, setMistakes] = useState<MistakeItem[]>(initialMistakes);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(initialLessonId);
  const [filterStatus, setFilterStatus] = useState<"all" | "unresolved" | "resolved">(
    "unresolved"
  );
  const [typeFilter, setTypeFilter] = useState<MistakeQuestionTypeFilter>("ALL");
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [correctCombo, setCorrectCombo] = useState(0);
  const [celebrationCount, setCelebrationCount] = useState(0);

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

  const diagnosisBuckets = useMemo(
    () => buildMistakeDiagnosisBreakdown(subjectScopedMistakes.filter((m) => !m.isResolved)),
    [subjectScopedMistakes]
  );

  const activeLessonBucket = useMemo(
    () =>
      selectedLessonId
        ? diagnosisBuckets.find((b) => b.lessonId === selectedLessonId) ?? null
        : null,
    [diagnosisBuckets, selectedLessonId]
  );

  const totalCount = subjectScopedMistakes.length;
  const resolvedCount = subjectScopedMistakes.filter((m) => m.isResolved).length;
  const unresolvedCount = totalCount - resolvedCount;
  const essayCount = subjectScopedMistakes.filter((m) => m.question.type === "ESSAY").length;
  const objectiveCount = totalCount - essayCount;
  const masteryPercentage =
    totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : null;

  const filteredMistakes = subjectScopedMistakes.filter((m) => {
    if (
      selectedLessonId &&
      !m.question.lessons?.some((l) => l.lesson.id === selectedLessonId)
    ) {
      return false;
    }

    const isEssay = m.question.type === "ESSAY" || !m.question.options?.length;
    if (typeFilter === "ESSAY" && !isEssay) return false;
    if (typeFilter === "OBJECTIVE" && isEssay) return false;

    const keepVisible =
      Boolean(activeAnswers[m.questionId]) || recentlyChangedIds.has(m.questionId);
    if (filterStatus === "unresolved" && m.isResolved && !keepVisible) return false;
    if (filterStatus === "resolved" && !m.isResolved && !keepVisible) return false;
    return true;
  });

  const triggerCelebrationIfZero = (nextList: MistakeItem[]) => {
    const scoped =
      selectedSubjectId === "all"
        ? nextList
        : nextList.filter((m) => m.question.subject.id === selectedSubjectId);
    const remainingUnresolved = scoped.filter((m) => !m.isResolved).length;
    if (scoped.length > 0 && remainingUnresolved === 0) {
      setCelebrationCount((c) => c + 1);
    }
  };

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
        setCorrectCombo((prev) => prev + 1);
        setMistakes((prev) => {
          const next = prev.map((m) =>
            m.questionId === questionId ? { ...m, isResolved: true } : m
          );
          triggerCelebrationIfZero(next);
          return next;
        });
      } else {
        setCorrectCombo(0);
        setMistakes((prev) =>
          prev.map((m) =>
            m.questionId === questionId
              ? { ...m, isResolved: false, wrongCount: m.wrongCount + 1 }
              : m
          )
        );
      }
      dispatchMistakesUpdatedClientEvent();
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

      setCorrectCombo((prev) => prev + 1);
      setRecentlyChangedIds((prev) => new Set(prev).add(questionId));
      setMistakes((prev) => {
        const next = prev.map((m) =>
          m.questionId === questionId ? { ...m, isResolved: true } : m
        );
        triggerCelebrationIfZero(next);
        return next;
      });
      dispatchMistakesUpdatedClientEvent();
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

      setCorrectCombo(0);
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
      dispatchMistakesUpdatedClientEvent();
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
        if (
          selectedLessonId &&
          !m.question.lessons?.some((l) => l.lesson.id === selectedLessonId)
        ) {
          return false;
        }
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
        "أخطاءك متوزعة على أكتر من مادة. اختار مادة واحدة من الفلتر فوق عشان نعملك امتحان عليها."
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
          title: `امتحان مراجعة لأخطائي (${targetMistakes.length} أسئلة)`,
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
        setActionError(data.error || "معرفناش نجهز الامتحان، جرب تاني.");
        setIsGeneratingExam(false);
      }
    } catch {
      setActionError("في مشكلة في النت، جرب كمان شوية.");
      setIsGeneratingExam(false);
    }
  };

  const actionableUnresolvedCount = subjectScopedMistakes.filter((m) => {
    if (m.isResolved) return false;
    if (
      selectedLessonId &&
      !m.question.lessons?.some((l) => l.lesson.id === selectedLessonId)
    ) {
      return false;
    }
    const isEssay = m.question.type === "ESSAY" || !m.question.options?.length;
    if (typeFilter === "ESSAY" && !isEssay) return false;
    if (typeFilter === "OBJECTIVE" && isEssay) return false;
    return true;
  }).length;

  const topWeakness = diagnosisBuckets[0] ?? null;

  return (
    <div className="space-y-6">
      {celebrationCount > 0 && (
        <ConfettiCanvas key={celebrationCount} duration={3000} particleCount={95} />
      )}

      {/* Overview Analytics Bar */}
      <MistakeAnalyticsBar
        unresolvedCount={unresolvedCount}
        resolvedCount={resolvedCount}
        masteryPercentage={masteryPercentage}
      />

      {/* Celebratory Feedback on Zeroed Mistakes or Combo Streak */}
      <AnimatePresence>
        {celebrationCount > 0 && unresolvedCount === 0 && totalCount > 0 && (
          <motion.div
            key="zero-celebration"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
            className="p-4 rounded-2xl bg-linear-to-l from-[#ECFDF5] to-[#D1FAE5]/70 dark:from-[#064E3B]/50 dark:to-[#065F46]/40 border border-[#6EE7B7] dark:border-[#059669] flex items-center gap-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-[#065F46] dark:text-[#A7F3D0]">
                خلصت كل الأسئلة اللي في الفلتر ده
              </p>
              <p className="text-xs text-[#047857] dark:text-[#6EE7B7] mt-0.5">
                مفيش حاجة واقفة عليك هنا دلوقتي — تقدر تكمل باقي الدروس أو تحل امتحان جديد.
              </p>
            </div>
          </motion.div>
        )}

        {correctCombo >= 2 && unresolvedCount > 0 && (
          <motion.div
            key={`combo-${correctCombo}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs font-black shadow-2xs"
          >
            <Flame className="w-4 h-4 text-[#D97706] fill-[#D97706]" />
            <span>ماشي كويس: {correctCombo} أسئلة صح ورا بعض</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weakness Diagnosis Panel ("تشخيص المشكلة") */}
      {diagnosisBuckets.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#E2E8F0] dark:border-[#1E3352] p-4 sm:p-5 space-y-3.5 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#091B40] dark:text-[#F8FAFC]">
                <Crosshair className="w-4 h-4 text-[#800B34] dark:text-[#F0B843] shrink-0" />
                <span>أخطاءك متركزة فين؟</span>
              </div>
              {topWeakness && (
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  أكتر درس محتاج مراجعة دلوقتي:{" "}
                  <strong className="text-[#800B34] dark:text-[#FDA4AF]">
                    {topWeakness.subjectName}
                    {topWeakness.lessonTitle
                      ? ` — ${topWeakness.lessonTitle}`
                      : topWeakness.unitTitle
                        ? ` — ${topWeakness.unitTitle}`
                        : ""}
                  </strong>{" "}
                  ({topWeakness.count} أسئلة • غلطت فيهم {topWeakness.totalWrongs} مرة)
                </p>
              )}
            </div>

            {selectedLessonId && (
              <button
                type="button"
                onClick={() => setSelectedLessonId(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#1E293B] text-[#091B40] dark:text-[#E2E8F0] text-xs font-bold hover:bg-[#E2E8F0] dark:hover:bg-[#334155] transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>عرض كل الدروس</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {diagnosisBuckets.slice(0, 6).map((bucket, idx) => {
              const isSelected = Boolean(bucket.lessonId && bucket.lessonId === selectedLessonId);
              const barPercent =
                unresolvedCount > 0
                  ? Math.max(8, Math.round((bucket.count / unresolvedCount) * 100))
                  : 0;

              return (
                <motion.div
                  key={bucket.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.25 }}
                  whileHover={{ y: -2 }}
                  className={`p-3 rounded-xl border transition-all min-w-0 flex flex-col justify-between gap-2 ${
                    isSelected
                      ? "bg-[#800B34]/8 dark:bg-[#800B34]/20 border-[#800B34] dark:border-[#E9AD32] shadow-xs"
                      : "bg-[#F8FAFC] dark:bg-[#132238] border-[#E2E8F0] dark:border-[#243652] hover:border-[#800B34]/45 dark:hover:border-[#E9AD32]/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (bucket.lessonId) {
                        setSelectedLessonId(isSelected ? null : bucket.lessonId);
                      } else if (bucket.subjectId !== selectedSubjectId) {
                        setSelectedSubjectId(bucket.subjectId);
                        setSelectedLessonId(null);
                      }
                    }}
                    className="w-full text-right cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] truncate">
                        <span className="w-4 h-4 rounded bg-[#800B34]/10 dark:bg-[#E11D48]/20 text-[#800B34] dark:text-[#FB7185] text-[10px] font-black inline-flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{bucket.subjectName}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums bg-[#DC2626]/10 dark:bg-[#DC2626]/20 text-[#B91C1C] dark:text-[#FCA5A5] shrink-0">
                        {bucket.count}
                      </span>
                    </div>

                    <p className="text-xs font-black text-[#091B40] dark:text-[#F8FAFC] truncate">
                      {bucket.lessonTitle || bucket.unitTitle || "مراجعة عامة"}
                    </p>

                    <div className="mt-2 h-1.5 w-full rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, barPercent)}%` }}
                        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-[#800B34] dark:bg-[#E9AD32]"
                      />
                    </div>
                  </button>

                  {bucket.lessonId && (
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold border-t border-[#E2E8F0]/70 dark:border-[#243652] pt-2">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">
                        {isSelected ? "متفلتر دلوقتي ✓" : "اضغط هنا عشان تشوف أسئلته"}
                      </span>
                      <Link
                        href={`/lessons/${bucket.lessonId}`}
                        className="inline-flex items-center gap-1 text-[#800B34] dark:text-[#E9AD32] hover:underline shrink-0"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>راجع شرح الدرس</span>
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {activeLessonBucket && (
            <div className="text-[11px] font-bold text-[#800B34] dark:text-[#E9AD32]">
              بتشوف دلوقتي أسئلة درس: {activeLessonBucket.lessonTitle}
            </div>
          )}
        </motion.section>
      )}

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
          setSelectedLessonId(null);
          setRecentlyChangedIds(new Set());
        }}
        subjects={subjects}
      />

      {/* Mistakes List or Empty State */}
      {filteredMistakes.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredMistakes.map((mistake) => (
              <motion.div
                key={mistake.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <MistakeCard
                  mistake={mistake}
                  answerState={activeAnswers[mistake.question.id]}
                  onRetakeAnswer={handleRetakeAnswer}
                  onResolveMistake={handleResolveMistake}
                  onReopenMistake={handleReopenMistake}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <MistakesEmptyState />
      )}
    </div>
  );
}
