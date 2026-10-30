import { prisma } from "@/lib/prisma";
import { QuestionType, Prisma } from "@prisma/client";
import { RecordAnswerInput } from "./types";
import { badRequest, notFound } from "@/lib/http";

export class ExamAttemptService {
  /**
   * Record or update an answer during the exam
   */
  static async recordAnswer(input: RecordAnswerInput) {
    const { attemptId, questionId, selectedOptionId, essayText, timeSpentSeconds = 0 } = input;

    let isCorrect: boolean | null = null;
    let score: number | null = null;

    if (selectedOptionId) {
      const option = await prisma.questionOption.findUnique({
        where: { id: selectedOptionId },
        select: { isCorrect: true },
      });
      if (option) {
        isCorrect = option.isCorrect;
        score = option.isCorrect ? 1 : 0;
      }
    }

    const existing = await prisma.studentAnswer.findFirst({
      where: { attemptId, questionId },
    });

    if (existing) {
      return prisma.studentAnswer.update({
        where: { id: existing.id },
        data: {
          selectedOptionId: selectedOptionId !== undefined ? selectedOptionId : existing.selectedOptionId,
          essayText: essayText !== undefined ? essayText : existing.essayText,
          isCorrect: isCorrect !== null ? isCorrect : existing.isCorrect,
          score: score !== null ? score : existing.score,
          timeSpentSeconds: { increment: timeSpentSeconds },
        },
      });
    }

    return prisma.studentAnswer.create({
      data: {
        attemptId,
        questionId,
        selectedOptionId: selectedOptionId || null,
        essayText: essayText || null,
        isCorrect,
        score,
        timeSpentSeconds,
      },
    });
  }

