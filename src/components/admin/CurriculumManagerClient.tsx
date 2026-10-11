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
} from "lucide-react";

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

  return (
    <div className="space-y-6">
      {systems.map((system) => (
        <div key={system.id} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6858EA]" />
            <h2 className="text-base sm:text-lg font-black text-[#14243D] dark:text-white">
              {system.name}
            </h2>
          </div>

          <div className="space-y-4">
            {system.subjects.map((subject) => (
              <div
                key={subject.id}
                className="rounded-3xl bg-white dark:bg-[#14243D]/60 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Subject Header */}
                <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: subject.color || "#6858EA" }}
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

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleTogglePublished(
                          "subject",
                          subject.id,
                          subject.isPublished
                        )
                      }
                      disabled={togglingId === subject.id}
                      className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        subject.isPublished
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
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
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subject.units.map((unit) => {
                    const isExpanded = expandedUnits[unit.id] ?? true;

                    return (
                      <div key={unit.id} className="p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <button
                            onClick={() => toggleExpand(unit.id)}
                            className="flex items-center gap-2.5 text-right font-black text-xs sm:text-sm text-[#14243D] dark:text-white hover:text-[#6858EA] transition-colors"
                          >
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 transition-transform ${
                                !isExpanded ? "-rotate-90" : ""
                              }`}
                            />
                            <span>{unit.title}</span>
                            <span className="text-[11px] font-normal text-slate-400">
                              ({unit.lessons.length} دروس)
                            </span>
                          </button>

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
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {unit.isPublished ? "الوحدة منشورة" : "الوحدة مخفية"}
                          </button>
                        </div>

                        {/* Lessons Accordion Content */}
                        {isExpanded && (
                          <div className="pr-6 space-y-2 pt-1">
                            {unit.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-[#6858EA]/10 text-[#6858EA] flex items-center justify-center shrink-0">
                                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                  </div>
                                  <div>
                                    <span className="text-xs font-black text-[#14243D] dark:text-white block">
                                      {lesson.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-2">
                                      <span>{lesson.durationMinutes} دقيقة</span>
                                      <span>•</span>
                                      <span>{lesson.viewsCount} مشاهدة</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/lessons/${lesson.id}`}
                                    className="text-[11px] font-bold text-[#6858EA] hover:underline"
                                    target="_blank"
                                  >
                                    معاينة
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
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : "bg-slate-200 text-slate-500"
                                    }`}
                                  >
                                    {lesson.isPublished ? "منشور" : "مخفي"}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
