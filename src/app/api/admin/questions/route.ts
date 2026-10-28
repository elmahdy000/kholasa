import { NextResponse } from "next/server";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { QuestionType, Difficulty } from "@prisma/client";
import { QuestionService } from "@/services/question.service";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId") || undefined;
    const unitId = searchParams.get("unitId") || undefined;
    const lessonId = searchParams.get("lessonId") || undefined;
    const rawType = searchParams.get("type");
    const rawDifficulty = searchParams.get("difficulty");
    const type = rawType && rawType !== "all" ? (rawType as QuestionType) : undefined;
    const difficulty = rawDifficulty && rawDifficulty !== "all" ? (rawDifficulty as Difficulty) : undefined;
    const search = searchParams.get("search") || undefined;

    const { questions, pagination } = await QuestionService.getQuestions({
      subjectId: subjectId !== "all" ? subjectId : undefined,
      unitId: unitId !== "all" ? unitId : undefined,
      lessonId: lessonId !== "all" ? lessonId : undefined,
      type,
      difficulty,
      search,
      limit: 100,
    });

    return NextResponse.json({ questions, pagination });
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return NextResponse.json({ error: "تعذر جلب الأسئلة" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      statement,
      type = "MCQ",
      difficulty = "MEDIUM",
      subjectId,
      unitId,
      lessonId,
      imageUrl,
      options = [],
      concept,
      correctReason,
      modelAnswer,
    } = body;

    if (!statement || !subjectId) {
      return NextResponse.json(
        { error: "نص السؤال والمادة الدراسية مطلوبان" },
        { status: 400 }
      );
    }

    const question = await QuestionService.createQuestion({
      statement: statement.trim(),
      type,
      difficulty,
      subjectId,
      unitId: unitId || null,
      imageUrl: typeof imageUrl === "string" ? imageUrl.trim() || null : null,
      lessonIds: lessonId ? [lessonId] : [],
      options: Array.isArray(options) ? options : [],
      explanation:
        concept && correctReason
          ? {
              concept: String(concept).trim(),
              correctReason: String(correctReason).trim(),
            }
          : undefined,
      rubric:
        modelAnswer
          ? {
              modelAnswer: String(modelAnswer).trim(),
            }
          : undefined,
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Failed to create question:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر إضافة السؤال" },
      { status: 500 }
    );
  }
}
