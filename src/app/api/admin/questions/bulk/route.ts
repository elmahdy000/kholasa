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
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تقديم أي أسئلة صالحة للاستيراد" },
        { status: 400 }
      );
    }

    const importedCount = await QuestionService.bulkCreateQuestions(questions);

    return NextResponse.json({
      success: true,
      importedCount,
    });
  } catch (error) {
    console.error("Bulk import failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "حدث خطأ أثناء استيراد الأسئلة" },
      { status: 500 }
    );
  }
}
