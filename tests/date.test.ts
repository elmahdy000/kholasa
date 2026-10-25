import { describe, expect, it } from "vitest";
import { calculateStreak, getCairoDayKey, shiftDayKey } from "@/lib/date";

describe("Cairo calendar helpers", () => {
  it("uses the Africa/Cairo day, not UTC", () => {
    // 22:30 UTC is already the next calendar day in Cairo (UTC+2/+3).
    expect(getCairoDayKey(new Date("2026-01-01T22:30:00Z"))).toBe("2026-01-02");
    expect(getCairoDayKey(new Date("2026-01-01T10:00:00Z"))).toBe("2026-01-01");
  });

  it("shifts day keys across month and year boundaries", () => {
    expect(shiftDayKey("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftDayKey("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("counts consecutive days ending today", () => {
    expect(
      calculateStreak(["2026-10-22", "2026-10-21", "2026-10-20"], "2026-10-22")
    ).toBe(3);
  });

  it("keeps yesterday's streak alive before today's check-in", () => {
    expect(calculateStreak(["2026-10-21", "2026-10-20"], "2026-10-22")).toBe(2);
  });

  it("breaks on a missing day and ignores duplicates", () => {
    expect(calculateStreak(["2026-10-22", "2026-10-20"], "2026-10-22")).toBe(1);
    expect(calculateStreak(["2026-10-22", "2026-10-22"], "2026-10-22")).toBe(1);
    expect(calculateStreak([], "2026-10-22")).toBe(0);
  });
});
