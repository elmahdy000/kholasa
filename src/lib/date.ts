/**
 * Calendar helpers pinned to Africa/Cairo, the app's canonical timezone.
 * Day keys are plain `YYYY-MM-DD` strings so they can be stored/indexed directly.
 */

const CAIRO_TZ = "Africa/Cairo";

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CAIRO_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Returns the Cairo calendar day for `date` as `YYYY-MM-DD`. */
export function getCairoDayKey(date: Date = new Date()): string {
  return dayKeyFormatter.format(date);
}

/** Shifts a `YYYY-MM-DD` key by a number of days (negative = past). */
export function shiftDayKey(dayKey: string, deltaDays: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return date.toISOString().slice(0, 10);
}

/**
 * Counts consecutive completed days ending today (or yesterday, so a streak
 * still shows before the user checks in today). Duplicates are ignored.
 */
export function calculateStreak(
  days: Iterable<string>,
  todayKey: string = getCairoDayKey()
): number {
  const completed = new Set(days);
  let cursor = completed.has(todayKey) ? todayKey : shiftDayKey(todayKey, -1);
  let streak = 0;

  while (completed.has(cursor)) {
    streak += 1;
    cursor = shiftDayKey(cursor, -1);
  }

  return streak;
}
