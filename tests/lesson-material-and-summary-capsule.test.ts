import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { CurriculumLessonsService } from "@/services/curriculum/lessons";

describe("EL KHOLASA — Lesson Material & Summary Capsule (PDF & Images)", () => {
  let createdLessonId: string | null = null;
  let testUnitId: string | null = null;

  it("should create a lesson with content PDF, summary PDF, and summary visual cards", async () => {
    // 1. Get or create a unit
    const unit = await prisma.unit.findFirst({
      include: { subject: true },
    });
    expect(unit).toBeDefined();
    testUnitId = unit!.id;

    // 2. Create a test lesson with full material & summary capsule
    const lesson = await CurriculumLessonsService.createLesson({
      unitId: unit!.id,
      title: "درس تجريبي لاختبار كبسولة الزتونة وماتريال PDF",
      order: 9999,
      durationMinutes: 20,
      isPublished: true,
      bodyText: "## مقدمة الشرح\nمحتوى تفصيلي لاختبار الدرس والماتريال.",
      pdfUrl: "/api/media/lessons/test-explanation-material.pdf",
      summaryPdfUrl: "/api/media/lessons/test-zaytouna-capsule.pdf",
      summaryImages: [
        "/api/media/lessons/card-1-summary.webp",
        "/api/media/lessons/card-2-infographic.png",
      ],
      keyConcepts: ["المفهوم الأول المستخلص", "المفهوم الثاني المركز"],
      examTips: ["تنبيه مهم: انتبه لعلامة السالب في القانون"],
    });

    expect(lesson).toBeDefined();
    expect(lesson.id).toBeDefined();
    createdLessonId = lesson.id;

    // Verify content record
    const content = await prisma.lessonContent.findUnique({
      where: { lessonId: lesson.id },
    });
    expect(content).toBeDefined();
    expect(content?.pdfUrl).toBe("/api/media/lessons/test-explanation-material.pdf");

    // Verify summary record
    const summary = await prisma.lessonSummary.findUnique({
      where: { lessonId: lesson.id },
    });
    expect(summary).toBeDefined();
    expect(summary?.pdfUrl).toBe("/api/media/lessons/test-zaytouna-capsule.pdf");
    expect(summary?.images).toHaveLength(2);
    expect(summary?.images[0]).toBe("/api/media/lessons/card-1-summary.webp");
    expect(summary?.images[1]).toBe("/api/media/lessons/card-2-infographic.png");
    expect(summary?.keyConcepts).toHaveLength(2);
  });

  it("should update and reorder summary images and update summary PDF via CurriculumLessonsService.updateLesson", async () => {
    expect(createdLessonId).toBeDefined();

    const updated = await CurriculumLessonsService.updateLesson(createdLessonId!, {
      summary: {
        pdfUrl: "/api/media/lessons/updated-zaytouna.pdf",
        images: [
          "/api/media/lessons/card-2-infographic.png",
          "/api/media/lessons/card-1-summary.webp",
          "/api/media/lessons/card-3-formulas.png",
        ],
        keyConcepts: ["مفهوم معدل ومحدث"],
      },
      content: {
        pdfUrl: "/api/media/lessons/updated-explanation-notes.pdf",
      },
    });

    expect(updated).toBeDefined();
    expect(updated?.summary?.pdfUrl).toBe("/api/media/lessons/updated-zaytouna.pdf");
    expect(updated?.summary?.images).toHaveLength(3);
    expect(updated?.summary?.images[0]).toBe("/api/media/lessons/card-2-infographic.png");
    expect(updated?.content?.pdfUrl).toBe("/api/media/lessons/updated-explanation-notes.pdf");
  });

  afterAll(async () => {
    if (createdLessonId) {
      await CurriculumLessonsService.deleteLesson(createdLessonId).catch(() => {});
    }
  });
});
