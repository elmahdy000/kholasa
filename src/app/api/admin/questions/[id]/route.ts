import { NextResponse } from "next/server";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { QuestionService } from "@/services/question.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
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
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const {
      statement,
      type,
      difficulty,
      unitId,
      lessonId,
      options,
      concept,
      correctReason,
      modelAnswer,
    } = body;

    if (!statement?.trim()) {
      return NextResponse.json({ error: "نص السؤال مطلوب" }, { status: 400 });
    }

    const updated = await QuestionService.updateQuestion(id, {
      statement: statement.trim(),
      type,
      difficulty,
      unitId,
      lessonIds: lessonId !== undefined ? (lessonId ? [lessonId] : []) : undefined,
      options: Array.isArray(options) ? options : undefined,
      explanation:
        concept && correctReason
          ? {
              concept: String(concept).trim(),
              correctReason: String(correctReason).trim(),
            }
          : undefined,
      rubric:
        modelAnswer !== undefined
          ? {
              modelAnswer: String(modelAnswer).trim(),
            }
          : undefined,
    });

    return NextResponse.json({
      success: true,
      question: updated,
    });
  } catch (error: any) {
    console.error("Failed to update question:", error);
    return NextResponse.json(
      { error: error?.message || "تعذر تحديث السؤال" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaff(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id } = await params;
    await QuestionService.deleteQuestion(id);

    return NextResponse.json({ success: true, message: "تم حذف السؤال بنجاح" });
  } catch (error: any) {
    console.error("Failed to delete question:", error);
    return NextResponse.json(
      { error: error?.message || "تعذر حذف السؤال" },
      { status: 500 }
    );
  }
}
