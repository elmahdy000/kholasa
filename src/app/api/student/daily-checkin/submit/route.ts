import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, parseJson } from "@/lib/http";
import { rateLimit, withRetryAfter } from "@/lib/rate-limit";
import { DailyCheckinService } from "@/services";

const answerSchema = z.object({
  questionId: z.string().min(1).max(64),
  selectedOptionId: z.string().min(1).max(64).nullable().optional(),
  essayText: z.string().max(5000).nullable().optional(),
});

const schema = z.object({
  answers: z.array(answerSchema).min(1).max(10),
  timeSpentSeconds: z.coerce.number().int().min(0).max(3600).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    rateLimit(`daily-checkin:${user.id}`, 10, 60 * 1000);

    const { answers, timeSpentSeconds = 60 } = await parseJson(req, schema);

    const result = await DailyCheckinService.submitDailyCheckin(
      user.id,
      answers,
      timeSpentSeconds || 60
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return withRetryAfter(jsonError(error), error);
  }
}
