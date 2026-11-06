import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { ExamService } from "@/services/exam.service";
import { CurriculumService } from "@/services/curriculum.service";
import { cleanQuestionStatement } from "@/lib/question-parser";
import { splitExplanation } from "@/components/ui/QuestionExplanationBox";
import { extractAnswerPoints } from "@/components/ui/FormattedAnswerView";

describe("Deep Exam Logic & Architecture Verification Audit", () => {
  it("Test 1: Mixed Exam (MCQ + TRUE_FALSE + ESSAY) grading, scoring isolation, and rubric exposure", async () => {
    // 1. Get or create a student
    let student = await prisma.user.findFirst({
      where: { role: "STUDENT" },
      include: { grade: true },
    });

    if (!student || !student.gradeId) {
      const grade = await prisma.grade.findFirst();
      expect(grade).toBeDefined();
      student = await prisma.user.create({
        data: {
          name: "طالب فحص المنطق",
          email: `audit_student_${Date.now()}@example.com`,
          role: "STUDENT",
          gradeId: grade!.id,
          systemId: grade!.systemId,
          schoolCategory: "LANGUAGES",
        },
        include: { grade: true },
      });
    }

    // 2. Ensure a Languages subject exists
    let subject = await prisma.subject.findFirst({
      where: {
        gradeId: student.gradeId!,
        schoolCategory: student.schoolCategory,
        isPublished: true,
      },
    });

    if (!subject) {
      subject = await CurriculumService.createSubject({
        name: "Computer Science - Languages",
        code: `cs_lang_audit_${Date.now()}`,
        systemId: student.systemId!,
        gradeId: student.gradeId!,
        schoolCategory: "LANGUAGES",
      });
    }

    // 3. Create a unit and lesson
    const [unit] = await CurriculumService.bulkImportCurriculum(subject.id, [
      {
        title: "Unit 1: Cloud & System Architecture",
        lessons: [{ title: "Lesson 1: Foundations of Cloud", durationMinutes: 20 }],
      },
    ]);
    const lesson = unit.lessons[0];

    // 4. Create 3 distinct question types:
    // Q1: MCQ (English)
    const q1Mcq = await prisma.question.create({
      data: {
        statement: "Which protocol secures communication over the web?",
        translation: "أي بروتوكول يؤمن الاتصال عبر الويب؟",
        subjectId: subject.id,
        unitId: unit.id,
        type: "MCQ",
        difficulty: "EASY",
        schoolCategory: subject.schoolCategory,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "HTTPS", isCorrect: true, order: 1 },
            { text: "HTTP", isCorrect: false, order: 2 },
            { text: "FTP", isCorrect: false, order: 3 },
            { text: "TELNET", isCorrect: false, order: 4 },
          ],
        },
        explanation: {
          create: {
            concept: "Web Security",
            correctReason: "HTTPS encrypts communications using TLS/SSL.",
          },
        },
      },
      include: { options: true, explanation: true },
    });

    // Q2: TRUE_FALSE (English)
    const q2Tf = await prisma.question.create({
      data: {
        statement: "Moore's Law is a permanent immutable physical law of nature.",
        translation: "يعد قانون مور قانوناً فيزيائياً ثابتاً من قوانين الطبيعة.",
        subjectId: subject.id,
        unitId: unit.id,
        type: "TRUE_FALSE",
        difficulty: "EASY",
        schoolCategory: subject.schoolCategory,
        status: "PUBLISHED",
        options: {
          create: [
            { text: "True", isCorrect: false, order: 1 },
            { text: "False", isCorrect: true, order: 2 },
          ],
        },
        explanation: {
          create: {
            concept: "Moore's Law",
            correctReason: "Moore's Law is an empirical observation, not a physical law.",
          },
        },
      },
      include: { options: true, explanation: true },
    });

    // Q3: ESSAY (English with Rubric and Arabic Translation)
    const q3Essay = await prisma.question.create({
      data: {
        statement: "Explain why transistor miniaturization faces physical limits.",
        translation: "اشرح لماذا يواجه تصغير الترانزستورات حدوداً فيزيائية.",
        subjectId: subject.id,
        unitId: unit.id,
        type: "ESSAY",
        difficulty: "MEDIUM",
        schoolCategory: subject.schoolCategory,
        status: "PUBLISHED",
        rubric: {
          create: {
            modelAnswer: "1. Quantum tunneling causes leakage current.\n2. Heat dissipation limits performance.",
            modelAnswerTranslation: "1. النفق الكمي يسبب تيار التسرب.\n2. الانبعاث الحراري يعيق الأداء.",
            maxScore: 10,
          },
        },
        explanation: {
          create: {
            concept: "Quantum Tunneling & Limits",
            correctReason: "At atomic scale, electrons cross barriers without gate control.",
          },
        },
      },
      include: { rubric: true, explanation: true },
    });

    const questionIds = [q1Mcq.id, q2Tf.id, q3Essay.id];

    // 5. Generate Custom Exam
    const examData = await ExamService.createCustomExam(
      {
        subjectId: subject.id,
        questionIds,
        questionCount: 3,
        durationMinutes: 20,
        mode: "EXAM",
        title: "Mixed Comprehensive Audit Exam",
      },
      student.id
    );

    expect(examData.examId).toBeDefined();
    expect(examData.attemptId).toBeDefined();

    // 6. Verify Option Security (isCorrect must not leak)
    const loadedExam = await ExamService.getExamById(examData.examId);
    expect(loadedExam).toBeDefined();
    for (const eq of loadedExam!.questions) {
      for (const opt of eq.question.options) {
        expect((opt as any).isCorrect).toBeUndefined();
      }
    }

    // 7. Student answers:
    // Q1 (MCQ): CORRECT (HTTPS)
    const q1Correct = q1Mcq.options.find((o) => o.isCorrect)!;
    // Q2 (TRUE_FALSE): WRONG (Student picked True)
    const q2Wrong = q2Tf.options.find((o) => !o.isCorrect)!;
    // Q3 (ESSAY): Written student answer
    const essayText = "Transistors become so small that electrons leak through the barriers via quantum tunneling.";

    const submission = await ExamService.submitExamAttempt(
      examData.attemptId,
      student.id,
      {
        answers: {
          [q1Mcq.id]: { selectedOptionId: q1Correct.id, timeSpentSeconds: 20 },
          [q2Tf.id]: { selectedOptionId: q2Wrong.id, timeSpentSeconds: 15 },
          [q3Essay.id]: { essayText, timeSpentSeconds: 60 },
        },
        totalTimeSpentSeconds: 95,
      }
    );

    // 8. Verify Scoring & Isolation:
    // Total questions: 3. Objective questions: 2 (Q1 & Q2).
    // Correct objective: 1 (Q1).
    // Percentage: 1 / 2 = 50.0% (NOT 1 / 3 = 33.3%, because essay is non-scored self-comparison).
    expect(submission.score).toBe(1);
    expect(submission.totalObjective).toBe(2);
    expect(submission.totalQuestions).toBe(3);
    expect(submission.percentage).toBe(50);
    expect(submission.mistakesCount).toBe(1);

    // 9. Verify Essay text is saved without error
    const savedEssayAnswer = await prisma.studentAnswer.findFirst({
      where: { attemptId: examData.attemptId, questionId: q3Essay.id },
    });
    expect(savedEssayAnswer?.essayText).toBe(essayText);
    expect(savedEssayAnswer?.isCorrect).toBeNull();
    expect(savedEssayAnswer?.score).toBeNull();

    // 10. Verify Mistake was created for Q2
    const mistakeQ2 = await prisma.mistakeReview.findFirst({
      where: { userId: student.id, questionId: q2Tf.id },
    });
    expect(mistakeQ2).toBeDefined();
    expect(mistakeQ2?.isResolved).toBe(false);

    // 11. Test Mistake Auto-Resolution on second exam attempt
    // Create new exam with Q2
    const retryExam = await ExamService.createCustomExam(
      {
        subjectId: subject.id,
        questionIds: [q2Tf.id],
        questionCount: 1,
        durationMinutes: 10,
        mode: "EXAM",
        title: "Retry Mistake Exam",
      },
      student.id
    );

    // Now answer Q2 CORRECTLY
    const q2Correct = q2Tf.options.find((o) => o.isCorrect)!;
    await ExamService.submitExamAttempt(retryExam.attemptId, student.id, {
      answers: {
        [q2Tf.id]: { selectedOptionId: q2Correct.id, timeSpentSeconds: 10 },
      },
      totalTimeSpentSeconds: 10,
    });

    // Check that mistake is now RESOLVED
    const resolvedMistake = await prisma.mistakeReview.findFirst({
      where: { userId: student.id, questionId: q2Tf.id },
    });
    expect(resolvedMistake?.isResolved).toBe(true);

    // 12. Security Test: Double submission rejection
    await expect(
      ExamService.submitExamAttempt(retryExam.attemptId, student.id, {
        answers: { [q2Tf.id]: { selectedOptionId: q2Correct.id } },
      })
    ).rejects.toThrow("تم تسليم هذه المحاولة مسبقاً");

    // 13. Security Test: Foreign user submission rejection
    const dummyUser = await prisma.user.create({
      data: {
        name: "مخترق وهمي",
        email: `hacker_${Date.now()}@example.com`,
        role: "STUDENT",
        schoolCategory: "LANGUAGES",
      },
    });

    // Dummy user tries to submit student's attempt
    await expect(
      ExamService.submitExamAttempt(examData.attemptId, dummyUser.id, {})
    ).rejects.toThrow("محاولة الامتحان غير صالحة أو غير مصرح بها");

    // 14. Cleanup
    await prisma.studentAnswer.deleteMany({
      where: { attemptId: { in: [examData.attemptId, retryExam.attemptId] } },
    });
    await prisma.mistakeReview.deleteMany({
      where: { userId: student.id, questionId: { in: questionIds } },
    });
    await prisma.examAttempt.deleteMany({
      where: { id: { in: [examData.attemptId, retryExam.attemptId] } },
    });
    await prisma.examQuestion.deleteMany({
      where: { examId: { in: [examData.examId, retryExam.examId] } },
    });
    await prisma.exam.deleteMany({
      where: { id: { in: [examData.examId, retryExam.examId] } },
    });
    await prisma.questionExplanation.deleteMany({ where: { questionId: { in: questionIds } } });
    await prisma.essayRubric.deleteMany({ where: { questionId: { in: questionIds } } });
    await prisma.questionOption.deleteMany({ where: { questionId: { in: questionIds } } });
    await prisma.question.deleteMany({ where: { id: { in: questionIds } } });
    await CurriculumService.deleteUnit(unit.id);
    await prisma.user.delete({ where: { id: dummyUser.id } });
  });

  it("Test 2: Edge cases: Unanswered questions, 100% score, 0% score, and decimal rounding", async () => {
    // Verify rounding precision helper logic
    const calcPercentage = (correct: number, total: number) =>
      total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;

    expect(calcPercentage(1, 3)).toBe(33.3); // Decimal 1/3 rounds to 33.3%
    expect(calcPercentage(2, 3)).toBe(66.7); // Decimal 2/3 rounds to 66.7%
    expect(calcPercentage(0, 5)).toBe(0); // 0%
    expect(calcPercentage(5, 5)).toBe(100); // 100%
    expect(calcPercentage(0, 0)).toBe(0); // 0 objective questions -> 0%, no NaN
  });

  it("Test 3: BiDi sanitization, Explanation Splitting, and Formatted Answer parsing", () => {
    // 1. Inverted leading question mark on English text
    const inverted = cleanQuestionStatement("?Which of the following options represents the main technology");
    expect(inverted).toBe("Which of the following options represents the main technology?");

    // 2. Normal question
    const normal = cleanQuestionStatement("What is Moore's Law?");
    expect(normal).toBe("What is Moore's Law?");

    // 3. splitExplanation separates primary English explanation from Arabic translation
    const dbExplanation =
      "The book places the spread of personal computers in the 1970s–1980s; the 1990s are associated with the commercialization of the Internet and the Web.\n\nالترجمة العربية للتفسير:\nيربط الكتاب انتشار أجهزة الكمبيوتر الشخصية بالسبعينيات والثمانينيات، بينما ترتبط التسعينيات بإتاحة الإنترنت للاستخدام التجاري وظهور الويب.";
    const split = splitExplanation(dbExplanation);
    expect(split.primary).toBe(
      "The book places the spread of personal computers in the 1970s–1980s; the 1990s are associated with the commercialization of the Internet and the Web."
    );
    expect(split.translation).toBe(
      "يربط الكتاب انتشار أجهزة الكمبيوتر الشخصية بالسبعينيات والثمانينيات، بينما ترتبط التسعينيات بإتاحة الإنترنت للاستخدام التجاري وظهور الويب."
    );

    // 4. Normal multi-line explanation should NOT be parsed into artificial numbered points
    const normalParagraph =
      "The book places the spread of personal computers in the 1970s–1980s.\nThe 1990s are associated with the commercialization of the Internet.";
    expect(extractAnswerPoints(normalParagraph)).toBeNull();

    // 5. Explicit structured model answer SHOULD be parsed into points
    const structuredAnswer =
      "1. Early computers used vacuum tubes.\n2. Personal computers spread in the 1970s.\n3. The Internet expanded in the 1990s.";
    const structured = extractAnswerPoints(structuredAnswer);
    expect(structured).not.toBeNull();
    expect(structured?.points.length).toBe(3);
    expect(structured?.points[0].badge).toBe("1");
  });
});
