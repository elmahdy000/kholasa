import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET: Return student exam attempts with optional filters (examId, userId, search)
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const id = searchParams.get("id"); // Fetch single attempt with detailed answers

    if (id) {
      const singleAttempt = await prisma.examAttempt.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true },
          },
          exam: {
            select: {
              id: true,
              title: true,
              durationMinutes: true,
              subject: { select: { id: true, name: true, color: true } },
            },
          },
          answers: {
            include: {
              question: {
                include: {
                  options: true,
                  explanation: true,
                  rubric: true,
                },
              },
            },
          },
        },
      });

      if (!singleAttempt) {
        return NextResponse.json({ error: "المحاولة غير موجودة" }, { status: 404 });
      }

      return NextResponse.json({ attempt: singleAttempt });
    }

    const where: any = {};
    if (examId) where.examId = examId;
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search } } },
      ];
    }

    const attempts = await prisma.examAttempt.findMany({
      where,
      take: 50,
      orderBy: { startedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        exam: {
          select: {
            id: true,
            title: true,
            subject: { select: { id: true, name: true, color: true } },
          },
        },
        _count: {
          select: { answers: true },
        },
      },
    });

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("Failed to fetch student attempts:", error);
    return NextResponse.json(
      { error: "تعذر تحميل سجل محاولات الطلاب" },
      { status: 500 }
    );
  }
}

// PATCH: Grade an essay question or recalculate attempt score
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { answerId, isCorrect, score, attemptId } = body;

    if (!answerId) {
      return NextResponse.json({ error: "معرف الإجابة مطلوب" }, { status: 400 });
    }

    // Update the individual answer
    await prisma.studentAnswer.update({
      where: { id: answerId },
      data: {
        isCorrect: isCorrect !== undefined ? !!isCorrect : undefined,
        score: score !== undefined ? Number(score) : undefined,
      },
    });

    // If attemptId is provided, recalculate total score & percentage
    if (attemptId) {
      const allAnswers = await prisma.studentAnswer.findMany({
        where: { attemptId },
        select: { isCorrect: true, score: true },
      });

      const totalCorrect = allAnswers.filter((a) => a.isCorrect === true).length;
      const totalAnswers = allAnswers.length || 1;
      const percentage = Math.round((totalCorrect / totalAnswers) * 100);

      const updatedAttempt = await prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          score: totalCorrect,
          percentage,
        },
      });

      return NextResponse.json({ success: true, updatedAttempt });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update student grade:", error);
    return NextResponse.json(
      { error: "تعذر تحديث الدرجة" },
      { status: 500 }
    );
  }
}
