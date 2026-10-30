import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { QuestionService } from "@/services/question.service";
import {
  QuestionValidationError,
  normalizeStatement,
  validateQuestionShape,
} from "@/services/question/validation";

describe("Question bank — pure validation rules", () => {
  it("accepts a well formed MCQ and rejects missing / multiple correct answers", () => {
    const base = { statement: "ما هو الذكاء الاصطناعي؟", type: "MCQ" };
    expect(
      validateQuestionShape({
        ...base,
        options: [
          { text: "أ", isCorrect: true },
          { text: "ب", isCorrect: false },
        ],
      })
    ).toEqual([]);
    expect(
      validateQuestionShape({
        ...base,
        options: [
          { text: "أ", isCorrect: false },
          { text: "ب", isCorrect: false },
        ],
      }).length
    ).toBeGreaterThan(0);
    expect(
      validateQuestionShape({
        ...base,
        options: [
          { text: "أ", isCorrect: true },
          { text: "ب", isCorrect: true },
        ],
      }).length
    ).toBeGreaterThan(0);
  });

  it("ignores blank options and rejects a single remaining option", () => {
    const errors = validateQuestionShape({
      statement: "سؤال",
      type: "MCQ",
      options: [
        { text: "الوحيد", isCorrect: true },
        { text: "   ", isCorrect: false },
      ],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("requires exactly two options for TRUE_FALSE and none for ESSAY", () => {
    expect(
      validateQuestionShape({
        statement: "عبارة",
        type: "TRUE_FALSE",
        options: [
          { text: "صواب", isCorrect: true },
          { text: "خطأ", isCorrect: false },
        ],
      })
    ).toEqual([]);
    expect(validateQuestionShape({ statement: "اشرح بالتفصيل", type: "ESSAY", options: [] })).toEqual([]);
  });

  it("rejects unknown enums instead of letting Prisma throw a 500", () => {
    expect(validateQuestionShape({ statement: "x", type: "WHATEVER" }).length).toBeGreaterThan(0);
    expect(
      validateQuestionShape({ statement: "x", type: "ESSAY", difficulty: "IMPOSSIBLE" }).length
    ).toBeGreaterThan(0);
  });

  it("normalizes Arabic diacritics, alef variants and whitespace for duplicate detection", () => {
    expect(normalizeStatement("  أَهمِّيَّةُ   الخوارزميات؟ ")).toBe(normalizeStatement("اهمية الخوارزميات؟"));
    expect(normalizeStatement("What IS an   Algorithm?")).toBe("what is an algorithm?");
  });
});

describe("Question bank — server-side integrity (database)", () => {
  const subjectIds: string[] = [];
  let arabic: { subjectId: string; unitId: string; lessonId: string };
  let languages: { subjectId: string; unitId: string; lessonId: string };
  let ready = false;

  async function createFixture(schoolCategory: "ARABIC" | "LANGUAGES", gradeId: string, systemId: string) {
    const subject = await prisma.subject.create({
      data: {
        name: `تجربة سلامة البنك ${schoolCategory}`,
        code: `qint_${schoolCategory.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
        systemId,
        gradeId,
        schoolCategory,
        units: {
          create: { title: "وحدة تجريبية", order: 1, lessons: { create: { title: "درس تجريبي", order: 1 } } },
        },
      },
      include: { units: { include: { lessons: true } } },
    });
    subjectIds.push(subject.id);
    return { subjectId: subject.id, unitId: subject.units[0].id, lessonId: subject.units[0].lessons[0].id };
  }

  beforeAll(async () => {
    const grade = await prisma.grade.findFirst({ where: { code: "bacc_g10" } });
    if (!grade) return;
    arabic = await createFixture("ARABIC", grade.id, grade.systemId);
    languages = await createFixture("LANGUAGES", grade.id, grade.systemId);
    ready = true;
  });

  afterAll(async () => {
    if (subjectIds.length > 0) {
      await prisma.importBatch.deleteMany({ where: { subjectId: { in: subjectIds } } });
      await prisma.subject.deleteMany({ where: { id: { in: subjectIds } } });
    }
  });

  const mcq = (statement: string) => ({
    statement,
    type: "MCQ" as const,
    difficulty: "EASY" as const,
    options: [
      { text: "الإجابة الصحيحة", isCorrect: true },
      { text: "إجابة خاطئة", isCorrect: false },
    ],
  });

  it("rejects an MCQ without a correct answer and writes nothing", async () => {
    if (!ready) return;
    await expect(
      QuestionService.bulkCreateQuestions(
        [
          {
            ...mcq("سؤال بلا إجابة صحيحة"),
            subjectId: arabic.subjectId,
            options: [
              { text: "أ", isCorrect: false },
              { text: "ب", isCorrect: false },
            ],
          },
        ],
        { subjectId: arabic.subjectId }
      )
    ).rejects.toBeInstanceOf(QuestionValidationError);
    expect(await prisma.question.count({ where: { subjectId: arabic.subjectId } })).toBe(0);
    expect(await prisma.importBatch.count({ where: { subjectId: arabic.subjectId } })).toBe(0);
  });

  it("refuses a unit that belongs to another subject (Arabic / Languages isolation)", async () => {
    if (!ready) return;
    await expect(
      QuestionService.bulkCreateQuestions([{ ...mcq("سؤال عابر للمسارات"), subjectId: arabic.subjectId, unitId: languages.unitId }], {
        subjectId: arabic.subjectId,
      })
    ).rejects.toBeInstanceOf(QuestionValidationError);

    await expect(
      QuestionService.createQuestion({
        ...mcq("سؤال مباشر عابر للمسارات"),
        subjectId: arabic.subjectId,
        lessonIds: [languages.lessonId],
      })
    ).rejects.toBeInstanceOf(QuestionValidationError);
    expect(await prisma.question.count({ where: { subjectId: arabic.subjectId } })).toBe(0);
  });

  it("skips duplicates already in the bank and fails when everything is a duplicate", async () => {
    if (!ready) return;
    const first = await QuestionService.bulkCreateQuestions(
      [{ ...mcq("ما هي الخوارزمية؟"), subjectId: arabic.subjectId }],
      { subjectId: arabic.subjectId, unitId: arabic.unitId }
    );
    expect(first.count).toBe(1);
    expect(first.skippedDuplicates).toBe(0);

    const second = await QuestionService.bulkCreateQuestions(
      [
        { ...mcq("ما هي  الخوارزمية؟ "), subjectId: arabic.subjectId },
        { ...mcq("سؤال جديد تماماً"), subjectId: arabic.subjectId },
      ],
      { subjectId: arabic.subjectId, unitId: arabic.unitId }
    );
    expect(second.count).toBe(1);
    expect(second.skippedDuplicates).toBe(1);

    await expect(
      QuestionService.bulkCreateQuestions([{ ...mcq("سؤال جديد تماماً"), subjectId: arabic.subjectId }], {
        subjectId: arabic.subjectId,
      })
    ).rejects.toMatchObject({ status: 409 });
  });

  it("keeps option ids when editing so previous student answers stay valid", async () => {
    if (!ready) return;
    const created = await QuestionService.createQuestion({
      ...mcq("سؤال للتعديل الآمن"),
      subjectId: languages.subjectId,
      unitId: languages.unitId,
      lessonIds: [languages.lessonId],
      explanation: { concept: "مفهوم", correctReason: "سبب" },
    });
    const before = created.options.map((o) => o.id).sort();

    const updated = await QuestionService.updateQuestion(created.id, {
      statement: "سؤال للتعديل الآمن (معدل)",
      options: [
        { text: "الإجابة الصحيحة (معدلة)", isCorrect: true },
        { text: "إجابة خاطئة", isCorrect: false },
      ],
      explanation: null,
      unitId: null,
      lessonIds: [],
    });

    expect(updated?.options.map((o) => o.id).sort()).toEqual(before);
    expect(updated?.options.find((o) => o.isCorrect)?.text).toBe("الإجابة الصحيحة (معدلة)");
    expect(updated?.explanation).toBeNull();
    expect(updated?.unit).toBeNull();
    expect(updated?.lessons).toHaveLength(0);
    expect(updated?.subject.schoolCategory).toBe("LANGUAGES");
  });

  it("re-derives the school category when the subject changes and clears the old unit", async () => {
    if (!ready) return;
    const created = await QuestionService.createQuestion({
      ...mcq("سؤال سينتقل بين المادتين"),
      subjectId: languages.subjectId,
      unitId: languages.unitId,
    });
    const moved = await QuestionService.updateQuestion(created.id, { subjectId: arabic.subjectId });
    expect(moved?.subject.id).toBe(arabic.subjectId);
    expect(moved?.schoolCategory).toBe("ARABIC");
    expect(moved?.unit).toBeNull();
  });

  it("requires options when changing an essay into an MCQ", async () => {
    if (!ready) return;
    const essay = await QuestionService.createQuestion({
      statement: "اشرح مراحل حل المشكلة",
      type: "ESSAY",
      subjectId: arabic.subjectId,
      rubric: { modelAnswer: "التخطيط ثم التنفيذ" },
    });
    await expect(QuestionService.updateQuestion(essay.id, { type: "MCQ" })).rejects.toBeInstanceOf(
      QuestionValidationError
    );
  });

  describe("Student Data Shield — preserving student answers & history", () => {
    let studentId: string | undefined;

    beforeAll(async () => {
      const student = await prisma.user.create({
        data: {
          email: `shield_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`,
          name: "طالب تجربة الحماية",
          role: "STUDENT",
        },
      });
      studentId = student.id;
    });

    afterAll(async () => {
      if (studentId) {
        await prisma.bookmark.deleteMany({ where: { userId: studentId } });
        await prisma.mistakeReview.deleteMany({ where: { userId: studentId } });
        await prisma.user.delete({ where: { id: studentId } }).catch(() => {});
      }
    });

    it("archives instead of deleting when question has student bookmarks or mistakes", async () => {
      if (!ready || !studentId) return;

      const question = await QuestionService.createQuestion({
        ...mcq("سؤال تفاعل معه طالب ويجب حمايته من الحذف"),
        subjectId: arabic.subjectId,
      });

      // Link to student bookmark
      await prisma.bookmark.create({
        data: {
          userId: studentId,
          questionId: question.id,
        },
      });

      // Attempt to delete question
      const result = await QuestionService.deleteQuestion(question.id);
      expect(result.status).toBe("ARCHIVED");

      // Verify row still exists in database and is archived
      const inDb = await prisma.question.findUnique({
        where: { id: question.id },
      });
      expect(inDb).not.toBeNull();
      expect(inDb?.status).toBe("ARCHIVED");

      // Verify bookmark still exists
      const bookmark = await prisma.bookmark.findFirst({
        where: { questionId: question.id, userId: studentId },
      });
      expect(bookmark).not.toBeNull();
    });

    it("hard-deletes unlinked question with zero student interaction", async () => {
      if (!ready) return;

      const question = await QuestionService.createQuestion({
        ...mcq("سؤال نقي لم يره أي طالب"),
        subjectId: arabic.subjectId,
      });

      await QuestionService.deleteQuestion(question.id);

      const inDb = await prisma.question.findUnique({
        where: { id: question.id },
      });
      expect(inDb).toBeNull();
    });

    it("bulk-deletes by safely archiving linked questions and purging unlinked ones", async () => {
      if (!ready || !studentId) return;

      const qLinked = await QuestionService.createQuestion({
        ...mcq("سؤال جماعي مع طالب"),
        subjectId: arabic.subjectId,
      });
      const qUnlinked = await QuestionService.createQuestion({
        ...mcq("سؤال جماعي بلا طالب"),
        subjectId: arabic.subjectId,
      });

      // Link student mistake
      await prisma.mistakeReview.create({
        data: {
          userId: studentId,
          questionId: qLinked.id,
          wrongCount: 1,
        },
      });

      const summary = await QuestionService.bulkDeleteQuestions([qLinked.id, qUnlinked.id]);

      expect(summary.count).toBe(2);
      expect(summary.archivedCount).toBe(1);
      expect(summary.deletedCount).toBe(1);

      const checkLinked = await prisma.question.findUnique({ where: { id: qLinked.id } });
      expect(checkLinked?.status).toBe("ARCHIVED");

      const checkUnlinked = await prisma.question.findUnique({ where: { id: qUnlinked.id } });
      expect(checkUnlinked).toBeNull();
    });
  });
});
