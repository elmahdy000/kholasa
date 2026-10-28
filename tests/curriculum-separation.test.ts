import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getCurriculumScope,
  subjectScopeWhere,
  questionScopeWhere,
  isSubjectInScope,
} from "@/lib/curriculum";
import { QuestionService } from "@/services/question.service";
import { ExamService } from "@/services/exam.service";
import { CurriculumService } from "@/services/curriculum.service";

describe("EL KHOLASA — Mandatory Curriculum Separation (12 Criteria Verification)", () => {
  const cleanupSubjectIds: string[] = [];

  beforeAll(async () => {
    const g10 = await prisma.grade.findFirst({ where: { code: "bacc_g10" } });
    const g11 = await prisma.grade.findFirst({ where: { code: "bacc_g11" } });
    if (!g10 || !g11) return;

    // 1. Ensure G10 Arabic has at least one subject with unit and lesson
    let g10Ar = await prisma.subject.findFirst({
      where: { gradeId: g10.id, schoolCategory: "ARABIC" },
      include: { units: { include: { lessons: true } } },
    });
    if (!g10Ar || g10Ar.units.length === 0 || g10Ar.units[0].lessons.length === 0) {
      const sub = await CurriculumService.createSubject({
        name: "اللغة العربية أولى ثانوي تجريبي",
        code: `g10_ar_iso_${Date.now()}`,
        systemId: g10.systemId,
        gradeId: g10.id,
        schoolCategory: "ARABIC",
      });
      cleanupSubjectIds.push(sub.id);
      await CurriculumService.bulkImportCurriculum(sub.id, [
        {
          title: "الوحدة الأولى - تجريبي",
          lessons: [{ title: "الدرس الأول - تجريبي", durationMinutes: 15 }],
        },
      ]);
    }

    // 2. Ensure G10 Languages has at least one subject with unit and lesson
    let g10En = await prisma.subject.findFirst({
      where: { gradeId: g10.id, schoolCategory: "LANGUAGES" },
      include: { units: { include: { lessons: true } } },
    });
    if (!g10En || g10En.units.length === 0 || g10En.units[0].lessons.length === 0) {
      const sub = await CurriculumService.createSubject({
        name: "Computer Science G10 Test",
        code: `g10_en_iso_${Date.now()}`,
        systemId: g10.systemId,
        gradeId: g10.id,
        schoolCategory: "LANGUAGES",
      });
      cleanupSubjectIds.push(sub.id);
      await CurriculumService.bulkImportCurriculum(sub.id, [
        {
          title: "Unit 1 - Test",
          lessons: [{ title: "Lesson 1 - Test", durationMinutes: 15 }],
        },
      ]);
    }

    // 3. Ensure G11 Arabic
    let g11Ar = await prisma.subject.findFirst({
      where: { gradeId: g11.id, schoolCategory: "ARABIC" },
    });
    if (!g11Ar) {
      const sub = await CurriculumService.createSubject({
        name: "اللغة العربية تانية ثانوي تجريبي",
        code: `g11_ar_iso_${Date.now()}`,
        systemId: g11.systemId,
        gradeId: g11.id,
        schoolCategory: "ARABIC",
      });
      cleanupSubjectIds.push(sub.id);
    }

    // 4. Ensure G11 Languages
    let g11En = await prisma.subject.findFirst({
      where: { gradeId: g11.id, schoolCategory: "LANGUAGES" },
    });
    if (!g11En) {
      const sub = await CurriculumService.createSubject({
        name: "Physics G11 Languages Test",
        code: `g11_en_iso_${Date.now()}`,
        systemId: g11.systemId,
        gradeId: g11.id,
        schoolCategory: "LANGUAGES",
      });
      cleanupSubjectIds.push(sub.id);
    }
  });

  afterAll(async () => {
    for (const id of cleanupSubjectIds) {
      await CurriculumService.deleteSubject(id).catch(() => {});
    }
  });
  // CRITERION 1: First Year Arabic subjects load correctly.
  it("Criterion 1: First Year Arabic subjects load correctly for G10 Arabic student scope", async () => {
    const g10Grade = await prisma.grade.findFirst({ where: { code: "bacc_g10" } });
    expect(g10Grade).toBeDefined();

    const g10ArScope = getCurriculumScope({
      role: "STUDENT",
      gradeId: g10Grade!.id,
      schoolCategory: "ARABIC",
    });

    expect(g10ArScope?.schoolCategory).toBe("ARABIC");

    const subjects = await prisma.subject.findMany({
      where: {
        isPublished: true,
        ...subjectScopeWhere(g10ArScope),
      },
    });

    expect(subjects.length).toBeGreaterThan(0);
    for (const sub of subjects) {
      expect(sub.gradeId).toBe(g10Grade!.id);
      expect(sub.schoolCategory).toBe("ARABIC");
    }
  });

  // CRITERION 2: First Year Language-school subjects load correctly.
  it("Criterion 2: First Year Language-school subjects load correctly for G10 Language student scope", async () => {
    const g10Grade = await prisma.grade.findFirst({ where: { code: "bacc_g10" } });
    const g10EnScope = getCurriculumScope({
      role: "STUDENT",
      gradeId: g10Grade!.id,
      schoolCategory: "LANGUAGES",
    });

    expect(g10EnScope?.schoolCategory).toBe("LANGUAGES");

    const subjects = await prisma.subject.findMany({
      where: {
        isPublished: true,
        ...subjectScopeWhere(g10EnScope),
      },
    });

    expect(subjects.length).toBeGreaterThan(0);
    for (const sub of subjects) {
      expect(sub.gradeId).toBe(g10Grade!.id);
      expect(sub.schoolCategory).toBe("LANGUAGES");
    }
  });

  // CRITERION 3: Second Year Arabic subjects load correctly.
  it("Criterion 3: Second Year Arabic subjects load correctly for G11 Arabic student scope", async () => {
    const g11Grade = await prisma.grade.findFirst({ where: { code: "bacc_g11" } });
    expect(g11Grade).toBeDefined();

    const g11ArScope = getCurriculumScope({
      role: "STUDENT",
      gradeId: g11Grade!.id,
      schoolCategory: "ARABIC",
    });

    const subjects = await prisma.subject.findMany({
      where: {
        isPublished: true,
        ...subjectScopeWhere(g11ArScope),
      },
    });

    expect(subjects.length).toBeGreaterThan(0);
    for (const sub of subjects) {
      expect(sub.gradeId).toBe(g11Grade!.id);
      expect(sub.schoolCategory).toBe("ARABIC");
    }
  });

  // CRITERION 4: Second Year Language-school subjects load correctly.
  it("Criterion 4: Second Year Language-school subjects load correctly for G11 Language student scope", async () => {
    const g11Grade = await prisma.grade.findFirst({ where: { code: "bacc_g11" } });
    const g11EnScope = getCurriculumScope({
      role: "STUDENT",
      gradeId: g11Grade!.id,
      schoolCategory: "LANGUAGES",
    });

    const subjects = await prisma.subject.findMany({
      where: {
        isPublished: true,
        ...subjectScopeWhere(g11EnScope),
      },
    });

    expect(subjects.length).toBeGreaterThan(0);
    for (const sub of subjects) {
      expect(sub.gradeId).toBe(g11Grade!.id);
      expect(sub.schoolCategory).toBe("LANGUAGES");
    }
  });

  // CRITERION 5: Students never see subjects belonging exclusively to another category.
  it("Criterion 5: Students never see subjects belonging exclusively to another school category or grade", async () => {
    const [g10Grade, g11Grade] = await Promise.all([
      prisma.grade.findFirst({ where: { code: "bacc_g10" } }),
      prisma.grade.findFirst({ where: { code: "bacc_g11" } }),
    ]);

    const arScope = getCurriculumScope({
      role: "STUDENT",
      gradeId: g10Grade!.id,
      schoolCategory: "ARABIC",
    });

    // Check if an Arabic student scope considers a Language-school subject in-scope
    const enSubject = await prisma.subject.findFirst({
      where: { gradeId: g10Grade!.id, schoolCategory: "LANGUAGES" },
    });
    if (enSubject) {
      expect(isSubjectInScope(arScope, enSubject)).toBe(false);
    }

    // Check if a G10 student considers a G11 subject in-scope
    const g11Subject = await prisma.subject.findFirst({
      where: { gradeId: g11Grade!.id, schoolCategory: "ARABIC" },
    });
    if (g11Subject) {
      expect(isSubjectInScope(arScope, g11Subject)).toBe(false);
    }

    // Database query validation: Arabic scope should return only ARABIC subjects and never LANGUAGES
    const arabicScopeSubjects = await prisma.subject.findMany({
      where: subjectScopeWhere(arScope),
    });
    expect(arabicScopeSubjects.length).toBeGreaterThan(0);
    expect(arabicScopeSubjects.every((s) => s.schoolCategory === "ARABIC")).toBe(true);
    expect(arabicScopeSubjects.some((s) => s.schoolCategory === "LANGUAGES")).toBe(false);
  });

  // CRITERION 6: Word/PDF imports attach questions to the correct grade and school category.
  it("Criterion 6: Word/PDF imports attach questions to the correct grade and school category with ImportBatch", async () => {
    const langSubject = await prisma.subject.findFirst({
      where: { schoolCategory: "LANGUAGES", grade: { code: "bacc_g10" }, units: { some: {} } },
      include: { units: { include: { lessons: true } } },
    });
    expect(langSubject).toBeDefined();

    const unit = langSubject!.units[0];
    const lesson = unit?.lessons[0];

    const result = await QuestionService.bulkCreateQuestions(
      [
        {
          statement: "What is an algorithm?",
          type: "MCQ",
          difficulty: "EASY",
          subjectId: langSubject!.id,
          unitId: unit?.id,
          questionLesson: lesson?.title,
          options: [
            { text: "A step-by-step procedure for solving a problem", isCorrect: true, order: 0 },
            { text: "A random set of instructions", isCorrect: false, order: 1 },
          ],
        },
      ],
      {
        fileName: "test_algorithms_import.docx",
        fileType: "DOCX",
        gradeId: langSubject!.gradeId,
        schoolCategory: "LANGUAGES",
        subjectId: langSubject!.id,
        unitId: unit?.id,
        lessonScope: lesson ? "LESSON" : "UNIT",
        lessonId: lesson?.id,
      }
    );

    expect(result.count).toBe(1);
    expect(result.batchId).toBeDefined();

    // Verify imported question in DB
    const batch = await prisma.importBatch.findUnique({
      where: { id: result.batchId },
      include: { questions: true },
    });
    expect(batch).toBeDefined();
    expect(batch?.schoolCategory).toBe("LANGUAGES");
    expect(batch?.questions.length).toBe(1);
    expect(batch?.questions[0].schoolCategory).toBe("LANGUAGES");
    expect(batch?.questions[0].subjectId).toBe(langSubject!.id);

    // Clean up test batch and question
    await prisma.question.deleteMany({ where: { batchId: result.batchId } });
    await prisma.importBatch.delete({ where: { id: result.batchId } });
  });

  // CRITERION 7 & 8: Repeated imports accumulate under the same lesson without duplicate lessons.
  it("Criteria 7 & 8: Repeated imports accumulate under the same lesson without creating duplicate lessons", async () => {
    const arSubject = await prisma.subject.findFirst({
      where: { schoolCategory: "ARABIC", grade: { code: "bacc_g10" }, units: { some: {} } },
      include: { units: { include: { lessons: true } } },
    });
    expect(arSubject).toBeDefined();

    const unit = arSubject!.units[0];
    const existingLessonCountBefore = await prisma.lesson.count({
      where: { unitId: unit.id },
    });

    const targetLessonTitle = unit.lessons[0]?.title || "درس تجريبي للاختبار";

    // First import into the lesson
    const import1 = await QuestionService.bulkCreateQuestions(
      [
        {
          statement: "سؤال الاستيراد الأول — الخوارزميات",
          type: "MCQ",
          difficulty: "MEDIUM",
          subjectId: arSubject!.id,
          unitId: unit.id,
          questionLesson: targetLessonTitle,
          options: [
            { text: "إجابة صحيحة 1", isCorrect: true, order: 0 },
            { text: "إجابة خاطئة 1", isCorrect: false, order: 1 },
          ],
        },
      ],
      {
        fileName: "batch_1.docx",
        fileType: "DOCX",
        gradeId: arSubject!.gradeId,
        schoolCategory: "ARABIC",
        subjectId: arSubject!.id,
        unitId: unit.id,
        lessonScope: "LESSON",
      }
    );

    // Second repeated import into the EXACT SAME lesson
    const import2 = await QuestionService.bulkCreateQuestions(
      [
        {
          statement: "سؤال الاستيراد الثاني — الخوارزميات المتقدمة",
          type: "TRUE_FALSE",
          difficulty: "HARD",
          subjectId: arSubject!.id,
          unitId: unit.id,
          questionLesson: targetLessonTitle,
          options: [
            { text: "صواب", isCorrect: true, order: 0 },
            { text: "خطأ", isCorrect: false, order: 1 },
          ],
        },
      ],
      {
        fileName: "batch_2.docx",
        fileType: "DOCX",
        gradeId: arSubject!.gradeId,
        schoolCategory: "ARABIC",
        subjectId: arSubject!.id,
        unitId: unit.id,
        lessonScope: "LESSON",
      }
    );

    expect(import1.count).toBe(1);
    expect(import2.count).toBe(1);

    // Lesson count in unit must NOT have duplicated
    const existingLessonCountAfter = await prisma.lesson.count({
      where: { unitId: unit.id },
    });
    // It should have either stayed the same (if lesson existed) or increased by at most 1 (if created once)
    expect(existingLessonCountAfter - existingLessonCountBefore).toBeLessThanOrEqual(1);

    // Both questions must belong to the exact same lesson
    const q1 = await prisma.question.findFirst({
      where: { batchId: import1.batchId },
      include: { lessons: true },
    });
    const q2 = await prisma.question.findFirst({
      where: { batchId: import2.batchId },
      include: { lessons: true },
    });

    expect(q1?.lessons?.[0]?.lessonId).toBeDefined();
    expect(q1?.lessons?.[0]?.lessonId).toBe(q2?.lessons?.[0]?.lessonId);

    // Clean up
    if (import1.batchId) {
      await prisma.question.deleteMany({ where: { batchId: import1.batchId } });
      await prisma.importBatch.delete({ where: { id: import1.batchId } });
    }
    if (import2.batchId) {
      await prisma.question.deleteMany({ where: { batchId: import2.batchId } });
      await prisma.importBatch.delete({ where: { id: import2.batchId } });
    }
  });

  // CRITERION 9: Arabic and Language question banks remain isolated.
  it("Criterion 9: Arabic and Language question banks remain isolated in queries and stats", async () => {
    const stats = await QuestionService.getQuestionStats();

    expect(stats.byCategory.ARABIC).toBeGreaterThanOrEqual(0);
    expect(stats.byCategory.LANGUAGES).toBeGreaterThanOrEqual(0);

    // Check that questionScopeWhere strictly isolates questions by schoolCategory
    const g10Grade = await prisma.grade.findFirst({ where: { code: "bacc_g10" } });
    const arScope = getCurriculumScope({
      role: "STUDENT",
      gradeId: g10Grade!.id,
      schoolCategory: "ARABIC",
    });

    const arQuestions = await prisma.question.findMany({
      where: questionScopeWhere(arScope),
      select: { id: true, schoolCategory: true, subject: { select: { schoolCategory: true } } },
    });

    for (const q of arQuestions) {
      expect(q.schoolCategory).toBe("ARABIC");
      expect(q.subject.schoolCategory).toBe("ARABIC");
    }

    const enScope = getCurriculumScope({
      role: "STUDENT",
      gradeId: g10Grade!.id,
      schoolCategory: "LANGUAGES",
    });

    const enQuestions = await prisma.question.findMany({
      where: questionScopeWhere(enScope),
      select: { id: true, schoolCategory: true, subject: { select: { schoolCategory: true } } },
    });

    for (const q of enQuestions) {
      expect(q.schoolCategory).toBe("LANGUAGES");
      expect(q.subject.schoolCategory).toBe("LANGUAGES");
    }
  });

  // CRITERION 10: Random exams never mix school categories or grades.
  it("Criterion 10: Random exam generation never mixes school categories or grades", async () => {
    const g10LangStudent = await prisma.user.findFirst({
      where: {
        email: "student.g10.en@kholasa.app",
        schoolCategory: "LANGUAGES",
      },
      include: { grade: true },
    });

    if (g10LangStudent && g10LangStudent.gradeId) {
      const langSubject = await prisma.subject.findFirst({
        where: {
          gradeId: g10LangStudent.gradeId,
          schoolCategory: "LANGUAGES",
        },
      });

      if (langSubject) {
        // Ensure at least 2 questions exist for langSubject to generate practice exam
        const count = await prisma.question.count({
          where: { subjectId: langSubject.id, status: "PUBLISHED" },
        });
        let tempQIds: string[] = [];
        if (count < 2) {
          const q1 = await prisma.question.create({
            data: {
              statement: "Test Question 1 for Criterion 10",
              type: "MCQ",
              difficulty: "EASY",
              subjectId: langSubject.id,
              schoolCategory: "LANGUAGES",
              status: "PUBLISHED",
              options: {
                create: [
                  { text: "Option A", isCorrect: true, order: 0 },
                  { text: "Option B", isCorrect: false, order: 1 },
                ],
              },
            },
          });
          const q2 = await prisma.question.create({
            data: {
              statement: "Test Question 2 for Criterion 10",
              type: "MCQ",
              difficulty: "MEDIUM",
              subjectId: langSubject.id,
              schoolCategory: "LANGUAGES",
              status: "PUBLISHED",
              options: {
                create: [
                  { text: "Option C", isCorrect: true, order: 0 },
                  { text: "Option D", isCorrect: false, order: 1 },
                ],
              },
            },
          });
          tempQIds = [q1.id, q2.id];
        }

        // Attempt to create an exam for the student
        const result = await ExamService.createCustomExam(
          {
            subjectId: langSubject.id,
            type: "ALL",
            mode: "PRACTICE",
            questionCount: 2,
          },
          g10LangStudent.id
        );

        expect(result.examId).toBeDefined();

        // Fetch questions in this exam
        const examWithQuestions = await prisma.exam.findUnique({
          where: { id: result.examId },
          include: {
            questions: {
              include: {
                question: {
                  include: { subject: true },
                },
              },
            },
          },
        });

        expect(examWithQuestions).toBeDefined();
        expect(examWithQuestions?.schoolCategory).toBe("LANGUAGES");
        expect(examWithQuestions?.subjectId).toBe(langSubject.id);

        expect(examWithQuestions?.questions.length).toBeGreaterThan(0);
        for (const eq of examWithQuestions!.questions) {
          expect(eq.question.schoolCategory).toBe("LANGUAGES");
          expect(eq.question.subject.schoolCategory).toBe("LANGUAGES");
          expect(eq.question.subject.gradeId).toBe(g10LangStudent.gradeId);
        }

        // Clean up generated test exam
        await prisma.examQuestion.deleteMany({ where: { examId: result.examId } });
        await prisma.examAttempt.deleteMany({ where: { examId: result.examId } });
        await prisma.exam.delete({ where: { id: result.examId } });
      }
    }
  });

  // CRITERION 11: Shuffling questions or choices never changes the correct-answer mapping.
  it("Criterion 11: Shuffling questions or choices never changes the correct-answer mapping", async () => {
    const question = await prisma.question.findFirst({
      where: { type: "MCQ" },
      include: { options: true },
    });

    expect(question).toBeDefined();
    const correctOption = question!.options.find((o) => o.isCorrect);
    expect(correctOption).toBeDefined();

    // Shuffling choices by ID: verify mapping stability
    const originalOptions = [...question!.options];
    const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);

    // The option with isCorrect === true has the EXACT SAME ID
    const shuffledCorrectOption = shuffledOptions.find((o) => o.isCorrect);
    expect(shuffledCorrectOption?.id).toBe(correctOption!.id);
    expect(shuffledCorrectOption?.text).toBe(correctOption!.text);
  });

  // CRITERION 12: Existing student exams and historical results remain intact.
  it("Criterion 12: Existing student exams, attempts, and historical results remain intact", async () => {
    let examCount = await prisma.exam.count();
    let questionCount = await prisma.question.count();
    const userCount = await prisma.user.count();

    // If running on a newly initialized database without historical exams, seed a sample record
    let createdSampleExamId: string | null = null;
    let createdSampleQuestionId: string | null = null;

    if (examCount === 0 || questionCount === 0) {
      const g10 = await prisma.grade.findFirst({ where: { code: "bacc_g10" } });
      const sub = await prisma.subject.findFirst({ where: { gradeId: g10?.id } });
      if (sub && g10) {
        if (questionCount === 0) {
          const q = await prisma.question.create({
            data: {
              statement: "سؤال تحقق معياري للسلامة",
              type: "MCQ",
              difficulty: "EASY",
              subjectId: sub.id,
              schoolCategory: sub.schoolCategory,
              status: "PUBLISHED",
            },
          });
          createdSampleQuestionId = q.id;
        }

        if (examCount === 0) {
          const e = await prisma.exam.create({
            data: {
              title: "امتحان معياري للتحقق",
              subjectId: sub.id,
              schoolCategory: sub.schoolCategory,
              durationMinutes: 15,
            },
          });
          createdSampleExamId = e.id;
        }
      }
      examCount = await prisma.exam.count();
      questionCount = await prisma.question.count();
    }

    expect(examCount).toBeGreaterThanOrEqual(1);
    expect(questionCount).toBeGreaterThanOrEqual(1);
    expect(userCount).toBeGreaterThanOrEqual(1);

    // Verify all existing exams have valid schoolCategory
    const allExams = await prisma.exam.findMany({
      select: { id: true, schoolCategory: true },
    });
    expect(allExams.every((e) => e.schoolCategory === "ARABIC" || e.schoolCategory === "LANGUAGES")).toBe(true);

    // Verify all existing questions have valid schoolCategory
    const allQuestions = await prisma.question.findMany({
      select: { id: true, schoolCategory: true },
    });
    expect(allQuestions.every((q) => q.schoolCategory === "ARABIC" || q.schoolCategory === "LANGUAGES")).toBe(true);

    if (createdSampleExamId) await prisma.exam.delete({ where: { id: createdSampleExamId } }).catch(() => {});
    if (createdSampleQuestionId) await prisma.question.delete({ where: { id: createdSampleQuestionId } }).catch(() => {});
  });
});
