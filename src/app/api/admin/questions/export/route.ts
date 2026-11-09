import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageQuestions } from "@/lib/auth";
import { forbidden, jsonError } from "@/lib/http";
import { QuestionType, Difficulty, SchoolCategory, Prisma } from "@prisma/client";

function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .trim();
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageQuestions(user.role)) {
      throw forbidden("غير مصرح لك بتصدير بنك الأسئلة");
    }

    const { searchParams } = new URL(req.url);

    // Extract filters
    const idsParam = searchParams.get("ids");
    const subjectId = searchParams.get("subjectId");
    const gradeId = searchParams.get("gradeId");
    const unitId = searchParams.get("unitId");
    const lessonId = searchParams.get("lessonId");
    const rawCategory = searchParams.get("schoolCategory");
    const rawType = searchParams.get("type");
    const rawDifficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const isDownload = searchParams.get("download") === "true";

    // Build Prisma query condition
    const where: Prisma.QuestionWhereInput = {};

    // Specific IDs filter (e.g. from bulk selection)
    if (idsParam) {
      const ids = idsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length > 0) {
        where.id = { in: ids };
      }
    }

    if (subjectId && subjectId !== "all") {
      where.subjectId = subjectId;
    }

    if (gradeId && gradeId !== "all") {
      where.subject = { gradeId };
    }

    if (unitId && unitId !== "all") {
      where.unitId = unitId;
    }

    if (lessonId && lessonId !== "all") {
      where.lessons = {
        some: { lessonId },
      };
    }

    if (rawCategory && rawCategory !== "all") {
      if (rawCategory === "ARABIC" || rawCategory === "LANGUAGES") {
        where.schoolCategory = rawCategory as SchoolCategory;
      }
    }

    if (rawType && rawType !== "all") {
      const upper = rawType.toUpperCase();
      if (Object.values(QuestionType).includes(upper as QuestionType)) {
        where.type = upper as QuestionType;
      }
    }

    if (rawDifficulty && rawDifficulty !== "all") {
      const upper = rawDifficulty.toUpperCase();
      if (Object.values(Difficulty).includes(upper as Difficulty)) {
        where.difficulty = upper as Difficulty;
      }
    }

    if (search && search.trim()) {
      where.OR = [
        { statement: { contains: search.trim(), mode: "insensitive" } },
        { translation: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    // Fetch questions with complete relation graph
    const questions = await prisma.question.findMany({
      where,
      orderBy: [
        { subject: { order: "asc" } },
        { unit: { order: "asc" } },
        { type: "asc" },
        { difficulty: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            schoolCategory: true,
            grade: { select: { id: true, name: true, code: true } },
          },
        },
        unit: {
          select: { id: true, title: true, order: true },
        },
        lessons: {
          orderBy: { lesson: { order: "asc" } },
          include: {
            lesson: {
              select: { id: true, title: true, order: true },
            },
          },
        },
        options: {
          orderBy: { order: "asc" },
          select: {
            order: true,
            text: true,
            translation: true,
            isCorrect: true,
            explanation: true,
          },
        },
        explanation: {
          select: {
            concept: true,
            correctReason: true,
          },
        },
        rubric: {
          select: {
            maxScore: true,
            modelAnswer: true,
            modelAnswerTranslation: true,
            criteria: true,
          },
        },
      },
    });

    // Compute breakdown counts
    const breakdown = {
      ALL: questions.length,
      MCQ: 0,
      TRUE_FALSE: 0,
      ESSAY: 0,
    };

    for (const q of questions) {
      if (q.type in breakdown) {
        breakdown[q.type as keyof typeof breakdown]++;
      }
    }

    // Format questions array in standard authoring format
    const formattedQuestions = questions.map((q, idx) => ({
      index: idx + 1,
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      schoolCategory: q.schoolCategory,
      statement: q.statement,
      translation: q.translation || null,
      imageUrl: q.imageUrl || null,
      subject: q.subject
        ? {
            id: q.subject.id,
            name: q.subject.name,
            grade: q.subject.grade?.name || null,
            schoolCategory: q.subject.schoolCategory,
          }
        : null,
      unit: q.unit
        ? {
            id: q.unit.id,
            title: q.unit.title,
            order: q.unit.order,
          }
        : null,
      lessons: q.lessons.map((l) => ({
        id: l.lesson.id,
        title: l.lesson.title,
        order: l.lesson.order,
      })),
      options:
        q.type === "ESSAY"
          ? []
          : q.options.map((opt) => ({
              order: opt.order,
              text: opt.text,
              translation: opt.translation || null,
              isCorrect: opt.isCorrect,
              explanation: opt.explanation || null,
            })),
      explanation: q.explanation
        ? {
            concept: q.explanation.concept,
            correctReason: q.explanation.correctReason,
          }
        : null,
      rubric:
        q.type === "ESSAY" && q.rubric
          ? {
              maxScore: q.rubric.maxScore,
              modelAnswer: q.rubric.modelAnswer,
              modelAnswerTranslation: q.rubric.modelAnswerTranslation || null,
              criteria: q.rubric.criteria,
            }
          : null,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    }));

    const dateStr = new Date().toISOString().split("T")[0];
    const categoryLabel = rawCategory === "LANGUAGES" ? "Languages" : rawCategory === "ARABIC" ? "Arabic" : "All";
    const typeLabel = rawType && rawType !== "all" ? `_${rawType}` : "";
    const filename = `Kholasa_Questions_Export_${categoryLabel}${typeLabel}_${dateStr}.json`;

    const payload = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        platform: "منصة الخلاصة التعليمية",
        totalQuestions: formattedQuestions.length,
        filtersApplied: {
          idsCount: idsParam ? idsParam.split(",").length : undefined,
          subjectId: subjectId || "all",
          gradeId: gradeId || "all",
          unitId: unitId || "all",
          lessonId: lessonId || "all",
          schoolCategory: rawCategory || "all",
          type: rawType || "all",
          difficulty: rawDifficulty || "all",
          search: search || null,
        },
        counts: breakdown,
      },
      questions: formattedQuestions,
    };

    const jsonString = JSON.stringify(payload, null, 2);

    if (isDownload) {
      return new NextResponse(jsonString, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(sanitizeFilename(filename))}"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    return NextResponse.json({
      success: true,
      filename,
      data: payload,
    });
  } catch (error) {
    return jsonError(error);
  }
}
