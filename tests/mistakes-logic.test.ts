import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizeRubricCriteria } from "@/lib/rubric";

const mockPrisma = vi.hoisted(() => ({
  questionAttempt: {
    upsert: vi.fn(),
  },
  mistakeReview: {
    upsert: vi.fn(),
    updateMany: vi.fn(),
  },
  dailyChallenge: {
    upsert: vi.fn(),
    findMany: vi.fn(),
  },
}));

const mockUser = vi.hoisted(() => vi.fn());
const mockGetQuestionForAnswer = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: mockUser }));
vi.mock("@/services/question.service", () => ({
  QuestionService: {
    getQuestionForAnswer: mockGetQuestionForAnswer,
  },
}));

import { POST as answerQuestionPost } from "@/app/api/questions/[id]/answer/route";
import { MistakeService } from "@/services/mistake.service";

describe("Mistakes Logic & Track Compatibility (Arabic & Languages)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.questionAttempt.upsert.mockResolvedValue({});
    mockPrisma.mistakeReview.upsert.mockResolvedValue({ wrongCount: 1, isResolved: false });
    mockPrisma.mistakeReview.updateMany.mockResolvedValue({ count: 1 });
  });

  it("normalizes all essay rubric criteria formats cleanly", () => {
    const raw = [
      "صياغة المفهوم العلمي",
      { title: "توضيح دور PC", marks: 2.5 },
      { point: "ذكر مثال تطبيقي", marks: 2 },
      { criterion: "Explain encryption key", points: 3 },
      { empty: true },
    ];

    expect(normalizeRubricCriteria(raw)).toEqual([
      { text: "صياغة المفهوم العلمي" },
      { text: "توضيح دور PC", marks: 2.5 },
      { text: "ذكر مثال تطبيقي", marks: 2 },
      { text: "Explain encryption key", marks: 3 },
    ]);
  });

  it("marks an essay question for review in MistakeReview while saving essayText draft", async () => {
    mockUser.mockResolvedValue({
      id: "stu-1",
      role: "STUDENT",
      schoolCategory: "ARABIC",
      gradeId: "g11",
      systemId: "sys-1",
      trackId: null,
    });
    mockGetQuestionForAnswer.mockResolvedValue({
      id: "q-essay-1",
      type: "ESSAY",
      status: "PUBLISHED",
      subject: {
        id: "sub-ar",
        isPublished: true,
        gradeId: "g11",
        systemId: "sys-1",
        trackId: null,
        schoolCategory: "ARABIC",
      },
      options: [],
      explanation: { concept: "التشفير", correctReason: "حماية البيانات" },
      rubric: { modelAnswer: "التشفير يحمي سرية البيانات", criteria: [], maxScore: 3 },
    });

    const req = new Request("http://localhost/api/questions/q-essay-1/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        markForReview: true,
        essayText: "مسودة إجابة الطالب",
      }),
    });

    const res = await answerQuestionPost(req, { params: Promise.resolve({ id: "q-essay-1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.markedForReview).toBe(true);
    expect(data.isResolved).toBe(false);

    expect(mockPrisma.mistakeReview.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_questionId: { userId: "stu-1", questionId: "q-essay-1" } },
        create: expect.objectContaining({ isResolved: false, wrongCount: 1 }),
        update: expect.objectContaining({ isResolved: false }),
      })
    );
    expect(mockPrisma.questionAttempt.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ essayText: "مسودة إجابة الطالب", isCorrect: false }),
        create: expect.objectContaining({ essayText: "مسودة إجابة الطالب", isCorrect: false }),
      })
    );
  });

  it("saves essay draft without forcing MistakeReview resolution when viewing model answer", async () => {
    mockUser.mockResolvedValue({
      id: "stu-1",
      role: "STUDENT",
      schoolCategory: "ARABIC",
      gradeId: "g11",
      systemId: "sys-1",
      trackId: null,
    });
    mockGetQuestionForAnswer.mockResolvedValue({
      id: "q-essay-2",
      type: "ESSAY",
      status: "PUBLISHED",
      subject: {
        id: "sub-ar",
        isPublished: true,
        gradeId: "g11",
        systemId: "sys-1",
        trackId: null,
        schoolCategory: "ARABIC",
      },
      options: [],
      explanation: null,
      rubric: { modelAnswer: "النموذج المعتمد", modelAnswerTranslation: null, criteria: [], maxScore: 4 },
    });

    const req = new Request("http://localhost/api/questions/q-essay-2/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ essayText: "محاولة أولى" }),
    });

    const res = await answerQuestionPost(req, { params: Promise.resolve({ id: "q-essay-2" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.isEssay).toBe(true);
    expect(data.modelAnswer).toBe("النموذج المعتمد");
    expect(mockPrisma.mistakeReview.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.questionAttempt.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ essayText: "محاولة أولى" }),
      })
    );
  });

  it("preserves essayText when resolve: true unmarks an essay mistake", async () => {
    mockUser.mockResolvedValue({
      id: "stu-1",
      role: "STUDENT",
      schoolCategory: "LANGUAGES",
      gradeId: "g11",
      systemId: "sys-1",
      trackId: null,
    });
    mockGetQuestionForAnswer.mockResolvedValue({
      id: "q-essay-en",
      type: "ESSAY",
      status: "PUBLISHED",
      subject: {
        id: "sub-en",
        isPublished: true,
        gradeId: "g11",
        systemId: "sys-1",
        trackId: null,
        schoolCategory: "LANGUAGES",
      },
      options: [],
      explanation: null,
      rubric: { modelAnswer: "Definition...", criteria: [], maxScore: 2 },
    });

    const req = new Request("http://localhost/api/questions/q-essay-en/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolve: true, essayText: "My final draft" }),
    });

    const res = await answerQuestionPost(req, { params: Promise.resolve({ id: "q-essay-en" }) });
    expect(res.status).toBe(200);
    expect(mockPrisma.mistakeReview.updateMany).toHaveBeenCalled();
    expect(mockPrisma.questionAttempt.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ essayText: "My final draft", isCorrect: true }),
      })
    );
  });

  it("rejects out-of-scope track question and invalid MCQ option without recording bogus mistake", async () => {
    mockUser.mockResolvedValue({
      id: "stu-ar",
      role: "STUDENT",
      schoolCategory: "ARABIC",
      gradeId: "g11",
      systemId: "sys-1",
      trackId: null,
    });

    // Cross-track (Languages question accessed by Arabic student)
    mockGetQuestionForAnswer.mockResolvedValue({
      id: "q-en-only",
      type: "MCQ",
      status: "PUBLISHED",
      subject: {
        id: "sub-en",
        isPublished: true,
        gradeId: "g11",
        systemId: "sys-1",
        trackId: null,
        schoolCategory: "LANGUAGES",
      },
      options: [{ id: "o1", text: "A", isCorrect: true }],
    });

    const forbiddenReq = new Request("http://localhost/api/questions/q-en-only/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedOptionId: "o1" }),
    });
    const forbiddenRes = await answerQuestionPost(forbiddenReq, {
      params: Promise.resolve({ id: "q-en-only" }),
    });
    expect(forbiddenRes.status).toBe(403);

    // Valid scope but invalid optionId
    mockGetQuestionForAnswer.mockResolvedValue({
      id: "q-ar-1",
      type: "MCQ",
      status: "PUBLISHED",
      subject: {
        id: "sub-ar",
        isPublished: true,
        gradeId: "g11",
        systemId: "sys-1",
        trackId: null,
        schoolCategory: "ARABIC",
      },
      options: [{ id: "real-opt", text: "إجابة", isCorrect: true }],
    });

    const badOptReq = new Request("http://localhost/api/questions/q-ar-1/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedOptionId: "non-existent-opt" }),
    });
    const badOptRes = await answerQuestionPost(badOptReq, {
      params: Promise.resolve({ id: "q-ar-1" }),
    });
    expect(badOptRes.status).toBe(400);
    expect(mockPrisma.mistakeReview.upsert).not.toHaveBeenCalled();
  });

  it("MistakeService.markForReview does not inflate wrongCount when updating", async () => {
    await MistakeService.markForReview("stu-1", "q-1");
    expect(mockPrisma.mistakeReview.upsert).toHaveBeenCalledWith({
      where: { userId_questionId: { userId: "stu-1", questionId: "q-1" } },
      create: expect.objectContaining({ wrongCount: 1, isResolved: false }),
      update: expect.not.objectContaining({ wrongCount: expect.anything() }),
    });
  });

  it("correctly groups and filters mistakes exam by primary subject", () => {
    const mistakes = [
      { questionId: "q1", question: { subjectId: "sub-languages", subject: { schoolCategory: "LANGUAGES" } } },
      { questionId: "q2", question: { subjectId: "sub-languages", subject: { schoolCategory: "LANGUAGES" } } },
      { questionId: "q3", question: { subjectId: "sub-arabic", subject: { schoolCategory: "ARABIC" } } },
    ];

    const primarySubjectId = mistakes[0].question.subjectId;
    const subjectMistakes = mistakes.filter((m) => m.question.subjectId === primarySubjectId);

    expect(primarySubjectId).toBe("sub-languages");
    expect(subjectMistakes).toHaveLength(2);
    expect(subjectMistakes.every((m) => m.question.subject.schoolCategory === "LANGUAGES")).toBe(true);
  });
});
