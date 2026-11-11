"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { LessonData } from "./lesson-editor/types";
import { LessonEditorForm } from "./lesson-editor/LessonEditorForm";
import { ArabicLessonEditorForm } from "./arabic-lesson-editor/ArabicLessonEditorForm";

export interface LessonEditorModalProps {
  lessonId: string;
  isOpen: boolean;
  isArabicGuided?: boolean;
  onClose: () => void;
  onLessonUpdated?: (updatedLesson: LessonData) => void;
  onLessonDeleted?: (deletedId: string) => void;
}

export function LessonEditorModal({
  lessonId,
  isOpen,
  isArabicGuided,
  onClose,
  onLessonUpdated,
  onLessonDeleted,
}: LessonEditorModalProps) {
  const [fetchedArabicState, setFetchedArabicState] = useState<{
    lessonId: string;
    isArabic: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || typeof isArabicGuided === "boolean") return;

    let cancelled = false;
    fetch(`/api/admin/lessons/${lessonId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          setFetchedArabicState({
            lessonId,
            isArabic: data?.unit?.subject?.learningEngine === "ARABIC_GUIDED",
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchedArabicState({ lessonId, isArabic: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, lessonId, isArabicGuided]);

  if (!isOpen) return null;

  const resolvedArabic =
    typeof isArabicGuided === "boolean"
      ? isArabicGuided
      : fetchedArabicState?.lessonId === lessonId
        ? fetchedArabicState.isArabic
        : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans"
      dir="rtl"
    >
      <div className={`relative w-full ${resolvedArabic ? "max-w-5xl" : "max-w-4xl"} max-h-[92vh] my-auto`}>
        {resolvedArabic === null ? (
          <div className="p-10 rounded-2xl bg-white dark:bg-[#0D214D] flex items-center justify-center gap-2 text-xs font-bold">
            <Loader2 className="w-5 h-5 animate-spin text-[#800B34]" />
            <span>جاري تحديد محرر المادة...</span>
          </div>
        ) : resolvedArabic ? (
          <ArabicLessonEditorForm
            lessonId={lessonId}
            isStandaloneRoute={false}
            onClose={onClose}
            onLessonUpdated={onLessonUpdated}
          />
        ) : (
          <LessonEditorForm
            lessonId={lessonId}
            isStandaloneRoute={false}
            onClose={onClose}
            onLessonUpdated={onLessonUpdated}
            onLessonDeleted={onLessonDeleted}
          />
        )}
      </div>
    </div>
  );
}
