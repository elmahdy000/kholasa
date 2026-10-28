import { describe, expect, it, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { ExamService } from "@/services/exam.service";
import { CurriculumService } from "@/services/curriculum.service";

describe("Exam System Stress & Concurrency Tests", () => {
  const cleanupQuestionIds: string[] = [];
  const cleanupExamIds: string[] = [];
  const cleanupAttemptIds: string[] = [];
  const cleanupUnitIds: string[] = [];
  const cleanupUserIds: string[] = [];

  afterAll(async () => {
    // Teardown all test artifacts in reverse dependency order
    if (cleanupAttemptIds.length > 0) {
      await prisma.studentAnswer.deleteMany({ where: { attemptId: { in: cleanupAttemptIds } } });
      await prisma.examAttempt.deleteMany({ where: { id: { in: cleanupAttemptIds } } });
    }
    if (cleanupExamIds.length > 0) {
      await prisma.examQuestion.deleteMany({ where: { examId: { in: cleanupExamIds } } });
      await prisma.exam.deleteMany({ where: { id: { in: cleanupExamIds } } });
    }
    if (cleanupQuestionIds.length > 0) {
      await prisma.mistakeReview.deleteMany({ where: { questionId: { in: cleanupQuestionIds } } });
      await prisma.questionOption.deleteMany({ where: { questionId: { in: cleanupQuestionIds } } });
      await prisma.question.deleteMany({ where: { id: { in: cleanupQuestionIds } } });
    }
    for (const unitId of cleanupUnitIds) {
      await CurriculumService.deleteUnit(unitId).catch(() => {});
    }
    if (cleanupUserIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
    }
  });

  it("STRESS TEST 1: Concurrently generates multiple random exams under heavy parallel load", async () => {
    // 1. Get a published subject and create student matching its exact scope
    const subject = await prisma.subject.findFirst({
      where: { isPublished: true },
    });
    expect(subject).toBeDefined();

    const student = await prisma.user.create({
      data: {
        name: "طالب ضغط التوليد",
        email: `stress_gen_${Date.now()}@test.kholasa`,
        role: "STUDENT",
        gradeId: subject!.gradeId,
        systemId: subject!.systemId,
        trackId: subject!.trackId,
        schoolCategory: subject!.schoolCategory,
      },
    });
    cleanupUserIds.push(student.id);

    // 2. Bulk import a dedicated unit
    const units = await CurriculumService.bulkImportCurriculum(subject!.id, [
      {
        title: `وحدة ضغط التوليد العشوائي ${Date.now()}`,
        lessons: [{ title: "درس الضغط 1", durationMinutes: 10 }],
      },
    ]);
    const unit = units[0];
    cleanupUnitIds.push(unit.id);

    // 3. Populate a pool of 12 published questions
    const questionData = Array.from({ length: 12 }, (_, i) => ({
      statement: `سؤال ضغط بنك الأسئلة #${i + 1} (${Date.now()})`,
      subjectId: subject!.id,
      unitId: unit.id,
      type: "MCQ" as const,
      difficulty: i % 2 === 0 ? ("EASY" as const) : ("MEDIUM" as const),
      schoolCategory: subject!.schoolCategory,
      status: "PUBLISHED" as const,
      options: {
        create: [
          { text: `خيار أ ${i}`, isCorrect: false, order: 1 },
          { text: `خيار ب ${i} (صحيح)`, isCorrect: true, order: 2 },
          { text: `خيار ج ${i}`, isCorrect: false, order: 3 },
          { text: `خيار د ${i}`, isCorrect: false, order: 4 },
        ],
      },
    }));

    for (const q of questionData) {
      const created = await prisma.question.create({ data: q });
      cleanupQuestionIds.push(created.id);
    }

    // 4. Run 10 parallel random exam generation requests simultaneously
    const CONCURRENT_REQUESTS = 10;
    const start = Date.now();

    const generationPromises = Array.from({ length: CONCURRENT_REQUESTS }, (_, idx) =>
      ExamService.createCustomExam(
        {
          subjectId: subject!.id,
          unitId: unit.id,
          type: "ALL",
          questionCount: 4,
          mode: idx % 2 === 0 ? "EXAM" : "PRACTICE",
          durationMinutes: 15,
          title: `امتحان ضغط متزامن #${idx + 1}`,
        },
        student.id
      )
    );

    const results = await Promise.all(generationPromises);
    const durationMs = Date.now() - start;

    expect(results).toHaveLength(CONCURRENT_REQUESTS);
    for (const res of results) {
      cleanupExamIds.push(res.examId);
      cleanupAttemptIds.push(res.attemptId);
      expect(res.examId).toBeDefined();
      expect(res.attemptId).toBeDefined();
      expect(res.questionCount).toBe(4);
    }

    // Concurrency performance assertion: 10 parallel generations should complete quickly
    expect(durationMs).toBeLessThan(5000);
  });

  it("STRESS TEST 2: Prevents race conditions during simultaneous rapid double-submissions", async () => {
    // 1. Get published subject and create student matching its exact scope
    const subject = await prisma.subject.findFirst({ where: { isPublished: true } });
    expect(subject).toBeDefined();

    const student = await prisma.user.create({
      data: {
        name: "طالب اختبار التسليم المتزامن",
        email: `stress_sub_${Date.now()}@test.kholasa`,
        role: "STUDENT",
        gradeId: subject!.gradeId,
        systemId: subject!.systemId,
        trackId: subject!.trackId,
        schoolCategory: subject!.schoolCategory,
      },
    });
    cleanupUserIds.push(student.id);

    const units = await CurriculumService.bulkImportCurriculum(subject!.id, [
      {
        title: `وحدة اختبار التسليم المتزامن ${Date.now()}`,
        lessons: [{ title: "درس التسليم", durationMinutes: 10 }],
      },
    ]);
    const unit = units[0];
    cleanupUnitIds.push(unit.id);

    const questions = [];
    for (let i = 0; i < 3; i++) {
      const q = await prisma.question.create({
        data: {
          statement: `سؤال التسليم المتزامن ${i + 1}`,
          subjectId: subject!.id,
          unitId: unit.id,
          type: "MCQ",
          status: "PUBLISHED",
          schoolCategory: subject!.schoolCategory,
          options: {
            create: [
              { text: "خطأ", isCorrect: false, order: 1 },
              { text: "صحيح", isCorrect: true, order: 2 },
            ],
          },
        },
        include: { options: true },
      });
      cleanupQuestionIds.push(q.id);
      questions.push(q);
    }

    // 2. Generate an exam attempt
    const examResult = await ExamService.createCustomExam(
      {
        subjectId: subject!.id,
        unitId: unit.id,
        questionIds: questions.map((q) => q.id),
        questionCount: 3,
        durationMinutes: 10,
        mode: "EXAM",
      },
      student.id
    );
    cleanupExamIds.push(examResult.examId);
    cleanupAttemptIds.push(examResult.attemptId);

    // Prepare answers payload
    const answersPayload = {
      [questions[0].id]: { selectedOptionId: questions[0].options.find((o) => o.isCorrect)!.id },
      [questions[1].id]: { selectedOptionId: questions[1].options.find((o) => !o.isCorrect)!.id },
      [questions[2].id]: { selectedOptionId: questions[2].options.find((o) => o.isCorrect)!.id },
    };

    // 3. Fire 10 parallel simultaneous submissions for the EXACT SAME attempt
    const CONCURRENT_SUBMITS = 10;
    const submitPromises = Array.from({ length: CONCURRENT_SUBMITS }, () =>
      ExamService.submitExamAttempt(examResult.attemptId, student.id, {
        answers: answersPayload,
        totalTimeSpentSeconds: 45,
      })
    );

    const settled = await Promise.allSettled(submitPromises);

    const fulfilled = settled.filter((r) => r.status === "fulfilled");
    const rejected = settled.filter((r) => r.status === "rejected");

    // Exactly 1 must succeed; the remaining 9 must fail atomically due to the CAS updateMany lock
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(CONCURRENT_SUBMITS - 1);

    for (const rej of rejected) {
      if (rej.status === "rejected") {
        expect(rej.reason.message).toContain("تم تسليم هذه المحاولة مسبقاً");
      }
    }

    // 4. Verify Database Integrity
    const attemptInDb = await prisma.examAttempt.findUnique({
      where: { id: examResult.attemptId },
    });
    expect(attemptInDb?.isCompleted).toBe(true);
    expect(attemptInDb?.score).toBe(2); // 2 correct out of 3

    // Verify exactly 3 answers were saved (no duplicates from parallel writes)
    const savedAnswers = await prisma.studentAnswer.findMany({
      where: { attemptId: examResult.attemptId },
    });
    expect(savedAnswers).toHaveLength(3);
  });

  it("STRESS TEST 3: High-throughput concurrent distinct student submissions with grading & mistakes logging", async () => {
    // 1. Prepare subject and pool of questions
    const subject = await prisma.subject.findFirst({ where: { isPublished: true } });
    expect(subject).toBeDefined();

    const units = await CurriculumService.bulkImportCurriculum(subject!.id, [
      {
        title: `وحدة الضغط متعدد الطلاب ${Date.now()}`,
        lessons: [{ title: "درس الضغط", durationMinutes: 10 }],
      },
    ]);
    const unit = units[0];
    cleanupUnitIds.push(unit.id);

    const qCorrect = await prisma.question.create({
      data: {
        statement: `سؤال متعدد الطلاب 1`,
        subjectId: subject!.id,
        unitId: unit.id,
        type: "MCQ",
        status: "PUBLISHED",
        schoolCategory: subject!.schoolCategory,
        options: {
          create: [
            { text: "أ", isCorrect: false, order: 1 },
            { text: "ب (صحيح)", isCorrect: true, order: 2 },
          ],
        },
      },
      include: { options: true },
    });
    cleanupQuestionIds.push(qCorrect.id);

    const qMistake = await prisma.question.create({
      data: {
        statement: `سؤال متعدد الطلاب 2`,
        subjectId: subject!.id,
        unitId: unit.id,
        type: "MCQ",
        status: "PUBLISHED",
        schoolCategory: subject!.schoolCategory,
        options: {
          create: [
            { text: "خطأ", isCorrect: false, order: 1 },
            { text: "صحيح", isCorrect: true, order: 2 },
          ],
        },
      },
      include: { options: true },
    });
    cleanupQuestionIds.push(qMistake.id);

    // 2. Create 5 distinct students matching the subject scope and generate an exam for each
    const STUDENT_COUNT = 5;
    const testCases: { studentId: string; attemptId: string }[] = [];

    for (let i = 0; i < STUDENT_COUNT; i++) {
      const student = await prisma.user.create({
        data: {
          name: `طالب دفعات ${i + 1}`,
          email: `batch_student_${i + 1}_${Date.now()}@test.kholasa`,
          role: "STUDENT",
          gradeId: subject!.gradeId,
          systemId: subject!.systemId,
          trackId: subject!.trackId,
          schoolCategory: subject!.schoolCategory,
        },
      });
      cleanupUserIds.push(student.id);

      const exam = await ExamService.createCustomExam(
        {
          subjectId: subject!.id,
          unitId: unit.id,
          questionIds: [qCorrect.id, qMistake.id],
          questionCount: 2,
          durationMinutes: 10,
          mode: "EXAM",
        },
        student.id
      );
      cleanupExamIds.push(exam.examId);
      cleanupAttemptIds.push(exam.attemptId);

      testCases.push({ studentId: student.id, attemptId: exam.attemptId });
    }

    // 3. Submit all 5 distinct student exams simultaneously in parallel
    const submissionPromises = testCases.map(({ studentId, attemptId }) =>
      ExamService.submitExamAttempt(attemptId, studentId, {
        answers: {
          [qCorrect.id]: {
            selectedOptionId: qCorrect.options.find((o) => o.isCorrect)!.id,
          },
          [qMistake.id]: {
            selectedOptionId: qMistake.options.find((o) => !o.isCorrect)!.id, // deliberate mistake
          },
        },
        totalTimeSpentSeconds: 30,
      })
    );

    const submissionResults = await Promise.all(submissionPromises);

    expect(submissionResults).toHaveLength(STUDENT_COUNT);
    for (const res of submissionResults) {
      expect(res.attempt.isCompleted).toBe(true);
      expect(res.score).toBe(1); // 1 correct out of 2
      expect(res.percentage).toBe(50); // 50%
      expect(res.mistakesCount).toBe(1);
    }

    // Verify all 5 students got their mistakeReview record logged concurrently
    for (const { studentId } of testCases) {
      const review = await prisma.mistakeReview.findFirst({
        where: { userId: studentId, questionId: qMistake.id },
      });
      expect(review).toBeDefined();
      expect(review?.wrongCount).toBe(1);
    }
  });
});
