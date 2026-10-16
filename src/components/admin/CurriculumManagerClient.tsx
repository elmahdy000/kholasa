"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Layers,
  Play,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  Plus,
  Settings2,
  Trash2,
  Edit,
  ExternalLink,
  Video,
  Headphones,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { LessonEditorModal } from "./LessonEditorModal";
import { UnitEditorModal } from "./UnitEditorModal";
import { LessonCreateModal } from "./LessonCreateModal";

interface Lesson {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  isPublished: boolean;
  viewsCount: number;
}

interface Unit {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  isPublished: boolean;
  lessons: Lesson[];
}

interface Subject {
  id: string;
  name: string;
  color?: string | null;
  isPublished: boolean;
  units: Unit[];
}

interface System {
  id: string;
  name: string;
  subjects: Subject[];
}

interface CurriculumManagerClientProps {
  initialSystems: System[];
}

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

    // Expand unit so the user sees the new lesson
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
            <span className="w-3 h-3 rounded-full bg-[#4F46E5]" />
            <h2 className="text-base sm:text-lg font-black text-[#14243D] dark:text-white">
              {system.name}
            </h2>
          </div>

          <div className="space-y-5">
            {system.subjects.map((subject) => (
              <div
                key={subject.id}
                className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden"
              >
                {/* Subject Header */}
                <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: subject.color || "#4F46E5" }}
                    />
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-[#14243D] dark:text-white">
                        {subject.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-bold">
                        {subject.units.length} وحدات •{" "}
                        {subject.units.reduce(
                          (acc, u) => acc + u.lessons.length,
                          0
                        )}{" "}
                        درساً
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() =>
                        setUnitModalState({
                          isOpen: true,
                          mode: "create",
                          subjectId: subject.id,
                          subjectName: subject.name,
                        })
                      }
                      className="h-8 px-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة وحدة</span>
                    </button>

                    <button
                      onClick={() =>
                        handleTogglePublished(
                          "subject",
                          subject.id,
                          subject.isPublished
                        )
                      }
                      disabled={togglingId === subject.id}
                      className={`h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        subject.isPublished
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-200 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400"
                      }`}
                    >
                      {subject.isPublished ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>منشور للطلاب</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>مسودة (مخفي)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Units List */}
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {subject.units.length === 0 ? (
                    <div className="p-8 text-center text-xs font-bold text-slate-400">
                      لا توجد وحدات في هذه المادة بعد. اضغط "إضافة وحدة" للبدء.
                    </div>
                  ) : (
                    subject.units.map((unit) => {
                      const isExpanded = expandedUnits[unit.id] ?? true;

                      return (
                        <div key={unit.id} className="p-4 sm:p-5 space-y-3">
                          {/* Unit Title and Actions Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleExpand(unit.id)}
                                className="flex items-center gap-2 text-right font-black text-xs sm:text-sm text-[#14243D] dark:text-white hover:text-[#4F46E5] transition-colors"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 text-slate-400 transition-transform ${
                                    !isExpanded ? "-rotate-90" : ""
                                  }`}
                                />
                                <span>{unit.title}</span>
                                <span className="text-[11px] font-bold text-slate-400">
                                  ({unit.lessons.length} دروس)
                                </span>
                              </button>

                              <button
                                onClick={() =>
                                  setUnitModalState({
                                    isOpen: true,
                                    mode: "edit",
                                    subjectId: subject.id,
                                    subjectName: subject.name,
                                    initialUnit: unit,
                                  })
                                }
                                className="p-1 rounded-md text-slate-400 hover:text-[#4F46E5] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                title="تعديل بيانات الوحدة"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                              <button
                                onClick={() =>
                                  setCreateLessonContext({
                                    unitId: unit.id,
                                    unitTitle: unit.title,
                                    subjectName: subject.name,
                                  })
                                }
                                className="h-7 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-[#4F46E5] dark:text-indigo-300 text-[11px] font-black flex items-center gap-1 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                <span>إضافة درس</span>
                              </button>

                              <Link
                                href={`/admin/questions/import?subjectId=${subject.id}&unitId=${unit.id}`}
                                className="h-7 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1 transition-colors border border-blue-200/50 dark:border-blue-800/50"
                                title="استيراد أو إضافة أسئلة وورد لهذه الوحدة"
                              >
                                <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span>أسئلة الوحدة</span>
                              </Link>

                              <button
                                onClick={() =>
                                  handleTogglePublished(
                                    "unit",
                                    unit.id,
                                    unit.isPublished
                                  )
                                }
                                disabled={togglingId === unit.id}
                                className={`h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                                  unit.isPublished
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {unit.isPublished ? "الوحدة منشورة" : "الوحدة مخفية"}
                              </button>
                            </div>
                          </div>

                          {/* Lessons Accordion Content */}
                          {isExpanded && (
                            <div className="pr-4 sm:pr-6 space-y-2 pt-1">
                              {unit.lessons.length === 0 ? (
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 text-center">
                                  <span className="text-xs font-bold text-slate-400 block mb-2">
                                    لا توجد دروس في هذه الوحدة بعد
                                  </span>
                                  <button
                                    onClick={() =>
                                      setCreateLessonContext({
                                        unitId: unit.id,
                                        unitTitle: unit.title,
                                        subjectName: subject.name,
                                      })
                                    }
                                    className="h-8 px-3 rounded-lg bg-[#4F46E5] text-white text-xs font-black inline-flex items-center gap-1.5"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>إضافة أول درس بالوحدة</span>
                                  </button>
                                </div>
                              ) : (
                                unit.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="p-3 sm:p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center shrink-0">
                                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-black text-[#14243D] dark:text-white">
                                            {lesson.title}
                                          </span>
                                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400">
                                            #{lesson.order}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                          <span>{lesson.durationMinutes} دقيقة</span>
                                          <span>•</span>
                                          <span>{lesson.viewsCount} مشاهدة</span>
                                        </span>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                                      <button
                                        onClick={() =>
                                          setEditingLessonId(lesson.id)
                                        }
                                        className="h-7 px-2.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[11px] font-black flex items-center gap-1 shadow-2xs transition-transform active:scale-95"
                                      >
                                        <Settings2 className="w-3 h-3" />
                                        <span>إدارة المحتوى والوسائط</span>
                                      </button>

                                      <Link
                                        href={`/admin/questions/import?subjectId=${subject.id}&unitId=${unit.id}&lessonId=${lesson.id}`}
                                        className="h-7 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1 transition-colors border border-blue-200/50 dark:border-blue-800/50"
                                        title="استيراد أو ربط أسئلة وورد بهذا الدرس"
                                      >
                                        <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                        <span>أسئلة الدرس</span>
                                      </Link>

                                      <Link
                                        href={`/lessons/${lesson.id}`}
                                        className="h-7 px-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-900 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                        target="_blank"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>معاينة</span>
                                      </Link>

                                      <button
                                        onClick={() =>
                                          handleTogglePublished(
                                            "lesson",
                                            lesson.id,
                                            lesson.isPublished
                                          )
                                        }
                                        disabled={togglingId === lesson.id}
                                        className={`h-7 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                                          lesson.isPublished
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : "bg-slate-200 text-slate-500 dark:bg-zinc-900 dark:text-zinc-400"
                                        }`}
                                      >
                                        {lesson.isPublished ? "منشور" : "مخفي"}
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
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
