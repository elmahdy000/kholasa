import { NextResponse } from "next/server";
import { getCurrentUser, canManageQuestions } from "@/lib/auth";
import { QuestionService } from "@/services/question.service";
import { AnalyticsService } from "@/services/analytics.service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageQuestions(user.role)) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const result = await QuestionService.cleanupOrphanedQuestions();

    await AnalyticsService.logAuditAction(user.id, "DELETE", "question", "orphaned_cleanup", {
      deletedCount: result.count,
    });

    return NextResponse.json({
      success: true,
      message: `تم تنظيف وحذف ${result.count} سؤال غير مرتبط بأي درس من قاعدة البيانات بنجاح`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Failed to clean up orphaned questions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر تنظيف الأسئلة غير المرتبطة" },
      { status: 500 }
    );
  }
}
