import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCairoDayKey, getCairoStartOfDay } from "@/lib/date";
import { canUserAccessLesson, isTrialLesson } from "@/lib/lesson-access";

const mockPrisma = vi.hoisted(() => ({
  lesson: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  subject: {
    findMany: vi.fn(),
  },
  question: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  studentProgress: {
    upsert: vi.fn(),
    findFirst: vi.fn(),
  },
  mistakeReview: {
    count: vi.fn(),
    upsert: vi.fn(),
    updateMany: vi.fn(),
  },
  examAttempt: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  dailyChallenge: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
  },
  announcement: {
    findMany: vi.fn(),
  },
  questionAttempt: {
    upsert: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  exam: {
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

const mockUser = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: mockUser }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn() }));

import { SearchService } from "@/services/search.service";
import { OfflineService } from "@/services/offline.service";
import { StudentService } from "@/services/student.service";
import { NotificationService } from "@/services/notification.service";
import { POST as flashcardsMistakePost } from "@/app/api/lessons/[id]/flashcards/mistake/route";
import { POST as receiptPost } from "@/app/api/student/subscription/receipt/route";

describe("Student Journey End-to-End Logic Guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Cairo timezone boundaries", () => {
    it("aligns getCairoStartOfDay with Africa/Cairo UTC+2 calendar day", () => {
      // 2026-11-10T22:30:00Z is 2026-11-11 00:30 in Cairo (UTC+2)
      const afterMidnightCairo = new Date("2026-11-10T22:30:00.000Z");
      expect(getCairoDayKey(afterMidnightCairo)).toBe("2026-11-11");
      expect(getCairoStartOfDay(afterMidnightCairo).toISOString()).toBe("2026-11-10T22:00:00.000Z");

      // 2026-11-10T21:45:00Z is 2026-11-10 23:45 in Cairo
      const beforeMidnightCairo = new Date("2026-11-10T21:45:00.000Z");
      expect(getCairoDayKey(beforeMidnightCairo)).toBe("2026-11-10");
      expect(getCairoStartOfDay(beforeMidnightCairo).toISOString()).toBe("2026-11-09T22:00:00.000Z");
    });

    it("handles Cairo DST UTC+3 calendar boundaries cleanly", () => {
      // July is UTC+3 in Egypt: 2026-07-10T21:30:00Z is 2026-07-11 00:30 Cairo
      const summerAfterMidnight = new Date("2026-07-10T21:30:00.000Z");
      expect(getCairoDayKey(summerAfterMidnight)).toBe("2026-07-11");
      expect(getCairoStartOfDay(summerAfterMidnight).toISOString()).toBe("2026-07-10T21:00:00.000Z");
    });
  });

  describe("Unified lesson publish, scope & trial gating", () => {
    const arTrialLesson = {
      isPublished: true,
      isTrial: false,
      order: 1,
      unit: {
        isPublished: true,
        order: 1,
        subject: { id: "sub-ar", isPublished: true, gradeId: "g11", trackId: null, schoolCategory: "ARABIC" },
      },
    };

    const arPaidLesson = {
      ...arTrialLesson,
      order: 2,
    };

    it("detects trial lessons consistently", () => {
      expect(isTrialLesson(arTrialLesson)).toBe(true);
      expect(isTrialLesson(arPaidLesson)).toBe(false);
      expect(isTrialLesson({ ...arPaidLesson, isTrial: true })).toBe(true);
    });

    it("rejects unpublished lessons, wrong track/grade, and locked paid lessons for trial users", () => {
      const arTrialStudent = {
        role: "STUDENT",
        subscriptionStatus: "TRIAL",
        systemId: "sys1",
        gradeId: "g11",
        schoolCategory: "ARABIC" as const,
      };
      const enTrialStudent = {
        ...arTrialStudent,
        schoolCategory: "LANGUAGES" as const,
      };
      const arPaidStudent = { ...arTrialStudent, subscriptionStatus: "ACTIVE" };

      expect(canUserAccessLesson(arTrialStudent, arTrialLesson)).toEqual({ allowed: true });
      expect(canUserAccessLesson(arTrialStudent, arPaidLesson)).toEqual({
        allowed: false,
        reason: "SUBSCRIPTION_REQUIRED",
      });
      expect(canUserAccessLesson(arPaidStudent, arPaidLesson)).toEqual({ allowed: true });
      expect(canUserAccessLesson(enTrialStudent, arTrialLesson)).toEqual({
        allowed: false,
        reason: "OUT_OF_SCOPE",
      });
      expect(
        canUserAccessLesson(arPaidStudent, { ...arTrialLesson, isPublished: false })
      ).toEqual({
        allowed: false,
        reason: "UNPUBLISHED",
      });
    });

    it("blocks locked lesson progress & offline package fetches for trial students", async () => {
      mockPrisma.lesson.findUnique.mockResolvedValue({
        id: "l-paid",
        isPublished: true,
        isTrial: false,
        order: 2,
        durationMinutes: 15,
        unit: {
          id: "u1",
          title: "Unit 1",
          isPublished: true,
          order: 1,
          subject: {
            id: "sub-ar",
            name: "Arabic CS",
            color: "#800B34",
            isPublished: true,
            gradeId: "g11",
            trackId: null,
            schoolCategory: "ARABIC",
          },
        },
        content: null,
        summary: null,
        mindMap: null,
      });

      const arTrialUser = {
        role: "STUDENT",
        subscriptionStatus: "TRIAL",
        systemId: "sys1",
        gradeId: "g11",
        schoolCategory: "ARABIC" as const,
      };

      await expect(
        StudentService.updateLessonProgress("u-1", "l-paid", { progressPercent: 100 }, arTrialUser)
      ).rejects.toMatchObject({ status: 403 });

      await expect(
        OfflineService.generateLessonOfflinePackage("l-paid", arTrialUser)
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  describe("Search, Notification & Flashcard isolation", () => {
    it("enforces unit.isPublished & subject.isPublished + schoolCategory in SearchService even without gradeId", async () => {
      mockPrisma.lesson.findMany.mockResolvedValue([]);
      mockPrisma.subject.findMany.mockResolvedValue([]);
      mockPrisma.question.findMany.mockResolvedValue([]);

      await SearchService.globalSearch("encryption", {
        systemId: null,
        gradeId: null,
        schoolCategory: "LANGUAGES",
        trackId: null,
      });

      expect(mockPrisma.lesson.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublished: true,
            unit: {
              isPublished: true,
              subject: {
                is: expect.objectContaining({
                  isPublished: true,
                  schoolCategory: "LANGUAGES",
                }),
              },
            },
          }),
        })
      );
    });

    it("suppresses daily challenge bell notification when DailyChallenge was completed and scopes mistakes", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "stu-en",
        role: "STUDENT",
        systemId: "sys1",
        gradeId: "g11",
        trackId: null,
        schoolCategory: "LANGUAGES",
      });
      mockPrisma.examAttempt.findFirst.mockResolvedValue(null);
      mockPrisma.dailyChallenge.findUnique.mockResolvedValue({ completedAt: new Date() });
      mockPrisma.mistakeReview.count.mockResolvedValue(2);
      mockPrisma.studentProgress.findFirst.mockResolvedValue(null);
      mockPrisma.announcement.findMany.mockResolvedValue([]);

      const list = await NotificationService.getInAppNotifications("stu-en");
      expect(list.some((n) => n.type === "DAILY_EXAM")).toBe(false);
      expect(list.some((n) => n.type === "MISTAKES")).toBe(true);
      expect(mockPrisma.mistakeReview.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "stu-en",
            isResolved: false,
            question: expect.objectContaining({
              status: "PUBLISHED",
              subject: expect.objectContaining({
                isPublished: true,
                schoolCategory: "LANGUAGES",
              }),
            }),
          }),
        })
      );
    });

    it("does not create a Question row when resolving an absent flashcard mistake, and uses exact statement lookup", async () => {
      mockUser.mockResolvedValue({
        id: "stu-1",
        role: "STUDENT",
        subscriptionStatus: "ACTIVE",
        gradeId: "g11",
        schoolCategory: "LANGUAGES",
      });
      mockPrisma.lesson.findUnique.mockResolvedValue({
        id: "l-1",
        isPublished: true,
        isTrial: false,
        order: 1,
        unitId: "u-1",
        unit: {
          id: "u-1",
          order: 1,
          isPublished: true,
          subjectId: "sub-en",
          subject: {
            id: "sub-en",
            isPublished: true,
            gradeId: "g11",
            trackId: null,
            schoolCategory: "LANGUAGES",
          },
        },
      });
      mockPrisma.question.findFirst.mockResolvedValue(null);

      const req = new Request("http://localhost/api/lessons/l-1/flashcards/mistake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: "Firewall",
          meaning: "Filters network traffic",
          action: "RESOLVE_MISTAKE",
        }),
      });

      const res = await flashcardsMistakePost(req, { params: Promise.resolve({ id: "l-1" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.action).toBe("RESOLVED");
      expect(data.questionId).toBeNull();
      expect(mockPrisma.question.create).not.toHaveBeenCalled();
    });

    it("blocks receipt file uploads from temporary demo sandbox sessions", async () => {
      mockUser.mockResolvedValue({
        id: "demo-1",
        role: "STUDENT",
        loginCode: "DEMO-AR-ABCD1234",
      });
      const req = new Request("http://localhost/api/student/subscription/receipt", {
        method: "POST",
      });
      const res = await receiptPost(req);
      expect(res.status).toBe(403);
    });
  });
});
