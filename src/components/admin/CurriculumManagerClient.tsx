"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  School,
  Layers,
  HeartPulse,
  Cpu,
  Briefcase,
  Palette,
  Plus,
  UploadCloud,
  Edit3,
  Trash2,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Filter,
} from "lucide-react";

import type {
  CurriculumManagerClientProps,
  System,
  Grade,
  AcademicTrack,
  Subject,
  Unit,
  Lesson,
} from "./curriculum/types";
import { SubjectCard } from "./curriculum/SubjectCard";
import { SubjectModal } from "./curriculum/SubjectModal";
import { TrackModal } from "./curriculum/TrackModal";
import { LessonEditorModal } from "./LessonEditorModal";
import { UnitEditorModal } from "./UnitEditorModal";
import { LessonCreateModal } from "./LessonCreateModal";
import { CurriculumBulkImportModal } from "./curriculum/CurriculumBulkImportModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export type { CurriculumManagerClientProps, System, Grade, AcademicTrack, Subject, Unit, Lesson } from "./curriculum/types";

// Helper icon resolver for tracks
function getTrackIcon(code: string) {
  const c = code.toLowerCase();
  if (c.includes("medical") || c.includes("health") || c.includes("طب")) return HeartPulse;
  if (c.includes("engineering") || c.includes("cs") || c.includes("هندس") || c.includes("حاسب")) return Cpu;
  if (c.includes("business") || c.includes("أعمال") || c.includes("ادارة")) return Briefcase;
  if (c.includes("art") || c.includes("فن") || c.includes("آداب")) return Palette;
  return Layers;
}

