import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  mistakeReview: {
    findMany: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
    updateMany: vi.fn(),
  },
  questionAttempt: {
    upsert: vi.fn(),
  },
  dailyChallenge: {
    upsert: vi.fn(),
    findMany: vi.fn(),
  },
}));

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockGetQuestionForAnswer = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/services/question.service", () => ({
  QuestionService: {
    getQuestionForAnswer: mockGetQuestionForAnswer,
  },
}));

import { buildMistakeDiagnosisBreakdown } from "@/lib/mistake-diagnosis";
import { MistakeService } from "@/services/mistake.service";
import { GET as getMistakesSummary } from "@/app/api/student/mistakes-summary/route";
import { POST as answerQuestionPost } from "@/app/api/questions/[id]/answer/route";
import { subscribeRealtimeEvents, type RealtimeEvent } from "@/lib/realtime";
import { STUDENT_NAV_ITEMS } from "@/components/layout/student/navigation";

describe("Mistakes Diagnosis Summary, Realtime Counter & Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.questionAttempt.upsert.mockResolvedValue({});
    mockPrisma.mistakeReview.upsert.mockResolvedValue({ wrongCount: 1, isResolved: false });
    mockPrisma.mistakeReview.updateMany.mockResolvedValue({ count: 1 });
  });

  it("exposes 'مراجعة لأخطائي' in student navigation pointing to /mistakes", () => {
    const mistakesItem = STUDENT_NAV_ITEMS.find((item) => item.href === "/mistakes");
    expect(mistakesItem).toBeDefined();
    expect(mistakesItem?.label).toBe("مراجعة لأخطائي");
  });

  it("aggregates and sorts weakness buckets by count desc then totalWrongs desc", () => {
    const breakdown = buildMistakeDiagnosisBreakdown([
      {
        wrongCount: 1,
        question: {
          subject: { id: "sub-bio", name: "الأحياء", color: "#059669" },
          unit: { title: "الدعامة والحركة" },
          lessons: [{ lesson: { id: "les-1", title: "الحركة في الإنسان" } }],
        },
      },
      {
        wrongCount: 2,
        question: {
          subject: { id: "sub-prog", name: "البرمجة والذكاء الاصطناعي", color: "#800B34" },
          unit: { title: "البيانات والخوارزميات" },
          lessons: [{ lesson: { id: "les-2", title: "المتغيرات والذاكرة" } }],
        },
      },
      {
        wrongCount: 4,
        question: {
          subject: { id: "sub-prog", name: "البرمجة والذكاء الاصطناعي", color: "#800B34" },
          unit: { title: "البيانات والخوارزميات" },
          lessons: [{ lesson: { id: "les-2", title: "المتغيرات والذاكرة" } }],
        },
      },
      {
        wrongCount: 3,
        question: {
          subject: { id: "sub-bio", name: "الأحياء", color: "#059669" },
          unit: { title: "التنسيق الهرموني" },
          lessons: [{ lesson: { id: "les-3", title: "الغدة النخامية" } }],
        },
      },
      {
        wrongCount: 5,
        question: {
          subject: { id: "sub-bio", name: "الأحياء", color: "#059669" },
          unit: { title: "التنسيق الهرموني" },
          lessons: [{ lesson: { id: "les-3", title: "الغدة النخامية" } }],
        },
      },
    ]);

    expect(breakdown).toHaveLength(3);
    // les-3 and les-2 both have 2 unresolved mistakes; les-3 has higher totalWrongs (8 vs 6)
    expect(breakdown[0]).toMatchObject({
      lessonId: "les-3",
      lessonTitle: "الغدة النخامية",
      count: 2,
      totalWrongs: 8,
    });
    expect(breakdown[1]).toMatchObject({
      lessonId: "les-2",
      count: 2,
      totalWrongs: 6,
    });
    expect(breakdown[2]).toMatchObject({
      lessonId: "les-1",
      count: 1,
      totalWrongs: 1,
    });
  });

  it("returns empty breakdown when there are zero unresolved mistakes", () => {
    expect(buildMistakeDiagnosisBreakdown([])).toEqual([]);
  });

  it("excludes under-construction subjects in MistakeService.getStudentMistakeDiagnosisSummary", async () => {
    mockPrisma.mistakeReview.findMany.mockResolvedValue([
      {
        wrongCount: 3,
        question: {
          subject: { id: "sub-prog", name: "Programming", color: "#800B34" },
          unit: { title: "Unit 1" },
          lessons: [{ lesson: { id: "les-cpu", title: "CPU Architecture" } }],
        },
      },
    ]);
    mockPrisma.mistakeReview.count.mockResolvedValue(4);

    const summary = await MistakeService.getStudentMistakeDiagnosisSummary("stu-1", {
      systemId: "bacc",
      gradeId: "bacc_g11",
      schoolCategory: "LANGUAGES",
      trackId: null,
    });

    expect(summary.unresolvedCount).toBe(1);
    expect(summary.resolvedCount).toBe(4);
    expect(summary.topWeakness).toMatchObject({
      subjectId: "sub-prog",
      lessonId: "les-cpu",
      count: 1,
      totalWrongs: 3,
    });

    expect(mockPrisma.mistakeReview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "stu-1",
          isResolved: false,
          question: expect.objectContaining({
            status: "PUBLISHED",
            subject: expect.objectContaining({
              isPublished: true,
              isUnderConstruction: false,
            }),
          }),
        }),
      })
    );
  });

  it("returns zeroed no-store summary from GET /api/student/mistakes-summary for non-students", async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null);
    const guestRes = await getMistakesSummary();
    expect(guestRes.status).toBe(200);
    expect(guestRes.headers.get("Cache-Control")).toContain("no-store");
    expect(await guestRes.json()).toEqual({
      unresolvedCount: 0,
      resolvedCount: 0,
      topWeakness: null,
      breakdown: [],
    });

    mockGetCurrentUser.mockResolvedValueOnce({ id: "adm-1", role: "ADMIN" });
    const adminRes = await getMistakesSummary();
    expect(await adminRes.json()).toEqual({
      unresolvedCount: 0,
      resolvedCount: 0,
      topWeakness: null,
      breakdown: [],
    });
    expect(mockPrisma.mistakeReview.findMany).not.toHaveBeenCalled();
  });

  it("returns live student diagnosis JSON from GET /api/student/mistakes-summary", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "stu-live",
      role: "STUDENT",
      systemId: "bacc",
      gradeId: "bacc_g11",
      schoolCategory: "ARABIC",
      trackId: null,
    });
    mockPrisma.mistakeReview.findMany.mockResolvedValue([
      {
        wrongCount: 2,
        question: {
          subject: { id: "sub-ar-prog", name: "البرمجة والذكاء الاصطناعي", color: "#800B34" },
          unit: { title: "الوحدة الأولى" },
          lessons: [{ lesson: { id: "les-ar-1", title: "تمثيل البيانات" } }],
        },
      },
    ]);
    mockPrisma.mistakeReview.count.mockResolvedValue(2);

    const res = await getMistakesSummary();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
    expect(json.unresolvedCount).toBe(1);
    expect(json.resolvedCount).toBe(2);
    expect(json.topWeakness?.lessonTitle).toBe("تمثيل البيانات");
  });

  it("emits analytics:mistake_updated realtime event on answer submission and review toggle", async () => {
    const receivedEvents: Array<{ topic: string; action: string; targetUserId?: string | null }> = [];
    const unsubscribe = subscribeRealtimeEvents((ev: RealtimeEvent) => {
      receivedEvents.push({
        topic: ev.topic,
        action: ev.action,
        targetUserId: ev.targetUserId,
      });
    });

    try {
      mockGetCurrentUser.mockResolvedValue({
        id: "stu-rt",
        role: "STUDENT",
        schoolCategory: "ARABIC",
        gradeId: "bacc_g11",
        systemId: "bacc",
        trackId: null,
      });
      mockGetQuestionForAnswer.mockResolvedValue({
        id: "q-mcq-1",
        type: "MCQ",
        status: "PUBLISHED",
        subject: {
          id: "sub-ar-prog",
          isPublished: true,
          gradeId: "bacc_g11",
          systemId: "bacc",
          trackId: null,
          schoolCategory: "ARABIC",
        },
        options: [
          { id: "opt-wrong", isCorrect: false },
          { id: "opt-right", isCorrect: true },
        ],
        explanation: null,
        rubric: null,
      });

      const wrongReq = new Request("http://localhost/api/questions/q-mcq-1/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId: "opt-wrong" }),
      });
      const wrongRes = await answerQuestionPost(wrongReq, {
        params: Promise.resolve({ id: "q-mcq-1" }),
      });
      expect(wrongRes.status).toBe(200);

      const resolveReq = new Request("http://localhost/api/questions/q-mcq-1/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolve: true }),
      });
      const resolveRes = await answerQuestionPost(resolveReq, {
        params: Promise.resolve({ id: "q-mcq-1" }),
      });
      expect(resolveRes.status).toBe(200);

      const mistakeEvents = receivedEvents.filter(
        (e) => e.topic === "analytics" && e.action === "mistake_updated" && e.targetUserId === "stu-rt"
      );
      expect(mistakeEvents.length).toBeGreaterThanOrEqual(2);
    } finally {
      unsubscribe();
    }
  });
});

