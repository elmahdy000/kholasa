import { prisma } from "@/lib/prisma";
import { QuestionType, Difficulty } from "@prisma/client";

export interface CustomExamCreateInput {
  subjectId: string;
  unitId?: string | null;
  lessonIds?: string[];
  type?: QuestionType | "ALL";
  difficulty?: Difficulty | "ALL";
  questionCount?: number;
  durationMinutes?: number;
  mode?: "PRACTICE" | "EXAM";
}

export interface RecordAnswerInput {
  attemptId: string;
  questionId: string;
  selectedOptionId?: string | null;
  essayText?: string | null;
  timeSpentSeconds?: number;
}

export class ExamService {
  /**
   * Fetch official and past exams
   */
  static async getExams(subjectId?: string) {
    const where: any = {};
    if (subjectId) where.subjectId = subjectId;

    return prisma.exam.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        _count: { select: { questions: true, attempts: true } },
      },
    });
  }

  /**
   * Get single exam by ID with questions (excluding correct answer flags if not in result phase)
   */
  static async getExamById(id: string) {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              include: {
                options: {
                  select: { id: true, text: true, order: true },
                },
                explanation: true,
                rubric: {
                  select: { modelAnswer: true, criteria: true, maxScore: true },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create a custom dynamically generated exam based on user filters
   */
  static async createCustomExam(input: CustomExamCreateInput, userId: string) {
    const {
      subjectId,
      unitId,
      lessonIds,
      type,
      difficulty,
      questionCount = 10,
      durationMinutes = 20,
      mode = "EXAM",
    } = input;

    // 1. Build question query filter
    const questionWhere: any = {
      subjectId,
      status: "PUBLISHED",
    };

    if (unitId) questionWhere.unitId = unitId;
    if (type && type !== "ALL") questionWhere.type = type;
    if (difficulty && difficulty !== "ALL") questionWhere.difficulty = difficulty;

    if (lessonIds && lessonIds.length > 0) {
      questionWhere.lessons = {
        some: { lessonId: { in: lessonIds } },
      };
    }

    // 2. Fetch candidate questions
    const availableQuestions = await prisma.question.findMany({
      where: questionWhere,
      select: { id: true, type: true },
    });

    if (availableQuestions.length === 0) {
      throw new Error("لا توجد أسئلة كافية مطابقة لمعايير الامتحان المحددة");
    }

    // 3. Shuffle and pick requested count
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, availableQuestions.length));

    // 4. Create Exam record
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { name: true },
    });

    const isPractice = mode === "PRACTICE";
    const exam = await prisma.exam.create({
      data: {
        title: `امتحان تدريبي: ${subject?.name || "مخصص"} (${selected.length} سؤال)`,
        subjectId,
        durationMinutes,
        isPractice,
        questions: {
          create: selected.map((q, idx) => ({
            questionId: q.id,
            order: idx + 1,
          })),
        },
      },
    });

    // 5. Create initial ExamAttempt for the student
    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        examId: exam.id,
        title: exam.title,
        mode: isPractice ? "PRACTICE" : "EXAM",
        totalQuestions: selected.length,
        score: 0,
        percentage: 0,
        isCompleted: false,
      },
    });

    return {
      examId: exam.id,
      attemptId: attempt.id,
      questionCount: selected.length,
      durationMinutes,
      mode,
    };
  }

  /**
   * Record or update an answer during the exam
   */
  static async recordAnswer(input: RecordAnswerInput) {
    const { attemptId, questionId, selectedOptionId, essayText, timeSpentSeconds = 0 } = input;

    // Check if question is MCQ/True-False to check correctness immediately (for practice mode)
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

    // Upsert student answer
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
  static async submitExamAttempt(attemptId: string, userId: string) {
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

    // Collect all exam questions (from exam.questions, or fallback to attempt.answers questions)
    const examQuestions = attempt.exam?.questions?.length
      ? attempt.exam.questions.map((eq) => eq.question)
      : attempt.answers.map((a) => a.question);

    const studentAnswersMap = new Map(
      attempt.answers.map((a) => [a.questionId, a])
    );

    // 1. Calculate score on objective questions across all exam questions
    let objectiveQuestionsCount = 0;
    let correctCount = 0;
    const mistakesToRecord: string[] = [];

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
      // For ESSAY: DEC-011 applies — No automatic negative mark or failed status.
      // The student will review and compare their answer directly with the rubric model answer.
    }

    // Calculate percentage based on objective questions (or 100% default if only essay)
    const percentage =
      objectiveQuestionsCount > 0
        ? Math.round((correctCount / objectiveQuestionsCount) * 100)
        : 100;

    // 2. Update ExamAttempt as completed
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        score: correctCount,
        percentage,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // 3. Record mistakes in MistakeReview table
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
      totalObjective: objectiveQuestionsCount,
      percentage,
      mistakesCount: mistakesToRecord.length,
    };
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

    // Format comparison items for essay and objective questions
    const questionsBreakdown = attempt.answers.map((ans) => {
      const q = ans.question;
      const isEssay = q.type === QuestionType.ESSAY;

      return {
        questionId: q.id,
        statement: q.statement,
        type: q.type,
        difficulty: q.difficulty,
        // Student's answer
        studentSelectedOptionId: ans.selectedOptionId,
        studentEssayText: ans.essayText,
        isCorrect: ans.isCorrect,
        // Correct/Model info
        options: q.options,
        correctOption: q.options.find((o) => o.isCorrect) || null,
        explanation: q.explanation,
        // Model answer for essay self-comparison (DEC-011)
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
   * Create official pre-built exam (Admin)
   */
  static async createOfficialExam(input: {
    title: string;
    description?: string | null;
    subjectId: string;
    durationMinutes?: number;
    isPractice?: boolean;
    questionIds?: string[];
    randomQuestionsCount?: number;
  }) {
    const {
      title,
      description,
      subjectId,
      durationMinutes = 30,
      isPractice = false,
      questionIds = [],
      randomQuestionsCount = 0,
    } = input;

    let selectedQuestionIds: string[] = Array.isArray(questionIds) ? questionIds : [];

    if (selectedQuestionIds.length === 0 && Number(randomQuestionsCount) > 0) {
      const availableQuestions = await prisma.question.findMany({
        where: { subjectId, status: "PUBLISHED" },
        select: { id: true },
        take: Number(randomQuestionsCount),
      });
      selectedQuestionIds = availableQuestions.map((q) => q.id);
    }

    return prisma.exam.create({
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
  }

  /**
   * Update an existing exam (Admin)
   */
  static async updateExam(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      durationMinutes?: number;
      isPractice?: boolean;
    }
  ) {
    return prisma.exam.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.durationMinutes !== undefined ? { durationMinutes: Number(data.durationMinutes) } : {}),
        ...(data.isPractice !== undefined ? { isPractice: Boolean(data.isPractice) } : {}),
      },
    });
  }

  /**
   * Delete an exam
   */
  static async deleteExam(id: string) {
    return prisma.exam.delete({
      where: { id },
    });
  }

  /**
   * List exams with analytics summary for Admin dashboard
   */
  static async getAdminExamsList(subjectId?: string) {
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

    return exams.map((exam) => {
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

      // Filter out answers with isCorrect === null (e.g. ungraded essay questions under DEC-011)
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

  /**
   * Calculate available question count for custom exam builder
   */
  static async getExamBuilderStats(params: {
    subjectId?: string;
    unitId?: string;
    lessonIds?: string[];
    type?: string;
    difficulty?: string;
  }) {
    const { subjectId, unitId, lessonIds, type, difficulty } = params;
    if (!subjectId) return 0;

    const where: any = {
      status: "PUBLISHED",
      subjectId,
    };

    if (unitId && unitId !== "all") {
      where.unitId = unitId;
    }

    if (lessonIds && lessonIds.length > 0) {
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

    return prisma.question.count({ where });
  }
}

