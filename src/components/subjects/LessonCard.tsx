"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Globe,
  Lock,
  Monitor,
  Play,
  RotateCcw,
  Scale,
  ShieldCheck,
  Target,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatLessonBadgeNumber,
  getLessonIconKind,
  getLessonStateMeta,
  resolveLessonAccessState,
  type LessonAccessState,
  type LessonIconKind,
} from "./lesson-helpers";

export interface LessonCardItem {
  id: string;
  title: string;
  order: number;
  curriculumIndex: number;
  durationMinutes: number | null;
  unitId: string;
  unitTitle: string;
  unitOrder: number;
  isLocked: boolean;
  isCompleted: boolean;
  progressPercent: number;
  hasSummary: boolean;
  questionsCount: number;
  masteredQuestionsCount: number;
}

interface LessonCardProps {
  lesson: LessonCardItem;
  subjectId: string;
  variant: "grid" | "list";
  showUnitLabel?: boolean;
  onOpenLocked: (lesson: LessonCardItem) => void;
}

function LessonTopicIcon({ kind, className }: { kind: LessonIconKind; className?: string }) {
  switch (kind) {
    case "brain":
      return <BrainCircuit className={className} />;
    case "monitor":
      return <Monitor className={className} />;
    case "scale":
      return <Scale className={className} />;
    case "trending":
      return <TrendingUp className={className} />;
    case "shield":
      return <ShieldCheck className={className} />;
    case "code":
      return <Code2 className={className} />;
    case "workflow":
      return <Workflow className={className} />;
    case "globe":
      return <Globe className={className} />;
    case "database":
      return <Database className={className} />;
    case "book":
    default:
      return <BookOpen className={className} />;
  }
}

function getStatusBadgeClasses(state: LessonAccessState): string {
  switch (state) {
    case "LOCKED":
      return "bg-[#FDF6F3] dark:bg-[#2A1622] text-[#830D3C] dark:text-[#FDA4AF] border border-[#EBD5CC] dark:border-[#830D3C]/40";
    case "COMPLETED":
      return "bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#15803D] dark:text-[#6EE7B7] border border-[#BBF7D0] dark:border-[#059669]/40";
    case "IN_PROGRESS":
      return "bg-[#EFF6FF] dark:bg-[#172554]/50 text-[#1D4ED8] dark:text-[#93C5FD] border border-[#BFDBFE] dark:border-[#2563EB]/40";
    case "AVAILABLE":
    default:
      return "bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#15803D] dark:text-[#6EE7B7] border border-[#BBF7D0] dark:border-[#059669]/40";
  }
}

function StatusPill({ state, label }: { state: LessonAccessState; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0",
        getStatusBadgeClasses(state)
      )}
    >
      {state === "LOCKED" ? (
        <Lock className="w-3 h-3 shrink-0" />
      ) : state === "IN_PROGRESS" ? (
        <BookOpen className="w-3 h-3 shrink-0" />
      ) : (
        <CheckCircle2 className="w-3 h-3 shrink-0" />
      )}
      <span>{label}</span>
    </span>
  );
}

