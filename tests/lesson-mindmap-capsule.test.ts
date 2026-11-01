import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { CurriculumLessonsService } from "@/services/curriculum/lessons";

describe("EL KHOLASA — Lesson MindMap Capsule & Visual Sheets", () => {
  let createdLessonId: string | null = null;
  let testUnitId: string | null = null;

  it("should create a lesson with multiple mind map sheets", async () => {
    // 1. Get an existing unit from test db
    const unit = await prisma.unit.findFirst({
      include: { subject: true },
    });
    expect(unit).toBeDefined();
    testUnitId = unit!.id;

    // 2. Create a test lesson with mind map images
    const lesson = await CurriculumLessonsService.createLesson({
      unitId: unit!.id,
      title: "درس تجريبي لاختبار الخرائط الذهنية المتعددة",
      order: 9998,
      durationMinutes: 25,
      isPublished: true,
      bodyText: "محتوى الدرس لشرح الوراثة الجزيئية ومخططات المفاهيم.",
      images: [
        "/api/media/lessons/mindmap-sheet-1.png",
        "/api/media/lessons/mindmap-sheet-2.png",
      ],
    });

    expect(lesson).toBeDefined();
    expect(lesson.id).toBeDefined();
    createdLessonId = lesson.id;

    // Verify MindMap record in database
    const mindMap = await prisma.mindMap.findUnique({
      where: { lessonId: lesson.id },
    });
    expect(mindMap).toBeDefined();
    expect(mindMap?.images).toHaveLength(2);
    expect(mindMap?.images[0]).toBe("/api/media/lessons/mindmap-sheet-1.png");
    expect(mindMap?.images[1]).toBe("/api/media/lessons/mindmap-sheet-2.png");
    expect(mindMap?.title).toContain("خريطة:");
  });

  it("should update mind map sheets, description, and structured nodes & edges", async () => {
    expect(createdLessonId).toBeDefined();

    const updated = await CurriculumLessonsService.updateLesson(createdLessonId!, {
      mindMap: {
        title: "خريطة المفاهيم المركزية - قوانين مندل والوراثة",
        description: "مخطط تفصيلي يربط بين الصفات السائدة والمتنحية وطرز الكروموسومات",
        images: [
          "/api/media/lessons/mindmap-sheet-1.png",
          "/api/media/lessons/mindmap-sheet-2.png",
          "/api/media/lessons/mindmap-sheet-3.webp",
        ],
        nodes: [
          { id: "root-1", label: "علم الوراثة", level: 0 },
          { id: "l1-1", label: "الوراثة المندلية", level: 1 },
          { id: "l1-2", label: "الوراثة اللا مندلية", level: 1 },
          { id: "l2-1", label: "قانون انعزال العوامل", level: 2 },
          { id: "l2-2", label: "قانون التوزيع الحر", level: 2 },
          { id: "l2-3", label: "انعدام السيادة", level: 2 },
        ],
        edges: [
          { id: "e1", source: "root-1", target: "l1-1" },
          { id: "e2", source: "root-1", target: "l1-2" },
          { id: "e3", source: "l1-1", target: "l2-1" },
          { id: "e4", source: "l1-1", target: "l2-2" },
          { id: "e5", source: "l1-2", target: "l2-3" },
        ],
      },
    });

    expect(updated).toBeDefined();

    // Verify database updates
    const mindMap = await prisma.mindMap.findUnique({
      where: { lessonId: createdLessonId! },
    });
    expect(mindMap).toBeDefined();
    expect(mindMap?.title).toBe("خريطة المفاهيم المركزية - قوانين مندل والوراثة");
    expect(mindMap?.description).toBe(
      "مخطط تفصيلي يربط بين الصفات السائدة والمتنحية وطرز الكروموسومات"
    );
    expect(mindMap?.images).toHaveLength(3);
    expect(mindMap?.images[2]).toBe("/api/media/lessons/mindmap-sheet-3.webp");

    const nodes = (mindMap?.nodes as any[]) || [];
    const edges = (mindMap?.edges as any[]) || [];
    expect(nodes).toHaveLength(6);
    expect(edges).toHaveLength(5);

    // Verify hierarchy relation
    const l1_1_Edges = edges.filter((e) => e.source === "l1-1");
    expect(l1_1_Edges).toHaveLength(2);
    expect(l1_1_Edges.map((e) => e.target)).toContain("l2-1");
    expect(l1_1_Edges.map((e) => e.target)).toContain("l2-2");

    const l1_2_Edges = edges.filter((e) => e.source === "l1-2");
    expect(l1_2_Edges).toHaveLength(1);
    expect(l1_2_Edges[0].target).toBe("l2-3");
  });

  it("should cascade delete mindMap when lesson is removed", async () => {
    expect(createdLessonId).toBeDefined();

    await CurriculumLessonsService.deleteLesson(createdLessonId!);

    const deletedMindMap = await prisma.mindMap.findUnique({
      where: { lessonId: createdLessonId! },
    });
    expect(deletedMindMap).toBeNull();

    createdLessonId = null;
  });

  afterAll(async () => {
    if (createdLessonId) {
      await prisma.lesson.deleteMany({
        where: { id: createdLessonId },
      });
    }
  });
});
