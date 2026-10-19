import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { DailyCheckinService } from "@/services";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const result = await DailyCheckinService.getDailyCheckinQuestions(user?.gradeId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Failed to generate daily checkin exam:", error);
    return NextResponse.json(
      { error: "تعذر توليد اختبار الدخول اليومي" },
      { status: 500 }
    );
  }
}
