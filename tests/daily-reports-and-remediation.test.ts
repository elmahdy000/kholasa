import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCairoDayKey,
  getCairoDayRange,
  getCairoStartOfDayFromKey,
} from "@/lib/date";
import {
  buildRateLimitError,
  computeRateLimitWindow,
  formatArabicWaitTime,
  parseRetryAfterCode,
} from "@/lib/rate-limit";
import {
  collectOfflineLessonAssetUrls,
  normalizeOfflineAssetUrl,
} from "@/lib/offline-db";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  grade: { findUnique: vi.fn() },
  educationalSystem: { findUnique: vi.fn() },
  academicTrack: { findUnique: vi.fn() },
  session: { findMany: vi.fn() },
  examAttempt: { findMany: vi.fn() },
  studentProgress: { findMany: vi.fn() },
  dailyChallenge: { findMany: vi.fn() },
  mistakeReview: {
    findMany: vi.fn(),
    groupBy: vi.fn(),
  },
  questionAttempt: { findMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { DailyReportsService } from "@/services/daily-reports.service";
import { StudentService } from "@/services/student.service";

describe("Cairo Timezone Helpers", () => {
  it("buckets 22:30 UTC (00:30 Cairo) into the next Cairo day", () => {
    const utcLateNight = new Date("2026-11-10T22:30:00.000Z");
    expect(getCairoDayKey(utcLateNight)).toBe("2026-11-11");
  });

  it("produces contiguous half-open UTC bounds for Africa/Cairo days", () => {
    const { dayKey, start, end } = getCairoDayRange("2026-11-10");
    expect(dayKey).toBe("2026-11-10");
    expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);
    expect(getCairoDayKey(start)).toBe("2026-11-10");
    expect(getCairoDayKey(new Date(end.getTime() - 1))).toBe("2026-11-10");
    expect(getCairoDayKey(end)).toBe("2026-11-11");
  });

  it("maps start of Cairo winter day to 22:00 UTC of previous UTC date", () => {
    const start = getCairoStartOfDayFromKey("2026-11-10");
    expect(start.toISOString()).toBe("2026-11-09T22:00:00.000Z");
  });
});

describe("Rate-Limit Reassurance & Window Calculations", () => {
  it("formats Arabic wait times and Retry-After codes accurately", () => {
    expect(formatArabicWaitTime(1)).toBe("ثانية واحدة");
    expect(formatArabicWaitTime(5)).toBe("5 ثوانٍ");
    expect(formatArabicWaitTime(45)).toBe("45 ثانية");
    expect(formatArabicWaitTime(120)).toBe("دقيقتين");

    const err = buildRateLimitError(45);
    expect(err.status).toBe(429);
    expect(err.code).toBe("RETRY_AFTER_45");
    expect(err.message).toContain("حسابك سليم وغير معطّل");
    expect(parseRetryAfterCode(err.code)).toBe(45);
  });

  it("enforces sliding window hits accurately", () => {
    const now = 100_000;
    const windowMs = 60_000;
    const hits = [50_000, 60_000, 90_000];
    const allowed = computeRateLimitWindow(hits, 4, windowMs, now);
    expect(allowed.allowed).toBe(true);

    const blocked = computeRateLimitWindow(hits, 3, windowMs, now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBe(10);
  });
});

describe("Offline Asset Normalization & Collection", () => {
  it("collects and deduplicates lesson PDF, audio, summary, and mindmap images", () => {
    expect(normalizeOfflineAssetUrl("https://www.youtube.com/watch?v=123", "https://el-kholasa.online")).toBeNull();
    expect(normalizeOfflineAssetUrl("/api/media/documents/doc1.pdf")).toBe("/api/media/documents/doc1.pdf");
    expect(normalizeOfflineAssetUrl("https://el-kholasa.online/api/media/audio/a1.mp3", "https://el-kholasa.online")).toBe("/api/media/audio/a1.mp3");

    const urls = collectOfflineLessonAssetUrls(
      {
        pdfUrl: "/api/media/documents/lesson.pdf",
        audioUrl: "https://el-kholasa.online/api/media/audio/lesson.mp3",
        summary: {
          pdfUrl: "/api/media/documents/lesson.pdf",
          images: ["/api/media/images/s1.png", { url: "/api/media/images/s2.webp" }],
        },
        mindMap: {
          images: ["/api/media/images/mm1.png", "/api/media/images/s1.png"],
        },
      },
      "https://el-kholasa.online"
    );

    expect(urls).toEqual([
      "/api/media/documents/lesson.pdf",
      "/api/media/audio/lesson.mp3",
      "/api/media/images/s1.png",
      "/api/media/images/s2.webp",
      "/api/media/images/mm1.png",
    ]);
  });
});

describe("Student Profile schoolCategory Update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows updating student schoolCategory cleanly via StudentService.updateProfile", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "stu_1",
      role: "STUDENT",
      gradeId: "grade_10",
      systemId: "sys_bacc",
      schoolCategory: "ARABIC",
      trackId: "trk_1",
    });
    mockPrisma.grade.findUnique.mockResolvedValueOnce({
      systemId: "sys_bacc",
      system: { isActive: true },
    });
    mockPrisma.educationalSystem.findUnique.mockResolvedValueOnce({
      isActive: true,
    });
    mockPrisma.academicTrack.findUnique.mockResolvedValueOnce({
      gradeId: "grade_10",
    });
    mockPrisma.user.update.mockResolvedValueOnce({
      id: "stu_1",
      name: "أحمد",
      phone: null,
      systemId: "sys_bacc",
      gradeId: "grade_10",
      schoolCategory: "LANGUAGES",
      trackId: "trk_1",
    });

    const updated = await StudentService.updateProfile("stu_1", {
      schoolCategory: "LANGUAGES",
    });

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "stu_1" },
        data: expect.objectContaining({ schoolCategory: "LANGUAGES" }),
      })
    );
    expect(updated.schoolCategory).toBe("LANGUAGES");
  });
});

