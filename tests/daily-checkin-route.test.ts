import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const mockDailyCheckinService = vi.hoisted(() => ({
  getDailyCheckinQuestions: vi.fn(),
  submitDailyCheckin: vi.fn(),
}));

vi.mock("@/services", () => ({
  DailyCheckinService: mockDailyCheckinService,
}));

import { GET, POST } from "@/app/api/student/daily-checkin/route";

describe("Daily Check-in API Route (/api/student/daily-checkin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/student/daily-checkin", () => {
    it("returns 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const res = await GET();
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("غير مصرح");
    });

    it("returns questions for authenticated student", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "student-1",
        role: "STUDENT",
        schoolCategory: "LANGUAGES",
        gradeId: "grade-1",
      });

      mockDailyCheckinService.getDailyCheckinQuestions.mockResolvedValue({
        completed: false,
        questions: [{ id: "q1", statement: "What is an algorithm?" }],
      });

      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.completed).toBe(false);
      expect(data.questions).toHaveLength(1);
    });
  });

  describe("POST /api/student/daily-checkin (Resolves 405 Method Not Allowed)", () => {
    it("returns 401 if user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const req = new Request("http://localhost/api/student/daily-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: [{ questionId: "q1", selectedOptionId: "opt-1" }],
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("غير مصرح");
    });

    it("successfully accepts POST submissions and evaluates daily answers", async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: "student-1",
        role: "STUDENT",
      });

      mockDailyCheckinService.submitDailyCheckin.mockResolvedValue({
        dateKey: "2026-11-09",
        completed: true,
        score: 1,
        totalQuestions: 1,
        percentage: 100,
        wrongCount: 0,
        reviewedQuestions: [],
      });

      const req = new Request("http://localhost/api/student/daily-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: [{ questionId: "q1", selectedOptionId: "opt-1" }],
          timeSpentSeconds: 45,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.completed).toBe(true);
      expect(data.score).toBe(1);
      expect(data.percentage).toBe(100);

      expect(mockDailyCheckinService.submitDailyCheckin).toHaveBeenCalledWith(
        "student-1",
        [{ questionId: "q1", selectedOptionId: "opt-1" }],
        45
      );
    });
  });
});
