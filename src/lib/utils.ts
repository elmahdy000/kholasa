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
