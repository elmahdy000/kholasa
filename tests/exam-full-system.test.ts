import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { ExamService } from "@/services/exam.service";
import { CurriculumService } from "@/services/curriculum.service";

describe("Full End-to-End Exam System Test", () => {
  it("executes complete lifecycle: multi-unit/lesson random generation, option ID mapping, grading, and mistake tracking", async () => {
    // 1. Get or create a student user with valid curriculum scope
    let student = await prisma.user.findFirst({
      where: { role: "STUDENT" },
      include: { grade: true },
    });

    if (!student || !student.gradeId) {
      const grade = await prisma.grade.findFirst();
      expect(grade).toBeDefined();
      student = await prisma.user.create({
        data: {
          name: "طالب اختبار النظام",
          email: `test_student_${Date.now()}@example.com`,
          role: "STUDENT",
          gradeId: grade!.id,
          systemId: grade!.systemId,
          schoolCategory: "ARABIC",
        },
        include: { grade: true },
      });
    }

    // 2. Find subject belonging to the student's grade and category
    let subject = await prisma.subject.findFirst({
      where: {
        gradeId: student.gradeId!,
        schoolCategory: student.schoolCategory,
        isPublished: true,
      },
    });

    if (!subject) {
      subject = await prisma.subject.findFirst({
        where: { isPublished: true },
      });
    }
    expect(subject).toBeDefined();

    // 3. Create 2 Units with Lessons using our Bulk Import service
    const createdUnits = await CurriculumService.bulkImportCurriculum(subject!.id, [
      {
        title: "وحدة اختبار النظام 1 - الفيزياء الكلاسيكية",
        lessons: [
          { title: "درس السرعة والتسارع", durationMinutes: 15 },
          { title: "درس قوانين نيوتن", durationMinutes: 20 },
        ],
      },
      {
        title: "وحدة اختبار النظام 2 - الكهرومغناطيسية",
        lessons: [
          { title: "درس الشحنات والمجال", durationMinutes: 15 },
          { title: "درس الجهد والتيار", durationMinutes: 20 },
        ],
      },
    ]);

    expect(createdUnits).toHaveLength(2);
    const unit1 = createdUnits[0];
    const unit2 = createdUnits[1];

    // 4. Create 4 Questions distributed across both units and lessons
    // Each question has options with random correct placement (B, C, A, D)
    const q1 = await prisma.question.create({
      data: {
        statement: "سؤال الوحدة 1 (الدرس 1): ما هي وحدة قياس التسارع؟",
        subjectId: subject!.id,
        unitId: unit1.id,
        type: "MCQ",
        difficulty: "EASY",
        schoolCategory: subject!.schoolCategory,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "متر / ثانية", isCorrect: false, order: 1 },
            { text: "متر / ثانية مربعة (الصحيحة)", isCorrect: true, order: 2 },
            { text: "نيوتن", isCorrect: false, order: 3 },
            { text: "جول", isCorrect: false, order: 4 },
          ],
        },
      },
      include: { options: true },
    });

    const q2 = await prisma.question.create({
      data: {
        statement: "سؤال الوحدة 1 (الدرس 2): الصيغة الرياضية لقانون نيوتن الثاني هي:",
        subjectId: subject!.id,
        unitId: unit1.id,
        type: "MCQ",
        difficulty: "MEDIUM",
        schoolCategory: subject!.schoolCategory,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "F = m / a", isCorrect: false, order: 1 },
            { text: "F = m + a", isCorrect: false, order: 2 },
            { text: "F = m * a (الصحيحة)", isCorrect: true, order: 3 },
            { text: "F = v * t", isCorrect: false, order: 4 },
          ],
        },
      },
      include: { options: true },
    });

    const q3 = await prisma.question.create({
      data: {
        statement: "سؤال الوحدة 2 (الدرس 1): الشحنات الكهربائية المتشابهة:",
        subjectId: subject!.id,
        unitId: unit2.id,
        type: "MCQ",
        difficulty: "EASY",
        schoolCategory: subject!.schoolCategory,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "تتنافر (الصحيحة)", isCorrect: true, order: 1 },
            { text: "تتجاذب", isCorrect: false, order: 2 },
            { text: "تتعادل تلقائياً", isCorrect: false, order: 3 },
            { text: "تفقد كتلتها", isCorrect: false, order: 4 },
          ],
        },
      },
      include: { options: true },
    });

    const q4 = await prisma.question.create({
      data: {
        statement: "سؤال الوحدة 2 (الدرس 2): وحدة قياس شدة التيار الكهربائي هي:",
        subjectId: subject!.id,
        unitId: unit2.id,
        type: "MCQ",
        difficulty: "HARD",
        schoolCategory: subject!.schoolCategory,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "الفولت", isCorrect: false, order: 1 },
            { text: "الأوم", isCorrect: false, order: 2 },
            { text: "الكولوم", isCorrect: false, order: 3 },
            { text: "الأمبير (الصحيحة)", isCorrect: true, order: 4 },
          ],
        },
      },
      include: { options: true },
    });

    const createdQuestionIds = [q1.id, q2.id, q3.id, q4.id];

    // 5. Build an Exam containing all 4 questions randomly
    const generated = await ExamService.createCustomExam(
      {
        subjectId: subject!.id,
        questionIds: createdQuestionIds,
        questionCount: 4,
        durationMinutes: 15,
        mode: "EXAM",
        title: "امتحان شامل عشوائي من عدة وحدات",
      },
      student.id
    );

    expect(generated.examId).toBeDefined();
    expect(generated.attemptId).toBeDefined();
    expect(generated.questionCount).toBe(4);

    // 6. Fetch the exam as a student would load it in ExamSolver
    const loadedExam = await ExamService.getExamById(generated.examId);
    expect(loadedExam).toBeDefined();
    expect(loadedExam?.questions).toHaveLength(4);

    // Verify option security: isCorrect is stripped from student payload
    for (const eq of loadedExam!.questions) {
      for (const opt of eq.question.options) {
        expect((opt as any).isCorrect).toBeUndefined();
        expect(opt.id).toBeDefined();
        expect(opt.text).toBeDefined();
      }
    }

    // 7. Simulate Student Answers:
    // Q1: Correct (Pick Option 2 - meter/sec^2)
    const q1CorrectOpt = q1.options.find((o) => o.isCorrect)!;
    // Q2: WRONG (Pick Option 1 - F = m / a)
    const q2WrongOpt = q2.options.find((o) => !o.isCorrect)!;
    // Q3: Correct (Pick Option 1 - تتنافر)
    const q3CorrectOpt = q3.options.find((o) => o.isCorrect)!;
    // Q4: Correct (Pick Option 4 - الأمبير)
    const q4CorrectOpt = q4.options.find((o) => o.isCorrect)!;

    const studentAnswersPayload = {
      [q1.id]: { selectedOptionId: q1CorrectOpt.id, timeSpentSeconds: 15 },
      [q2.id]: { selectedOptionId: q2WrongOpt.id, timeSpentSeconds: 25 },
      [q3.id]: { selectedOptionId: q3CorrectOpt.id, timeSpentSeconds: 10 },
      [q4.id]: { selectedOptionId: q4CorrectOpt.id, timeSpentSeconds: 30 },
    };

    // 8. Submit the Exam Attempt
    const submissionResult = await ExamService.submitExamAttempt(
      generated.attemptId,
      student.id,
      {
        answers: studentAnswersPayload,
        totalTimeSpentSeconds: 80,
      }
    );

    expect(submissionResult).toBeDefined();
    expect(submissionResult.attempt.isCompleted).toBe(true);
    expect(submissionResult.score).toBe(3); // 3 correct out of 4
    expect(submissionResult.percentage).toBe(75); // 75%
    expect(submissionResult.mistakesCount).toBe(1); // 1 mistake (Q2)

    // 9. Verify Student Answers in Database
    const savedAnswers = await prisma.studentAnswer.findMany({
      where: { attemptId: generated.attemptId },
    });
    expect(savedAnswers).toHaveLength(4);

    const q1Answer = savedAnswers.find((a) => a.questionId === q1.id);
    expect(q1Answer?.isCorrect).toBe(true);
    expect(q1Answer?.score).toBe(1);

    const q2Answer = savedAnswers.find((a) => a.questionId === q2.id);
    expect(q2Answer?.isCorrect).toBe(false);
    expect(q2Answer?.score).toBe(0);

    const q3Answer = savedAnswers.find((a) => a.questionId === q3.id);
    expect(q3Answer?.isCorrect).toBe(true);

    const q4Answer = savedAnswers.find((a) => a.questionId === q4.id);
    expect(q4Answer?.isCorrect).toBe(true);

    // 10. Verify MistakeReview entry was created for spaced repetition
    const mistake = await prisma.mistakeReview.findFirst({
      where: { userId: student.id, questionId: q2.id },
    });
    expect(mistake).toBeDefined();

    // 11. Security Check: Prevent Double Submission
    await expect(
      ExamService.submitExamAttempt(generated.attemptId, student.id, {
        answers: studentAnswersPayload,
      })
    ).rejects.toThrow("تم تسليم هذه المحاولة مسبقاً");

    // 12. Cleanup all created test data
    await prisma.studentAnswer.deleteMany({ where: { attemptId: generated.attemptId } });
    await prisma.mistakeReview.deleteMany({ where: { userId: student.id, questionId: q2.id } });
    await prisma.examAttempt.deleteMany({ where: { id: generated.attemptId } });
    await prisma.examQuestion.deleteMany({ where: { examId: generated.examId } });
    await prisma.exam.deleteMany({ where: { id: generated.examId } });
    for (const qId of createdQuestionIds) {
      await prisma.questionOption.deleteMany({ where: { questionId: qId } });
      await prisma.question.deleteMany({ where: { id: qId } });
    }
    await CurriculumService.deleteUnit(unit1.id);
    await CurriculumService.deleteUnit(unit2.id);
  });
});
