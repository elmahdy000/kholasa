import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MistakeService } from "@/services/mistake.service";
import { jsonError, parseJson, unauthorized } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

const flashcardMistakeSchema = z.object({
  term: z.string().min(1, "المصطلح مطلوب"),
  meaning: z.string().min(1, "التعريف مطلوب"),
  action: z.enum(["RECORD_MISTAKE", "RESOLVE_MISTAKE"]).default("RECORD_MISTAKE"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized("غير مصرح لك بتسجيل التسميع");

    rateLimit(`flashcard:mistake:${user.id}`, 60, 60 * 1000);

    const { id: lessonId } = await params;
    const body = await parseJson(req, flashcardMistakeSchema);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        unit: {
          select: {
            id: true,
            subjectId: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "الدرس غير موجود" },
        { status: 404 }
      );
    }

    const normalizedTerm = body.term.trim();
    const normalizedMeaning = body.meaning.trim();

    let questionId: string;

    // Check if an essay question already exists for this term under this lesson
    const existingQuestion = await prisma.question.findFirst({
      where: {
        type: "ESSAY",
        subjectId: lesson.unit.subjectId,
        lessons: {
          some: {
            lessonId: lesson.id,
          },
        },
        OR: [
          { statement: `ما المقصود بمصطلح: ${normalizedTerm}؟` },
          { statement: { contains: normalizedTerm } },
        ],
      },
      select: {
        id: true,
      },
    });

    if (existingQuestion) {
      questionId = existingQuestion.id;
    } else {
      // Create a clean ESSAY question representing this definition
      const created = await prisma.question.create({
        data: {
          statement: `ما المقصود بمصطلح: ${normalizedTerm}؟`,
          type: "ESSAY",
          difficulty: "MEDIUM",
          status: "PUBLISHED",
          subjectId: lesson.unit.subjectId,
          unitId: lesson.unitId,
          rubric: {
            create: {
              modelAnswer: normalizedMeaning,
              criteria: [
                "صياغة المفهوم العلمي بدقة واكتمال",
                "توضيح العناصر والأركان الأساسية للمصطلح",
              ],
              maxScore: 2,
            },
          },
          explanation: {
            create: {
              concept: normalizedTerm,
              correctReason: normalizedMeaning,
            },
          },
          lessons: {
            create: {
              lessonId: lesson.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
      questionId = created.id;
    }

    if (body.action === "RECORD_MISTAKE") {
      const mistake = await MistakeService.recordMistake(user.id, questionId);
      return NextResponse.json({
        success: true,
        action: "RECORDED",
        questionId,
        wrongCount: mistake.wrongCount,
        message: "تم حفظ المصطلح في بنك غلطاتي بنجاح للمراجعة اللاحقة",
      });
    } else {
      await MistakeService.resolveMistake(user.id, questionId);
      return NextResponse.json({
        success: true,
        action: "RESOLVED",
        questionId,
        message: "تم تسجيل المصطلح كمتقن وإزالته من الأخطاء غير المحلولة",
      });
    }
  } catch (error) {
    return jsonError(error);
  }
}
