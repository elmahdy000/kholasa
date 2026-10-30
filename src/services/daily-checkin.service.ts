import { prisma } from "@/lib/prisma";
import { QuestionType } from "@prisma/client";
import { badRequest, conflict } from "@/lib/http";
import { getCairoDayKey } from "@/lib/date";
import {
  CurriculumScope,
  subjectScopeWhere,
} from "@/lib/curriculum";

export interface DailyCheckinAnswer {
  questionId: string;
  selectedOptionId?: string | null;
  essayText?: string | null;
}

interface ReviewedDailyQuestion {
  id: string;
  statement: string;
  type: QuestionType;
  difficulty: string;
  subjectName: string;
  unitTitle: string | null;
  isCorrect: boolean | null;
  isEssay: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  concept: string | null;
  correctReason: string | null;
  modelAnswer: string | null;
}

const DAILY_QUESTION_COUNT = { mcq: 2, trueFalse: 1, essay: 1, fallbackMax: 4 };

/**
 * Server-issued daily challenge.
 * The question set is persisted once per user per Cairo day (DailyChallenge),
 * so refreshing the page cannot reroll the questions, and completion is
 * enforced server-side instead of relying on localStorage.
 */
export class DailyCheckinService {
  private static shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private static async pickQuestionIds(
    scope: CurriculumScope | null,
    userId?: string
  ): Promise<string[]> {
    const subjectFilter = subjectScopeWhere(scope);
    const hasScope = Boolean(scope?.gradeId);

    // Identify questions already answered by this student to prevent repetition
    let answeredIds = new Set<string>();
    if (userId) {
      const pastAnswers = await prisma.studentAnswer.findMany({
        where: { attempt: { userId } },
        select: { questionId: true },
      });
      answeredIds = new Set(pastAnswers.map((a) => a.questionId));
    }

    const whereClause = {
      status: "PUBLISHED" as const,
      ...(hasScope ? { subject: { is: subjectFilter } } : {}),
    };

    const [mcq, trueFalse, essay] = await Promise.all([
      prisma.question.findMany({
        where: { ...whereClause, type: QuestionType.MCQ },
        select: { id: true },
        take: 40,
      }),
      prisma.question.findMany({
        where: { ...whereClause, type: QuestionType.TRUE_FALSE },
        select: { id: true },
        take: 40,
      }),
      prisma.question.findMany({
        where: { ...whereClause, type: QuestionType.ESSAY },
        select: { id: true },
        take: 40,
      }),
    ]);

    const filterFresh = (list: { id: string }[], count: number) => {
      const fresh = list.filter((q) => !answeredIds.has(q.id));
      const pool = fresh.length >= count ? fresh : [...fresh, ...list.filter((q) => answeredIds.has(q.id))];
      return this.shuffle(pool).slice(0, count).map((q) => q.id);
    };

    const ids = [
      ...filterFresh(mcq, DAILY_QUESTION_COUNT.mcq),
      ...filterFresh(trueFalse, DAILY_QUESTION_COUNT.trueFalse),
      ...filterFresh(essay, DAILY_QUESTION_COUNT.essay),
    ];

    // Fallback if the grade has no matching published questions yet. The
    // fallback stays inside the student's curriculum whenever a scope exists.
    if (ids.length === 0 && !hasScope) {
      const fallback = await prisma.question.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true },
        take: DAILY_QUESTION_COUNT.fallbackMax,
      });
      return fallback.map((q) => q.id);
    }

    return ids;
  }

  private static async loadQuestions(questionIds: string[]) {
    if (questionIds.length === 0) return [];

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds }, status: "PUBLISHED" },
      include: {
        subject: { select: { id: true, name: true } },
        unit: { select: { id: true, title: true } },
        options: {
          select: { id: true, text: true, order: true },
          orderBy: { order: "asc" },
        },
      },
    });

    const byId = new Map(questions.map((q) => [q.id, q]));

    return questionIds
      .map((id) => byId.get(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q))
      .map((q) => ({
        id: q.id,
        statement: q.statement,
        type: q.type,
        difficulty: q.difficulty,
        subjectName: q.subject?.name || "المادة",
        unitTitle: q.unit?.title || null,
        options: this.shuffle(q.options),
      }));
  }

  static async getDailyCheckinQuestions(
    userId: string,
    scope: CurriculumScope | null
  ) {
    const day = getCairoDayKey();

    let challenge = await prisma.dailyChallenge.findUnique({
      where: { userId_day: { userId, day } },
    });

    if (!challenge || challenge.questionIds.length === 0) {
      const questionIds = await this.pickQuestionIds(scope, userId);

      if (challenge) {
        challenge = await prisma.dailyChallenge.update({
          where: { id: challenge.id },
          data: { questionIds },
        });
      } else {
        try {
          challenge = await prisma.dailyChallenge.create({
            data: { userId, day, questionIds },
          });
        } catch {
          // Unique constraint race: another request created today's challenge.
          challenge = await prisma.dailyChallenge.findUnique({
            where: { userId_day: { userId, day } },
          });
        }
      }
    }

    const questions = await this.loadQuestions(challenge?.questionIds ?? []);
    const completed = Boolean(challenge?.completedAt);

    return {
      dateKey: day,
      completed,
      totalCount: questions.length,
      questions,
    };
  }

  /**
   * Submit and review the daily challenge. Essays are not auto-graded (DEC-011);
   * the model answer is returned for self-comparison.
   */
  static async submitDailyCheckin(
    userId: string,
    answers: DailyCheckinAnswer[],
    timeSpentSeconds = 60
  ) {
    if (!Array.isArray(answers) || answers.length === 0) {
      throw badRequest("لم يتم تقديم إجابات للاختبار");
    }

    const day = getCairoDayKey();
    const challenge = await prisma.dailyChallenge.findUnique({
      where: { userId_day: { userId, day } },
    });

    if (!challenge) {
      throw badRequest("لم يبدأ تحدي اليوم بعد، أعد تحميل الصفحة");
    }

    if (challenge.completedAt) {
      throw conflict("تم إنجاز تحدي اليوم مسبقاً");
    }

    // Only accept questions that belong to today's issued set.
    const allowed = new Set(challenge.questionIds);
    const validAnswers = answers.filter((a) => allowed.has(a.questionId));

    if (validAnswers.length === 0) {
      throw badRequest("الإجابات المرسلة لا تطابق أسئلة تحدي اليوم");
    }

    const questions = await prisma.question.findMany({
      where: { id: { in: challenge.questionIds }, status: "PUBLISHED" },
      include: {
        subject: { select: { id: true, name: true } },
        unit: { select: { id: true, title: true } },
        options: { orderBy: { order: "asc" } },
        explanation: true,
        rubric: true,
      },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const answersByQuestion = new Map(validAnswers.map((a) => [a.questionId, a]));

    let correctCount = 0;
    let objectiveCount = 0;
    const reviewedQuestions: ReviewedDailyQuestion[] = [];
    const mistakesToRecord: string[] = [];

    for (const qId of challenge.questionIds) {
      const q = questionMap.get(qId);
      if (!q) continue;

      const ans = answersByQuestion.get(qId);
      const isEssay = q.type === QuestionType.ESSAY;
      let isCorrect: boolean | null = isEssay ? null : false;
      let selectedText = "لم تتم الإجابة";
      let correctText = "";

      if (q.type === QuestionType.MCQ || q.type === QuestionType.TRUE_FALSE) {
        // Skipped objective questions count as wrong; they must not disappear
        // from the denominator and inflate the percentage.
        objectiveCount++;
        const selectedOpt = ans?.selectedOptionId
          ? q.options.find((o) => o.id === ans.selectedOptionId)
          : undefined;
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
      } else if (isEssay) {
        isCorrect = null;
        selectedText = ans?.essayText?.trim() || "لم تتم الإجابة";
        correctText =
          q.rubric?.modelAnswer || "الإجابة النموذجية المعتمدة في بنك الأسئلة";
      }

      reviewedQuestions.push({
        id: q.id,
        statement: q.statement,
        type: q.type,
        difficulty: q.difficulty,
        subjectName: q.subject?.name || "المادة",
        unitTitle: q.unit?.title || null,
        isCorrect,
        isEssay,
        selectedAnswer: selectedText,
        correctAnswer: correctText,
        concept: q.explanation?.concept || null,
        correctReason: q.explanation?.correctReason || null,
        modelAnswer: q.rubric?.modelAnswer || null,
      });
    }

    const percentage =
      objectiveCount > 0 ? Math.round((correctCount / objectiveCount) * 100) : 0;

    await prisma.$transaction(async (tx) => {
      // Atomic claim: guarantees a single submission per user per day.
      const claim = await tx.dailyChallenge.updateMany({
        where: { id: challenge.id, completedAt: null },
        data: { completedAt: new Date() },
      });

      if (claim.count === 0) {
        throw new Error("تم إنجاز تحدي اليوم مسبقاً");
      }

      const attempt = await tx.examAttempt.create({
        data: {
          userId,
          title: "اختبار الدخول اليومي للمنصة",
          mode: "PRACTICE",
          totalQuestions: questions.length,
          score: correctCount,
          percentage,
          timeSpentSeconds,
          isCompleted: true,
          completedAt: new Date(),
          answers: {
            create: questions.map((q) => {
              const ans = answersByQuestion.get(q.id);
              const isEssay = q.type === QuestionType.ESSAY;
              const isQCorrect = isEssay
                ? null
                : !!q.options.find(
                    (o) => o.id === ans?.selectedOptionId && o.isCorrect
                  );

              return {
                questionId: q.id,
                selectedOptionId: ans?.selectedOptionId || null,
                essayText: ans?.essayText || null,
                isCorrect: isQCorrect,
                score: isQCorrect === true ? 1 : isEssay ? null : 0,
              };
            }),
          },
        },
      });

      await tx.dailyChallenge.update({
        where: { id: challenge.id },
        data: { attemptId: attempt.id },
      });

      for (const qId of mistakesToRecord) {
        await tx.mistakeReview.upsert({
          where: { userId_questionId: { userId, questionId: qId } },
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
    });

    return {
      dateKey: day,
      completed: true,
      score: correctCount,
      totalObjective: objectiveCount,
      totalQuestions: questions.length,
      percentage,
      wrongCount: mistakesToRecord.length,
      reviewedQuestions,
    };
  }
}
