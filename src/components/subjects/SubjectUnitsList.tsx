"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  RotateCcw,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaywallModal } from "@/components/student/subscription/PaywallModal";
import { LessonCard, type LessonCardItem } from "./LessonCard";
import type { LessonSortOrder, SubjectViewMode } from "./lesson-helpers";

const VIEW_MODE_STORAGE_KEY = "kholasa_subject_view_mode";
const VIEW_MODE_EVENT = "kholasa:subject-view-mode";

function subscribeViewMode(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(VIEW_MODE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(VIEW_MODE_EVENT, callback);
  };
}

function getStoredViewMode(): SubjectViewMode {
  try {
    const val = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return val === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

function persistViewMode(mode: SubjectViewMode): void {
  try {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    window.dispatchEvent(new Event(VIEW_MODE_EVENT));
  } catch {
    // Ignore storage restrictions in private mode.
  }
}

export interface SubjectLessonData {
  id: string;
  title: string;
  order: number;
  durationMinutes: number | null;
  isTrial?: boolean | null;
  summary?: { id: string } | null;
  questions: { questionId: string }[];
}

export interface SubjectUnitData {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: SubjectLessonData[];
}

export interface SubjectUnitsListProps {
  subjectId: string;
  units: SubjectUnitData[];
  completedLessonIds: string[];
  lessonProgressById?: Record<string, { isCompleted: boolean; progressPercent: number }>;
  masteredQuestionIds: string[];
  isSubscriptionActive: boolean;
  isSubjectUnderConstruction?: boolean;
  user?: {
    name?: string | null;
    loginCode?: string | null;
    phone?: string | null;
  } | null;
}

export function SubjectUnitsList({
  subjectId,
  units,
  completedLessonIds,
  lessonProgressById = {},
  masteredQuestionIds,
  isSubscriptionActive,
  isSubjectUnderConstruction = false,
  user,
}: SubjectUnitsListProps) {
  const viewMode = useSyncExternalStore<SubjectViewMode>(
    subscribeViewMode,
    getStoredViewMode,
    () => "grid"
  );

  const [selectedUnitId, setSelectedUnitId] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<LessonSortOrder>("curriculum_asc");
  const [lockedModal, setLockedModal] = useState<{
    lessonTitle: string;
    unitTitle: string;
  } | null>(null);

  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);
  const masteredSet = useMemo(() => new Set(masteredQuestionIds), [masteredQuestionIds]);

  // Build flat curriculum-ordered lesson list with continuous 1-based numbering across DB units
  const allLessons = useMemo<LessonCardItem[]>(() => {
    const items: LessonCardItem[] = [];
    let curriculumCounter = 0;

    units.forEach((unit, unitIndex) => {
      const displayUnitOrder = unitIndex + 1;
      unit.lessons.forEach((lesson) => {
        curriculumCounter += 1;
        const progressRecord = lessonProgressById[lesson.id];
        const isCompleted = Boolean(
          progressRecord?.isCompleted || completedSet.has(lesson.id)
        );
        const progressPercent = isCompleted
          ? 100
          : (progressRecord?.progressPercent ?? 0);

        const isFreeTrialLesson =
          Boolean(lesson.isTrial) || (unit.order === 1 && lesson.order === 1);
        const isLocked = !isSubscriptionActive && !isFreeTrialLesson;

        const lessonQuestionIds = lesson.questions.map((q) => q.questionId);
        const masteredQuestionsCount = lessonQuestionIds.filter((qid) =>
          masteredSet.has(qid)
        ).length;

        items.push({
          id: lesson.id,
          title: lesson.title,
          order: lesson.order,
          curriculumIndex: curriculumCounter,
          durationMinutes: lesson.durationMinutes,
          unitId: unit.id,
          unitTitle: unit.title,
          unitOrder: displayUnitOrder,
          isLocked,
          isCompleted,
          progressPercent,
          hasSummary: Boolean(lesson.summary),
          questionsCount: lessonQuestionIds.length,
          masteredQuestionsCount,
        });
      });
    });

    return items;
  }, [units, lessonProgressById, completedSet, isSubscriptionActive, masteredSet]);

  const activeUnit = useMemo(
    () => (selectedUnitId === "ALL" ? null : units.find((u) => u.id === selectedUnitId) || null),
    [selectedUnitId, units]
  );

  const visibleLessons = useMemo(() => {
    const filtered =
      selectedUnitId === "ALL"
        ? allLessons
        : allLessons.filter((item) => item.unitId === selectedUnitId);

    if (sortOrder === "curriculum_desc") {
      return [...filtered].reverse();
    }
    return filtered;
  }, [allLessons, selectedUnitId, sortOrder]);

  const visibleUnitsForList = useMemo(() => {
    const scopedUnits =
      selectedUnitId === "ALL" ? units : units.filter((u) => u.id === selectedUnitId);
    if (sortOrder === "curriculum_desc") {
      return [...scopedUnits].reverse();
    }
    return scopedUnits;
  }, [units, selectedUnitId, sortOrder]);

  const lessonsByUnitMap = useMemo(() => {
    const map = new Map<string, LessonCardItem[]>();
    for (const item of allLessons) {
      const list = map.get(item.unitId) ?? [];
      list.push(item);
      map.set(item.unitId, list);
    }
    if (sortOrder === "curriculum_desc") {
      for (const [key, list] of map.entries()) {
        map.set(key, [...list].reverse());
      }
    }
    return map;
  }, [allLessons, sortOrder]);

  const handleOpenLocked = (lesson: LessonCardItem) => {
    setLockedModal({
      lessonTitle: lesson.title,
      unitTitle: lesson.unitTitle,
    });
  };

  if (units.length === 0 || allLessons.length === 0) {
    return (
      <div className="p-8 sm:p-10 text-center rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#DFE6F0] dark:border-[#1E3352] space-y-3">
        <div className="w-12 h-12 rounded-xl bg-[#FDF2F4] dark:bg-[#830D3C]/20 text-[#830D3C] dark:text-[#FDA4AF] flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-[#0B1D42] dark:text-white">
          لا توجد دروس منشورة في هذه المادة حالياً
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
          جاري مراجعة وتجهيز وحدات ودروس هذه المادة في لوحة المنهج، وستظهر هنا فور نشرها.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Segmented View Mode Switcher: Grid (default) vs List */}
        <div className="flex justify-center">
          <div
            role="tablist"
            aria-label="طريقة عرض الدروس"
            className="w-full max-w-[440px] grid grid-cols-2 p-1 rounded-full bg-white dark:bg-[#0F1E36] border border-[#DFE6F0] dark:border-[#1E3352] shadow-[0_2px_8px_rgba(11,29,66,0.04)]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "grid"}
              onClick={() => persistViewMode("grid")}
              className={cn(
                "min-h-[44px] px-3 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#830D3C]",
                viewMode === "grid"
                  ? "bg-[#830D3C] text-white shadow-xs"
                  : "text-[#0B1D42] dark:text-[#CBD5E1] hover:bg-[#F5F7FB] dark:hover:bg-[#142747]"
              )}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span>عرض بالبطاقات</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "list"}
              onClick={() => persistViewMode("list")}
              className={cn(
                "min-h-[44px] px-3 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#830D3C]",
                viewMode === "list"
                  ? "bg-[#830D3C] text-white shadow-xs"
                  : "text-[#0B1D42] dark:text-[#CBD5E1] hover:bg-[#F5F7FB] dark:hover:bg-[#142747]"
              )}
            >
              <ListIcon className="w-4 h-4 shrink-0" />
              <span>عرض بالقائمة</span>
            </button>
          </div>
        </div>

        {/* Compact Unit Filter & Order Controls */}
        <div
          aria-label="تصفية وترتيب الدروس"
          className="flex flex-wrap items-center justify-between gap-2.5"
        >
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            {/* All Units Pill */}
            <button
              type="button"
              onClick={() => setSelectedUnitId("ALL")}
              aria-pressed={selectedUnitId === "ALL"}
              className={cn(
                "min-h-[44px] px-4 sm:px-5 rounded-full text-xs sm:text-sm font-bold transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#830D3C]",
                selectedUnitId === "ALL"
                  ? "bg-[#830D3C] text-white shadow-xs"
                  : "bg-white dark:bg-[#0F1E36] text-[#0B1D42] dark:text-[#CBD5E1] border border-[#DFE6F0] dark:border-[#1E3352] hover:border-[#830D3C]/40"
              )}
            >
              الكل ({allLessons.length})
            </button>

            {/* Individual Units Select (uses exact DB unit IDs & titles) */}
            {units.length > 1 && (
              <div className="relative min-w-0 max-w-full flex-1 sm:flex-initial sm:min-w-[230px]">
                <label htmlFor="subject-unit-filter" className="sr-only">
                  تصفية حسب الوحدة
                </label>
                <select
                  id="subject-unit-filter"
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  aria-label="اختيار الوحدة"
                  className={cn(
                    "w-full min-h-[44px] appearance-none rounded-full bg-white dark:bg-[#0F1E36] border pr-4 pl-9 py-2 text-xs sm:text-sm font-bold text-[#0B1D42] dark:text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#830D3C]",
                    selectedUnitId !== "ALL"
                      ? "border-[#830D3C] ring-1 ring-[#830D3C]/20"
                      : "border-[#DFE6F0] dark:border-[#1E3352] hover:border-[#830D3C]/40"
                  )}
                >
                  <option value="ALL">كل الوحدات ({units.length})</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.title} ({unit.lessons.length})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="w-4 h-4 text-[#64748B] pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                />
              </div>
            )}
          </div>

          {/* Curriculum Order Toggle */}
          <button
            type="button"
            onClick={() =>
              setSortOrder((prev) =>
                prev === "curriculum_asc" ? "curriculum_desc" : "curriculum_asc"
              )
            }
            aria-pressed={sortOrder === "curriculum_desc"}
            title={
              sortOrder === "curriculum_asc"
                ? "الترتيب الحالي: حسب خطة المنهج"
                : "الترتيب الحالي: عكس ترتيب المنهج"
            }
            className={cn(
              "min-h-[44px] px-4 rounded-full text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer border focus-visible:outline-2 focus-visible:outline-[#830D3C]",
              sortOrder === "curriculum_desc"
                ? "bg-[#0B1D42] text-white border-[#0B1D42]"
                : "bg-white dark:bg-[#0F1E36] text-[#0B1D42] dark:text-[#CBD5E1] border-[#DFE6F0] dark:border-[#1E3352] hover:border-[#830D3C]/40"
            )}
          >
            <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
            <span>{sortOrder === "curriculum_desc" ? "الأخير أولاً" : "ترتيب"}</span>
          </button>
        </div>

        {/* Selected Unit Context Strip (in Grid View when a specific unit is filtered) */}
        {activeUnit && viewMode === "grid" && (
          <div className="rounded-xl bg-white dark:bg-[#0F1E36] border border-[#DFE6F0] dark:border-[#1E3352] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-sm sm:text-base font-bold text-[#0B1D42] dark:text-white leading-snug break-words">
                {activeUnit.title}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
                {activeUnit.lessons.filter((l) => completedSet.has(l.id)).length} من{" "}
                {activeUnit.lessons.length} دروس مكتملة
              </p>
            </div>

            {!isSubjectUnderConstruction &&
              activeUnit.lessons.some((l) => l.questions.length > 0) && (
                <Link
                  href={`/exams/builder?subjectId=${subjectId}&unitId=${activeUnit.id}`}
                  className="min-h-[44px] px-4 rounded-xl bg-[#F5F7FB] dark:bg-[#142747] hover:bg-[#EAF0F8] text-[#0B1D42] dark:text-white border border-[#DFE6F0] dark:border-[#1E3A6E] text-xs font-bold inline-flex items-center justify-center gap-2 shrink-0 transition-colors"
                >
                  <Target className="w-3.5 h-3.5 text-[#830D3C] dark:text-[#FDA4AF]" />
                  <span>امتحان الوحدة</span>
                </Link>
              )}
          </div>
        )}

        {/* Main Content: Empty Filter vs Grid View vs List View */}
        {visibleLessons.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0F1E36] border border-[#DFE6F0] dark:border-[#1E3352] space-y-3">
            <h2 className="text-base font-bold text-[#0B1D42] dark:text-white">
              لا توجد دروس منشورة في هذه الوحدة حالياً
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
              يمكنك عرض جميع وحدات المادة للاطلاع على الدروس المتاحة.
            </p>
            <button
              type="button"
              onClick={() => setSelectedUnitId("ALL")}
              className="min-h-[44px] px-5 rounded-xl bg-[#830D3C] hover:bg-[#6B0930] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>عرض كل الوحدات</span>
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Responsive CSS Grid: 1 col (320-359px) | 2 cols (360-767px) | 3 cols (768-1199px) | 4 cols (1200px+) */
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 min-[1200px]:grid-cols-4 gap-2.5 min-[430px]:gap-3.5 md:gap-4 items-stretch">
            {visibleLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                subjectId={subjectId}
                variant="grid"
                showUnitLabel={selectedUnitId === "ALL" && units.length > 1}
                onOpenLocked={handleOpenLocked}
              />
            ))}
          </div>
        ) : (
          /* Preserved Functional List View */
          <div className="space-y-4">
            {visibleUnitsForList.map((unit) => {
              const unitLessons = lessonsByUnitMap.get(unit.id) ?? [];
              if (unitLessons.length === 0) return null;

              const unitIndex = units.findIndex((u) => u.id === unit.id);
              const unitCompleted = unitLessons.filter((l) => l.isCompleted).length;
              const unitTotal = unitLessons.length;
              const unitProgress =
                unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0;

              const unitQuestions = unit.lessons.flatMap((l) =>
                l.questions.map((q) => q.questionId)
              );
              const unitMasteredCount = unitQuestions.filter((qid) =>
                masteredSet.has(qid)
              ).length;
              const unitMasteryPct =
                unitQuestions.length > 0
                  ? Math.round((unitMasteredCount / unitQuestions.length) * 100)
                  : 0;

              return (
                <section
                  key={unit.id}
                  className="rounded-2xl bg-white dark:bg-[#0D214D] border border-[#DFE6F0] dark:border-[#1E3A6E] overflow-hidden shadow-[0_2px_12px_rgba(11,29,66,0.05)]"
                >
                  {/* Unit Header */}
                  <div className="p-4 sm:p-5 bg-[#F5F7FB] dark:bg-[#071737] border-b border-[#DFE6F0] dark:border-[#1E3A6E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-[#830D3C] dark:text-[#E9AD32]">
                          الوحدة {unitIndex + 1}
                        </span>
                        <span className="text-xs text-[#64748B]">•</span>
                        <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
                          {unitCompleted} من {unitTotal} مكتمل ({unitProgress}%)
                        </span>
                        {unitQuestions.length > 0 && (
                          <>
                            <span className="text-xs text-[#64748B]">•</span>
                            <span
                              className={cn(
                                "text-[11px] font-mono font-bold px-2 py-0.5 rounded-full",
                                unitMasteryPct >= 80
                                  ? "bg-[#15803D]/10 text-[#15803D] dark:text-[#34D399]"
                                  : unitMasteryPct >= 50
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                    : "bg-[#64748B]/10 text-[#64748B] dark:text-[#94A3B8]"
                              )}
                            >
                              إتقان الأسئلة: {unitMasteryPct}% ({unitMasteredCount}/{unitQuestions.length})
                            </span>
                          </>
                        )}
                      </div>
                      <h2 className="text-sm sm:text-base font-bold text-[#0B1D42] dark:text-white leading-snug break-words">
                        {unit.title}
                      </h2>
                      {unit.description && (
                        <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                          {unit.description}
                        </p>
                      )}
                    </div>

                    {!isSubjectUnderConstruction && unitQuestions.length > 0 && (
                      <Link
                        href={`/exams/builder?subjectId=${subjectId}&unitId=${unit.id}`}
                        className="min-h-[44px] px-4 rounded-xl bg-white dark:bg-[#0D214D] hover:bg-[#EAF0F8] dark:hover:bg-[#1E3A6E] text-[#0B1D42] dark:text-white text-xs sm:text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-colors shrink-0 self-start sm:self-center border border-[#DFE6F0] dark:border-[#1E3A6E]"
                      >
                        <Target className="w-3.5 h-3.5 text-[#830D3C] dark:text-[#E9AD32]" />
                        <span>امتحان الوحدة</span>
                      </Link>
                    )}
                  </div>

                  {/* Lessons Rows */}
                  <div className="divide-y divide-[#DFE6F0] dark:divide-[#1E3A6E]">
                    {unitLessons.map((lesson) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        subjectId={subjectId}
                        variant="list"
                        onOpenLocked={handleOpenLocked}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Subscription Paywall Modal for Locked Lessons */}
      <PaywallModal
        isOpen={Boolean(lockedModal)}
        onClose={() => setLockedModal(null)}
        lessonTitle={lockedModal?.lessonTitle}
        unitTitle={lockedModal?.unitTitle}
        user={user}
      />
    </>
  );
}
