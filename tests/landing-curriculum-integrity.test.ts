import { describe, expect, it, vi, beforeEach } from "vitest";
import { SchoolCategory } from "@prisma/client";

const mockPrisma = vi.hoisted(() => ({
  grade: {
    findMany: vi.fn(),
  },
  subject: {
    findMany: vi.fn(),
  },
  questionLesson: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockHeaders = vi.hoisted(() =>
  vi.fn().mockResolvedValue(new Headers({ "x-real-ip": "127.0.0.1" }))
);
vi.mock("next/headers", () => ({ headers: mockHeaders }));

import { getLandingCurriculumData, pickDeterministicPreviewMcq } from "@/lib/landing-curriculum";
import { verifyLandingPreviewAnswer } from "@/app/actions/landing-preview";

describe("Landing Page Curriculum Accuracy & Answer Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads only official Baccalaureate grades and strips isCorrect/explanation from initial preview payload", async () => {
    mockPrisma.grade.findMany.mockResolvedValue([
      { id: "g10", name: "أولى بكالوريا", code: "bacc_g10", order: 1 },
      { id: "g11", name: "تانية بكالوريا", code: "bacc_g11", order: 2 },
    ]);

    mockPrisma.subject.findMany.mockResolvedValue([
      {
        id: "sub-ar",
        name: "بكالوريا عربي",
        code: "g11_programming_ai_ar",
        description: "منهج البرمجة والذكاء الاصطناعي",
        color: "#800B34",
        schoolCategory: SchoolCategory.ARABIC,
        grade: { id: "g11", name: "تانية بكالوريا", code: "bacc_g11" },
        track: null,
        units: [
          {
            id: "unit-ar-1",
            title: "الوحدة الأولى: تكنولوجيا المعلومات والمجتمع",
            description: null,
            order: 1,
            lessons: [
              {
                id: "lesson-ar-1",
                title: "1. تطور تكنولوجيا المعلومات وتأثيرها المجتمعي",
                order: 1,
                durationMinutes: 15,
                summary: {
                  definitions: [
                    { term: "الحوسبة السحابية", meaning: "تقديم خدمات الحاسوب عبر الإنترنت" },
                  ],
                },
                mindMap: {
                  title: "خريطة الدرس",
                  description: null,
                  images: ["/api/media/images/sample.png"],
                  nodes: [],
                  edges: [],
                },
                _count: { questions: 10 },
              },
            ],
          },
        ],
        _count: { units: 1, questions: 10 },
      },
    ]);

    mockPrisma.questionLesson.findMany.mockResolvedValue([
      {
        question: {
          id: "q-ar-1",
          statement: "ما التقنية التي استخدمتها الحواسيب الإلكترونية الأولى مثل ENIAC؟",
          translation: null,
          difficulty: "EASY",
          options: [
            { id: "opt-1", text: "الصمامات المفرغة", translation: null, order: 1, isCorrect: true },
            { id: "opt-2", text: "الحوسبة الطرفية", translation: null, order: 2, isCorrect: false },
          ],
          explanation: {
            concept: "تطور الحواسيب",
            correctReason: "اعتمدت الحواسيب الإلكترونية الأولى على الصمامات المفرغة.",
          },
        },
      },
    ]);

    const data = await getLandingCurriculumData();

    expect(data.grades).toHaveLength(2);
    expect(data.subjects).toHaveLength(1);
    const previewMcq = data.subjects[0].units[0].lessons[0].previewMcq;
    expect(previewMcq).not.toBeNull();
    expect(previewMcq?.id).toBe("q-ar-1");

    // Ensure ZERO leakage of isCorrect or explanation into SSR serialized payload
    const serialized = JSON.stringify(previewMcq);
    expect(serialized).not.toContain("isCorrect");
    expect(serialized).not.toContain("correctReason");
    expect(data.heroQuestions.arabic?.question.id).toBe("q-ar-1");
    expect(data.heroQuestions.languages).toBeNull();
  });

  it("returns null previewMcq cleanly when a lesson has no published MCQ with an explanation", async () => {
    mockPrisma.questionLesson.findMany.mockResolvedValue([
      {
        question: {
          id: "q-no-exp",
          statement: "سؤال بدون تفسير",
          translation: null,
          difficulty: "EASY",
          options: [
            { id: "o1", text: "أ", translation: null, order: 1, isCorrect: true },
            { id: "o2", text: "ب", translation: null, order: 2, isCorrect: false },
          ],
          explanation: { concept: "", correctReason: "" },
        },
      },
    ]);

    const picked = await pickDeterministicPreviewMcq("lesson-no-exp");
    expect(picked).toBeNull();
  });

  it("verifies submitted answers via Server Action and blocks mismatched/arbitrary question IDs", async () => {
    mockPrisma.questionLesson.findMany.mockResolvedValue([
      {
        question: {
          id: "q-authorized-preview",
          statement: "Which technology processes data directly on the device?",
          translation: null,
          difficulty: "MEDIUM",
          options: [
            { id: "opt-cloud", text: "Cloud Computing", translation: null, order: 1, isCorrect: false },
            { id: "opt-edge", text: "Edge Computing", translation: null, order: 2, isCorrect: true },
          ],
          explanation: {
            concept: "Edge Computing",
            correctReason: "Edge Computing processes data locally on the device.",
          },
        },
      },
    ]);

    // 1. Reject arbitrary questionId not matching the lesson's deterministic preview question
    const unauthorizedCheck = await verifyLandingPreviewAnswer({
      lessonId: "lesson-en-1",
      questionId: "q-private-other",
      selectedOptionId: "opt-edge",
    });
    expect(unauthorizedCheck.ok).toBe(false);

    // 2. Wrong answer returns isCorrect: false + correctOptionId + verified explanation
    const wrongCheck = await verifyLandingPreviewAnswer({
      lessonId: "lesson-en-1",
      questionId: "q-authorized-preview",
      selectedOptionId: "opt-cloud",
    });
    expect(wrongCheck.ok).toBe(true);
    expect(wrongCheck.isCorrect).toBe(false);
    expect(wrongCheck.correctOptionId).toBe("opt-edge");
    expect(wrongCheck.explanation?.correctReason).toContain("Edge Computing processes data locally");

    // 3. Right answer returns isCorrect: true
    const rightCheck = await verifyLandingPreviewAnswer({
      lessonId: "lesson-en-1",
      questionId: "q-authorized-preview",
      selectedOptionId: "opt-edge",
    });
    expect(rightCheck.ok).toBe(true);
    expect(rightCheck.isCorrect).toBe(true);
  });
});

