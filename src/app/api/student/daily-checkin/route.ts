import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    // Only apply to authenticated students or guests
    const userId = user?.id;

    // Filter by student's grade/system if available
    const whereClause: any = {
      status: "PUBLISHED",
    };

    if (user?.gradeId) {
      whereClause.subject = {
        gradeId: user.gradeId,
      };
    }

    // Try to get a diverse set:
    // 2 MCQs, 1-2 True/False, 1 Essay
    const [mcqQuestions, tfQuestions, essayQuestions] = await Promise.all([
      prisma.question.findMany({
        where: { ...whereClause, type: "MCQ" },
        include: {
          subject: { select: { id: true, name: true } },
          unit: { select: { id: true, title: true } },
          options: {
            select: { id: true, text: true, order: true },
            orderBy: { order: "asc" },
          },
        },
        take: 10,
      }),
      prisma.question.findMany({
        where: { ...whereClause, type: "TRUE_FALSE" },
        include: {
          subject: { select: { id: true, name: true } },
          unit: { select: { id: true, title: true } },
          options: {
            select: { id: true, text: true, order: true },
            orderBy: { order: "asc" },
          },
        },
        take: 10,
      }),
      prisma.question.findMany({
        where: { ...whereClause, type: "ESSAY" },
        include: {
          subject: { select: { id: true, name: true } },
          unit: { select: { id: true, title: true } },
        },
        take: 10,
      }),
    ]);

    // Shuffle helper
    const shuffle = <T>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const selected: any[] = [];

    // Pick 2 MCQs (or fallback from all)
    const shuffledMcq = shuffle(mcqQuestions);
    selected.push(...shuffledMcq.slice(0, 2));

    // Pick 1-2 True/False
    const shuffledTf = shuffle(tfQuestions);
    selected.push(...shuffledTf.slice(0, 1));

    // Pick 1 Essay
    const shuffledEssay = shuffle(essayQuestions);
    selected.push(...shuffledEssay.slice(0, 1));

    // If total is less than 3, fill from remaining MCQs
    if (selected.length < 3) {
      const remainingMcqs = shuffledMcq.slice(2);
      for (const q of remainingMcqs) {
        if (selected.length >= 4) break;
        selected.push(q);
      }
    }

    // Fallback: If no grade-specific questions found, search without grade filter
    if (selected.length === 0) {
      const fallbackQuestions = await prisma.question.findMany({
        where: { status: "PUBLISHED" },
        include: {
          subject: { select: { id: true, name: true } },
          unit: { select: { id: true, title: true } },
          options: {
            select: { id: true, text: true, order: true },
            orderBy: { order: "asc" },
          },
        },
        take: 5,
      });
      selected.push(...fallbackQuestions);
    }

    // Shuffle options of each question to randomize choice order
    const finalizedQuestions = selected.map((q) => ({
      id: q.id,
      statement: q.statement,
      type: q.type,
      difficulty: q.difficulty,
      subjectName: q.subject?.name || "المادة",
      unitTitle: q.unit?.title || null,
      options: q.options ? shuffle(q.options) : [],
    }));

    const dateKey = new Date().toISOString().slice(0, 10);

    return NextResponse.json({
      success: true,
      dateKey,
      totalCount: finalizedQuestions.length,
      questions: finalizedQuestions,
    });
  } catch (error) {
    console.error("Failed to generate daily checkin exam:", error);
    return NextResponse.json(
      { error: "تعذر توليد اختبار الدخول اليومي" },
      { status: 500 }
    );
  }
}
