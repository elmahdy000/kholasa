import { NextResponse } from "next/server";
import { z } from "zod";
import { OtpService } from "@/services/otp.service";
import { passwordSchema } from "@/lib/validation/auth";
import { jsonError, parseJson } from "@/lib/http";
import { getClientIp, rateLimit, withRetryAfter } from "@/lib/rate-limit";

const resetSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  resetToken: z.string().min(1).max(200),
  newPassword: passwordSchema,
});

export async function POST(req: Request) {
  try {
    rateLimit(`reset-password:ip:${getClientIp(req)}`, 10, 15 * 60 * 1000);
    const { identifier, resetToken, newPassword } = await parseJson(req, resetSchema);
    const result = await OtpService.resetPassword(identifier, resetToken, newPassword);
    return NextResponse.json(result);
  } catch (err) {
    return withRetryAfter(jsonError(err), err);
  }
}
