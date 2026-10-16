import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canManageExams } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageExams(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    const where: any = {};
    if (subjectId && subjectId !== "all") {
      where.subjectId = subjectId;
    }

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        questions: {
          select: { id: true, questionId: true },
        },
        attempts: {
          select: { id: true, score: true, percentage: true, isCompleted: true },
        },
      },
    });

    const formatted = exams.map((exam) => {
      const completedAttempts = exam.attempts.filter((a) => a.isCompleted);
      const attemptsCount = completedAttempts.length;
      const avgPercentage =
        attemptsCount > 0
          ? Math.round(
              completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
                attemptsCount
            )
          : 0;

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        isPractice: exam.isPractice,
        subject: exam.subject,
        questionsCount: exam.questions.length,
        attemptsCount,
        avgPercentage,
        createdAt: exam.createdAt,
      };
    });

    return NextResponse.json({ exams: formatted });
  } catch (error) {
    console.error("Failed to fetch admin exams:", error);
    return NextResponse.json({ error: "تعذر تحميل قائمة الامتحانات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageExams(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      subjectId,
      durationMinutes = 30,
      isPractice = false,
      questionIds = [],
      randomQuestionsCount = 0,
    } = body;

    if (!title?.trim() || !subjectId) {
      return NextResponse.json(
        { error: "يرجى تحديد عنوان الامتحان والمادة الدراسية" },
        { status: 400 }
      );
    }

    let selectedQuestionIds: string[] = Array.isArray(questionIds) ? questionIds : [];

    // If random questions requested and no specific IDs provided
    if (selectedQuestionIds.length === 0 && Number(randomQuestionsCount) > 0) {
      const availableQuestions = await prisma.question.findMany({
        where: { subjectId, status: "PUBLISHED" },
        select: { id: true },
        take: Number(randomQuestionsCount),
      });
      selectedQuestionIds = availableQuestions.map((q) => q.id);
    }

    const exam = await prisma.exam.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        subjectId,
        durationMinutes: Number(durationMinutes),
        isPractice: Boolean(isPractice),
        questions: {
          create: selectedQuestionIds.map((qId, idx) => ({
            questionId: qId,
            order: idx + 1,
          })),
        },
      },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        questions: { select: { id: true } },
      },
    });

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        isPractice: exam.isPractice,
        subject: exam.subject,
        questionsCount: exam.questions.length,
        attemptsCount: 0,
        avgPercentage: 0,
        createdAt: exam.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to create exam:", error);
    return NextResponse.json({ error: "تعذر إنشاء الامتحان" }, { status: 500 });
  }
}
