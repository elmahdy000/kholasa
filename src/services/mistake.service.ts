import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { questionScopeWhere, subjectScopeWhere, type CurriculumScope } from "@/lib/curriculum";

import {
  buildMistakeDiagnosisBreakdown,
  type MistakeWeaknessBucket,
  type StudentMistakeDiagnosisSummary,
  type RawMistakeDiagnosisRow,
} from "@/lib/mistake-diagnosis";

export {
  buildMistakeDiagnosisBreakdown,
  type MistakeWeaknessBucket,
  type StudentMistakeDiagnosisSummary,
  type RawMistakeDiagnosisRow,
};

export class MistakeService {
  /**
   * Fetch unresolved mistakes for a student with published & scope enforcement
   */
  static async getStudentMistakes(
    userId: string,
    subjectId?: string,
    scope: CurriculumScope | null = null
  ) {
    const where: Prisma.MistakeReviewWhereInput = {
      userId,
      isResolved: false,
      question: {
        status: "PUBLISHED",
        subject: {
          isPublished: true,
          ...(scope ? subjectScopeWhere(scope) : {}),
        },
        ...(subjectId ? { subjectId } : {}),
      },
    };

    return prisma.mistakeReview.findMany({
      where,
      orderBy: { lastAttemptAt: "desc" },
      include: {
        question: {
          include: {
            subject: { select: { id: true, name: true, color: true, schoolCategory: true } },
            unit: { select: { id: true, title: true } },
            options: { orderBy: { order: "asc" } },
            explanation: true,
            rubric: {
              select: {
                modelAnswer: true,
                modelAnswerTranslation: true,
                criteria: true,
                maxScore: true,
              },
            },
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
   * Explicitly mark a question (such as an Essay question after inspecting the model answer,
   * or a resolved question reopened by the student) for active review in "غلطاتي".
   * Preserves existing wrongCount when un-resolving or toggling.
   */
  static async markForReview(userId: string, questionId: string) {
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
  static async generateMistakesExam(
    userId: string,
    subjectId?: string,
    questionCount = 10,
    scope: CurriculumScope | null = null
  ) {
    const cappedCount = Math.min(50, Math.max(1, questionCount));
    const mistakes = await this.getStudentMistakes(userId, subjectId, scope);

    if (mistakes.length === 0) {
      throw new Error("رائع! لا توجد أخطاء حالية تحتاج للمراجعة في هذه المادة");
    }

    // Coherently scope exam to a single subject & schoolCategory
    const primarySubjectId = subjectId || mistakes[0].question.subjectId;
    const subjectMistakes = mistakes.filter((m) => m.question.subjectId === primarySubjectId);
    const selectedMistakes = subjectMistakes.slice(0, cappedCount);
    const schoolCategory = selectedMistakes[0]?.question?.subject?.schoolCategory || "ARABIC";

    const exam = await prisma.exam.create({
      data: {
        title: `امتحان مراجعة الأخطاء (${selectedMistakes.length} أسئلة غير متقنة)`,
        subjectId: primarySubjectId,
        schoolCategory,
        durationMinutes: Math.max(10, Math.min(60, selectedMistakes.length * 2)),
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

  /**
   * Return live unresolved/resolved counts and a sorted lesson/unit weakness diagnosis
   */
  static async getStudentMistakeDiagnosisSummary(
    userId: string,
    scope: CurriculumScope | null = null
  ): Promise<StudentMistakeDiagnosisSummary> {
    const questionFilter: Prisma.QuestionWhereInput = {
      status: "PUBLISHED",
      subject: {
        isPublished: true,
        isUnderConstruction: false,
      },
      ...(scope ? { AND: [questionScopeWhere(scope)] } : {}),
    };

    const [unresolvedRows, resolvedCount] = await Promise.all([
      prisma.mistakeReview.findMany({
        where: {
          userId,
          isResolved: false,
          question: questionFilter,
        },
        select: {
          wrongCount: true,
          question: {
            select: {
              subject: { select: { id: true, name: true, color: true } },
              unit: { select: { title: true } },
              lessons: {
                take: 1,
                select: {
                  lesson: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
      }),
      prisma.mistakeReview.count({
        where: {
          userId,
          isResolved: true,
          question: questionFilter,
        },
      }),
    ]);

    const breakdown = buildMistakeDiagnosisBreakdown(unresolvedRows);
    return {
      unresolvedCount: unresolvedRows.length,
      resolvedCount,
      topWeakness: breakdown[0] ?? null,
      breakdown: breakdown.slice(0, 8),
    };
  }
}
