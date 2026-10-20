import { prisma } from "@/lib/prisma";
import { QuestionType, Difficulty } from "@prisma/client";

export interface CustomExamCreateInput {
  subjectId?: string;
  unitId?: string | null;
  lessonIds?: string[];
  type?: QuestionType | "ALL";
  difficulty?: Difficulty | "ALL";
  questionCount?: number;
  durationMinutes?: number;
  mode?: "PRACTICE" | "EXAM";
  title?: string;
  questionIds?: string[];
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
   * Create a custom dynamically generated exam based on user filters or explicit question list
   */
  static async createCustomExam(input: CustomExamCreateInput, userId: string) {
    const {
      subjectId: inputSubjectId,
      unitId,
      lessonIds,
      type,
      difficulty,
      questionCount = 10,
      durationMinutes = 20,
      mode = "EXAM",
      title: customTitle,
      questionIds,
    } = input;

    let selected: { id: string }[] = [];
    let targetSubjectId = inputSubjectId;

    if (Array.isArray(questionIds) && questionIds.length > 0) {
      const explicitQuestions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, subjectId: true },
      });

      if (explicitQuestions.length === 0) {
        throw new Error("الأسئلة المحددة غير موجودة في بنك الأسئلة");
      }

      selected = explicitQuestions.map((q) => ({ id: q.id }));
      if (!targetSubjectId) {
        targetSubjectId = explicitQuestions[0].subjectId;
      }
    } else {
      if (!targetSubjectId) {
        throw new Error("يجب تحديد المادة الدراسية لإنشاء الامتحان");
      }

      // 1. Build question query filter
      const questionWhere: any = {
        subjectId: targetSubjectId,
        status: "PUBLISHED",
      };

      if (unitId && unitId !== "all") questionWhere.unitId = unitId;
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
      selected = shuffled.slice(0, Math.min(questionCount, availableQuestions.length));
    }

    if (!targetSubjectId) {
      throw new Error("تعذر تحديد المادة الدراسية للامتحان");
    }

    // 4. Create Exam record
    const subject = await prisma.subject.findUnique({
      where: { id: targetSubjectId },
      select: { name: true },
    });

    const isPractice = mode === "PRACTICE";
    const examTitle =
      customTitle?.trim() ||
      `امتحان ${isPractice ? "تدريبي" : "مخصص"}: ${subject?.name || "عام"} (${selected.length} سؤال)`;

    const exam = await prisma.exam.create({
      data: {
        title: examTitle,
        subjectId: targetSubjectId,
        durationMinutes: Number(durationMinutes),
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

    // Collect all exam questions (from exam.questions, or fallback to attempt.answers questions)
    const examQuestions = attempt.exam?.questions?.length
      ? attempt.exam.questions.map((eq) => eq.question)
      : attempt.answers.map((a) => a.question);

    let objectiveQuestionsCount = 0;
    let correctCount = 0;
    const mistakesToRecord: string[] = [];
    const studentAnswersToCreate: any[] = [];

    const answersInput = submission?.answers;

    if (answersInput && Object.keys(answersInput).length > 0) {
      // Bulk submission payload from frontend
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
          // DEC-011: Essay questions are NOT evaluated automatically or scored with 0.
          // Student compares their written essay with the rubric model answer.
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
          : 100;

      const updatedAttempt = await prisma.$transaction(async (tx) => {
        const updated = await tx.examAttempt.update({
          where: { id: attemptId },
          data: {
            score: correctCount,
            percentage,
            timeSpentSeconds: submission.totalTimeSpentSeconds || attempt.timeSpentSeconds,
            isCompleted: true,
            completedAt: new Date(),
          },
        });

        // Remove previous answers if any to prevent duplicates
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
      // Incremental answers previously recorded via recordAnswer
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
          : 100;

      const updatedAttempt = await prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          score: correctCount,
          percentage,
          timeSpentSeconds: submission?.totalTimeSpentSeconds || attempt.timeSpentSeconds,
          isCompleted: true,
          completedAt: new Date(),
        },
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

