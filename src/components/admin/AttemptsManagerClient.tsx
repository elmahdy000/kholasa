"use client";

import { useState, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import type { AttemptsManagerClientProps, Attempt, Answer } from "./attempts/types";
import { AttemptFilterBar } from "./attempts/AttemptFilterBar";
import { AttemptTable } from "./attempts/AttemptTable";
import { AttemptInspectModal } from "./attempts/AttemptInspectModal";

export type { AttemptsManagerClientProps, Attempt, Answer } from "./attempts/types";

export function AttemptsManagerClient({
  initialAttempts,
  subjects,
}: AttemptsManagerClientProps) {
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts);
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [inspectModal, setInspectModal] = useState<{
    isOpen: boolean;
    attempt?: Attempt;
    loadingDetails: boolean;
  }>({ isOpen: false, loadingDetails: false });

  const [savingGradeId, setSavingGradeId] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const inspectRequest = useRef(0);

  const handleOpenInspect = async (attempt: Attempt) => {
    const request = ++inspectRequest.current;
    setDetailsError(null);
    setInspectModal({ isOpen: true, attempt, loadingDetails: true });

    try {
      const res = await fetch(`/api/admin/attempts?id=${attempt.id}`);
      const data = await res.json();
      if (request !== inspectRequest.current) return;
      if (!res.ok || !data.attempt) throw new Error(data.error || "تعذر تحميل تفاصيل المحاولة");
      if (data.attempt) {
        setInspectModal({
          isOpen: true,
          attempt: data.attempt,
          loadingDetails: false,
        });
      }
    } catch (err) {
      if (request !== inspectRequest.current) return;
      setDetailsError(err instanceof Error ? err.message : "تعذر تحميل تفاصيل المحاولة");
      setInspectModal((prev) => ({ ...prev, loadingDetails: false }));
    }
  };

  const handleGradeEssay = async (
    answerId: string,
    score: number,
    isCorrect: boolean,
    attemptId: string
  ) => {
    setSavingGradeId(answerId);
    try {
      const res = await fetch("/api/admin/attempts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerId,
          score,
          isCorrect,
          attemptId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local attempt in modal and list
      if (data.updatedAttempt) {
        setInspectModal((prev) => {
          if (!prev.attempt) return prev;
          const updatedAnswers = prev.attempt.answers?.map((ans) =>
            ans.id === answerId ? { ...ans, score, isCorrect } : ans
          );
          return {
            ...prev,
            attempt: {
              ...prev.attempt,
              score: data.updatedAttempt.score,
              percentage: data.updatedAttempt.percentage,
              answers: updatedAnswers,
            },
          };
        });

        setAttempts((prev) =>
          prev.map((a) =>
            a.id === attemptId
              ? {
                  ...a,
                  score: data.updatedAttempt.score,
                  percentage: data.updatedAttempt.percentage,
                }
              : a
          )
        );
      }
    } catch (err: any) {
      alert(err.message || "فشل تحديث الدرجة");
    } finally {
      setSavingGradeId(null);
    }
  };

  const filteredAttempts = attempts.filter((att) => {
    const matchesSearch =
      (att.user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.user.phone || "").includes(searchQuery) ||
      (att.exam?.title || att.title).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMode =
      modeFilter === "all" ||
      (modeFilter === "PRACTICE" && att.mode === "PRACTICE") ||
      (modeFilter === "EXAM" && att.mode === "EXAM");

    return matchesSearch && matchesMode;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#0F172A] dark:text-[#F8FAFC]" />
            <span>سجل محاولات الطلاب والتصحيح</span>
          </h1>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            متابعة إجابات الطلاب في الوقت الفعلي، مراجعة الأسئلة المقالية وتصحيحها واعتماد النتائج
          </p>
        </div>
      </div>

      {/* 2. Filters bar */}
      <AttemptFilterBar
        modeFilter={modeFilter}
        setModeFilter={setModeFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 3. Attempts Table */}
      <AttemptTable
        attempts={filteredAttempts}
        onOpenInspect={handleOpenInspect}
      />

      {/* 4. Inspect and Grade Modal */}
      <AttemptInspectModal
        isOpen={inspectModal.isOpen}
        attempt={inspectModal.attempt}
        loadingDetails={inspectModal.loadingDetails}
        detailsError={detailsError}
        savingGradeId={savingGradeId}
        onClose={() => {
          inspectRequest.current++;
          setInspectModal({ isOpen: false, loadingDetails: false });
        }}
        onGradeEssay={handleGradeEssay}
      />
    </div>
  );
}