  /**
   * Submit exam attempt:
   * - Evaluates objective questions (MCQs & True/False)
   * - In accordance with DEC-011: Essay questions are NOT evaluated or scored with 0;
   *   their written text is preserved and the model answer from the test bank is exposed
   *   for immediate student self-comparison.
   * - Automatically populates mistakes into MistakeReview for spaced repetition.
   */
  static async submitExamAttempt(
    attemptId: string,
    userId: string,
    submission?: {
      answers?: Record<
        string,
        { selectedOptionId?: string | null; essayText?: string | null; timeSpentSeconds?: number }
      >;
      totalTimeSpentSeconds?: number;
    }
  ) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
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
        exam: {
          include: {
            questions: {
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
        },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new Error("محاولة الامتحان غير صالحة أو غير مصرح بها");
    }

    // منع إعادة تسليم محاولة مكتملة
    if (attempt.isCompleted) {
      throw new Error("تم تسليم هذه المحاولة مسبقاً، لا يمكن إعادة تسليمها أو تعديل إجاباتها");
    }

    const examQuestions = attempt.exam?.questions?.length
      ? attempt.exam.questions.map((eq) => eq.question)
      : attempt.answers.map((a) => a.question);

    let objectiveQuestionsCount = 0;
    let correctCount = 0;
    const mistakesToRecord: string[] = [];
    const studentAnswersToCreate: {
      attemptId: string;
      questionId: string;
      selectedOptionId: string | null;
      essayText: string | null;
      isCorrect: boolean | null;
      score: number | null;
      timeSpentSeconds: number;
    }[] = [];

    const answersInput = submission?.answers;

    if (answersInput && Object.keys(answersInput).length > 0) {
      for (const q of examQuestions) {
        const ans = answersInput[q.id];
        const selectedOptionId = ans?.selectedOptionId || null;
        const essayText = ans?.essayText || null;
        const timeSpentSeconds = ans?.timeSpentSeconds || 0;

        let isCorrect: boolean | null = null;
        let score: number | null = null;

        if (q.type === QuestionType.MCQ || q.type === QuestionType.TRUE_FALSE) {
          objectiveQuestionsCount++;
          const selectedOpt = q.options.find((o) => o.id === selectedOptionId);
          if (selectedOpt && selectedOpt.isCorrect) {
            isCorrect = true;
            score = 1;
            correctCount++;
          } else {
            isCorrect = false;
            score = 0;
            mistakesToRecord.push(q.id);
          }
        } else if (q.type === QuestionType.ESSAY) {
          isCorrect = null;
          score = null;
        }

        studentAnswersToCreate.push({
          attemptId,
          questionId: q.id,
          selectedOptionId,
          essayText,
          isCorrect,
          score,
          timeSpentSeconds,
        });
      }

      const percentage =
        objectiveQuestionsCount > 0
          ? Math.round((correctCount / objectiveQuestionsCount) * 1000) / 10
          : 0;

      const updatedAttempt = await prisma.$transaction(async (tx) => {
        const claim = await tx.examAttempt.updateMany({
          where: { id: attemptId, userId, isCompleted: false },
          data: {
            score: correctCount,
            percentage,
            timeSpentSeconds: submission.totalTimeSpentSeconds || attempt.timeSpentSeconds,
            isCompleted: true,
            completedAt: new Date(),
          },
        });

        if (claim.count === 0) {
          throw new Error("تم تسليم هذه المحاولة مسبقاً، لا يمكن إعادة تسليمها أو تعديل إجاباتها");
        }

        const updated = await tx.examAttempt.findUniqueOrThrow({
          where: { id: attemptId },
        });

        await tx.studentAnswer.deleteMany({ where: { attemptId } });

        for (const sa of studentAnswersToCreate) {
          await tx.studentAnswer.create({ data: sa });
        }

        for (const questionId of mistakesToRecord) {
          await tx.mistakeReview.upsert({
            where: {
              userId_questionId: { userId, questionId },
            },
            create: {
              userId,
              questionId,
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

        return updated;
      });

      return {
        attempt: updatedAttempt,
        score: correctCount,
        totalQuestions: examQuestions.length,
        totalObjective: objectiveQuestionsCount,
        percentage,
        mistakesCount: mistakesToRecord.length,
      };
    } else {
      const studentAnswersMap = new Map(
        attempt.answers.map((a) => [a.questionId, a])
      );

      for (const q of examQuestions) {
        if (q.type === QuestionType.MCQ || q.type === QuestionType.TRUE_FALSE) {
          objectiveQuestionsCount++;
          const ans = studentAnswersMap.get(q.id);
          const correctOption = q.options.find((o) => o.isCorrect);

          if (ans && ans.selectedOptionId && correctOption && ans.selectedOptionId === correctOption.id) {
            correctCount++;
          } else {
            mistakesToRecord.push(q.id);
          }
        }
      }

      const percentage =
        objectiveQuestionsCount > 0
          ? Math.round((correctCount / objectiveQuestionsCount) * 1000) / 10
          : 0;

      const completed = await prisma.examAttempt.updateMany({
        where: { id: attemptId, userId, isCompleted: false },
        data: {
          score: correctCount,
          percentage,
          timeSpentSeconds: submission?.totalTimeSpentSeconds || attempt.timeSpentSeconds,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      if (completed.count === 0) {
        throw new Error("تم تسليم هذه المحاولة مسبقاً، لا يمكن إعادة تسليمها أو تعديل إجاباتها");
      }

      const updatedAttempt = await prisma.examAttempt.findUniqueOrThrow({
        where: { id: attemptId },
      });

      for (const questionId of mistakesToRecord) {
        await prisma.mistakeReview.upsert({
          where: {
            userId_questionId: { userId, questionId },
          },
          create: {
            userId,
            questionId,
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

      return {
        attempt: updatedAttempt,
        score: correctCount,
        totalQuestions: examQuestions.length,
        totalObjective: objectiveQuestionsCount,
        percentage,
        mistakesCount: mistakesToRecord.length,
      };
    }
  }

  /**
   * Get attempt results with full answers, explanations, and ideal model answers for essay comparison
   */
  static async getAttemptResults(attemptId: string, userId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            subject: { select: { id: true, name: true, color: true } },
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: { orderBy: { order: "asc" } },
                explanation: true,
                rubric: {
                  select: {
                    modelAnswer: true,
                    criteria: true,
                    maxScore: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new Error("المحاولة غير موجودة أو غير مصرح بعرضها");
    }

    const questionsBreakdown = attempt.answers.map((ans) => {
      const q = ans.question;
      const isEssay = q.type === QuestionType.ESSAY;

      return {
        questionId: q.id,
        statement: q.statement,
        type: q.type,
        difficulty: q.difficulty,
        studentSelectedOptionId: ans.selectedOptionId,
        studentEssayText: ans.essayText,
        isCorrect: ans.isCorrect,
        options: q.options,
        correctOption: q.options.find((o) => o.isCorrect) || null,
        explanation: q.explanation,
        isEssay,
        idealModelAnswer: q.rubric?.modelAnswer || null,
        rubricCriteria: q.rubric?.criteria || [],
      };
    });

    return {
      attempt,
      questionsBreakdown,
    };
  }

  /**
   * Get student attempts list or single attempt with answers for grading
   */
  static async getAdminAttemptsList(params: {
    examId?: string;
    userId?: string;
    search?: string;
    id?: string;
  }) {
    const { examId, userId, search, id } = params;

    if (id) {
      return prisma.examAttempt.findUnique({
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
    }

    const where: Prisma.ExamAttemptWhereInput = {};
    if (examId) where.examId = examId;
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search } } },
      ];
    }

    return prisma.examAttempt.findMany({
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
  }

  /**
   * Grade an individual student answer and optionally recalculate attempt total
   */
  static async gradeStudentAnswer(
    answerId: string,
    isCorrect?: boolean,
    score?: number,
    attemptId?: string
  ) {
    const answer = await prisma.studentAnswer.findUnique({
      where: { id: answerId },
      select: { attemptId: true, attempt: { select: { isCompleted: true } },
        question: { select: { type: true, rubric: { select: { maxScore: true } } } } },
    });
    if (!answer) throw notFound("الإجابة غير موجودة");
    if (attemptId && attemptId !== answer.attemptId) throw badRequest("الإجابة لا تنتمي إلى المحاولة المحددة");
    if (!answer.attempt.isCompleted) throw badRequest("لا يمكن تصحيح محاولة قبل تسليمها");
    if (answer.question.type !== QuestionType.ESSAY) throw badRequest("التصحيح اليدوي متاح للأسئلة المقالية فقط");
    if (score !== undefined && (!Number.isFinite(score) || score < 0 || score > (answer.question.rubric?.maxScore ?? 10))) {
      throw badRequest("الدرجة خارج النطاق المسموح لهذا السؤال");
    }
    attemptId = answer.attemptId;
    await prisma.studentAnswer.update({
      where: { id: answerId },
      data: {
        isCorrect: isCorrect !== undefined ? Boolean(isCorrect) : undefined,
        score: score !== undefined ? Number(score) : undefined,
      },
    });

    if (attemptId) {
      const allAnswers = await prisma.studentAnswer.findMany({
        where: { attemptId },
        select: { isCorrect: true, score: true },
      });

      const scorableAnswers = allAnswers.filter((a) => a.isCorrect !== null);
      const totalCorrect = scorableAnswers.filter((a) => a.isCorrect === true).length;
      const totalDenominator = scorableAnswers.length || 1;
      const percentage = Math.round((totalCorrect / totalDenominator) * 100);

      return prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          score: totalCorrect,
          percentage,
        },
      });
    }

    return null;
  }
}
