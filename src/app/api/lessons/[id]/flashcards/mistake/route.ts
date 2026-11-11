import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUserAccessLesson } from "@/lib/lesson-access";
import { MistakeService } from "@/services/mistake.service";
import { forbidden, jsonError, notFound, parseJson, unauthorized } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { emitRealtimeEvent } from "@/lib/realtime";

const flashcardMistakeSchema = z.object({
  term: z.string().min(1, "المصطلح مطلوب").max(400),
  meaning: z.string().min(1, "التعريف مطلوب").max(5000),
  action: z.enum(["RECORD_MISTAKE", "RESOLVE_MISTAKE"]).default("RECORD_MISTAKE"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized("غير مصرح لك بتسجيل تسميع الدرس");

    rateLimit(`flashcard:mistake:${user.id}`, 60, 60 * 1000);

    const { id: lessonId } = await params;
    const body = await parseJson(req, flashcardMistakeSchema);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        unit: {
          select: {
            id: true,
            order: true,
            isPublished: true,
            subjectId: true,
            subject: {
              select: {
                id: true,
                isPublished: true,
                gradeId: true,
                trackId: true,
                schoolCategory: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw notFound("الدرس غير موجود");
    }

    const access = canUserAccessLesson(user, lesson);
    if (!access.allowed) {
      if (access.reason === "SUBSCRIPTION_REQUIRED") {
        throw forbidden("يلزم تفعيل الاشتراك لتسجيل مراجعة هذا الدرس");
      }
      throw notFound("الدرس غير متاح في مسارك الدراسي");
    }

    const normalizedTerm = body.term.trim();
    const normalizedMeaning = body.meaning.trim();
    const isEnglishTerm = !/[\u0600-\u06FF]/.test(normalizedTerm);
    const arStatement = `ما المقصود بمصطلح: ${normalizedTerm}؟`;
    const enStatement = `What is meant by the term: ${normalizedTerm}?`;

    // Look up an exact matching flashcard review question for this term in this lesson
    const existingQuestion = await prisma.question.findFirst({
      where: {
        type: "ESSAY",
        status: "PUBLISHED",
        subjectId: lesson.unit.subjectId,
        lessons: {
          some: {
            lessonId: lesson.id,
          },
        },
        OR: [
          { statement: arStatement },
          { statement: enStatement },
        ],
      },
      select: {
        id: true,
      },
    });

    if (body.action === "RESOLVE_MISTAKE") {
      if (existingQuestion) {
        await MistakeService.resolveMistake(user.id, existingQuestion.id);
        emitRealtimeEvent({
          topic: "analytics",
          action: "mistake_updated",
          audience: "user",
          targetUserId: user.id,
          entityId: existingQuestion.id,
        });
      }
      return NextResponse.json({
        success: true,
        action: "RESOLVED",
        questionId: existingQuestion?.id ?? null,
        message: isEnglishTerm
          ? "Concept marked as mastered and removed from active mistakes"
          : "تم تسجيل المصطلح كمتقن وإزالته من الأخطاء غير المحلولة",
      });
    }

    let questionId: string;
    if (existingQuestion) {
      questionId = existingQuestion.id;
    } else {
      const statement = isEnglishTerm ? enStatement : arStatement;

      const created = await prisma.question.create({
        data: {
          statement,
          type: "ESSAY",
          difficulty: "MEDIUM",
          status: "PUBLISHED",
          subjectId: lesson.unit.subjectId,
          unitId: lesson.unitId,
          schoolCategory: lesson.unit.subject.schoolCategory,
          rubric: {
            create: {
              modelAnswer: normalizedMeaning,
              criteria: isEnglishTerm
                ? [
                    "Accurately formulate the scientific concept and definition",
                    "Identify key pillars and context of the term",
                  ]
                : [
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

    const mistake = await MistakeService.recordMistake(user.id, questionId);
    emitRealtimeEvent({
      topic: "analytics",
      action: "mistake_updated",
      audience: "user",
      targetUserId: user.id,
      entityId: questionId,
    });
    return NextResponse.json({
      success: true,
      action: "RECORDED",
      questionId,
      wrongCount: mistake.wrongCount,
      message: isEnglishTerm
        ? "Concept saved to My Mistakes bank for later review"
        : "تم حفظ المصطلح في بنك غلطاتي بنجاح للمراجعة اللاحقة",
    });
  } catch (error) {
    return jsonError(error);
  }
}
