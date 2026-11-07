import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageExams } from "@/lib/auth";
import { Prisma, QuestionType, Difficulty } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageExams(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    if (!subjectId) {
      return NextResponse.json({ error: "معرف المادة مطلوب" }, { status: 400 });
    }

    const unitIdsParam = searchParams.get("unitIds");
    const lessonIdsParam = searchParams.get("lessonIds");
    const typeParam = searchParams.get("type");
    const diffParam = searchParams.get("difficulty");
    const search = searchParams.get("search")?.trim();

    const unitIds = unitIdsParam ? unitIdsParam.split(",").filter(Boolean) : [];
    const lessonIds = lessonIdsParam ? lessonIdsParam.split(",").filter(Boolean) : [];

    const where: Prisma.QuestionWhereInput = {
      subjectId,
      status: "PUBLISHED",
    };

    if (unitIds.length > 0) {
      where.unitId = { in: unitIds };
    }

    if (lessonIds.length > 0) {
      where.lessons = {
        some: {
          lessonId: { in: lessonIds },
        },
      };
    }

    if (typeParam && typeParam !== "ALL") {
      where.type = typeParam as QuestionType;
    }

    if (diffParam && diffParam !== "ALL") {
      where.difficulty = diffParam as Difficulty;
    }

    if (search) {
      where.OR = [
        { statement: { contains: search, mode: "insensitive" } },
        { translation: { contains: search, mode: "insensitive" } },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      orderBy: [
        { unit: { order: "asc" } },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        statement: true,
        translation: true,
        type: true,
        difficulty: true,
        imageUrl: true,
        unitId: true,
        unit: {
          select: { id: true, title: true, order: true },
        },
        lessons: {
          select: {
            lesson: {
              select: { id: true, title: true, order: true },
            },
          },
        },
        options: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            text: true,
            translation: true,
            isCorrect: true,
            order: true,
          },
        },
        explanation: {
          select: { correctReason: true, concept: true },
        },
        rubric: {
          select: { modelAnswer: true, maxScore: true },
        },
      },
    });

    // Compute stats
    const stats = {
      total: questions.length,
      mcqCount: questions.filter((q) => q.type === "MCQ").length,
      trueFalseCount: questions.filter((q) => q.type === "TRUE_FALSE").length,
      essayCount: questions.filter((q) => q.type === "ESSAY").length,
      byDifficulty: {
        EASY: questions.filter((q) => q.difficulty === "EASY").length,
        MEDIUM: questions.filter((q) => q.difficulty === "MEDIUM").length,
        HARD: questions.filter((q) => q.difficulty === "HARD").length,
      },
      byUnit: {} as Record<string, number>,
      byLesson: {} as Record<string, number>,
    };

    for (const q of questions) {
      if (q.unitId) {
        stats.byUnit[q.unitId] = (stats.byUnit[q.unitId] || 0) + 1;
      }
      for (const l of q.lessons) {
        stats.byLesson[l.lesson.id] = (stats.byLesson[l.lesson.id] || 0) + 1;
      }
    }

    return NextResponse.json({
      success: true,
      questions,
      stats,
    });
  } catch (error) {
    console.error("Failed to fetch questions pool:", error);
    return NextResponse.json(
      { error: "تعذر تحميل بنك أسئلة الامتحان" },
      { status: 500 }
    );
  }
}

