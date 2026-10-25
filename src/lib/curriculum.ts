import type { Prisma } from "@prisma/client";

/**
 * Curriculum scoping.
 *
 * A student may only see content that belongs to their own system/grade, plus
 * track-neutral subjects (or subjects for their track). Staff and anonymous
 * visitors are not scoped.
 */

export interface CurriculumScope {
  systemId: string | null;
  gradeId: string | null;
  trackId: string | null;
}

export interface ScopedUser {
  role?: string | null;
  systemId?: string | null;
  gradeId?: string | null;
  trackId?: string | null;
}

export function getCurriculumScope(user: ScopedUser | null): CurriculumScope | null {
  if (!user || user.role !== "STUDENT" || !user.gradeId) return null;
  return {
    systemId: user.systemId ?? null,
    gradeId: user.gradeId,
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
    ...(scope.systemId ? { systemId: scope.systemId } : {}),
    // Track-neutral material is always visible; track-specific material only
    // when the student picked that track.
    ...(scope.trackId
      ? { OR: [{ trackId: null }, { trackId: scope.trackId }] }
      : {}),
  };
}

/** Prisma filter for official exams visible inside a scope. */
export function examScopeWhere(
  scope: CurriculumScope | null
): Prisma.ExamWhereInput {
  if (!scope?.gradeId) return { isCustom: false };

  return {
    isCustom: false,
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
  } | null
): boolean {
  if (!scope?.gradeId) return true;
  if (!subject) return false;
  if (subject.gradeId !== scope.gradeId) return false;
  if (scope.systemId && subject.systemId && subject.systemId !== scope.systemId) {
    return false;
  }
  if (scope.trackId && subject.trackId && subject.trackId !== scope.trackId) {
    return false;
  }
  return true;
}
