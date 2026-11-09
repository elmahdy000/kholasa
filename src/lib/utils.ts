import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Arabic-friendly day count: يوم واحد، يومان، 3 أيام، 11 يوماً. */
export function formatArabicDays(days: number) {
  if (days === 0) return "0 يوم";
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومان";
  if (days >= 3 && days <= 10) return `${days} أيام`;
  return `${days} يوماً`;
}

/**
 * Normalizes student name to prevent raw dummy/test/language tags from displaying.
 * Returns null if the name is placeholder/demo or empty.
 */
export function getCleanStudentName(name?: string | null): string | null {
  if (!name) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  // Filter out dummy/demo labels and language category tags
  if (
    lower.includes("demo") ||
    lower.includes("student") ||
    lower.includes("language") ||
    lower.includes("languages") ||
    lower.includes("تجريبي") ||
    trimmed === "بطل" ||
    trimmed === "طالب" ||
    trimmed === "مستخدم"
  ) {
    return null;
  }
  return trimmed;
}

/**
 * Returns a friendly Egyptian Arabic greeting.
 * If there is a real student name: "أهلاً بيك يا [الاسم]"
 * If there is no real name: "أهلاً بيك"
 */
export function formatStudentGreeting(name?: string | null): string {
  const clean = getCleanStudentName(name);
  if (!clean) {
    return "أهلاً بيك";
  }
  return `أهلاً بيك يا ${clean}`;
}
