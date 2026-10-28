import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { QuestionService } from "@/services/question.service";

describe("Question Bank — Image Support and Bulk Actions Tests", () => {
  it("creates a question with optional imageUrl and retrieves it", async () => {
    const subject = await prisma.subject.findFirst();
    expect(subject).toBeDefined();

    const created = await QuestionService.createQuestion({
      statement: "ما هو الرسم البياني الموضح في الشكل؟",
      subjectId: subject!.id,
      type: "MCQ",
      difficulty: "MEDIUM",
      imageUrl: "https://example.com/diagram1.png",
      options: [
        { text: "الدالة الخطية", isCorrect: true },
        { text: "الدالة التربيعية", isCorrect: false },
      ],
    });

    expect(created.id).toBeDefined();
    expect(created.imageUrl).toBe("https://example.com/diagram1.png");

    // Fetch and verify
    const fetched = await QuestionService.getQuestionById(created.id);
    expect(fetched).toBeDefined();
    expect(fetched?.imageUrl).toBe("https://example.com/diagram1.png");

    // Clean up
    await QuestionService.deleteQuestion(created.id);
  });

  it("updates an existing question imageUrl and removes it cleanly", async () => {
    const subject = await prisma.subject.findFirst();
    expect(subject).toBeDefined();

    const question = await QuestionService.createQuestion({
      statement: "سؤال تجريبي لتحديث الصورة",
      subjectId: subject!.id,
      type: "MCQ",
      difficulty: "EASY",
      options: [{ text: "أ", isCorrect: true }, { text: "ب", isCorrect: false }],
    });

    expect(question.imageUrl).toBeNull();

    // Update with image URL
    const updatedWithImage = await QuestionService.updateQuestion(question.id, {
      imageUrl: "https://example.com/updated-figure.svg",
    });
    expect(updatedWithImage?.imageUrl).toBe("https://example.com/updated-figure.svg");

    // Update to remove image URL
    const updatedWithoutImage = await QuestionService.updateQuestion(question.id, {
      imageUrl: null,
    });
    expect(updatedWithoutImage?.imageUrl).toBeNull();

    // Clean up
    await QuestionService.deleteQuestion(question.id);
  });

  it("bulk deletes multiple questions atomically", async () => {
    const subject = await prisma.subject.findFirst();
    expect(subject).toBeDefined();

    // Create 3 questions
    const q1 = await QuestionService.createQuestion({
      statement: "سؤال الحذف المجمع رقم 1",
      subjectId: subject!.id,
      type: "MCQ",
      options: [{ text: "خيار 1", isCorrect: true }],
    });

    const q2 = await QuestionService.createQuestion({
      statement: "سؤال الحذف المجمع رقم 2",
      subjectId: subject!.id,
      type: "MCQ",
      options: [{ text: "خيار 2", isCorrect: true }],
    });

    const q3 = await QuestionService.createQuestion({
      statement: "سؤال لن يتم حذفه",
      subjectId: subject!.id,
      type: "MCQ",
      options: [{ text: "خيار 3", isCorrect: true }],
    });

    // Bulk delete q1 and q2
    const deleteResult = await QuestionService.bulkDeleteQuestions([q1.id, q2.id]);
    expect(deleteResult.count).toBe(2);

    // Verify q1 and q2 are deleted
    const checkQ1 = await QuestionService.getQuestionById(q1.id);
    const checkQ2 = await QuestionService.getQuestionById(q2.id);
    const checkQ3 = await QuestionService.getQuestionById(q3.id);

    expect(checkQ1).toBeNull();
    expect(checkQ2).toBeNull();
    expect(checkQ3).toBeDefined();

    // Verify options were cascade deleted
    const orphanedOptions = await prisma.questionOption.findMany({
      where: { questionId: { in: [q1.id, q2.id] } },
    });
    expect(orphanedOptions.length).toBe(0);

    // Clean up q3
    await QuestionService.deleteQuestion(q3.id);
  });

  it("handles empty array or invalid input gracefully in bulkDeleteQuestions", async () => {
    const emptyResult = await QuestionService.bulkDeleteQuestions([]);
    expect(emptyResult.count).toBe(0);

    const nonExistentResult = await QuestionService.bulkDeleteQuestions(["non-existent-id-xyz"]);
    expect(nonExistentResult.count).toBe(0);
  });
});
