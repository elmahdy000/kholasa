export const FULL_ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;
export const ADMIN_OR_ASSISTANT_ROLES = ["ASSISTANT", "ADMIN", "SUPER_ADMIN"] as const;
export const STAFF_ROLE_LIST = [
  "TEACHER",
  "EDITOR",
  "ASSISTANT",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

const CONTENT_MANAGEMENT_ROLES = ["EDITOR", "ASSISTANT", "ADMIN", "SUPER_ADMIN"] as const;
const QUESTION_AND_EXAM_ROLES = [
  "TEACHER",
  "EDITOR",
  "ASSISTANT",
  "ADMIN",
  "SUPER_ADMIN",
] as const;
const GRADING_AND_ANALYTICS_ROLES = ["TEACHER", "ASSISTANT", "ADMIN", "SUPER_ADMIN"] as const;
const ASSISTANT_ASSIGNABLE_ROLES = ["STUDENT", "TEACHER", "EDITOR"] as const;

export function isFullAdmin(role?: string | null): boolean {
  return Boolean(role && (FULL_ADMIN_ROLES as readonly string[]).includes(role));
}

export function isAdminOrAssistant(role?: string | null): boolean {
  return Boolean(role && (ADMIN_OR_ASSISTANT_ROLES as readonly string[]).includes(role));
}

export function isStaffRoleValue(role?: string | null): boolean {
  return Boolean(role && (STAFF_ROLE_LIST as readonly string[]).includes(role));
}

export function canManageCurriculumRole(role?: string | null): boolean {
  return Boolean(role && (CONTENT_MANAGEMENT_ROLES as readonly string[]).includes(role));
}

export function canManageQuestionsRole(role?: string | null): boolean {
  return Boolean(role && (QUESTION_AND_EXAM_ROLES as readonly string[]).includes(role));
}

export function canManageExamsRole(role?: string | null): boolean {
  return Boolean(role && (QUESTION_AND_EXAM_ROLES as readonly string[]).includes(role));
}

export function canGradeAttemptsRole(role?: string | null): boolean {
  return Boolean(role && (GRADING_AND_ANALYTICS_ROLES as readonly string[]).includes(role));
}

export function canManageMediaRole(role?: string | null): boolean {
  return Boolean(role && (QUESTION_AND_EXAM_ROLES as readonly string[]).includes(role));
}

export function canManageUsersRole(role?: string | null): boolean {
  return isAdminOrAssistant(role);
}

export function canDeleteUsersRole(role?: string | null): boolean {
  return isFullAdmin(role);
}

export function canManageStructureRole(role?: string | null): boolean {
  return isAdminOrAssistant(role);
}

export function canManageAnnouncementsRole(role?: string | null): boolean {
  return Boolean(role && (CONTENT_MANAGEMENT_ROLES as readonly string[]).includes(role));
}

export function canViewAnalyticsRole(role?: string | null): boolean {
  return Boolean(role && (GRADING_AND_ANALYTICS_ROLES as readonly string[]).includes(role));
}

export function canActorManageTargetUser(
  actorRole?: string | null,
  targetRole?: string | null
): boolean {
  if (!actorRole || !targetRole) return false;
  if (actorRole === "SUPER_ADMIN") return true;
  if (actorRole === "ADMIN") return targetRole !== "SUPER_ADMIN";
  if (actorRole === "ASSISTANT") {
    return !(ADMIN_OR_ASSISTANT_ROLES as readonly string[]).includes(targetRole);
  }
  return false;
}

export function canActorAssignUserRole(
  actorRole?: string | null,
  nextRole?: string | null
): boolean {
  if (!actorRole || !nextRole) return false;
  if (actorRole === "SUPER_ADMIN") return true;
  if (actorRole === "ADMIN") return nextRole !== "SUPER_ADMIN";
  if (actorRole === "ASSISTANT") {
    return (ASSISTANT_ASSIGNABLE_ROLES as readonly string[]).includes(nextRole);
  }
  return false;
}

export function getRoleArabicLabel(role?: string | null): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "مشرف عام أعلى";
    case "ADMIN":
      return "مسؤول المنصة";
    case "ASSISTANT":
      return "مساعد إداري";
    case "EDITOR":
      return "محرر محتوى (Subadmin)";
    case "TEACHER":
      return "معلم ومصحح (Subadmin)";
    case "STUDENT":
      return "طالب";
    default:
      return role || "غير محدد";
  }
}

