import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { ExamService } from "@/services";
import { Difficulty, QuestionType } from "@prisma/client";

describe("EL KHOLASA — Difficulty Fallback & Deduplication Logic", () => {
  let createdSubjectId: string | null = null;
  let testUserId: string | null = null;
  const createdExamIds: string[] = [];
  let createdQuestionIds: string[] = [];

  it("should fallback to EASY and HARD without duplicates when MEDIUM questions are missing", async () => {
    // 1. Get or create a student user
    let user = await prisma.user.findFirst({
      where: { role: "STUDENT" },
    });

    if (!user) {
      const grade = await prisma.grade.findFirst();
      const system = await prisma.educationalSystem.findFirst();
      expect(grade).toBeDefined();
      expect(system).toBeDefined();

      user = await prisma.user.create({
        data: {
          name: "طالب اختبار الصعوبة البديلة",
          email: `test-diff-student-${Date.now()}@kholasa.test`,
          password: "dummy-password",
          role: "STUDENT",
          gradeId: grade!.id,
          systemId: system!.id,
          schoolCategory: "ARABIC",
        },
      });
    }
    expect(user).toBeDefined();
    testUserId = user.id;

    // 2. Create an isolated subject with matching curriculum scope
    const subject = await prisma.subject.create({
      data: {
        name: "مادة اختبار التدرج والبدائل",
        code: `DIFF-TEST-${Date.now()}`,
        gradeId: user.gradeId!,
        systemId: user.systemId!,
        schoolCategory: user.schoolCategory || "ARABIC",
        isPublished: true,
      },
    });
    createdSubjectId = subject.id;

    // 3. Create 3 EASY questions and 2 HARD questions (ZERO MEDIUM questions)
    // Include one duplicate statement to rigorously test deduplication!
    const q1 = await prisma.question.create({
      data: {
        statement: "سؤال سهل أول: ما هي وحدة قياس القوة؟",
        type: QuestionType.MCQ,
        difficulty: Difficulty.EASY,
        subjectId: subject.id,
        schoolCategory: subject.schoolCategory,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "نيوتن", order: 1 },
            { text: "جول", order: 2 },
          ],
        },
      },
    });

    const q2 = await prisma.question.create({
      data: {
        statement: "سؤال سهل ثانٍ: ما هو رمز عنصر الصوديوم؟",
        type: QuestionType.MCQ,
        difficulty: Difficulty.EASY,
        subjectId: subject.id,
        schoolCategory: subject.schoolCategory,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "Na", order: 1 },
            { text: "Cl", order: 2 },
          ],
        },
      },
    });

    const q3 = await prisma.question.create({
      data: {
        statement: "سؤال صعب أول: احسب التغير في طاقة الوضع لنظام مغلق؟",
        type: QuestionType.MCQ,
        difficulty: Difficulty.HARD,
        subjectId: subject.id,
        schoolCategory: subject.schoolCategory,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "صفر", order: 1 },
            { text: "100 جول", order: 2 },
          ],
        },
      },
    });

    const q4 = await prisma.question.create({
      data: {
        statement: "سؤال صعب ثانٍ: اشتق علاقة أينشتاين للكتلة والطاقة؟",
        type: QuestionType.MCQ,
        difficulty: Difficulty.HARD,
        subjectId: subject.id,
        schoolCategory: subject.schoolCategory,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "E = mc^2", order: 1 },
            { text: "E = hf", order: 2 },
          ],
        },
      },
    });

    // Potential duplicate with identical statement to q1
    const qDuplicate = await prisma.question.create({
      data: {
        statement: "سؤال سهل أول: ما هي وحدة قياس القوة؟", // Identical to q1
        type: QuestionType.MCQ,
        difficulty: Difficulty.EASY,
        subjectId: subject.id,
        schoolCategory: subject.schoolCategory,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "نيوتن", order: 1 },
            { text: "داين", order: 2 },
          ],
        },
      },
    });

    createdQuestionIds = [q1.id, q2.id, q3.id, q4.id, qDuplicate.id];

    // 4. Verify getExamBuilderStats returns available count (>0) when difficulty is MEDIUM
    const statsCount = await ExamService.getExamBuilderStats({
      subjectId: subject.id,
      difficulty: "MEDIUM",
    });

    // Even though there are 0 medium questions, statsCount must fallback to easy+hard
    expect(statsCount).toBe(5);

    // 5. Create custom exam with difficulty: "MEDIUM"
    const examResult = await ExamService.createCustomExam(
      {
        subjectId: subject.id,
        difficulty: "MEDIUM",
        questionCount: 4,
        mode: "PRACTICE",
      },
      user!.id
    );

    expect(examResult).toBeDefined();
    expect(examResult.examId).toBeDefined();
    createdExamIds.push(examResult.examId);

    // 6. Verify questions in the generated exam
    const generatedExam = await prisma.exam.findUnique({
      where: { id: examResult.examId },
      include: {
        questions: {
          include: {
            question: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    expect(generatedExam).toBeDefined();
    expect(generatedExam!.questions.length).toBeGreaterThan(0);

    // Verify all selected questions are either EASY or HARD (since MEDIUM was 0)
    for (const eq of generatedExam!.questions) {
      expect(["EASY", "HARD"]).toContain(eq.question.difficulty);
    }

    // Verify ZERO DUPLICATES: all question IDs and statements must be strictly unique!
    const seenIds = new Set<string>();
    const seenStatements = new Set<string>();

    for (const eq of generatedExam!.questions) {
      expect(seenIds.has(eq.questionId)).toBe(false);
      seenIds.add(eq.questionId);

      const norm = eq.question.statement.trim().toLowerCase();
      expect(seenStatements.has(norm)).toBe(false);
      seenStatements.add(norm);
    }
  });

  afterAll(async () => {
    // Clean up created exams
    for (const examId of createdExamIds) {
      await prisma.examQuestion.deleteMany({ where: { examId } });
      await prisma.examAttempt.deleteMany({ where: { examId } });
      await prisma.exam.deleteMany({ where: { id: examId } });
    }

    // Clean up questions
    if (createdQuestionIds.length > 0) {
      await prisma.questionOption.deleteMany({
        where: { questionId: { in: createdQuestionIds } },
      });
      await prisma.question.deleteMany({
        where: { id: { in: createdQuestionIds } },
      });
    }

    // Clean up subject
    if (createdSubjectId) {
      await prisma.subject.deleteMany({ where: { id: createdSubjectId } });
    }
  });
});
