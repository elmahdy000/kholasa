import { NextResponse } from "next/server";
import { getCurrentUser, canManageQuestions } from "@/lib/auth";
import { QuestionService } from "@/services";
import { QuestionValidationError } from "@/services/question/validation";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageQuestions(user.role)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { questions, batchMeta } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تقديم أي أسئلة صالحة للاستيراد" },
        { status: 400 }
      );
    }

    const result = await QuestionService.bulkCreateQuestions(questions, batchMeta);

    return NextResponse.json({
      success: true,
      importedCount: result.count,
      skippedDuplicates: result.skippedDuplicates,
      batchId: result.batchId,
      linkedExisting: result.linkedExisting,
      enrichedExisting: result.enrichedExisting,
    });
  } catch (error) {
    if (error instanceof QuestionValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Bulk import failed:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء استيراد الأسئلة" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageQuestions(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تحديد أي أسئلة للحذف" },
        { status: 400 }
      );
    }

    const validIds = ids.filter((id: unknown) => typeof id === "string" && id.trim().length > 0);
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "معرفات الأسئلة غير صالحة" },
        { status: 400 }
      );
    }

    const result = await QuestionService.bulkDeleteQuestions(validIds);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Bulk delete questions failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "حدث خطأ أثناء حذف الأسئلة المحددة" },
      { status: 500 }
    );
  }
}
