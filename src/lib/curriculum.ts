import type { Prisma, SchoolCategory } from "@prisma/client";

/**
 * Curriculum scoping for EL KHOLASA.
 *
 * Mandatory Curriculum Separation:
 * Grade → School Category (مدارس عربي / مدارس لغات) → Academic Track (if applicable) → Subject → Unit → Lesson → Question Bank
 *
 * Students only see content belonging to their exact grade and school category (ARABIC or LANGUAGES).
 * Staff and anonymous visitors are not scoped.
 */

export interface CurriculumScope {
  systemId: string | null;
  gradeId: string | null;
  schoolCategory?: SchoolCategory | null;
  trackId: string | null;
}

export interface ScopedUser {
  role?: string | null;
  systemId?: string | null;
  gradeId?: string | null;
  schoolCategory?: SchoolCategory | null;
  trackId?: string | null;
}

export function getCurriculumScope(user: ScopedUser | null): CurriculumScope | null {
  if (!user || user.role !== "STUDENT" || !user.gradeId) return null;
  return {
    systemId: user.systemId ?? null,
    gradeId: user.gradeId,
    schoolCategory: user.schoolCategory ?? "ARABIC",
    trackId: user.trackId ?? null,
  };
}

/** Prisma filter for subjects visible inside a scope. Empty when unscoped. */
export function subjectScopeWhere(
  scope: CurriculumScope | null
): Prisma.SubjectWhereInput {
  if (!scope?.gradeId) return {};

  return {
    gradeId: scope.gradeId,
    ...(scope.schoolCategory ? { schoolCategory: scope.schoolCategory } : {}),
    ...(scope.systemId ? { systemId: scope.systemId } : {}),
    // Track-neutral material is always visible; track-specific material only
    // when the student picked that track.
    ...(scope.trackId
      ? { OR: [{ trackId: null }, { trackId: scope.trackId }] }
      : {}),
  };
}

/** Prisma filter for questions visible inside a scope. */
export function questionScopeWhere(
  scope: CurriculumScope | null
): Prisma.QuestionWhereInput {
  if (!scope?.gradeId) return {};

  return {
    ...(scope.schoolCategory ? { schoolCategory: scope.schoolCategory } : {}),
    subject: { is: subjectScopeWhere(scope) },
  };
}

/** Prisma filter for official exams visible inside a scope. */
export function examScopeWhere(
  scope: CurriculumScope | null
): Prisma.ExamWhereInput {
  if (!scope?.gradeId) return { isCustom: false };

  return {
    isCustom: false,
    ...(scope.schoolCategory ? { schoolCategory: scope.schoolCategory } : {}),
    subject: { is: subjectScopeWhere(scope) },
  };
}

/** True when a subject row belongs to the student's scope. */
export function isSubjectInScope(
  scope: CurriculumScope | null,
  subject: {
    gradeId?: string | null;
    systemId?: string | null;
    trackId?: string | null;
    schoolCategory?: SchoolCategory | string | null;
  } | null
): boolean {
  if (!scope?.gradeId) return true;
  if (!subject) return false;
  if (subject.gradeId !== scope.gradeId) return false;

  // Strict separation: Arabic Schools vs Language Schools
  if (
    scope.schoolCategory &&
    subject.schoolCategory &&
    subject.schoolCategory !== scope.schoolCategory
  ) {
    return false;
  }

  if (scope.systemId && subject.systemId && subject.systemId !== scope.systemId) {
    return false;
  }

  if (scope.trackId && subject.trackId && subject.trackId !== scope.trackId) {
    return false;
  }

  return true;
}
