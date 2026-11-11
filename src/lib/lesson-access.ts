import { getCurriculumScope, isSubjectInScope, type ScopedUser } from "@/lib/curriculum";
import { isAdminOrAssistant } from "@/lib/roles";

export interface LessonAccessSubject {
  id: string;
  isPublished?: boolean;
  gradeId?: string | null;
  trackId?: string | null;
  schoolCategory?: "ARABIC" | "LANGUAGES" | string | null;
  isCommonCategory?: boolean | null;
  isUnderConstruction?: boolean | null;
}

export interface LessonAccessTarget {
  isPublished?: boolean;
  isTrial?: boolean | null;
  order: number;
  unit: {
    isPublished?: boolean;
    order: number;
    subject: LessonAccessSubject;
  };
}

export interface LessonAccessUser extends ScopedUser {
  role?: string | null;
  subscriptionStatus?: string | null;
}

export function isSubscriptionExemptStaff(role?: string | null): boolean {
  return isAdminOrAssistant(role);
}

export function hasActiveSubscription(user: LessonAccessUser | null | undefined): boolean {
  if (!user) return false;
  return isSubscriptionExemptStaff(user.role) || user.subscriptionStatus === "ACTIVE";
}

export function isTrialLesson(lesson: {
  isTrial?: boolean | null;
  order: number;
  unit: { order: number };
}): boolean {
  return Boolean(lesson.isTrial) || (lesson.unit.order === 1 && lesson.order === 1);
}

export function canUserAccessLesson(
  user: LessonAccessUser | null | undefined,
  lesson: LessonAccessTarget
): {
  allowed: boolean;
  reason?: "UNPUBLISHED" | "UNDER_CONSTRUCTION" | "OUT_OF_SCOPE" | "SUBSCRIPTION_REQUIRED";
} {
  if (
    lesson.isPublished === false ||
    lesson.unit.isPublished === false ||
    lesson.unit.subject.isPublished === false
  ) {
    return { allowed: false, reason: "UNPUBLISHED" };
  }

  if (
    lesson.unit.subject.isUnderConstruction &&
    !isSubscriptionExemptStaff(user?.role)
  ) {
    return { allowed: false, reason: "UNDER_CONSTRUCTION" };
  }

  const scope = getCurriculumScope(user ?? null);
  if (!isSubjectInScope(scope, lesson.unit.subject)) {
    return { allowed: false, reason: "OUT_OF_SCOPE" };
  }

  if (!hasActiveSubscription(user) && !isTrialLesson(lesson)) {
    return { allowed: false, reason: "SUBSCRIPTION_REQUIRED" };
  }

  return { allowed: true };
}
