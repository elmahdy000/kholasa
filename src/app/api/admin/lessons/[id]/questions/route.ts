import { NextResponse } from "next/server";
import { getCurrentUser, canManageQuestions } from "@/lib/auth";
import { QuestionService } from "@/services/question.service";
import { AnalyticsService } from "@/services/analytics.service";
import { QuestionType } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageQuestions(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id: lessonId } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as QuestionType | null;

    const result = await QuestionService.getQuestions({
      lessonId,
      type: type && Object.values(QuestionType).includes(type) ? type : undefined,
      limit: 1000,
    });

    return NextResponse.json({
      success: true,
      questions: result.questions,
      total: result.pagination.total,
    });
  } catch (error) {
    console.error("Failed to fetch lesson questions:", error);
    return NextResponse.json({ error: "تعذر تحميل أسئلة الدرس" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageQuestions(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id: lessonId } = await params;
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type");
    const isAll = searchParams.get("all") === "true";

    // Check if request body contains explicit question IDs
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      // Body may be empty for DELETE
    }

    if (body?.ids && Array.isArray(body.ids) && body.ids.length > 0) {
      const validIds = body.ids.filter((id: unknown) => typeof id === "string" && id.trim().length > 0);
      const res = await QuestionService.bulkDeleteQuestions(validIds);

      await AnalyticsService.logAuditAction(user.id, "DELETE", "question", lessonId, {
        lessonId,
        questionIds: validIds,
        deletedCount: res.count,
      });

      return NextResponse.json({
        success: true,
        message: `تم حذف ${res.count} سؤال بنجاح`,
        count: res.count,
      });
    }

    // Otherwise, delete by lesson filter (either all or specific type)
    let filterType: QuestionType | undefined = undefined;
    if (typeParam && Object.values(QuestionType).includes(typeParam as QuestionType)) {
      filterType = typeParam as QuestionType;
    }

    const result = await QuestionService.deleteLessonQuestions(lessonId, {
      type: filterType,
    });

    await AnalyticsService.logAuditAction(user.id, "DELETE", "lesson_questions", lessonId, {
      lessonId,
      filterType: filterType || "ALL",
      deletedCount: result.count,
    });

    return NextResponse.json({
      success: true,
      message: `تم حذف ${result.count} سؤال من قاعدة البيانات بنجاح`,
      count: result.count,
    });
  } catch (error) {
    console.error("Failed to delete lesson questions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر حذف أسئلة الدرس" },
      { status: 500 }
    );
  }
}
