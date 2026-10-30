import { NextResponse } from "next/server";
import { getCurrentUser, canManageQuestions } from "@/lib/auth";
import { QuestionService } from "@/services/question.service";
import {
  QuestionValidationError,
  isDifficulty,
  isQuestionType,
} from "@/services/question/validation";

const MAX_PAGE_SIZE = 100;

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageQuestions(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const clean = (key: string) => {
      const value = searchParams.get(key);
      return value && value !== "all" ? value : undefined;
    };

    const rawType = clean("type");
    const rawDifficulty = clean("difficulty");
    if (rawType && !isQuestionType(rawType)) {
      return NextResponse.json({ error: "نوع السؤال غير صالح" }, { status: 400 });
    }
    if (rawDifficulty && !isDifficulty(rawDifficulty)) {
      return NextResponse.json({ error: "مستوى الصعوبة غير صالح" }, { status: 400 });
    }

    const rawCategory = clean("schoolCategory");
    if (rawCategory && rawCategory !== "ARABIC" && rawCategory !== "LANGUAGES") {
      return NextResponse.json({ error: "الفئة التعليمية غير صالحة" }, { status: 400 });
    }

    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.parseInt(searchParams.get("limit") || String(MAX_PAGE_SIZE), 10) || MAX_PAGE_SIZE)
    );

    const { questions, pagination } = await QuestionService.getQuestions({
      subjectId: clean("subjectId"),
      gradeId: clean("gradeId"),
      schoolCategory: rawCategory as "ARABIC" | "LANGUAGES" | undefined,
      unitId: clean("unitId"),
      lessonId: clean("lessonId"),
      type: rawType && isQuestionType(rawType) ? rawType : undefined,
      difficulty: rawDifficulty && isDifficulty(rawDifficulty) ? rawDifficulty : undefined,
      search: searchParams.get("search") || undefined,
      page,
      limit,
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
    if (!user || !canManageQuestions(user.role)) {
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

    if (typeof statement !== "string" || !statement.trim() || typeof subjectId !== "string" || !subjectId) {
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
        typeof correctReason === "string" && correctReason.trim()
          ? {
              concept: concept ? String(concept).trim() : "تفسير الإجابة",
              correctReason: correctReason.trim(),
            }
          : undefined,
      rubric:
        typeof modelAnswer === "string" && modelAnswer.trim()
          ? {
              modelAnswer: modelAnswer.trim(),
            }
          : undefined,
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    if (error instanceof QuestionValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to create question:", error);
    return NextResponse.json({ error: "تعذر إضافة السؤال" }, { status: 500 });
  }
}
