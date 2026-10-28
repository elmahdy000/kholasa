"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExamSolverProps, RevealedAnswer, UserAnswerState } from "./solver/types";
import { ExamSolverHeader } from "./solver/ExamSolverHeader";
import { ExamQuestionPalette } from "./solver/ExamQuestionPalette";
import { ExamQuestionCard } from "./solver/ExamQuestionCard";
import { ExamSubmitModal } from "./solver/ExamSubmitModal";

export { type ExamSolverProps } from "./solver/types";

export function ExamSolver({ exam, attemptId, initialMode }: ExamSolverProps) {
  const router = useRouter();
  const questions = exam.questions.map((q) => q.question);
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswerState>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(exam.durationMinutes * 60);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, RevealedAnswer>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const executeSubmitRef = useRef<() => void>(() => {});

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
  const revealedAnswer = currentQ ? revealed[currentQ.id] : undefined;
  const isFlagged = currentQ ? (flaggedQuestions[currentQ.id] || false) : false;

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

  const handleRevealPractice = async () => {
    if (!currentQ) return;
    setIsRevealing(true);
    try {
      const res = await fetch(`/api/questions/${currentQ.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedOptionId: currentAnswer.selectedOptionId,
          essayText: currentAnswer.essayText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر عرض الإجابة");
      }

      setRevealed((prev) => ({ ...prev, [currentQ.id]: data }));
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          practiceRevealed: true,
        },
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsRevealing(false);
    }
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
  }, [exam.id, attemptId, answers, totalTimeSpent, router]);

  useEffect(() => {
    executeSubmitRef.current = executeSubmit;
  }, [executeSubmit]);

  // Stats for modal
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOptionId || (a.essayText && a.essayText.trim().length > 0)
  ).length;
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
    <div className="max-w-4xl mx-auto space-y-6 text-right font-ui pb-12">
      <ExamSolverHeader
        subjectName={exam.subject.name}
        examTitle={exam.title}
        initialMode={initialMode}
        minutes={minutes}
        seconds={seconds}
        isUrgent={isUrgent}
        onOpenSubmitModal={() => setShowConfirmModal(true)}
      />

      <ExamQuestionPalette
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        onSelectIndex={setCurrentIndex}
      />

      {currentQ && (
        <ExamQuestionCard
          currentQ={currentQ}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          initialMode={initialMode}
          currentAnswer={currentAnswer}
          revealedAnswer={revealedAnswer}
          isFlagged={isFlagged}
          isLanguages={Boolean(isLanguages)}
          isRevealing={isRevealing}
          onToggleFlag={toggleFlag}
          onSelectOption={handleSelectOption}
          onEssayChange={handleEssayChange}
          onRevealPractice={handleRevealPractice}
          onPrevQuestion={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
          onNextQuestion={() => setCurrentIndex((idx) => idx + 1)}
          onOpenSubmitModal={() => setShowConfirmModal(true)}
        />
      )}

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