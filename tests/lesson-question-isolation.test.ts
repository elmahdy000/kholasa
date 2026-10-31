import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { QuestionService } from "@/services/question.service";
import { CurriculumLessonsService } from "@/services/curriculum/lessons";
import { SchoolCategory } from "@prisma/client";

describe("Strict Lesson-Level Question Isolation", () => {
  let testSystemId: string;
  let testGradeId: string;
  let testSubjectId: string;
  let testUnitId: string;
  let lessonAId: string;
  let lessonBId: string;

  beforeEach(async () => {
    const unique = `${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const system = await prisma.educationalSystem.upsert({
      where: { code: "test_sys_isolation" },
      create: { code: "test_sys_isolation", name: "Isolation Test System" },
      update: {},
    });
    testSystemId = system.id;

    const grade = await prisma.grade.upsert({
      where: {
        systemId_code: {
          systemId: testSystemId,
          code: "test_grade_isolation",
        },
      },
      create: {
        systemId: testSystemId,
        code: "test_grade_isolation",
        name: "Test Grade Isolation",
        order: 99,
      },
      update: {},
    });
    testGradeId = grade.id;

    const subject = await prisma.subject.create({
      data: {
        code: `sub_iso_${unique}`,
        name: "Test Subject Isolation",
        systemId: testSystemId,
        gradeId: testGradeId,
        schoolCategory: SchoolCategory.ARABIC,
      },
    });
    testSubjectId = subject.id;

    const unit = await prisma.unit.create({
      data: {
        title: "Unit for Isolation",
        subjectId: testSubjectId,
        order: 1,
      },
    });
    testUnitId = unit.id;

    const lessonA = await prisma.lesson.create({
      data: {
        unitId: testUnitId,
        title: "الدرس الأول: المفاهيم الأساسية",
        order: 1,
      },
    });
    lessonAId = lessonA.id;

    const lessonB = await prisma.lesson.create({
      data: {
        unitId: testUnitId,
        title: "الدرس الثاني: التطبيقات العملية",
        order: 2,
      },
    });
    lessonBId = lessonB.id;
  });

  afterEach(async () => {
    // Cleanup subject and all cascaded entities
    if (testSubjectId) {
      await prisma.subject.delete({ where: { id: testSubjectId } }).catch(() => {});
    }
  });

  it("creates completely independent questions when uploading identical statements into two different lessons", async () => {
    const rawQuestions = [
      {
        statement: "س1: ما هو المفهوم الأساسي للذكاء الاصطناعي؟",
        type: "MCQ" as const,
        difficulty: "MEDIUM" as const,
        options: [
          { text: "محاكاة القدرات الذهنية البشرية", isCorrect: true, order: 1 },
          { text: "برمجة قواعد ثابتة لا تتغير", isCorrect: false, order: 2 },
        ],
        concept: "مفهوم الذكاء الاصطناعي",
        correctReason: "الذكاء الاصطناعي يحاكي القدرات الإدراكية للإنسان.",
      },
      {
        statement: "س2: وضح الفرق بين الأنظمة الخبيرة ونماذج التعلم الآلي.",
        type: "ESSAY" as const,
        difficulty: "HARD" as const,
        options: [],
        modelAnswer: "الأنظمة الخبيرة تعتمد على قواعد صريحة، بينما التعلم الآلي يستنتج الأنماط من البيانات.",
      },
    ];

    // 1. Upload into Lesson A
    const resA = await QuestionService.bulkCreateQuestions(rawQuestions, {
      subjectId: testSubjectId,
      unitId: testUnitId,
      lessonId: lessonAId,
      schoolCategory: SchoolCategory.ARABIC,
      gradeId: testGradeId,
    });

    expect(resA.count).toBe(2);
    expect(resA.skippedDuplicates).toBe(0);

    // Verify questions in Lesson A
    const questionsLessonA = await prisma.question.findMany({
      where: { lessons: { some: { lessonId: lessonAId } } },
      include: { lessons: true, options: true, rubric: true, explanation: true },
    });
    expect(questionsLessonA.length).toBe(2);
    for (const q of questionsLessonA) {
      expect(q.lessons.length).toBe(1);
      expect(q.lessons[0].lessonId).toBe(lessonAId);
    }

    // 2. Upload the EXACT SAME question statements into Lesson B
    const resB = await QuestionService.bulkCreateQuestions(rawQuestions, {
      subjectId: testSubjectId,
      unitId: testUnitId,
      lessonId: lessonBId,
      schoolCategory: SchoolCategory.ARABIC,
      gradeId: testGradeId,
    });

    // In Lesson B, these should NOT be skipped as duplicates, because Lesson B has no questions yet!
    expect(resB.count).toBe(2);
    expect(resB.skippedDuplicates).toBe(0);
    expect(resB.linkedExisting).toBe(0);

    // Verify questions in Lesson B
    const questionsLessonB = await prisma.question.findMany({
      where: { lessons: { some: { lessonId: lessonBId } } },
      include: { lessons: true, options: true, rubric: true, explanation: true },
    });
    expect(questionsLessonB.length).toBe(2);
    for (const q of questionsLessonB) {
      expect(q.lessons.length).toBe(1);
      expect(q.lessons[0].lessonId).toBe(lessonBId);
    }

    // Verify that Lesson A and Lesson B do NOT share any question IDs
    const idsA = new Set(questionsLessonA.map((q) => q.id));
    const idsB = new Set(questionsLessonB.map((q) => q.id));
    for (const id of idsB) {
      expect(idsA.has(id)).toBe(false);
    }

    // Total questions in DB should be 4 (2 for Lesson A + 2 for Lesson B)
    const totalSubjectQuestions = await prisma.question.count({
      where: { subjectId: testSubjectId },
    });
    expect(totalSubjectQuestions).toBe(4);
  });

  it("detects duplicates within the SAME lesson without polluting other lessons", async () => {
    const question = {
      statement: "سؤال تجريبي مكرر داخل نفس الدرس",
      type: "MCQ" as const,
      difficulty: "EASY" as const,
      options: [
        { text: "أ", isCorrect: true, order: 1 },
        { text: "ب", isCorrect: false, order: 2 },
      ],
    };

    // First import into Lesson A
    const res1 = await QuestionService.bulkCreateQuestions([question], {
      subjectId: testSubjectId,
      unitId: testUnitId,
      lessonId: lessonAId,
    });
    expect(res1.count).toBe(1);

    // Second import of same question into Lesson A -> must detect duplicate in Lesson A!
    await expect(
      QuestionService.bulkCreateQuestions([question], {
        subjectId: testSubjectId,
        unitId: testUnitId,
        lessonId: lessonAId,
      })
    ).rejects.toMatchObject({ status: 409 });

    // But importing into Lesson B succeeds!
    const resB = await QuestionService.bulkCreateQuestions([question], {
      subjectId: testSubjectId,
      unitId: testUnitId,
      lessonId: lessonBId,
    });
    expect(resB.count).toBe(1);
    expect(resB.skippedDuplicates).toBe(0);
  });

  it("deleting a lesson only deletes its own questions and leaves other lessons intact", async () => {
    const question = {
      statement: "سؤال اختبار الحذف المستقل",
      type: "MCQ" as const,
      difficulty: "MEDIUM" as const,
      options: [
        { text: "1", isCorrect: true, order: 1 },
        { text: "2", isCorrect: false, order: 2 },
      ],
    };

    await QuestionService.bulkCreateQuestions([question], {
      subjectId: testSubjectId,
      unitId: testUnitId,
      lessonId: lessonAId,
    });

    await QuestionService.bulkCreateQuestions([question], {
      subjectId: testSubjectId,
      unitId: testUnitId,
      lessonId: lessonBId,
    });

    // Delete Lesson B completely
    await CurriculumLessonsService.deleteLesson(lessonBId);

    // Lesson B questions are gone
    const bCount = await prisma.questionLesson.count({
      where: { lessonId: lessonBId },
    });
    expect(bCount).toBe(0);

    // Lesson A questions are STILL completely intact!
    const aQuestions = await prisma.question.findMany({
      where: { lessons: { some: { lessonId: lessonAId } } },
    });
    expect(aQuestions.length).toBe(1);
    expect(aQuestions[0].statement).toBe("سؤال اختبار الحذف المستقل");
  });
});
