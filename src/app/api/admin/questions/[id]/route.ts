import { NextResponse } from "next/server";
import { getCurrentUser, canManageQuestions } from "@/lib/auth";
import { QuestionService } from "@/services/question.service";
import { QuestionValidationError } from "@/services/question/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageQuestions(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const question = await QuestionService.getQuestionById(id);

    if (!question) {
      return NextResponse.json({ error: "السؤال غير موجود" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Failed to fetch question:", error);
    return NextResponse.json({ error: "تعذر تحميل بيانات السؤال" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageQuestions(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const {
      statement,
      type,
      difficulty,
      subjectId,
      unitId,
      lessonId,
      imageUrl,
      options,
      concept,
      correctReason,
      modelAnswer,
    } = body;

    if (typeof statement !== "string" || !statement.trim()) {
      return NextResponse.json({ error: "نص السؤال مطلوب" }, { status: 400 });
    }

    const updated = await QuestionService.updateQuestion(id, {
      statement: statement.trim(),
      type,
      difficulty,
      subjectId: typeof subjectId === "string" && subjectId ? subjectId : undefined,
      unitId: unitId === undefined ? undefined : unitId || null,
      imageUrl: imageUrl !== undefined ? (typeof imageUrl === "string" ? imageUrl.trim() || null : null) : undefined,
      lessonIds: lessonId !== undefined ? (lessonId ? [lessonId] : []) : undefined,
      options: Array.isArray(options) ? options : undefined,
      explanation:
        correctReason === undefined
          ? undefined
          : typeof correctReason === "string" && correctReason.trim()
            ? {
                concept: concept ? String(concept).trim() : "تفسير الإجابة",
                correctReason: correctReason.trim(),
              }
            : null,
      rubric:
        modelAnswer === undefined
          ? undefined
          : typeof modelAnswer === "string" && modelAnswer.trim()
            ? { modelAnswer: modelAnswer.trim() }
            : null,
    });

    return NextResponse.json({
      success: true,
      question: updated,
    });
  } catch (error) {
    if (error instanceof QuestionValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to update question:", error);
    return NextResponse.json({ error: "تعذر تحديث السؤال" }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageQuestions(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    await QuestionService.deleteQuestion(id);

    return NextResponse.json({ success: true, message: "تم حذف السؤال بنجاح" });
  } catch (error) {
    console.error("Failed to delete question:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر حذف السؤال" },
      { status: 500 }
    );
  }
}
