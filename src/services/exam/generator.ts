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
        select: { id: true, subjectId: true },
      });

      if (explicitQuestions.length === 0) {
        throw new Error("الأسئلة المحددة غير موجودة في بنك الأسئلة أو لا تنتمي لهذه الفئة المدرسية");
      }

      selected = explicitQuestions.map((q) => ({ id: q.id }));
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
        select: { id: true, type: true },
      });

      if (availableQuestions.length === 0) {
        throw new Error("لا توجد أسئلة كافية مطابقة لمعايير الامتحان المحددة في هذا المسار المدرسي");
      }

      // 3. Shuffle and pick requested count
      const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
      selected = shuffled.slice(0, Math.min(questionCount, availableQuestions.length));
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