export function LessonCard({
  lesson,
  subjectId,
  variant,
  showUnitLabel = false,
  onOpenLocked,
}: LessonCardProps) {
  const accessState = resolveLessonAccessState({
    isLocked: lesson.isLocked,
    isCompleted: lesson.isCompleted,
    progressPercent: lesson.progressPercent,
  });

  const { statusLabel, actionLabel } = getLessonStateMeta(accessState);
  const iconKind = getLessonIconKind(lesson.title);
  const paddedNumber = formatLessonBadgeNumber(lesson.curriculumIndex);
  const hasDuration = typeof lesson.durationMinutes === "number" && lesson.durationMinutes > 0;
  const isEnglishTitle = /^[A-Za-z0-9]/.test(lesson.title.trim());

  const renderPrimaryAction = (fullWidth: boolean) => {
    const baseClasses = cn(
      "min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#830D3C]",
      fullWidth ? "w-full" : "flex-1 sm:flex-initial"
    );

    if (accessState === "LOCKED") {
      return (
        <button
          type="button"
          onClick={() => onOpenLocked(lesson)}
          className={cn(
            baseClasses,
            "bg-[#FDF6F3] hover:bg-[#FAF0EB] dark:bg-[#2A1622] dark:hover:bg-[#3A1E2E] text-[#830D3C] dark:text-[#FDA4AF] border border-[#E5CFC6] dark:border-[#830D3C]/50 cursor-pointer"
          )}
        >
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>{actionLabel}</span>
        </button>
      );
    }

    if (accessState === "COMPLETED") {
      return (
        <Link
          href={`/lessons/${lesson.id}`}
          className={cn(
            baseClasses,
            "bg-[#F5F7FB] hover:bg-[#EAF0F8] dark:bg-[#142747] dark:hover:bg-[#1E3A6E] text-[#0B1D42] dark:text-white border border-[#DFE6F0] dark:border-[#1E3A6E]"
          )}
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#15803D] dark:text-[#6EE7B7] shrink-0" />
          <span>{actionLabel}</span>
        </Link>
      );
    }

    if (accessState === "IN_PROGRESS") {
      return (
        <Link
          href={`/lessons/${lesson.id}`}
          className={cn(
            baseClasses,
            "bg-[#0B1D42] hover:bg-[#142B5E] text-white shadow-xs"
          )}
        >
          <span>{actionLabel}</span>
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
        </Link>
      );
    }

    return (
      <Link
        href={`/lessons/${lesson.id}`}
        className={cn(
          baseClasses,
          "bg-[#830D3C] hover:bg-[#6B0930] text-white shadow-xs"
        )}
      >
        <Play className="w-3.5 h-3.5 fill-current shrink-0" />
        <span>{actionLabel}</span>
      </Link>
    );
  };

  if (variant === "list") {
    return (
      <article
        onClick={() => {
          if (accessState === "LOCKED") {
            onOpenLocked(lesson);
          }
        }}
        className={cn(
          "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors",
          accessState === "LOCKED"
            ? "bg-[#FDF6F3]/45 dark:bg-[#0A1A3A]/45 hover:bg-[#FDF6F3]/80 dark:hover:bg-[#142747]/50 cursor-pointer"
            : "bg-white dark:bg-[#0D214D] hover:bg-[#F5F7FB]/80 dark:hover:bg-[#11244E]/45"
        )}
      >
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border",
              accessState === "LOCKED"
                ? "bg-[#FDF6F3] dark:bg-[#2A1622] text-[#830D3C] dark:text-[#FDA4AF] border-[#EBD5CC] dark:border-[#830D3C]/40"
                : accessState === "COMPLETED"
                  ? "bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#15803D] dark:text-[#6EE7B7] border-[#BBF7D0] dark:border-[#059669]/40"
                  : "bg-[#FDF2F4] dark:bg-[#830D3C]/20 text-[#830D3C] dark:text-[#FDA4AF] border-[#F5D0DA]/70 dark:border-[#830D3C]/40"
            )}
          >
            <LessonTopicIcon kind={iconKind} className="w-5 h-5" />
          </div>

          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#FBEFF3] dark:bg-[#830D3C]/25 text-[#830D3C] dark:text-[#FDA4AF] text-[11px] font-extrabold font-sans tabular-nums shrink-0">
                {paddedNumber}
              </span>
              <StatusPill state={accessState} label={statusLabel} />
              {showUnitLabel && (
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  الوحدة {lesson.unitOrder}
                </span>
              )}
            </div>

            <h3
              dir={isEnglishTitle ? "ltr" : "rtl"}
              className={cn(
                "text-sm sm:text-[15px] font-bold text-[#0B1D42] dark:text-white leading-relaxed break-words",
                isEnglishTitle ? "text-left" : "text-right"
              )}
            >
              {lesson.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8] font-medium flex-wrap">
              {hasDuration && (
                <span className="inline-flex items-center gap-1 font-sans tabular-nums">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{lesson.durationMinutes} دقيقة</span>
                </span>
              )}
              {accessState === "IN_PROGRESS" && (
                <span className="font-sans tabular-nums font-bold text-[#1D4ED8] dark:text-[#93C5FD]">
                  تقدمك: {lesson.progressPercent}%
                </span>
              )}
              {lesson.questionsCount > 0 && accessState !== "LOCKED" && (
                <span className="font-sans tabular-nums">
                  إتقان {Math.round((lesson.masteredQuestionsCount / lesson.questionsCount) * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-2 shrink-0 self-stretch sm:self-center"
          onClick={(e) => {
            if (accessState === "LOCKED") e.stopPropagation();
          }}
        >
          {accessState !== "LOCKED" && lesson.questionsCount > 0 && (
            <Link
              href={`/exams/builder?subjectId=${subjectId}&unitId=${lesson.unitId}&lessonId=${lesson.id}`}
              className="min-h-[44px] px-3.5 rounded-xl bg-white dark:bg-[#0D214D] hover:bg-[#F5F7FB] dark:hover:bg-[#1E3A6E] text-[#830D3C] dark:text-[#FDA4AF] border border-[#DFE6F0] dark:border-[#1E3A6E] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shrink-0"
              title="امتحان على هذا الدرس"
            >
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span>امتحان الدرس</span>
            </Link>
          )}
          {renderPrimaryAction(false)}
        </div>
      </article>
    );
  }

  // Default: Responsive Grid View Card matching EL KHOLASA Grid Reference
  return (
    <article
      className={cn(
        "rounded-2xl bg-white dark:bg-[#0F1E36] border shadow-[0_2px_10px_rgba(11,29,66,0.04)] p-3 min-[430px]:p-4 flex flex-col justify-between gap-3 h-full min-w-0 transition-colors",
        accessState === "LOCKED"
          ? "border-[#E8DCE0] dark:border-[#2C2038]"
          : "border-[#DFE6F0] dark:border-[#1E3352] hover:border-[#830D3C]/45"
      )}
    >
      <div className="space-y-3 min-w-0">
        {/* Top Row: Lesson Number Pill & Status Badge */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#FBEFF3] dark:bg-[#830D3C]/25 text-[#830D3C] dark:text-[#FDA4AF] text-xs font-extrabold font-sans tabular-nums shrink-0">
            {paddedNumber}
          </span>
          <StatusPill state={accessState} label={statusLabel} />
        </div>

        {/* Main Content: Topic Icon + Full Wrapping Title + Real Backend Duration */}
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          <div
            className={cn(
              "w-9 h-9 min-[430px]:w-11 min-[430px]:h-11 rounded-xl flex items-center justify-center shrink-0 border",
              accessState === "COMPLETED"
                ? "bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#15803D] dark:text-[#6EE7B7] border-[#BBF7D0] dark:border-[#059669]/40"
                : "bg-[#FDF2F4] dark:bg-[#830D3C]/20 text-[#830D3C] dark:text-[#FDA4AF] border-[#F5D0DA]/70 dark:border-[#830D3C]/40"
            )}
          >
            <LessonTopicIcon
              kind={iconKind}
              className="w-4.5 h-4.5 min-[430px]:w-5 min-[430px]:h-5"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <h3
              dir={isEnglishTitle ? "ltr" : "rtl"}
              className={cn(
                "text-[13px] min-[430px]:text-sm font-bold text-[#0B1D42] dark:text-white leading-relaxed break-words",
                isEnglishTitle ? "text-left" : "text-right"
              )}
            >
              {lesson.title}
            </h3>

            {(hasDuration || showUnitLabel) && (
              <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-[11px] min-[430px]:text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
                {hasDuration && (
                  <span className="inline-flex items-center gap-1 font-sans tabular-nums">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{lesson.durationMinutes} دقيقة</span>
                  </span>
                )}
                {showUnitLabel && (
                  <span className="text-[11px] font-semibold">الوحدة {lesson.unitOrder}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Primary Action Button */}
      <div className="pt-1">{renderPrimaryAction(true)}</div>
    </article>
  );
}
