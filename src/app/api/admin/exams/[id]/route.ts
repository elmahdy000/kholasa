import { NextResponse } from "next/server";
import { getCurrentUser, canManageExams } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExamService } from "@/services";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageExams(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              select: {
                id: true,
                statement: true,
                translation: true,
                type: true,
                difficulty: true,
                imageUrl: true,
                unit: { select: { id: true, title: true } },
                lessons: {
                  select: {
                    lesson: { select: { id: true, title: true } },
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
                explanation: { select: { correctReason: true, concept: true } },
                rubric: { select: { modelAnswer: true, maxScore: true } },
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "الامتحان غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (error) {
    console.error("Failed to fetch exam:", error);
    return NextResponse.json({ error: "تعذر تحميل بيانات الامتحان" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageExams(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { isPractice, title, durationMinutes, description, startsAt, endsAt, isPublished, scopeDetails } = body;

    const updated = await ExamService.updateExam(id, {
      isPractice,
      title,
      durationMinutes,
      description,
      startsAt,
      endsAt,
      isPublished,
      scopeDetails,
    });

    return NextResponse.json({ success: true, exam: updated });
  } catch (error) {
    console.error("Failed to update exam:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر تحديث بيانات الامتحان" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageExams(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    await ExamService.deleteExam(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete exam:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر حذف الامتحان" },
      { status: 500 }
    );
  }
}
