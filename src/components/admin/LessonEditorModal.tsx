"use client";

import { LessonData } from "./lesson-editor/types";
import { LessonEditorForm } from "./lesson-editor/LessonEditorForm";

export type { LessonData } from "./lesson-editor/types";

interface LessonEditorModalProps {
  lessonId: string;
  isOpen: boolean;
  onClose: () => void;
  onLessonUpdated: (updatedLesson: LessonData) => void;
  onLessonDeleted: (deletedId: string) => void;
}

export function LessonEditorModal({
  lessonId,
  isOpen,
  onClose,
  onLessonUpdated,
  onLessonDeleted,
}: LessonEditorModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans"
      dir="rtl"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] my-auto">
        <LessonEditorForm
          lessonId={lessonId}
          isStandaloneRoute={false}
          onClose={onClose}
          onLessonUpdated={onLessonUpdated}
          onLessonDeleted={onLessonDeleted}
        />
      </div>
    </div>
  );
}
