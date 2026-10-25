import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope } from "@/lib/curriculum";
import { jsonError } from "@/lib/http";
import { DailyCheckinService } from "@/services";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const result = await DailyCheckinService.getDailyCheckinQuestions(
      user.id,
      getCurriculumScope(user)
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return jsonError(error);
  }
}
