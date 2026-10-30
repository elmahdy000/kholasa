import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { studentAnswer: db } }));
import { ExamAttemptService } from "@/services/exam/attempt";

describe("admin grading validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.findUnique.mockResolvedValue({ attemptId: "actual-attempt", attempt: { isCompleted: true }, question: { type: "ESSAY", rubric: { maxScore: 10 } } });
  });

  it("rejects an answer from another attempt before writing", async () => {
    await expect(ExamAttemptService.gradeStudentAnswer("answer", true, 10, "other-attempt")).rejects.toThrow("الإجابة لا تنتمي");
    expect(db.update).not.toHaveBeenCalled();
  });

  it.each([-1, 11, NaN, Infinity])("rejects invalid score %s", async (score) => {
    await expect(ExamAttemptService.gradeStudentAnswer("answer", true, score)).rejects.toThrow("الدرجة خارج");
    expect(db.update).not.toHaveBeenCalled();
  });

  it("rejects grading an unfinished attempt", async () => {
    db.findUnique.mockResolvedValue({ attemptId: "actual-attempt", attempt: { isCompleted: false }, question: { type: "ESSAY" } });
    await expect(ExamAttemptService.gradeStudentAnswer("answer", true, 10)).rejects.toThrow("قبل تسليمها");
    expect(db.update).not.toHaveBeenCalled();
  });
});