export function CurriculumManagerClient({ initialSystems }: CurriculumManagerClientProps) {
  const [systems, setSystems] = useState<System[]>(initialSystems);

  // Active Educational System (Defaulting to Egyptian Baccalaureate)
  const activeSystem = systems[0];
  const grades = activeSystem?.grades || [];

  // Step 1: Grade Selection (Default to G10 or first grade)
  const [selectedGradeId, setSelectedGradeId] = useState<string>(
    grades[0]?.id || ""
  );

  // Step 2: School Category Selection ("ARABIC" | "LANGUAGES")
  const [selectedCategory, setSelectedCategory] = useState<"ARABIC" | "LANGUAGES">("ARABIC");

  // Step 3: Academic Track Selection (for G11 only)
  // Can be a trackId, or "ALL" for all subjects in G11
  const [selectedTrackId, setSelectedTrackId] = useState<string>("ALL");

  // Subject view filter in Step 4 ("ALL" | "COMMON" | "TRACK")
  const [subjectFilterTab, setSubjectFilterTab] = useState<"ALL" | "COMMON" | "TRACK">("ALL");

  // Accordion and publish toggling state
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Bulk Import state
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportSubjectId, setBulkImportSubjectId] = useState<string | undefined>();

  // Confirmation dialog state (In-App Dialog, never browser confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant?: "danger" | "warning";
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "danger",
    onConfirm: async () => {},
  });

  // Track Modal state
  const [trackModalState, setTrackModalState] = useState<{
    isOpen: boolean;
    initialTrack?: AcademicTrack | null;
  }>({
    isOpen: false,
    initialTrack: null,
  });

  // Subject Modal state
  const [subjectModalState, setSubjectModalState] = useState<{
    isOpen: boolean;
    initialSubject?: Subject | null;
  }>({
    isOpen: false,
    initialSubject: null,
  });

  // Unit Modal state
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

  // Lesson Modals state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [createLessonContext, setCreateLessonContext] = useState<{
    unitId: string;
    unitTitle: string;
    subjectName: string;
  } | null>(null);

  // Derived current grade
  const selectedGrade = grades.find((g) => g.id === selectedGradeId) || grades[0];
  const isG11 = selectedGrade?.code === "bacc_g11" || selectedGrade?.code === "G11" || selectedGrade?.name?.includes("تانية");

  // Tracks for the active grade
  const activeTracks = selectedGrade?.tracks || [];

  // Filter tracks by categoryScope (if set to "ARABIC" or "LANGUAGES", or "BOTH")
  const eligibleTracks = activeTracks.filter((t) => {
    if (!t.categoryScope || t.categoryScope === "BOTH") return true;
    return t.categoryScope === selectedCategory;
  });

  // Derived subjects for active grade and schoolCategory
  const allGradeSubjects = (selectedGrade?.subjects || []).filter(
    (s) => s.schoolCategory === selectedCategory
  );

  // Filtered subjects based on track selection & tabs
  const filteredSubjects = allGradeSubjects.filter((subject) => {
    if (!isG11) return true; // G10 has no tracks

    // If specific track is selected in Step 3
    if (selectedTrackId !== "ALL") {
      // If filtering tab is "COMMON", only show common
      if (subjectFilterTab === "COMMON") return !subject.trackId;
      // If filtering tab is "TRACK", only show this track
      if (subjectFilterTab === "TRACK") return subject.trackId === selectedTrackId;
      // Tab is "ALL" with a specific track selected: show common + this track specific
      return !subject.trackId || subject.trackId === selectedTrackId;
    }

    // When "ALL" tracks is selected in Step 3:
    if (subjectFilterTab === "COMMON") return !subject.trackId;
    if (subjectFilterTab === "TRACK") return Boolean(subject.trackId);
    return true;
  });

  // Subject options for bulk import modal
  const allSubjectOptions = allGradeSubjects.map((sub) => ({
    id: sub.id,
    name: `${sub.name} (${selectedCategory === "LANGUAGES" ? "لغات" : "عربي"})`,
  }));

  const toggleExpand = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  // Toggle publish handler
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
            grades: sys.grades.map((g) => ({
              ...g,
              subjects: g.subjects.map((sub) => {
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
            })),
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  // Track Save callback (Create or Edit)
  const handleTrackSaved = (savedTrack: AcademicTrack) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        grades: sys.grades.map((g) => {
          if (g.id === selectedGradeId) {
            const exists = g.tracks.some((t) => t.id === savedTrack.id);
            const updatedTracks = exists
              ? g.tracks.map((t) => (t.id === savedTrack.id ? savedTrack : t))
              : [...g.tracks, savedTrack];
            return {
              ...g,
              tracks: updatedTracks.sort((a, b) => a.order - b.order),
            };
          }
          return g;
        }),
      }))
    );
  };

  // Track Delete Action (Guarded with ConfirmModal)
  const handleDirectDeleteTrack = (trackId: string, trackName: string) => {
    // Check if any subject is attached locally
    const trackSubjects = allGradeSubjects.filter((s) => s.trackId === trackId);
    if (trackSubjects.length > 0) {
      setConfirmModal({
        isOpen: true,
        title: "تعذر حذف المسار الأكاديمي",
        description: `لا يمكن حذف مسار "${trackName}" لوجود (${trackSubjects.length}) مادة دراسية تخصصية مرتبطة به. يرجى نقل المواد أو حذفها أولاً.`,
        variant: "warning",
        onConfirm: async () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "تأكيد حذف المسار الأكاديمي",
      description: `هل أنت متأكد من حذف مسار "${trackName}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/structure?type=track&id=${trackId}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "فشل حذف المسار");

          setSystems((prev) =>
            prev.map((sys) => ({
              ...sys,
              grades: sys.grades.map((g) => ({
                ...g,
                tracks: g.tracks.filter((t) => t.id !== trackId),
              })),
            }))
          );

          if (selectedTrackId === trackId) {
            setSelectedTrackId("ALL");
          }
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error("Delete track failed:", err);
          throw err;
        }
      },
    });
  };

  // Subject Save callback (Create or Edit)
  const handleSubjectSaved = (savedSubject: Subject) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        grades: sys.grades.map((g) => {
          if (g.id === savedSubject.gradeId) {
            const exists = g.subjects.some((s) => s.id === savedSubject.id);
            const updatedSubjects = exists
              ? g.subjects.map((s) => (s.id === savedSubject.id ? { ...s, ...savedSubject } : s))
              : [...g.subjects, savedSubject];
            return {
              ...g,
              subjects: updatedSubjects.sort((a, b) => a.order - b.order),
            };
          }
          return g;
        }),
      }))
    );
  };

  // Subject Delete Action (Guarded with ConfirmModal)
  const handleDirectDeleteSubject = (subjectId: string, subjectName: string) => {
    setConfirmModal({
      isOpen: true,
      title: "حذف المادة الدراسية",
      description: `هل أنت متأكد من حذف مادة "${subjectName}" وجميع وحداتها ودروسها ومحتواها؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/structure?type=subject&id=${subjectId}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "فشل حذف المادة الدراسية");

          setSystems((prev) =>
            prev.map((sys) => ({
              ...sys,
              grades: sys.grades.map((g) => ({
                ...g,
                subjects: g.subjects.filter((s) => s.id !== subjectId),
              })),
            }))
          );
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error("Delete subject failed:", err);
          throw err;
        }
      },
    });
  };

  // Unit and Lesson Callbacks
  const handleUnitSaved = (savedUnit: any) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        grades: sys.grades.map((g) => ({
          ...g,
          subjects: g.subjects.map((sub) => {
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
        })),
      }))
    );
  };

  const handleUnitDeleted = (unitId: string) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        grades: sys.grades.map((g) => ({
          ...g,
          subjects: g.subjects.map((sub) => ({
            ...sub,
            units: sub.units.filter((u) => u.id !== unitId),
          })),
        })),
      }))
    );
  };

  const handleDirectDeleteUnit = (unitId: string, unitTitle: string) => {
    setConfirmModal({
      isOpen: true,
      title: "حذف الوحدة الدراسية",
      description: `هل أنت متأكد من حذف الوحدة "${unitTitle}" وجميع دروسها ومحتوياتها؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/units/${unitId}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "فشل حذف الوحدة");

          handleUnitDeleted(unitId);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error("Delete unit failed:", err);
          throw err;
        }
      },
    });
  };

  const handleLessonCreated = (newLesson: any) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        grades: sys.grades.map((g) => ({
          ...g,
          subjects: g.subjects.map((sub) => ({
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
        })),
      }))
    );

    setExpandedUnits((prev) => ({ ...prev, [newLesson.unitId]: true }));
  };

  const handleLessonUpdated = (updatedLesson: any) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        grades: sys.grades.map((g) => ({
          ...g,
          subjects: g.subjects.map((sub) => ({
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
        })),
      }))
    );
  };

  const handleLessonDeleted = (deletedId: string) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        grades: sys.grades.map((g) => ({
          ...g,
          subjects: g.subjects.map((sub) => ({
            ...sub,
            units: sub.units.map((u) => ({
              ...u,
              lessons: u.lessons.filter((l) => l.id !== deletedId),
            })),
          })),
        })),
      }))
    );
  };

  const handleDirectDeleteLesson = (lessonId: string, lessonTitle: string) => {
    setConfirmModal({
      isOpen: true,
      title: "حذف الدرس",
      description: `هل أنت متأكد من حذف الدرس "${lessonTitle}" وجميع محتوياته؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "فشل حذف الدرس");

          handleLessonDeleted(lessonId);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error("Delete lesson failed:", err);
          throw err;
        }
      },
    });
  };

  const handleBulkImportSuccess = (targetSubjectId: string, createdUnits: any[]) => {
    setSystems((prev) =>
      prev.map((sys) => ({
        ...sys,
        grades: sys.grades.map((g) => ({
          ...g,
          subjects: g.subjects.map((sub) => {
            if (sub.id === targetSubjectId) {
              return {
                ...sub,
                units: [...sub.units, ...createdUnits].sort((a, b) => a.order - b.order),
              };
            }
            return sub;
          }),
        })),
      }))
    );
  };

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* ─────────────────────────────────────────────────────────────
          TOP ACTION BAR (Quick summary & Actions)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#800020] animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
              هيكل المناهج والمقررات
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] border border-[#800020]/20">
              البكالوريا المصرية
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            اختر الصف ونوع المدرسة للوصول الفوري للمواد، الوحدات، والدروس المعتمدة
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setBulkImportSubjectId(undefined);
              setIsBulkImportOpen(true);
            }}
            className="h-10 px-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <UploadCloud className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
            <span>استيراد هيكل المنهج</span>
          </button>

          <button
            type="button"
            onClick={() => setSubjectModalState({ isOpen: true, initialSubject: null })}
            className="h-10 px-4 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ إضافة مادة جديدة</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          UNIFIED COMPACT CONTROL BAR (Grade, Category, Tracks)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-4 sm:p-5 shadow-xs space-y-4">
        {/* Row 1: Grade & School Category Segmented Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Grade Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#475569] dark:text-[#94A3B8] flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
                <span>الصف الدراسي</span>
              </label>
            </div>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]/60 gap-1">
              {grades.map((grade) => {
                const isSelected = selectedGradeId === grade.id;
                const isGrade10 = grade.code === "bacc_g10" || grade.code === "G10" || grade.name.includes("أولى");
                const count = grade.subjects.filter((s) => s.schoolCategory === selectedCategory).length;

                return (
                  <button
                    key={grade.id}
                    type="button"
                    onClick={() => {
                      setSelectedGradeId(grade.id);
                      setSelectedTrackId("ALL");
                      setSubjectFilterTab("ALL");
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-[#800020] text-white shadow-xs"
                        : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                    }`}
                  >
                    <span>{isGrade10 ? "أولى بكالوريا (G10)" : "تانية بكالوريا (G11)"}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-black/5 dark:bg-white/5 text-[#64748B] dark:text-[#94A3B8]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* School Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#475569] dark:text-[#94A3B8] flex items-center gap-1.5">
                <School className="w-4 h-4 text-[#800020] dark:text-[#FB7185]" />
                <span>نوع المدرسة واللغة</span>
              </label>
              <span className="text-[11px] font-bold text-[#800020] dark:text-[#FB7185]">
                عزل تام للمحتوى
              </span>
            </div>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]/60 gap-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("ARABIC")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedCategory === "ARABIC"
                    ? "bg-[#800020] text-white shadow-xs"
                    : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                <span>مدارس عربي (Arabic)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory("LANGUAGES")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedCategory === "LANGUAGES"
                    ? "bg-[#800020] text-white shadow-xs"
                    : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                <span>مدارس لغات (Languages)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Tracks Row (G11 ONLY) */}
        {isG11 && (
          <div className="pt-3 border-t border-[#F1F5F9] dark:border-[#1E293B] space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] dark:text-white">
                <Layers className="w-3.5 h-3.5 text-[#800020] dark:text-[#FB7185]" />
                <span>المسار التخصصي (تانية بكالوريا):</span>
              </div>

              {/* Add Track Button */}
              <button
                type="button"
                onClick={() => setTrackModalState({ isOpen: true, initialTrack: null })}
                className="text-[11px] font-bold text-[#800020] dark:text-[#FB7185] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>إضافة مسار جديد</span>
              </button>
            </div>

            {/* Track Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* All Tracks Pill */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTrackId("ALL");
                  setSubjectFilterTab("ALL");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedTrackId === "ALL"
                    ? "bg-[#800020] text-white shadow-2xs"
                    : "bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#E2E8F0] dark:hover:bg-[#334155]"
                }`}
              >
                <span>كافة المسارات</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedTrackId === "ALL" ? "bg-white/20 text-white" : "bg-black/5 dark:bg-white/10"
                  }`}
                >
                  {allGradeSubjects.length}
                </span>
              </button>

              {/* Individual Track Pills */}
              {eligibleTracks.map((track) => {
                const isSelected = selectedTrackId === track.id;
                const trackSubjectCount = allGradeSubjects.filter((s) => s.trackId === track.id).length;
                const TrackIcon = getTrackIcon(track.code);

                return (
                  <div
                    key={track.id}
                    className={`group inline-flex items-center rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-[#800020] text-white border-[#800020] shadow-2xs"
                        : "bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-transparent hover:border-[#CBD5E1] dark:hover:border-[#475569]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrackId(track.id);
                        setSubjectFilterTab("TRACK");
                      }}
                      className="px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
                    >
                      <TrackIcon className="w-3.5 h-3.5" />
                      <span>{track.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? "bg-white/20 text-white" : "bg-black/5 dark:bg-white/10"
                        }`}
                      >
                        {trackSubjectCount}
                      </span>
                    </button>

                    {/* Quick edit / delete track actions */}
                    <div className="flex items-center pl-1.5 pr-0.5 gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrackModalState({ isOpen: true, initialTrack: track });
                        }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isSelected
                            ? "hover:bg-white/20 text-white"
                            : "hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#64748B]"
                        }`}
                        title="تعديل المسار"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectDeleteTrack(track.id, track.name);
                        }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isSelected
                            ? "hover:bg-red-500/30 text-white"
                            : "hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500"
                        }`}
                        title="حذف المسار"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUBJECTS & CURRICULUM SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
              المواد الدراسية ومحتوى المنهج
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#FB7185]">
              {filteredSubjects.length} مادة
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span className="font-bold text-[#0F172A] dark:text-white">المعروض حالياً:</span>
            <span>{selectedGrade?.name}</span>
            <span>•</span>
            <span>{selectedCategory === "LANGUAGES" ? "مدارس لغات" : "مدارس عربي"}</span>
            {isG11 && selectedTrackId !== "ALL" && (
              <>
                <span>•</span>
                <span className="font-bold text-[#800020] dark:text-[#FB7185]">
                  {eligibleTracks.find((t) => t.id === selectedTrackId)?.name || "مسار محدد"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Filter Tabs for G11 (Track Specific / Common / All) */}
        {isG11 && (
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] w-fit flex-wrap">
            {selectedTrackId !== "ALL" ? (
              <>
                <button
                  type="button"
                  onClick={() => setSubjectFilterTab("TRACK")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    subjectFilterTab === "TRACK"
                      ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-[#FB7185] shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  مواد المسار ({allGradeSubjects.filter((s) => s.trackId === selectedTrackId).length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilterTab("COMMON")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    subjectFilterTab === "COMMON"
                      ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-[#FB7185] shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  المواد العامة المشتركة ({allGradeSubjects.filter((s) => !s.trackId).length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilterTab("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    subjectFilterTab === "ALL"
                      ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-[#FB7185] shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  الكل (المسار + العامة) ({allGradeSubjects.filter((s) => !s.trackId || s.trackId === selectedTrackId).length})
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSubjectFilterTab("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    subjectFilterTab === "ALL"
                      ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-[#FB7185] shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  جميع المواد ({allGradeSubjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilterTab("COMMON")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    subjectFilterTab === "COMMON"
                      ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-[#FB7185] shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  المواد العامة المشتركة ({allGradeSubjects.filter((s) => !s.trackId).length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilterTab("TRACK")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    subjectFilterTab === "TRACK"
                      ? "bg-white dark:bg-[#0F172A] text-[#800020] dark:text-[#FB7185] shadow-xs"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  كافة المواد التخصصية ({allGradeSubjects.filter((s) => Boolean(s.trackId)).length})
                </button>
              </>
            )}
          </div>
        )}

        {/* Subjects List */}
        <div className="space-y-5">
          {filteredSubjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#800020]/10 text-[#800020] dark:text-[#FB7185] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#0F172A] dark:text-white">
                لا توجد مواد دراسية مسجلة في هذا القسم بعد
              </h4>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto">
                اضغط على زر "+ إضافة مادة جديدة" لإضافة المواد التخصصية أو المشتركة وتجهيز الوحدات والدروس.
              </p>
              <button
                type="button"
                onClick={() => setSubjectModalState({ isOpen: true, initialSubject: null })}
                className="h-10 px-5 rounded-xl bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة أول مادة دراسية</span>
              </button>
            </div>
          ) : (
            filteredSubjects.map((subject) => {
              const track = activeTracks.find((t) => t.id === subject.trackId);
              return (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  trackName={track?.name}
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
                  onOpenBulkImport={(id) => {
                    setBulkImportSubjectId(id);
                    setIsBulkImportOpen(true);
                  }}
                  onEditSubject={(sub) =>
                    setSubjectModalState({
                      isOpen: true,
                      initialSubject: sub,
                    })
                  }
                  onDeleteSubject={handleDirectDeleteSubject}
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
                  onDeleteUnit={handleDirectDeleteUnit}
                  onDeleteLesson={handleDirectDeleteLesson}
                />
              );
            })
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MODALS & OVERLAYS
      ───────────────────────────────────────────────────────────── */}

      {/* Track Create / Edit Modal */}
      {trackModalState.isOpen && (
        <TrackModal
          isOpen={trackModalState.isOpen}
          gradeId={selectedGradeId}
          gradeName={selectedGrade?.name}
          initialTrack={trackModalState.initialTrack}
          onClose={() => setTrackModalState({ isOpen: false, initialTrack: null })}
          onSaved={handleTrackSaved}
        />
      )}

      {/* Subject Create / Edit Modal */}
      {subjectModalState.isOpen && (
        <SubjectModal
          isOpen={subjectModalState.isOpen}
          systemId={activeSystem.id}
          gradeId={selectedGradeId}
          gradeName={selectedGrade?.name}
          gradeCode={selectedGrade?.code}
          schoolCategory={selectedCategory}
          selectedTrackId={selectedTrackId !== "ALL" ? selectedTrackId : undefined}
          tracks={activeTracks}
          initialSubject={subjectModalState.initialSubject}
          onClose={() => setSubjectModalState({ isOpen: false, initialSubject: null })}
          onSaved={handleSubjectSaved}
        />
      )}

      {/* Bulk Import Modal */}
      {isBulkImportOpen && (
        <CurriculumBulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
          subjects={allSubjectOptions}
          initialSubjectId={bulkImportSubjectId}
          onSuccess={handleBulkImportSuccess}
        />
      )}

      {/* Unit Editor Modal */}
      {unitModalState.isOpen && (
        <UnitEditorModal
          isOpen={unitModalState.isOpen}
          mode={unitModalState.mode}
          subjectId={unitModalState.subjectId}
          subjectName={unitModalState.subjectName}
          initialUnit={unitModalState.initialUnit}
          onClose={() => setUnitModalState((prev) => ({ ...prev, isOpen: false }))}
          onSaved={handleUnitSaved}
          onDeleted={handleUnitDeleted}
        />
      )}

      {/* Lesson Create Modal */}
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

      {/* Confirmation Dialog (In-App Dialog, never browser confirm) */}
      <ConfirmModal
        open={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        confirmText="تأكيد التنفيذ"
        cancelText="إلغاء"
        variant={confirmModal.variant || "danger"}
      />
    </div>
  );
}
