import { NextResponse } from "next/server";
import { getCurrentUser, canManageCurriculum } from "@/lib/auth";
import { QuestionService } from "@/services";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageCurriculum(user.role)) {
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
      importedCount: typeof result === "number" ? result : result.count,
      batchId: typeof result === "object" ? result.batchId : undefined,
    });
  } catch (error) {
    console.error("Bulk import failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "حدث خطأ أثناء استيراد الأسئلة" },
      { status: 500 }
    );
  }
}
