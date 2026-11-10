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

const cairoPartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAIRO_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function getCairoOffsetMs(utcMs: number): number {
  const parts = cairoPartsFormatter.formatToParts(new Date(utcMs));
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  const cairoAsUtc = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    map.hour === 24 ? 0 : map.hour,
    map.minute,
    map.second
  );
  return cairoAsUtc - utcMs;
}

/** Returns the Cairo calendar day for `date` as `YYYY-MM-DD`. */
export function getCairoDayKey(date: Date = new Date()): string {
  return dayKeyFormatter.format(date);
}

/** Returns the UTC Date representing 00:00:00 Africa/Cairo for a `YYYY-MM-DD` Cairo day key. */
export function getCairoStartOfDayFromKey(dayKey: string): Date {
  const [year, month, day] = dayKey.split("-").map(Number);
  const nominalUtc = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  const initial = nominalUtc - getCairoOffsetMs(nominalUtc);
  // Refine once in case a DST boundary sits near midnight
  return new Date(nominalUtc - getCairoOffsetMs(initial));
}

/** Returns the UTC Date representing 00:00:00 Africa/Cairo for `date`'s Cairo day. */
export function getCairoStartOfDay(date: Date = new Date()): Date {
  return getCairoStartOfDayFromKey(getCairoDayKey(date));
}

/** Returns half-open `[start, end)` UTC bounds for a Cairo `YYYY-MM-DD` day key. */
export function getCairoDayRange(dayKey: string): {
  dayKey: string;
  start: Date;
  end: Date;
} {
  const validKey = /^\d{4}-\d{2}-\d{2}$/.test(dayKey) ? dayKey : getCairoDayKey();
  const nextKey = shiftDayKey(validKey, 1);
  return {
    dayKey: validKey,
    start: getCairoStartOfDayFromKey(validKey),
    end: getCairoStartOfDayFromKey(nextKey),
  };
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
