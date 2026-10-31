import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { CurriculumLessonsService } from "@/services/curriculum/lessons";
import { CurriculumUnitsService } from "@/services/curriculum/units";
import { QuestionService } from "@/services/question.service";
import { QuestionType, Difficulty, SchoolCategory } from "@prisma/client";

describe("Lesson and Unit Cascade Deletion of Questions", () => {
  let testSystemId: string;
  let testGradeId: string;
  let testSubjectId: string;
  let testUnitId: string;
  let testLessonId: string;

  beforeEach(async () => {
    // 1. Setup minimal test curriculum structure
    const system = await prisma.educationalSystem.upsert({
      where: { code: "test_bacc_cascade" },
      create: { code: "test_bacc_cascade", name: "Cascade Test System" },
      update: {},
    });
    testSystemId = system.id;

    const grade = await prisma.grade.upsert({
      where: {
        systemId_code: {
          systemId: testSystemId,
          code: "test_grade_cascade",
        },
      },
      create: {
        systemId: testSystemId,
        code: "test_grade_cascade",
        name: "Test Grade Cascade",
        order: 99,
      },
      update: {},
    });
    testGradeId = grade.id;

    const subject = await prisma.subject.create({
      data: {
        code: `test_sub_cascade_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: "Test Subject Cascade",
        systemId: testSystemId,
        gradeId: testGradeId,
        schoolCategory: SchoolCategory.ARABIC,
      },
    });
    testSubjectId = subject.id;

    const unit = await prisma.unit.create({
      data: {
        title: "Test Unit Cascade",
        subjectId: testSubjectId,
        order: 1,
      },
    });
    testUnitId = unit.id;

    const lesson = await prisma.lesson.create({
      data: {
        title: "Test Lesson Cascade",
        unitId: testUnitId,
        order: 1,
      },
    });
    testLessonId = lesson.id;
  });

  afterEach(async () => {
    // Cleanup any remaining test entities
    if (testSubjectId) {
      await prisma.subject.deleteMany({ where: { id: testSubjectId } });
    }
    if (testGradeId) {
      await prisma.grade.deleteMany({ where: { id: testGradeId } });
    }
    if (testSystemId) {
      await prisma.educationalSystem.deleteMany({ where: { id: testSystemId } });
    }
  });

  it("should completely remove all questions from database when a lesson is deleted", async () => {
    // Create 3 questions attached to the test lesson
    const q1 = await prisma.question.create({
      data: {
        statement: "Cascade Q1 MCQ: ما هو ناتج 2 + 2؟",
        type: QuestionType.MCQ,
        difficulty: Difficulty.EASY,
        subjectId: testSubjectId,
        unitId: testUnitId,
        options: {
          create: [
            { text: "4", isCorrect: true, order: 0 },
            { text: "5", isCorrect: false, order: 1 },
          ],
        },
        lessons: {
          create: [{ lessonId: testLessonId }],
        },
      },
    });

    const q2 = await prisma.question.create({
      data: {
        statement: "Cascade Q2 Essay: اشرح مفهوم الدالة الرياضية؟",
        type: QuestionType.ESSAY,
        difficulty: Difficulty.MEDIUM,
        subjectId: testSubjectId,
        unitId: testUnitId,
        rubric: {
          create: {
            modelAnswer: "الدالة هي علاقة تربط كل عنصر في المجال بعنصر واحد في المجال المقابل.",
          },
        },
        explanation: {
          create: {
            concept: "المفهوم الرياضي",
            correctReason: "تفسير واضح للدالة",
          },
        },
        lessons: {
          create: [{ lessonId: testLessonId }],
        },
      },
    });

    // Verify questions exist
    const qIds = [q1.id, q2.id];
    const beforeCount = await prisma.question.count({
      where: { id: { in: qIds } },
    });
    expect(beforeCount).toBe(2);

    // Act: Delete the lesson
    await CurriculumLessonsService.deleteLesson(testLessonId);

    // Verify lesson is deleted
    const lessonCheck = await prisma.lesson.findUnique({
      where: { id: testLessonId },
    });
    expect(lessonCheck).toBeNull();

    // Verify ALL questions of this lesson are completely removed from database
    const afterCount = await prisma.question.count({
      where: { id: { in: qIds } },
    });
    expect(afterCount).toBe(0);

    // Verify QuestionOption, QuestionExplanation, and EssayRubric are also removed
    const optionsCount = await prisma.questionOption.count({
      where: { questionId: { in: qIds } },
    });
    expect(optionsCount).toBe(0);

    const rubricCount = await prisma.essayRubric.count({
      where: { questionId: { in: qIds } },
    });
    expect(rubricCount).toBe(0);

    const explanationCount = await prisma.questionExplanation.count({
      where: { questionId: { in: qIds } },
    });
    expect(explanationCount).toBe(0);
  });

  it("should completely remove all questions of all lessons when a unit is deleted", async () => {
    // Create a question attached to testLessonId
    const q = await prisma.question.create({
      data: {
        statement: "Cascade Unit Q: سؤال تابع لوحدة سيتم حذفها",
        type: QuestionType.TRUE_FALSE,
        difficulty: Difficulty.EASY,
        subjectId: testSubjectId,
        unitId: testUnitId,
        options: {
          create: [
            { text: "صواب", isCorrect: true, order: 0 },
            { text: "خطأ", isCorrect: false, order: 1 },
          ],
        },
        lessons: {
          create: [{ lessonId: testLessonId }],
        },
      },
    });

    expect(await prisma.question.count({ where: { id: q.id } })).toBe(1);

    // Act: Delete the unit
    await CurriculumUnitsService.deleteUnit(testUnitId);

    // Verify unit and lesson are deleted
    expect(await prisma.unit.findUnique({ where: { id: testUnitId } })).toBeNull();
    expect(await prisma.lesson.findUnique({ where: { id: testLessonId } })).toBeNull();

    // Verify question is deleted from DB
    expect(await prisma.question.count({ where: { id: q.id } })).toBe(0);
  });

  it("should allow deleting questions of a specific type or all questions of a lesson via QuestionService.deleteLessonQuestions", async () => {
    const qMcq = await prisma.question.create({
      data: {
        statement: "Q MCQ to delete selectively",
        type: QuestionType.MCQ,
        difficulty: Difficulty.EASY,
        subjectId: testSubjectId,
        lessons: { create: [{ lessonId: testLessonId }] },
      },
    });

    const qEssay = await prisma.question.create({
      data: {
        statement: "Q Essay to keep when deleting MCQ",
        type: QuestionType.ESSAY,
        difficulty: Difficulty.HARD,
        subjectId: testSubjectId,
        lessons: { create: [{ lessonId: testLessonId }] },
      },
    });

    // Delete only MCQ
    const deleteMcqRes = await QuestionService.deleteLessonQuestions(testLessonId, {
      type: QuestionType.MCQ,
    });
    expect(deleteMcqRes.count).toBe(1);

    expect(await prisma.question.count({ where: { id: qMcq.id } })).toBe(0);
    expect(await prisma.question.count({ where: { id: qEssay.id } })).toBe(1);

    // Delete remaining questions in lesson
    const deleteAllRes = await QuestionService.deleteLessonQuestions(testLessonId);
    expect(deleteAllRes.count).toBe(1);
    expect(await prisma.question.count({ where: { id: qEssay.id } })).toBe(0);
  });
});
