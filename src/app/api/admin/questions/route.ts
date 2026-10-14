import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const type = searchParams.get("type");
    const difficulty = searchParams.get("difficulty");

    const where: any = {};
    if (subjectId && subjectId !== "all") where.subjectId = subjectId;
    if (type && type !== "all") where.type = type;
    if (difficulty && difficulty !== "all") where.difficulty = difficulty;

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true } },
        unit: { select: { id: true, title: true } },
        options: { orderBy: { order: "asc" } },
        explanation: true,
        rubric: true,
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return NextResponse.json({ error: "تعذر جلب الأسئلة" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const {
      statement,
      type = "MCQ",
      difficulty = "MEDIUM",
      subjectId,
      unitId,
      lessonId,
      options = [],
      concept,
      correctReason,
      modelAnswer,
    } = body;

    if (!statement || !subjectId) {
      return NextResponse.json(
        { error: "نص السؤال والمادة الدراسية مطلوبان" },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        statement,
        type,
        difficulty,
        subjectId,
        unitId: unitId || null,
        status: "PUBLISHED",
        ...(lessonId
          ? {
              lessons: {
                create: { lessonId },
              },
            }
          : {}),
        ...(options && options.length > 0
          ? {
              options: {
                create: options.map((opt: any, idx: number) => ({
                  text: opt.text,
                  isCorrect: !!opt.isCorrect,
                  order: idx + 1,
                  explanation: opt.explanation || null,
                })),
              },
            }
          : {}),
        ...(concept && correctReason
          ? {
              explanation: {
                create: {
                  concept,
                  correctReason,
                },
              },
            }
          : {}),
        ...(modelAnswer
          ? {
              rubric: {
                create: {
                  modelAnswer,
                  maxScore: 10,
                },
              },
            }
          : {}),
      },
      include: {
        options: true,
        explanation: true,
      },
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Failed to create question:", error);
    return NextResponse.json({ error: "تعذر حفظ السؤال" }, { status: 500 });
  }
}
