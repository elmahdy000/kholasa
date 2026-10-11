import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول لبدء الامتحان" }, { status: 401 });
    }

    const body = await req.json();
    const {
      subjectId,
      unitId,
      lessonIds = [],
      type = "ALL",
      difficulty = "ALL",
      questionCount = 10,
      mode = "PRACTICE",
      durationMinutes = 20,
      title,
    } = body;

    if (!subjectId) {
      return NextResponse.json({ error: "يجب اختيار المادة الدراسية" }, { status: 400 });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: "المادة غير موجودة" }, { status: 404 });
    }

    // Build query filter
    const where: any = {
      status: "PUBLISHED",
      subjectId,
    };

    if (unitId && unitId !== "all") {
      where.unitId = unitId;
    }

    if (Array.isArray(lessonIds) && lessonIds.length > 0) {
      where.lessons = {
        some: {
          lessonId: { in: lessonIds },
        },
      };
    }

    if (type && type !== "ALL" && type !== "MIXED") {
      where.type = type;
    }

    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty;
    }

    // Fetch candidate questions
    const allQuestions = await prisma.question.findMany({
      where,
      select: { id: true },
    });

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "لا توجد أسئلة كافية مطابقة لمعايير التحديد الحالية" },
        { status: 400 }
      );
    }

    // Shuffle and pick questionCount
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(Number(questionCount), allQuestions.length));

    const examTitle =
      title ||
      `امتحان مخصص: ${subject.name} (${mode === "PRACTICE" ? "وضع التدريب" : "وضع الامتحان"})`;

    // Create custom Exam
    const exam = await prisma.exam.create({
      data: {
        title: examTitle,
        subjectId,
        durationMinutes: Number(durationMinutes) || 20,
        isPractice: mode === "PRACTICE",
        questions: {
          create: selected.map((q, idx) => ({
            questionId: q.id,
            order: idx + 1,
          })),
        },
      },
    });

    // Create Initial ExamAttempt
    const attempt = await prisma.examAttempt.create({
      data: {
        userId: user.id,
        examId: exam.id,
        title: examTitle,
        mode: mode === "PRACTICE" ? "PRACTICE" : "EXAM",
        totalQuestions: selected.length,
        timeSpentSeconds: 0,
        isCompleted: false,
      },
    });

    return NextResponse.json({
      success: true,
      examId: exam.id,
      attemptId: attempt.id,
    });
  } catch (error) {
    console.error("Failed to create exam:", error);
    return NextResponse.json({ error: "تعذر إنشاء الامتحان" }, { status: 500 });
  }
}
