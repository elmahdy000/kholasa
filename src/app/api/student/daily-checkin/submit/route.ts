import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { answers, timeSpentSeconds = 60 } = body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تقديم إجابات للاختبار" },
        { status: 400 }
      );
    }

    const questionIds = answers.map((a: any) => a.questionId);

    // Fetch questions with full solutions, correct options, and explanations
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: {
        subject: { select: { id: true, name: true } },
        unit: { select: { id: true, title: true } },
        options: { orderBy: { order: "asc" } },
        explanation: true,
        rubric: true,
      },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let correctCount = 0;
    let totalQuestions = answers.length;
    const reviewedQuestions: any[] = [];
    const mistakesToRecord: string[] = [];

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      let isCorrect = false;
      let selectedText = "";
      let correctText = "";

      if (q.type === "MCQ" || q.type === "TRUE_FALSE") {
        const selectedOpt = q.options.find((o) => o.id === ans.selectedOptionId);
        const correctOpt = q.options.find((o) => o.isCorrect);

        selectedText = selectedOpt?.text || "لم تتم الإجابة";
        correctText = correctOpt?.text || "";

        if (selectedOpt && selectedOpt.isCorrect) {
          isCorrect = true;
          correctCount++;
        } else {
          mistakesToRecord.push(q.id);
        }
      } else if (q.type === "ESSAY") {
        selectedText = ans.essayText?.trim() || "لم تتم الإجابة";
        correctText = q.rubric?.modelAnswer || "الإجابة النموذجية معتمدة وفق المفاهيم الأساسية";
        // Essay answers with > 5 words count as answered/self-review
        const wordCount = selectedText.split(/\s+/).filter(Boolean).length;
        if (wordCount >= 3) {
          isCorrect = true;
          correctCount++;
        } else {
          mistakesToRecord.push(q.id);
        }
      }

      reviewedQuestions.push({
        id: q.id,
        statement: q.statement,
        type: q.type,
        difficulty: q.difficulty,
        subjectName: q.subject.name,
        unitTitle: q.unit?.title || null,
        isCorrect,
        selectedAnswer: selectedText,
        correctAnswer: correctText,
        concept: q.explanation?.concept || null,
        correctReason: q.explanation?.correctReason || null,
        modelAnswer: q.rubric?.modelAnswer || null,
      });
    }

    const percentage =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Automatically record mistakes to student's MistakeReview table if user is logged in
    if (user && mistakesToRecord.length > 0) {
      for (const qId of mistakesToRecord) {
        await prisma.mistakeReview.upsert({
          where: {
            userId_questionId: {
              userId: user.id,
              questionId: qId,
            },
          },
          create: {
            userId: user.id,
            questionId: qId,
            wrongCount: 1,
            isResolved: false,
            lastAttemptAt: new Date(),
          },
          update: {
            wrongCount: { increment: 1 },
            isResolved: false,
            lastAttemptAt: new Date(),
          },
        });
      }
    }

    // Save attempt record
    if (user) {
      await prisma.examAttempt.create({
        data: {
          userId: user.id,
          title: "اختبار الدخول اليومي للمنصة",
          mode: "PRACTICE",
          totalQuestions,
          score: correctCount,
          percentage,
          timeSpentSeconds,
          isCompleted: true,
          completedAt: new Date(),
          answers: {
            create: answers.map((ans: any) => {
              const q = questionMap.get(ans.questionId);
              const isQCorrect =
                q?.type === "ESSAY"
                  ? (ans.essayText || "").trim().length > 10
                  : !!q?.options.find((o) => o.id === ans.selectedOptionId)?.isCorrect;

              return {
                questionId: ans.questionId,
                selectedOptionId: ans.selectedOptionId || null,
                essayText: ans.essayText || null,
                isCorrect: isQCorrect,
                score: isQCorrect ? 1 : 0,
              };
            }),
          },
        },
      });
    }

    const unlockToken = `unlocked_${new Date().toISOString().slice(0, 10)}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      success: true,
      score: correctCount,
      totalQuestions,
      percentage,
      wrongCount: totalQuestions - correctCount,
      unlockToken,
      reviewedQuestions,
    });
  } catch (error) {
    console.error("Failed to submit daily checkin exam:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تصحيح الاختبار" },
      { status: 500 }
    );
  }
}
