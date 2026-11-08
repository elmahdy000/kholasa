import { describe, expect, it, vi, beforeEach } from "vitest";
import { Role, SchoolCategory, StudyMode, SubscriptionStatus } from "@prisma/client";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  session: {
    findMany: vi.fn(),
  },
  examAttempt: {
    findMany: vi.fn(),
  },
  studentProgress: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { RealtimeAnalyticsService } from "@/services/realtime-analytics.service";

describe("Realtime Observatory & Analytics Data Aggregation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accurately aggregates online count, today active, and curriculum split with zero cross-contamination", async () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const mockStudents = [
      {
        id: "stu-1",
        name: "طالب عربي أونلاين نشط",
        loginCode: "AR-001",
        schoolCategory: SchoolCategory.ARABIC,
        studyMode: StudyMode.ONLINE,
        centerName: null,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        boundDevices: ["dev-1"],
        maxDevices: 1,
        createdAt: now,
        grade: { name: "أولى ثانوي" },
        sessions: [{ createdAt: tenMinutesAgo, durationSeconds: 600 }],
        attempts: [{ id: "att-1", percentage: 95, timeSpentSeconds: 900, completedAt: tenMinutesAgo, startedAt: tenMinutesAgo, exam: { title: "امتحان الحاسب" } }],
        progress: [{ id: "prog-1", isCompleted: true, progressPercent: 100, lastAccessedAt: tenMinutesAgo, lesson: { title: "الدرس الأول" } }],
      },
      {
        id: "stu-2",
        name: "طالب لغات سنتر تجريبي",
        loginCode: "LANG-002",
        schoolCategory: SchoolCategory.LANGUAGES,
        studyMode: StudyMode.OFFLINE,
        centerName: "سنتر النخبة",
        subscriptionStatus: SubscriptionStatus.TRIAL,
        boundDevices: ["dev-2"],
        maxDevices: 1,
        createdAt: now,
        grade: { name: "أولى ثانوي" },
        sessions: [{ createdAt: twoHoursAgo, durationSeconds: 1200 }],
        attempts: [],
        progress: [{ id: "prog-2", isCompleted: false, progressPercent: 40, lastAccessedAt: twoHoursAgo, lesson: { title: "Lesson 1" } }],
      },
      {
        id: "stu-3",
        name: "طالب عربي سنتر قيد المراجعة",
        loginCode: "AR-003",
        schoolCategory: SchoolCategory.ARABIC,
        studyMode: StudyMode.OFFLINE,
        centerName: "سنتر الأوائل",
        subscriptionStatus: SubscriptionStatus.PENDING_VERIFICATION,
        boundDevices: ["dev-3"],
        maxDevices: 1,
        createdAt: now,
        grade: { name: "تانية ثانوي" },
        sessions: [{ createdAt: tenMinutesAgo, durationSeconds: 300 }],
        attempts: [],
        progress: [],
      },
    ];

    mockPrisma.user.findMany.mockResolvedValue(mockStudents);
    mockPrisma.session.findMany.mockResolvedValue([
      { userId: "stu-1", createdAt: tenMinutesAgo, durationSeconds: 600, user: { schoolCategory: SchoolCategory.ARABIC } },
      { userId: "stu-2", createdAt: twoHoursAgo, durationSeconds: 1200, user: { schoolCategory: SchoolCategory.LANGUAGES } },
      { userId: "stu-3", createdAt: tenMinutesAgo, durationSeconds: 300, user: { schoolCategory: SchoolCategory.ARABIC } },
    ]);
    mockPrisma.examAttempt.findMany.mockResolvedValue([]);
    mockPrisma.studentProgress.findMany.mockResolvedValue([]);

    const result = await RealtimeAnalyticsService.getRealtimeObservatory();

    // Verification of high level stats
    expect(result.metrics.registeredTotal).toBe(3);
    expect(result.metrics.todayTotal).toBe(3);
    expect(result.metrics.onlineTotal).toBe(2); // stu-1 and stu-3 are active within 15 mins

    // Curriculum distribution
    expect(result.metrics.registeredArabic).toBe(2);
    expect(result.metrics.registeredLanguages).toBe(1);
    expect(result.metrics.onlineArabic).toBe(2);
    expect(result.metrics.onlineLanguages).toBe(0);

    // Verify individual student items are correctly mapped
    const stu1Item = result.students.find((s) => s.id === "stu-1");
    expect(stu1Item).toBeDefined();
    expect(stu1Item?.isOnline).toBe(true);
    expect(stu1Item?.schoolCategory).toBe("ARABIC");
    expect(stu1Item?.studyMode).toBe("ONLINE");
    expect(stu1Item?.subscriptionStatus).toBe("ACTIVE");
    expect(stu1Item?.examsSolvedCount).toBe(1);
    expect(stu1Item?.lessonsReviewedCount).toBe(1);

    const stu2Item = result.students.find((s) => s.id === "stu-2");
    expect(stu2Item).toBeDefined();
    expect(stu2Item?.isOnline).toBe(false); // 2 hours ago
    expect(stu2Item?.schoolCategory).toBe("LANGUAGES");
    expect(stu2Item?.studyMode).toBe("OFFLINE");
    expect(stu2Item?.centerName).toBe("سنتر النخبة");
    expect(stu2Item?.subscriptionStatus).toBe("TRIAL");

    const stu3Item = result.students.find((s) => s.id === "stu-3");
    expect(stu3Item).toBeDefined();
    expect(stu3Item?.isOnline).toBe(true);
    expect(stu3Item?.studyMode).toBe("OFFLINE");
    expect(stu3Item?.centerName).toBe("سنتر الأوائل");
    expect(stu3Item?.subscriptionStatus).toBe("PENDING_VERIFICATION");
  });

  it("filters students by category (Arabic only filter) correctly", async () => {
    const mockStudents = [
      {
        id: "stu-ar",
        name: "طالب عربي",
        loginCode: "AR-10",
        schoolCategory: SchoolCategory.ARABIC,
        studyMode: StudyMode.ONLINE,
        centerName: null,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        boundDevices: [],
        maxDevices: 1,
        grade: { name: "أولى ثانوي" },
        sessions: [],
        attempts: [],
        progress: [],
      },
      {
        id: "stu-lang",
        name: "Languages Student",
        loginCode: "LANG-20",
        schoolCategory: SchoolCategory.LANGUAGES,
        studyMode: StudyMode.OFFLINE,
        centerName: "سنتر رويال",
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        boundDevices: [],
        maxDevices: 1,
        grade: { name: "أولى ثانوي" },
        sessions: [],
        attempts: [],
        progress: [],
      },
    ];

    mockPrisma.user.findMany.mockResolvedValue(mockStudents);
    mockPrisma.session.findMany.mockResolvedValue([]);
    mockPrisma.examAttempt.findMany.mockResolvedValue([]);
    mockPrisma.studentProgress.findMany.mockResolvedValue([]);

    const arabicOnlyMetrics = await RealtimeAnalyticsService.getRealtimeObservatory({
      category: "ARABIC",
    });

    expect(arabicOnlyMetrics.students.length).toBe(1);
    expect(arabicOnlyMetrics.students[0].id).toBe("stu-ar");
    expect(arabicOnlyMetrics.students[0].schoolCategory).toBe("ARABIC");

    const languagesOnlyMetrics = await RealtimeAnalyticsService.getRealtimeObservatory({
      category: "LANGUAGES",
    });

    expect(languagesOnlyMetrics.students.length).toBe(1);
    expect(languagesOnlyMetrics.students[0].id).toBe("stu-lang");
    expect(languagesOnlyMetrics.students[0].schoolCategory).toBe("LANGUAGES");
  });
});
