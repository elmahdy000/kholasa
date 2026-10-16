import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true } },
        unit: { select: { id: true, title: true } },
        lessons: {
          include: {
            lesson: { select: { id: true, title: true } },
          },
        },
        options: { orderBy: { order: "asc" } },
        explanation: true,
        rubric: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: "السؤال غير موجود" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Failed to fetch question:", error);
    return NextResponse.json({ error: "تعذر تحميل بيانات السؤال" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      statement,
      type,
      difficulty,
      subjectId,
      unitId,
      lessonId,
      options,
      concept,
      correctReason,
      modelAnswer,
    } = body;

    if (!statement?.trim()) {
      return NextResponse.json({ error: "نص السؤال مطلوب" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update question core
      const q = await tx.question.update({
        where: { id },
        data: {
          statement: statement.trim(),
          ...(type ? { type } : {}),
          ...(difficulty ? { difficulty } : {}),
          ...(subjectId ? { subjectId } : {}),
          unitId: unitId || null,
        },
      });

      // 2. If options provided, update them
      if (Array.isArray(options) && options.length > 0) {
        // Delete old options
        await tx.questionOption.deleteMany({ where: { questionId: id } });
        // Create new options
        await tx.questionOption.createMany({
          data: options.map((opt: any, index: number) => ({
            questionId: id,
            text: opt.text.trim(),
            isCorrect: Boolean(opt.isCorrect),
            order: index + 1,
            explanation: opt.explanation?.trim() || null,
          })),
        });
      }

      // 3. Update lesson connection if provided
      if (lessonId !== undefined) {
        await tx.questionLesson.deleteMany({ where: { questionId: id } });
        if (lessonId) {
          await tx.questionLesson.create({
            data: { questionId: id, lessonId },
          });
        }
      }

      // 4. Explanation
      if (concept || correctReason) {
        await tx.questionExplanation.upsert({
          where: { questionId: id },
          create: {
            questionId: id,
            concept: concept?.trim() || "مفهوم السؤال",
            correctReason: correctReason?.trim() || "تفسير الإجابة الصحيحة",
          },
          update: {
            concept: concept !== undefined ? concept.trim() : undefined,
            correctReason: correctReason !== undefined ? correctReason.trim() : undefined,
          },
        });
      }

      // 5. Rubric if essay
      if (type === "ESSAY" && modelAnswer) {
        await tx.essayRubric.upsert({
          where: { questionId: id },
          create: {
            questionId: id,
            modelAnswer: modelAnswer.trim(),
            maxScore: 10,
            criteria: {},
          },
          update: {
            modelAnswer: modelAnswer.trim(),
          },
        });
      }

      return q;
    });

    const fullQuestion = await prisma.question.findUnique({
      where: { id: updated.id },
      include: {
        subject: { select: { id: true, name: true } },
        unit: { select: { id: true, title: true } },
        lessons: {
          include: {
            lesson: { select: { id: true, title: true } },
          },
        },
        options: { orderBy: { order: "asc" } },
        explanation: true,
        rubric: true,
      },
    });

    return NextResponse.json({ success: true, question: fullQuestion });
  } catch (error) {
    console.error("Failed to update question:", error);
    return NextResponse.json({ error: "تعذر تحديث السؤال" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete question:", error);
    return NextResponse.json({ error: "تعذر حذف السؤال" }, { status: 500 });
  }
}
