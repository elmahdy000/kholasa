"use client";

import { useState } from "react";
import { LessonEditorModal } from "./LessonEditorModal";
import { UnitEditorModal } from "./UnitEditorModal";
import { LessonCreateModal } from "./LessonCreateModal";
import type { CurriculumManagerClientProps, System, Unit } from "./curriculum/types";
import { SubjectCard } from "./curriculum/SubjectCard";

export type { CurriculumManagerClientProps, System, Subject, Unit, Lesson } from "./curriculum/types";

export function CurriculumManagerClient({
  initialSystems,
}: CurriculumManagerClientProps) {
  const [systems, setSystems] = useState<System[]>(initialSystems);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modals state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [createLessonContext, setCreateLessonContext] = useState<{
    unitId: string;
    unitTitle: string;
    subjectName: string;
  } | null>(null);

  const [unitModalState, setUnitModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    subjectId: string;
    subjectName: string;
    initialUnit?: any;
  }>({
    isOpen: false,
    mode: "create",
    subjectId: "",
    subjectName: "",
  });

  const toggleExpand = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const handleTogglePublished = async (
    entity: "subject" | "unit" | "lesson",
    id: string,
    currentStatus: boolean
  ) => {
    setTogglingId(id);
    const newStatus = !currentStatus;

    try {
      const res = await fetch("/api/admin/curriculum/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, id, isPublished: newStatus }),
      });

      if (res.ok) {
        setSystems((prev) =>
          prev.map((sys) => ({
            ...sys,
            subjects: sys.subjects.map((sub) => {
              if (entity === "subject" && sub.id === id) {
                return { ...sub, isPublished: newStatus };
              }
              return {
                ...sub,
                units: sub.units.map((u) => {
                  if (entity === "unit" && u.id === id) {
                    return { ...u, isPublished: newStatus };
                  }
                  return {
                    ...u,
                    lessons: u.lessons.map((l) => {
                      if (entity === "lesson" && l.id === id) {
                        return { ...l, isPublished: newStatus };
                      }
                      return l;
                    }),
                  };
                }),
              };
            }),
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  // Lesson Callbacks
  const handleLessonUpdated = (updatedLesson: any) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        subjects: sys.subjects.map((sub) => ({
          ...sub,
          units: sub.units.map((u) => {
            if (u.id === updatedLesson.unitId || u.lessons.some((l) => l.id === updatedLesson.id)) {
              return {
                ...u,
                lessons: u.lessons.map((l) =>
                  l.id === updatedLesson.id
                    ? {
                        ...l,
                        title: updatedLesson.title,
                        order: updatedLesson.order,
                        durationMinutes: updatedLesson.durationMinutes,
                        isPublished: updatedLesson.isPublished,
                      }
                    : l
                ),
              };
            }
            return u;
          }),
        })),
      }))
    );
  };

  const handleLessonDeleted = (deletedId: string) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        subjects: sys.subjects.map((sub) => ({
          ...sub,
          units: sub.units.map((u) => ({
            ...u,
            lessons: u.lessons.filter((l) => l.id !== deletedId),
          })),
        })),
      }))
    );
  };

  const handleLessonCreated = (newLesson: any) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        subjects: sys.subjects.map((sub) => ({
          ...sub,
          units: sub.units.map((u) => {
            if (u.id === newLesson.unitId) {
              return {
                ...u,
                lessons: [
                  ...u.lessons,
                  {
                    id: newLesson.id,
                    title: newLesson.title,
                    order: newLesson.order,
                    durationMinutes: newLesson.durationMinutes,
                    isPublished: newLesson.isPublished,
                    viewsCount: 0,
                  },
                ].sort((a, b) => a.order - b.order),
              };
            }
            return u;
          }),
        })),
      }))
    );

    setExpandedUnits((prev) => ({ ...prev, [newLesson.unitId]: true }));
  };

  // Unit Callbacks
  const handleUnitSaved = (savedUnit: any) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        subjects: sys.subjects.map((sub) => {
          if (unitModalState.mode === "create" && sub.id === unitModalState.subjectId) {
            return {
              ...sub,
              units: [
                ...sub.units,
                {
                  id: savedUnit.id,
                  title: savedUnit.title,
                  description: savedUnit.description,
                  order: savedUnit.order,
                  isPublished: savedUnit.isPublished,
                  lessons: [],
                },
              ].sort((a, b) => a.order - b.order),
            };
          } else if (unitModalState.mode === "edit") {
            return {
              ...sub,
              units: sub.units.map((u) =>
                u.id === savedUnit.id
                  ? {
                      ...u,
                      title: savedUnit.title,
                      description: savedUnit.description,
                      order: savedUnit.order,
                      isPublished: savedUnit.isPublished,
                    }
                  : u
              ),
            };
          }
          return sub;
        }),
      }))
    );
  };

  const handleUnitDeleted = (unitId: string) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        subjects: sys.subjects.map((sub) => ({
          ...sub,
          units: sub.units.filter((u) => u.id !== unitId),
        })),
      }))
    );
  };

  return (
    <div className="space-y-8 font-sans">
      {systems.map((system) => (
        <div key={system.id} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#800020]" />
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
              {system.name}
            </h2>
          </div>

          <div className="space-y-5">
            {system.subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                expandedUnits={expandedUnits}
                togglingId={togglingId}
                onToggleExpand={toggleExpand}
                onOpenCreateUnit={(id, name) =>
                  setUnitModalState({
                    isOpen: true,
                    mode: "create",
                    subjectId: id,
                    subjectName: name,
                  })
                }
                onEditUnit={(u: Unit) =>
                  setUnitModalState({
                    isOpen: true,
                    mode: "edit",
                    subjectId: subject.id,
                    subjectName: subject.name,
                    initialUnit: u,
                  })
                }
                onCreateLesson={setCreateLessonContext}
                onTogglePublished={handleTogglePublished}
                onEditLesson={setEditingLessonId}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Lesson Full Editor Modal */}
      {editingLessonId && (
        <LessonEditorModal
          lessonId={editingLessonId}
          isOpen={!!editingLessonId}
          onClose={() => setEditingLessonId(null)}
          onLessonUpdated={handleLessonUpdated}
          onLessonDeleted={handleLessonDeleted}
        />
      )}

      {/* LessonCreateModal */}
      {createLessonContext && (
        <LessonCreateModal
          isOpen={!!createLessonContext}
          unitId={createLessonContext.unitId}
          unitTitle={createLessonContext.unitTitle}
          subjectName={createLessonContext.subjectName}
          onClose={() => setCreateLessonContext(null)}
          onCreated={handleLessonCreated}
        />
      )}

      {/* UnitEditorModal */}
      {unitModalState.isOpen && (
        <UnitEditorModal
          isOpen={unitModalState.isOpen}
          mode={unitModalState.mode}
          subjectId={unitModalState.subjectId}
          subjectName={unitModalState.subjectName}
          initialUnit={unitModalState.initialUnit}
          onClose={() =>
            setUnitModalState((prev) => ({ ...prev, isOpen: false }))
          }
          onSaved={handleUnitSaved}
          onDeleted={handleUnitDeleted}
        />
      )}
    </div>
  );
}
