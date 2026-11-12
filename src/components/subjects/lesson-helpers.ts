export type LessonAccessState = "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "LOCKED";

export type LessonIconKind =
  | "brain"
  | "monitor"
  | "scale"
  | "trending"
  | "shield"
  | "code"
  | "workflow"
  | "globe"
  | "database"
  | "book";

export type SubjectViewMode = "grid" | "list";
export type LessonSortOrder = "curriculum_asc" | "curriculum_desc";

export interface LessonProgressRecord {
  lessonId: string;
  isCompleted: boolean;
  progressPercent: number;
}

export interface LessonStateMeta {
  state: LessonAccessState;
  statusLabel: string;
  actionLabel: string;
}

/**
 * Resolves the single authoritative display state for a lesson card based on
 * real subscription access and student progress.
 */
export function resolveLessonAccessState(params: {
  isLocked: boolean;
  isCompleted: boolean;
  progressPercent?: number;
}): LessonAccessState {
  if (params.isLocked) return "LOCKED";
  if (params.isCompleted) return "COMPLETED";
  if (typeof params.progressPercent === "number" && params.progressPercent > 0) {
    return "IN_PROGRESS";
  }
  return "AVAILABLE";
}

export function getLessonStateMeta(state: LessonAccessState): LessonStateMeta {
  switch (state) {
    case "LOCKED":
      return {
        state,
        statusLabel: "مقفول للمشتركين",
        actionLabel: "اشترك لفتح الدرس",
      };
    case "COMPLETED":
      return {
        state,
        statusLabel: "مكتمل",
        actionLabel: "راجع الدرس",
      };
    case "IN_PROGRESS":
      return {
        state,
        statusLabel: "جاري المذاكرة",
        actionLabel: "كمّل المذاكرة",
      };
    case "AVAILABLE":
    default:
      return {
        state: "AVAILABLE",
        statusLabel: "متاح",
        actionLabel: "ابدأ المذاكرة",
      };
  }
}

export function formatLessonBadgeNumber(num: number): string {
  const safe = Math.max(1, Math.trunc(num));
  return String(safe).padStart(2, "0");
}

/**
 * Picks a deterministic, domain-relevant icon identifier from the lesson title
 * with a consistent fallback.
 */
export function getLessonIconKind(title: string): LessonIconKind {
  const t = title.toLowerCase();

  if (
    t.includes("الذكاء الاصطناعي") ||
    t.includes("كيف يعمل") ||
    t.includes("artificial intelligence") ||
    t.includes("machine learning")
  ) {
    if (t.includes("أخلاق") || t.includes("قضايا") || t.includes("ethical")) {
      return "scale";
    }
    if (t.includes("يومي") || t.includes("صناعة") || t.includes("daily") || t.includes("industry")) {
      return "monitor";
    }
    return "brain";
  }

  if (t.includes("أخلاق") || t.includes("قضايا") || t.includes("ethical")) return "scale";
  if (t.includes("تحسين") || t.includes("تطور") || t.includes("evolution") || t.includes("optimiz")) {
    return "trending";
  }
  if (
    t.includes("أمن") ||
    t.includes("تشفير") ||
    t.includes("مصادقة") ||
    t.includes("مخاطر") ||
    t.includes("حوادث") ||
    t.includes("security") ||
    t.includes("encrypt") ||
    t.includes("cyber") ||
    t.includes("risk")
  ) {
    return "shield";
  }
  if (t.includes("خوارزم") || t.includes("مشكلات") || t.includes("problem") || t.includes("algorithm")) {
    return "workflow";
  }
  if (t.includes("برمج") || t.includes("كود") || t.includes("program") || t.includes("code")) {
    return "code";
  }
  if (t.includes("ويب") || t.includes("شبك") || t.includes("موقع") || t.includes("web") || t.includes("front")) {
    return "globe";
  }
  if (t.includes("بيانات") || t.includes("قواعد") || t.includes("database") || t.includes("data")) {
    return "database";
  }
  if (t.includes("حواسيب") || t.includes("تكنولوجيا") || t.includes("information technology")) {
    return "monitor";
  }
  return "book";
}

