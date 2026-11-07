import { NextResponse } from "next/server";
import { getCurrentUser, canManageExams } from "@/lib/auth";
import { ExamService } from "@/services";
import { jsonError } from "@/lib/http";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageExams(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId") || undefined;

    const formatted = await ExamService.getAdminExamsList(subjectId);
    return NextResponse.json({ exams: formatted });
  } catch (error) {
    console.error("Failed to fetch admin exams:", error);
    return NextResponse.json({ error: "تعذر تحميل قائمة الامتحانات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageExams(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      title,
      description,
      subjectId,
      durationMinutes = 30,
      isPractice = false,
      questionIds = [],
      unitId = null,
      lessonId = null,
      unitIds = [],
      lessonIds = [],
      startsAt = null,
      endsAt = null,
      isPublished = true,
      scopeDetails = null,
    } = body;

    const randomQuestionsCount =
      body.randomQuestionsCount !== undefined
        ? Number(body.randomQuestionsCount)
        : body.randomQuestionCount !== undefined
        ? Number(body.randomQuestionCount)
        : 0;

    if (typeof title !== "string" || !title.trim() || typeof subjectId !== "string" || !subjectId) {
      return NextResponse.json(
        { error: "يرجى تحديد عنوان الامتحان والمادة الدراسية" },
        { status: 400 }
      );
    }

    const exam = await ExamService.createOfficialExam({
      title,
      description,
      subjectId,
      durationMinutes,
      isPractice,
      questionIds,
      randomQuestionsCount,
      unitId: unitId || null,
      lessonId: lessonId || null,
      unitIds: Array.isArray(unitIds) ? unitIds : [],
      lessonIds: Array.isArray(lessonIds) ? lessonIds : [],
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      isPublished: isPublished !== false,
      scopeDetails: scopeDetails || null,
    });

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        isPractice: exam.isPractice,
        subject: exam.subject,
        questionsCount: exam.questions.length,
        attemptsCount: 0,
        avgPercentage: 0,
        createdAt: exam.createdAt,
        startsAt: exam.startsAt,
        endsAt: exam.endsAt,
        isPublished: exam.isPublished,
        scopeDetails: exam.scopeDetails,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
