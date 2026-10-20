import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { DailyCheckinService } from "@/services";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const { answers, timeSpentSeconds = 60 } = body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "لم يتم تقديم إجابات للاختبار" },
        { status: 400 }
      );
    }

    const result = await DailyCheckinService.submitDailyCheckin(
      user?.id || null,
      answers,
      timeSpentSeconds
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Failed to submit daily checkin exam:", error);
    return NextResponse.json(
      { error: error?.message || "حدث خطأ أثناء تصحيح الاختبار" },
      { status: 500 }
    );
  }
}
