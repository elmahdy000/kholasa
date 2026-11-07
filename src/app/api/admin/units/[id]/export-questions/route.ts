import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff, canManageQuestions, canManageCurriculum } from "@/lib/auth";
import { forbidden, jsonError, notFound } from "@/lib/http";
import { QuestionType, Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .trim();
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || (!isStaff(user.role) && !canManageQuestions(user.role) && !canManageCurriculum(user.role))) {
      throw forbidden("غير مصرح لك بتصدير أسئلة الوحدة");
    }

    const { id: unitId } = await params;
    const { searchParams } = new URL(req.url);

    // 1. Fetch unit details with subject & system metadata
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        subject: {
          include: {
            grade: { select: { id: true, name: true, code: true } },
            system: { select: { id: true, name: true, code: true } },
          },
        },
        lessons: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, order: true },
        },
      },
    });

    if (!unit) {
      throw notFound("الوحدة المطلوبة غير موجودة");
    }

    // 2. Compute aggregate question counts for this unit by type
    const baseWhere: Prisma.QuestionWhereInput = {
      OR: [
        { unitId },
        {
          lessons: {
            some: {
              lesson: {
                unitId,
              },
            },
          },
        },
      ],
    };

    const typeCountsRaw = await prisma.question.groupBy({
      by: ["type"],
      where: baseWhere,
      _count: { _all: true },
    });

    const breakdown: Record<string, number> = {
      ALL: 0,
      MCQ: 0,
      TRUE_FALSE: 0,
      ESSAY: 0,
    };

    for (const item of typeCountsRaw) {
      if (item.type in breakdown) {
        breakdown[item.type] = item._count._all;
      }
      breakdown.ALL += item._count._all;
    }

    // 3. Filter by question type if requested
    const rawType = searchParams.get("type") || "ALL";
    const selectedType = rawType.toUpperCase();

    const queryWhere: Prisma.QuestionWhereInput = { ...baseWhere };
    if (selectedType !== "ALL" && Object.values(QuestionType).includes(selectedType as QuestionType)) {
      queryWhere.type = selectedType as QuestionType;
    }

    // 4. Fetch questions with deterministic ordering for easy diffing/comparing
    const questions = await prisma.question.findMany({
      where: queryWhere,
      orderBy: [
        { type: "asc" },
        { difficulty: "asc" },
        { createdAt: "asc" },
      ],
      include: {
        options: {
          orderBy: { order: "asc" },
          select: {
            id: true,
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
        lessons: {
          orderBy: {
            lesson: {
              order: "asc",
            },
          },
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                order: true,
              },
            },
          },
        },
      },
    });

    // 5. Structure clean, normalized JSON payload optimized for comparison
    const formattedQuestions = questions.map((q, idx) => ({
      index: idx + 1,
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      schoolCategory: q.schoolCategory,
      status: q.status,
      statement: q.statement,
      translation: q.translation || null,
      imageUrl: q.imageUrl || null,
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

    const subjectName = unit.subject?.name || "المادة";
    const gradeName = unit.subject?.grade?.name || "";
    const systemName = unit.subject?.system?.name || "";

    const exportPayload = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        unit: {
          id: unit.id,
          title: unit.title,
          order: unit.order,
          lessonsCount: unit.lessons.length,
        },
        subject: {
          id: unit.subject?.id,
          name: subjectName,
          grade: gradeName,
          system: systemName,
        },
        filtersApplied: {
          type: selectedType,
        },
        counts: {
          selectedTypeCount: formattedQuestions.length,
          breakdown,
        },
      },
      questions: formattedQuestions,
    };

    const filename = `${sanitizeFilename(subjectName)}_${sanitizeFilename(unit.title)}_${selectedType}_questions.json`;
    const jsonString = JSON.stringify(exportPayload, null, 2);

    // If client requested direct download as attachment
    if (searchParams.get("download") === "true") {
      return new NextResponse(jsonString, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    return NextResponse.json({
      success: true,
      filename,
      data: exportPayload,
    });
  } catch (error) {
    return jsonError(error);
  }
}
