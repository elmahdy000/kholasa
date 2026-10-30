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
        select: { id: true, type: true, statement: true },
      });

      if (availableQuestions.length === 0) {
        throw new Error("لا توجد أسئلة كافية مطابقة لمعايير الامتحان المحددة في هذا المسار المدرسي");
      }

      // 3. Prevent repeating questions the student has already taken in previous exams
      const previousAnswers = await prisma.studentAnswer.findMany({
        where: { attempt: { userId } },
        select: { questionId: true },
      });
      const attemptedQuestionIds = new Set(previousAnswers.map((a) => a.questionId));

      // Prioritize unattempted (fresh) questions so questions don't repeat for the student
      const unattempted = availableQuestions.filter((q) => !attemptedQuestionIds.has(q.id));
      const attempted = availableQuestions.filter((q) => attemptedQuestionIds.has(q.id));

      const shuffledUnattempted = [...unattempted].sort(() => 0.5 - Math.random());
      const shuffledAttempted = [...attempted].sort(() => 0.5 - Math.random());

      // Candidate pool gives absolute priority to unattempted questions
      const candidatePool = [...shuffledUnattempted, ...shuffledAttempted];

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
    const examTitle =
      customTitle?.trim() ||
      `امتحان ${isPractice ? "تدريبي" : "مخصص"}: ${subject?.name || "عام"} (${selected.length} سؤال)`;

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

    return prisma.question.count({ where });
  }
}
