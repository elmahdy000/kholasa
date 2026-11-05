import { prisma } from "@/lib/prisma";
import { QuestionType, Difficulty, Prisma } from "@prisma/client";
import { getCurriculumScope, isSubjectInScope } from "@/lib/curriculum";
import { CustomExamCreateInput } from "./types";

export class ExamGeneratorService {
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

    if (!targetSubjectId && Array.isArray(questionIds) && questionIds.length > 0) {
      const firstQ = await prisma.question.findUnique({
        where: { id: questionIds[0] },
        select: { subjectId: true },
      });
      if (firstQ) targetSubjectId = firstQ.subjectId;
    }

    if (!targetSubjectId) {
      throw new Error("يجب تحديد المادة الدراسية لإنشاء الامتحان");
    }

    // Validate the subject belongs to the student's curriculum and exact school category
    const [subject, student] = await Promise.all([
      prisma.subject.findUnique({
        where: { id: targetSubjectId },
        select: {
          id: true,
          name: true,
          isPublished: true,
          gradeId: true,
          systemId: true,
          trackId: true,
          schoolCategory: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, gradeId: true, systemId: true, trackId: true, schoolCategory: true },
      }),
    ]);

    if (!subject || !subject.isPublished) {
      throw new Error("المادة غير متاحة لإنشاء امتحان");
    }

    if (!isSubjectInScope(getCurriculumScope(student), subject)) {
      throw new Error("هذه المادة ليست ضمن صفك الدراسي ومسار مدرستك المصرح به");
    }

