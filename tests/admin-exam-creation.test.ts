import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  question: { count: vi.fn(), findMany: vi.fn() },
  unit: { findFirst: vi.fn() }, lesson: { findFirst: vi.fn() },
  exam: { create: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
import { ExamCoreService } from "@/services/exam/core";

describe("official exam creation safeguards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.question.findMany.mockResolvedValue([{ id: "q1" }, { id: "q2" }, { id: "q3" }]);
    db.question.count.mockResolvedValue(1);
    db.unit.findFirst.mockResolvedValue({ id: "unit" });
    db.lesson.findFirst.mockResolvedValue({ id: "lesson" });
    db.exam.create.mockResolvedValue({ id: "exam" });
  });
  it("rejects an empty exam before writing", async () => {
    await expect(ExamCoreService.createOfficialExam({ title: "Exam", subjectId: "s" })).rejects.toThrow("سؤال واحد");
    expect(db.exam.create).not.toHaveBeenCalled();
  });
  it("rejects insufficient matching questions", async () => {
    await expect(ExamCoreService.createOfficialExam({ title: "Exam", subjectId: "s", randomQuestionsCount: 4 })).rejects.toThrow("أقل من العدد");
    expect(db.exam.create).not.toHaveBeenCalled();
  });
  it("rejects explicit questions outside the published curriculum scope", async () => {
    db.question.count.mockResolvedValue(0);
    await expect(ExamCoreService.createOfficialExam({ title: "Exam", subjectId: "s", questionIds: ["foreign"] })).rejects.toThrow("نطاق الامتحان");
    expect(db.exam.create).not.toHaveBeenCalled();
  });
  it("rejects a unit from another subject", async () => {
    db.unit.findFirst.mockResolvedValue(null);
    await expect(ExamCoreService.createOfficialExam({ title: "Exam", subjectId: "s", unitId: "foreign", randomQuestionsCount: 1 })).rejects.toThrow("الوحدة المختارة");
  });
  it("rejects a lesson outside the selected scope", async () => {
    db.lesson.findFirst.mockResolvedValue(null);
    await expect(ExamCoreService.createOfficialExam({ title: "Exam", subjectId: "s", lessonId: "foreign", randomQuestionsCount: 1 })).rejects.toThrow("الدرس المختار");
  });
  it("samples the requested number without duplicate questions", async () => {
    await ExamCoreService.createOfficialExam({ title: "Exam", subjectId: "s", randomQuestionsCount: 2 });
    const questions = db.exam.create.mock.calls[0][0].data.questions.create;
    expect(questions).toHaveLength(2);
    expect(new Set(questions.map((q: { questionId: string }) => q.questionId)).size).toBe(2);
    expect(db.question.findMany.mock.calls[0][0]).not.toHaveProperty("take");
  });
  it.each([0, -1, 1.5, Infinity])("rejects invalid duration %s", async (durationMinutes) => {
    await expect(ExamCoreService.createOfficialExam({ title: "Exam", subjectId: "s", questionIds: ["q1"], durationMinutes })).rejects.toThrow();
    expect(db.exam.create).not.toHaveBeenCalled();
  });
});
