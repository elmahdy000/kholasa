import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
  findMany: vi.fn(),
}));

const mockAttemptUpdate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    studentAnswer: db,
    examAttempt: { update: mockAttemptUpdate },
    $transaction: vi.fn(async (cb) =>
      cb({
        studentAnswer: db,
        examAttempt: { update: mockAttemptUpdate },
      })
    ),
  },
}));

import { ExamAttemptService } from "@/services/exam/attempt";

describe("admin grading validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.findUnique.mockResolvedValue({
      attemptId: "actual-attempt",
      attempt: { isCompleted: true },
      question: { type: "ESSAY", rubric: { maxScore: 10 } },
    });
  });

  it("rejects an answer from another attempt before writing", async () => {
    await expect(
      ExamAttemptService.gradeStudentAnswer("answer", true, 10, "other-attempt")
    ).rejects.toThrow("الإجابة لا تنتمي");
    expect(db.update).not.toHaveBeenCalled();
  });

  it.each([-1, 11, NaN, Infinity])("rejects invalid score %s", async (score) => {
    await expect(
      ExamAttemptService.gradeStudentAnswer("answer", true, score)
    ).rejects.toThrow("الدرجة خارج");
    expect(db.update).not.toHaveBeenCalled();
  });

  it("rejects grading an unfinished attempt", async () => {
    db.findUnique.mockResolvedValue({
      attemptId: "actual-attempt",
      attempt: { isCompleted: false },
      question: { type: "ESSAY" },
    });
    await expect(
      ExamAttemptService.gradeStudentAnswer("answer", true, 10)
    ).rejects.toThrow("قبل تسليمها");
    expect(db.update).not.toHaveBeenCalled();
  });

  it("performs grading and attempt recalculation inside transaction", async () => {
    db.update.mockResolvedValue({ id: "answer-1", isCorrect: true, score: 8 });
    db.findMany.mockResolvedValue([
      { isCorrect: true, score: 8 },
      { isCorrect: false, score: 0 },
    ]);
    mockAttemptUpdate.mockResolvedValue({
      id: "actual-attempt",
      score: 1,
      percentage: 50,
    });

    const result = await ExamAttemptService.gradeStudentAnswer(
      "answer-1",
      true,
      8,
      "actual-attempt"
    );

    expect(db.update).toHaveBeenCalledWith({
      where: { id: "answer-1" },
      data: { isCorrect: true, score: 8 },
    });
    expect(mockAttemptUpdate).toHaveBeenCalledWith({
      where: { id: "actual-attempt" },
      data: { score: 1, percentage: 50 },
    });
    expect(result).toEqual({
      id: "actual-attempt",
      score: 1,
      percentage: 50,
    });
  });
});