describe("DailyReportsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.session.findMany.mockResolvedValue([]);
    mockPrisma.examAttempt.findMany.mockResolvedValue([]);
    mockPrisma.studentProgress.findMany.mockResolvedValue([]);
    mockPrisma.dailyChallenge.findMany.mockResolvedValue([]);
    mockPrisma.mistakeReview.findMany.mockResolvedValue([]);
    mockPrisma.questionAttempt.findMany.mockResolvedValue([]);
    mockPrisma.mistakeReview.groupBy.mockResolvedValue([]);
  });

  it("aggregates Cairo-day activity and operational radar cleanly without fake scores", async () => {
    mockPrisma.user.findMany.mockResolvedValueOnce([
      {
        id: "stu_ar_pending",
        name: "سارة محمود",
        loginCode: "KH-1001",
        phone: "01000000001",
        schoolCategory: "ARABIC",
        studyMode: "OFFLINE",
        centerName: "سنتر رافال عربي",
        subscriptionStatus: "PENDING_VERIFICATION",
        isActive: true,
        maxDevices: 1,
        boundDevices: ["dev_1"],
        paymentReceiptUrl: "/api/media/receipts/r1.jpg",
        paymentSenderPhone: "01012345678",
        paymentReference: "REF-99",
        paymentUploadedAt: new Date("2026-11-10T10:00:00.000Z"),
        createdAt: new Date("2026-11-10T22:15:00.000Z"), // 2026-11-11 00:15 Cairo
        grade: { name: "الصف الأول" },
      },
      {
        id: "stu_en_struggling",
        name: "عمر طارق",
        loginCode: "KH-2002",
        phone: "01000000002",
        schoolCategory: "LANGUAGES",
        studyMode: "ONLINE",
        centerName: null,
        subscriptionStatus: "ACTIVE",
        isActive: true,
        maxDevices: 2,
        boundDevices: ["dev_1"],
        paymentReceiptUrl: null,
        paymentSenderPhone: null,
        paymentReference: null,
        paymentUploadedAt: null,
        createdAt: new Date("2026-10-01T12:00:00.000Z"),
        grade: { name: "الصف الأول" },
      },
    ]);

    // First session call = sessions14, second = recent7DaySessions
    mockPrisma.session.findMany
      .mockResolvedValueOnce([
        { userId: "stu_ar_pending", createdAt: new Date("2026-11-10T23:00:00.000Z") }, // 2026-11-11 01:00 Cairo
      ])
      .mockResolvedValueOnce([]);

    // First examAttempt call = attempts14, second = recent7DayAttempts
    mockPrisma.examAttempt.findMany
      .mockResolvedValueOnce([
        {
          userId: "stu_en_struggling",
          title: "اختبار سريع",
          percentage: 35,
          isCompleted: true,
          startedAt: new Date("2026-11-11T09:00:00.000Z"),
          completedAt: new Date("2026-11-11T09:10:00.000Z"),
        },
      ])
      .mockResolvedValueOnce([{ userId: "stu_en_struggling" }]);

    mockPrisma.studentProgress.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    mockPrisma.dailyChallenge.findMany.mockResolvedValueOnce([
      {
        userId: "stu_ar_pending",
        day: "2026-11-11",
        completedAt: new Date("2026-11-11T11:00:00.000Z"),
        createdAt: new Date("2026-11-11T10:55:00.000Z"),
      },
    ]);

    mockPrisma.mistakeReview.groupBy.mockResolvedValueOnce([
      { userId: "stu_en_struggling", _count: { id: 6 } },
    ]);

    const report = await DailyReportsService.getDailyReport({
      dateKey: "2026-11-11",
    });

    expect(report.dateKey).toBe("2026-11-11");
    expect(report.summary.activeStudentsToday).toBe(2);
    expect(report.summary.activeArabicCount).toBe(1);
    expect(report.summary.activeLanguagesCount).toBe(1);
    expect(report.summary.newRegistrationsToday).toBe(1);
    expect(report.summary.examsCompleted).toBe(1);
    expect(report.summary.averageExamScore).toBe(35);
    expect(report.summary.dailyChallengesCompleted).toBe(1);

    expect(report.radar.pendingPaymentsCount).toBe(1);
    expect(report.radar.deviceLimitCount).toBe(1);
    expect(report.radar.strugglingCount).toBe(1);
    expect(report.radar.strugglingStudents[0].lowestExamPercent).toBe(35);
    expect(report.centerBreakdown[0]).toEqual({
      centerName: "سنتر رافال عربي",
      category: "ARABIC",
      totalStudents: 1,
      activeToday: 1,
    });
  });

  it("returns null averageExamScore when no exams are completed on the day", async () => {
    mockPrisma.user.findMany.mockResolvedValueOnce([]);
    const report = await DailyReportsService.getDailyReport({
      dateKey: "2026-11-10",
    });
    expect(report.summary.examsCompleted).toBe(0);
    expect(report.summary.averageExamScore).toBeNull();
  });
});

