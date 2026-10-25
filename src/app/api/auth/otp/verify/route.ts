import { NextResponse } from "next/server";
import { z } from "zod";
import { OtpService } from "@/services/otp.service";
import { otpTypeSchema } from "@/lib/validation/auth";
import { jsonError, parseJson } from "@/lib/http";
import { getClientIp, rateLimit, withRetryAfter } from "@/lib/rate-limit";

const verifySchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  token: z.string().trim().min(1).max(16),
  type: otpTypeSchema.default("PASSWORD_RESET"),
});

export async function POST(req: Request) {
  try {
    rateLimit(`otp-verify:ip:${getClientIp(req)}`, 10, 15 * 60 * 1000);
    const { identifier, token, type } = await parseJson(req, verifySchema);
    const result = await OtpService.verifyOtp(identifier, token, type);
    return NextResponse.json(result);
  } catch (err) {
    return withRetryAfter(jsonError(err), err);
  }
}
