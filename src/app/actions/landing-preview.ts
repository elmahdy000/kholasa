"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { pickDeterministicPreviewMcq } from "@/lib/landing-curriculum";
import { rateLimit } from "@/lib/rate-limit";

const checkAnswerSchema = z.object({
  lessonId: z.string().min(1).max(64),
  questionId: z.string().min(1).max(64),
  selectedOptionId: z.string().min(1).max(64),
});

export interface LandingAnswerCheckResult {
  ok: boolean;
  error?: string;
  isCorrect?: boolean;
  selectedOptionId?: string;
  correctOptionId?: string;
  correctOptionText?: string;
  explanation?: {
    concept: string | null;
    correctReason: string;
  } | null;
}

/**
 * Verifies a visitor's answer strictly for the single deterministic preview MCQ
 * of a published lesson. Protects the private answer bank from bulk enumeration.
 */
export async function verifyLandingPreviewAnswer(
  input: z.infer<typeof checkAnswerSchema>
): Promise<LandingAnswerCheckResult> {
  try {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-real-ip") ||
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";

    rateLimit(`landing:check:${ip}`, 60, 60 * 1000);

    const parsed = checkAnswerSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "بيانات السؤال غير صالحة" };
    }

    const { lessonId, questionId, selectedOptionId } = parsed.data;
    const previewMcq = await pickDeterministicPreviewMcq(lessonId);

    if (!previewMcq || previewMcq.id !== questionId) {
      return { ok: false, error: "السؤال المطلوب غير متاح للمعاينة" };
    }

    const chosenOption = previewMcq.options.find((o) => o.id === selectedOptionId);
    const correctOption = previewMcq.options.find((o) => o.isCorrect);

    if (!chosenOption || !correctOption) {
      return { ok: false, error: "الاختيار المحدد غير موجود" };
    }

    return {
      ok: true,
      isCorrect: chosenOption.isCorrect,
      selectedOptionId: chosenOption.id,
      correctOptionId: correctOption.id,
      correctOptionText: correctOption.text,
      explanation: previewMcq.explanation
        ? {
            concept: previewMcq.explanation.concept,
            correctReason: previewMcq.explanation.correctReason,
          }
        : null,
    };
  } catch {
    return { ok: false, error: "تعذر التحقق من الإجابة حالياً، حاول مرة أخرى" };
  }
}

