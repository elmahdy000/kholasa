import { prisma } from "@/lib/prisma";
import { QuestionType } from "@prisma/client";

export interface DailyCheckinAnswer {
  questionId: string;
  selectedOptionId?: string | null;
  essayText?: string | null;
}

export class DailyCheckinService {
  /**
   * Generate daily entrance exam (3-5 diversified questions)
   */
  static async getDailyCheckinQuestions(gradeId?: string | null) {
    const whereClause: any = {
      status: "PUBLISHED",
    };

    if (gradeId) {
      whereClause.subject = {
        gradeId,
      };
    }

    const [mcqQuestions, tfQuestions, essayQuestions] = await Promise.all([
      prisma.question.findMany({
        where: { ...whereClause, type: QuestionType.MCQ },
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
        where: { ...whereClause, type: QuestionType.TRUE_FALSE },
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
        where: { ...whereClause, type: QuestionType.ESSAY },
        include: {
          subject: { select: { id: true, name: true } },
          unit: { select: { id: true, title: true } },
        },
        take: 10,
      }),
    ]);

    const shuffle = <T>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const selected: any[] = [];
    const shuffledMcq = shuffle(mcqQuestions);
    selected.push(...shuffledMcq.slice(0, 2));

    const shuffledTf = shuffle(tfQuestions);
    selected.push(...shuffledTf.slice(0, 1));

    const shuffledEssay = shuffle(essayQuestions);
    selected.push(...shuffledEssay.slice(0, 1));

    if (selected.length < 3) {
      const remainingMcqs = shuffledMcq.slice(2);
      for (const q of remainingMcqs) {
        if (selected.length >= 4) break;
        selected.push(q);
      }
    }

    // Fallback if no questions matched the grade filter
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

    return {
      dateKey,
      totalCount: finalizedQuestions.length,
      questions: finalizedQuestions,
    };
  }

  /**
   * Submit and review daily checkin exam, strictly observing DEC-011 for essay comparison
   */
  static async submitDailyCheckin(
    userId: string | null,
    answers: DailyCheckinAnswer[],
    timeSpentSeconds = 60
  ) {
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new Error("لم يتم تقديم إجابات للاختبار");
    }

    const questionIds = answers.map((a) => a.questionId);

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
    let objectiveCount = 0;
    const reviewedQuestions: any[] = [];
    const mistakesToRecord: string[] = [];

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      let isCorrect: boolean | null = false;
      let selectedText = "";
      let correctText = "";

      if (q.type === QuestionType.MCQ || q.type === QuestionType.TRUE_FALSE) {
        objectiveCount++;
        const selectedOpt = q.options.find((o) => o.id === ans.selectedOptionId);
        const correctOpt = q.options.find((o) => o.isCorrect);

        selectedText = selectedOpt?.text || "لم تتم الإجابة";
        correctText = correctOpt?.text || "";

        if (selectedOpt && selectedOpt.isCorrect) {
          isCorrect = true;
          correctCount++;
        } else {
          isCorrect = false;
          mistakesToRecord.push(q.id);
        }
      } else if (q.type === QuestionType.ESSAY) {
        // DEC-011: Essay questions are NOT graded automatically, nor recorded as mistakes
        isCorrect = null;
        selectedText = ans.essayText?.trim() || "لم تتم الإجابة";
        correctText = q.rubric?.modelAnswer || "الإجابة النموذجية المعتمدة في بنك الأسئلة";
      }

      reviewedQuestions.push({
        id: q.id,
        statement: q.statement,
        type: q.type,
        difficulty: q.difficulty,
        subjectName: q.subject.name,
        unitTitle: q.unit?.title || null,
        isCorrect,
        isEssay: q.type === QuestionType.ESSAY,
        selectedAnswer: selectedText,
        correctAnswer: correctText,
        concept: q.explanation?.concept || null,
        correctReason: q.explanation?.correctReason || null,
        modelAnswer: q.rubric?.modelAnswer || null,
      });
    }

    const percentage =
      objectiveCount > 0 ? Math.round((correctCount / objectiveCount) * 100) : 100;

    // Record mistakes only for objective questions
    if (userId && mistakesToRecord.length > 0) {
      for (const qId of mistakesToRecord) {
        await prisma.mistakeReview.upsert({
          where: {
            userId_questionId: {
              userId,
              questionId: qId,
            },
          },
          create: {
            userId,
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
    if (userId) {
      await prisma.examAttempt.create({
        data: {
          userId,
          title: "اختبار الدخول اليومي للمنصة",
          mode: "PRACTICE",
          totalQuestions: answers.length,
          score: correctCount,
          percentage,
          timeSpentSeconds,
          isCompleted: true,
          completedAt: new Date(),
          answers: {
            create: answers.map((ans) => {
              const q = questionMap.get(ans.questionId);
              const isEssay = q?.type === QuestionType.ESSAY;
              const isQCorrect = isEssay
                ? null
                : !!q?.options.find((o) => o.id === ans.selectedOptionId)?.isCorrect;

              return {
                questionId: ans.questionId,
                selectedOptionId: ans.selectedOptionId || null,
                essayText: ans.essayText || null,
                isCorrect: isQCorrect,
                score: isQCorrect === true ? 1 : 0,
              };
            }),
          },
        },
      });
    }

    const unlockToken = `unlocked_${new Date().toISOString().slice(0, 10)}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      score: correctCount,
      totalObjective: objectiveCount,
      totalQuestions: answers.length,
      percentage,
      wrongCount: mistakesToRecord.length,
      unlockToken,
      reviewedQuestions,
    };
  }
}