    if (Array.isArray(questionIds) && questionIds.length > 0) {
      const explicitQuestions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          status: "PUBLISHED",
          subjectId: targetSubjectId,
          schoolCategory: subject.schoolCategory,
        },
        select: { id: true, subjectId: true, statement: true },
      });

      if (explicitQuestions.length === 0) {
        throw new Error("الأسئلة المحددة غير موجودة في بنك الأسئلة أو لا تنتمي لهذه الفئة المدرسية");
      }

      // Deduplicate questions by statement and ID to guarantee zero duplicates within the exam
      const seenExplicit = new Set<string>();
      const uniqueExplicit: { id: string }[] = [];
      for (const q of explicitQuestions) {
        const norm = q.statement.trim().toLowerCase();
        if (!seenExplicit.has(norm) && !seenExplicit.has(q.id)) {
          seenExplicit.add(norm);
          seenExplicit.add(q.id);
          uniqueExplicit.push({ id: q.id });
        }
      }
      selected = uniqueExplicit;
    } else {
      // 1. Build question query filter strictly scoped to subject and its school category
      const questionWhere: Prisma.QuestionWhereInput = {
        subjectId: targetSubjectId,
        status: "PUBLISHED",
        schoolCategory: subject.schoolCategory,
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
        select: { id: true, type: true, statement: true, difficulty: true },
      });

      // Fallback rule: if student requested MEDIUM difficulty but no medium questions exist (or fewer than questionCount):
      // "ولو مفيش اسئلة متوسطة نعرض من السهل والصعب بدون تكرار"
      if (difficulty === "MEDIUM" && availableQuestions.length < questionCount) {
        const fallbackWhere: Prisma.QuestionWhereInput = {
          ...questionWhere,
          difficulty: { in: [Difficulty.EASY, Difficulty.HARD] },
        };
        const supplementary = await prisma.question.findMany({
          where: fallbackWhere,
          select: { id: true, type: true, statement: true, difficulty: true },
        });

        // Interleave easy & hard questions so the student gets a balanced progression
        const easySupplement = supplementary.filter((q) => q.difficulty === Difficulty.EASY);
        const hardSupplement = supplementary.filter((q) => q.difficulty === Difficulty.HARD);
        const maxLen = Math.max(easySupplement.length, hardSupplement.length);
        const balancedSupplement: typeof supplementary = [];
        for (let i = 0; i < maxLen; i++) {
          if (i < easySupplement.length) balancedSupplement.push(easySupplement[i]);
          if (i < hardSupplement.length) balancedSupplement.push(hardSupplement[i]);
        }

        const seenIds = new Set(availableQuestions.map((q) => q.id));
        const seenStatements = new Set(
          availableQuestions.map((q) => q.statement.trim().toLowerCase())
        );

        for (const sq of balancedSupplement) {
          const norm = sq.statement.trim().toLowerCase();
          if (!seenIds.has(sq.id) && !seenStatements.has(norm)) {
            seenIds.add(sq.id);
            seenStatements.add(norm);
            availableQuestions.push(sq);
          }
        }
      }

      if (availableQuestions.length === 0) {
        throw new Error("لا توجد أسئلة كافية مطابقة لمعايير الامتحان المحددة في هذا المسار المدرسي");
      }

      // 3. Spaced Learning: Prevent repeating questions the student has already answered correctly
      // "الاسئلة اللى امتحانها وجاوبها صح مش تتكرر تانى فى الامتحان اللى بعده لحد مايخلص كل الاسءلة"
      const [correctStudentAnswers, correctQuestionAttempts, activeMistakes] = await Promise.all([
        prisma.studentAnswer.findMany({
          where: { attempt: { userId }, isCorrect: true },
          select: { questionId: true },
        }),
        prisma.questionAttempt.findMany({
          where: { userId, isCorrect: true },
          select: { questionId: true },
        }),
        prisma.mistakeReview.findMany({
          where: { userId, isResolved: false },
          select: { questionId: true },
        }),
      ]);

      const masteredQuestionIds = new Set([
        ...correctStudentAnswers.map((a) => a.questionId),
        ...correctQuestionAttempts.map((q) => q.questionId),
      ]);
      const mistakeQuestionIds = new Set(activeMistakes.map((m) => m.questionId));

      // Partition available questions:
      // - unmastered: questions the student has NOT answered correctly yet (never answered, or answered incorrectly)
      // - mastered: questions the student has already mastered/answered correctly
      const unmastered = availableQuestions.filter((q) => !masteredQuestionIds.has(q.id));
      const mastered = availableQuestions.filter((q) => masteredQuestionIds.has(q.id));

      // Prioritize mistakes within unmastered questions, then fresh questions
      const mistakeUnmastered = unmastered.filter((q) => mistakeQuestionIds.has(q.id));
      const freshUnmastered = unmastered.filter((q) => !mistakeQuestionIds.has(q.id));

      const shuffledMistakes = [...mistakeUnmastered].sort(() => 0.5 - Math.random());
      const shuffledFresh = [...freshUnmastered].sort(() => 0.5 - Math.random());
      const prioritizedUnmastered = [...shuffledMistakes, ...shuffledFresh];

      let candidatePool: typeof availableQuestions = [];

      if (prioritizedUnmastered.length >= questionCount) {
        // ZERO REPETITION of mastered questions! Exclude all correctly answered questions completely!
        candidatePool = prioritizedUnmastered;
      } else if (prioritizedUnmastered.length > 0) {
        // Take ALL remaining unmastered questions first, then fill remaining shortage with mastered questions
        const shuffledMastered = [...mastered].sort(() => 0.5 - Math.random());
        candidatePool = [...prioritizedUnmastered, ...shuffledMastered];
      } else {
        // Student has finished and mastered 100% of all questions in this bank! ("لحد ما يخلص كل الأسئلة")
        // Reset cycle and present all questions shuffled
        candidatePool = [...availableQuestions].sort(() => 0.5 - Math.random());
      }

      // Ensure no duplicate statements or questions exist within the exam itself
      const seenStatements = new Set<string>();
      const deduplicated: { id: string }[] = [];
      for (const q of candidatePool) {
        const norm = q.statement.trim().toLowerCase();
        if (!seenStatements.has(norm)) {
          seenStatements.add(norm);
          deduplicated.push({ id: q.id });
          if (deduplicated.length >= questionCount) break;
        }
      }

      selected = deduplicated;
    }

    const isPractice = mode === "PRACTICE";

    // Generate clear, distinguished exam title indicating subject, unit, or lesson
    let generatedTitle = "";
    if (customTitle?.trim()) {
      generatedTitle = customTitle.trim();
    } else if (lessonIds && lessonIds.length === 1) {
      const targetLesson = await prisma.lesson.findUnique({
        where: { id: lessonIds[0] },
        select: { title: true },
      });
      generatedTitle = `امتحان درس: ${targetLesson?.title || "الدرس"} (${selected.length} سؤال)`;
    } else if (lessonIds && lessonIds.length > 1) {
      generatedTitle = `امتحان دروس محددة: ${subject?.name || ""} (${selected.length} سؤال)`;
    } else if (unitId && unitId !== "all") {
      const targetUnit = await prisma.unit.findUnique({
        where: { id: unitId },
        select: { title: true },
      });
      generatedTitle = `امتحان وحدة: ${targetUnit?.title || "الوحدة"} (${selected.length} سؤال)`;
    } else {
      generatedTitle = `امتحان شامل: ${subject?.name || "عام"} (${selected.length} سؤال)`;
    }

    const examTitle = generatedTitle;

    const exam = await prisma.exam.create({
      data: {
        title: examTitle,
        subjectId: targetSubjectId,
        schoolCategory: subject.schoolCategory,
        durationMinutes: Number(durationMinutes),
        isPractice,
        isCustom: true,
        createdById: userId,
        questions: {
          create: selected.map((q, idx) => ({
            questionId: q.id,
            order: idx + 1,
          })),
        },
      },
    });

    // Create initial ExamAttempt for the student
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
   * Calculate available question count for custom exam builder, including smart unmastered/mastered breakdown
   */
  static async getExamBuilderStats(params: {
    subjectId?: string;
    unitId?: string;
    lessonIds?: string[];
    type?: string;
    difficulty?: string;
    userId?: string;
  }) {
    const { subjectId, unitId, lessonIds, type, difficulty, userId } = params;
    if (!subjectId) return { count: 0, unmasteredCount: 0, masteredCount: 0 };

    const where: Prisma.QuestionWhereInput = {
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
      where.type = type as QuestionType;
    }

    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty as Difficulty;
    }

    let count = await prisma.question.count({ where });
    let isMediumFallback = false;

    // Fallback: if student selected MEDIUM but count is 0, count available EASY + HARD questions without blocking
    if (difficulty === "MEDIUM" && count === 0) {
      const fallbackWhere: Prisma.QuestionWhereInput = {
        ...where,
        difficulty: { in: [Difficulty.EASY, Difficulty.HARD] },
      };
      count = await prisma.question.count({ where: fallbackWhere });
      isMediumFallback = true;
    }

    let masteredCount = 0;
    let unmasteredCount = count;

    if (userId && count > 0) {
      const matchingQuestions = await prisma.question.findMany({
        where: isMediumFallback
          ? { ...where, difficulty: { in: [Difficulty.EASY, Difficulty.HARD] } }
          : where,
        select: { id: true },
      });
      const qIds = matchingQuestions.map((q) => q.id);

      if (qIds.length > 0) {
        const [examCorrect, practiceCorrect] = await Promise.all([
          prisma.studentAnswer.findMany({
            where: {
              attempt: { userId },
              isCorrect: true,
              questionId: { in: qIds },
            },
            select: { questionId: true },
          }),
          prisma.questionAttempt.findMany({
            where: {
              userId,
              isCorrect: true,
              questionId: { in: qIds },
            },
            select: { questionId: true },
          }),
        ]);

        const masteredSet = new Set([
          ...examCorrect.map((a) => a.questionId),
          ...practiceCorrect.map((q) => q.questionId),
        ]);

        masteredCount = masteredSet.size;
        unmasteredCount = Math.max(0, count - masteredCount);
      }
    }

    return { count, unmasteredCount, masteredCount };
  }
}
