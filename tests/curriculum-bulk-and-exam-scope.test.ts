import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { CurriculumService } from "@/services/curriculum.service";
import { ExamService } from "@/services/exam.service";

describe("Curriculum Bulk Import & Exam Scoping Tests", () => {
  it("bulk imports units and lessons into a subject atomically", async () => {
    const subject = await prisma.subject.findFirst();
    expect(subject).toBeDefined();

    const unitsToImport = [
      {
        title: "وحدة الاختبار المؤقتة - 1",
        description: "وصف وحدة الاختبار",
        lessons: [
          { title: "الدرس التجريبي 1", durationMinutes: 20 },
          { title: "الدرس التجريبي 2", durationMinutes: 15 },
        ],
      },
      {
        title: "وحدة الاختبار المؤقتة - 2",
        lessons: [
          { title: "الدرس التجريبي 3", durationMinutes: 25 },
        ],
      },
    ];

    const createdUnits = await CurriculumService.bulkImportCurriculum(
      subject!.id,
      unitsToImport
    );

    expect(createdUnits).toHaveLength(2);
    expect(createdUnits[0].title).toBe("وحدة الاختبار المؤقتة - 1");
    expect(createdUnits[0].lessons).toHaveLength(2);
    expect(createdUnits[1].lessons).toHaveLength(1);

    // Clean up
    for (const unit of createdUnits) {
      await CurriculumService.deleteUnit(unit.id);
    }
  });

  it("filters candidate questions by unitId when creating official exam", async () => {
    const subject = await prisma.subject.findFirst();
    expect(subject).toBeDefined();

    // 1. Create a unit
    const unitA = await CurriculumService.createUnit({
      subjectId: subject!.id,
      title: "وحدة خاصة لاختبار الامتحان A",
    });

    // 2. Create questions in unitA
    const qA1 = await prisma.question.create({
      data: {
        subjectId: subject!.id,
        unitId: unitA.id,
        statement: "سؤال تابع للوحدة A - 1",
        type: "MCQ",
        status: "PUBLISHED",
      },
    });

    const qA2 = await prisma.question.create({
      data: {
        subjectId: subject!.id,
        unitId: unitA.id,
        statement: "سؤال تابع للوحدة A - 2",
        type: "MCQ",
        status: "PUBLISHED",
      },
    });

    // 3. Create official exam scoped to unitA
    const exam = await ExamService.createOfficialExam({
      title: "امتحان شامل على الوحدة A",
      subjectId: subject!.id,
      unitId: unitA.id,
      randomQuestionsCount: 2,
    });

    expect(exam).toBeDefined();
    expect(exam.questions).toHaveLength(2);

    // Verify all exam questions belong to unitA
    const examQIds = exam.questions.map((q) => q.questionId);
    expect(examQIds).toContain(qA1.id);
    expect(examQIds).toContain(qA2.id);

    // Clean up
    await prisma.exam.delete({ where: { id: exam.id } });
    await prisma.question.delete({ where: { id: qA1.id } });
    await prisma.question.delete({ where: { id: qA2.id } });
    await CurriculumService.deleteUnit(unitA.id);
  });
});
