import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class MistakeService {
  /**
   * Fetch unresolved mistakes for a student with subject/unit filtering
   */
  static async getStudentMistakes(userId: string, subjectId?: string) {
    const where: Prisma.MistakeReviewWhereInput = {
      userId,
      isResolved: false,
    };

    if (subjectId) {
      where.question = { subjectId };
    }

    return prisma.mistakeReview.findMany({
      where,
      orderBy: { lastAttemptAt: "desc" },
      include: {
        question: {
          include: {
            subject: { select: { id: true, name: true, color: true } },
            unit: { select: { id: true, title: true } },
            options: { orderBy: { order: "asc" } },
            explanation: true,
            rubric: { select: { modelAnswer: true } },
          },
        },
      },
    });
  }

  /**
   * Record or increment an incorrect question attempt in MistakeReview
   */
  static async recordMistake(userId: string, questionId: string) {
    return prisma.mistakeReview.upsert({
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

  /**
   * Mark a mistake as mastered / resolved
   */
  static async resolveMistake(userId: string, questionId: string) {
    return prisma.mistakeReview.updateMany({
      where: {
        userId,
        questionId,
      },
      data: {
        isResolved: true,
        lastAttemptAt: new Date(),
      },
    });
  }

  /**
   * Generate an automated custom revision exam from all unresolved mistakes
   */
  static async generateMistakesExam(userId: string, subjectId?: string, questionCount = 10) {
    const mistakes = await this.getStudentMistakes(userId, subjectId);

    if (mistakes.length === 0) {
      throw new Error("رائع! لا توجد أخطاء حالية تحتاج للمراجعة في هذه المادة");
    }

    const selectedMistakes = mistakes.slice(0, questionCount);
    const primarySubjectId = subjectId || selectedMistakes[0].question.subjectId;

    const exam = await prisma.exam.create({
      data: {
        title: `امتحان مراجعة الأخطاء (${selectedMistakes.length} أسئلة غير متقنة)`,
        subjectId: primarySubjectId,
        durationMinutes: Math.max(10, selectedMistakes.length * 2),
        isPractice: true,
        isCustom: true,
        createdById: userId,
        questions: {
          create: selectedMistakes.map((m, idx) => ({
            questionId: m.questionId,
            order: idx + 1,
          })),
        },
      },
    });

    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        examId: exam.id,
        title: exam.title,
        mode: "PRACTICE",
        totalQuestions: selectedMistakes.length,
        score: 0,
        percentage: 0,
        isCompleted: false,
      },
    });

    return {
      examId: exam.id,
      attemptId: attempt.id,
      questionsCount: selectedMistakes.length,
    };
  }
}
