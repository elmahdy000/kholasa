import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockCanManageCurriculum = vi.hoisted(() => vi.fn());
const mockUpdateLesson = vi.hoisted(() => vi.fn());
const mockLogAuditAction = vi.hoisted(() => vi.fn());
const mockRevalidatePath = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  isStaff: vi.fn().mockReturnValue(true),
  canManageCurriculum: mockCanManageCurriculum,
}));
vi.mock("@/services/curriculum.service", () => ({
  CurriculumService: {
    updateLesson: mockUpdateLesson,
    getLesson: vi.fn(),
    deleteLesson: vi.fn(),
  },
}));
vi.mock("@/services/analytics.service", () => ({
  AnalyticsService: {
    logAuditAction: mockLogAuditAction,
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

import {
  extractRichArabicVocabularyItems,
  rebuildArabicSectionBlocks,
} from "@/lib/arabic-curriculum";
import { subscribeRealtimeEvents } from "@/lib/realtime";
import { PUT as updateLessonRoute } from "@/app/api/admin/lessons/[id]/route";

describe("Definitions & Arabic Vocabulary Permanent DB Deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not resurrect deleted Arabic vocabulary items when explicit empty array [] is passed", () => {
    const sampleSection = {
      id: "u1-l1-s05",
      order: 5,
      stageId: "understand" as const,
      title: "المفردات",
      summary: "",
      sourceReferences: [],
      teacherExplanation: [],
      examSolvingMethod: [],
      commonTraps: [],
      keywords: [],
      activities: [],
      practiceQuestionIds: [],
      visualization: {
        type: "word_cards" as const,
        cards: [
          { word: "مستعصية", meaning: "صعبة العلاج" },
          { word: "طوق النجاة", meaning: "ما يُنقذ من الخطر" },
        ],
      },
    };

    const qMap = new Map();
    expect(extractRichArabicVocabularyItems([sampleSection], qMap)).toHaveLength(2);
    expect(extractRichArabicVocabularyItems([sampleSection], qMap, [])).toEqual([]);

    const rebuiltBlocks = rebuildArabicSectionBlocks(
      sampleSection,
      "vocabulary",
      {},
      qMap,
      []
    );
    const vocabBlock = rebuiltBlocks.find((b) => b.type === "vocabulary");
    expect(vocabBlock).toBeDefined();
    expect((vocabBlock?.payload as { cards: unknown[] }).cards).toEqual([]);
  });

  it("persists partial definitions deletions (including empty [] and translation preservation) via PUT /api/admin/lessons/[id]", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "adm-1", role: "ADMIN" });
    mockCanManageCurriculum.mockReturnValue(true);
    mockUpdateLesson.mockResolvedValue({ id: "lesson-1", title: "Lesson 1" });

    const events: string[] = [];
    const unsub = subscribeRealtimeEvents((e) => events.push(`${e.topic}:${e.action}:${e.entityId}`));

    const reqWithRemaining = new Request("http://localhost/api/admin/lessons/lesson-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: {
          definitions: [
            { term: "CPU", meaning: "Central Processing Unit", translation: "وحدة المعالجة المركزية" },
          ],
        },
      }),
    });

    const res1 = await updateLessonRoute(reqWithRemaining, {
      params: Promise.resolve({ id: "lesson-1" }),
    });
    expect(res1.status).toBe(200);
    expect(mockUpdateLesson).toHaveBeenCalledWith("lesson-1", {
      summary: {
        definitions: [
          { term: "CPU", meaning: "Central Processing Unit", translation: "وحدة المعالجة المركزية" },
        ],
      },
    });

    const reqClearAll = new Request("http://localhost/api/admin/lessons/lesson-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: { definitions: [] },
      }),
    });

    const res2 = await updateLessonRoute(reqClearAll, {
      params: Promise.resolve({ id: "lesson-1" }),
    });
    unsub();

    expect(res2.status).toBe(200);
    expect(mockUpdateLesson).toHaveBeenLastCalledWith("lesson-1", {
      summary: { definitions: [] },
    });
    expect(events).toContain("curriculum:lesson_updated:lesson-1");
  });
});

