import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تقديم أي أسئلة صالحة للاستيراد" },
        { status: 400 }
      );
    }

    const importedCount = await prisma.$transaction(async (tx) => {
      let count = 0;
      for (const q of questions) {
        if (!q.statement || !q.subjectId) continue;

        await tx.question.create({
          data: {
            statement: q.statement,
            type: q.type || "MCQ",
            difficulty: q.difficulty || "MEDIUM",
            status: "PUBLISHED",
            subjectId: q.subjectId,
            unitId: q.unitId || null,
            options: {
              create: (q.options || []).map((opt: any, idx: number) => ({
                text: opt.text,
                isCorrect: !!opt.isCorrect,
                order: idx + 1,
                explanation: opt.explanation || null,
              })),
            },
            ...(q.concept && q.correctReason
              ? {
                  explanation: {
                    create: {
                      concept: q.concept,
                      correctReason: q.correctReason,
                    },
                  },
                }
              : {}),
          },
        });
        count++;
      }
      return count;
    });

    return NextResponse.json({
      success: true,
      importedCount,
    });
  } catch (error) {
    console.error("Bulk import failed:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء استيراد الأسئلة" },
      { status: 500 }
    );
  }
}
