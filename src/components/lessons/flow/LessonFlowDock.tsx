"use client";

import {
  Sparkle,
  Lightbulb,
  BookOpen,
  CheckCircle,
  PencilLine,
  ChartLineUp,
  Question as QuestionIcon,
} from "@phosphor-icons/react";
import { FlowFilterType } from "../types";

interface LessonFlowDockProps {
  flowFilter: FlowFilterType;
  definitionsCount: number;
  mcqCount: number;
  essayCount: number;
  objectivesCount: number;
  tfCount: number;
  onFilterChange: (filter: FlowFilterType) => void;
}

export function LessonFlowDock({
  flowFilter,
  definitionsCount,
  mcqCount,
  essayCount,
  objectivesCount,
  tfCount,
  onFilterChange,
}: LessonFlowDockProps) {
  const pills = [
    { id: "all", label: "كل المسار متتابعاً", icon: Sparkle, badge: null },
    { id: "summary", label: "1. الزتونة", icon: Lightbulb, badge: null },
    { id: "definitions", label: "2. التعريفات المهمة", icon: BookOpen, badge: definitionsCount },
    { id: "mcq", label: "3. اختيار من متعدد", icon: CheckCircle, badge: mcqCount },
    { id: "essay", label: "4. أسئلة مقالي", icon: PencilLine, badge: essayCount },
    { id: "assessments", label: "5. أسئلة تقييمات", icon: ChartLineUp, badge: objectivesCount },
    { id: "true_false", label: "6. صح وغلط", icon: QuestionIcon, badge: tfCount },
  ] as const;

  return (
    <div className="sticky top-16 z-20 backdrop-blur-md bg-white/95 dark:bg-[#0F172A]/95 p-2 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
      {pills.map((pill) => {
        const isActive = flowFilter === pill.id;
        const PillIcon = pill.icon;
        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => onFilterChange(pill.id as FlowFilterType)}
            className={`px-3 py-2 rounded-xl text-[12px] sm:text-[13px] font-bold flex items-center gap-1.5 shrink-0 transition-all ${
              isActive
                ? "bg-[#800020] text-white shadow-sm"
                : "bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#800020]/40 hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            <PillIcon className="w-3.5 h-3.5 shrink-0" weight={isActive ? "fill" : "bold"} />
            <span>{pill.label}</span>
            {pill.badge !== null && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-md font-mono ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#E2E8F0] dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
                }`}
              >
                {pill.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
