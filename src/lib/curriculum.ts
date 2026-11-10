import type { Prisma } from "@prisma/client";

export type SchoolCategory = "ARABIC" | "LANGUAGES";

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
  if (!user || user.role !== "STUDENT") return null;
  return {
    systemId: user.systemId ?? null,
    gradeId: user.gradeId ?? null,
    schoolCategory: user.schoolCategory ?? "ARABIC",
    trackId: user.trackId ?? null,
  };
}

/** Prisma filter for subjects visible inside a scope. Empty when unscoped. */
export function subjectScopeWhere(
  scope: CurriculumScope | null
): Prisma.SubjectWhereInput {
  if (!scope) return {};

  const andConditions: Prisma.SubjectWhereInput[] = [];
  if (scope.schoolCategory) {
    andConditions.push({
      OR: [
        { schoolCategory: scope.schoolCategory },
        { isCommonCategory: true },
      ],
    });
  }
  if (scope.trackId) {
    andConditions.push({
      OR: [{ trackId: null }, { trackId: scope.trackId }],
    });
  }

  return {
    ...(scope.gradeId ? { gradeId: scope.gradeId } : {}),
    ...(scope.systemId ? { systemId: scope.systemId } : {}),
    ...(andConditions.length === 1
      ? andConditions[0]
      : andConditions.length > 1
      ? { AND: andConditions }
      : {}),
  };
}

/** Prisma filter for questions visible inside a scope. */
export function questionScopeWhere(
  scope: CurriculumScope | null
): Prisma.QuestionWhereInput {
  if (!scope) return {};

  return {
    subject: { is: subjectScopeWhere(scope) },
    ...(scope.schoolCategory
      ? {
          OR: [
            { schoolCategory: scope.schoolCategory },
            { subject: { isCommonCategory: true } },
          ],
        }
      : {}),
  };
}

/** Prisma filter for official exams visible inside a scope. */
export function examScopeWhere(
  scope: CurriculumScope | null
): Prisma.ExamWhereInput {
  if (!scope) return { isCustom: false, isPublished: true };

  return {
    isCustom: false,
    isPublished: true,
    subject: { is: subjectScopeWhere(scope) },
    ...(scope.schoolCategory
      ? {
          OR: [
            { schoolCategory: scope.schoolCategory },
            { subject: { isCommonCategory: true } },
          ],
        }
      : {}),
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
    isCommonCategory?: boolean | null;
  } | null
): boolean {
  if (!subject) return false;
  if (!scope) return true;

  // Strict separation: Arabic Schools vs Language Schools unless marked common across both
  if (
    !subject.isCommonCategory &&
    scope.schoolCategory &&
    subject.schoolCategory &&
    subject.schoolCategory !== scope.schoolCategory
  ) {
    return false;
  }

  if (scope.gradeId && subject.gradeId && subject.gradeId !== scope.gradeId) {
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
