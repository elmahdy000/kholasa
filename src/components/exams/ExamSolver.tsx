"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExamSolverProps, UserAnswerState } from "./solver/types";
import { ExamSolverHeader } from "./solver/ExamSolverHeader";
import { ExamQuestionPalette } from "./solver/ExamQuestionPalette";
import { ExamQuestionCard } from "./solver/ExamQuestionCard";
import { ExamSubmitModal } from "./solver/ExamSubmitModal";

export { type ExamSolverProps } from "./solver/types";

export function ExamSolver({ exam, attemptId, attemptStartedAt }: ExamSolverProps) {
  const router = useRouter();
  const questions = exam.questions.map((q) => q.question);
  const totalQuestions = questions.length;

  const storageKey = `kholasa_exam_state_${attemptId}`;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswerState>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  // Compute remaining timer seconds from attemptStartedAt if available (to survive refresh)
  const totalExamSeconds = exam.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (attemptStartedAt) {
      const elapsed = Math.floor((Date.now() - new Date(attemptStartedAt).getTime()) / 1000);
      return Math.max(0, totalExamSeconds - elapsed);
    }
    return totalExamSeconds;
  });

  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const executeSubmitRef = useRef<() => void>(() => {});

  // 1. Restore state from localStorage on mount (current question, answers, flagged questions)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.currentIndex === "number" &&
          parsed.currentIndex >= 0 &&
          parsed.currentIndex < totalQuestions
        ) {
          setCurrentIndex(parsed.currentIndex);
        }
        if (parsed.answers && typeof parsed.answers === "object") {
          setAnswers(parsed.answers);
        }
        if (parsed.flaggedQuestions && typeof parsed.flaggedQuestions === "object") {
          setFlaggedQuestions(parsed.flaggedQuestions);
        }
      }
    } catch (e) {
      console.error("Failed to restore exam state from localStorage", e);
    }
  }, [storageKey, totalQuestions]);

  // 2. Persist state to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          currentIndex,
          answers,
          flaggedQuestions,
        })
      );
    } catch (e) {
      // Ignore private browsing storage quota errors
    }
  }, [storageKey, currentIndex, answers, flaggedQuestions]);

  const handleAutoSubmit = () => {
    executeSubmitRef.current();
  };

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTotalTimeSpent((prev) => prev + 1);
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQ = questions[currentIndex];
  const currentAnswer = (currentQ ? answers[currentQ.id] : undefined) || {};
  const isFlagged = currentQ ? Boolean(flaggedQuestions[currentQ.id]) : false;

  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedOptionId: optionId,
      },
    }));
  };

  const handleEssayChange = (text: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        essayText: text,
      },
    }));
  };

  const toggleFlag = () => {
    if (!currentQ) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const executeSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/exams/${exam.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
          totalTimeSpentSeconds: totalTimeSpent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Clean up persisted state once completed
        try {
          localStorage.removeItem(storageKey);
        } catch (e) {
          // ignore
        }
        router.push(`/exams/${exam.id}/results?attemptId=${attemptId}`);
      } else {
        setSubmitError(data.error || "حصلت مشكلة أثناء تسليم الامتحان، جرب تاني.");
        setShowConfirmModal(true);
      }
    } catch (err) {
      console.error(err);
      setSubmitError("مشكلة في الاتصال بالإنترنت أثناء التسليم، اتأكد من النت وجرب تاني.");
      setShowConfirmModal(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [exam.id, attemptId, answers, totalTimeSpent, router, storageKey]);

  useEffect(() => {
    executeSubmitRef.current = executeSubmit;
  }, [executeSubmit]);

  // Live Statistics calculation
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOptionId || (a.essayText && a.essayText.trim().length > 0)
  ).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Format timer MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgent = minutes < 2;

  const isLanguages =
    currentQ?.schoolCategory === "LANGUAGES" ||
    exam?.schoolCategory === "LANGUAGES" ||
    exam?.subject?.schoolCategory === "LANGUAGES";

  return (
    <div className="max-w-3xl mx-auto px-2.5 sm:px-4 space-y-3 sm:space-y-3.5 text-right font-ui pb-10">
      {/* Top Header: Platform Logo, Banner, Status Row, and Live Stats */}
      <ExamSolverHeader
        subjectName={exam.subject.name}
        examTitle={exam.title}
        minutes={minutes}
        seconds={seconds}
        isUrgent={isUrgent}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        unansweredCount={unansweredCount}
        isPaletteOpen={isPaletteOpen}
        onTogglePalette={() => setIsPaletteOpen((prev) => !prev)}
        onOpenSubmitModal={() => setShowConfirmModal(true)}
      />

      {/* Collapsible Question Palette (Opened on clicking 2 من 30 سؤال) */}
      {isPaletteOpen && (
        <ExamQuestionPalette
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          flaggedQuestions={flaggedQuestions}
          onSelectIndex={setCurrentIndex}
          onClose={() => setIsPaletteOpen(false)}
        />
      )}

      {/* Main Question Card with Distinctive Previous/Next Buttons */}
      {currentQ && (
        <ExamQuestionCard
          currentQ={currentQ}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          currentAnswer={currentAnswer}
          isFlagged={isFlagged}
          isLanguages={Boolean(isLanguages)}
          onToggleFlag={toggleFlag}
          onSelectOption={handleSelectOption}
          onEssayChange={handleEssayChange}
          onPrevQuestion={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
          onNextQuestion={() => setCurrentIndex((idx) => idx + 1)}
          onOpenSubmitModal={() => setShowConfirmModal(true)}
          onSelectIndex={setCurrentIndex}
        />
      )}

      {/* Submit Confirmation Modal */}
      <ExamSubmitModal
        isOpen={showConfirmModal}
        isSubmitting={isSubmitting}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        submitError={submitError}
        onConfirmSubmit={executeSubmit}
        onClose={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
